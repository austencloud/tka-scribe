/**
 * Animator Service Loader Implementation
 *
 * Handles lazy loading of animator-related services.
 * Provides access to core animation dependencies.
 */

import {
  loadAnimationModule,
  loadFeatureModule,
  getContainerInstance,
} from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import type { IAnimationRenderer } from "$lib/features/compose/services/contracts/IAnimationRenderer";
import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import type { ISequenceAnimationOrchestrator } from "$lib/features/compose/services/contracts/ISequenceAnimationOrchestrator";
import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";
import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";
import type {
  IAnimatorServiceLoader,
  AnimatorServices,
  AnimatorServiceLoadResult,
  AnimationRendererLoadResult,
} from "../contracts/IAnimatorServiceLoader";

export class AnimatorServiceLoader implements IAnimatorServiceLoader {
  async loadAnimatorServices(): Promise<AnimatorServiceLoadResult> {
    try {
      // First ensure the animator module is loaded
      await loadFeatureModule("animate");

      // Get container and resolve services
      const container = await getContainerInstance();

      const services: AnimatorServices = {
        svgGenerator: container.get<ISVGGenerator>(TYPES.ISVGGenerator),
        settingsService: container.get<ISettingsState>(TYPES.ISettingsState),
        orchestrator: container.get<ISequenceAnimationOrchestrator>(
          TYPES.ISequenceAnimationOrchestrator
        ),
        trailCaptureService: container.get<ITrailCaptureService>(
          TYPES.ITrailCaptureService
        ),
        turnsTupleGenerator: container.get<ITurnsTupleGeneratorService>(
          TYPES.ITurnsTupleGeneratorService
        ),
      };

      if (!services.svgGenerator) {
        console.error(
          "[AnimatorServiceLoader] CRITICAL: container.get() returned null/undefined for ISVGGenerator!"
        );
        return {
          success: false,
          error:
            "DI container returned null for ISVGGenerator (this is a container bug)",
        };
      }

      return { success: true, services };
    } catch (err) {
      console.error(
        "[AnimatorServiceLoader] Failed to load animator services:",
        err
      );
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async loadAnimationRenderer(): Promise<AnimationRendererLoadResult> {
    try {
      await loadAnimationModule();
      const container = await getContainerInstance();
      const renderer = container.get<IAnimationRenderer>(
        TYPES.IAnimationRenderer
      );
      return { success: true, renderer };
    } catch (err) {
      console.error("Failed to load animation renderer:", err);
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to load animation renderer",
      };
    }
  }

  /** @deprecated Use loadAnimationRenderer() instead */
  async loadPixiRenderer(): Promise<AnimationRendererLoadResult> {
    return this.loadAnimationRenderer();
  }
}

// Singleton instance for convenience (stateless service)
const animatorServiceLoader = new AnimatorServiceLoader();

/**
 * Load core animator services (requires animate module).
 * Convenience function for direct usage.
 */
export async function loadAnimatorServices(): Promise<AnimatorServiceLoadResult> {
  return animatorServiceLoader.loadAnimatorServices();
}

/**
 * Load animation renderer.
 * Convenience function for direct usage.
 */
export async function loadAnimationRenderer(): Promise<AnimationRendererLoadResult> {
  return animatorServiceLoader.loadAnimationRenderer();
}

/** @deprecated Use loadAnimationRenderer() instead */
export const loadPixiRenderer = loadAnimationRenderer;
