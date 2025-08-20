/**
 * Generation Services Registration
 *
 * Registers algorithmic pictograph generation services with the DI container.
 */

import type { ServiceContainer } from "../ServiceContainer";
import { IPictographGeneratorServiceInterface } from "$lib/services/interfaces/pictograph-generator-interfaces";
import { PictographGeneratorService } from "$lib/services/implementations/generation/PictographGeneratorService";

/**
 * Register all generation services with the DI container
 */
export async function registerGenerationServices(
  container: ServiceContainer
): Promise<void> {
  console.log("🔧 Registering generation services...");

  // Register pictograph generator service as singleton (no dependencies)
  container.registerSingletonClass(IPictographGeneratorServiceInterface);

  console.log("✅ Generation services registered successfully");
}
