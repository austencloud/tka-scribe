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
    type BeatData,
    type SequenceData,
  } from "$shared";
  import type { PropState } from "../domain/types/PropState";
  import type { IPixiAnimationRenderer } from "../services/contracts/IPixiAnimationRenderer";
  import type { ISVGGenerator } from "../services/contracts/ISVGGenerator";
  import type { ITrailCaptureService } from "../services/contracts/ITrailCaptureService";
  import GlyphRenderer from "./GlyphRenderer.svelte";
  import {
    type TrailPoint,
    type TrailSettings,
    TrailMode,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
  } from "../domain/types/TrailTypes";
  import {
    AnimationPathCache,
    type AnimationPathCacheData,
  } from "../services/implementations/AnimationPathCache";
  import type { ISequenceAnimationOrchestrator } from "../services/contracts/ISequenceAnimationOrchestrator";

  // Resolve services from DI container
  const pixiRenderer = resolve(
    TYPES.IPixiAnimationRenderer
  ) as IPixiAnimationRenderer;
  const svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;
  const settingsService = resolve(TYPES.ISettingsService) as ISettingsService;
  const orchestrator = resolve(
    TYPES.ISequenceAnimationOrchestrator
  ) as ISequenceAnimationOrchestrator;
  const trailCaptureService = resolve(
    TYPES.ITrailCaptureService
  ) as ITrailCaptureService;

  // Modern Svelte 5 props
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
    onCanvasReady = () => {},
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
    beatData?: BeatData | null;
    sequenceData?: SequenceData | null;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    trailSettings?: TrailSettings;
  } = $props();

  // Canvas size - controlled by CSS container queries
  const DEFAULT_CANVAS_SIZE = 500;
  let canvasSize = $state(DEFAULT_CANVAS_SIZE);
  let containerElement: HTMLDivElement;
  let resizeObserver: ResizeObserver | null = null;

  // ViewBox dimensions from the prop SVGs
  let bluePropDimensions = { width: 252.8, height: 77.8 };
  let redPropDimensions = { width: 252.8, height: 77.8 };
  let isInitialized = $state(false);
  let rafId: number | null = null;
  let needsRender = $state(true);
  let currentPropType = $state<string>("staff");

  // Trail settings (managed by TrailCaptureService)
  let trailSettings = $state<TrailSettings>(
    externalTrailSettings ?? loadTrailSettings()
  );

  // Path cache for gap-free trail rendering
  let pathCache = $state<AnimationPathCache | null>(null);
  let pathCacheData = $state<AnimationPathCacheData | null>(null);
  let isCachePrecomputing = $state(false);
  let cacheSequenceId = $state<string | null>(null);

  // ============================================================================
  // TRAIL SETTINGS PERSISTENCE
  // ============================================================================

  function loadTrailSettings(): TrailSettings {
    try {
      const stored = localStorage.getItem(TRAIL_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_TRAIL_SETTINGS,
          ...parsed,
        };
      }
    } catch (error) {
      console.error("Failed to load trail settings:", error);
    }
    return { ...DEFAULT_TRAIL_SETTINGS };
  }

  function saveTrailSettings(settings: TrailSettings): void {
    try {
      localStorage.setItem(
        TRAIL_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("Failed to save trail settings:", error);
    }
  }

  /**
   * Pre-compute animation paths for gap-free trail rendering
   * This runs synchronously to ensure cache is ready before playback
   */
  async function precomputeAnimationPaths(
    seqData: SequenceData,
    totalBeats: number,
    beatDurationMs: number
  ): Promise<void> {
    if (!trailSettings.usePathCache) {
      console.log("🔧 Path cache disabled in settings");
      pathCacheData = null;
      return;
    }

    // Pre-compute even if trails are disabled - cache will be ready when user enables trails
    // This provides instant smooth rendering when toggling trails on

    try {
      isCachePrecomputing = true;
      console.log(`🔄 Pre-computing animation paths...`);
      console.log(`   Total beats: ${totalBeats}`);
      console.log(`   Beat duration: ${beatDurationMs}ms`);
      console.log(`   Target FPS: 120`);

      // Create path cache instance if needed
      // IMPORTANT: Always use standard 950x950 coordinate system for cache (matches viewBox)
      // This makes cache resolution-independent - coordinates are scaled to actual canvas size during rendering
      if (!pathCache) {
        pathCache = new AnimationPathCache({
          cacheFps: 120, // High FPS for ultra-smooth trails
          canvasSize: 950, // Always use standard viewBox size for resolution-independent caching
          propDimensions: bluePropDimensions,
        });
        console.log(
          `   Created new AnimationPathCache instance (using 950x950 standard coordinate system)`
        );

        // Wire cache to trail capture service for backfill support
        trailCaptureService.setAnimationCacheService(pathCache as any);
      }

      // CRITICAL: Initialize orchestrator with sequence data BEFORE pre-computation!
      const initSuccess = orchestrator.initializeWithDomainData(seqData);
      if (!initSuccess) {
        throw new Error("Failed to initialize orchestrator with sequence data");
      }
      console.log(`   ✅ Orchestrator initialized with ${totalBeats} beats`);

      // Create function to calculate prop states at any beat
      const calculateStateFunc = (beat: number) => {
        orchestrator.calculateState(beat);
        return {
          blueProp: orchestrator.getBluePropState(),
          redProp: orchestrator.getRedPropState(),
        };
      };

      const startTime = performance.now();

      // Pre-compute paths
      const cacheData = await pathCache.precomputePaths(
        calculateStateFunc,
        totalBeats,
        beatDurationMs
      );

      const computeTime = performance.now() - startTime;

      pathCacheData = cacheData;

      console.log(
        `✅ Path cache READY! ${cacheData.bluePropPath.positions.length} points at ${cacheData.cacheFps} FPS (computed in ${computeTime.toFixed(1)}ms)`
      );
      console.log(`   Cache valid: ${pathCache.isValid()}`);
      console.log(`   Total duration: ${cacheData.totalDurationMs}ms`);
    } catch (error) {
      console.error("❌ Failed to pre-compute animation paths:", error);
      pathCacheData = null;
    } finally {
      isCachePrecomputing = false;
    }
  }

  // ============================================================================
  // TRAIL SERVICE INITIALIZATION
  // ============================================================================

  // Initialize trail capture service reactively
  $effect(() => {
    trailCaptureService.initialize({
      canvasSize,
      bluePropDimensions,
      redPropDimensions,
      trailSettings,
    });
  });

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  // Track prop changes to trigger re-renders
  $effect(() => {
    blueProp;
    redProp;
    gridVisible;
    gridMode;
    letter;
    needsRender = true;
    startRenderLoop();
  });

  // Watch for trail settings changes
  $effect(() => {
    const currentMode = trailSettings.mode;
    const currentEnabled = trailSettings.enabled;

    // Update service with new settings
    trailCaptureService.updateSettings(trailSettings);

    if (!currentEnabled || currentMode === TrailMode.OFF) {
      trailCaptureService.clearTrails();
    }

    saveTrailSettings(trailSettings);
    if (externalTrailSettings !== undefined) {
      externalTrailSettings = trailSettings;
    }
    needsRender = true;
    startRenderLoop();
  });

  // Sync external trail settings
  $effect(() => {
    if (externalTrailSettings !== undefined) {
      trailSettings = externalTrailSettings;
    }
  });

  // Clear trails when props are hidden
  $effect(() => {
    if (!blueProp || !redProp) {
      trailCaptureService.clearTrails();
      needsRender = true;
    }
  });

  // Watch for prop type changes
  $effect(() => {
    const settings = settingsService.currentSettings;
    const newPropType = settings.propType || "staff";
    if (newPropType !== currentPropType) {
      currentPropType = newPropType;
      isInitialized = false;
      loadPropTextures();
    }
  });

  // Pre-compute animation paths when a new sequence is loaded
  // Uses sequenceData directly instead of relying on orchestrator
  $effect(() => {
    const hasSequenceData = sequenceData !== null;
    const cacheEnabled = trailSettings.usePathCache;

    // Debug logging
    console.log("🔍 Pre-computation effect triggered");
    console.log(`   hasSequenceData: ${hasSequenceData}`);
    console.log(`   cacheEnabled: ${cacheEnabled}`);

    if (!hasSequenceData || !cacheEnabled) {
      console.log(`   ❌ No sequenceData or cache disabled`);
      return;
    }

    // Get sequence information from sequenceData
    const word = sequenceData.word || sequenceData.name || "unknown";
    const totalBeats = sequenceData.beats?.length || 0;
    const sequenceId = `${word}-${totalBeats}`;

    console.log(`   sequenceData: word="${word}", beats=${totalBeats}`);
    console.log(`   current cacheSequenceId: ${cacheSequenceId}`);
    console.log(`   new sequenceId: ${sequenceId}`);

    // Only pre-compute if this is a new sequence
    if (sequenceId !== cacheSequenceId && totalBeats > 0) {
      console.log(
        `   ✅ Triggering pre-computation for new sequence: ${sequenceId}`
      );
      cacheSequenceId = sequenceId;

      // Estimate beat duration from total beats
      // Assuming 60 BPM = 1000ms per beat as default
      const beatDurationMs = 1000; // Can be adjusted based on speed settings

      // Trigger async pre-computation (sequenceData is guaranteed non-null here)
      precomputeAnimationPaths(sequenceData, totalBeats, beatDurationMs);
    } else {
      console.log(`   ❌ Skipping pre-computation: same sequence or no beats`);
    }
  });

  // Initialize PixiJS renderer (runs only once when container becomes available)
  $effect(() => {
    if (!containerElement) return;

    const initialize = async () => {
      try {
        // Initialize motion primitives in PARALLEL (non-blocking!)
        console.log("🚀 Initializing simple calculated path system...");

        // Check container is still valid
        if (!containerElement) {
          console.warn("Container element became null during initialization");
          return;
        }

        // Initialize PixiJS renderer with DEFAULT size
        // Resize will be handled separately by ResizeObserver
        await pixiRenderer.initialize(
          containerElement,
          DEFAULT_CANVAS_SIZE,
          backgroundAlpha
        );

        // Load initial textures
        await Promise.all([
          pixiRenderer.loadGridTexture(gridMode?.toString() ?? "diamond"),
          loadPropTextures(),
        ]);

        isInitialized = true;
        const canvas = pixiRenderer.getCanvas();
        onCanvasReady?.(canvas);

        // Set up resize observer
        setupResizeObserver();

        // Start render loop
        needsRender = true;
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
      pixiRenderer.destroy();
      onCanvasReady?.(null);
      isInitialized = false;
    };
  });

  async function loadPropTextures() {
    try {
      await pixiRenderer.loadPropTextures(currentPropType);

      // Get prop dimensions (we'll need to update this when props change)
      const [bluePropData, redPropData] = await Promise.all([
        svgGenerator.generateBluePropSvg(currentPropType),
        svgGenerator.generateRedPropSvg(currentPropType),
      ]);

      bluePropDimensions = {
        width: bluePropData.width,
        height: bluePropData.height,
      };
      redPropDimensions = {
        width: redPropData.width,
        height: redPropData.height,
      };

      // Update trail capture service with new prop dimensions
      trailCaptureService.updateConfig({
        bluePropDimensions,
        redPropDimensions,
      });

      needsRender = true;
      startRenderLoop();
    } catch (err) {
      console.error("Failed to load prop textures:", err);
    }
  }

  function setupResizeObserver() {
    teardownResizeObserver();

    if (typeof ResizeObserver !== "undefined" && containerElement) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(containerElement);
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

  function resizeCanvas() {
    if (!containerElement) return;

    const rect = containerElement.getBoundingClientRect();
    const newSize =
      Math.min(
        rect.width || DEFAULT_CANVAS_SIZE,
        rect.height || DEFAULT_CANVAS_SIZE
      ) || DEFAULT_CANVAS_SIZE;

    if (newSize !== canvasSize) {
      canvasSize = newSize;
      pixiRenderer.resize(newSize);

      // Update trail capture service with new canvas size
      trailCaptureService.updateConfig({ canvasSize: newSize });

      needsRender = true;
      startRenderLoop();
    }
  }

  // Callback from GlyphRenderer when SVG is ready
  function handleGlyphSvgReady(
    svgString: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    loadGlyphTexture(svgString, width, height);
  }

  async function loadGlyphTexture(
    svgString: string,
    width: number,
    height: number
  ) {
    try {
      await pixiRenderer.loadGlyphTexture(svgString, width, height);
      needsRender = true;
      startRenderLoop();
    } catch (err) {
      console.error("[AnimatorCanvas] Failed to load glyph texture:", err);
    }
  }

  let lastFrameTime = performance.now();

  function renderLoop(currentTime?: number): void {
    if (!isInitialized) {
      rafId = null;
      return;
    }

    const now = currentTime ?? performance.now();

    // Capture trail points using service
    if (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF) {
      const currentBeat = beatData?.beatNumber;

      // Capture trails for all props
      trailCaptureService.captureFrame(
        {
          blueProp,
          redProp,
          secondaryBlueProp,
          secondaryRedProp,
        },
        currentBeat,
        now
      );
    }

    if (
      needsRender ||
      (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF)
    ) {
      render(now);
      needsRender = false;
      rafId = requestAnimationFrame(renderLoop);
    } else {
      // Stop loop when no render is needed
      rafId = null;
    }
  }

  function startRenderLoop(): void {
    if (rafId === null && isInitialized) {
      rafId = requestAnimationFrame(renderLoop);
    }
  }

  // Track if we've logged the first render (for debugging)
  let hasLoggedFirstRender = $state(false);

  function render(currentTime: number): void {
    if (!isInitialized) return;

    // Get turn tuple for glyph rendering
    // Note: motions is a Partial<Record<MotionColor, MotionData>>, not an array
    const blueMotion = beatData?.motions?.blue;
    const redMotion = beatData?.motions?.red;
    const turnsTuple =
      blueMotion && redMotion ? `${blueMotion.turns}${redMotion.turns}` : null;

    // Get trail points - NEW GENIUS SYSTEM: Use pre-computed primitives!
    let blueTrailPoints: TrailPoint[] = [];
    let redTrailPoints: TrailPoint[] = [];
    let secondaryBlueTrailPoints: TrailPoint[] = [];
    let secondaryRedTrailPoints: TrailPoint[] = [];

    // Get trail points from service (continuous spirograph effect!)
    const allTrails = trailCaptureService.getAllTrailPoints();
    blueTrailPoints = allTrails.blue;
    redTrailPoints = allTrails.red;
    secondaryBlueTrailPoints = allTrails.secondaryBlue;
    secondaryRedTrailPoints = allTrails.secondaryRed;

    // Log trail configuration on first render
    if (!hasLoggedFirstRender && trailSettings.enabled) {
      console.log("\n🎨 === CONTINUOUS SPIROGRAPH TRAIL SYSTEM ===");
      console.log(`   ✅ Real-time trail capture`);
      console.log(`   ✅ Continuous accumulation across beats`);
      console.log(`   ✅ Distance-based adaptive sampling`);
      console.log(`   Style: ${trailSettings.style}`);
      console.log(`   Mode: ${trailSettings.mode}`);
      console.log(`   Tracking: ${trailSettings.trackingMode}`);
      hasLoggedFirstRender = true;
    }

    // Render scene using PixiJS
    pixiRenderer.renderScene({
      blueProp,
      redProp,
      secondaryBlueProp,
      secondaryRedProp,
      gridVisible,
      gridMode: gridMode?.toString() ?? null,
      letter: letter ?? null,
      turnsTuple,
      bluePropDimensions,
      redPropDimensions,
      blueTrailPoints,
      redTrailPoints,
      secondaryBlueTrailPoints,
      secondaryRedTrailPoints,
      trailSettings,
      currentTime, // Trail service manages animation-relative timestamps internally
    });
  }
</script>

<!-- Hidden GlyphRenderer that converts TKAGlyph to SVG for PixiJS rendering -->
{#if letter}
  <GlyphRenderer {letter} {beatData} onSvgReady={handleGlyphSvgReady} />
{/if}

<div class="canvas-wrapper" bind:this={containerElement}></div>

<style>
  .canvas-wrapper {
    position: relative;
    display: inline-block;
    aspect-ratio: 1 / 1;
    /* Maximize canvas - take up as much space as possible */
    width: min(100cqw, 100cqh);
    max-width: 100%;
    max-height: 100%;
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
