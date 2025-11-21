/**
 * Sequence Normalization Service
 *
 * Handles normalization of sequence data for consistent consumption by UI components.
 */

import { injectable } from "inversify";

import type { PictographData, SequenceData } from "$shared";

import type {
  ISequenceNormalizationService,
  NormalizedSequenceData,
} from "../contracts/ISequenceNormalizationService";

/**
 * Type guard to check if sequence has legacy startingPositionBeat field
 */
function hasLegacyStartingPositionBeat(
  sequence: SequenceData
): sequence is SequenceData & { startingPositionBeat: PictographData } {
  return (
    "startingPositionBeat" in sequence &&
    sequence.startingPositionBeat !== null &&
    sequence.startingPositionBeat !== undefined
  );
}

@injectable()
export class SequenceNormalizationService
  implements ISequenceNormalizationService
{
  /**
   * Normalize sequence data by separating start position from beats array.
   */
  separateBeatsFromStartPosition(
    sequence: SequenceData
  ): NormalizedSequenceData {
    // If sequence has separate startPosition field, beats array is already correct
    if (sequence.startPosition) {
      return {
        beats: [...(sequence.beats || [])],
        startPosition: sequence.startPosition,
      };
    }

    // Check for legacy startingPositionBeat field (some old sequences use this)
    if (hasLegacyStartingPositionBeat(sequence)) {
      return {
        beats: [...(sequence.beats || [])],
        startPosition: sequence.startingPositionBeat,
      };
    }

    // Otherwise, beat 0 is mixed in the beats array - extract it
    const allBeats = sequence.beats || [];
    const beat0 = allBeats.find((beat) => beat.beatNumber === 0) || null;
    const beats = allBeats.filter((beat) => beat.beatNumber > 0);

    return {
      beats,
      startPosition: beat0,
    };
  }
}
