<!--
AnimatorCanvas.svelte

Orchestrates animation rendering through a layered architecture.
Layers (in z-index order): PixiCanvasLayer → SVGGridLayer → GlyphOverlayLayer
Services: PixiAnimationRenderer, SVGGenerator, SequenceAnimationOrchestrator, TrailCaptureService

This component maintains 100% backward compatibility with the original 1,316-line monolithic version.
Logic has been extracted into focused layer components and state management.
-->

<script lang="ts">
	import { onMount } from "svelte";
	import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
	import {
		resolve,
		loadPixiModule,
		loadFeatureModule,
	} from "$lib/shared/inversify/di";
	import { TYPES } from "$lib/shared/inversify/types";

	import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
	import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
	import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
	import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
	import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
	import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
	import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
	import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";
	import type { ISequenceAnimationOrchestrator } from "$lib/features/compose/services/contracts/ISequenceAnimationOrchestrator";
	import type { ISettingsState } from "../../settings/services/contracts/ISettingsState";
	import type { PropState } from "../domain/PropState";
	import type { TrailSettings, TrailPoint } from "$lib/features/compose/shared/domain/types/TrailTypes";
	import type { PreRenderProgress } from "$lib/features/compose/services/implementations/SequenceFramePreRenderer";
	import { SequenceFramePreRenderer } from "$lib/features/compose/services/implementations/SequenceFramePreRenderer";
	import { AnimationPathCache } from "$lib/features/compose/services/implementations/AnimationPathCache";
	import { preloadLetterDimensions } from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";

	import { getAnimationVisibilityManager } from "../state/animation-visibility-state.svelte";
	import { createAnimatorCanvasState } from "$lib/features/compose/state/animator-canvas-state.svelte";

	import PixiCanvasLayer from "./layers/PixiCanvasLayer.svelte";
	import TrailLayer from "./layers/TrailLayer.svelte";
	import GlyphOverlayLayer from "./layers/GlyphOverlayLayer.svelte";

	// ============================================================================
	// PROPS - 100% backward compatible
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
		letter?: Letter | null;
		beatData?: StartPositionData | BeatData | null;
		sequenceData?: SequenceData | null;
		currentBeat?: number;
		isPlaying?: boolean;
		onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
		onPlaybackToggle?: () => void;
		trailSettings?: TrailSettings;
	} = $props();

	// ============================================================================
	// STATE MANAGEMENT
	// ============================================================================

	// Get visibility manager and create state wrapper
	const visibilityManager = getAnimationVisibilityManager();
	const canvasState = createAnimatorCanvasState(
		externalTrailSettings,
		visibilityManager
	);

	// Beat number calculation (unchanged from original)
	const beatNumber = $derived.by(() => {
		if (!sequenceData || !beatData) return 0;
		if ("beatNumber" in beatData && typeof beatData.beatNumber === "number") {
			return beatData.beatNumber;
		}
		const beatIndex = sequenceData.beats?.findIndex((b) => b === beatData);
		return beatIndex >= 0 ? beatIndex + 1 : 0;
	});

	// ============================================================================
	// SERVICES (lazy loaded)
	// ============================================================================

	let pixiRenderer = $state<IPixiAnimationRenderer | null>(null);
	let svgGenerator = $state<ISVGGenerator | null>(null);
	let settingsService = $state<ISettingsState | null>(null);
	let orchestrator = $state<ISequenceAnimationOrchestrator | null>(null);
	let trailCaptureService = $state<ITrailCaptureService | null>(null);
	let turnsTupleGenerator = $state<ITurnsTupleGeneratorService | null>(null);

	// Frame pre-renderer for perfect playback
	let framePreRenderer = $state<SequenceFramePreRenderer | null>(null);

	// Animation path cache for gap-free trails
	let pathCache = $state<AnimationPathCache | null>(null);
	let isCachePrecomputing = $state(false);
	let cacheSequenceId = $state<string | null>(null);

	// Frame pre-render state
	let isPreRendering = $state(false);
	let preRenderProgress = $state<PreRenderProgress | null>(null);
	let preRenderedFramesReady = $state(false);

	// ============================================================================
	// SERVICE LOADING
	// ============================================================================

	async function loadAnimatorServices(): Promise<boolean> {
		try {
			await loadFeatureModule("animate");
			svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;
			settingsService = resolve(TYPES.ISettingsState) as ISettingsState;
			orchestrator = resolve(TYPES.ISequenceAnimationOrchestrator) as ISequenceAnimationOrchestrator;
			trailCaptureService = resolve(TYPES.ITrailCaptureService) as ITrailCaptureService;
			turnsTupleGenerator = resolve(TYPES.ITurnsTupleGeneratorService) as ITurnsTupleGeneratorService;
			canvasState.setServicesReady(true);
			return true;
		} catch (err) {
			console.error("Failed to load animator services:", err);
			canvasState.setPixiError("Failed to load animation services");
			return false;
		}
	}

	async function loadPixiServices(): Promise<void> {
		try {
			canvasState.setPixiLoading(true);
			canvasState.setPixiError(null);
			await loadPixiModule();
			pixiRenderer = resolve(TYPES.IPixiAnimationRenderer) as IPixiAnimationRenderer;
			if (orchestrator) {
				framePreRenderer = new SequenceFramePreRenderer(orchestrator, pixiRenderer);
			}
		} catch (err) {
			canvasState.setPixiError("Failed to load animation renderer");
			console.error("Failed to load Pixi module:", err);
		} finally {
			canvasState.setPixiLoading(false);
		}
	}

	// ============================================================================
	// INITIALIZATION & VISIBILITY SYNC
	// ============================================================================

	onMount(() => {
		loadAnimatorServices().then((success) => {
			if (success) loadPixiServices();
		});

		// Sync visibility from manager
		const observer = () => canvasState.syncVisibilityFromManager(visibilityManager);
		visibilityManager.registerObserver(observer);

		return () => {
			visibilityManager.unregisterObserver(observer);
			pixiRenderer?.destroy();
		};
	});

	// ============================================================================
	// TRAIL AGGREGATION
	// ============================================================================

	let trailPoints = $state<{
		blue: TrailPoint[];
		red: TrailPoint[];
		secondaryBlue: TrailPoint[];
		secondaryRed: TrailPoint[];
	}>({ blue: [], red: [], secondaryBlue: [], secondaryRed: [] });

	function handleTrailPointsUpdate(points: typeof trailPoints) {
		trailPoints = points;
	}

	// ============================================================================
	// CACHE PRE-COMPUTATION & PRE-RENDERING
	// ============================================================================

	async function precomputeAnimationPaths(
		seqData: SequenceData,
		totalBeats: number,
		beatDurationMs: number
	): Promise<void> {
		if (!orchestrator || !trailCaptureService) return;

		try {
			isCachePrecomputing = true;

			if (!pathCache) {
				pathCache = new AnimationPathCache({
					cacheFps: 120,
					canvasSize: 950,
					propDimensions: canvasState.bluePropDimensions,
				});
				trailCaptureService.setAnimationCacheService(pathCache as any);
			}

			const initSuccess = orchestrator.initializeWithDomainData(seqData);
			if (!initSuccess) {
				throw new Error("Failed to initialize orchestrator");
			}

			const calculateStateFunc = (beat: number) => {
				orchestrator!.calculateState(beat);
				return {
					blueProp: orchestrator!.getBluePropState(),
					redProp: orchestrator!.getRedPropState(),
				};
			};

			const cacheData = await pathCache.precomputePaths(
				calculateStateFunc,
				totalBeats,
				beatDurationMs
			);

			canvasState.setPathCacheData(cacheData);
		} catch (error) {
			console.error("Failed to pre-compute animation paths:", error);
			canvasState.setPathCacheData(null);
		} finally {
			isCachePrecomputing = false;
		}
	}

	// ============================================================================
	// EFFECTS - Lifecycle & Reactive Updates
	// ============================================================================

	// Preload glyph dimensions
	$effect(() => {
		if (!sequenceData?.beats?.length) return;
		const letters = sequenceData.beats.map((beat) => beat.letter);
		preloadLetterDimensions(letters);
	});

	// Clear caches on sequence change
	let previousSequenceId = $state<string | null>(null);
	$effect(() => {
		if (!sequenceData) {
			pathCache?.clear();
			framePreRenderer?.clear();
			trailCaptureService?.clearTrails();
			previousSequenceId = null;
			cacheSequenceId = null;
			preRenderedFramesReady = false;
			return;
		}

		const word = sequenceData.word || sequenceData.name || "unknown";
		const totalBeats = sequenceData.beats?.length || 0;
		const newSequenceId = `${word}-${totalBeats}`;

		if (previousSequenceId !== null && previousSequenceId !== newSequenceId) {
			pathCache?.clear();
			framePreRenderer?.clear();
			trailCaptureService?.clearTrails();
			cacheSequenceId = null;
			preRenderedFramesReady = false;
		}

		previousSequenceId = newSequenceId;
	});

	// Clear frames when playback stops
	$effect(() => {
		if (!isPlaying && framePreRenderer && preRenderedFramesReady) {
			framePreRenderer.clear();
			preRenderedFramesReady = false;
		}
	});

	// Cache pre-computation
	$effect(() => {
		if (!sequenceData) return;
		const word = sequenceData.word || sequenceData.name || "unknown";
		const totalBeats = sequenceData.beats?.length || 0;
		const sequenceId = `${word}-${totalBeats}`;

		if (sequenceId !== cacheSequenceId && totalBeats > 0) {
			cacheSequenceId = sequenceId;
			precomputeAnimationPaths(sequenceData, totalBeats, 1000);
		}
	});
</script>

<!-- Layer stack (z-index order: 1 → 5 → 15 → 20) -->
<div class="canvas-wrapper" bind:this={canvasState.containerElement} data-transparent={backgroundAlpha === 0 ? "true" : "false"}>
	<!-- Layer 1: WebGL Canvas -->
	<PixiCanvasLayer
		{pixiRenderer}
		canvasSize={canvasState.canvasSize}
		{backgroundAlpha}
		containerElement={canvasState.containerElement}
		blueProp={canvasState.propsVisible && canvasState.blueMotionVisible ? blueProp : null}
		redProp={canvasState.propsVisible && canvasState.redMotionVisible ? redProp : null}
		secondaryBlueProp={canvasState.propsVisible && canvasState.blueMotionVisible ? secondaryBlueProp : null}
		secondaryRedProp={canvasState.propsVisible && canvasState.redMotionVisible ? secondaryRedProp : null}
		bluePropDimensions={canvasState.bluePropDimensions}
		redPropDimensions={canvasState.redPropDimensions}
		gridVisible={gridVisible && canvasState.gridVisible}
		{gridMode}
		blueTrailPoints={canvasState.trailsVisible ? trailPoints.blue : []}
		redTrailPoints={canvasState.trailsVisible ? trailPoints.red : []}
		secondaryBlueTrailPoints={canvasState.trailsVisible ? trailPoints.secondaryBlue : []}
		secondaryRedTrailPoints={canvasState.trailsVisible ? trailPoints.secondaryRed : []}
		trailSettings={canvasState.trailSettings}
		needsRender={canvasState.needsRender}
		currentTime={performance.now()}
		{onCanvasReady}
		onResize={(newSize) => canvasState.setCanvasSize(newSize)}
	/>

	<!-- Trail Capture Logic (no visual output) -->
	<TrailLayer
		{trailCaptureService}
		{pathCache}
		canvasSize={canvasState.canvasSize}
		{blueProp}
		{redProp}
		{secondaryBlueProp}
		{secondaryRedProp}
		bluePropDimensions={canvasState.bluePropDimensions}
		redPropDimensions={canvasState.redPropDimensions}
		trailSettings={canvasState.trailSettings}
		trailsVisible={canvasState.trailsVisible}
		{currentBeat}
		{beatData}
		{isPlaying}
		onTrailPointsUpdate={handleTrailPointsUpdate}
	/>

	<!-- Layer 15: Glyph Overlay -->
	<GlyphOverlayLayer
		{pixiRenderer}
		{turnsTupleGenerator}
		{letter}
		{beatData}
		{beatNumber}
		tkaGlyphVisible={canvasState.tkaGlyphVisible}
		beatNumbersVisible={canvasState.beatNumbersVisible}
	/>

	<!-- Layer 20: Badges -->
	{#if isPreRendering && preRenderProgress}
		<div class="pre-render-badge">
			<div class="badge-content">
				<div class="spinner-small"></div>
				<span>Optimizing... {Math.round(preRenderProgress.percent)}%</span>
			</div>
			<div class="progress-bar">
				<div
					class="progress-fill"
					style="width: {preRenderProgress.percent}%"
				></div>
			</div>
		</div>
	{/if}

	{#if preRenderedFramesReady}
		<div class="perfect-mode-badge">✨ Perfect Playback</div>
	{/if}
</div>

<style>
	.canvas-wrapper {
		position: relative;
		aspect-ratio: 1 / 1;
		width: 100%;
		max-width: 100%;
		max-height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.pre-render-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(8px);
		color: white;
		padding: 8px 12px;
		border-radius: 8px;
		font-size: 11px;
		font-weight: 500;
		z-index: 20;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		min-width: 140px;
	}

	.badge-content {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 6px;
	}

	.spinner-small {
		width: 12px;
		height: 12px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.progress-bar {
		width: 100%;
		height: 3px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #4ade80, #22c55e);
		transition: width 0.3s ease;
	}

	.perfect-mode-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		background: linear-gradient(135deg, #22c55e, #16a34a);
		color: white;
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 11px;
		font-weight: 600;
		z-index: 20;
		box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
		animation: fadeInOut 3s ease forwards;
	}

	@keyframes fadeInOut {
		0% {
			opacity: 0;
			transform: translateY(-10px);
		}
		10% {
			opacity: 1;
			transform: translateY(0);
		}
		90% {
			opacity: 1;
			transform: translateY(0);
		}
		100% {
			opacity: 0;
			transform: translateY(-10px);
		}
	}
</style>
