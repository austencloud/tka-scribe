import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { ActManager } from "../../../features/write/services/implementations/ActManager";
import { MusicPlayer } from "../../../features/write/services/implementations/MusicPlayer";
import { TYPES } from "../types";

export const writeModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === WRITE TAB SERVICES ===
    options.bind(TYPES.IActManager).to(ActManager);
    options.bind(TYPES.IMusicPlayer).to(MusicPlayer);
  }
);
