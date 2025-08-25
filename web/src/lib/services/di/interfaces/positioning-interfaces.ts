/**
 * Positioning Service Interface Definitions
 * These handle arrow positioning, placement, and coordinate calculations
 */

import type {
  IArrowLocationService,
  IArrowPlacementKeyService,
  IArrowPlacementService,
} from "../../interfaces/positioning-interfaces";
import { createServiceInterface } from "../types";

// Import enhanced positioning service interfaces
import type {
  IArrowCoordinateSystemService,
  IArrowLocationCalculator,
  IArrowRotationCalculator,
  IDashLocationCalculator,
  IDirectionalTupleCalculator,
  IDirectionalTupleProcessor,
} from "../../positioning";

// Import service implementations
import { ArrowPlacementService } from "../../implementations/data/ArrowPlacementService";
import { ArrowPlacementKeyService } from "../../implementations/positioning/ArrowPlacementKeyService";
// TODO: ArrowPositioningService import removed to fix circular dependency
import { ArrowLocationService } from "../../implementations/positioning/ArrowLocationService";

// Import enhanced positioning service implementations
// TODO: ArrowAdjustmentCalculator import removed to fix circular dependency
// import { ArrowAdjustmentCalculator } from "../../positioning/arrows/calculation/ArrowAdjustmentCalculator";
import { ArrowLocationCalculator } from "../../positioning/arrows/calculation/ArrowLocationCalculator";
import { ArrowRotationCalculator } from "../../positioning/arrows/calculation/ArrowRotationCalculator";
import { DashLocationCalculator } from "../../positioning/arrows/calculation/DashLocationCalculator";
import { ArrowCoordinateSystemService } from "../../positioning/arrows/coordinate_system/ArrowCoordinateSystemService";
import {
  DirectionalTupleProcessor,
  QuadrantIndexCalculator,
} from "../../positioning/arrows/processors/DirectionalTupleProcessor";
// TODO: Temporarily disabled due to circular dependency
// import { PositioningServiceFactory } from "../../positioning/PositioningServiceFactory";

// Core positioning services
export const IArrowPlacementServiceInterface =
  createServiceInterface<IArrowPlacementService>(
    "IArrowPlacementService",
    ArrowPlacementService
  );

export const IArrowPlacementKeyServiceInterface =
  createServiceInterface<IArrowPlacementKeyService>(
    "IArrowPlacementKeyService",
    ArrowPlacementKeyService
  );

// Arrow positioning service - TODO: Disabled due to circular dependency
// export const IArrowPositioningServiceInterface =
//   createServiceInterface<IArrowPositioningService>(
//     "IArrowPositioningService",
//     ArrowPositioningService
//   );

// Arrow location service
export const IArrowLocationServiceInterface =
  createServiceInterface<IArrowLocationService>(
    "IArrowLocationService",
    ArrowLocationService
  );

// Enhanced positioning service interfaces
export const IArrowLocationCalculatorInterface =
  createServiceInterface<IArrowLocationCalculator>(
    "IArrowLocationCalculator",
    class extends ArrowLocationCalculator {
      constructor(...args: unknown[]) {
        super(args[0] as DashLocationCalculator | undefined);
      }
    }
  );

export const IArrowRotationCalculatorInterface =
  createServiceInterface<IArrowRotationCalculator>(
    "IArrowRotationCalculator",
    ArrowRotationCalculator
  );

// TODO: ArrowAdjustmentCalculator interface disabled due to circular dependency
// export const IArrowAdjustmentCalculatorInterface =
//   createServiceInterface<IArrowAdjustmentCalculator>(
//     "IArrowAdjustmentCalculator",
//     class extends ArrowAdjustmentCalculator {
//       constructor(..._args: unknown[]) {
//         super();
//       }
//     }
//   );

export const IArrowCoordinateSystemServiceInterface =
  createServiceInterface<IArrowCoordinateSystemService>(
    "IArrowCoordinateSystemService",
    ArrowCoordinateSystemService
  );

export const IDashLocationCalculatorInterface =
  createServiceInterface<IDashLocationCalculator>(
    "IDashLocationCalculator",
    DashLocationCalculator
  );

export const IDirectionalTupleProcessorInterface =
  createServiceInterface<IDirectionalTupleProcessor>(
    "IDirectionalTupleProcessor",
    class extends DirectionalTupleProcessor {
      constructor(...args: unknown[]) {
        super(
          args[0] as IDirectionalTupleCalculator,
          args[1] as QuadrantIndexCalculator
        );
      }
    }
  );

// TODO: ArrowPositioningOrchestrator interface disabled due to IArrowAdjustmentCalculator dependency
// export const IArrowPositioningOrchestratorInterface =
//   createServiceInterface<IArrowPositioningOrchestrator>(
//     "IArrowPositioningOrchestrator",
//     class extends ArrowPositionCalculator {
//       constructor(...args: unknown[]) {
//         super(
//           args[0] as IArrowLocationCalculator,
//           args[1] as IArrowRotationCalculator,
//           args[2] as IArrowAdjustmentCalculator,
//           args[3] as IArrowCoordinateSystemService
//         );
//       }
//     }
//   );

// TODO: Temporarily disabled due to circular dependency
// export const IPositioningServiceFactoryInterface =
//   createServiceInterface<IPositioningServiceFactory>(
//     "IPositioningServiceFactory",
//     PositioningServiceFactory
//   );
