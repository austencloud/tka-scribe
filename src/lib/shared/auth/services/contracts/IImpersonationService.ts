/**
 * IImpersonationService
 *
 * Contract for admin "View As" impersonation feature.
 * Allows admins to view the app as another user for support/debugging.
 */

import type { UserRole } from "../../domain/models/UserRole";

export interface ImpersonatedUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
}

export interface IImpersonationService {
  /**
   * Start impersonating a user (admin only).
   *
   * @param userId - The UID of the user to impersonate
   * @returns Promise with impersonated user data
   */
  startImpersonation(userId: string): Promise<ImpersonatedUser>;

  /**
   * Stop impersonating and return to actual user.
   */
  stopImpersonation(): void;

  /**
   * Get current impersonated user (or null if not impersonating).
   */
  getImpersonatedUser(): ImpersonatedUser | null;

  /**
   * Check if currently impersonating.
   */
  isImpersonating(): boolean;

  /**
   * Get the effective user ID (impersonated or actual).
   */
  getEffectiveUserId(actualUserId: string | null): string | null;
}
