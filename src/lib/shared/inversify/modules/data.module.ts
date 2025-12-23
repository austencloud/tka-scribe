import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
// NightSkyCalculationService moved to on-demand loading in BackgroundFactory
import { BackgroundConfigurationService } from "../../background/shared/services/implementations/BackgroundConfigurationService";
import { BackgroundManager } from "../../background/shared/services/implementations/BackgroundManager";
import { BackgroundPreLoader } from "../../background/shared/services/implementations/BackgroundPreloader";
import { BackgroundRenderingService } from "../../background/shared/services/implementations/BackgroundRenderingService";
import { CsvLoader } from "../../foundation/services/implementations/data/CsvLoader";
import { CSVParser } from "../../foundation/services/implementations/data/CsvParser";
import { EnumMapper } from "../../foundation/services/implementations/data/EnumMapper";
import { DexiePersistenceService } from "../../persistence/services/implementations/DexiePersistenceService";
import { PersistenceInitializationService } from "../../persistence/services/implementations/PersistenceInitializationService";
import { DataTransformer } from "../../pictograph/shared/services/implementations/DataTransformer";
import { TYPES } from "../types";
// Deep Ocean services moved to on-demand loading in BackgroundFactory
// Core Sequence Services (moved from createModule to Tier 1)
import { SequenceService } from "../../../features/create/shared/services/implementations/SequenceService";
import { SequenceDomainService } from "../../../features/create/shared/services/implementations/SequenceDomainService";
import { ReversalDetectionService } from "../../../features/create/shared/services/implementations/ReversalDetectionService";
import { SequenceImportService } from "../../../features/create/shared/services/implementations/SequenceImportService";
import { SequenceNormalizationService } from "../../../features/compose/services/implementations/SequenceNormalizationService";

export const dataModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === DATA SERVICES ===
    // CsvLoader MUST be singleton - CSV cache needs to persist across all usages
    options.bind(TYPES.ICSVLoader).to(CsvLoader).inSingletonScope();
    options.bind(TYPES.ICSVParser).to(CSVParser);
    options.bind(TYPES.IDataTransformer).to(DataTransformer);
    options.bind(TYPES.IEnumMapper).to(EnumMapper);

    // === PERSISTENCE SERVICES ===
    // DexiePersistenceService MUST be singleton - database connection and state must persist
    options
      .bind(TYPES.IPersistenceService)
      .to(DexiePersistenceService)
      .inSingletonScope();
    options
      .bind(TYPES.IPersistenceInitializationService)
      .to(PersistenceInitializationService)
      .inSingletonScope();

    // === CORE SEQUENCE SERVICES ===
    // ISequenceService and its dependencies are used across multiple modules
    // (create, explore, animate) so they must be in Tier 1 to be available early
    options.bind(TYPES.ISequenceService).to(SequenceService);
    options.bind(TYPES.ISequenceDomainService).to(SequenceDomainService);
    options.bind(TYPES.IReversalDetectionService).to(ReversalDetectionService);
    options.bind(TYPES.ISequenceImportService).to(SequenceImportService);
    // ISequenceNormalizationService moved here - required by ISequenceService
    options
      .bind(TYPES.ISequenceNormalizationService)
      .to(SequenceNormalizationService);

    // === BACKGROUND SERVICES ===
    options.bind(TYPES.IBackgroundManager).to(BackgroundManager);
    options
      .bind(TYPES.IBackgroundRenderingService)
      .to(BackgroundRenderingService);
    options.bind(TYPES.IBackgroundPreloader).to(BackgroundPreLoader);
    options
      .bind(TYPES.IBackgroundConfigurationService)
      .to(BackgroundConfigurationService);

    // Night Sky and Deep Ocean services are loaded on-demand in BackgroundFactory
    // when their respective background types are selected
  }
);
