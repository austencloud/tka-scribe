/**
 * Analytics Data Service Interface
 *
 * Provides methods for fetching analytics data from Firebase
 */

export interface SummaryMetrics {
  totalUsers: number;
  activeToday: number;
  sequencesCreated: number;
  challengesCompleted: number;
  // Previous period for comparison
  previousTotalUsers: number;
  previousActiveToday: number;
  previousSequencesCreated: number;
  previousChallengesCompleted: number;
}

export interface UserActivityPoint {
  date: string;
  activeUsers: number;
}

export interface ContentStatistics {
  totalSequences: number;
  publicSequences: number;
  totalViews: number;
  totalShares: number;
}

export interface TopSequenceData {
  id: string;
  name: string;
  word: string;
  views: number;
  creator: string;
}

export interface EngagementMetrics {
  challengeParticipants: number;
  achievementsUnlocked: number;
  activeStreaks: number;
  totalXPEarned: number;
  totalUsers: number;
  totalAchievementsPossible: number;
}

export interface AnalyticsTimeRange {
  days: number;
  startDate: Date;
  endDate: Date;
}

export interface IAnalyticsDataService {
  /**
   * Get summary metrics (total users, active users, etc.)
   */
  getSummaryMetrics(timeRange: AnalyticsTimeRange): Promise<SummaryMetrics>;

  /**
   * Get user activity over time
   */
  getUserActivity(timeRange: AnalyticsTimeRange): Promise<UserActivityPoint[]>;

  /**
   * Get content statistics
   */
  getContentStatistics(): Promise<ContentStatistics>;

  /**
   * Get top sequences by views
   */
  getTopSequences(limit: number): Promise<TopSequenceData[]>;

  /**
   * Get engagement metrics
   */
  getEngagementMetrics(): Promise<EngagementMetrics>;
}
