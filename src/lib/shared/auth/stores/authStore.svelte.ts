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
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase";

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
      console.log(`ℹ️ [authStore] Facebook profile picture already high-res`);
      return; // Already using high-res picture
    }

    console.log(`🖼️ [authStore] Updating Facebook profile picture to high-res...`);

    // Facebook Graph API URL for high-resolution profile picture
    const photoURL = `https://graph.facebook.com/${facebookData.uid}/picture?type=large`;

    // Update the user's profile with the high-res photo URL
    await updateProfile(user, {
      photoURL: photoURL,
    });

    console.log(`✅ [authStore] Facebook profile picture updated successfully`);
  } catch (err) {
    console.error(`❌ [authStore] Failed to update Facebook profile picture:`, err);
    // Don't throw - this is a non-critical enhancement
  }
}

/**
 * Update Google profile picture to high resolution
 * Google profile pictures from Firebase Auth default to s96-c (96x96 pixels)
 * We can get higher resolution by replacing s96-c with s400-c or s512-c
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

    // Check if we need to update the profile picture
    if (!user.photoURL || !user.photoURL.includes("googleusercontent.com")) {
      return; // Not a Google profile picture
    }

    // Check if it's already high-res (doesn't contain s96-c)
    if (!user.photoURL.includes("s96-c")) {
      console.log(`ℹ️ [authStore] Google profile picture already high-res`);
      return; // Already using high-res picture
    }

    console.log(`🖼️ [authStore] Updating Google profile picture to high-res...`);
    console.log(`🖼️ [authStore] Original URL: ${user.photoURL}`);

    // Replace s96-c with s400-c for 400x400 resolution
    // You can also use s512-c for 512x512 or higher values
    const highResPhotoURL = user.photoURL.replace("s96-c", "s400-c");

    console.log(`🖼️ [authStore] High-res URL: ${highResPhotoURL}`);

    // Update the user's profile with the high-res photo URL
    await updateProfile(user, {
      photoURL: highResPhotoURL,
    });

    console.log(`✅ [authStore] Google profile picture updated successfully`);
  } catch (err) {
    console.error(`❌ [authStore] Failed to update Google profile picture:`, err);
    // Don't throw - this is a non-critical enhancement
  }
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAdmin: boolean;
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
});

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
   * Whether the current user is an admin
   */
  get isAdmin() {
    return _state.isAdmin;
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
      console.log("🔐 [authStore] Already initialized, skipping");
      return; // Already initialized
    }

    console.log("🔐 [authStore] Initializing auth state listener...");
    console.log("🔐 [authStore] Current URL:", typeof window !== "undefined" ? window.location.href : "SSR");

    // CRITICAL: Log which Firebase project we're using
    console.log("🔥 [authStore] Firebase Config:", {
      projectId: auth.app.options.projectId,
      authDomain: auth.app.options.authDomain,
      apiKey: auth.app.options.apiKey?.substring(0, 20) + '...',
    });

    // Check for old cached data
    if (typeof window !== "undefined") {
      try {
        const databases = await window.indexedDB.databases();
        const firebaseDbs = databases.filter(db =>
          db.name && (db.name.includes('firebase') || db.name.includes('firestore'))
        );

        console.log("📦 [authStore] Firebase IndexedDB databases:", firebaseDbs.map(db => db.name));

        // CRITICAL: Check for old project
        const oldProjectDb = firebaseDbs.find(db =>
          db.name?.includes('the-kinetic-constructor')
        );

        if (oldProjectDb) {
          console.error("🚨 [authStore] OLD PROJECT DATABASE DETECTED:", oldProjectDb.name);
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

        if (user) {
          console.log("✅ [authStore] User authenticated:", {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            providerId: user.providerData?.[0]?.providerId,
          });

          // Update Facebook profile picture if needed (async, non-blocking)
          updateFacebookProfilePictureIfNeeded(user);

          // Update Google profile picture if needed (async, non-blocking)
          updateGoogleProfilePictureIfNeeded(user);

          // Check if user is admin
          try {
            // 🚧 FORCE ADMIN MODE FOR DEBUGGING
            if (FORCE_ADMIN_MODE) {
              isAdmin = true;
              console.log("🚧 [authStore] FORCE_ADMIN_MODE enabled - user is admin");
            } else {
              const userDocRef = doc(firestore, `users/${user.uid}`);
              const userDoc = await getDoc(userDocRef);
              if (userDoc.exists()) {
                isAdmin = userDoc.data()?.isAdmin === true;
                if (isAdmin) {
                  console.log("👑 [authStore] Admin user detected");
                }
              }
            }
          } catch (error) {
            console.warn("⚠️ [authStore] Could not check admin status:", error);
            // If forced admin mode, still set as admin even on error
            if (FORCE_ADMIN_MODE) {
              isAdmin = true;
            }
          }
        } else {
          console.log("ℹ️ [authStore] User signed out");
          // 🚧 Keep admin mode if forced (for debugging without login)
          if (FORCE_ADMIN_MODE) {
            isAdmin = true;
            console.log("🚧 [authStore] FORCE_ADMIN_MODE enabled - keeping admin even when signed out");
          }
        }

        _state = {
          user,
          loading: false,
          initialized: true,
          isAdmin,
        };

        // Revalidate current module after auth state changes
        // This allows admin module to be restored if user is admin
        if (typeof window !== "undefined") {
          try {
            // Dynamic import to avoid circular dependency
            import("../../application/state/ui/module-state").then(
              (moduleState) => {
                moduleState.revalidateCurrentModule();
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
        };
      }
    );

    console.log("🔐 [authStore] Auth state listener initialized");
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    try {
      await firebaseSignOut(auth);
      // State will be updated automatically by onAuthStateChanged
    } catch (error) {
      console.error("Sign out error:", error);
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
    if (!user || !user.email) {
      throw new Error("No authenticated user");
    }

    try {
      console.log("🔐 [authStore] Re-authenticating user for email change...");

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      console.log("✅ [authStore] Re-authentication successful");
      console.log("📧 [authStore] Updating email to:", newEmail);

      // Update email
      await updateEmail(user, newEmail);

      console.log("✅ [authStore] Email updated successfully");
      console.log("📨 [authStore] Sending verification email...");

      // Send verification email to new address
      await sendEmailVerification(user);

      console.log("✅ [authStore] Verification email sent to:", newEmail);

      return {
        success: true,
        message: "Email updated successfully. Please check your inbox to verify your new email address.",
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
        throw new Error("Please sign out and sign in again before changing your email.");
      } else {
        throw new Error(error.message || "Failed to change email. Please try again.");
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
      console.log("👤 [authStore] Updating display name to:", displayName);

      // Update display name
      await updateProfile(user, {
        displayName: displayName.trim() || null,
      });

      console.log("✅ [authStore] Display name updated successfully");

      return {
        success: true,
        message: "Display name updated successfully.",
      };
    } catch (error: any) {
      console.error("❌ [authStore] Display name update error:", error);
      throw new Error(error.message || "Failed to update display name. Please try again.");
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
