/**
 * Reversal Detection Service Contract
 *
 * Detects reversals between beats in sequences based on prop rotation direction changes.
 */

import type { BeatData, PictographData, SequenceData } from "$shared";

export interface ReversalInfo {
  blueReversal: boolean;
  redReversal: boolean;
}

export interface PictographWithReversals extends PictographData {
  blueReversal: boolean;
  redReversal: boolean;
}

export interface IReversalDetectionService {
  /**
   * Process a sequence and apply reversal detection to all beats
   * @param sequence The sequence to process
   * @returns The sequence with reversal flags applied to beats
   */
  processReversals(sequence: SequenceData): SequenceData;

  /**
   * Detect reversal for an option preview based on current sequence
   * This is used to show reversal indicators on options before they're selected
   * @param currentSequence The current sequence of beats
   * @param optionPictographData The option's pictograph data to check for reversals
   * @returns Reversal information for the option
   */
  detectReversalForOption(
    currentSequence: BeatData[],
    optionPictographData: PictographData
  ): ReversalInfo;

  /**
   * Detect reversals for multiple option pictographs at once
   * This is optimized for option picker display where we need to show reversals for all options
   * @param currentSequence The current sequence of pictographs
   * @param options The option pictographs to check for reversals
   * @returns Array of pictographs with reversal information attached
   */
  detectReversalsForOptions(
    currentSequence: PictographData[],
    options: PictographData[]
  ): PictographWithReversals[];
}
