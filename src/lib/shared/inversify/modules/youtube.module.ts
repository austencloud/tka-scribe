/**
 * YouTube Module
 *
 * Inversify DI module for YouTube audio services.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { YouTubeSearchService } from "../../../features/compose/compose/phases/audio/youtube/services/implementations/YouTubeSearchService";
import { YouTubeAudioService } from "../../../features/compose/compose/phases/audio/youtube/services/implementations/YouTubeAudioService";
import { YouTubeTypes } from "../types";

/**
 * YouTube DI module
 */
export const youtubeModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    options
      .bind(YouTubeTypes.IYouTubeSearchService)
      .to(YouTubeSearchService)
      .inSingletonScope();

    options
      .bind(YouTubeTypes.IYouTubeAudioService)
      .to(YouTubeAudioService)
      .inSingletonScope();
  }
);
