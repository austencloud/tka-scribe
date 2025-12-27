/**
 * Community Module - InversifyJS DI Container Configuration
 *
 * Registers all community services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { ILeaderboardManager } from "../../community/services/contracts/ILeaderboardManager";
import type { IUserRepository } from "../../community/services/contracts/IUserRepository";
import type { IFollowingFeedProvider } from "$lib/features/dashboard/services/contracts/IFollowingFeedProvider";
import { LeaderboardManager } from "../../community/services/implementations/LeaderboardManager";
import { UserRepository } from "../../community/services/implementations/UserRepository";
import { FollowingFeedProvider } from "$lib/features/dashboard/services/implementations/FollowingFeedProvider";

export const communityModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Leaderboard Service
    options
      .bind<ILeaderboardManager>(TYPES.ILeaderboardManager)
      .to(LeaderboardManager)
      .inSingletonScope();

    // User Service (with follow functionality)
    options
      .bind<IUserRepository>(TYPES.IUserRepository)
      .to(UserRepository)
      .inSingletonScope();

    // Following Feed Service (dashboard widget)
    options
      .bind<IFollowingFeedProvider>(TYPES.IFollowingFeedProvider)
      .to(FollowingFeedProvider)
      .inSingletonScope();
  }
);
