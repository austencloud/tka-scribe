/**
 * Onboarding State
 *
 * Manages first-time user onboarding experience.
 * Shows onboarding after first successful login.
 */

import {
  ONBOARDING_COMPLETED_KEY,
  ONBOARDING_COMPLETED_AT_KEY,
  ONBOARDING_SKIPPED_KEY,
} from "../config/storage-keys";

interface OnboardingState {
  /** Whether onboarding has been completed */
  hasCompleted: boolean;
  /** Whether onboarding was skipped */
  wasSkipped: boolean;
  /** When onboarding was completed */
  completedAt: Date | null;
  /** Whether to show the onboarding experience */
  shouldShow: boolean;
}

function createOnboardingState() {
  // Read initial state from localStorage
  const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY) === "true";
  const skipped = localStorage.getItem(ONBOARDING_SKIPPED_KEY) === "true";
  const completedAtStr = localStorage.getItem(ONBOARDING_COMPLETED_AT_KEY);
  const completedAt = completedAtStr ? new Date(completedAtStr) : null;

  const state = $state<OnboardingState>({
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
     * Check if this is the user's first time and trigger onboarding.
     * Call this after successful authentication.
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
     * Force show onboarding (e.g., from Learn module "replay intro")
     */
    forceShow() {
      state.shouldShow = true;
    },

    /**
     * Mark onboarding as completed
     */
    markCompleted() {
      const now = new Date();
      state.hasCompleted = true;
      state.completedAt = now;
      state.shouldShow = false;

      localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      localStorage.setItem(ONBOARDING_COMPLETED_AT_KEY, now.toISOString());
    },

    /**
     * Mark onboarding as skipped
     */
    markSkipped() {
      state.wasSkipped = true;
      state.shouldShow = false;

      localStorage.setItem(ONBOARDING_SKIPPED_KEY, "true");
    },

    /**
     * Hide onboarding without marking complete (temporary dismiss)
     */
    hide() {
      state.shouldShow = false;
    },

    /**
     * Reset onboarding state (for testing/development)
     */
    reset() {
      state.hasCompleted = false;
      state.wasSkipped = false;
      state.completedAt = null;
      state.shouldShow = false;

      localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      localStorage.removeItem(ONBOARDING_COMPLETED_AT_KEY);
      localStorage.removeItem(ONBOARDING_SKIPPED_KEY);
    },
  };
}

// Singleton instance
export const onboardingState = createOnboardingState();
