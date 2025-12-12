/**
 * Authentication Service Interface
 *
 * Provides authentication operations for the application.
 * Handles social auth (Google, Facebook) and email/password authentication.
 */

export interface IAuthService {
  /**
   * Sign in with Google using Firebase redirect flow
   * @throws Error if sign-in fails
   */
  signInWithGoogle(): Promise<void>;

  /**
   * Sign in with Facebook using Firebase redirect flow
   * @throws Error if sign-in fails
   */
  signInWithFacebook(): Promise<void>;

  /**
   * Sign in with email and password
   * @param email User's email address
   * @param password User's password
   * @throws Error if sign-in fails
   */
  signInWithEmail(email: string, password: string): Promise<void>;

  /**
   * Sign up with email and password
   * @param email User's email address
   * @param password User's password
   * @param name Optional display name for the user
   * @throws Error if sign-up fails
   */
  signUpWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<void>;

  /**
   * Sign out the current user
   * @throws Error if sign-out fails
   */
  signOut(): Promise<void>;

  /**
   * Set authentication persistence (IndexedDB or localStorage fallback)
   * @throws Error if persistence cannot be set
   */
  setPersistence(): Promise<void>;

  // ============================================================================
  // ACCOUNT LINKING
  // ============================================================================

  /**
   * Link Google account to the currently signed-in user
   * @throws Error if user is not signed in or linking fails
   */
  linkGoogleAccount(): Promise<void>;

  /**
   * Link Facebook account to the currently signed-in user
   * @throws Error if user is not signed in or linking fails
   */
  linkFacebookAccount(): Promise<void>;

  /**
   * Get list of provider IDs linked to the current user
   * @returns Array of provider IDs (e.g., 'google.com', 'facebook.com', 'password')
   */
  getLinkedProviders(): string[];

  /**
   * Unlink a provider from the current user
   * @param providerId The provider to unlink (e.g., 'google.com', 'facebook.com')
   * @throws Error if user is not signed in, provider not linked, or unlinking fails
   */
  unlinkProvider(providerId: string): Promise<void>;

  /**
   * Link email/password to the currently signed-in user
   * Allows users who signed up with social auth to add a password
   * @param email Email address (must match current user's email or be new)
   * @param password Password to set
   * @throws Error if user is not signed in, email already in use, or linking fails
   */
  linkEmailPassword(email: string, password: string): Promise<void>;

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  /**
   * Resend email verification to the current user
   * @throws Error if user is not signed in or sending fails
   */
  resendVerificationEmail(): Promise<void>;

  /**
   * Reload the current user to get fresh data (including emailVerified status)
   * @returns true if email is verified, false otherwise
   * @throws Error if user is not signed in
   */
  reloadUser(): Promise<boolean>;

  /**
   * Check if the current user's email is verified
   * @returns true if verified, false otherwise
   */
  isEmailVerified(): boolean;

  // ============================================================================
  // MULTI-FACTOR AUTHENTICATION
  // ============================================================================

  /**
   * Check if the current user has MFA enabled
   * @returns true if user has enrolled at least one MFA factor
   */
  isMFAEnabled(): boolean;

  /**
   * Get list of enrolled MFA factors for the current user
   * @returns Array of enrolled factor info objects
   */
  getEnrolledFactors(): import("firebase/auth").MultiFactorInfo[];

  /**
   * Start TOTP enrollment - generates secret and returns QR code data
   * @returns Object containing the TOTP secret and QR code URI for authenticator apps
   * @throws Error if user is not signed in or enrollment fails
   */
  startTOTPEnrollment(): Promise<{
    secret: import("firebase/auth").TotpSecret;
    qrCodeUri: string;
    secretKey: string;
  }>;

  /**
   * Complete TOTP enrollment by verifying a code from the authenticator app
   * @param secret The TOTP secret from startTOTPEnrollment
   * @param verificationCode 6-digit code from authenticator app
   * @param displayName Optional name for the factor (e.g., "Authenticator App")
   * @throws Error if verification fails
   */
  completeTOTPEnrollment(
    secret: import("firebase/auth").TotpSecret,
    verificationCode: string,
    displayName?: string
  ): Promise<void>;

  /**
   * Unenroll an MFA factor
   * @param factorUid The UID of the factor to remove (from getEnrolledFactors)
   * @throws Error if user is not signed in or unenrollment fails
   */
  unenrollFactor(factorUid: string): Promise<void>;

  /**
   * Verify MFA code during sign-in challenge
   * @param resolver The multi-factor resolver from the MFARequiredError
   * @param verificationCode 6-digit code from authenticator app
   * @param factorIndex Index of the factor to use (default 0)
   * @throws Error if verification fails
   */
  verifyMFACode(
    resolver: import("firebase/auth").MultiFactorResolver,
    verificationCode: string,
    factorIndex?: number
  ): Promise<void>;
}
