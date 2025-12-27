/**
 * CAP Labeler Service Type Identifiers
 */

export const CAPLabelerTypes = {
  IBeatDataConverter: Symbol.for("IBeatDataConverter"),
  IBeatPairAnalyzer: Symbol.for("IBeatPairAnalyzer"),
  ICAPDesignator: Symbol.for("ICAPDesignator"),
  ICAPLabelerDetectionService: Symbol.for("ICAPLabelerDetectionService"),
  ICAPLabelsFirebaseRepository: Symbol.for("ICAPLabelsFirebaseRepository"),
  ISequenceLoader: Symbol.for("ISequenceLoader"),
  INavigator: Symbol.for("ICAPLabelerNavigator"),
  ISequenceFeatureExtractor: Symbol.for("ISequenceFeatureExtractor"),
  IRuleBasedTagger: Symbol.for("IRuleBasedTagger"),
  IPolyrhythmicDetector: Symbol.for("IPolyrhythmicDetector"),
  ILayeredPathDetector: Symbol.for("ILayeredPathDetector"),

  // Comparison services (CAP detection)
  IRotationComparer: Symbol.for("IRotationComparer"),
  IReflectionComparer: Symbol.for("IReflectionComparer"),
  ISwapInvertComparer: Symbol.for("ISwapInvertComparer"),
  IBeatComparisonOrchestrator: Symbol.for("IBeatComparisonOrchestrator"),

  // Analysis and formatting services
  ITransformationAnalyzer: Symbol.for("ITransformationAnalyzer"),
  ICandidateFormatter: Symbol.for("ICandidateFormatter"),
} as const;
