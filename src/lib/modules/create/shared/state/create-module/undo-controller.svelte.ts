/**
 * Undo Controller
 *
 * Wraps the undo service so the create module state can stay declarative.
 * Handles snapshotting, callbacks, and the animation-friendly undo flow.
 */

import type { BuildModeId, SequenceData } from "$shared";
import type { SequenceState } from "../SequenceStateOrchestrator.svelte";
import type {
  IUndoService,
  UndoMetadata,
} from "../../services/contracts/IUndoService";
import { UndoOperationType } from "../../services/contracts/IUndoService";

type UndoControllerDeps = {
  undoService: IUndoService;
  sequenceState: SequenceState;
  getActiveSection: () => BuildModeId;
  setActiveSectionInternal: (
    panel: BuildModeId,
    addToHistory?: boolean
  ) => Promise<void>;
};

export type UndoSnapshotType =
  | "REMOVE_BEATS"
  | "CLEAR_SEQUENCE"
  | "ADD_BEAT"
  | "SELECT_START_POSITION";

export function createUndoController({
  undoService,
  sequenceState,
  getActiveSection,
  setActiveSectionInternal,
}: UndoControllerDeps) {
  let showStartPositionPickerCallback: (() => void) | null = null;
  let syncPickerStateCallback: (() => void) | null = null;
  let onUndoingOptionCallback: ((isUndoing: boolean) => void) | null = null;

  let undoChangeCounter = $state(0);

  undoService.onChange(() => {
    undoChangeCounter++;
  });

  function pushUndoSnapshot(type: UndoSnapshotType, metadata?: UndoMetadata) {
    if (
      !sequenceState.currentSequence &&
      type !== "SELECT_START_POSITION"
    ) {
      return;
    }

    const operationType =
      type === "SELECT_START_POSITION"
        ? UndoOperationType.SELECT_START_POSITION
        : type === "ADD_BEAT"
          ? UndoOperationType.ADD_BEAT
          : type === "REMOVE_BEATS"
            ? UndoOperationType.REMOVE_BEATS
            : UndoOperationType.CLEAR_SEQUENCE;

    const currentSequenceRef = sequenceState.currentSequence;
    const selectedBeatNumberRef = sequenceState.selectedBeatNumber;
    const activeSectionRef = getActiveSection();
    const timestampRef = Date.now();

    queueMicrotask(() => {
      const sequenceCopy: SequenceData | null = currentSequenceRef
        ? {
            ...currentSequenceRef,
            beats: currentSequenceRef.beats.map((beat) =>
              beat ? { ...beat } : beat
            ),
          }
        : null;

      const beforeState = {
        sequence: sequenceCopy,
        selectedBeatNumber: selectedBeatNumberRef,
        activeSection: activeSectionRef,
        shouldShowStartPositionPicker:
          type === "SELECT_START_POSITION" ? true : false,
        timestamp: timestampRef,
      };

      undoService.pushUndo(operationType, beforeState, metadata);
    });
  }

  function undo(): boolean {
    const lastEntry = undoService.undo();
    if (!lastEntry) {
      return false;
    }

    if (lastEntry.type === UndoOperationType.SELECT_START_POSITION) {
      sequenceState.clearSequenceCompletely();
      if (showStartPositionPickerCallback) {
        showStartPositionPickerCallback();
      }
      return true;
    }

    const currentSequence = sequenceState.currentSequence;
    const restoredSequence = lastEntry.beforeState.sequence;

    if (currentSequence && restoredSequence) {
      const currentBeatCount = currentSequence.beats.length;
      const restoredBeatCount = restoredSequence.beats.length;

      if (currentBeatCount > restoredBeatCount) {
        const beatsToRemove: number[] = [];
        for (let i = restoredBeatCount; i < currentBeatCount; i++) {
          beatsToRemove.push(i);
        }

        sequenceState.animationState.startRemovingBeats(beatsToRemove);
        if (onUndoingOptionCallback) {
          onUndoingOptionCallback(true);
        }

        const fadeAnimationDuration = 250;
        setTimeout(() => {
          sequenceState.setCurrentSequence(restoredSequence);
          sequenceState.animationState.endRemovingBeats();

          if (onUndoingOptionCallback) {
            onUndoingOptionCallback(false);
          }

          restoreSelection(lastEntry.beforeState.selectedBeatNumber);
          if (lastEntry.beforeState.activeSection) {
            void setActiveSectionInternal(
              lastEntry.beforeState.activeSection,
              false
            );
          }

          if (syncPickerStateCallback) {
            syncPickerStateCallback();
          }
        }, fadeAnimationDuration);

        return true;
      }
    }

    sequenceState.setCurrentSequence(restoredSequence);
    restoreSelection(lastEntry.beforeState.selectedBeatNumber);
    if (lastEntry.beforeState.activeSection) {
      void setActiveSectionInternal(lastEntry.beforeState.activeSection, false);
    }

    if (syncPickerStateCallback) {
      syncPickerStateCallback();
    }

    return true;
  }

  function restoreSelection(selectedBeatNumber: number | null) {
    if (selectedBeatNumber !== null) {
      sequenceState.selectBeat(selectedBeatNumber);
    } else {
      sequenceState.clearSelection();
    }
  }

  function clearUndoHistory() {
    undoService.clearHistory();
  }

  function setShowStartPositionPickerCallback(callback: () => void) {
    showStartPositionPickerCallback = callback;
  }

  function setSyncPickerStateCallback(callback: () => void) {
    syncPickerStateCallback = callback;
  }

  function setOnUndoingOptionCallback(callback: (isUndoing: boolean) => void) {
    onUndoingOptionCallback = callback;
  }

  return {
    pushUndoSnapshot,
    undo,
    clearUndoHistory,
    setShowStartPositionPickerCallback,
    setSyncPickerStateCallback,
    setOnUndoingOptionCallback,
    get canUndo() {
      void undoChangeCounter;
      return undoService.canUndo;
    },
    get canRedo() {
      void undoChangeCounter;
      return undoService.canRedo;
    },
    get undoHistory() {
      return undoService.undoHistory;
    },
  };
}

export type UndoController = ReturnType<typeof createUndoController>;
