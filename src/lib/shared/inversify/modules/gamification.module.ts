/**
 * Gamification Module - InversifyJS DI Container Configuration
 *
 * Registers all gamification services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type {
  IAchievementService,
  IDailyChallengeService,
  IWeeklyChallengeService,
  ISkillProgressionService,
  IChallengeCoordinator,
  INotificationService,
  IStreakService,
} from "../../gamification/services/contracts";
import {
  AchievementService,
  DailyChallengeService,
  WeeklyChallengeService,
  SkillProgressionService,
  ChallengeCoordinator,
  NotificationService,
  StreakService,
} from "../../gamification/services/implementations";

export const gamificationModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Notification Service (no dependencies, bind first)
    options
      .bind<INotificationService>(TYPES.INotificationService)
      .to(NotificationService)
      .inSingletonScope();

    // Streak Service
    options
      .bind<IStreakService>(TYPES.IStreakService)
      .to(StreakService)
      .inSingletonScope();

    // Achievement Service (depends on NotificationService)
    options
      .bind<IAchievementService>(TYPES.IAchievementService)
      .to(AchievementService)
      .inSingletonScope();

    // Daily Challenge Service (depends on AchievementService)
    options
      .bind<IDailyChallengeService>(TYPES.IDailyChallengeService)
      .to(DailyChallengeService)
      .inSingletonScope();

    // Weekly Challenge Service (depends on AchievementService)
    options
      .bind<IWeeklyChallengeService>(TYPES.IWeeklyChallengeService)
      .to(WeeklyChallengeService)
      .inSingletonScope();

    // Skill Progression Service (depends on AchievementService)
    options
      .bind<ISkillProgressionService>(TYPES.ISkillProgressionService)
      .to(SkillProgressionService)
      .inSingletonScope();

    // Challenge Coordinator (depends on all challenge services)
    options
      .bind<IChallengeCoordinator>(TYPES.IChallengeCoordinator)
      .to(ChallengeCoordinator)
      .inSingletonScope();
  }
);
