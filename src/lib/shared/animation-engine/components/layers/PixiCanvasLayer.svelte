<!--
PixiCanvasLayer.svelte

WebGL rendering layer powered by PixiJS.
Handles canvas initialization, render loop, resize observer, and cleanup.
-->

<script lang="ts">
	import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
	import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
	import type { PropState } from "$lib/shared/animation-engine/domain/PropState";
	import type { TrailPoint, TrailSettings } from "$lib/features/compose/shared/domain/types/TrailTypes";
	import { DEFAULT_TRAIL_SETTINGS } from "$lib/features/compose/shared/domain/types/TrailTypes";

	const DEFAULT_CANVAS_SIZE = 500;

	// Props
	let {
		pixiRenderer = null,
		canvasSize = DEFAULT_CANVAS_SIZE,
		backgroundAlpha = 1,
		containerElement = null,
		blueProp = null,
		redProp = null,
		secondaryBlueProp = null,
		secondaryRedProp = null,
		bluePropDimensions = { width: 252.8, height: 77.8 },
		redPropDimensions = { width: 252.8, height: 77.8 },
		gridVisible = true,
		gridMode = null,
		blueTrailPoints = [],
		redTrailPoints = [],
		secondaryBlueTrailPoints = [],
		secondaryRedTrailPoints = [],
		trailSettings = { ...DEFAULT_TRAIL_SETTINGS, enabled: false },
		needsRender = true,
		currentTime = 0,
		onCanvasReady = () => {},
		onResize = () => {},
	}: {
		pixiRenderer: IPixiAnimationRenderer | null;
		canvasSize: number;
		backgroundAlpha: number;
		containerElement: HTMLDivElement | null;
		blueProp: PropState | null;
		redProp: PropState | null;
		secondaryBlueProp: PropState | null;
		secondaryRedProp: PropState | null;
		bluePropDimensions: { width: number; height: number };
		redPropDimensions: { width: number; height: number };
		gridVisible: boolean;
		gridMode: GridMode | null;
		blueTrailPoints: TrailPoint[];
		redTrailPoints: TrailPoint[];
		secondaryBlueTrailPoints: TrailPoint[];
		secondaryRedTrailPoints: TrailPoint[];
		trailSettings: TrailSettings;
		needsRender: boolean;
		currentTime: number;
		onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
		onResize?: (newSize: number) => void;
	} = $props();

	let localContainerElement: HTMLDivElement;
	let resizeObserver: ResizeObserver | null = null;
	let rafId: number | null = null;
	let isInitialized = $state(false);
	let hasLoggedFirstRender = $state(false);
	let localNeedsRender = $state(true); // Local render trigger state
	let currentRendererSize = DEFAULT_CANVAS_SIZE; // Track actual renderer size locally

	// ============================================================================
	// INITIALIZE PIXIJS RENDERER
	// ============================================================================

	$effect(() => {
		// Wait for BOTH: local container element AND pixiRenderer service
		if (!localContainerElement || !pixiRenderer) return;

		const initialize = async () => {
			try {
				// Initialize PixiJS renderer into our LOCAL container div
				await pixiRenderer?.initialize(
					localContainerElement,
					DEFAULT_CANVAS_SIZE,
					backgroundAlpha
				);

				// Load initial textures (grid + props)
				const initialGridMode = gridMode?.toString() ?? "diamond";
				await Promise.all([
					pixiRenderer?.loadGridTexture(initialGridMode),
					pixiRenderer?.loadPerColorPropTextures("staff", "staff"),
				]);

				isInitialized = true;
				const canvas = pixiRenderer?.getCanvas();
				onCanvasReady?.(canvas);

				// Set up resize observer
				setupResizeObserver();

				// CRITICAL: Perform initial resize to match container size
				// ResizeObserver may not fire immediately if layout isn't complete
				await resizeCanvas();

				// Start render loop
				startRenderLoop();
			} catch (err) {
				console.error("Failed to initialize PixiJS renderer:", err);
			}
		};

		initialize();

		return () => {
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
			teardownResizeObserver();
			pixiRenderer?.destroy();
			onCanvasReady?.(null);
			isInitialized = false;
		};
	});

	// ============================================================================
	// GRID MODE CHANGES
	// ============================================================================

	let previousGridMode = $state<string | null>(gridMode?.toString() ?? null);
	$effect(() => {
		const currentGridMode = gridMode?.toString() ?? null;
		if (isInitialized && pixiRenderer && currentGridMode !== previousGridMode) {
			previousGridMode = currentGridMode;
			// Reload grid texture with new mode
			pixiRenderer
				?.loadGridTexture(currentGridMode ?? "diamond")
				.then(() => {
					startRenderLoop();
				});
		}
	});

	// ============================================================================
	// RESIZE OBSERVER & CANVAS RESIZING
	// ============================================================================

	function setupResizeObserver() {
		teardownResizeObserver();

		if (typeof ResizeObserver !== "undefined" && localContainerElement) {
			resizeObserver = new ResizeObserver(() => {
				resizeCanvas();
			});
			resizeObserver.observe(localContainerElement);
		}

		if (typeof window !== "undefined") {
			window.addEventListener("resize", resizeCanvas);
		}
	}

	function teardownResizeObserver() {
		resizeObserver?.disconnect();
		resizeObserver = null;
		if (typeof window !== "undefined") {
			window.removeEventListener("resize", resizeCanvas);
		}
	}

	async function resizeCanvas() {
		if (!localContainerElement || !pixiRenderer) return;

		const rect = localContainerElement.getBoundingClientRect();
		const newSize =
			(Math.min(
				rect.width || DEFAULT_CANVAS_SIZE,
				rect.height || DEFAULT_CANVAS_SIZE
			) || DEFAULT_CANVAS_SIZE);

		console.log(`[PixiCanvasLayer] resizeCanvas called:`, {
			rectWidth: rect.width,
			rectHeight: rect.height,
			newSize,
			currentRendererSize,
			canvasSizeProp: canvasSize,
			willResize: newSize !== currentRendererSize && newSize > 0
		});

		// Compare against local renderer size, not the prop
		// This ensures resize happens even if prop hasn't updated yet
		if (newSize !== currentRendererSize && newSize > 0) {
			currentRendererSize = newSize;
			await pixiRenderer.resize(newSize);
			console.log(`[PixiCanvasLayer] Resized to ${newSize}`);
			onResize?.(newSize);
			startRenderLoop();
		}
	}

	// ============================================================================
	// RENDER LOOP
	// ============================================================================

	let lastFrameTime = performance.now();

	function renderLoop(currentFrameTime?: number): void {
		if (!isInitialized) {
			rafId = null;
			return;
		}

		const now = currentFrameTime ?? performance.now();

		// Render if needed (from props or local state)
		if (needsRender || localNeedsRender) {
			render(now);
			lastFrameTime = now;
			localNeedsRender = false; // Clear local trigger after render
		}

		// Continue loop if trails active (they need continuous updates)
		if (trailSettings.enabled && trailSettings.mode !== "off") {
			rafId = requestAnimationFrame(renderLoop);
		} else {
			rafId = null;
		}
	}

	function startRenderLoop(): void {
		if (rafId === null && isInitialized) {
			rafId = requestAnimationFrame(renderLoop);
		}
	}

	// ============================================================================
	// RENDER FUNCTION
	// ============================================================================

	function render(currentFrameTime: number): void {
		if (!isInitialized || !pixiRenderer) return;

		if (!hasLoggedFirstRender) {
			console.log(`[PixiCanvasLayer] First render:`, {
				currentRendererSize,
				canvasSizeProp: canvasSize,
				bluePropDimensions: { width: bluePropDimensions.width, height: bluePropDimensions.height },
				redPropDimensions: { width: redPropDimensions.width, height: redPropDimensions.height },
				hasBlueProp: !!blueProp,
				hasRedProp: !!redProp,
				bluePropState: blueProp ? {
					centerPathAngle: blueProp.centerPathAngle,
					staffRotationAngle: blueProp.staffRotationAngle,
					x: blueProp.x,
					y: blueProp.y
				} : null
			});
			hasLoggedFirstRender = true;
		}

		// Render scene using PixiJS
		pixiRenderer.renderScene({
			blueProp: blueProp || null,
			redProp: redProp || null,
			secondaryBlueProp: secondaryBlueProp || null,
			secondaryRedProp: secondaryRedProp || null,
			gridVisible,
			gridMode: gridMode?.toString() ?? null,
			letter: null,
			turnsTuple: null,
			bluePropDimensions,
			redPropDimensions,
			blueTrailPoints,
			redTrailPoints,
			secondaryBlueTrailPoints,
			secondaryRedTrailPoints,
			trailSettings,
			currentTime: currentFrameTime,
		});
	}

	// ============================================================================
	// TRIGGER RENDER ON PROP CHANGES
	// ============================================================================

	$effect(() => {
		// Track prop changes to trigger re-render
		blueProp;
		redProp;
		gridVisible;
		gridMode;
		blueTrailPoints;
		redTrailPoints;
		secondaryBlueTrailPoints;
		secondaryRedTrailPoints;
		trailSettings;

		// Set local render flag and start loop
		localNeedsRender = true;
		startRenderLoop();
	});
</script>

<div class="pixi-canvas-container" bind:this={localContainerElement}>
	<!-- PixiJS canvas injected here -->
</div>

<style>
	.pixi-canvas-container {
		position: absolute;
		inset: 0;
		z-index: 1;
	}

	.pixi-canvas-container :global(canvas) {
		border: 1px solid rgba(229, 231, 235, 0.4);
		border-radius: 2px;
		background: var(--canvas-bg, #ffffff);
		display: block;
		width: 100%;
		height: 100%;
	}

	:global([data-transparent="true"]) .pixi-canvas-container :global(canvas) {
		background: transparent !important;
		border: none !important;
		--canvas-bg: transparent;
	}
</style>
