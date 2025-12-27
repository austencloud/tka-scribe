/**
 * Animator Loader Interface
 *
 * Handles lazy loading of animator-related services.
 * Provides access to core animation dependencies.
 */

import type { IAnimationRenderer } from "$lib/features/compose/services/contracts/IAnimationRenderer";
import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import type { ISequenceAnimationOrchestrator } from "$lib/features/compose/services/contracts/ISequenceAnimationOrchestrator";
import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";
import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";

/**
 * Core animator services bundle
 */
export interface AnimatorServices {
  svgGenerator: ISVGGenerator;
  settingsService: ISettingsState;
  orchestrator: ISequenceAnimationOrchestrator;
  trailCaptureService: ITrailCaptureService;
  turnsTupleGenerator: ITurnsTupleGeneratorService;
}

/**
 * Result of loading animator services
 */
export type AnimatorServiceLoadResult =
  | { success: true; services: AnimatorServices }
  | { success: false; error: string };

/**
 * Result of loading animation renderer
 */
export type AnimationRendererLoadResult =
  | { success: true; renderer: IAnimationRenderer }
  | { success: false; error: string };

/** @deprecated Use AnimationRendererLoadResult instead */
export type PixiLoadResult = AnimationRendererLoadResult;

/**
 * Service for loading animator-related dependencies
 */
export interface IAnimatorLoader {
  /**
   * Load core animator services (requires animate module).
   * Does NOT load renderer - that's handled separately.
   */
  loadAnimatorServices(): Promise<AnimatorServiceLoadResult>;

  /**
   * Load animation renderer.
   */
  loadAnimationRenderer(): Promise<AnimationRendererLoadResult>;

  /** @deprecated Use loadAnimationRenderer() instead */
  loadPixiRenderer(): Promise<AnimationRendererLoadResult>;
}
