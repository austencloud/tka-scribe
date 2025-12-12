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
  multiFactor,
  TotpMultiFactorGenerator,
  getMultiFactorResolver,
  type MultiFactorInfo,
  type MultiFactorResolver,
  type TotpSecret,
  type MultiFactorError,
} from "firebase/auth";
import { MFARequiredError } from "../../domain/errors/MFARequiredError";
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
      // Check if MFA is required
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "auth/multi-factor-auth-required"
      ) {
        console.log("🔐 [email] MFA required, resolving...");
        const resolver = getMultiFactorResolver(auth, error as MultiFactorError);
        throw new MFARequiredError(resolver);
      }

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

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  async resendVerificationEmail(): Promise<void> {
    console.log("📧 [email] Resending verification email...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    if (currentUser.emailVerified) {
      console.log("✅ [email] Email already verified");
      return;
    }

    try {
      await sendEmailVerification(currentUser);
      console.log("✅ [email] Verification email resent successfully");
    } catch (error: unknown) {
      console.error("❌ [email] Failed to resend verification email:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      // Handle rate limiting
      if (message.includes("too-many-requests")) {
        throw new Error(
          "Too many requests. Please wait a few minutes before trying again."
        );
      }

      throw new Error(`Failed to resend verification email: ${message}`);
    }
  }

  async reloadUser(): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      await currentUser.reload();
      return currentUser.emailVerified;
    } catch (error: unknown) {
      console.error("❌ [email] Failed to reload user:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to reload user: ${message}`);
    }
  }

  isEmailVerified(): boolean {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    return currentUser.emailVerified;
  }

  // ============================================================================
  // MULTI-FACTOR AUTHENTICATION
  // ============================================================================

  isMFAEnabled(): boolean {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    return multiFactor(currentUser).enrolledFactors.length > 0;
  }

  getEnrolledFactors(): MultiFactorInfo[] {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return [];
    }
    return multiFactor(currentUser).enrolledFactors;
  }

  async startTOTPEnrollment(): Promise<{
    secret: TotpSecret;
    qrCodeUri: string;
    secretKey: string;
  }> {
    console.log("🔐 [mfa] Starting TOTP enrollment...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      // Get multi-factor session
      const multiFactorSession = await multiFactor(currentUser).getSession();

      // Generate TOTP secret
      const secret = await TotpMultiFactorGenerator.generateSecret(
        multiFactorSession
      );

      // Build the QR code URI for authenticator apps
      const accountName = currentUser.email || currentUser.uid;
      const issuer = "TKA Studio";
      const qrCodeUri = secret.generateQrCodeUrl(accountName, issuer);
      const secretKey = secret.secretKey;

      console.log("✅ [mfa] TOTP secret generated");

      return { secret, qrCodeUri, secretKey };
    } catch (error: unknown) {
      console.error("❌ [mfa] Failed to start TOTP enrollment:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to start TOTP enrollment: ${message}`);
    }
  }

  async completeTOTPEnrollment(
    secret: TotpSecret,
    verificationCode: string,
    displayName: string = "Authenticator App"
  ): Promise<void> {
    console.log("🔐 [mfa] Completing TOTP enrollment...");

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    try {
      // Create assertion for enrollment
      const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
        secret,
        verificationCode
      );

      // Enroll the factor
      await multiFactor(currentUser).enroll(assertion, displayName);

      console.log("✅ [mfa] TOTP enrollment complete");
    } catch (error: unknown) {
      console.error("❌ [mfa] Failed to complete TOTP enrollment:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      // Handle specific errors
      if (message.includes("invalid-verification-code")) {
        throw new Error("Invalid verification code. Please try again.");
      }
      throw new Error(`Failed to complete TOTP enrollment: ${message}`);
    }
  }

  async unenrollFactor(factorUid: string): Promise<void> {
    console.log(`🔐 [mfa] Unenrolling factor: ${factorUid}...`);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Find the factor to unenroll
    const factor = multiFactor(currentUser).enrolledFactors.find(
      (f) => f.uid === factorUid
    );
    if (!factor) {
      throw new Error("Factor not found");
    }

    try {
      await multiFactor(currentUser).unenroll(factor);
      console.log("✅ [mfa] Factor unenrolled successfully");
    } catch (error: unknown) {
      console.error("❌ [mfa] Failed to unenroll factor:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      throw new Error(`Failed to unenroll factor: ${message}`);
    }
  }

  async verifyMFACode(
    resolver: MultiFactorResolver,
    verificationCode: string,
    factorIndex: number = 0
  ): Promise<void> {
    console.log("🔐 [mfa] Verifying MFA code...");

    const hint = resolver.hints[factorIndex];
    if (!hint) {
      throw new Error("No MFA factor found at the specified index");
    }

    try {
      // Create assertion for sign-in
      const assertion = TotpMultiFactorGenerator.assertionForSignIn(
        hint.uid,
        verificationCode
      );

      // Complete sign-in
      await resolver.resolveSignIn(assertion);
      console.log("✅ [mfa] MFA verification successful");
    } catch (error: unknown) {
      console.error("❌ [mfa] MFA verification failed:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("invalid-verification-code")) {
        throw new Error("Invalid verification code. Please try again.");
      }
      throw new Error(`MFA verification failed: ${message}`);
    }
  }
}
