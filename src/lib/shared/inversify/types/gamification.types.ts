/**
 * Gamification Service Type Identifiers
 *
 * Services for achievements, challenges, streaks, and progression.
 */

export const GamificationTypes = {
  IAchievementManager: Symbol.for("IAchievementManager"),
  IDailyChallengeManager: Symbol.for("IDailyChallengeManager"),
  IWeeklyChallengeManager: Symbol.for("IWeeklyChallengeManager"),
  ISkillProgressionTracker: Symbol.for("ISkillProgressionTracker"),
  IChallengeCoordinator: Symbol.for("IChallengeCoordinator"),
  IGamificationNotifier: Symbol.for("IGamificationNotifier"),
  IStreakTracker: Symbol.for("IStreakTracker"),
} as const;
