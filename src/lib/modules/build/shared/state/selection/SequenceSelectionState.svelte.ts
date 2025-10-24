/**
 * Sequence Selection State
 *
 * Manages selection state for:
 * - Selected beat index in current sequence
 * - Selected start position
 * - Start position editing mode
 *
 * RESPONSIBILITY: Pure selection tracking, no business logic
 */

import type { PictographData } from "$shared";

export interface SequenceSelectionStateData {
  selectedBeatIndex: number | null;
  selectedStartPosition: PictographData | null;
  hasStartPosition: boolean;
  isStartPositionSelected: boolean;
}

export function createSequenceSelectionState() {
  const state = $state<SequenceSelectionStateData>({
    selectedBeatIndex: null,
    selectedStartPosition: null,
    hasStartPosition: false,
    isStartPositionSelected: false,
  });

  return {
    // Getters
    get selectedBeatIndex() {
      return state.selectedBeatIndex;
    },
    get selectedStartPosition() {
      return state.selectedStartPosition;
    },
    get hasStartPosition() {
      return state.hasStartPosition;
    },
    get isStartPositionSelected() {
      return state.isStartPositionSelected;
    },

    // Computed
    get hasSelection() {
      return state.selectedBeatIndex !== null || state.isStartPositionSelected;
    },

    // Selection operations
    selectBeat(index: number | null) {
      state.selectedBeatIndex = index;
      state.isStartPositionSelected = false;
    },

    selectStartPosition() {
      state.selectedBeatIndex = null;
      state.isStartPositionSelected = true;
    },

    clearSelection() {
      state.selectedBeatIndex = null;
      state.isStartPositionSelected = false;
    },

    isBeatSelected(index: number): boolean {
      return state.selectedBeatIndex === index;
    },

    // Start position management
    setStartPosition(startPosition: PictographData | null) {
      state.selectedStartPosition = startPosition;
      state.hasStartPosition = startPosition !== null;
    },

    // Helpers for beat removal adjustments
    adjustSelectionForRemovedBeat(removedIndex: number) {
      if (state.selectedBeatIndex === removedIndex) {
        state.selectedBeatIndex = null;
      } else if (state.selectedBeatIndex !== null && state.selectedBeatIndex > removedIndex) {
        state.selectedBeatIndex = state.selectedBeatIndex - 1;
      }
    },

    adjustSelectionForInsertedBeat(insertedIndex: number) {
      if (state.selectedBeatIndex !== null && state.selectedBeatIndex >= insertedIndex) {
        state.selectedBeatIndex = state.selectedBeatIndex + 1;
      }
    },

    reset() {
      state.selectedBeatIndex = null;
      state.selectedStartPosition = null;
      state.hasStartPosition = false;
      state.isStartPositionSelected = false;
    },
  };
}

export type SequenceSelectionState = ReturnType<typeof createSequenceSelectionState>;
