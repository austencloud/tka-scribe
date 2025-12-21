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
import type { ISequenceStatisticsService } from "../../services/contracts/ISequenceStatisticsService";
import type { ISequenceTransformationService } from "../../services/contracts/ISequenceTransformationService";
import type { ISequenceValidationService } from "../../services/contracts/ISequenceValidationService";
import type { SequenceCoreState } from "../core/SequenceCoreState.svelte";
import type { SequenceSelectionState } from "../selection/SequenceSelectionState.svelte";
import type { ValidationResult } from "$lib/shared/validation/ValidationResult";

export interface TransformOperationsConfig {
  coreState: SequenceCoreState;
  selectionState: SequenceSelectionState;
  sequenceStatisticsService?: ISequenceStatisticsService | null;
  sequenceTransformationService?: ISequenceTransformationService | null;
  sequenceValidationService?: ISequenceValidationService | null;
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
    sequenceTransformationService,
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
    setStartPosition(startPosition: BeatData) {
      if (!coreState.currentSequence) return;

      try {
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
        coreState.clearError();
      } catch (error) {
        handleError("Failed to set start position", error);
      }
    },

    async mirrorSequence() {
      if (!coreState.currentSequence || !sequenceTransformationService) {
        return;
      }

      try {
        console.log("🔄 Mirroring sequence...");
        const updatedSequence = sequenceTransformationService.mirrorSequence(
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
      if (!coreState.currentSequence || !sequenceTransformationService) return;

      try {
        const updatedSequence = sequenceTransformationService.swapColors(
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
      if (!coreState.currentSequence || !sequenceTransformationService) return;

      try {
        const rotationAmount = direction === "clockwise" ? 1 : -1;
        const updatedSequence = sequenceTransformationService.rotateSequence(
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
      if (!coreState.currentSequence || !sequenceTransformationService)
        return null;

      try {
        const duplicated = sequenceTransformationService.duplicateSequence(
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
      if (!coreState.currentSequence || !sequenceTransformationService) return;

      try {
        const rewindSequence =
          await sequenceTransformationService.rewindSequence(
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

    async flipSequence() {
      if (!coreState.currentSequence || !sequenceTransformationService) return;

      try {
        console.log("🔄 Flipping sequence...");
        const flippedSequence = sequenceTransformationService.flipSequence(
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
      if (!coreState.currentSequence || !sequenceTransformationService) return;

      try {
        console.log("🔄 Inverting sequence rotation directions...");
        const invertedSequence =
          await sequenceTransformationService.invertSequence(
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
