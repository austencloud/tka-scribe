/**
 * Share Module - InversifyJS Container Module
 * 
 * Binds share services for dependency injection.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { ShareService } from "../../../modules/build/share/services/implementations";
import { TYPES } from "../types";

export const shareModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // === SHARE SERVICES ===
    options.bind(TYPES.IShareService).to(ShareService);
  }
);
