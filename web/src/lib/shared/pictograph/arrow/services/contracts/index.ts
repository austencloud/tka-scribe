/**
 * Arrow Service Contracts
 *
 * Service interfaces for arrow-related functionality.
 */

// Individual interface files
export * from "./IArrowAdjustmentCalculator";
export * from "./IArrowCoordinateSystemService";
export * from "./IArrowLocationCalculator";
export * from "./IArrowPositioningOrchestrator";
export * from "./IArrowRotationCalculator";
export * from "./IFallbackArrowRenderer";

// New contract files (moved from implementations)
export * from "./IArrowLocationService";
export * from "./IArrowPlacementKeyService";
export * from "./IArrowPlacementService";
export * from "./IArrowPositioningService";
export * from "./IDirectionalTupleService";

// Consolidated contract files (excluding conflicting exports)
export type {
    IArrowPathResolutionService, IArrowPointCalculator, IDashLocationCalculator,
    IQuadrantIndexCalculator
} from "./arrow-calculation-contracts";

export type {
    IAttributeKeyGenerator, IPlacementKeyGenerator, ISpecialPlacementOriKeyGenerator,
    ITurnsTupleKeyGenerator
} from "./arrow-key-generation-contracts";

export type {
    IArrowAdjustmentLookup, IDefaultPlacementService, ISpecialPlacementService
} from "./arrow-placement-contracts";

// Legacy exports (no duplicates)
export * from "./IArrowPositioningService";

