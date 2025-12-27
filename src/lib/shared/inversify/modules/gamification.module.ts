/**
 * Gamification Module - InversifyJS DI Container Configuration
 *
 * Registers all gamification services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IAchievementManager } from "../../gamification/services/contracts/IAchievementManager";
import type { IDailyChallengeManager } from "../../gamification/services/contracts/IDailyChallengeManager";
import type { IWeeklyChallengeManager } from "../../gamification/services/contracts/IWeeklyChallengeManager";
import type { ISkillProgressionTracker } from "../../gamification/services/contracts/ISkillProgressionTracker";
import type { IChallengeCoordinator } from "../../gamification/services/contracts/IChallengeCoordinator";
import type { IGamificationNotifier } from "../../gamification/services/contracts/IGamificationNotifier";
import type { IStreakTracker } from "../../gamification/services/contracts/IStreakTracker";
import { AchievementManager } from "../../gamification/services/implementations/AchievementManager";
import { DailyChallengeManager } from "../../gamification/services/implementations/DailyChallengeManager";
import { WeeklyChallengeManager } from "../../gamification/services/implementations/WeeklyChallengeManager";
import { SkillProgressionTracker } from "../../gamification/services/implementations/SkillProgressionTracker";
import { ChallengeCoordinator } from "../../gamification/services/implementations/ChallengeCoordinator";
import { GamificationNotifier } from "../../gamification/services/implementations/GamificationNotifier";
import { StreakTracker } from "../../gamification/services/implementations/StreakTracker";

export const gamificationModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Notification Service (no dependencies, bind first)
    options
      .bind<IGamificationNotifier>(TYPES.IGamificationNotifier)
      .to(GamificationNotifier)
      .inSingletonScope();

    // Streak Service
    options
      .bind<IStreakTracker>(TYPES.IStreakTracker)
      .to(StreakTracker)
      .inSingletonScope();

    // Achievement Service (depends on GamificationNotifier)
    options
      .bind<IAchievementManager>(TYPES.IAchievementManager)
      .to(AchievementManager)
      .inSingletonScope();

    // Daily Challenge Service (depends on AchievementManager)
    options
      .bind<IDailyChallengeManager>(TYPES.IDailyChallengeManager)
      .to(DailyChallengeManager)
      .inSingletonScope();

    // Weekly Challenge Service (depends on AchievementManager)
    options
      .bind<IWeeklyChallengeManager>(TYPES.IWeeklyChallengeManager)
      .to(WeeklyChallengeManager)
      .inSingletonScope();

    // Skill Progression Service (depends on AchievementManager)
    options
      .bind<ISkillProgressionTracker>(TYPES.ISkillProgressionTracker)
      .to(SkillProgressionTracker)
      .inSingletonScope();

    // Challenge Coordinator (depends on all challenge services)
    options
      .bind<IChallengeCoordinator>(TYPES.IChallengeCoordinator)
      .to(ChallengeCoordinator)
      .inSingletonScope();
  }
);
