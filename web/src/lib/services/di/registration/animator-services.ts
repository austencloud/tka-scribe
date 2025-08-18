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
  try {
    // Register core math and calculation services (no dependencies)
    container.registerSingletonClass(IBeatCalculationServiceInterface);
    container.registerSingletonClass(IPropInterpolationServiceInterface);
    container.registerSingletonClass(IAnimationStateServiceInterface);

    // Register orchestrator with dependencies
    container.register(
      ISequenceAnimationOrchestratorInterface,
      IAnimationStateServiceInterface,
      IBeatCalculationServiceInterface,
      IPropInterpolationServiceInterface
    );

    // Register animation engine wrapper (depends on orchestrator)
    container.register(
      ISequenceAnimationEngineInterface,
      ISequenceAnimationOrchestratorInterface
    );
  } catch (error) {
    console.error("❌ Failed to register animator services:", error);
    throw new Error(
      `Animator services registration failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
