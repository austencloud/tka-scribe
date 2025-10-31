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
  type User,
} from "firebase/auth";
import { auth } from "../firebase";

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

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
}

// ============================================================================
// REACTIVE STATE (Svelte 5 Runes - Module Pattern)
// ============================================================================

// Internal reactive state
let _state = $state<AuthState>({
  user: null,
  loading: true,
  initialized: false,
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

  // ============================================================================
  // Methods
  // ============================================================================

  /**
   * Initialize the auth listener
   * Call this once when your app starts
   */
  initialize() {
    if (cleanupAuthListener) {
      console.log("🔐 [authStore] Already initialized, skipping");
      return; // Already initialized
    }

    console.log("🔐 [authStore] Initializing auth state listener...");

    cleanupAuthListener = onAuthStateChanged(
      auth,
      async (user) => {
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
        } else {
          console.log("ℹ️ [authStore] User signed out");
        }

        _state = {
          user,
          loading: false,
          initialized: true,
        };
      },
      (error) => {
        console.error("❌ [authStore] Auth state change error:", error);
        _state = {
          user: null,
          loading: false,
          initialized: true,
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
