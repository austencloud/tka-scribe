/**
 * Community Module - InversifyJS DI Container Configuration
 *
 * Registers all community services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";

import type { IEnhancedUserService } from "../../../modules/community/services/contracts/IEnhancedUserService";
import type { ILeaderboardService } from "../../../modules/community/services/contracts/ILeaderboardService";
import { EnhancedUserService } from "../../../modules/community/services/implementations/EnhancedUserService";
import { LeaderboardService } from "../../../modules/community/services/implementations/LeaderboardService";
import { TYPES } from "../types";

export const communityModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Leaderboard Service
    options
      .bind<ILeaderboardService>(TYPES.ILeaderboardService)
      .to(LeaderboardService)
      .inSingletonScope();

    // Enhanced User Service
    options
      .bind<IEnhancedUserService>(TYPES.IEnhancedUserService)
      .to(EnhancedUserService)
      .inSingletonScope();

    // TODO: Add CommunityStatsService when implemented
  }
);
