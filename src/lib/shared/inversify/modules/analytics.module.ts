/**
 * Analytics Module - DI Bindings
 *
 * Registers analytics services with the InversifyJS container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IActivityLogService } from "../../analytics/services/contracts/IActivityLogService";
import type { ISessionTrackingService } from "../../analytics/services/contracts/ISessionTrackingService";
import { ActivityLogService } from "../../analytics/services/implementations/ActivityLogService";
import { SessionTrackingService } from "../../analytics/services/implementations/SessionTrackingService";

export const analyticsModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // SessionTrackingService must be registered first (ActivityLogService depends on it)
    options
      .bind<ISessionTrackingService>(TYPES.ISessionTrackingService)
      .to(SessionTrackingService)
      .inSingletonScope();

    options
      .bind<IActivityLogService>(TYPES.IActivityLogService)
      .to(ActivityLogService)
      .inSingletonScope();
  }
);
