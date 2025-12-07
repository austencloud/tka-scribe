/**
 * Quick Feedback State
 *
 * Manages the visibility of the quick feedback panel (desktop hotkey overlay).
 * Shares state with the submit tab for draft persistence.
 */

import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

let isOpen = $state(false);

/**
 * Check if we're currently on the feedback submit tab.
 * If so, the quick panel should not open (redundant).
 */
function isInFeedbackSubmitTab(): boolean {
  return (
    navigationState.currentModule === "feedback" &&
    navigationState.activeTab === "submit"
  );
}

export const quickFeedbackState = {
  get isOpen() {
    return isOpen;
  },

  open() {
    // Don't open if already on the submit tab - it's redundant
    if (isInFeedbackSubmitTab()) {
      return;
    }
    isOpen = true;
  },

  close() {
    isOpen = false;
  },

  toggle() {
    // Don't toggle on if already on the submit tab
    if (!isOpen && isInFeedbackSubmitTab()) {
      return;
    }
    isOpen = !isOpen;
  },
};
