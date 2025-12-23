/**
 * Mirrored Rotated Inverted CAP Executor
 *
 * Executes the mirrored-rotated-complementary CAP (Continuous Assembly Pattern) by composing
 * THREE CAP operations sequentially:
 * 1. ROTATED: Apply strict rotation with user-selected slice size (halved or quartered)
 * 2. INVERTED MIRRORED: Apply vertical mirroring + complementary transformation
 *    - Letters are flipped (complementary effect)
 *    - Motion types are flipped (PRO ↔ ANTI) (complementary effect)
 *    - Locations are mirrored vertically (mirrored effect)
 *    - **Rotation directions STAY THE SAME** (both transformations flip rotation, so they CANCEL OUT)
 *
 * Examples:
 *
 * HALVED mode (16-count sequence):
 * - Generate 4 letters (16 ÷ 4)
 * - Rotation (halved) → 8 letters (4 × 2, returns to home)
 * - Inverted Mirroring → 16 letters (8 × 2, with flipped motion types and letters)
 *
 * QUARTERED mode (16-count sequence):
 * - Generate 2 letters (16 ÷ 8)
 * - Rotation (quartered) → 8 letters (2 × 4, returns to home)
 * - Inverted Mirroring → 16 letters (8 × 2, with flipped motion types and letters)
 *
 * IMPORTANT: Supports both halved and quartered slice sizes
 * IMPORTANT: End position for generation must match the rotation requirement
 * IMPORTANT: After rotation, sequence returns to home, which is valid for complementary mirror
 */

import { inject, injectable } from "inversify";

import { TYPES } from "$lib/shared/inversify/types";

import { SliceSize } from "../../domain/models/circular-models";
import type { ICAPExecutor } from "../contracts/ICAPExecutor";
import type { BeatData } from "../../../../shared/domain/models/BeatData";

@injectable()
export class MirroredRotatedInvertedCAPExecutor implements ICAPExecutor {
  constructor(
    @inject(TYPES.IStrictRotatedCAPExecutor)
    private readonly strictRotatedExecutor: ICAPExecutor,

    @inject(TYPES.IMirroredInvertedCAPExecutor)
    private readonly mirroredInvertedExecutor: ICAPExecutor
  ) {}

  /**
   * Execute the mirrored-rotated-complementary CAP by composing rotation + complementary mirroring
   *
   * @param sequence - The partial sequence to complete (must include start position at index 0)
   * @param sliceSize - The slice size for rotation (halved or quartered)
   * @returns The complete circular sequence with all beats
   */
  executeCAP(sequence: BeatData[], sliceSize: SliceSize): BeatData[] {
    // Step 1: Apply STRICT_ROTATED with user-selected slice size
    // HALVED: doubles the sequence (e.g., 4 beats → 8 beats)
    // QUARTERED: quadruples the sequence (e.g., 2 beats → 8 beats)
    // Returns to home position in both cases
    const rotatedSequence = this.strictRotatedExecutor.executeCAP(
      sequence,
      sliceSize
    );

    // Step 2: Apply MIRRORED_INVERTED to the rotated sequence
    // This doubles the sequence using complementary mirroring:
    // - Flips letters (A ↔ B)
    // - Flips motion types (PRO ↔ ANTI)
    // - Mirrors locations vertically
    // - Keeps rotation directions (both flips cancel out)
    // For example: 8 beats → 16 beats final
    const finalSequence = this.mirroredInvertedExecutor.executeCAP(
      rotatedSequence,
      SliceSize.HALVED // Not actually used by complementary executor, but passed for consistency
    );

    return finalSequence;
  }
}
