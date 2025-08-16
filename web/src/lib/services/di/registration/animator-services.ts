/**
 * Animator Services Registration
 *
 * Registers all animator services with their dependencies in the DI container.
 * Follows TKA's established DI patterns for clean architecture.
 */

import type { ServiceContainer } from "../ServiceContainer";
import {
  IBeatCalculationServiceInterface,
  IPropInterpolationServiceInterface,
  IAnimationStateServiceInterface,
  ISequenceAnimationOrchestratorInterface,
  ISequenceAnimationEngineInterface,
} from "../interfaces/animator-interfaces";

/**
 * Register all animator services with their dependencies
 */
export async function registerAnimatorServices(
  container: ServiceContainer
): Promise<void> {
  console.log("🎬 Registering animator services...");

  try {
    // Register core math and calculation services (no dependencies)
    console.log("🎬 Registering IBeatCalculationServiceInterface...");
    container.registerSingletonClass(IBeatCalculationServiceInterface);

    console.log("🎬 Registering IPropInterpolationServiceInterface...");
    container.registerSingletonClass(IPropInterpolationServiceInterface);

    console.log("🎬 Registering IAnimationStateServiceInterface...");
    container.registerSingletonClass(IAnimationStateServiceInterface);

    // Register orchestrator with dependencies
    console.log("🎬 Registering ISequenceAnimationOrchestratorInterface...");
    container.register(
      ISequenceAnimationOrchestratorInterface,
      IAnimationStateServiceInterface,
      IBeatCalculationServiceInterface,
      IPropInterpolationServiceInterface
    );

    // Register animation engine wrapper (depends on orchestrator)
    console.log("🎬 Registering ISequenceAnimationEngineInterface...");
    container.register(
      ISequenceAnimationEngineInterface,
      ISequenceAnimationOrchestratorInterface
    );

    console.log("✅ Animator services registered successfully");
  } catch (error) {
    console.error("❌ Failed to register animator services:", error);
    throw new Error(
      `Animator services registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
