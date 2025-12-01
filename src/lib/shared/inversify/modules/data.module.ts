import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { NightSkyCalculationService } from "../../background/night-sky/services/implementations/NightSkyCalculationService";
import { BackgroundConfigurationService } from "../../background/shared/services/implementations/BackgroundConfigurationService";
import { BackgroundManager } from "../../background/shared/services/implementations/BackgroundManager";
import { BackgroundPreLoader } from "../../background/shared/services/implementations/BackgroundPreloader";
import { BackgroundRenderingService } from "../../background/shared/services/implementations/BackgroundRenderingService";
import { CsvLoader } from "../../foundation/services/implementations/data/CsvLoader";
import { CSVParser } from "../../foundation/services/implementations/data/CsvParser";
import { EnumMapper } from "../../foundation/services/implementations/data/EnumMapper";
import { DexiePersistenceService } from "../../persistence";
import { PersistenceInitializationService } from "../../persistence/services/implementations/PersistenceInitializationService";
import { DataTransformer } from "../../pictograph";
import { TYPES } from "../types";
// Deep Ocean Background Services
import {
  BubblePhysics,
  MarineLifeAnimator,
  ParticleSystem,
  FishSpriteManager,
  OceanRenderer,
  LightRayCalculator,
} from "../../background/deep-ocean";
// Core Sequence Services (moved from createModule to Tier 1)
import { SequenceService } from "../../../features/create/shared/services/implementations/SequenceService";
import { SequenceDomainService } from "../../../features/create/shared/services/implementations/SequenceDomainService";
import { ReversalDetectionService } from "../../../features/create/shared/services/implementations/ReversalDetectionService";
import { SequenceImportService } from "../../../features/create/shared/services/implementations/SequenceImportService";

export const dataModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === DATA SERVICES ===
    // CsvLoader MUST be singleton - CSV cache needs to persist across all usages
    options.bind(TYPES.ICSVLoader).to(CsvLoader).inSingletonScope();
    options.bind(TYPES.ICSVParser).to(CSVParser);
    options.bind(TYPES.IDataTransformer).to(DataTransformer);
    options.bind(TYPES.IEnumMapper).to(EnumMapper);

    // === PERSISTENCE SERVICES ===
    options.bind(TYPES.IPersistenceService).to(DexiePersistenceService);
    options
      .bind(TYPES.IPersistenceInitializationService)
      .to(PersistenceInitializationService);

    // === CORE SEQUENCE SERVICES ===
    // ISequenceService and its dependencies are used across multiple modules
    // (create, explore, animate) so they must be in Tier 1 to be available early
    options.bind(TYPES.ISequenceService).to(SequenceService);
    options.bind(TYPES.ISequenceDomainService).to(SequenceDomainService);
    options.bind(TYPES.IReversalDetectionService).to(ReversalDetectionService);
    options.bind(TYPES.ISequenceImportService).to(SequenceImportService);

    // === BACKGROUND SERVICES ===
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

    // === DEEP OCEAN BACKGROUND SERVICES ===
    options.bind(TYPES.IBubblePhysics).to(BubblePhysics);
    options.bind(TYPES.IMarineLifeAnimator).to(MarineLifeAnimator);
    options.bind(TYPES.IParticleSystem).to(ParticleSystem);
    // FishSpriteManager MUST be singleton - sprite cache needs to persist across all usages
    options
      .bind(TYPES.IFishSpriteManager)
      .to(FishSpriteManager)
      .inSingletonScope();
    options.bind(TYPES.IOceanRenderer).to(OceanRenderer);
    options.bind(TYPES.ILightRayCalculator).to(LightRayCalculator);

    // Bind the orchestrator as the main IBackgroundSystem implementation for deep ocean
    // TODO: Update background system selection logic to use this for deep ocean themes
  }
);
