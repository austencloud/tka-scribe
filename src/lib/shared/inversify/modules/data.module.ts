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
import { DataTransformer } from "../../application/services/implementations/DataTransformer";
import { TYPES } from "../types";
// Deep Ocean services moved to on-demand loading in BackgroundFactory
// Core Sequence Services (moved from createModule to Tier 1)
import { SequenceRepository } from "../../../features/create/shared/services/implementations/SequenceRepository";
import { SequenceDomainManager } from "../../../features/create/shared/services/implementations/SequenceDomainManager";
import { ReversalDetector } from "../../../features/create/shared/services/implementations/ReversalDetector";
import { SequenceImporter } from "../../../features/create/shared/services/implementations/SequenceImporter";
import { SequenceNormalizer } from "../../../features/compose/services/implementations/SequenceNormalizer";

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
    // ISequenceRepository and its dependencies are used across multiple modules
    // (create, explore, animate) so they must be in Tier 1 to be available early
    options.bind(TYPES.ISequenceRepository).to(SequenceRepository);
    options.bind(TYPES.ISequenceDomainManager).to(SequenceDomainManager);
    options.bind(TYPES.IReversalDetector).to(ReversalDetector);
    options.bind(TYPES.ISequenceImporter).to(SequenceImporter);
    // ISequenceNormalizer moved here - required by ISequenceRepository
    options
      .bind(TYPES.ISequenceNormalizer)
      .to(SequenceNormalizer);

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
