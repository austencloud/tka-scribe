import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Direct imports to avoid barrel exports
import { BeatDataConversionService } from "$lib/features/cap-labeler/services/implementations/BeatDataConversionService";
import { BeatPairAnalysisService } from "$lib/features/cap-labeler/services/implementations/BeatPairAnalysisService";
import { CAPDesignationService } from "$lib/features/cap-labeler/services/implementations/CAPDesignationService";
import { CAPDetectionService } from "$lib/features/cap-labeler/services/implementations/CAPDetectionService";
import { CAPLabelsFirebaseService } from "$lib/features/cap-labeler/services/implementations/CAPLabelsFirebaseService";
import { SequenceLoadingService } from "$lib/features/cap-labeler/services/implementations/SequenceLoadingService";
import { NavigationService } from "$lib/features/cap-labeler/services/implementations/NavigationService";
import { SequenceFeatureExtractor } from "$lib/features/cap-labeler/services/implementations/SequenceFeatureExtractor";
import { RuleBasedTagger } from "$lib/features/cap-labeler/services/implementations/RuleBasedTagger";
import { PolyrhythmicDetectionService } from "$lib/features/cap-labeler/services/implementations/PolyrhythmicDetectionService";
import { CAPLabelerTypes } from "../types/cap-labeler.types";

export const capLabelerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === CAP LABELER SERVICES ===
    options
      .bind(CAPLabelerTypes.IBeatDataConversionService)
      .to(BeatDataConversionService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.IBeatPairAnalysisService)
      .to(BeatPairAnalysisService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ICAPDesignationService)
      .to(CAPDesignationService)
      .inSingletonScope();

    // PolyrhythmicDetectionService must be registered BEFORE CAPDetectionService
    // since CAPDetectionService depends on it
    options
      .bind(CAPLabelerTypes.IPolyrhythmicDetectionService)
      .to(PolyrhythmicDetectionService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ICAPLabelerDetectionService)
      .to(CAPDetectionService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ICAPLabelsFirebaseService)
      .to(CAPLabelsFirebaseService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ISequenceLoadingService)
      .to(SequenceLoadingService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.INavigationService)
      .to(NavigationService)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ISequenceFeatureExtractor)
      .to(SequenceFeatureExtractor)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.IRuleBasedTagger)
      .to(RuleBasedTagger)
      .inSingletonScope();
  }
);
