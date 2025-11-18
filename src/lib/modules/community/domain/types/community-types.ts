/**
 * Community Module Types
 * Type definitions for the Community module
 */

export type CommunitySection = "leaderboards" | "creators" | "achievements" | "challenges";

export interface CommunityModuleProps {
  onNavigate?: (section: CommunitySection) => void;
}

export interface LeaderboardSegment<T = string> {
  value: T;
  label: string;
  icon: string;
}

export interface CreatorFilter {
  value: string;
  label: string;
}

export interface AchievementShowcaseView {
  value: string;
  label: string;
  icon: string;
}
