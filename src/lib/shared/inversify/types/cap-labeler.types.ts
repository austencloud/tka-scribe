/**
 * CAP Labeler Service Type Identifiers
 */

export const CAPLabelerTypes = {
  IBeatDataConversionService: Symbol.for("IBeatDataConversionService"),
  IBeatPairAnalysisService: Symbol.for("IBeatPairAnalysisService"),
  ICAPDesignationService: Symbol.for("ICAPDesignationService"),
  ICAPLabelerDetectionService: Symbol.for("ICAPLabelerDetectionService"),
  ICAPLabelsFirebaseService: Symbol.for("ICAPLabelsFirebaseService"),
  ISequenceLoadingService: Symbol.for("ISequenceLoadingService"),
  INavigationService: Symbol.for("ICAPLabelerNavigationService"),
  ISequenceFeatureExtractor: Symbol.for("ISequenceFeatureExtractor"),
  IRuleBasedTagger: Symbol.for("IRuleBasedTagger"),
  IPolyrhythmicDetectionService: Symbol.for("IPolyrhythmicDetectionService"),

  // Comparison services (CAP detection)
  IRotationComparisonService: Symbol.for("IRotationComparisonService"),
  IReflectionComparisonService: Symbol.for("IReflectionComparisonService"),
  ISwapInvertComparisonService: Symbol.for("ISwapInvertComparisonService"),
  IBeatComparisonOrchestrator: Symbol.for("IBeatComparisonOrchestrator"),

  // Analysis and formatting services
  ITransformationAnalysisService: Symbol.for("ITransformationAnalysisService"),
  ICandidateFormattingService: Symbol.for("ICandidateFormattingService"),
} as const;
