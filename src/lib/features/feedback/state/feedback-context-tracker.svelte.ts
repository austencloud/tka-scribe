/**
 * Feedback Context Tracker
 *
 * Tracks the last module:tab the user was on before opening the Feedback module.
 * This provides automatic context for feedback submissions.
 */

import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

// Tracked context - simple variables (not using $state to avoid rune conflicts)
let lastModule = "";
let lastTab = "";

/**
 * Update the tracked context.
 * Call this from the FeedbackModule whenever navigation changes.
 */
export function updateFeedbackContext() {
  const currentModule = navigationState.currentModule;
  const currentTab = navigationState.activeTab;

  // Only update context when NOT on the feedback module
  if (currentModule !== "feedback") {
    lastModule = currentModule;
    lastTab = currentTab;
  }
}

/**
 * Get the captured context (last module:tab before feedback)
 */
export function getCapturedContext() {
  return {
    get module() {
      return lastModule;
    },
    get tab() {
      return lastTab;
    },
  };
}

/**
 * Get the captured module
 */
export function getCapturedModule(): string {
  return lastModule;
}

/**
 * Get the captured tab
 */
export function getCapturedTab(): string {
  return lastTab;
}
