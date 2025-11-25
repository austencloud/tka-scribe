/**
 * Partial Sequence Generator Interface
 *
 * Generates partial sequences for circular mode (CAP preparation).
 */
import type { BeatData, GridPosition } from "$shared";
import type { GenerationOptions } from "../../../shared/domain/models/generate-models";
import type { SliceSize } from "../../domain/models/circular-models";

export interface IPartialSequenceGenerator {
  /**
   * Generate a partial sequence ending at a specific position
   * Used for circular mode CAP generation
   * @param startPos - Start grid position
   * @param endPos - Required end grid position
   * @param sliceSize - Halved or quartered
   * @param options - Generation options
   * @returns Promise resolving to partial sequence (start position + intermediate beats + final beat)
   */
  generatePartialSequence(
    startPos: GridPosition,
    endPos: GridPosition,
    sliceSize: SliceSize,
    options: GenerationOptions
  ): Promise<BeatData[]>;
}
