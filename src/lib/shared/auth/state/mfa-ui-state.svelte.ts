/**
 * MFA UI State
 *
 * Global state for controlling MFA enrollment drawer visibility.
 * Allows SecuritySection to trigger the drawer which is rendered
 * at the top level in MainApplication.svelte.
 */

interface MFAUIState {
  isEnrollmentOpen: boolean;
}

let _state = $state<MFAUIState>({
  isEnrollmentOpen: false,
});

export const mfaUIState = {
  get isEnrollmentOpen() {
    return _state.isEnrollmentOpen;
  },

  openEnrollment() {
    _state.isEnrollmentOpen = true;
  },

  closeEnrollment() {
    _state.isEnrollmentOpen = false;
  },
};
