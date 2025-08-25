/**
 * Positioning Services Registration
 * Handles registration of arrow positioning and calculation services
 */

import type { ServiceContainer } from "../ServiceContainer";
import {
  // TODO: Temporarily disabled due to circular dependency
  // IArrowAdjustmentCalculatorInterface,
  IArrowCoordinateSystemServiceInterface,
  IArrowLocationServiceInterface,
  IArrowPlacementKeyServiceInterface,
  IArrowPlacementServiceInterface,
  // TODO: Temporarily disabled due to circular dependency
  // IArrowPositioningServiceInterface,
  // TODO: Temporarily disabled due to circular dependency
  // IArrowPositioningOrchestratorInterface,
  IArrowRotationCalculatorInterface,
  IDashLocationCalculatorInterface,
  IDirectionalTupleProcessorInterface,
} from "../interfaces/positioning-interfaces";

/**
 * Register all positioning services with their dependencies
 */
export async function registerPositioningServices(
  container: ServiceContainer
): Promise<void> {
  // Register placement services (no dependencies)
  container.registerSingletonClass(IArrowPlacementServiceInterface);
  container.registerSingletonClass(IArrowPlacementKeyServiceInterface);

  // Register enhanced positioning services
  container.registerSingletonClass(IArrowCoordinateSystemServiceInterface);
  container.registerSingletonClass(IDashLocationCalculatorInterface);
  container.registerSingletonClass(IArrowRotationCalculatorInterface);
  // TODO: Temporarily disabled due to circular dependency
  // container.registerSingletonClass(IPositioningServiceFactoryInterface);

  // Register directional tuple processor directly (no factory needed)
  container.registerSingletonClass(IDirectionalTupleProcessorInterface);

  // TODO: Temporarily disabled due to circular dependency
  // Register arrow location calculator with dependencies
  // container.registerFactory(IArrowLocationCalculatorInterface, () => {
  //   const factory = container.resolve(IPositioningServiceFactoryInterface);
  //   return factory.createLocationCalculator();
  // });

  // TODO: Temporarily disabled due to circular dependency
  // Register arrow adjustment calculator with dependencies
  // container.registerFactory(IArrowAdjustmentCalculatorInterface, () => {
  //   const factory = container.resolve(IPositioningServiceFactoryInterface);
  //   return factory.createAdjustmentCalculator();
  // });

  // TODO: Temporarily disabled due to circular dependency
  // Register enhanced arrow positioning orchestrator
  // container.registerFactory(IArrowPositioningOrchestratorInterface, () => {
  //   const factory = container.resolve(IPositioningServiceFactoryInterface);
  //   return factory.createPositioningOrchestrator();
  // });

  // TODO: Temporarily disabled due to circular dependency
  // Register ArrowPositioningService as a thin wrapper around orchestrator
  // container.registerSingletonClass(IArrowPositioningServiceInterface);

  // Register ArrowLocationService
  container.registerSingletonClass(IArrowLocationServiceInterface);

  // Note: ArrowPositioningService is now properly registered in DI container
}
