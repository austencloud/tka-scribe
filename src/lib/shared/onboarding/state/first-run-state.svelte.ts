/**
 * First-Run State
 *
 * Manages first-time user onboarding (separate from module onboarding).
 * This is the FIRST experience users see - before the module intro.
 *
 * Collects:
 * - Display name
 * - Favorite prop
 * - Pictograph mode (light/dark)
 */

const FIRST_RUN_COMPLETED_KEY = "tka-first-run-completed";
const FIRST_RUN_COMPLETED_AT_KEY = "tka-first-run-completed-at";
const FIRST_RUN_SKIPPED_KEY = "tka-first-run-skipped";

interface FirstRunState {
  /** Whether first-run wizard has been completed */
  hasCompleted: boolean;
  /** Whether first-run was skipped */
  wasSkipped: boolean;
  /** When first-run was completed */
  completedAt: Date | null;
  /** Whether to show the first-run wizard */
  shouldShow: boolean;
}

function createFirstRunState() {
  // Check if we're in the browser
  const isBrowser = typeof window !== "undefined";

  // Read initial state from localStorage
  const completed = isBrowser
    ? localStorage.getItem(FIRST_RUN_COMPLETED_KEY) === "true"
    : false;
  const skipped = isBrowser
    ? localStorage.getItem(FIRST_RUN_SKIPPED_KEY) === "true"
    : false;
  const completedAtStr = isBrowser
    ? localStorage.getItem(FIRST_RUN_COMPLETED_AT_KEY)
    : null;
  const completedAt = completedAtStr ? new Date(completedAtStr) : null;

  const state = $state<FirstRunState>({
    hasCompleted: completed,
    wasSkipped: skipped,
    completedAt,
    shouldShow: false, // Controlled by trigger function
  });

  return {
    get hasCompleted() {
      return state.hasCompleted;
    },
    get wasSkipped() {
      return state.wasSkipped;
    },
    get completedAt() {
      return state.completedAt;
    },
    get shouldShow() {
      return state.shouldShow;
    },

    /**
     * Check if this is the user's first time and trigger the wizard.
     * Call this after the app initializes.
     */
    triggerIfFirstTime(): boolean {
      // Don't show if already completed or skipped
      if (state.hasCompleted || state.wasSkipped) {
        return false;
      }

      state.shouldShow = true;
      return true;
    },

    /**
     * Force show the first-run wizard (e.g., from settings "replay intro")
     */
    forceShow() {
      state.shouldShow = true;
    },

    /**
     * Mark first-run as completed
     */
    markCompleted() {
      if (!isBrowser) return;

      const now = new Date();
      state.hasCompleted = true;
      state.completedAt = now;
      state.shouldShow = false;

      localStorage.setItem(FIRST_RUN_COMPLETED_KEY, "true");
      localStorage.setItem(FIRST_RUN_COMPLETED_AT_KEY, now.toISOString());
    },

    /**
     * Mark first-run as skipped
     */
    markSkipped() {
      if (!isBrowser) return;

      state.wasSkipped = true;
      state.shouldShow = false;

      localStorage.setItem(FIRST_RUN_SKIPPED_KEY, "true");
    },

    /**
     * Hide the wizard without marking complete (temporary dismiss)
     */
    hide() {
      state.shouldShow = false;
    },

    /**
     * Reset first-run state (for testing/development)
     */
    reset() {
      if (!isBrowser) return;

      state.hasCompleted = false;
      state.wasSkipped = false;
      state.completedAt = null;
      state.shouldShow = false;

      localStorage.removeItem(FIRST_RUN_COMPLETED_KEY);
      localStorage.removeItem(FIRST_RUN_COMPLETED_AT_KEY);
      localStorage.removeItem(FIRST_RUN_SKIPPED_KEY);
    },

    /**
     * Check if first-run has been done (completed or skipped)
     */
    isDone(): boolean {
      return state.hasCompleted || state.wasSkipped;
    },
  };
}

// Singleton instance
export const firstRunState = createFirstRunState();
