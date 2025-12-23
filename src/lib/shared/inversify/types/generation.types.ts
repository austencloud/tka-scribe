/**
 * Generation Service Type Identifiers
 *
 * Services for generating sequences, including CAP (Circular Alternating Pattern) executors.
 */

export const GenerationTypes = {
  // Core Generation
  IRandomSelectionService: Symbol.for("IRandomSelectionService"),
  IPictographFilterService: Symbol.for("IPictographFilterService"),
  IBeatConverterService: Symbol.for("IBeatConverterService"),
  ITurnManagementService: Symbol.for("ITurnManagementService"),
  ISequenceMetadataService: Symbol.for("ISequenceMetadataService"),

  // Focused Generation (replaced monolithic SequenceGenerationService)
  IStartPositionSelector: Symbol.for("IStartPositionSelector"),
  ITurnAllocationCalculator: Symbol.for("ITurnAllocationCalculator"),
  IBeatGenerationOrchestrator: Symbol.for("IBeatGenerationOrchestrator"),
  IPartialSequenceGenerator: Symbol.for("IPartialSequenceGenerator"),

  // CAP Parameter & Selection
  ICAPParameterProvider: Symbol.for("ICAPParameterProvider"),
  IRotatedEndPositionSelector: Symbol.for("IRotatedEndPositionSelector"),
  ICAPEndPositionSelector: Symbol.for("ICAPEndPositionSelector"),
  ICAPExecutorSelector: Symbol.for("ICAPExecutorSelector"),

  // CAP Executors - Strict Single Transform
  IStrictRotatedCAPExecutor: Symbol.for("IStrictRotatedCAPExecutor"),
  IStrictMirroredCAPExecutor: Symbol.for("IStrictMirroredCAPExecutor"),
  IStrictSwappedCAPExecutor: Symbol.for("IStrictSwappedCAPExecutor"),
  IStrictInvertedCAPExecutor: Symbol.for("IStrictInvertedCAPExecutor"),

  // CAP Executors - Double Transform Combinations
  IMirroredSwappedCAPExecutor: Symbol.for("IMirroredSwappedCAPExecutor"),
  ISwappedInvertedCAPExecutor: Symbol.for("ISwappedInvertedCAPExecutor"),
  IMirroredInvertedCAPExecutor: Symbol.for("IMirroredInvertedCAPExecutor"),
  IRotatedSwappedCAPExecutor: Symbol.for("IRotatedSwappedCAPExecutor"),
  IRotatedInvertedCAPExecutor: Symbol.for("IRotatedInvertedCAPExecutor"),
  IMirroredRotatedCAPExecutor: Symbol.for("IMirroredRotatedCAPExecutor"),

  // CAP Executors - Triple/Quad Transform Combinations
  IMirroredRotatedInvertedCAPExecutor: Symbol.for(
    "IMirroredRotatedInvertedCAPExecutor"
  ),
  IMirroredSwappedInvertedCAPExecutor: Symbol.for(
    "IMirroredSwappedInvertedCAPExecutor"
  ),
  IMirroredRotatedInvertedSwappedCAPExecutor: Symbol.for(
    "IMirroredRotatedInvertedSwappedCAPExecutor"
  ),

  // Generation UI Services
  IResponsiveTypographyService: Symbol.for("IResponsiveTypographyService"),
  ICardConfigurationService: Symbol.for("ICardConfigurationService"),
  ICAPTypeService: Symbol.for("ICAPTypeService"),
  IGenerationOrchestrationService: Symbol.for(
    "IGenerationOrchestrationService"
  ),
  IPresetFormatterService: Symbol.for("IPresetFormatterService"),

  // CAP Detection (reverse of generation - detect CAP type from existing sequence)
  ICAPDetectionService: Symbol.for("ICAPDetectionService"),
  IOrientationCycleDetector: Symbol.for("IOrientationCycleDetector"),
} as const;
