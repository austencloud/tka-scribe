/**
 * Sequence Loading Utility
 *
 * Handles loading and preparing sequence data for animation.
 * Works with both pre-loaded sequences (from Create module) and sequences
 * that need to be loaded from the service.
 */

import type { ISequenceService } from "$create/shared/services/contracts";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

export interface SequenceLoadResult {
  success: boolean;
  sequence: SequenceData | null;
  error: string | null;
}

/**
 * Load sequence data, handling both working sequences and database sequences
 * @param sequence The sequence to load (may be partial or complete)
 * @param sequenceService Service to load full sequence data if needed
 * @returns Load result with sequence data or error
 */
export async function loadSequenceForAnimation(
  sequence: SequenceData | null,
  sequenceService: ISequenceService
): Promise<SequenceLoadResult> {
  if (!sequence) {
    return {
      success: false,
      sequence: null,
      error: "No sequence provided",
    };
  }

  try {
    let fullSequence = sequence;

    // Check if sequence needs to be loaded from database
    const needsLoading =
      sequence.id && (!sequence.beats || sequence.beats.length === 0);

    if (needsLoading) {
      // Load from service using word or id
      const sequenceIdentifier = sequence.word || sequence.id.toUpperCase();

      const loadedSequence =
        await sequenceService.getSequence(sequenceIdentifier);

      if (!loadedSequence) {
        return {
          success: false,
          sequence: null,
          error: `Sequence not found: ${sequenceIdentifier}`,
        };
      }

      fullSequence = loadedSequence;
    }

    // Normalize sequence data to ensure startPosition is separate from beats
    // Some sequences have startingPositionBeat, others have startPosition
    // BeatGrid expects startPosition to be a separate field
    const fullSequenceWithStarting = fullSequence as unknown as {
      startingPositionBeat?: unknown;
    };
    if (
      !fullSequence.startPosition &&
      fullSequenceWithStarting.startingPositionBeat
    ) {
      const startPositionCandidate =
        fullSequenceWithStarting.startingPositionBeat as SequenceData["startPosition"];
      fullSequence = {
        ...fullSequence,
        startPosition: startPositionCandidate,
      };
    }

    return {
      success: true,
      sequence: fullSequence,
      error: null,
    };
  } catch (err) {
    console.error("❌ Failed to load sequence:", err);
    return {
      success: false,
      sequence: null,
      error: err instanceof Error ? err.message : "Failed to load sequence",
    };
  }
}
