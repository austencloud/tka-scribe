/**
 * Analytics Module - DI Bindings
 *
 * Registers analytics services with the InversifyJS container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IActivityLogService } from "../../analytics/services/contracts/IActivityLogService";
import { ActivityLogService } from "../../analytics/services/implementations/ActivityLogService";

export const analyticsModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IActivityLogService>(TYPES.IActivityLogService)
      .to(ActivityLogService)
      .inSingletonScope();
  }
);
