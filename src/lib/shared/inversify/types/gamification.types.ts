/**
 * Gamification Service Type Identifiers
 *
 * Services for achievements, challenges, streaks, and progression.
 */

export const GamificationTypes = {
  IAchievementService: Symbol.for("IAchievementService"),
  IDailyChallengeService: Symbol.for("IDailyChallengeService"),
  IWeeklyChallengeService: Symbol.for("IWeeklyChallengeService"),
  ISkillProgressionService: Symbol.for("ISkillProgressionService"),
  IChallengeCoordinator: Symbol.for("IChallengeCoordinator"),
  INotificationService: Symbol.for("INotificationService"),
  IStreakService: Symbol.for("IStreakService"),
} as const;
