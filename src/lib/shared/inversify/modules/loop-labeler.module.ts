import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

// Direct imports to avoid barrel exports
import { BeatDataConverter } from "$lib/features/loop-labeler/services/implementations/BeatDataConverter";
import { BeatPairAnalyzer } from "$lib/features/loop-labeler/services/implementations/BeatPairAnalyzer";
import { LOOPDesignator } from "$lib/features/loop-labeler/services/implementations/LOOPDesignator";
import { LOOPDetector } from "$lib/features/loop-labeler/services/implementations/LOOPDetector";
import { LOOPLabelsFirebaseRepository } from "$lib/features/loop-labeler/services/implementations/LOOPLabelsFirebaseRepository";
import { SequenceLoader } from "$lib/features/loop-labeler/services/implementations/SequenceLoader";
import { Navigator } from "$lib/features/loop-labeler/services/implementations/Navigator";
import { SequenceFeatureExtractor } from "$lib/features/loop-labeler/services/implementations/SequenceFeatureExtractor";
import { RuleBasedTagger } from "$lib/features/loop-labeler/services/implementations/RuleBasedTagger";
import { PolyrhythmicDetector } from "$lib/features/loop-labeler/services/implementations/PolyrhythmicDetector";
import { LayeredPathDetector } from "$lib/features/loop-labeler/services/implementations/LayeredPathDetector";

// Comparison services
import { RotationComparer } from "$lib/features/loop-labeler/services/implementations/comparison/RotationComparer";
import { ReflectionComparer } from "$lib/features/loop-labeler/services/implementations/comparison/ReflectionComparer";
import { SwapInvertComparer } from "$lib/features/loop-labeler/services/implementations/comparison/SwapInvertComparer";
import { BeatComparisonOrchestrator } from "$lib/features/loop-labeler/services/implementations/comparison/BeatComparisonOrchestrator";

// Analysis and formatting services
import { TransformationAnalyzer } from "$lib/features/loop-labeler/services/implementations/TransformationAnalyzer";
import { CandidateFormatter } from "$lib/features/loop-labeler/services/implementations/CandidateFormatter";

import { LOOPLabelerTypes } from "../types/loop-labeler.types";

export const loopLabelerModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === LOOP LABELER SERVICES ===
    options
      .bind(LOOPLabelerTypes.IBeatDataConverter)
      .to(BeatDataConverter)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.IBeatPairAnalyzer)
      .to(BeatPairAnalyzer)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.ILOOPDesignator)
      .to(LOOPDesignator)
      .inSingletonScope();

    // PolyrhythmicDetector must be registered BEFORE LOOPDetector
    // since LOOPDetector depends on it
    options
      .bind(LOOPLabelerTypes.IPolyrhythmicDetector)
      .to(PolyrhythmicDetector)
      .inSingletonScope();

    // LayeredPathDetector - analyzes individual hand path periodicity
    options
      .bind(LOOPLabelerTypes.ILayeredPathDetector)
      .to(LayeredPathDetector)
      .inSingletonScope();

    // === COMPARISON SERVICES ===
    // These must be registered BEFORE LOOPDetector
    // CandidateFormatter has no dependencies - register first
    options
      .bind(LOOPLabelerTypes.ICandidateFormatter)
      .to(CandidateFormatter)
      .inSingletonScope();

    // Individual comparison services (no dependencies)
    options
      .bind(LOOPLabelerTypes.IRotationComparer)
      .to(RotationComparer)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.IReflectionComparer)
      .to(ReflectionComparer)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.ISwapInvertComparer)
      .to(SwapInvertComparer)
      .inSingletonScope();

    // BeatComparisonOrchestrator depends on individual comparison services + formatting
    options
      .bind(LOOPLabelerTypes.IBeatComparisonOrchestrator)
      .to(BeatComparisonOrchestrator)
      .inSingletonScope();

    // TransformationAnalyzer depends on CandidateFormatter
    options
      .bind(LOOPLabelerTypes.ITransformationAnalyzer)
      .to(TransformationAnalyzer)
      .inSingletonScope();

    // LOOPDetector depends on all above + PolyrhythmicDetector
    options
      .bind(LOOPLabelerTypes.ILOOPLabelerDetectionService)
      .to(LOOPDetector)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.ILOOPLabelsFirebaseRepository)
      .to(LOOPLabelsFirebaseRepository)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.ISequenceLoader)
      .to(SequenceLoader)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.INavigator)
      .to(Navigator)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.ISequenceFeatureExtractor)
      .to(SequenceFeatureExtractor)
      .inSingletonScope();

    options
      .bind(LOOPLabelerTypes.IRuleBasedTagger)
      .to(RuleBasedTagger)
      .inSingletonScope();
  }
);
