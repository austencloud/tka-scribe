/**
 * Pictograph Generation Services Registration
 * Handles registration of pictograph pattern generation services
 */

import {
  GridModeDeriverDI,
  PictographGeneratorDI,
  PictographValidatorServiceDI,
  PositionMapperDI,
  PositionPatternServiceDI,
} from "../interfaces/movement-interfaces";
import type { ServiceContainer } from "../ServiceContainer";

/**
 * Register all pictograph generation services with their dependencies
 */
export async function registerPictographServices(
  container: ServiceContainer
): Promise<void> {
  // Register independent services first (no dependencies)
  container.registerSingletonClass(PositionPatternServiceDI);
  // container.registerSingletonClass(IPositionCalculatorServiceInterface);
  container.registerSingletonClass(PictographValidatorServiceDI);
  container.registerSingletonClass(PositionMapperDI);

  // Register GridModeDeriver - now follows standard pattern
  container.registerSingletonClass(GridModeDeriverDI);

  // Register pictograph generator service (no dependencies for CSV approach)
  container.registerSingletonClass(PictographGeneratorDI);
}
