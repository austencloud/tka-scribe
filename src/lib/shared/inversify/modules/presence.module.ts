/**
 * Presence Module - DI Bindings
 *
 * Registers presence services with the InversifyJS container.
 */

import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";
import type { IPresenceTracker } from "../../presence/services/contracts/IPresenceTracker";
import { PresenceTracker } from "../../presence/services/implementations/PresenceTracker";

export const presenceModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind<IPresenceTracker>(TYPES.IPresenceTracker)
      .to(PresenceTracker)
      .inSingletonScope();
  }
);
