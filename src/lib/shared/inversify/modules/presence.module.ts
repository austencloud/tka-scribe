/**
 * Presence Module - DI Bindings
 *
 * Registers presence services with the InversifyJS container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IPresenceService } from "../../presence/services/contracts/IPresenceService";
import { PresenceService } from "../../presence/services/implementations/PresenceService";

export const presenceModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IPresenceService>(TYPES.IPresenceService)
      .to(PresenceService)
      .inSingletonScope();
  }
);
