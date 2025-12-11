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
	private isInitializing = false;
	private destroyRequested = false;

	async initialize(
		deps: InitializerDependencies,
		callbacks: InitializerCallbacks
	): Promise<InitializationResult> {
		// Guard against concurrent initializations
		if (this.isInitializing) {
			return { success: false, error: "Initialization already in progress" };
		}
		if (this.initialized) {
			return { success: true, canvas: this.pixiRenderer?.getCanvas() };
		}

		this.isInitializing = true;
		this.destroyRequested = false;

		try {
			// Step 1: Load animator services (DI container services)
			const servicesLoaded = await deps.loadAnimatorServices();
			if (!servicesLoaded || this.destroyRequested) {
				this.isInitializing = false;
				return { success: false, error: this.destroyRequested ? "Destroyed during initialization" : "Failed to load animator services" };
			}

			// Step 2: Load PixiJS renderer (heavy ~500KB module)
			if (!this.pixiRenderer) {
				callbacks.onPixiLoading(true);
				callbacks.onPixiError(null);

				const pixiResult = await loadPixiRenderer();
				callbacks.onPixiLoading(false);

				// Check if destroyed during async operation
				if (this.destroyRequested) {
					this.isInitializing = false;
					return { success: false, error: "Destroyed during initialization" };
				}

				if (!pixiResult.success) {
					callbacks.onPixiError(pixiResult.error ?? "Unknown PixiJS error");
					this.isInitializing = false;
					return { success: false, error: pixiResult.error };
				}

				this.pixiRenderer = pixiResult.renderer!;
				callbacks.onPixiRendererReady(this.pixiRenderer);

				// Initialize pre-computation now that pixi is available
				deps.initializePrecomputationService();
			}

			// Step 3: Verify container is still valid and not destroyed
			if (!deps.containerElement || this.destroyRequested) {
				this.isInitializing = false;
				return { success: false, error: this.destroyRequested ? "Destroyed during initialization" : "Container element became null during initialization" };
			}

			// Step 4: Initialize PixiJS renderer
			await this.pixiRenderer.initialize(
				deps.containerElement,
				DEFAULT_CANVAS_SIZE,
				deps.backgroundAlpha
			);

			// Check if destroyed during async operation
			if (this.destroyRequested) {
				this.pixiRenderer?.destroy();
				this.pixiRenderer = null;
				this.isInitializing = false;
				return { success: false, error: "Destroyed during initialization" };
			}

			// Step 5: Initialize texture services
			deps.initializePropTextureService();

			// Step 6: Load initial textures
			const initialGridMode = deps.gridMode?.toString() ?? "diamond";
			await Promise.all([
				this.pixiRenderer.loadGridTexture(initialGridMode),
				deps.loadPropTextures(),
			]);

			// Final check if destroyed during texture loading
			if (this.destroyRequested) {
				this.pixiRenderer?.destroy();
				this.pixiRenderer = null;
				this.isInitializing = false;
				return { success: false, error: "Destroyed during initialization" };
			}

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

			this.isInitializing = false;
			return { success: true, canvas };
		} catch (err) {
			const error = err instanceof Error ? err.message : "Unknown initialization error";
			console.error("Failed to initialize PixiJS renderer:", err);
			this.isInitializing = false;
			return { success: false, error };
		}
	}

	destroy(callbacks: Pick<InitializerCallbacks, 'onCanvasReady' | 'onInitialized'>): void {
		// Signal any in-progress initialization to abort
		this.destroyRequested = true;

		// Only destroy renderer if not currently initializing (let init handle its own cleanup)
		if (!this.isInitializing && this.pixiRenderer) {
			this.pixiRenderer.destroy();
			this.pixiRenderer = null;
		}

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
