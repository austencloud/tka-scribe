/**
 * ImpersonationService
 *
 * Handles admin "View As" impersonation feature.
 * Allows admins to view the app as another user for support/debugging.
 */

import { injectable } from "inversify";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebase";
import type { IImpersonationService, ImpersonatedUser } from "../contracts/IImpersonationService";
import type { UserRole } from "../../domain/models/UserRole";

@injectable()
export class ImpersonationService implements IImpersonationService {
  private _impersonatedUser: ImpersonatedUser | null = null;

  /**
   * Start impersonating a user (admin only).
   * 
   * @param userId - The UID of the user to impersonate
   * @returns Promise with impersonated user data
   */
  async startImpersonation(userId: string): Promise<ImpersonatedUser> {
    try {
      const userDocRef = doc(firestore, `users/${userId}`);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        throw new Error(`User ${userId} not found`);
      }

      const userData = userDoc.data();
      const role = (userData["role"] || "user") as UserRole;

      this._impersonatedUser = {
        uid: userId,
        email: userData["email"] || null,
        displayName: userData["displayName"] || null,
        photoURL: userData["photoURL"] || null,
        role,
      };

      return this._impersonatedUser;
    } catch (error) {
      console.error(`❌ [ImpersonationService] Failed to start impersonation:`, error);
      throw error;
    }
  }

  /**
   * Stop impersonating and return to actual user.
   */
  stopImpersonation(): void {
    this._impersonatedUser = null;
  }

  /**
   * Get current impersonated user (or null if not impersonating).
   */
  getImpersonatedUser(): ImpersonatedUser | null {
    return this._impersonatedUser;
  }

  /**
   * Check if currently impersonating.
   */
  isImpersonating(): boolean {
    return this._impersonatedUser !== null;
  }

  /**
   * Get the effective user ID (impersonated or actual).
   */
  getEffectiveUserId(actualUserId: string | null): string | null {
    if (this._impersonatedUser) {
      return this._impersonatedUser.uid;
    }
    return actualUserId;
  }
}
