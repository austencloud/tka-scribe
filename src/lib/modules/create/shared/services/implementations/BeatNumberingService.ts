/**
 * Beat Numbering Service
 *
 * Pure utility for managing beat numbers in sequences.
 * All functions are pure - no side effects, just transformations.
 */

import { injectable } from "inversify";

import type { BeatData } from "$shared";

import type { IBeatNumberingService } from "../contracts/IBeatNumberingService";

@injectable()
export class BeatNumberingService implements IBeatNumberingService {
  /**
   * Renumber all beats sequentially starting from 1
   */
  renumberBeats(beats: BeatData[]): BeatData[] {
    return beats.map((beat, index) => ({
      ...beat,
      beatNumber: index + 1,
    }));
  }

  /**
   * Get the next beat number for a new beat
   */
  getNextBeatNumber(currentBeats: BeatData[]): number {
    return currentBeats.length + 1;
  }

  /**
   * Validate that all beats have correct sequential numbering
   */
  validateBeatNumbering(beats: BeatData[]): boolean {
    return beats.every((beat, index) => beat.beatNumber === index + 1);
  }

  /**
   * Find gaps in beat numbering (returns indices of incorrectly numbered beats)
   */
  findNumberingGaps(beats: BeatData[]): number[] {
    const gaps: number[] = [];
    beats.forEach((beat, index) => {
      if (beat.beatNumber !== index + 1) {
        gaps.push(index);
      }
    });
    return gaps;
  }
}
