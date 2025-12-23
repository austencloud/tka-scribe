/**
 * Share Hub State Management
 *
 * Runes-based state for format selection and navigation within the Share Hub.
 * Follows the same pattern as share-state.svelte.ts.
 */

import type { ShareFormat } from '../domain/models/ShareFormat';

export interface ShareHubState {
  selectedFormat: ShareFormat | null;
  isPickerView: boolean;
}

export function createShareHubState(): ShareHubState & {
  selectFormat: (format: ShareFormat) => void;
  backToPicker: () => void;
  resetState: () => void;
} {
  let state = $state<ShareHubState>({
    selectedFormat: null,
    isPickerView: true,
  });

  return {
    get selectedFormat() {
      return state.selectedFormat;
    },
    get isPickerView() {
      return state.isPickerView;
    },

    selectFormat(format: ShareFormat) {
      console.log('📱 ShareHub: Selecting format:', format);
      state.selectedFormat = format;
      state.isPickerView = false;
      console.log('📱 ShareHub: State after select:', { selectedFormat: state.selectedFormat, isPickerView: state.isPickerView });
    },

    backToPicker() {
      console.log('📱 ShareHub: Going back to picker');
      state.isPickerView = true;
      console.log('📱 ShareHub: State after back:', { selectedFormat: state.selectedFormat, isPickerView: state.isPickerView });
    },

    resetState() {
      console.log('📱 ShareHub: Resetting state');
      state.selectedFormat = null;
      state.isPickerView = true;
    },
  };
}
