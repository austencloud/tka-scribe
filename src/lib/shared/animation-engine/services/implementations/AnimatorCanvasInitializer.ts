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

	async initialize(
		deps: InitializerDependencies,
		callbacks: InitializerCallbacks
	): Promise<InitializationResult> {
		// Guard against concurrent initializations
		if (this.isInitializing) {
			console.log("[AnimatorCanvasInitializer] Skipping - already initializing");
			return { success: false, error: "Initialization already in progress" };
		}
		if (this.initialized) {
			console.log("[AnimatorCanvasInitializer] Skipping - already initialized");
			return { success: true, canvas: this.pixiRenderer?.getCanvas() };
		}

		console.log("[AnimatorCanvasInitializer] Starting initialization...");
		this.isInitializing = true;

		try {
			// Step 1: Load animator services (DI container services)
			console.log("[AnimatorCanvasInitializer] Step 1: Loading animator services...");
			const servicesLoaded = await deps.loadAnimatorServices();
			if (!servicesLoaded) {
				this.isInitializing = false;
				return { success: false, error: "Failed to load animator services" };
			}

			// Step 2: Load PixiJS renderer (heavy ~500KB module)
			if (!this.pixiRenderer) {
				console.log("[AnimatorCanvasInitializer] Step 2: Loading PixiJS renderer...");
				callbacks.onPixiLoading(true);
				callbacks.onPixiError(null);

				const pixiResult = await loadPixiRenderer();
				callbacks.onPixiLoading(false);

				if (!pixiResult.success) {
					callbacks.onPixiError(pixiResult.error ?? "Unknown PixiJS error");
					this.isInitializing = false;
					return { success: false, error: pixiResult.error };
				}

				console.log("[AnimatorCanvasInitializer] PixiJS loaded successfully");
				this.pixiRenderer = pixiResult.renderer!;
				callbacks.onPixiRendererReady(this.pixiRenderer);

				// Initialize pre-computation now that pixi is available
				deps.initializePrecomputationService();
			}

			// Step 3: Verify container is still valid
			if (!deps.containerElement) {
				this.isInitializing = false;
				return { success: false, error: "Container element became null during initialization" };
			}

			// Step 4: Initialize PixiJS renderer
			console.log("[AnimatorCanvasInitializer] Step 4: Initializing PixiJS renderer...");
			await this.pixiRenderer.initialize(
				deps.containerElement,
				DEFAULT_CANVAS_SIZE,
				deps.backgroundAlpha
			);
			console.log("[AnimatorCanvasInitializer] PixiJS renderer initialized");

			// Step 5: Initialize texture services
			console.log("[AnimatorCanvasInitializer] Step 5: Initializing prop texture service...");
			deps.initializePropTextureService();

			// Step 6: Load initial textures
			const initialGridMode = deps.gridMode?.toString() ?? "diamond";
			console.log("[AnimatorCanvasInitializer] Step 6: Loading textures (grid: %s)...", initialGridMode);
			await Promise.all([
				this.pixiRenderer.loadGridTexture(initialGridMode),
				deps.loadPropTextures(),
			]);
			console.log("[AnimatorCanvasInitializer] Textures loaded");

			// Step 7: Mark as initialized
			this.initialized = true;
			callbacks.onInitialized(true);

			const canvas = this.pixiRenderer.getCanvas();
			callbacks.onCanvasReady(canvas);
			console.log("[AnimatorCanvasInitializer] Step 7: Marked as initialized, canvas ready");

			// Step 8: Set up remaining services
			console.log("[AnimatorCanvasInitializer] Step 8: Setting up remaining services...");
			deps.initializeResizeService();
			deps.initializeGlyphTextureService();
			deps.initializeRenderLoopService();

			// Step 9: Start render loop
			console.log("[AnimatorCanvasInitializer] Step 9: Starting render loop...");
			deps.startRenderLoop();

			console.log("[AnimatorCanvasInitializer] Initialization complete!");
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
		this.pixiRenderer?.destroy();
		this.pixiRenderer = null;
		this.initialized = false;
		this.isInitializing = false;
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
