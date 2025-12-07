/**
 * Gamification Module - InversifyJS DI Container Configuration
 *
 * Registers all gamification services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IAchievementService } from '../../gamification/services/contracts/IAchievementService';
import type { IDailyChallengeService } from '../../gamification/services/contracts/IDailyChallengeService';
import type { IWeeklyChallengeService } from '../../gamification/services/contracts/IWeeklyChallengeService';
import type { ISkillProgressionService } from '../../gamification/services/contracts/ISkillProgressionService';
import type { IChallengeCoordinator } from '../../gamification/services/contracts/IChallengeCoordinator';
import type { INotificationService } from '../../gamification/services/contracts/INotificationService';
import type { IStreakService } from '../../gamification/services/contracts/IStreakService';
import { AchievementService } from '../../gamification/services/implementations/AchievementService';
import { DailyChallengeService } from '../../gamification/services/implementations/DailyChallengeService';
import { WeeklyChallengeService } from '../../gamification/services/implementations/WeeklyChallengeService';
import { SkillProgressionService } from '../../gamification/services/implementations/SkillProgressionService';
import { ChallengeCoordinator } from '../../gamification/services/implementations/ChallengeCoordinator';
import { NotificationService } from '../../gamification/services/implementations/NotificationService';
import { StreakService } from '../../gamification/services/implementations/StreakService';

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
