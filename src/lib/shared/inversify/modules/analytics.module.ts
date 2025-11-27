/**
 * Analytics Module - DI Bindings
 *
 * Registers analytics services with the InversifyJS container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IActivityLogService } from "$shared/analytics";
import { ActivityLogService } from "$shared/analytics";

export const analyticsModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IActivityLogService>(TYPES.IActivityLogService)
      .to(ActivityLogService)
      .inSingletonScope();
  }
);
