<!--
AnimatorCanvas.svelte

PixiJS-powered canvas component for rendering animated prop positions.
Handles prop visualization, trail effects, and glyph rendering using WebGL.
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ISettingsService } from "$lib/shared/settings/services/contracts";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import type { StartPositionData } from "../../../modules/create/shared/domain/models/StartPositionData";
  import type { BeatData } from "../../../modules/create/shared/domain/models/BeatData";
  import type { PropState } from "../domain";
  import type { IPixiAnimationRenderer } from "$lib/modules/animate/services/contracts/IPixiAnimationRenderer";
  import type { ISVGGenerator } from "$lib/modules/animate/services/contracts/ISVGGenerator";
  import type { ITrailCaptureService } from "$lib/modules/animate/services/contracts/ITrailCaptureService";
  import GlyphRenderer from "$lib/modules/animate/components/GlyphRenderer.svelte";
  import {
    type TrailPoint,
    type TrailSettings,
    TrailMode,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
  } from "$lib/modules/animate/domain/types/TrailTypes";
  import {
    AnimationPathCache,
    type AnimationPathCacheData,
  } from "$lib/modules/animate/services/implementations/AnimationPathCache";
  import type { ISequenceAnimationOrchestrator } from "$lib/modules/animate/services/contracts/ISequenceAnimationOrchestrator";
  import {
    SequenceFramePreRenderer,
    type PreRenderProgress,
  } from "$lib/modules/animate/services/implementations/SequenceFramePreRenderer";

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

  // Create frame pre-renderer for perfect smooth playback
  const framePreRenderer = new SequenceFramePreRenderer(
    orchestrator,
    pixiRenderer
  );

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

  // Canvas size - controlled by CSS container queries
  const DEFAULT_CANVAS_SIZE = 500;
  let canvasSize = $state(DEFAULT_CANVAS_SIZE);

  // Unique instance ID for debugging multiple canvas instances
  const instanceId = Math.random().toString(36).substring(2, 8);
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

  // Frame pre-renderer for perfect smooth playback
  let isPreRendering = $state(false);
  let preRenderProgress = $state<PreRenderProgress | null>(null);
  let preRenderedFramesReady = $state(false);
  let currentBeatNumber = $state(0); // Track current beat for frame lookup

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
      pathCacheData = null;
      return;
    }

    // Pre-compute even if trails are disabled - cache will be ready when user enables trails
    // This provides instant smooth rendering when toggling trails on

    try {
      isCachePrecomputing = true;

      // Create path cache instance if needed
      // IMPORTANT: Always use standard 950x950 coordinate system for cache (matches viewBox)
      // This makes cache resolution-independent - coordinates are scaled to actual canvas size during rendering
      if (!pathCache) {
        pathCache = new AnimationPathCache({
          cacheFps: 120, // High FPS for ultra-smooth trails
          canvasSize: 950, // Always use standard viewBox size for resolution-independent caching
          propDimensions: bluePropDimensions,
        });

        // Wire cache to trail capture service for backfill support
        trailCaptureService.setAnimationCacheService(pathCache as any);
      }

      // CRITICAL: Initialize orchestrator with sequence data BEFORE pre-computation!
      const initSuccess = orchestrator.initializeWithDomainData(seqData);
      if (!initSuccess) {
        throw new Error("Failed to initialize orchestrator with sequence data");
      }

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
        `✅ [${instanceId}] Cache precomputation complete in ${computeTime.toFixed(1)}ms, isValid=${pathCache?.isValid()}`
      );
    } catch (error) {
      console.error(
        `❌ [${instanceId}] Failed to pre-compute animation paths:`,
        error
      );
      pathCacheData = null;
    } finally {
      isCachePrecomputing = false;
    }
  }

  /**
   * Pre-render entire sequence to frames for perfect smooth playback
   * Runs in background after initial preview starts
   */
  async function preRenderSequenceFrames(seqData: SequenceData): Promise<void> {
    try {
      isPreRendering = true;
      preRenderedFramesReady = false;
      preRenderProgress = null;

      // CRITICAL: Wait for renderer to be initialized before pre-rendering
      // The canvas must exist before we can capture frames!
      const maxWaitTime = 5000; // 5 seconds max
      const startWait = performance.now();
      while (!isInitialized && performance.now() - startWait < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!isInitialized) {
        console.error(
          "⚠️ Renderer not initialized after 5s, skipping pre-render"
        );
        return;
      }

      console.log("🎬 Starting frame pre-render for perfect playback...");

      // Pre-render with progress updates
      await framePreRenderer.preRenderSequence(
        seqData,
        {
          fps: 60,
          canvasSize,
          nonBlocking: true, // Don't block UI
          framesPerChunk: 3, // Render 3 frames at a time
          trailSettings,
        },
        (progress) => {
          preRenderProgress = progress;
          console.log(
            `📊 Pre-render progress: ${progress.percent.toFixed(1)}%`
          );
        }
      );

      preRenderedFramesReady = true;
      console.log(
        "✅ Frame pre-render complete! Switching to perfect playback."
      );
    } catch (error) {
      console.error("❌ Failed to pre-render frames:", error);
      preRenderedFramesReady = false;
    } finally {
      isPreRendering = false;
      preRenderProgress = null;
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

  // Track gridMode changes and reload grid texture when it changes
  let previousGridMode = $state<string | null>(gridMode?.toString() ?? null);
  $effect(() => {
    const currentGridMode = gridMode?.toString() ?? null;
    if (isInitialized && currentGridMode !== previousGridMode) {
      previousGridMode = currentGridMode;
      // Reload grid texture with new mode
      pixiRenderer.loadGridTexture(currentGridMode ?? "diamond").then(() => {
        needsRender = true;
        startRenderLoop();
      });
    }
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

  // Watch for prop type changes (per-color support)
  let currentBluePropType = $state("staff");
  let currentRedPropType = $state("staff");

  $effect(() => {
    const settings = settingsService.currentSettings;
    const newBluePropType =
      settings.bluePropType || settings.propType || "staff";
    const newRedPropType = settings.redPropType || settings.propType || "staff";

    if (
      newBluePropType !== currentBluePropType ||
      newRedPropType !== currentRedPropType
    ) {
      currentBluePropType = newBluePropType;
      currentRedPropType = newRedPropType;
      currentPropType = newBluePropType; // Legacy compatibility
      isInitialized = false;
      loadPropTextures();
    }
  });

  // DISABLED: Cache-based trail pre-computation
  // This approach has persistent issues with coordinate transformations
  // TODO: Replace with video-based pre-rendering for reliable playback
  // $effect(() => {
  //   const hasSequenceData = sequenceData !== null;
  //   const cacheEnabled = trailSettings.usePathCache;
  //   if (!hasSequenceData || !cacheEnabled) return;
  //   const word = sequenceData.word || sequenceData.name || "unknown";
  //   const totalBeats = sequenceData.beats?.length || 0;
  //   const sequenceId = `${word}-${totalBeats}`;
  //   if (sequenceId !== cacheSequenceId && totalBeats > 0) {
  //     cacheSequenceId = sequenceId;
  //     const beatDurationMs = 1000;
  //     precomputeAnimationPaths(sequenceData, totalBeats, beatDurationMs);
  //   }
  // });

  // Initialize PixiJS renderer (runs only once when container becomes available)
  $effect(() => {
    if (!containerElement) return;

    const initialize = async () => {
      try {
        // Initialize motion primitives in PARALLEL (non-blocking!)

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
        const initialGridMode = gridMode?.toString() ?? "diamond";
        await Promise.all([
          pixiRenderer.loadGridTexture(initialGridMode),
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
      // Use per-color prop types
      await pixiRenderer.loadPerColorPropTextures(
        currentBluePropType,
        currentRedPropType
      );

      // Get prop dimensions for each color (may be different types!)
      const [bluePropData, redPropData] = await Promise.all([
        svgGenerator.generateBluePropSvg(currentBluePropType),
        svgGenerator.generateRedPropSvg(currentRedPropType),
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

    // DISABLED: Real-time capture - now using pre-computed cache for perfect smooth trails
    // The AnimationPathCache provides gap-free trails at 120 FPS regardless of device performance
    // if (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF) {
    //   const currentBeat = beatData?.beatNumber;
    //   trailCaptureService.captureFrame(
    //     {
    //       blueProp,
    //       redProp,
    //       secondaryBlueProp,
    //       secondaryRedProp,
    //     },
    //     currentBeat,
    //     now
    //   );
    // }

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

    // ============================================================================
    // DUAL-MODE RENDERING: Preview vs Perfect Playback
    // ============================================================================

    // MODE 1: Perfect Pre-rendered Frames (when ready)
    if (preRenderedFramesReady && framePreRenderer.isReady()) {
      const frame = framePreRenderer.getFrameAtBeat(currentBeat);
      if (frame) {
        // Get the PixiJS canvas and draw pre-rendered frame directly
        const canvas = pixiRenderer.getCanvas();
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Clear and draw pre-rendered frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
            return; // Done! Perfect smooth playback
          }
        }
      }
      // If frame lookup failed, fall through to preview mode
    }

    // MODE 2: Preview/Live Rendering (immediate, may stutter)
    // Get turn tuple for glyph rendering
    // Note: motions is a Partial<Record<MotionColor, MotionData>>, not an array
    const blueMotion = beatData?.motions?.blue;
    const redMotion = beatData?.motions?.red;
    const turnsTuple =
      blueMotion && redMotion ? `${blueMotion.turns}${redMotion.turns}` : null;

    // Get trail points - ALWAYS use pre-computed cache for perfect smooth trails
    let blueTrailPoints: TrailPoint[] = [];
    let redTrailPoints: TrailPoint[] = [];
    let secondaryBlueTrailPoints: TrailPoint[] = [];
    let secondaryRedTrailPoints: TrailPoint[] = [];

    // Use cache for perfect gap-free trails (if available and valid)
    if (pathCache && pathCache.isValid() && currentBeat !== null) {
      // IMPORTANT: Cache generates coordinates in 950x950 space (resolution-independent)
      // We need to transform them to match actual canvas size
      const scaleFactor = canvasSize / 950;

      // Helper function to transform trail points from cache space to canvas space
      const transformTrailPoints = (points: TrailPoint[]): TrailPoint[] => {
        return points.map((p) => ({
          ...p,
          x: p.x * scaleFactor,
          y: p.y * scaleFactor,
        }));
      };

      // Blue prop trails (both left and right endpoints)
      const blueLeft = transformTrailPoints(
        pathCache.getTrailPoints(0, 0, 0, currentBeat)
      );
      const blueRight = transformTrailPoints(
        pathCache.getTrailPoints(0, 1, 0, currentBeat)
      );
      blueTrailPoints = [...blueLeft, ...blueRight];

      // Red prop trails (both left and right endpoints)
      const redLeft = transformTrailPoints(
        pathCache.getTrailPoints(1, 0, 0, currentBeat)
      );
      const redRight = transformTrailPoints(
        pathCache.getTrailPoints(1, 1, 0, currentBeat)
      );
      redTrailPoints = [...redLeft, ...redRight];

      // Debug: Log first cache retrieval only (subsequent frames are too noisy)
      // if (blueTrailPoints.length > 0 && !hasLoggedFirstRender) {
      //   console.log(`🎨 [${instanceId}] Cache trails @ beat ${currentBeat.toFixed(2)} (scaleFactor=${scaleFactor.toFixed(3)}):`);
      //   console.log(`   Blue: ${blueTrailPoints.length} points, Red: ${redTrailPoints.length} points`);
      // }
    } else {
      // Fallback to real-time capture
      // Cache approach disabled - too many coordinate transformation issues
      const allTrails = trailCaptureService.getAllTrailPoints();
      blueTrailPoints = allTrails.blue;
      redTrailPoints = allTrails.red;
      secondaryBlueTrailPoints = allTrails.secondaryBlue;
      secondaryRedTrailPoints = allTrails.secondaryRed;
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

<div class="canvas-wrapper" bind:this={containerElement}>
  <!-- Pre-render progress indicator -->
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

  <!-- Perfect playback indicator (brief flash when ready) -->
  {#if preRenderedFramesReady}
    <div class="perfect-mode-badge">✨ Perfect Playback</div>
  {/if}
</div>

<style>
  .canvas-wrapper {
    position: relative;
    aspect-ratio: 1 / 1;
    /*
     * Use width: 100% with aspect-ratio to ensure square shape.
     * Do NOT set height: 100% as it overrides aspect-ratio.
     * max-height: 100% prevents overflow when parent is shorter than wide.
     */
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
    z-index: 10;
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
    z-index: 10;
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

  /* Canvas element - this is our positioning reference */
  .canvas-wrapper :global(canvas) {
    border: 1px solid rgba(229, 231, 235, 0.4);
    border-radius: 2px;
    background: #ffffff;
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
