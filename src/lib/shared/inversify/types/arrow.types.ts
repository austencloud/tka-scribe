/**
 * Arrow Positioning Service Type Identifiers
 *
 * Comprehensive arrow placement, rotation, and positioning services.
 */

export const ArrowTypes = {
  // Direction & Location
  IDirectionCalculator: Symbol.for("IDirectionCalculator"),
  IArrowLocationCalculator: Symbol.for("IArrowLocationCalculator"),
  IArrowRotationCalculator: Symbol.for("IArrowRotationCalculator"),
  IDashLocationCalculator: Symbol.for("IDashLocationCalculator"),
  IArrowGridCoordinateService: Symbol.for("IArrowGridCoordinateService"),

  // Placement Services
  IArrowPlacementService: Symbol.for("IArrowPlacementService"),
  IArrowLocationService: Symbol.for("IArrowLocationService"),
  IArrowPlacementKeyService: Symbol.for("IArrowPlacementKeyService"),
  IPropPlacementService: Symbol.for("IPropPlacementService"),
  IArrowPathResolutionService: Symbol.for("IArrowPathResolutionService"),

  // Special Placement
  ISpecialPlacementService: Symbol.for("ISpecialPlacementService"),
  ISpecialPlacementDataService: Symbol.for("ISpecialPlacementDataService"),
  ISpecialPlacementLookupService: Symbol.for("ISpecialPlacementLookupService"),
  IDefaultPlacementService: Symbol.for("IDefaultPlacementService"),
  ISpecialPlacementOriKeyGenerator: Symbol.for(
    "ISpecialPlacementOriKeyGenerator"
  ),

  // Key Generation
  ArrowPlacementKeyService: Symbol.for("ArrowPlacementKeyService"),
  ITurnsTupleKeyGenerator: Symbol.for("ITurnsTupleKeyGenerator"),
  IAttributeKeyGenerator: Symbol.for("IAttributeKeyGenerator"),
  IRotationAngleOverrideKeyGenerator: Symbol.for(
    "IRotationAngleOverrideKeyGenerator"
  ),

  // Tuple & Quadrant Calculation
  ILetterClassificationService: Symbol.for("ILetterClassificationService"),
  ITurnsTupleGeneratorService: Symbol.for("ITurnsTupleGeneratorService"),
  IHandpathDirectionCalculator: Symbol.for("IHandpathDirectionCalculator"),
  IRotationOverrideManager: Symbol.for("IRotationOverrideManager"),
  IDirectionalTupleProcessor: Symbol.for("IDirectionalTupleProcessor"),
  IDirectionalTupleCalculator: Symbol.for("IDirectionalTupleCalculator"),
  IQuadrantIndexCalculator: Symbol.for("IQuadrantIndexCalculator"),

  // Orchestration
  IArrowAdjustmentProcessor: Symbol.for("IArrowAdjustmentProcessor"),
  IArrowCoordinateTransformer: Symbol.for("IArrowCoordinateTransformer"),
  IArrowDataProcessor: Symbol.for("IArrowDataProcessor"),
  IArrowQuadrantCalculator: Symbol.for("IArrowQuadrantCalculator"),
} as const;
