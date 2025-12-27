/**
 * Generation Service Type Identifiers
 *
 * Services for generating sequences, including CAP (Circular Alternating Pattern) executors.
 */

export const GenerationTypes = {
  // Core Generation
  IRandomSelectionService: Symbol.for("IRandomSelectionService"),
  IPictographFilter: Symbol.for("IPictographFilter"),
  IBeatConverter: Symbol.for("IBeatConverter"),
  ITurnManager: Symbol.for("ITurnManager"),
  ISequenceMetadataManager: Symbol.for("ISequenceMetadataManager"),

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
  IResponsiveTypographer: Symbol.for("IResponsiveTypographer"),
  ICardConfigurator: Symbol.for("ICardConfigurator"),
  ICAPTypeResolver: Symbol.for("ICAPTypeResolver"),
  IGenerationOrchestrator: Symbol.for(
    "IGenerationOrchestrator"
  ),
  IPresetFormatterService: Symbol.for("IPresetFormatterService"),

  // CAP Detection (reverse of generation - detect CAP type from existing sequence)
  ICAPDetector: Symbol.for("ICAPDetector"),
  IOrientationCycleDetector: Symbol.for("IOrientationCycleDetector"),
} as const;
