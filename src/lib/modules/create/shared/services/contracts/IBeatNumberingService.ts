/**
 * Beat Numbering Service Interface
 *
 * Pure utility for managing beat numbers in sequences.
 */

import type { BeatData } from "$shared";

export interface IBeatNumberingService {
  /**
   * Renumber all beats sequentially starting from 1
   */
  renumberBeats(beats: BeatData[]): BeatData[];

  /**
   * Get the next beat number for a new beat
   */
  getNextBeatNumber(currentBeats: BeatData[]): number;

  /**
   * Validate that all beats have correct sequential numbering
   */
  validateBeatNumbering(beats: BeatData[]): boolean;

  /**
   * Find gaps in beat numbering (returns indices of incorrectly numbered beats)
   */
  findNumberingGaps(beats: BeatData[]): number[];
}
