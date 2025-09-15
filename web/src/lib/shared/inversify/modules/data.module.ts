import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

import { NightSkyCalculationService } from "../../background/night-sky/services/implementations/NightSkyCalculationService";
import { BackgroundConfigurationService } from "../../background/shared/services/implementations/BackgroundConfigurationService";
import { BackgroundManager } from "../../background/shared/services/implementations/BackgroundManager";
import { BackgroundPreloaderService } from "../../background/shared/services/implementations/BackgroundPreloaderService";
import { BackgroundRenderingService } from "../../background/shared/services/implementations/BackgroundRenderingService";
import { BackgroundService } from "../../background/shared/services/implementations/BackgroundService";
import { CsvLoader, CSVParser, EnumMapper } from "../../foundation";
import { DexiePersistenceService } from "../../persistence/services/implementations/DexiePersistenceService";
import { PersistenceInitializationService } from "../../persistence/services/implementations/PersistenceInitializationService";
import { DataTransformer } from "../../pictograph/shared/services/implementations/DataTransformer";
import { TYPES } from "../types";

export const dataModule = new ContainerModule(
  async (options: ContainerModuleLoadOptions) => {
    // === DATA SERVICES ===
    options.bind(TYPES.ICSVLoader).to(CsvLoader);
    options.bind(TYPES.ICSVParser).to(CSVParser);
    options.bind(TYPES.IDataTransformer).to(DataTransformer);
    options.bind(TYPES.IEnumMapper).to(EnumMapper);

    // === PERSISTENCE SERVICES ===
    options.bind(TYPES.IPersistenceService).to(DexiePersistenceService);
    options
      .bind(TYPES.IPersistenceInitializationService)
      .to(PersistenceInitializationService);

    // === BACKGROUND SERVICES ===
    options.bind(TYPES.IBackgroundService).to(BackgroundService);
    options.bind(TYPES.IBackgroundManager).to(BackgroundManager);
    options
      .bind(TYPES.IBackgroundRenderingService)
      .to(BackgroundRenderingService);
    options
      .bind(TYPES.IBackgroundPreloaderService)
      .to(BackgroundPreloaderService);
    options
      .bind(TYPES.IBackgroundConfigurationService)
      .to(BackgroundConfigurationService);
    options
      .bind(TYPES.INightSkyCalculationService)
      .to(NightSkyCalculationService);
  }
);
