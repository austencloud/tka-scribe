/**
 * Motion Tester Services Registration
 *
 * Registers all services related to the motion tester functionality
 * following the TKA DI container pattern.
 */

import type { ServiceContainer } from "../ServiceContainer";
import { IAnimatedPictographDataServiceInterface } from "../interfaces/motion-tester-interfaces";
import { IOptionDataServiceInterface } from "../interfaces/core-interfaces";
import { IArrowPositioningOrchestratorInterface } from "../interfaces/positioning-interfaces";
import { CsvDataService } from "../../implementations/CsvDataService";

/**
 * Register all motion tester services
 */
export async function registerMotionTesterServices(
  container: ServiceContainer
): Promise<void> {
  // Register AnimatedPictographDataService with existing CSV, Option, and Positioning services
  // Note: CSV initialization is handled lazily within the service
  container.registerFactory(IAnimatedPictographDataServiceInterface, () => {
    const csvDataService = new CsvDataService();
    const optionDataService = container.resolve(IOptionDataServiceInterface);
    const arrowPositioningOrchestrator = container.resolve(
      IArrowPositioningOrchestratorInterface
    );
    return new IAnimatedPictographDataServiceInterface.implementation(
      csvDataService,
      optionDataService,
      arrowPositioningOrchestrator
    );
  });
}
