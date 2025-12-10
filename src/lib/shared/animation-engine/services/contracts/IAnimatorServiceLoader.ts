/**
 * Animator Service Loader Interface
 *
 * Handles lazy loading of animator-related services.
 * Provides access to core animation dependencies.
 */

import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
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
 * Result of loading PixiJS renderer
 */
export type PixiLoadResult =
	| { success: true; renderer: IPixiAnimationRenderer }
	| { success: false; error: string };

/**
 * Service for loading animator-related dependencies
 */
export interface IAnimatorServiceLoader {
	/**
	 * Load core animator services (requires animate module).
	 * Does NOT load PixiJS - that's handled separately due to size.
	 */
	loadAnimatorServices(): Promise<AnimatorServiceLoadResult>;

	/**
	 * Load PixiJS renderer (heavy - ~500KB).
	 * Separate from core services due to bundle size.
	 */
	loadPixiRenderer(): Promise<PixiLoadResult>;
}
