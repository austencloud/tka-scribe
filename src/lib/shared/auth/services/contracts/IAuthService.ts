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
}
