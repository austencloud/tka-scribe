import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { NightSkyCalculationService } from "../../background/night-sky/services/implementations/NightSkyCalculationService";
import { BackgroundConfigurationService } from "../../background/shared/services/implementations/BackgroundConfigurationService";
import { BackgroundManager } from "../../background/shared/services/implementations/BackgroundManager";
import { BackgroundPreLoader } from "../../background/shared/services/implementations/BackgroundPreloader";
import { BackgroundRenderingService } from "../../background/shared/services/implementations/BackgroundRenderingService";
import { BackgroundService } from "../../background/shared/services/implementations/BackgroundService";
import { CsvLoader } from "../../foundation/services/implementations/data/CsvLoader";
import { CSVParser } from "../../foundation/services/implementations/data/CsvParser";
import { EnumMapper } from "../../foundation/services/implementations/data/EnumMapper";
import { DexiePersistenceService } from "../../persistence";
import { PersistenceInitializationService } from "../../persistence/services/implementations/PersistenceInitializationService";
import { DataTransformer } from "../../pictograph";
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
    options.bind(TYPES.IBackgroundPreloader).to(BackgroundPreLoader);
    options
      .bind(TYPES.IBackgroundConfigurationService)
      .to(BackgroundConfigurationService);
    options
      .bind(TYPES.INightSkyCalculationService)
      .to(NightSkyCalculationService);
  }
);
