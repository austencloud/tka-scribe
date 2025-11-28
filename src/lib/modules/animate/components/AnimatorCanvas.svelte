<!--
AnimatorCanvas.svelte

PixiJS-powered canvas component for rendering animated prop positions.
Handles prop visualization, trail effects, and glyph rendering using WebGL.
-->
<script lang="ts">
import {
		GridMode,
		resolve,
		TYPES,
		type ISettingsService,
		type SequenceData,
	} from "$lib/shared";
import type { StartPositionData } from "../../create/shared/domain/models/StartPositionData";
import type { BeatData } from "../../create/shared/domain/models/BeatData";
	import type { PropState } from "../domain/types/PropState";
	import type { IPixiAnimationRenderer } from "../services/contracts/IPixiAnimationRenderer";
	import type { ISVGGenerator } from "../services/contracts/ISVGGenerator";
	import type { ITrailCaptureService } from "../services/contracts/ITrailCaptureService";
	import type { ISequenceAnimationOrchestrator } from "../services/contracts/ISequenceAnimationOrchestrator";
	import { type TrailPoint, type TrailSettings, TrailMode } from "../domain/types/TrailTypes";
	import { AnimationPathCache } from "../services/implementations/AnimationPathCache";
	import { SequenceFramePreRenderer } from "../services/implementations/SequenceFramePreRenderer";

	// Extracted components
	import GlyphRenderer from "./GlyphRenderer.svelte";
	import PreRenderProgressBadge from "./PreRenderProgressBadge.svelte";
	import PlayPauseButton from "./PlayPauseButton.svelte";

	// State and utilities
	import {
		createAnimatorCanvasState,
		DEFAULT_CANVAS_SIZE,
	} from "../state/animator-canvas-state.svelte";
	import { createResizeControls } from "../utils/canvas-resize-utils";
	import { loadTrailSettings, saveTrailSettings } from "../utils/animation-panel-persistence";

	// ============================================================================
	// SERVICE RESOLUTION
	// ============================================================================

	const pixiRenderer = resolve(TYPES.IPixiAnimationRenderer) as IPixiAnimationRenderer;
	const svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;
	const settingsService = resolve(TYPES.ISettingsService) as ISettingsService;
	const orchestrator = resolve(TYPES.ISequenceAnimationOrchestrator) as ISequenceAnimationOrchestrator;
	const trailCaptureService = resolve(TYPES.ITrailCaptureService) as ITrailCaptureService;

	// Frame pre-renderer for perfect smooth playback
	const framePreRenderer = new SequenceFramePreRenderer(orchestrator, pixiRenderer);

	// ============================================================================
	// PROPS
	// ============================================================================

	let {
		blueProp,
		redProp,
		secondaryBlueProp = null,
		secondaryRedProp = null,
		gridVisible = true,
		gridMode = GridMode.DIAMOND,
		backgroundAlpha = 1,
		letter = null,
		beatData = null,
		sequenceData = null,
		currentBeat = 0,
		isPlaying = false,
		onCanvasReady = () => {},
		onPlaybackToggle = () => {},
		trailSettings: externalTrailSettings = $bindable(),
	}: {
		blueProp: PropState | null;
		redProp: PropState | null;
		secondaryBlueProp?: PropState | null;
		secondaryRedProp?: PropState | null;
		gridVisible?: boolean;
		gridMode?: GridMode | null;
		backgroundAlpha?: number;
		letter?: import("$shared").Letter | null;
		beatData?: StartPositionData | BeatData | null;
		sequenceData?: SequenceData | null;
		currentBeat?: number;
		isPlaying?: boolean;
		onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
		onPlaybackToggle?: () => void;
		trailSettings?: TrailSettings;
	} = $props();

	// ============================================================================
	// STATE
	// ============================================================================

	const canvasState = createAnimatorCanvasState(externalTrailSettings);

	// Local state not in factory (DOM refs, animation frame)
	let containerElement: HTMLDivElement;
	let canvasElement: HTMLCanvasElement | null = $state(null);
	let buttonBottom = $state(16); // Fallback: 16px from container bottom
	let buttonLeft = $state(50); // Fallback: center (50%)
	let usePixelPosition = $state(false); // Track if we have actual measurements
	let rafId: number | null = null;

	// Derived button style based on measurements
	let buttonStyle = $derived.by(() => {
		if (usePixelPosition) {
			return `bottom: ${buttonBottom}px; left: ${buttonLeft}px; transform: translateX(-50%);`;
		}
		// CSS fallback - positioned at center bottom of container
		return "";
	});

	// Path cache instance (not in state factory as it's a complex object)
	let pathCache: AnimationPathCache | null = $state(null);

	// ============================================================================
	// RESIZE HANDLING
	// ============================================================================

	const resizeControls = createResizeControls((newSize) => {
		canvasState.setCanvasSize(newSize);
		pixiRenderer.resize(newSize);
		trailCaptureService.updateConfig({ canvasSize: newSize });
		canvasState.triggerRender();
		startRenderLoop();
		// Update button position after a brief delay to allow layout to settle
		requestAnimationFrame(() => {
			updateButtonPosition();
		});
	});

	// ============================================================================
	// TRAIL SERVICE INITIALIZATION
	// ============================================================================

	$effect(() => {
		trailCaptureService.initialize({
			canvasSize: canvasState.canvasSize,
			bluePropDimensions: canvasState.bluePropDimensions,
			redPropDimensions: canvasState.redPropDimensions,
			trailSettings: canvasState.trailSettings,
		});
	});

	// ============================================================================
	// EFFECTS
	// ============================================================================

	// Track prop changes to trigger re-renders
	$effect(() => {
		blueProp;
		redProp;
		gridVisible;
		gridMode;
		letter;
		canvasState.triggerRender();
		startRenderLoop();
	});

	// Watch for trail settings changes
	$effect(() => {
		const currentMode = canvasState.trailSettings.mode;
		const currentEnabled = canvasState.trailSettings.enabled;

		trailCaptureService.updateSettings(canvasState.trailSettings);

		if (!currentEnabled || currentMode === TrailMode.OFF) {
			trailCaptureService.clearTrails();
		}

		saveTrailSettings(canvasState.trailSettings);
		if (externalTrailSettings !== undefined) {
			externalTrailSettings = canvasState.trailSettings;
		}
		canvasState.triggerRender();
		startRenderLoop();
	});

	// Sync external trail settings
	$effect(() => {
		if (externalTrailSettings !== undefined) {
			canvasState.setTrailSettings(externalTrailSettings);
		}
	});

	// Clear trails when props are hidden
	$effect(() => {
		if (!blueProp || !redProp) {
			trailCaptureService.clearTrails();
			canvasState.triggerRender();
		}
	});

	// Watch for prop type changes
	$effect(() => {
		const settings = settingsService.currentSettings;
		const newPropType = settings.propType || "staff";
		if (newPropType !== canvasState.currentPropType) {
			canvasState.setCurrentPropType(newPropType);
			canvasState.setIsInitialized(false);
			loadPropTextures();
		}
	});

	// Initialize PixiJS renderer
	$effect(() => {
		if (!containerElement) return;

		const initialize = async () => {
			try {
				if (!containerElement) {
					console.warn("Container element became null during initialization");
					return;
				}

				await pixiRenderer.initialize(containerElement, DEFAULT_CANVAS_SIZE, backgroundAlpha);

				await Promise.all([
					pixiRenderer.loadGridTexture(gridMode?.toString() ?? "diamond"),
					loadPropTextures(),
				]);

				canvasState.setIsInitialized(true);
				const canvas = pixiRenderer.getCanvas();
				canvasElement = canvas;
				onCanvasReady?.(canvas);

				// Delay button position update to ensure canvas layout is complete
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						updateButtonPosition();
					});
				});

				resizeControls.setup(containerElement);
				canvasState.triggerRender();
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
			resizeControls.teardown();
			pixiRenderer.destroy();
			onCanvasReady?.(null);
			canvasState.setIsInitialized(false);
		};
	});

	// ============================================================================
	// TEXTURE LOADING
	// ============================================================================

	async function loadPropTextures() {
		try {
			await pixiRenderer.loadPropTextures(canvasState.currentPropType);

			const [bluePropData, redPropData] = await Promise.all([
				svgGenerator.generateBluePropSvg(canvasState.currentPropType),
				svgGenerator.generateRedPropSvg(canvasState.currentPropType),
			]);

			canvasState.setPropDimensions(
				{ width: bluePropData.width, height: bluePropData.height },
				{ width: redPropData.width, height: redPropData.height }
			);

			trailCaptureService.updateConfig({
				bluePropDimensions: canvasState.bluePropDimensions,
				redPropDimensions: canvasState.redPropDimensions,
			});

			canvasState.triggerRender();
			startRenderLoop();
		} catch (err) {
			console.error("Failed to load prop textures:", err);
		}
	}

	// ============================================================================
	// BUTTON POSITIONING
	// ============================================================================

	// Watch for canvas element changes and update button position
	$effect(() => {
		const canvas = canvasElement;
		const container = containerElement;

		if (canvas && container) {
			// Use multiple delayed updates to ensure layout is stable
			const updateWithDelay = (delay: number) => {
				setTimeout(() => {
					updateButtonPosition();
				}, delay);
			};

			// Initial update
			updateButtonPosition();
			// Delayed updates to catch layout changes
			updateWithDelay(50);
			updateWithDelay(150);
			updateWithDelay(300);
		}
	});

	function updateButtonPosition() {
		if (!canvasElement || !containerElement) {
			console.log("[AnimatorCanvas] updateButtonPosition: missing elements", {
				hasCanvas: !!canvasElement,
				hasContainer: !!containerElement,
			});
			return;
		}

		const canvasRect = canvasElement.getBoundingClientRect();
		const containerRect = containerElement.getBoundingClientRect();

		// Skip if canvas has no dimensions yet
		if (canvasRect.width === 0 || canvasRect.height === 0) {
			console.log("[AnimatorCanvas] updateButtonPosition: canvas has no dimensions");
			return;
		}

		// Calculate button position relative to container, 16px from canvas bottom
		const newButtonBottom = containerRect.bottom - canvasRect.bottom + 16;
		const newButtonLeft = canvasRect.left - containerRect.left + canvasRect.width / 2;

		buttonBottom = newButtonBottom;
		buttonLeft = newButtonLeft;
		usePixelPosition = true;

		console.log(`[AnimatorCanvas] Button position updated:`, {
			buttonBottom: newButtonBottom,
			buttonLeft: newButtonLeft,
			canvasRect: { width: canvasRect.width, height: canvasRect.height, bottom: canvasRect.bottom },
			containerRect: { width: containerRect.width, height: containerRect.height, bottom: containerRect.bottom },
		});
	}

	// ============================================================================
	// GLYPH HANDLING
	// ============================================================================

	function handleGlyphSvgReady(
		svgString: string,
		width: number,
		height: number,
		_x: number,
		_y: number
	) {
		loadGlyphTexture(svgString, width, height);
	}

	async function loadGlyphTexture(svgString: string, width: number, height: number) {
		try {
			await pixiRenderer.loadGlyphTexture(svgString, width, height);
			canvasState.triggerRender();
			startRenderLoop();
		} catch (err) {
			console.error("[AnimatorCanvas] Failed to load glyph texture:", err);
		}
	}

	// ============================================================================
	// RENDER LOOP
	// ============================================================================

	function renderLoop(currentTime?: number): void {
		if (!canvasState.isInitialized) {
			rafId = null;
			return;
		}

		const now = currentTime ?? performance.now();

		if (canvasState.needsRender || (canvasState.trailSettings.enabled && canvasState.trailSettings.mode !== TrailMode.OFF)) {
			render(now);
			canvasState.setNeedsRender(false);
			rafId = requestAnimationFrame(renderLoop);
		} else {
			rafId = null;
		}
	}

	function startRenderLoop(): void {
		if (rafId === null && canvasState.isInitialized) {
			rafId = requestAnimationFrame(renderLoop);
		}
	}

	function render(currentTime: number): void {
		if (!canvasState.isInitialized) return;

		// MODE 1: Perfect Pre-rendered Frames (when ready)
		if (canvasState.preRenderedFramesReady && framePreRenderer.isReady()) {
			const frame = framePreRenderer.getFrameAtBeat(currentBeat);
			if (frame) {
				const canvas = pixiRenderer.getCanvas();
				if (canvas) {
					const ctx = canvas.getContext("2d");
					if (ctx) {
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
						return;
					}
				}
			}
		}

		// MODE 2: Preview/Live Rendering
		const blueMotion = beatData?.motions?.blue;
		const redMotion = beatData?.motions?.red;
		const turnsTuple = blueMotion && redMotion ? `${blueMotion.turns}${redMotion.turns}` : null;

		// Get trail points
		let blueTrailPoints: TrailPoint[] = [];
		let redTrailPoints: TrailPoint[] = [];
		let secondaryBlueTrailPoints: TrailPoint[] = [];
		let secondaryRedTrailPoints: TrailPoint[] = [];

		if (pathCache && pathCache.isValid() && currentBeat !== null) {
			const scaleFactor = canvasState.canvasSize / 950;

			const transformTrailPoints = (points: TrailPoint[]): TrailPoint[] => {
				return points.map((p) => ({
					...p,
					x: p.x * scaleFactor,
					y: p.y * scaleFactor,
				}));
			};

			const blueLeft = transformTrailPoints(pathCache.getTrailPoints(0, 0, 0, currentBeat));
			const blueRight = transformTrailPoints(pathCache.getTrailPoints(0, 1, 0, currentBeat));
			blueTrailPoints = [...blueLeft, ...blueRight];

			const redLeft = transformTrailPoints(pathCache.getTrailPoints(1, 0, 0, currentBeat));
			const redRight = transformTrailPoints(pathCache.getTrailPoints(1, 1, 0, currentBeat));
			redTrailPoints = [...redLeft, ...redRight];
		} else {
			const allTrails = trailCaptureService.getAllTrailPoints();
			blueTrailPoints = allTrails.blue;
			redTrailPoints = allTrails.red;
			secondaryBlueTrailPoints = allTrails.secondaryBlue;
			secondaryRedTrailPoints = allTrails.secondaryRed;
		}

		pixiRenderer.renderScene({
			blueProp,
			redProp,
			secondaryBlueProp,
			secondaryRedProp,
			gridVisible,
			gridMode: gridMode?.toString() ?? null,
			letter: letter ?? null,
			turnsTuple,
			bluePropDimensions: canvasState.bluePropDimensions,
			redPropDimensions: canvasState.redPropDimensions,
			blueTrailPoints,
			redTrailPoints,
			secondaryBlueTrailPoints,
			secondaryRedTrailPoints,
			trailSettings: canvasState.trailSettings,
			currentTime,
		});
	}
</script>

<!-- Hidden GlyphRenderer that converts TKAGlyph to SVG for PixiJS rendering -->
{#if letter}
	<GlyphRenderer {letter} {beatData} onSvgReady={handleGlyphSvgReady} />
{/if}

<div class="canvas-wrapper" bind:this={containerElement}>
	<PreRenderProgressBadge
		isPreRendering={canvasState.isPreRendering}
		progress={canvasState.preRenderProgress}
		isReady={canvasState.preRenderedFramesReady}
	/>

	<PlayPauseButton {isPlaying} onToggle={onPlaybackToggle} style={buttonStyle} />
</div>

<style>
	.canvas-wrapper {
		position: relative;
		aspect-ratio: 1 / 1;
		width: 100%;
		max-width: 100%;
		max-height: 100%;
		margin: auto;
	}

	.canvas-wrapper :global(canvas) {
		border: 1px solid rgba(229, 231, 235, 0.4);
		border-radius: 2px;
		background: #ffffff;
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
