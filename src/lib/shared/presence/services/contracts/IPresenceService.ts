/**
 * Presence Service Interface
 *
 * Manages real-time user presence using Firebase Realtime Database.
 */

import type {
  UserPresence,
  UserPresenceWithId,
  PresenceStats,
} from "../../domain/models/presence-models";

export interface IPresenceService {
  /**
   * Initialize presence tracking for the current user
   * Sets up online status and disconnect handlers
   */
  initialize(): Promise<void>;

  /**
   * Update current user's location (module/tab)
   * @param module - Current module ID
   * @param tab - Current tab ID (optional)
   */
  updateLocation(module: string, tab?: string | null): Promise<void>;

  /**
   * Set user as offline (called on logout)
   */
  goOffline(): Promise<void>;

  /**
   * Get current user's presence data
   */
  getCurrentPresence(): UserPresence | null;

  /**
   * Subscribe to all users' presence (admin only)
   * @param callback - Called when presence data changes
   * @returns Unsubscribe function
   */
  subscribeToAllPresence(
    callback: (users: UserPresenceWithId[]) => void
  ): () => void;

  /**
   * Subscribe to a specific user's presence
   * @param userId - User ID to subscribe to
   * @param callback - Called when presence changes
   * @returns Unsubscribe function
   */
  subscribeToUserPresence(
    userId: string,
    callback: (presence: UserPresence | null) => void
  ): () => void;

  /**
   * Get aggregated presence stats (admin only)
   */
  getPresenceStats(): Promise<PresenceStats>;

  /**
   * Check if a specific user is online
   * @param userId - User ID to check
   */
  isUserOnline(userId: string): Promise<boolean>;
}
