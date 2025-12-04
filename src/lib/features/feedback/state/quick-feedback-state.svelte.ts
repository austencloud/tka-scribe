/**
 * Quick Feedback State
 *
 * Manages the visibility of the quick feedback panel (desktop hotkey overlay).
 */

let isOpen = $state(false);

export const quickFeedbackState = {
  get isOpen() {
    return isOpen;
  },

  open() {
    isOpen = true;
  },

  close() {
    isOpen = false;
  },

  toggle() {
    isOpen = !isOpen;
  },
};
