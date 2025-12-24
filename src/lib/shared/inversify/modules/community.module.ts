/**
 * Community Module - InversifyJS DI Container Configuration
 *
 * Registers all community services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { ILeaderboardService } from "../../community/services/contracts/ILeaderboardService";
import type { IUserService } from "../../community/services/contracts/IUserService";
import type { IFollowingFeedService } from "$lib/features/dashboard/services/contracts/IFollowingFeedService";
import { LeaderboardService } from "../../community/services/implementations/LeaderboardService";
import { UserService } from "../../community/services/implementations/UserService";
import { FollowingFeedService } from "$lib/features/dashboard/services/implementations/FollowingFeedService";

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

    // Following Feed Service (dashboard widget)
    options
      .bind<IFollowingFeedService>(TYPES.IFollowingFeedService)
      .to(FollowingFeedService)
      .inSingletonScope();
  }
);
