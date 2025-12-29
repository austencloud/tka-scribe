/**
 * LOOP Labeler Service Type Identifiers
 */

export const LOOPLabelerTypes = {
  IBeatDataConverter: Symbol.for("IBeatDataConverter"),
  IBeatPairAnalyzer: Symbol.for("IBeatPairAnalyzer"),
  ILOOPDesignator: Symbol.for("ILOOPDesignator"),
  ILOOPLabelerDetectionService: Symbol.for("ILOOPLabelerDetectionService"),
  ILOOPLabelsFirebaseRepository: Symbol.for("ILOOPLabelsFirebaseRepository"),
  ISequenceLoader: Symbol.for("ISequenceLoader"),
  INavigator: Symbol.for("ILOOPLabelerNavigator"),
  ISequenceFeatureExtractor: Symbol.for("ISequenceFeatureExtractor"),
  IRuleBasedTagger: Symbol.for("IRuleBasedTagger"),
  IPolyrhythmicDetector: Symbol.for("IPolyrhythmicDetector"),
  ILayeredPathDetector: Symbol.for("ILayeredPathDetector"),

  // Comparison services (LOOP detection)
  IRotationComparer: Symbol.for("IRotationComparer"),
  IReflectionComparer: Symbol.for("IReflectionComparer"),
  ISwapInvertComparer: Symbol.for("ISwapInvertComparer"),
  IBeatComparisonOrchestrator: Symbol.for("IBeatComparisonOrchestrator"),

  // Analysis and formatting services
  ITransformationAnalyzer: Symbol.for("ITransformationAnalyzer"),
  ICandidateFormatter: Symbol.for("ICandidateFormatter"),
} as const;
