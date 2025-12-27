/**
 * Analytics Module - DI Bindings
 *
 * Registers analytics services with the InversifyJS container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IActivityLogger } from "../../analytics/services/contracts/IActivityLogger";
import type { ISessionTracker } from "../../analytics/services/contracts/ISessionTracker";
import { ActivityLogger } from "../../analytics/services/implementations/ActivityLogger";
import { SessionTracker } from "../../analytics/services/implementations/SessionTracker";

export const analyticsModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // SessionTracker must be registered first (ActivityLogger depends on it)
    options
      .bind<ISessionTracker>(TYPES.ISessionTracker)
      .to(SessionTracker)
      .inSingletonScope();

    options
      .bind<IActivityLogger>(TYPES.IActivityLogger)
      .to(ActivityLogger)
      .inSingletonScope();
  }
);
