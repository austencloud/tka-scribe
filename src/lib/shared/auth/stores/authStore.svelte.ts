/**
 * Authentication Store (Svelte 5 Runes)
 *
 * Manages authentication state across the application using Firebase Auth.
 * Provides reactive user data and auth status using Svelte 5 runes.
 */

import {
  onAuthStateChanged,
  signOut as firebaseSignOut,
  updateProfile,
  updateEmail,
  sendEmailVerification,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "../firebase";
import { featureFlagService } from "../services/FeatureFlagService.svelte";
import type { UserRole } from "../domain/models/UserRole";
import { tryResolve } from "../../inversify";
import { TYPES } from "../../inversify/types";
import type { IActivityLogService } from "../../analytics";

/**
 * Update Facebook profile picture to high resolution
 * Facebook Graph API provides higher resolution pictures than the default Firebase photoURL
 */
async function updateFacebookProfilePictureIfNeeded(user: User) {
  try {
    // Check if user has Facebook provider
    const facebookData = user.providerData.find(
      (data) => data.providerId === "facebook.com"
    );

    if (!facebookData?.uid) {
      return; // Not a Facebook user
    }

    // Check if we need to update the profile picture
    // If photoURL doesn't contain graph.facebook.com, it's the low-res default
    if (user.photoURL && user.photoURL.includes("graph.facebook.com")) {
      return; // Already using high-res picture
    }

    // Facebook Graph API URL for high-resolution profile picture
    const photoURL = `https://graph.facebook.com/${facebookData.uid}/picture?type=large`;

    // Update the user's profile with the high-res photo URL
    await updateProfile(user, {
      photoURL: photoURL,
    });
  } catch (err) {
    console.error(
      `❌ [authStore] Failed to update Facebook profile picture:`,
      err
    );
    // Don't throw - this is a non-critical enhancement
  }
}

/**
 * Get fresh Google profile picture URL
 *
 * Google profile pictures from Firebase Auth contain signed tokens that can expire.
 * Instead of modifying the URL (which can break the signature), we use the
 * provider's photoURL directly which is refreshed on each authentication.
 *
 * Note: We no longer modify the URL size parameter (s96-c -> s400-c) because
 * this was causing stale/broken image URLs. The default 96px image is used
 * and CSS handles scaling.
 */
async function updateGoogleProfilePictureIfNeeded(user: User) {
  try {
    // Check if user has Google provider
    const googleData = user.providerData.find(
      (data) => data.providerId === "google.com"
    );

    if (!googleData?.uid) {
      return; // Not a Google user
    }

    // If the user doesn't have a photoURL but their Google provider does,
    // update the profile with the fresh Google photo URL
    if (!user.photoURL && googleData.photoURL) {
      await updateProfile(user, {
        photoURL: googleData.photoURL,
      });
      return;
    }

    // If the current photoURL is stale or different from the provider's,
    // update it with the fresh URL from the provider
    if (googleData.photoURL && user.photoURL !== googleData.photoURL) {
      // The providerData photoURL is always fresh from the OAuth token
      await updateProfile(user, {
        photoURL: googleData.photoURL,
      });
    }
  } catch (err) {
    console.error(
      `❌ [authStore] Failed to update Google profile picture:`,
      err
    );
    // Don't throw - this is a non-critical enhancement
  }
}

/**
 * Get provider-specific IDs for storing in user document
 * These can be used to construct reliable profile picture URLs
 */
function getProviderIds(user: User): { googleId?: string; facebookId?: string } {
  const result: { googleId?: string; facebookId?: string } = {};

  for (const provider of user.providerData) {
    if (provider.providerId === "google.com" && provider.uid) {
      result.googleId = provider.uid;
    } else if (provider.providerId === "facebook.com" && provider.uid) {
      result.facebookId = provider.uid;
    }
  }

  return result;
}

/**
 * Create or update user document in Firestore
 * This ensures every authenticated user has a corresponding Firestore document
 * that can be displayed in the users explore panel
 */
async function createOrUpdateUserDocument(user: User) {
  try {
    const userDocRef = doc(firestore, `users/${user.uid}`);
    const userDoc = await getDoc(userDocRef);

    // Determine display name and username
    const displayName =
      user.displayName || user.email?.split("@")[0] || "Anonymous User";
    const username = user.email?.split("@")[0] || user.uid.substring(0, 8);

    // Get provider IDs for reliable profile picture URLs
    const providerIds = getProviderIds(user);

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(userDocRef, {
        email: user.email,
        displayName,
        username,
        photoURL: user.photoURL || null,
        avatar: user.photoURL || null,
        // Store provider IDs for reliable profile picture construction
        googleId: providerIds.googleId || null,
        facebookId: providerIds.facebookId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActivityDate: serverTimestamp(), // Track activity for analytics
        // Initialize counts
        sequenceCount: 0,
        collectionCount: 0,
        followerCount: 0,
        // Initialize gamification fields (denormalized for leaderboards)
        totalXP: 0,
        currentLevel: 1,
        achievementCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        // Admin status (default false)
        isAdmin: false,
      });
    } else {
      // Update existing user document with latest auth data
      // Always update provider IDs and photoURL to keep them fresh
      await setDoc(
        userDocRef,
        {
          email: user.email,
          displayName,
          username,
          photoURL: user.photoURL || null,
          avatar: user.photoURL || null,
          // Always update provider IDs (they don't change but ensures they exist)
          googleId: providerIds.googleId || null,
          facebookId: providerIds.facebookId || null,
          updatedAt: serverTimestamp(),
          lastActivityDate: serverTimestamp(), // Track activity for analytics
        },
        { merge: true } // Merge to preserve existing fields like counts
      );
    }
  } catch (error) {
    console.error(
      `❌ [authStore] Failed to create/update user document:`,
      error
    );
    // Don't throw - this shouldn't block authentication
  }
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  /** @deprecated Use featureFlagService.isAdmin instead */
  isAdmin: boolean;
  /** User's role in the system */
  role: UserRole;
}

/**
 * Impersonation state for admin "View As" feature
 */
interface ImpersonatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

// ============================================================================
// REACTIVE STATE (Svelte 5 Runes - Module Pattern)
// ============================================================================

// 🚧 TEMPORARY DEBUG FLAG - Remove before production!
// Set this to true to bypass Firebase admin check for testing
const FORCE_ADMIN_MODE = false;

// Internal reactive state
let _state = $state<AuthState>({
  user: null,
  loading: true,
  initialized: false,
  isAdmin: FORCE_ADMIN_MODE, // Start with forced admin if debugging
  role: FORCE_ADMIN_MODE ? "admin" : "user",
});

// Impersonation state (admin-only "View As" feature)
let _impersonatedUser = $state<ImpersonatedUser | null>(null);

// Cleanup function reference
let cleanupAuthListener: (() => void) | null = null;

// ============================================================================
// PUBLIC API - Reactive Getters
// ============================================================================

/**
 * Authentication store object with reactive getters
 */
export const authStore = {
  /**
   * Current authenticated user (or null)
   */
  get user() {
    return _state.user;
  },

  /**
   * Whether a user is currently authenticated
   */
  get isAuthenticated() {
    return !!_state.user;
  },

  /**
   * Whether auth state is currently loading
   */
  get isLoading() {
    return _state.loading;
  },

  /**
   * Whether auth has been initialized
   */
  get isInitialized() {
    return _state.initialized;
  },

  /**
   * Whether the ACTUAL current user is an admin (ignores impersonation)
   * Use this to check if impersonation features should be available
   */
  get isActualAdmin() {
    return _state["isAdmin"];
  },

  /**
   * Whether the current user is an admin
   * Returns impersonated user's admin status when impersonating
   * @deprecated Use featureFlagService.isAdmin for feature access checks
   */
  get isAdmin() {
    if (_impersonatedUser) {
      return _impersonatedUser.role === "admin";
    }
    return _state["isAdmin"];
  },

  /**
   * Current user's role (or impersonated role)
   */
  get role(): UserRole {
    if (_impersonatedUser) {
      return _impersonatedUser.role;
    }
    return _state.role;
  },

  /**
   * The actual logged-in user's role (ignores impersonation)
   */
  get actualRole(): UserRole {
    return _state.role;
  },

  /**
   * Check if user is at least tester level
   */
  get isTester(): boolean {
    const role = _impersonatedUser ? _impersonatedUser.role : _state.role;
    return role === "tester" || role === "admin";
  },

  /**
   * Check if user is at least premium level
   */
  get isPremium(): boolean {
    const role = _impersonatedUser ? _impersonatedUser.role : _state.role;
    return role === "premium" || role === "tester" || role === "admin";
  },

  // ============================================================================
  // Impersonation State
  // ============================================================================

  /**
   * Whether currently impersonating another user
   */
  get isImpersonating(): boolean {
    return _impersonatedUser !== null;
  },

  /**
   * The impersonated user's info (or null if not impersonating)
   */
  get impersonatedUser(): ImpersonatedUser | null {
    return _impersonatedUser;
  },

  /**
   * The effective user ID (impersonated or actual)
   */
  get effectiveUserId(): string | null {
    if (_impersonatedUser) {
      return _impersonatedUser.uid;
    }
    return _state.user?.uid ?? null;
  },

  // ============================================================================
  // Methods
  // ============================================================================

  /**
   * Initialize the auth listener
   * Call this once when your app starts
   */
  async initialize() {
    if (cleanupAuthListener) {
      return; // Already initialized
    }

    // Check for old cached data
    if (typeof window !== "undefined" && window.indexedDB.databases) {
      try {
        const databases = await window.indexedDB.databases?.();
        const firebaseDbs = databases.filter(
          (db) =>
            db.name &&
            (db.name.includes("firebase") || db.name.includes("firestore"))
        );

        // CRITICAL: Check for old project
        const oldProjectDb = firebaseDbs.find((db) =>
          db.name?.includes("the-kinetic-constructor")
        );

        if (oldProjectDb) {
          console.error(
            "🚨 [authStore] OLD PROJECT DATABASE DETECTED:",
            oldProjectDb.name
          );
          console.error("🚨 This WILL cause auth failures!");
          console.error("🚨 Press Ctrl+Shift+Delete to clear cache");
        }
      } catch (error) {
        console.warn("⚠️ [authStore] Could not check IndexedDB:", error);
      }
    }

    cleanupAuthListener = onAuthStateChanged(
      auth,
      async (user) => {
        let isAdmin = false;
        let role: UserRole = "user";

        if (user) {
          // Create or update user document in Firestore
          // This MUST happen before checking admin/role status
          await createOrUpdateUserDocument(user);

          // Update Facebook profile picture if needed (async, non-blocking)
          void updateFacebookProfilePictureIfNeeded(user);

          // Update Google profile picture if needed (async, non-blocking)
          void updateGoogleProfilePictureIfNeeded(user);

          // Check user role and admin status
          try {
            // 🚧 FORCE ADMIN MODE FOR DEBUGGING
            if (FORCE_ADMIN_MODE) {
              isAdmin = true;
              role = "admin";
            } else {
              const userDocRef = doc(firestore, `users/${user.uid}`);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                const userData = userDoc.data();
                // Check for new role field first
                if (userData["role"]) {
                  role = userData["role"] as UserRole;
                  isAdmin = role === "admin";
                } else {
                  // Backwards compatibility: use isAdmin boolean
                  isAdmin = userData["isAdmin"] === true;
                  role = isAdmin ? "admin" : "user";
                }
              }
            }
          } catch (error) {
            console.warn("⚠️ [authStore] Could not check role status:", error);
            // If forced admin mode, still set as admin even on error
            if (FORCE_ADMIN_MODE) {
              isAdmin = true;
              role = "admin";
            }
          }

          // Initialize feature flag service with user context
          try {
            await featureFlagService.initialize(user.uid);
          } catch (error) {
            console.warn("⚠️ [authStore] Failed to initialize feature flags:", error);
          }
        } else {
          // 🚧 Keep admin mode if forced (for debugging without login)
          if (FORCE_ADMIN_MODE) {
            isAdmin = true;
            role = "admin";
          }

          // Initialize feature flag service without user
          try {
            await featureFlagService.initialize(null);
          } catch (error) {
            console.warn("⚠️ [authStore] Failed to initialize feature flags:", error);
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
        }

        // Revalidate current module after auth state changes
        // This allows admin module to be restored if user is admin
        if (typeof window !== "undefined") {
          try {
            // Dynamic import to avoid circular dependency
            void import("../../application/state/ui/module-state").then(
              (moduleState) => {
                void moduleState.revalidateCurrentModule();
              }
            );
          } catch (error) {
            // Ignore - module state may not be available yet
          }
        }
      },
      (error) => {
        console.error("❌ [authStore] Auth state change error:", error);
        _state = {
          user: null,
          loading: false,
          initialized: true,
          isAdmin: false,
          role: "user",
        };
      }
    );
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      await firebaseSignOut(auth);
      // State will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error("❌ [authStore] Sign out error:", error);
      throw error;
    }
  },

  /**
   * Change user email (requires re-authentication)
   * @param newEmail - The new email address
   * @param currentPassword - Current password for re-authentication
   */
  async changeEmail(newEmail: string, currentPassword: string) {
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
    } catch (error: any) {
      console.error("❌ [authStore] Email change error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/wrong-password") {
        throw new Error("Incorrect password. Please try again.");
      } else if (error.code === "auth/email-already-in-use") {
        throw new Error("This email is already in use by another account.");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Invalid email address format.");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Please sign out and sign in again before changing your email."
        );
      } else {
        throw new Error(
          error.message || "Failed to change email. Please try again."
        );
      }
    }
  },

  /**
   * Update user's display name
   * @param displayName - The new display name
   */
  async updateDisplayName(displayName: string) {
    const user = _state.user;
    if (!user) {
      throw new Error("No authenticated user");
    }

    try {
      // Update display name
      await updateProfile(user, {
        displayName: displayName.trim() || null,
      });

      return {
        success: true,
        message: "Display name updated successfully.",
      };
    } catch (error: any) {
      console.error("❌ [authStore] Display name update error:", error);
      throw new Error(
        error.message || "Failed to update display name. Please try again."
      );
    }
  },

  /**
   * Clean up the auth listener
   * Call this when your app unmounts (if ever)
   */
  cleanup() {
    if (cleanupAuthListener) {
      cleanupAuthListener();
      cleanupAuthListener = null;
    }
  },
};
