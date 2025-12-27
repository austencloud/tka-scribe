/**
 * IProfilePictureManager
 *
 * Contract for managing user profile pictures from OAuth providers.
 * Handles provider-specific logic for Facebook and Google profile pictures.
 */

import type { User } from "firebase/auth";

export interface IProfilePictureManager {
  /**
   * Update Facebook profile picture to high resolution if needed.
   * Skips if user has Google account linked (Google photos are more reliable).
   *
   * @param user - Firebase User object
   * @returns Promise that resolves when update completes (or is skipped)
   */
  updateFacebookProfilePictureIfNeeded(user: User): Promise<void>;

  /**
   * Update Google profile picture if needed.
   * Google photos are preferred over Facebook (no access tokens needed).
   *
   * @param user - Firebase User object
   * @returns Promise that resolves when update completes (or is skipped)
   */
  updateGoogleProfilePictureIfNeeded(user: User): Promise<void>;

  /**
   * Get provider IDs for reliable profile picture URLs.
   *
   * @param user - Firebase User object
   * @returns Object with googleId and facebookId if available
   */
  getProviderIds(user: User): { googleId?: string; facebookId?: string };
}
