/**
 * Session Tracking Service Interface
 *
 * Manages user sessions for activity tracking.
 * A session represents a continuous period of app usage.
 */

export interface SessionInfo {
  /** Unique session ID (UUID) */
  sessionId: string;

  /** When the session started */
  startedAt: Date;

  /** User ID (null if not authenticated) */
  userId: string | null;

  /** Device type */
  device: "desktop" | "mobile" | "tablet";

  /** Browser/platform info */
  userAgent: string;

  /** Screen dimensions at session start */
  screenWidth: number;
  screenHeight: number;
}

export interface ISessionTracker {
  /**
   * Get current session ID
   * Creates a new session if none exists
   */
  getSessionId(): string;

  /**
   * Get full session info
   */
  getSessionInfo(): SessionInfo;

  /**
   * Start a new session
   * Called on app initialization
   */
  startSession(): void;

  /**
   * End the current session
   * Called on logout or app close
   */
  endSession(): Promise<void>;

  /**
   * Update session with authenticated user
   * Called after login
   */
  setUserId(userId: string): void;

  /**
   * Check if a session is active
   */
  isSessionActive(): boolean;

  /**
   * Get session duration in milliseconds
   */
  getSessionDuration(): number;

  /**
   * Set callback for session end events
   * Used by ActivityLogger to log session_end
   */
  onSessionEnd(callback: () => Promise<void>): void;
}
