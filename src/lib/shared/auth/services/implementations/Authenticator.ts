/**
 * Authentication Service Implementation
 *
 * Handles Firebase authentication operations:
 * - Social auth (Google, Facebook)
 * - Email/password auth
 * - Account linking/unlinking
 * - Email verification utilities
 *
 * Note: Authenticator-app 2FA (TOTP) has been removed from the app.
 */

import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  indexedDBLocalPersistence,
  linkWithCredential,
  linkWithPopup,
  sendEmailVerification,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  unlink,
  updateProfile,
} from "firebase/auth";
import { injectable } from "inversify";
import { auth } from "../../firebase";
import type { IAuthenticator } from "../contracts/IAuthenticator";

@injectable()
export class Authenticator implements IAuthenticator {
  async signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    // Use popup instead of redirect - more reliable and better UX
    await signInWithPopup(auth, provider);
  }

  async signInWithFacebook(): Promise<void> {
    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");
    // Use popup instead of redirect - more reliable and better UX
    await signInWithPopup(auth, provider);
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await this.setPersistence();
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signUpWithEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<void> {
    await this.setPersistence();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (name?.trim()) {
      await updateProfile(userCredential.user, { displayName: name.trim() });
    }

    await sendEmailVerification(userCredential.user);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  async setPersistence(): Promise<void> {
    try {
      await setPersistence(auth, indexedDBLocalPersistence);
    } catch {
      await setPersistence(auth, browserLocalPersistence);
    }
  }

  async linkGoogleAccount(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is currently signed in");

    const isAlreadyLinked = currentUser.providerData.some(
      (p) => p.providerId === "google.com"
    );
    if (isAlreadyLinked) throw new Error("Google account is already linked");

    const provider = new GoogleAuthProvider();
    provider.addScope("email");
    provider.addScope("profile");
    // Use popup instead of redirect - more reliable and better UX
    await linkWithPopup(currentUser, provider);
  }

  async linkFacebookAccount(): Promise<void> {
    const currentUser = auth.currentUser;
    console.log("🔗 [Authenticator] linkFacebookAccount called");
    console.log("🔗 [Authenticator] Current user:", currentUser?.email);
    console.log("🔗 [Authenticator] Current providers:", currentUser?.providerData?.map(p => p.providerId));

    if (!currentUser) throw new Error("No user is currently signed in");

    const isAlreadyLinked = currentUser.providerData.some(
      (p) => p.providerId === "facebook.com"
    );
    if (isAlreadyLinked) throw new Error("Facebook account is already linked");

    const provider = new FacebookAuthProvider();
    provider.addScope("email");
    provider.addScope("public_profile");

    console.log("🔗 [Authenticator] Calling linkWithPopup...");

    // Use popup instead of redirect - more reliable and better UX
    const result = await linkWithPopup(currentUser, provider);
    console.log("✅ [Authenticator] linkWithPopup succeeded:", result.user.providerData.map(p => p.providerId));
  }

  getLinkedProviders(): string[] {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];
    return currentUser.providerData
      .map((p) => p.providerId)
      .filter((p): p is string => typeof p === "string" && p.length > 0);
  }

  async unlinkProvider(providerId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is currently signed in");
    await unlink(currentUser, providerId);
  }

  async linkEmailPassword(email: string, password: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is currently signed in");

    if (!email?.trim()) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    if (password.length < 8)
      throw new Error("Password must be at least 8 characters");

    const credential = EmailAuthProvider.credential(email.trim(), password);
    await linkWithCredential(currentUser, credential);
  }

  async resendVerificationEmail(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in");
    await sendEmailVerification(user);
  }

  async reloadUser(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in");
    await user.reload();
    return !!auth.currentUser?.emailVerified;
  }

  isEmailVerified(): boolean {
    return !!auth.currentUser?.emailVerified;
  }
}
