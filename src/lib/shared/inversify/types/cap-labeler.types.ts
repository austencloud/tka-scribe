/**
 * CAP Labeler Service Type Identifiers
 */

export const CAPLabelerTypes = {
  IBeatDataConversionService: Symbol.for("IBeatDataConversionService"),
  IBeatPairAnalysisService: Symbol.for("IBeatPairAnalysisService"),
  ICAPDesignationService: Symbol.for("ICAPDesignationService"),
  ICAPLabelsFirebaseService: Symbol.for("ICAPLabelsFirebaseService"),
  ISequenceLoadingService: Symbol.for("ISequenceLoadingService"),
  INavigationService: Symbol.for("ICAPLabelerNavigationService"),
} as const;
