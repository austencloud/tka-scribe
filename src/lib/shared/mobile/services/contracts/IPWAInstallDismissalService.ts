/**
 * PWA Install Dismissal Tracking Service Contract
 *
 * Tracks dismissals of PWA install prompts and enforces
 * progressive delay timing (7 days → 30 days → 90 days).
 */

export interface PWADismissalState {
  /** Number of times user has dismissed the install prompt */
  dismissCount: number;

  /** Timestamp of last dismissal (milliseconds) */
  lastDismissed: number | null;

  /** User has indicated to never ask again */
  neverAskAgain: boolean;

  /** User has successfully installed the app */
  hasInstalled: boolean;
}

export interface IPWAInstallDismissalService {
  /**
   * Record that user dismissed the install prompt
   */
  recordDismissal(): void;

  /**
   * Record that user successfully installed the app
   */
  recordInstallation(): void;

  /**
   * Record that user selected "never ask again"
   */
  recordNeverAskAgain(): void;

  /**
   * Check if enough time has passed since last dismissal
   * to show the prompt again
   *
   * Delay logic:
   * - First dismissal: 7 days
   * - Second dismissal: 30 days
   * - Third+ dismissal: 90 days
   * - Never ask again: never show
   */
  canShowPrompt(): boolean;

  /**
   * Get days until next prompt can be shown
   * Returns 0 if can show now, -1 if never
   */
  getDaysUntilNextPrompt(): number;

  /**
   * Get current dismissal state
   */
  getState(): PWADismissalState;

  /**
   * Reset dismissal state (for testing)
   */
  reset(): void;
}
