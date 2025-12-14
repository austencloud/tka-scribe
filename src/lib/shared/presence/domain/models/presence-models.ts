/**
 * Presence Domain Models
 *
 * Models for real-time user presence tracking.
 */

/**
 * User presence data stored in Firebase Realtime DB
 * Path: /presence/{userId}
 */
export interface UserPresence {
  /** Whether user is currently online */
  online: boolean;

  /** Last activity timestamp (Unix ms) */
  lastSeen: number;

  /** Current module the user is viewing */
  currentModule: string;

  /** Current tab within the module (if any) */
  currentTab: string | null;

  /** Current session ID */
  sessionId: string;

  /** Device type */
  device: "desktop" | "mobile" | "tablet";

  /** Display name for admin view */
  displayName?: string;

  /** User's email for admin view */
  email?: string;

  /** User's avatar URL */
  photoURL?: string | null;
}

/**
 * Presence data for admin dashboard display
 */
export interface UserPresenceWithId extends UserPresence {
  /** User ID */
  userId: string;
}

/**
 * Aggregated presence stats for admin dashboard
 */
export interface PresenceStats {
  /** Total online users */
  onlineCount: number;

  /** Users by module */
  byModule: Record<string, number>;

  /** Users by device type */
  byDevice: Record<"desktop" | "mobile" | "tablet", number>;
}
