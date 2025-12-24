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
} as const;
