/**
 * Reversal Detection Service Contract
 *
 * Detects reversals between beats in sequences based on prop rotation direction changes.
 */

import type { BeatData, PictographData, SequenceData } from "$shared";

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
  ): { blueReversal: boolean; redReversal: boolean };
}
