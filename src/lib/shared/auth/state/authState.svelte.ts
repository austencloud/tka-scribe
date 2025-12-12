/**
 * AuthState - Core authentication state management using Svelte 5 runes
 * 
 * This module manages the global authentication state and orchestrates auth operations
 * using injected services from the DI container. It does NOT use Svelte 4 stores (writables).
 * 
 * Responsibilities:
 * - Reactive auth state ($state rune)
 * - Firebase onAuthStateChanged listener
 * - Role & permission resolution
 * - Sign out orchestration
 * - Email/display name updates
 * 
 * Extracted responsibilities (now services):
 * - Profile picture management → IProfilePictureService
 * - User document CRUD → IUserDocumentService  
 * - Admin impersonation → IImpersonationService
 */

import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateEmail,
  updateProfile,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  type User,
} from "firebase/auth";
import { TYPES } from "../../inversify/types";
import { tryResolve } from "../../inversify/di";

// Service imports
import type { IProfilePictureService } from "../services/contracts/IProfilePictureService";
import type { IUserDocumentService } from "../services/contracts/IUserDocumentService";
import type { IImpersonationService } from "../services/contracts/IImpersonationService";
import { auth } from "../firebase";
import type { IActivityLogService } from "../../analytics/services/contracts/IActivityLogService";
import { featureFlagService } from "../services/FeatureFlagService.svelte";
import type { UserRole } from "../domain/models/UserRole";

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAdmin: boolean;
  role: UserRole;
}

// Reactive state using Svelte 5 $state rune
let _state = $state<AuthState>({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: false,
  role: "user",
});

// Auth listener cleanup
let cleanupAuthListener: (() => void) | null = null;

/**
 * Get the effective user ID (impersonated or actual)
 */
export function getEffectiveUserId(): string | null {
  const impersonationService = tryResolve<IImpersonationService>(TYPES.IImpersonationService);
  if (impersonationService?.isImpersonating()) {
    return impersonationService.getImpersonatedUser()?.uid ?? null;
  }
  return _state.user?.uid ?? null;
}

/**
 * Get the effective user role (impersonated or actual)
 */
export function getEffectiveRole(): UserRole {
  const impersonationService = tryResolve<IImpersonationService>(TYPES.IImpersonationService);
  if (impersonationService?.isImpersonating()) {
    return impersonationService.getImpersonatedUser()?.role ?? "user";
  }
  return _state.role;
}

/**
 * Check if the effective user is an admin
 */
export function isEffectiveAdmin(): boolean {
  const impersonationService = tryResolve<IImpersonationService>(TYPES.IImpersonationService);
  if (impersonationService?.isImpersonating()) {
    return impersonationService.getImpersonatedUser()?.role === "admin";
  }
  return _state.isAdmin;
}

/**
 * Get the user state (non-reactive snapshot)
 */
export function getUserState(): Readonly<AuthState> {
  return { ..._state };
}

/**
 * Reactive getter for user
 */
export function getUser(): User | null {
  return _state.user;
}

/**
 * Reactive getter for loading state
 */
export function isLoading(): boolean {
  return _state.loading;
}

/**
 * Reactive getter for initialized state
 */
export function isInitialized(): boolean {
  return _state.initialized;
}

/**
 * Reactive getter for admin status (actual user, not impersonated)
 */
export function isAdmin(): boolean {
  return _state.isAdmin;
}

/**
 * Reactive getter for role (actual user, not impersonated)
 */
export function getRole(): UserRole {
  return _state.role;
}

/**
 * Initialize the auth state listener
 * Sets up Firebase onAuthStateChanged and orchestrates auth flows
 */
export function initializeAuthListener() {
  if (cleanupAuthListener) {
    console.warn("⚠️ [authState] Auth listener already initialized");
    return;
  }

  cleanupAuthListener = onAuthStateChanged(
    auth,
    async (user) => {
      _state.loading = true;

      let isAdmin = false;
      let role: UserRole = "user";

      if (user) {
        try {
          // Get user claims to determine role
          const idTokenResult = await user.getIdTokenResult(true);
          isAdmin = idTokenResult.claims.admin === true;
          role = idTokenResult.claims.role as UserRole || "user";

          // Create or update user document in Firestore
          const userDocumentService = tryResolve<IUserDocumentService>(TYPES.IUserDocumentService);
          if (userDocumentService) {
            try {
              await userDocumentService.createOrUpdateUserDocument(user);
            } catch (error) {
              console.error("❌ [authState] Failed to update user document:", error);
            }
          }

          // Update profile pictures from OAuth providers (non-blocking)
          const profilePictureService = tryResolve<IProfilePictureService>(TYPES.IProfilePictureService);
          if (profilePictureService) {
            try {
              void profilePictureService.updateFacebookProfilePictureIfNeeded(user);
              void profilePictureService.updateGoogleProfilePictureIfNeeded(user);
            } catch (error) {
              console.warn("⚠️ [authState] Failed to update profile pictures:", error);
            }
          }

          // Initialize feature flags for this user
          try {
            await featureFlagService.initialize(user.uid);
          } catch (_error) {
            console.warn("⚠️ [authState] Failed to initialize feature flags:", _error);
          }
        } catch (_error) {
          console.warn("⚠️ [authState] Auth processing error:", _error);
        }
      } else {
        // Initialize feature flags without user
        try {
          await featureFlagService.initialize(null);
        } catch (_error) {
          console.warn("⚠️ [authState] Failed to initialize feature flags:", _error);
        }
      }

      _state = {
        user,
        loading: false,
        initialized: true,
        isAdmin,
        role,
      };

      // Log session start for analytics (non-blocking)
      if (user) {
        try {
          const activityService = tryResolve<IActivityLogService>(TYPES.IActivityLogService);
          if (activityService) {
            void activityService.logSessionStart();
          }
        } catch {
          // Silently fail - activity logging is non-critical
        }

        // Initialize settings Firebase sync (non-blocking)
        try {
          void import("../../settings/state/SettingsState.svelte").then(
            (settingsModule) => {
              void settingsModule.settingsService.initializeFirebaseSync();
            }
          );
        } catch {
          // Silently fail - settings sync is non-critical
        }

        // Initialize system collections (Favorites, etc.) - non-blocking
        try {
          void import("../../inversify/di").then(async ({ loadFeatureModule, tryResolve }) => {
            await loadFeatureModule("library");
            const collectionService = tryResolve<{ ensureSystemCollections?: () => Promise<void> }>(TYPES.ICollectionService);
            if (collectionService?.ensureSystemCollections) {
              void collectionService.ensureSystemCollections();
            }
          });
        } catch {
          // Silently fail - system collections init is non-critical
        }
      }

      // Revalidate current module after auth state changes
      if (typeof window !== "undefined") {
        try {
          void import("../../application/state/ui/module-state").then(
            (moduleState) => {
              void moduleState.revalidateCurrentModule();
            }
          );
        } catch {
          // Ignore - module state may not be available yet
        }
      }
    },
    (_error) => {
      console.error("❌ [authState] Auth state change error:", _error);
      _state = {
        user: null,
        loading: false,
        initialized: true,
        isAdmin: false,
        role: "user",
      };
    }
  );
}

/**
 * Sign out the current user
 * Clears all sensitive data from client-side storage
 */
export async function signOut() {
  try {
    // Clear any auth-related localStorage items
    const keysToRemove = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("tka_") ||
        key.includes("auth") ||
        key.includes("session")
    );
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    // Clear sessionStorage entirely
    sessionStorage.clear();

    // Clear sensitive form state (dynamic import to avoid circular deps)
    try {
      const { resetPasswordForm, resetEmailChangeForm, resetUIState } =
        await import("../../navigation/state/profile-settings-state.svelte");
      resetPasswordForm();
      resetEmailChangeForm();
      resetUIState();
    } catch {
      // Profile settings may not be loaded - that's ok
    }

    // Sign out from Firebase
    await firebaseSignOut(auth);
    // State will be updated automatically by onAuthStateChanged
  } catch (_error) {
    console.error("❌ [authState] Sign out error:", _error);
    throw _error;
  }
}

/**
 * Change user email (requires re-authentication)
 * @param newEmail - The new email address
 * @param currentPassword - Current password for re-authentication
 */
export async function changeEmail(newEmail: string, currentPassword: string) {
  const user = _state.user;
  if (!user?.email) {
    throw new Error("No authenticated user");
  }

  try {
    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    await reauthenticateWithCredential(user, credential);

    // Update email
    await updateEmail(user, newEmail);

    // Send verification email to new address
    await sendEmailVerification(user);

    return {
      success: true,
      message:
        "Email updated successfully. Please check your inbox to verify your new email address.",
    };
  } catch (error: unknown) {
    console.error("❌ [authState] Email change error:", error);

    // Handle specific Firebase errors
    if (error instanceof Error && 'code' in error) {
      const firebaseError = error as { code: string; message: string };
      if (firebaseError.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (firebaseError.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use by another account.");
      } else if (firebaseError.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.");
      } else if (firebaseError.code === "auth/requires-recent-login") {
        throw new Error(
          "Please sign out and sign in again before changing your email."
        );
      } else {
        throw new Error(
          firebaseError.message || "Failed to change email. Please try again."
        );
      }
    } else {
      const message = error instanceof Error ? error.message : "Failed to change email. Please try again.";
      throw new Error(message);
    }
  }
}

/**
 * Update user's display name
 * @param displayName - The new display name
 */
export async function updateDisplayName(displayName: string) {
  const user = _state.user;
  if (!user) {
    throw new Error("No authenticated user");
  }

  try {
    await updateProfile(user, {
      displayName: displayName.trim() || null,
    });

    return {
      success: true,
      message: "Display name updated successfully.",
    };
  } catch (error: unknown) {
    console.error("❌ [authState] Display name update error:", error);
    const message = error instanceof Error ? error.message : "Failed to update display name. Please try again.";
    throw new Error(message);
  }
}

/**
 * Clean up the auth listener
 * Call this when your app unmounts (if ever)
 */
export function cleanup() {
  if (cleanupAuthListener) {
    cleanupAuthListener();
    cleanupAuthListener = null;
  }
}

/**
 * Default export with all methods (for backward compatibility during migration)
 */
export const authState = {
  // Direct state access (for Svelte 5 reactivity)
  get user() { return _state.user; },
  get loading() { return _state.loading; },
  get initialized() { return _state.initialized; },
  get isAdmin() { return _state.isAdmin; },
  get role() { return _state.role; },
  get isAuthenticated() { return _state.user !== null; },
  
  // Effective user helpers (as properties)
  get effectiveUserId() { return getEffectiveUserId(); },
  get effectiveRole() { return getEffectiveRole(); },
  get isEffectiveAdmin() { return isEffectiveAdmin(); },
  
  // Function-style getters (for explicit calls)
  getUserState,
  getUser,
  isLoading,
  isInitialized,
  getRole,
  getEffectiveUserId,
  getEffectiveRole,
  
  // Auth operations
  initialize: initializeAuthListener, // Alias for backward compatibility
  initializeAuthListener,
  signOut,
  changeEmail,
  updateDisplayName,
  cleanup,
};
