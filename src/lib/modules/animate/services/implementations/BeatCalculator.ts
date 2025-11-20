/**
 * Beat Calculation Service
 *
 * Focused service for beat indexing and progress calculations.
 * Single responsibility: Beat timing and progress calculations.
 */

import type { BeatData } from "$shared";
import { injectable } from "inversify";
import type { BeatCalculationResult, IBeatCalculator } from "../contracts";

@injectable()
export class BeatCalculator implements IBeatCalculator {
  /**
   * Calculate current beat index and progress from animation time
   * EXACT LOGIC FROM STANDALONE ANIMATOR
   */
  calculateBeatState(
    currentBeat: number,
    beats: readonly BeatData[],
    totalBeats: number
  ): BeatCalculationResult {
    // Validate inputs
    if (beats.length === 0 || totalBeats === 0) {
      return {
        currentBeatIndex: 0,
        beatProgress: 0,
        currentBeatData: beats[0]!,
        isValid: false,
      };
    }

    // ✅ PURE DOMAIN LOGIC - Direct beat access!
    const clampedBeat = Math.max(0, Math.min(currentBeat, totalBeats));
    const currentBeatIndex = Math.floor(
      clampedBeat === totalBeats ? totalBeats - 1 : clampedBeat
    );
    const beatProgress =
      clampedBeat === totalBeats ? 1.0 : clampedBeat - currentBeatIndex;

    const currentBeatData = beats[currentBeatIndex]!;

    return {
      currentBeatIndex,
      beatProgress,
      currentBeatData,
      isValid: true,
    };
  }

  /**
   * Validate beat data array
   */
  validateBeats(beats: readonly BeatData[]): boolean {
    return beats.length > 0 && beats.every((beat) => beat.beatNumber >= 0);
  }

  /**
   * Get beat by index with bounds checking
   */
  getBeatSafely(beats: readonly BeatData[], index: number): BeatData | null {
    if (index < 0 || index >= beats.length) {
      return null;
    }
    return beats[index] ?? null;
  }

  /**
   * Calculate total duration of sequence
   */
  calculateTotalDuration(beats: readonly BeatData[]): number {
    if (beats.length === 0) {
      return 0;
    }
    return beats.reduce((total, beat) => total + beat.duration, 0);
  }

  /**
   * Find beat by beat number
   */
  findBeatByNumber(
    beats: readonly BeatData[],
    beatNumber: number
  ): BeatData | null {
    return beats.find((beat) => beat.beatNumber === beatNumber) ?? null;
  }
}
