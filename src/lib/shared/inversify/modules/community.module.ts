/**
 * Community Module - InversifyJS DI Container Configuration
 *
 * Registers all community services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { ILeaderboardService } from "../../../features/community/services/contracts/ILeaderboardService";
import type { IUserService } from "../../../features/community/services/contracts/IUserService";
import { LeaderboardService } from "../../../features/community/services/implementations/LeaderboardService";
import { UserService } from "../../../features/community/services/implementations/UserService";

export const communityModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Leaderboard Service
    options
      .bind<ILeaderboardService>(TYPES.ILeaderboardService)
      .to(LeaderboardService)
      .inSingletonScope();

    // User Service (with follow functionality)
    options
      .bind<IUserService>(TYPES.IUserService)
      .to(UserService)
      .inSingletonScope();

    // TODO: Add CommunityStatsService when implemented
  }
);
