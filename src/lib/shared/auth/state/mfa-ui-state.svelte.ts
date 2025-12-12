/**
 * MFA UI State
 *
 * Global state for controlling MFA enrollment drawer visibility
 * and tracking MFA status changes for reactivity.
 */

interface MFAUIState {
  isEnrollmentOpen: boolean;
  /** Version counter - increments on MFA status change to trigger reactivity */
  statusVersion: number;
}

let _state = $state<MFAUIState>({
  isEnrollmentOpen: false,
  statusVersion: 0,
});

export const mfaUIState = {
  get isEnrollmentOpen() {
    return _state.isEnrollmentOpen;
  },

  /** Read this in $derived to trigger re-evaluation on MFA changes */
  get statusVersion() {
    return _state.statusVersion;
  },

  openEnrollment() {
    _state.isEnrollmentOpen = true;
  },

  closeEnrollment() {
    _state.isEnrollmentOpen = false;
  },

  /** Call after MFA status changes (enable/disable) to trigger UI updates */
  notifyStatusChange() {
    _state.statusVersion++;
  },
};
