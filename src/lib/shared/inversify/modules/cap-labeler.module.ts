import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Direct imports to avoid barrel exports
import { BeatDataConverter } from "$lib/features/cap-labeler/services/implementations/BeatDataConverter";
import { BeatPairAnalyzer } from "$lib/features/cap-labeler/services/implementations/BeatPairAnalyzer";
import { CAPDesignator } from "$lib/features/cap-labeler/services/implementations/CAPDesignator";
import { CAPDetector } from "$lib/features/cap-labeler/services/implementations/CAPDetector";
import { CAPLabelsFirebaseRepository } from "$lib/features/cap-labeler/services/implementations/CAPLabelsFirebaseRepository";
import { SequenceLoader } from "$lib/features/cap-labeler/services/implementations/SequenceLoader";
import { Navigator } from "$lib/features/cap-labeler/services/implementations/Navigator";
import { SequenceFeatureExtractor } from "$lib/features/cap-labeler/services/implementations/SequenceFeatureExtractor";
import { RuleBasedTagger } from "$lib/features/cap-labeler/services/implementations/RuleBasedTagger";
import { PolyrhythmicDetector } from "$lib/features/cap-labeler/services/implementations/PolyrhythmicDetector";
import { LayeredPathDetector } from "$lib/features/cap-labeler/services/implementations/LayeredPathDetector";

// Comparison services
import { RotationComparer } from "$lib/features/cap-labeler/services/implementations/comparison/RotationComparer";
import { ReflectionComparer } from "$lib/features/cap-labeler/services/implementations/comparison/ReflectionComparer";
import { SwapInvertComparer } from "$lib/features/cap-labeler/services/implementations/comparison/SwapInvertComparer";
import { BeatComparisonOrchestrator } from "$lib/features/cap-labeler/services/implementations/comparison/BeatComparisonOrchestrator";

// Analysis and formatting services
import { TransformationAnalyzer } from "$lib/features/cap-labeler/services/implementations/TransformationAnalyzer";
import { CandidateFormatter } from "$lib/features/cap-labeler/services/implementations/CandidateFormatter";

import { CAPLabelerTypes } from "../types/cap-labeler.types";

export const capLabelerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === CAP LABELER SERVICES ===
    options
      .bind(CAPLabelerTypes.IBeatDataConverter)
      .to(BeatDataConverter)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.IBeatPairAnalyzer)
      .to(BeatPairAnalyzer)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ICAPDesignator)
      .to(CAPDesignator)
      .inSingletonScope();

    // PolyrhythmicDetector must be registered BEFORE CAPDetector
    // since CAPDetector depends on it
    options
      .bind(CAPLabelerTypes.IPolyrhythmicDetector)
      .to(PolyrhythmicDetector)
      .inSingletonScope();

    // LayeredPathDetector - analyzes individual hand path periodicity
    options
      .bind(CAPLabelerTypes.ILayeredPathDetector)
      .to(LayeredPathDetector)
      .inSingletonScope();

    // === COMPARISON SERVICES ===
    // These must be registered BEFORE CAPDetector
    // CandidateFormatter has no dependencies - register first
    options
      .bind(CAPLabelerTypes.ICandidateFormatter)
      .to(CandidateFormatter)
      .inSingletonScope();

    // Individual comparison services (no dependencies)
    options
      .bind(CAPLabelerTypes.IRotationComparer)
      .to(RotationComparer)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.IReflectionComparer)
      .to(ReflectionComparer)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ISwapInvertComparer)
      .to(SwapInvertComparer)
      .inSingletonScope();

    // BeatComparisonOrchestrator depends on individual comparison services + formatting
    options
      .bind(CAPLabelerTypes.IBeatComparisonOrchestrator)
      .to(BeatComparisonOrchestrator)
      .inSingletonScope();

    // TransformationAnalyzer depends on CandidateFormatter
    options
      .bind(CAPLabelerTypes.ITransformationAnalyzer)
      .to(TransformationAnalyzer)
      .inSingletonScope();

    // CAPDetector depends on all above + PolyrhythmicDetector
    options
      .bind(CAPLabelerTypes.ICAPLabelerDetectionService)
      .to(CAPDetector)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ICAPLabelsFirebaseRepository)
      .to(CAPLabelsFirebaseRepository)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.ISequenceLoader)
      .to(SequenceLoader)
      .inSingletonScope();

    options
      .bind(CAPLabelerTypes.INavigator)
      .to(Navigator)
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
