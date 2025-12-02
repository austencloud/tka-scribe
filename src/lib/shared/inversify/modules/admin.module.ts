/**
 * Admin Module - InversifyJS DI Container Configuration
 *
 * Registers all admin services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IAdminChallengeService } from "../../../features/admin/services/contracts/IAdminChallengeService";
import type { IAnalyticsDataService } from "../../../features/admin/services/contracts/IAnalyticsDataService";
import { AdminChallengeService } from "../../../features/admin/services/implementations/AdminChallengeService";
import { AnalyticsDataService } from "../../../features/admin/services/implementations/AnalyticsDataService";

export const adminModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Admin Challenge Service
    options
      .bind<IAdminChallengeService>(TYPES.IAdminChallengeService)
      .to(AdminChallengeService)
      .inSingletonScope();

    // Analytics Data Service
    options
      .bind<IAnalyticsDataService>(TYPES.IAnalyticsDataService)
      .to(AnalyticsDataService)
      .inSingletonScope();
  }
);
