/**
 * Sequence Statistics Service Interface
 *
 * Pure calculation functions for sequence statistics and analysis.
 */

import type { SequenceData } from "$shared";

export interface ISequenceStatisticsService {
  /**
   * Generate word from beat letters
   */
  generateSequenceWord(sequence: SequenceData): string;

  /**
   * Calculate total duration of sequence
   */
  calculateSequenceDuration(sequence: SequenceData): number;

  /**
   * Get comprehensive sequence statistics
   */
  getSequenceStatistics(sequence: SequenceData): {
    totalBeats: number;
    filledBeats: number;
    emptyBeats: number;
    duration: number;
  };

  /**
   * Count beats with reversals
   */
  countReversals(sequence: SequenceData): {
    blueReversals: number;
    redReversals: number;
    totalReversals: number;
  };

  /**
   * Get average beat duration
   */
  getAverageBeatDuration(sequence: SequenceData): number;
}
