/**
 * Mirrored Rotated CAP Executor
 *
 * Executes the mirrored-rotated CAP (Circular Arrangement Pattern) by composing
 * two CAP operations sequentially:
 * 1. ROTATED: Apply strict rotation with user-selected slice size (halved or quartered)
 * 2. MIRRORED: Apply vertical mirroring to double the sequence again
 *
 * Examples:
 *
 * HALVED mode (16-count sequence):
 * - Generate 4 letters (16 ÷ 4)
 * - Rotation (halved) → 8 letters (4 × 2, returns to home)
 * - Mirroring → 16 letters (8 × 2)
 *
 * QUARTERED mode (16-count sequence):
 * - Generate 2 letters (16 ÷ 8)
 * - Rotation (quartered) → 8 letters (2 × 4, returns to home)
 * - Mirroring → 16 letters (8 × 2)
 *
 * IMPORTANT: Supports both halved and quartered slice sizes
 * IMPORTANT: End position for generation must match the rotation requirement
 */

import { inject, injectable } from "inversify";

import type { BeatData } from "$create/shared/workspace-panel";
import { TYPES } from "$shared/inversify/types";

import { SliceSize } from "../../domain/models/circular-models";
import type { ICAPExecutor } from "../contracts/ICAPExecutor";

@injectable()
export class MirroredRotatedCAPExecutor implements ICAPExecutor {
  constructor(
    @inject(TYPES.IStrictRotatedCAPExecutor)
    private readonly strictRotatedExecutor: ICAPExecutor,

    @inject(TYPES.IStrictMirroredCAPExecutor)
    private readonly strictMirroredExecutor: ICAPExecutor
  ) {}

  /**
   * Execute the mirrored-rotated CAP by composing rotation + mirroring
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

    // Step 2: Apply STRICT_MIRRORED to the rotated sequence
    // This always doubles the sequence using vertical mirroring
    // For example: 8 beats → 16 beats final
    const finalSequence = this.strictMirroredExecutor.executeCAP(
      rotatedSequence,
      SliceSize.HALVED // Not actually used by mirrored executor, but passed for consistency
    );

    return finalSequence;
  }
}
