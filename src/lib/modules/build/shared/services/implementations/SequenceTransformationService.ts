/**
 * Sequence Transformation Service
 *
 * Pure transformation functions for sequences.
 * All functions return new sequences without mutating inputs.
 */

import type { BeatData, SequenceData } from "$shared";
import { createSequenceData, updateSequenceData } from "$shared";
import { injectable } from "inversify";
import { createBeatData } from "../../domain/factories/createBeatData";
import type { ISequenceTransformationService } from "../contracts/ISequenceTransformationService";

@injectable()
export class SequenceTransformationService implements ISequenceTransformationService {
  /**
   * Clear all beats in a sequence (make them blank)
   */
  clearSequence(sequence: SequenceData): SequenceData {
    const clearedBeats = sequence.beats.map((beat) => ({
      ...beat,
      isBlank: true,
      pictographData: null,
      blueReversal: false,
      redReversal: false,
    }));

    return updateSequenceData(sequence, {
      beats: clearedBeats,
    });
  }

  /**
   * Duplicate a sequence with new IDs
   */
  duplicateSequence(sequence: SequenceData, newName?: string): SequenceData {
    return createSequenceData({
      ...sequence,
      id: crypto.randomUUID(),
      name: newName || `${sequence.name} (Copy)`,
      beats: sequence.beats.map((beat) => ({
        ...beat,
        id: crypto.randomUUID(),
      })),
    });
  }

  /**
   * Mirror sequence (reverse movement and rotation patterns)
   */
  mirrorSequence(sequence: SequenceData): SequenceData {
    const mirroredBeats = sequence.beats.map((beat) => {
      if (beat.isBlank || !beat) {
        return beat;
      }

      // Create mirrored beat data
      // This is a simplified implementation - full mirroring would need
      // to reverse specific movement and rotation patterns
      return createBeatData({
        ...beat,
        // TODO: Implement specific mirroring transformations based on movement types
        // For now, we'll just return the beat as-is
      });
    });

    return {
      ...sequence,
      beats: mirroredBeats,
      name: `${sequence.name} (Mirrored)`,
    };
  }

  /**
   * Swap blue and red colors (reversal flags)
   */
  swapColors(sequence: SequenceData): SequenceData {
    const swappedBeats = sequence.beats.map((beat) => ({
      ...beat,
      blueReversal: beat.redReversal,
      redReversal: beat.blueReversal,
    }));

    return updateSequenceData(sequence, {
      beats: swappedBeats,
    });
  }

  /**
   * Rotate sequence positions
   * TODO: Implement rotation logic based on pictograph data
   */
  rotateSequence(sequence: SequenceData, _rotationAmount: number): SequenceData {
    console.warn("rotateSequence not yet implemented");
    return sequence;
  }

  /**
   * Reverse beat order
   */
  reverseSequence(sequence: SequenceData): SequenceData {
    const reversedBeats = [...sequence.beats].reverse();
    
    // Renumber beats after reversing
    const renumberedBeats = reversedBeats.map((beat, index) => ({
      ...beat,
      beatNumber: index + 1,
    }));

    return updateSequenceData(sequence, {
      beats: renumberedBeats,
      name: `${sequence.name} (Reversed)`,
    });
  }
}
