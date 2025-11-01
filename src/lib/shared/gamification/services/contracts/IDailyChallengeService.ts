/**
 * Daily Challenge Service Interface
 *
 * Handles daily challenge generation, tracking, and completion.
 */

import type {
  DailyChallenge,
  UserChallengeProgress,
} from "../../domain/models";

export interface IDailyChallengeService {
  /**
   * Initialize the daily challenge system
   * Generates today's challenge if it doesn't exist
   */
  initialize(): Promise<void>;

  /**
   * Get today's daily challenge
   * Generates a new one if none exists
   */
  getTodayChallenge(): Promise<DailyChallenge>;

  /**
   * Get user's progress on today's challenge
   */
  getChallengeProgress(): Promise<UserChallengeProgress | null>;

  /**
   * Update progress on current daily challenge
   * Returns true if challenge was completed
   */
  updateChallengeProgress(
    progressDelta: number,
    metadata?: Record<string, any>
  ): Promise<{
    completed: boolean;
    progress: UserChallengeProgress;
  }>;

  /**
   * Mark today's challenge as complete
   * Awards XP automatically
   */
  completeChallenge(): Promise<{
    xpAwarded: number;
    challenge: DailyChallenge;
  }>;

  /**
   * Get challenge history (last N days)
   */
  getChallengeHistory(days?: number): Promise<
    Array<{
      challenge: DailyChallenge;
      progress: UserChallengeProgress | null;
    }>
  >;

  /**
   * Generate a new daily challenge for a specific date
   * Used internally and for debugging
   */
  generateChallengeForDate(date: Date): Promise<DailyChallenge>;

  /**
   * Check if user has completed today's challenge
   */
  isTodayChallengeComplete(): Promise<boolean>;

  /**
   * Get challenge completion stats
   */
  getChallengeStats(): Promise<{
    totalChallengesCompleted: number;
    currentStreak: number;
    longestStreak: number;
  }>;
}
