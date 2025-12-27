/**
 * Sequence Transform Operations
 *
 * Handles sequence-level transformations:
 * - Mirror sequence
 * - Swap colors
 * - Rotate sequence
 * - Duplicate sequence
 * - Set start position
 * - Validation
 *
 * RESPONSIBILITY: Transform operations coordinator, orchestrates state + services
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { updateSequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { BeatData } from "../../domain/models/BeatData";
import type { ISequenceStatsCalculator } from "../../services/contracts/ISequenceStatsCalculator";
import type { ISequenceTransformer } from "../../services/contracts/ISequenceTransformer";
import type { ISequenceValidator } from "../../services/contracts/ISequenceValidator";
import type { SequenceCoreState } from "../core/SequenceCoreState.svelte";
import type { SequenceSelectionState } from "../selection/SequenceSelectionState.svelte";
import type { ValidationResult } from "$lib/shared/validation/ValidationResult";

export interface TransformOperationsConfig {
  coreState: SequenceCoreState;
  selectionState: SequenceSelectionState;
  sequenceStatisticsService?: ISequenceStatsCalculator | null;
  SequenceTransformer?: ISequenceTransformer | null;
  sequenceValidationService?: ISequenceValidator | null;
  onError?: (error: string) => void;
  onSave?: () => Promise<void>;
}

export function createSequenceTransformOperations(
  config: TransformOperationsConfig
) {
  const {
    coreState,
    selectionState,
    sequenceStatisticsService,
    SequenceTransformer,
    sequenceValidationService,
    onError,
    onSave,
  } = config;

  function handleError(message: string, error?: unknown) {
    const errorMsg = error instanceof Error ? error.message : message;
    coreState.setError(errorMsg);
    onError?.(errorMsg);
    console.error(message, error);
  }

  return {
    setStartPosition(startPosition: BeatData | null) {
      if (!coreState.currentSequence) return;

      try {
        if (startPosition === null) {
          // Clear start position
          const updatedSequence = updateSequenceData(coreState.currentSequence, {
            startPosition: undefined,
            startingPositionBeat: undefined,
          });
          coreState.setCurrentSequence(updatedSequence);
          selectionState.setStartPosition(null);
          console.log(
            "✅ Transform: Cleared start position (setStartPosition called with null)"
          );
        } else {
          // Update sequence with start position - set both fields for compatibility
          const updatedSequence = updateSequenceData(coreState.currentSequence, {
            startPosition: startPosition,
            startingPositionBeat: startPosition, // CRITICAL: Set both fields for compatibility
          });
          coreState.setCurrentSequence(updatedSequence);
          selectionState.setStartPosition(startPosition);
          console.log(
            "✅ Transform: Updated hasStartPosition to true (setStartPosition called)"
          );
        }
        coreState.clearError();
      } catch (error) {
        handleError("Failed to set start position", error);
      }
    },

    async mirrorSequence() {
      if (!coreState.currentSequence || !SequenceTransformer) {
        return;
      }

      try {
        console.log("🔄 Mirroring sequence...");
        const updatedSequence = SequenceTransformer.mirrorSequence(
          coreState.currentSequence
        );
        console.log("✅ Got mirrored sequence:", updatedSequence);
        coreState.setCurrentSequence(updatedSequence);
        console.log("✅ Updated core state with mirrored sequence");

        // Update selection state with transformed start position so UI re-renders
        if (updatedSequence.startPosition) {
          selectionState.setStartPosition(updatedSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
        console.log("✅ Mirror complete and saved");
      } catch (error) {
        console.error("❌ Mirror error:", error);
        handleError("Failed to mirror sequence", error);
      }
    },

    async swapColors() {
      if (!coreState.currentSequence || !SequenceTransformer) return;

      try {
        const updatedSequence = SequenceTransformer.swapColors(
          coreState.currentSequence
        );
        coreState.setCurrentSequence(updatedSequence);

        // Update selection state with transformed start position so UI re-renders
        if (updatedSequence.startPosition) {
          selectionState.setStartPosition(updatedSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
      } catch (error) {
        handleError("Failed to swap colors", error);
      }
    },

    async rotateSequence(direction: "clockwise" | "counterclockwise") {
      if (!coreState.currentSequence || !SequenceTransformer) return;

      try {
        const rotationAmount = direction === "clockwise" ? 1 : -1;
        const updatedSequence = SequenceTransformer.rotateSequence(
          coreState.currentSequence,
          rotationAmount
        );
        coreState.setCurrentSequence(updatedSequence);

        // Update selection state with transformed start position so UI re-renders
        if (updatedSequence.startPosition) {
          selectionState.setStartPosition(updatedSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
      } catch (error) {
        handleError("Failed to rotate sequence", error);
      }
    },

    duplicateSequence(newName?: string): SequenceData | null {
      if (!coreState.currentSequence || !SequenceTransformer)
        return null;

      try {
        const duplicated = SequenceTransformer.duplicateSequence(
          coreState.currentSequence,
          newName
        );
        coreState.clearError();
        return duplicated;
      } catch (error) {
        handleError("Failed to duplicate sequence", error);
        return null;
      }
    },

    async rewindSequence() {
      if (!coreState.currentSequence || !SequenceTransformer) return;

      try {
        const rewindSequence =
          await SequenceTransformer.rewindSequence(
            coreState.currentSequence
          );
        coreState.setCurrentSequence(rewindSequence);

        // Update selection state with new start position so UI re-renders
        if (rewindSequence.startPosition) {
          selectionState.setStartPosition(rewindSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
      } catch (error) {
        handleError("Failed to rewind sequence", error);
      }
    },

    async shiftStartPosition(targetBeatNumber: number) {
      if (!coreState.currentSequence || !SequenceTransformer) return;

      try {
        const shiftedSequence = SequenceTransformer.shiftStartPosition(
          coreState.currentSequence,
          targetBeatNumber
        );
        coreState.setCurrentSequence(shiftedSequence);

        // Update selection state with new start position so UI re-renders
        if (shiftedSequence.startPosition) {
          selectionState.setStartPosition(shiftedSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
      } catch (error) {
        handleError("Failed to shift start position", error);
      }
    },

    async flipSequence() {
      if (!coreState.currentSequence || !SequenceTransformer) return;

      try {
        console.log("🔄 Flipping sequence...");
        const flippedSequence = SequenceTransformer.flipSequence(
          coreState.currentSequence
        );
        console.log("✅ Got flipped sequence:", flippedSequence);
        coreState.setCurrentSequence(flippedSequence);
        console.log("✅ Updated core state with flipped sequence");

        // Update selection state with transformed start position so UI re-renders
        if (flippedSequence.startPosition) {
          selectionState.setStartPosition(flippedSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
        console.log("✅ Flip complete and saved");
      } catch (error) {
        console.error("❌ Flip error:", error);
        handleError("Failed to flip sequence", error);
      }
    },

    async invertSequence() {
      if (!coreState.currentSequence || !SequenceTransformer) return;

      try {
        console.log("🔄 Inverting sequence rotation directions...");
        const invertedSequence =
          await SequenceTransformer.invertSequence(
            coreState.currentSequence
          );
        console.log("✅ Got inverted sequence:", invertedSequence);
        coreState.setCurrentSequence(invertedSequence);
        console.log("✅ Updated core state with inverted sequence");

        // Update selection state with transformed start position so UI re-renders
        if (invertedSequence.startPosition) {
          selectionState.setStartPosition(invertedSequence.startPosition);
        }

        coreState.clearError();

        // Persist the transformed sequence
        await onSave?.();
        console.log("✅ Invert complete and saved");
      } catch (error) {
        console.error("❌ Invert error:", error);
        handleError("Failed to invert sequence", error);
      }
    },

    validateSequence(): ValidationResult | null {
      if (!coreState.currentSequence || !sequenceValidationService) return null;
      return sequenceValidationService.validateSequence(
        coreState.currentSequence
      );
    },

    getSequenceStatistics() {
      if (!coreState.currentSequence || !sequenceStatisticsService) return null;
      return sequenceStatisticsService.getSequenceStatistics(
        coreState.currentSequence
      );
    },

    generateSequenceWord(): string {
      if (!coreState.currentSequence || !sequenceStatisticsService) {
        return "";
      }
      return sequenceStatisticsService.generateSequenceWord(
        coreState.currentSequence
      );
    },

    calculateSequenceDuration(): number {
      if (!coreState.currentSequence || !sequenceStatisticsService) return 0;
      return sequenceStatisticsService.calculateSequenceDuration(
        coreState.currentSequence
      );
    },
  };
}

export type SequenceTransformOperations = ReturnType<
  typeof createSequenceTransformOperations
>;
