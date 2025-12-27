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
  IArrowGridCoordinator: Symbol.for("IArrowGridCoordinator"),

  // Placement Services
  IArrowPlacer: Symbol.for("IArrowPlacer"),
  IArrowLocator: Symbol.for("IArrowLocator"),
  IArrowPlacementKeyGenerator: Symbol.for("IArrowPlacementKeyGenerator"),
  IPropPlacer: Symbol.for("IPropPlacer"),
  IArrowPathResolutionService: Symbol.for("IArrowPathResolutionService"),

  // Special Placement
  ISpecialPlacer: Symbol.for("ISpecialPlacer"),
  ISpecialPlacementDataProvider: Symbol.for("ISpecialPlacementDataProvider"),
  ISpecialPlacementLookup: Symbol.for("ISpecialPlacementLookup"),
  IDefaultPlacer: Symbol.for("IDefaultPlacer"),
  ISpecialPlacementOriKeyGenerator: Symbol.for(
    "ISpecialPlacementOriKeyGenerator"
  ),

  // Key Generation
  ArrowPlacementKeyGenerator: Symbol.for("ArrowPlacementKeyGenerator"),
  ITurnsTupleKeyGenerator: Symbol.for("ITurnsTupleKeyGenerator"),
  IAttributeKeyGenerator: Symbol.for("IAttributeKeyGenerator"),
  IRotationAngleOverrideKeyGenerator: Symbol.for(
    "IRotationAngleOverrideKeyGenerator"
  ),

  // Tuple & Quadrant Calculation
  ILetterClassifier: Symbol.for("ILetterClassifier"),
  ITurnsTupleGenerator: Symbol.for("ITurnsTupleGenerator"),
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
