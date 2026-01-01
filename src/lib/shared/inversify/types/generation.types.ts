/**
 * Generation Service Type Identifiers
 *
 * Services for generating sequences, including LOOP executors.
 *
 * ## TERMINOLOGY: LOOP
 *
 * **LOOP (Linked Offset Operation Pattern)** - TKA's algorithmic extension patterns.
 * These are transformation-based patterns unique to TKA:
 * - Rotated, Mirrored, Swapped, Inverted (and combinations)
 * - Rewound (temporal reversal)
 *
 * Examples:
 * - LOOP patterns: Rotated, Mirrored, Swapped, Inverted, Rewound (TKA transformations)
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

  // LOOP Parameter & Selection
  ILOOPParameterProvider: Symbol.for("ILOOPParameterProvider"),
  IRotatedEndPositionSelector: Symbol.for("IRotatedEndPositionSelector"),
  ILOOPEndPositionSelector: Symbol.for("ILOOPEndPositionSelector"),
  ILOOPExecutorSelector: Symbol.for("ILOOPExecutorSelector"),

  // LOOP Executors - Strict Single Transform
  IStrictRotatedLOOPExecutor: Symbol.for("IStrictRotatedLOOPExecutor"),
  IStrictMirroredLOOPExecutor: Symbol.for("IStrictMirroredLOOPExecutor"),
  IStrictSwappedLOOPExecutor: Symbol.for("IStrictSwappedLOOPExecutor"),
  IStrictInvertedLOOPExecutor: Symbol.for("IStrictInvertedLOOPExecutor"),

  // LOOP Executors - Double Transform Combinations
  IMirroredSwappedLOOPExecutor: Symbol.for("IMirroredSwappedLOOPExecutor"),
  ISwappedInvertedLOOPExecutor: Symbol.for("ISwappedInvertedLOOPExecutor"),
  IMirroredInvertedLOOPExecutor: Symbol.for("IMirroredInvertedLOOPExecutor"),
  IRotatedSwappedLOOPExecutor: Symbol.for("IRotatedSwappedLOOPExecutor"),
  IRotatedInvertedLOOPExecutor: Symbol.for("IRotatedInvertedLOOPExecutor"),
  IMirroredRotatedLOOPExecutor: Symbol.for("IMirroredRotatedLOOPExecutor"),

  // LOOP Executors - Triple/Quad Transform Combinations
  IMirroredRotatedInvertedLOOPExecutor: Symbol.for(
    "IMirroredRotatedInvertedLOOPExecutor"
  ),
  IMirroredSwappedInvertedLOOPExecutor: Symbol.for(
    "IMirroredSwappedInvertedLOOPExecutor"
  ),
  IMirroredRotatedInvertedSwappedLOOPExecutor: Symbol.for(
    "IMirroredRotatedInvertedSwappedLOOPExecutor"
  ),

  // LOOP Executors - Temporal
  IRewoundLOOPExecutor: Symbol.for("IRewoundLOOPExecutor"),

  // Generation UI Services
  IResponsiveTypographer: Symbol.for("IResponsiveTypographer"),
  ICardConfigurator: Symbol.for("ICardConfigurator"),
  ILOOPTypeResolver: Symbol.for("ILOOPTypeResolver"),
  IGenerationOrchestrator: Symbol.for(
    "IGenerationOrchestrator"
  ),
  IPresetFormatterService: Symbol.for("IPresetFormatterService"),

  // LOOP Detection (reverse of generation - detect LOOP type from existing sequence)
  ILOOPDetector: Symbol.for("ILOOPDetector"),
  IOrientationCycleDetector: Symbol.for("IOrientationCycleDetector"),
} as const;
