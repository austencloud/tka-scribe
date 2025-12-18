/**
 * Background Popularity Service Contract
 *
 * Tracks and provides real-time popularity counts for each background type.
 * Shows how many users are currently using each background.
 */

import type { BackgroundType } from "$lib/shared/background/shared/domain/enums/background-enums";

export type BackgroundPopularityCounts = Record<string, number>;

export interface IBackgroundPopularityService {
  /**
   * Get the current popularity counts for all backgrounds
   */
  getPopularityCounts(): Promise<BackgroundPopularityCounts>;

  /**
   * Subscribe to real-time popularity updates
   * @returns Unsubscribe function
   */
  subscribeToPopularity(
    callback: (counts: BackgroundPopularityCounts) => void
  ): Promise<() => void>;

  /**
   * Record a background change - decrements old, increments new
   * Called when a user changes their background preference
   */
  recordBackgroundChange(
    oldBackground: BackgroundType | string | undefined,
    newBackground: BackgroundType | string
  ): Promise<void>;

  /**
   * Initialize tracking for a new user (increment their initial background)
   */
  initializeUserBackground(background: BackgroundType | string): Promise<void>;
}
