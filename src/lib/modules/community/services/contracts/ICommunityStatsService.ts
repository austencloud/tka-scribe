/**
 * ICommunityStatsService
 * Service contract for community-wide statistics and achievement showcases
 */

import type {
  AchievementShowcase,
  AchievementShowcaseQueryOptions,
  CommunityStats,
} from "../../domain/models/community-stats-models";

export interface ICommunityStatsService {
  /**
   * Get aggregate community statistics
   */
  getCommunityStats(): Promise<CommunityStats>;

  /**
   * Get achievement showcase data
   */
  getAchievementShowcase(
    options: AchievementShowcaseQueryOptions
  ): Promise<AchievementShowcase[]>;

  /**
   * Get rarest achievements (lowest unlock rate)
   */
  getRarestAchievements(limit?: number): Promise<AchievementShowcase[]>;

  /**
   * Get recently unlocked achievements across the community
   */
  getRecentlyUnlockedAchievements(
    limit?: number
  ): Promise<AchievementShowcase[]>;

  /**
   * Get achievement unlock statistics for a specific achievement
   */
  getAchievementStats(achievementId: string): Promise<AchievementShowcase>;

  /**
   * Subscribe to real-time community stats updates
   */
  subscribeToCommunityStats(
    callback: (stats: CommunityStats) => void
  ): () => void;
}
