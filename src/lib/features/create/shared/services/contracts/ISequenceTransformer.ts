/**
 * Sequence Transformation Service Interface
 *
 * Pure transformation functions for sequences.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

export interface ISequenceTransformer {
  /**
   * Clear all beats in a sequence (make them blank)
   */
  clearSequence(sequence: SequenceData): SequenceData;

  /**
   * Duplicate a sequence with new IDs
   */
  duplicateSequence(sequence: SequenceData, newName?: string): SequenceData;

  /**
   * Mirror sequence (reverse movement and rotation patterns)
   */
  mirrorSequence(sequence: SequenceData): SequenceData;

  /**
   * Flip sequence vertically (flip north/south)
   * - Flips all positions using horizontal mirror map
   * - Flips all locations (north ↔ south)
   * - Reverses rotation directions (cw ↔ ccw)
   * - Grid mode stays the same
   */
  flipSequence(sequence: SequenceData): SequenceData;

  /**
   * Invert sequence rotation directions and motion types
   * - Flips all rotation directions (cw ↔ ccw)
   * - Flips all motion types (PRO ↔ ANTI)
   * - Positions and locations stay the same
   * - Looks up new letters based on changed rotation directions and motion types
   * - Changes the actual letters of the sequence
   */
  invertSequence(sequence: SequenceData): Promise<SequenceData>;

  /**
   * Swap blue and red colors (reversal flags)
   */
  swapColors(sequence: SequenceData): SequenceData;

  /**
   * Rotate sequence positions
   */
  rotateSequence(sequence: SequenceData, rotationAmount: number): SequenceData;

  /**
   * Rewind sequence (play backwards)
   * - Creates new start position from final beat's end state
   * - Rewinds beat order and transforms each beat
   * - Swaps positions, locations, orientations; flips rotation direction
   * - Looks up correct letters from pictograph dataset based on rewound motion configuration
   */
  rewindSequence(sequence: SequenceData): Promise<SequenceData>;

  /**
   * Shift the start position of a sequence
   * - For circular: rotates beats so target beat's end becomes new start
   * - For non-circular: truncates beats before target
   */
  shiftStartPosition(
    sequence: SequenceData,
    targetBeatNumber: number
  ): SequenceData;
}
