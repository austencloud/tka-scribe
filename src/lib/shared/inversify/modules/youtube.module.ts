/**
 * Audio Module
 *
 * Inversify DI module for audio library services.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { AudioLibraryService } from "../../../features/compose/compose/phases/audio/library/services/implementations/AudioLibraryService";
import { AudioStorageService } from "../../../features/compose/compose/phases/audio/library/services/implementations/AudioStorageService";
import { AudioTypes } from "../types/youtube.types";

/**
 * Audio DI module
 */
export const audioModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind(AudioTypes.IAudioLibraryService)
      .to(AudioLibraryService)
      .inSingletonScope();

    options
      .bind(AudioTypes.IAudioStorageService)
      .to(AudioStorageService)
      .inSingletonScope();
  }
);

// Legacy export for backwards compatibility
export const youtubeModule = audioModule;
