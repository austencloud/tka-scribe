/**
 * Sequence Normalization Service
 *
 * Handles normalization of sequence data for consistent consumption by UI components.
 */

import { injectable } from "inversify";

import type { SequenceData } from "$shared";

import type {
  ISequenceNormalizationService,
  NormalizedSequenceData,
} from "../contracts/ISequenceNormalizationService";

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
    if ((sequence as any).startingPositionBeat) {
      return {
        beats: [...(sequence.beats || [])],
        startPosition: (sequence as any).startingPositionBeat,
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
