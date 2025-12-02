/**
 * Authentication Service Implementation
 *
 * Handles all Firebase authentication operations including social auth
 * (Google, Facebook) and email/password authentication.
 */

import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  EmailAuthProvider,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  setPersistence,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  sendEmailVerification,
  updateProfile,
  linkWithRedirect,
  linkWithCredential,
  unlink,
} from "firebase/auth";
import { auth } from "../../firebase";
import { injectable } from "inversify";
import type { IAuthService } from "../contracts/IAuthService";

@injectable()
export class AuthService implements IAuthService {
  // ============================================================================
  // SOCIAL AUTHENTICATION
  // ============================================================================

  async signInWithGoogle(): Promise<void> {
    console.log("🔐 [google] Starting sign-in process...");

    try {
      // Create Google provider
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      console.log("🔐 [google] Redirecting to Google sign-in...");
      await signInWithRedirect(auth, provider);
    } catch (error: unknown) {
      console.error("❌ [google] Sign-in error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Google sign-in failed: ${message}`);
    }
  }

  async signInWithFacebook(): Promise<void> {
    console.log("🔐 [facebook] Starting sign-in process...");

    try {
      // Create Facebook provider
      const provider = new FacebookAuthProvider();
      provider.addScope("email");
      provider.addScope("public_profile");

      console.log("🔐 [facebook] Redirecting to Facebook sign-in...");
      await signInWithRedirect(auth, provider);
    } catch (error: unknown) {
      console.error("❌ [facebook] Sign-in error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Facebook sign-in failed: ${message}`);
    }
  }

  // ============================================================================
  // EMAIL/PASSWORD AUTHENTICATION
  // ============================================================================

  async signInWithEmail(email: string, password: string): Promise<void> {
    console.log("🔐 [email] Starting sign-in process...");

    try {
      // Set persistence first
      await this.setPersistence();

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ [email] Sign-in successful:", userCredential.user.email);
    } catch (error: unknown) {
      console.error("❌ [email] Sign-in error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Email sign-in failed: ${message}`);
    }
  }

  async signUpWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<void> {
    console.log("🔐 [email] Starting sign-up process...");

    try {
      // Set persistence first
      await this.setPersistence();

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("✅ [email] User created:", userCredential.user.email);

      // Update profile with display name if provided
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        console.log("✅ [email] Profile updated with name:", name);
      }

      // Send email verification
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        console.log("✅ [email] Verification email sent");
      }
    } catch (error: unknown) {
      console.error("❌ [email] Sign-up error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Email sign-up failed: ${message}`);
    }
  }

  // ============================================================================
  // SIGN OUT
  // ============================================================================

  async signOut(): Promise<void> {
    console.log("🔐 [auth] Signing out...");

    try {
      await firebaseSignOut(auth);
      console.log("✅ [auth] Sign-out successful");
    } catch (error: unknown) {
      console.error("❌ [auth] Sign-out error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Sign-out failed: ${message}`);
    }
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  async setPersistence(): Promise<void> {
    try {
      // Try IndexedDB first (preferred)
      await setPersistence(auth, indexedDBLocalPersistence);
      console.log("✅ [auth] IndexedDB persistence set");
    } catch (_indexedDBError) {
      console.warn(
        "⚠️ [auth] IndexedDB persistence failed, falling back to localStorage"
      );

      try {
        // Fallback to localStorage
        await setPersistence(auth, browserLocalPersistence);
        console.log("✅ [auth] localStorage persistence set");
      } catch (localStorageError: unknown) {
        console.error(
          "❌ [auth] Failed to set persistence:",
          localStorageError
        );
        const message = localStorageError instanceof Error ? localStorageError.message : "Unknown error";
        throw new Error(
          `Failed to set persistence: ${message}`
        );
      }
    }
  }

  // ============================================================================
  // ACCOUNT LINKING
  // ============================================================================

  async linkGoogleAccount(): Promise<void> {
    console.log("🔗 [google] Starting account linking...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Check if Google is already linked
    const isAlreadyLinked = currentUser.providerData.some(
      (provider) => provider.providerId === "google.com"
    );
    if (isAlreadyLinked) {
      throw new Error("Google account is already linked");
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");
      provider.addScope("profile");

      console.log("🔗 [google] Redirecting to Google for account linking...");
      await linkWithRedirect(currentUser, provider);
    } catch (error: unknown) {
      console.error("❌ [google] Account linking error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to link Google account: ${message}`);
    }
  }

  async linkFacebookAccount(): Promise<void> {
    console.log("🔗 [facebook] Starting account linking...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Check if Facebook is already linked
    const isAlreadyLinked = currentUser.providerData.some(
      (provider) => provider.providerId === "facebook.com"
    );
    if (isAlreadyLinked) {
      throw new Error("Facebook account is already linked");
    }

    try {
      const provider = new FacebookAuthProvider();
      provider.addScope("email");
      provider.addScope("public_profile");

      console.log("🔗 [facebook] Redirecting to Facebook for account linking...");
      await linkWithRedirect(currentUser, provider);
    } catch (error: unknown) {
      console.error("❌ [facebook] Account linking error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to link Facebook account: ${message}`);
    }
  }

  getLinkedProviders(): string[] {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return [];
    }

    return currentUser.providerData.map((provider) => provider.providerId);
  }

  async unlinkProvider(providerId: string): Promise<void> {
    console.log(`🔗 [auth] Unlinking provider: ${providerId}...`);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Check if provider is linked
    const isLinked = currentUser.providerData.some(
      (provider) => provider.providerId === providerId
    );
    if (!isLinked) {
      throw new Error(`Provider ${providerId} is not linked to this account`);
    }

    // Prevent unlinking if it's the only auth method
    if (currentUser.providerData.length <= 1) {
      throw new Error("Cannot unlink the only authentication method");
    }

    try {
      await unlink(currentUser, providerId);
      console.log(`✅ [auth] Successfully unlinked ${providerId}`);
    } catch (error: unknown) {
      console.error(`❌ [auth] Failed to unlink ${providerId}:`, error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to unlink provider: ${message}`);
    }
  }

  async linkEmailPassword(email: string, password: string): Promise<void> {
    console.log("🔗 [email] Starting email/password linking...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Check if email/password is already linked
    const isAlreadyLinked = currentUser.providerData.some(
      (provider) => provider.providerId === "password"
    );
    if (isAlreadyLinked) {
      throw new Error("Email/password is already linked to this account");
    }

    try {
      // Create email/password credential
      const credential = EmailAuthProvider.credential(email, password);

      // Link the credential to the current user
      await linkWithCredential(currentUser, credential);
      console.log("✅ [email] Successfully linked email/password");

      // Send verification email if the email is new
      if (!currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        console.log("✅ [email] Verification email sent");
      }
    } catch (error: unknown) {
      console.error("❌ [email] Failed to link email/password:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      // Handle specific Firebase errors
      if (message.includes("email-already-in-use")) {
        throw new Error(
          "This email is already associated with another account"
        );
      } else if (message.includes("weak-password")) {
        throw new Error("Password is too weak. Use at least 6 characters.");
      } else if (message.includes("invalid-email")) {
        throw new Error("Invalid email address");
      } else {
        throw new Error(`Failed to link email/password: ${message}`);
      }
    }
  }
}
