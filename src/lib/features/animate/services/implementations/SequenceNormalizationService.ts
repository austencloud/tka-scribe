/**
 * Sequence Normalization Service
 *
 * Handles normalization of sequence data for consistent consumption by UI components.
 *
 * MIGRATION NOTE: Now properly handles StartPositionData type with type guards.
 */

import { injectable } from "inversify";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type {
  ISequenceNormalizationService,
  NormalizedSequenceData,
} from "../contracts/ISequenceNormalizationService";
import { isStartPosition } from "../../../create/shared/domain/type-guards/pictograph-type-guards";

@injectable()
export class SequenceNormalizationService
  implements ISequenceNormalizationService
{
  /**
   * Normalize sequence data by separating start position from beats array.
   *
   * Handles three storage patterns:
   * 1. startPosition field (modern, uses StartPositionData)
   * 2. startingPositionBeat field (legacy, may be BeatData with beatNumber: 0)
   * 3. Mixed in beats array (oldest, beatNumber: 0)
   */
  separateBeatsFromStartPosition(
    sequence: SequenceData
  ): NormalizedSequenceData {
    // Pattern 1: Modern approach - separate startPosition field
    if (sequence.startPosition) {
      return {
        beats: sequence.beats || [],
        startPosition: sequence.startPosition,
      };
    }

    // Pattern 2: Legacy approach - startingPositionBeat field
    if (sequence.startingPositionBeat) {
      return {
        beats: sequence.beats || [],
        startPosition: sequence.startingPositionBeat,
      };
    }

    // Pattern 3: Oldest approach - beat 0 is mixed in the beats array
    const allBeats = sequence.beats || [];

    // Find start position using type guard (works for both old beatNumber===0 and new isStartPosition)
    const startPos = allBeats.find((beat) => isStartPosition(beat)) || null;

    // Filter out start position from beats array (keep only actual beats)
    const beats = allBeats.filter((beat) => !isStartPosition(beat));

    return {
      beats,
      startPosition: startPos,
    };
  }
}
