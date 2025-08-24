/**
 * Generation Services Registration
 *
 * Registers algorithmic pictograph generation services with the DI container.
 *
 * NOTE: PictographGenerator removed - replaced by Type1 modular system
 * TODO: Register Type1 generators when ready for production
 */

import type { ServiceContainer } from "../ServiceContainer";

/**
 * Register all generation services with the DI container
 */
export async function registerGenerationServices(
  _container: ServiceContainer
): Promise<void> {
  console.log("🔧 Registering generation services...");

  // TODO: Register Type1 generators here when ready
  // The old FlexiblePictographGenerator (A-F only) has been replaced
  // by the new Type1 system (A-V, 22 letters with logical rules)

  console.log("✅ Generation services registered successfully");
}
