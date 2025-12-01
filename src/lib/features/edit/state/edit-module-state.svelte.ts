/**
 * Edit Module State
 *
 * Manages state for the Edit module including:
 * - Current edit mode (beat vs sequence)
 * - Selected sequence for editing
 * - Selected beat for individual editing
 */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";

export type EditMode = "beat" | "sequence";

export function createEditModuleState() {
  // Current edit mode
  let currentMode = $state<EditMode>("beat");

  // The sequence being edited
  let editingSequence = $state<SequenceData | null>(null);

  // Selected beat for individual editing (beat mode)
  let selectedBeatNumber = $state<number | null>(null);
  let selectedBeatData = $state<BeatData | null>(null);

  // Multi-select for batch editing
  let selectedBeatNumbers = $state<number[]>([]);

  // Track if sequence has unsaved changes
  let hasUnsavedChanges = $state(false);

  // Source of the sequence (for navigation back)
  let sequenceSource = $state<{
    module: string;
    returnPath?: string;
  } | null>(null);

  /**
   * Set the current edit mode
   */
  function setCurrentMode(mode: EditMode) {
    currentMode = mode;
  }

  /**
   * Load a sequence for editing
   */
  function loadSequence(
    sequence: SequenceData,
    source?: { module: string; returnPath?: string }
  ) {
    editingSequence = sequence;
    sequenceSource = source ?? null;
    hasUnsavedChanges = false;
    clearSelection();
  }

  /**
   * Clear the editing sequence
   */
  function clearSequence() {
    editingSequence = null;
    sequenceSource = null;
    hasUnsavedChanges = false;
    clearSelection();
  }

  /**
   * Select a beat for editing
   */
  function selectBeat(beatNumber: number, beatData: BeatData | null) {
    selectedBeatNumber = beatNumber;
    selectedBeatData = beatData;
    // Clear multi-select when selecting single beat
    selectedBeatNumbers = [];
  }

  /**
   * Toggle beat in multi-select mode
   */
  function toggleBeatInMultiSelect(beatNumber: number) {
    const index = selectedBeatNumbers.indexOf(beatNumber);
    if (index === -1) {
      selectedBeatNumbers = [...selectedBeatNumbers, beatNumber];
    } else {
      selectedBeatNumbers = selectedBeatNumbers.filter((n) => n !== beatNumber);
    }
    // Clear single selection when using multi-select
    selectedBeatNumber = null;
    selectedBeatData = null;
  }

  /**
   * Clear beat selection
   */
  function clearSelection() {
    selectedBeatNumber = null;
    selectedBeatData = null;
    selectedBeatNumbers = [];
  }

  /**
   * Update a beat in the editing sequence
   */
  function updateBeat(beatIndex: number, updates: Partial<BeatData>) {
    if (!editingSequence) return;

    const newBeats = [...editingSequence.beats];
    if (beatIndex >= 0 && beatIndex < newBeats.length) {
      const updatedBeat = {
        ...newBeats[beatIndex],
        ...updates,
      } as BeatData;
      newBeats[beatIndex] = updatedBeat;
      editingSequence = { ...editingSequence, beats: newBeats };
      hasUnsavedChanges = true;

      // Update selected beat data if this beat is selected
      if (selectedBeatNumber === beatIndex + 1) {
        selectedBeatData = updatedBeat;
      }
    }
  }

  /**
   * Update the start position
   */
  function updateStartPosition(updates: Partial<PictographData>) {
    if (!editingSequence?.startingPositionBeat) return;

    editingSequence = {
      ...editingSequence,
      startingPositionBeat: {
        ...editingSequence.startingPositionBeat,
        ...updates,
      },
    };
    hasUnsavedChanges = true;
  }

  /**
   * Apply a transformation to the entire sequence
   */
  function transformSequence(newSequence: SequenceData) {
    editingSequence = newSequence;
    hasUnsavedChanges = true;
  }

  /**
   * Mark changes as saved
   */
  function markAsSaved() {
    hasUnsavedChanges = false;
  }

  return {
    // Getters
    get currentMode() {
      return currentMode;
    },
    get editingSequence() {
      return editingSequence;
    },
    get selectedBeatNumber() {
      return selectedBeatNumber;
    },
    get selectedBeatData() {
      return selectedBeatData;
    },
    get selectedBeatNumbers() {
      return selectedBeatNumbers;
    },
    get hasUnsavedChanges() {
      return hasUnsavedChanges;
    },
    get sequenceSource() {
      return sequenceSource;
    },
    get isMultiSelectMode() {
      return selectedBeatNumbers.length > 0;
    },
    get hasBeatSelected() {
      return selectedBeatNumber !== null || selectedBeatNumbers.length > 0;
    },
    get hasSequence() {
      return editingSequence !== null;
    },

    // Actions
    setCurrentMode,
    loadSequence,
    clearSequence,
    selectBeat,
    toggleBeatInMultiSelect,
    clearSelection,
    updateBeat,
    updateStartPosition,
    transformSequence,
    markAsSaved,
  };
}

export type EditModuleState = ReturnType<typeof createEditModuleState>;
