/**
 * Admin Module - InversifyJS DI Container Configuration
 *
 * Registers all admin services with the dependency injection container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { ISystemStateService } from "../../../features/admin/services/contracts/ISystemStateService";
import type { IAuditLogService } from "../../../features/admin/services/contracts/IAuditLogService";
import type { IAdminChallengeService } from "../../../features/admin/services/contracts/IAdminChallengeService";
import type { IAnalyticsDataService } from "../../../features/admin/services/contracts/IAnalyticsDataService";
import type { IAnnouncementService } from "../../../features/admin/services/contracts/IAnnouncementService";
import type { IUserActivityService } from "../../../features/admin/services/contracts/IUserActivityService";
import { SystemStateService } from "../../../features/admin/services/implementations/SystemStateService";
import { AuditLogService } from "../../../features/admin/services/implementations/AuditLogService";
import { AdminChallengeService } from "../../../features/admin/services/implementations/AdminChallengeService";
import { AnalyticsDataService } from "../../../features/admin/services/implementations/AnalyticsDataService";
import { AnnouncementService } from "../../../features/admin/services/implementations/AnnouncementService";
import { UserActivityService } from "../../../features/admin/services/implementations/UserActivityService";

export const adminModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // System State Service (foundation for all admin views)
    options
      .bind<ISystemStateService>(TYPES.ISystemStateService)
      .to(SystemStateService)
      .inSingletonScope();

    // Audit Log Service (accountability and debugging)
    options
      .bind<IAuditLogService>(TYPES.IAuditLogService)
      .to(AuditLogService)
      .inSingletonScope();

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

    // Announcement Service
    options
      .bind<IAnnouncementService>(TYPES.IAnnouncementService)
      .to(AnnouncementService)
      .inSingletonScope();

    // User Activity Service (admin user monitoring)
    options
      .bind<IUserActivityService>(TYPES.IUserActivityService)
      .to(UserActivityService)
      .inSingletonScope();
  }
);
