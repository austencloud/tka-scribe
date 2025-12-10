/**
 * Animator Service Loader Implementation
 *
 * Handles lazy loading of animator-related services.
 * Provides access to core animation dependencies.
 */

import {
	resolve,
	loadPixiModule,
	loadFeatureModule,
} from "$lib/shared/inversify/di";
import { TYPES } from "$lib/shared/inversify/types";
import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import type { ISequenceAnimationOrchestrator } from "$lib/features/compose/services/contracts/ISequenceAnimationOrchestrator";
import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";
import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";
import type {
	IAnimatorServiceLoader,
	AnimatorServices,
	AnimatorServiceLoadResult,
	PixiLoadResult,
} from "../contracts/IAnimatorServiceLoader";

export class AnimatorServiceLoader implements IAnimatorServiceLoader {
	async loadAnimatorServices(): Promise<AnimatorServiceLoadResult> {
		try {
			// First ensure the animator module is loaded
			await loadFeatureModule("animate");

			// Now resolve services
			const services: AnimatorServices = {
				svgGenerator: resolve(TYPES.ISVGGenerator) as ISVGGenerator,
				settingsService: resolve(TYPES.ISettingsState) as ISettingsState,
				orchestrator: resolve(
					TYPES.ISequenceAnimationOrchestrator
				) as ISequenceAnimationOrchestrator,
				trailCaptureService: resolve(
					TYPES.ITrailCaptureService
				) as ITrailCaptureService,
				turnsTupleGenerator: resolve(
					TYPES.ITurnsTupleGeneratorService
				) as ITurnsTupleGeneratorService,
			};

			return { success: true, services };
		} catch (err) {
			console.error("Failed to load animator services:", err);
			return {
				success: false,
				error: err instanceof Error ? err.message : "Unknown error",
			};
		}
	}

	async loadPixiRenderer(): Promise<PixiLoadResult> {
		try {
			await loadPixiModule();
			const renderer = resolve(
				TYPES.IPixiAnimationRenderer
			) as IPixiAnimationRenderer;
			return { success: true, renderer };
		} catch (err) {
			console.error("Failed to load Pixi module:", err);
			return {
				success: false,
				error: err instanceof Error ? err.message : "Failed to load animation renderer",
			};
		}
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
 * Load PixiJS renderer (heavy - ~500KB).
 * Convenience function for direct usage.
 */
export async function loadPixiRenderer(): Promise<PixiLoadResult> {
	return animatorServiceLoader.loadPixiRenderer();
}
