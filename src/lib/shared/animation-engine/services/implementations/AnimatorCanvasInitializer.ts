/**
 * Animator Canvas Initializer Service Implementation
 *
 * Orchestrates the complex async initialization sequence for AnimatorCanvas.
 */

import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
import { loadPixiRenderer } from "./AnimatorServiceLoader";
import { DEFAULT_CANVAS_SIZE } from "../contracts/ICanvasResizeService";
import type {
	IAnimatorCanvasInitializer,
	InitializationResult,
	InitializerCallbacks,
	InitializerDependencies,
} from "../contracts/IAnimatorCanvasInitializer";

export class AnimatorCanvasInitializer implements IAnimatorCanvasInitializer {
	private pixiRenderer: IPixiAnimationRenderer | null = null;
	private initialized = false;

	async initialize(
		deps: InitializerDependencies,
		callbacks: InitializerCallbacks
	): Promise<InitializationResult> {
		try {
			// Step 1: Load animator services (DI container services)
			const servicesLoaded = await deps.loadAnimatorServices();
			if (!servicesLoaded) {
				return { success: false, error: "Failed to load animator services" };
			}

			// Step 2: Load PixiJS renderer (heavy ~500KB module)
			if (!this.pixiRenderer) {
				callbacks.onPixiLoading(true);
				callbacks.onPixiError(null);

				const pixiResult = await loadPixiRenderer();
				callbacks.onPixiLoading(false);

				if (!pixiResult.success) {
					callbacks.onPixiError(pixiResult.error ?? "Unknown PixiJS error");
					return { success: false, error: pixiResult.error };
				}

				this.pixiRenderer = pixiResult.renderer!;
				callbacks.onPixiRendererReady(this.pixiRenderer);

				// Initialize pre-computation now that pixi is available
				deps.initializePrecomputationService();
			}

			// Step 3: Verify container is still valid
			if (!deps.containerElement) {
				return { success: false, error: "Container element became null during initialization" };
			}

			// Step 4: Initialize PixiJS renderer
			await this.pixiRenderer.initialize(
				deps.containerElement,
				DEFAULT_CANVAS_SIZE,
				deps.backgroundAlpha
			);

			// Step 5: Initialize texture services
			deps.initializePropTextureService();

			// Step 6: Load initial textures
			const initialGridMode = deps.gridMode?.toString() ?? "diamond";
			await Promise.all([
				this.pixiRenderer.loadGridTexture(initialGridMode),
				deps.loadPropTextures(),
			]);

			// Step 7: Mark as initialized
			this.initialized = true;
			callbacks.onInitialized(true);

			const canvas = this.pixiRenderer.getCanvas();
			callbacks.onCanvasReady(canvas);

			// Step 8: Set up remaining services
			deps.initializeResizeService();
			deps.initializeGlyphTextureService();
			deps.initializeRenderLoopService();

			// Step 9: Start render loop
			deps.startRenderLoop();

			return { success: true, canvas };
		} catch (err) {
			const error = err instanceof Error ? err.message : "Unknown initialization error";
			console.error("Failed to initialize PixiJS renderer:", err);
			return { success: false, error };
		}
	}

	destroy(callbacks: Pick<InitializerCallbacks, 'onCanvasReady' | 'onInitialized'>): void {
		this.pixiRenderer?.destroy();
		this.pixiRenderer = null;
		this.initialized = false;
		callbacks.onCanvasReady(null);
		callbacks.onInitialized(false);
	}

	getRenderer(): IPixiAnimationRenderer | null {
		return this.pixiRenderer;
	}

	isReady(): boolean {
		return this.initialized;
	}
}
