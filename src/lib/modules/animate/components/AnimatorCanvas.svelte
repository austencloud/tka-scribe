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
  } from "$shared";
  import type { PropState } from "../domain/types/PropState";
  import type { IPixiAnimationRenderer } from "../services/contracts/IPixiAnimationRenderer";
  import type { ISVGGenerator } from "../services/contracts/ISVGGenerator";
  import GlyphRenderer from "./GlyphRenderer.svelte";
  import {
    type TrailPoint,
    type TrailSettings,
    TrailMode,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
  } from "../domain/types/TrailTypes";
  import { CircularBuffer } from "../utils/CircularBuffer";

  // Resolve services from DI container
  const pixiRenderer = resolve(
    TYPES.IPixiAnimationRenderer
  ) as IPixiAnimationRenderer;
  const svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;
  const settingsService = resolve(TYPES.ISettingsService) as ISettingsService;

  // Modern Svelte 5 props
  let {
    blueProp,
    redProp,
    gridVisible = true,
    gridMode = GridMode.DIAMOND,
    letter = null,
    beatData = null,
    onCanvasReady = () => {},
    trailSettings: externalTrailSettings = $bindable(),
  }: {
    blueProp: PropState | null;
    redProp: PropState | null;
    gridVisible?: boolean;
    gridMode?: GridMode | null;
    letter?: import("$shared").Letter | null;
    beatData?: BeatData | null;
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

  // Trail state using CircularBuffer for O(1) performance
  let blueTrailBuffer = $state<CircularBuffer<TrailPoint>>(
    new CircularBuffer(1000)
  );
  let redTrailBuffer = $state<CircularBuffer<TrailPoint>>(
    new CircularBuffer(1000)
  );
  let trailSettings = $state<TrailSettings>(
    externalTrailSettings ?? loadTrailSettings()
  );
  let previousBeatForLoopDetection = $state<number>(0);

  // ============================================================================
  // TRAIL MANAGEMENT FUNCTIONS
  // ============================================================================

  function loadTrailSettings(): TrailSettings {
    try {
      const stored = localStorage.getItem(TRAIL_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_TRAIL_SETTINGS, ...parsed };
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
   * Calculate an endpoint position of a prop
   */
  function calculatePropEndpoint(
    prop: PropState,
    propDimensions: { width: number; height: number },
    canvasSize: number,
    endType: 0 | 1
  ): { x: number; y: number } {
    const GRID_HALFWAY_POINT_OFFSET = 150;
    const INWARD_FACTOR = 0.95;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const gridScaleFactor = canvasSize / 950;
    const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET * gridScaleFactor;

    let propCenterX: number;
    let propCenterY: number;

    if (prop.x !== undefined && prop.y !== undefined) {
      propCenterX = centerX + prop.x * scaledHalfwayRadius * INWARD_FACTOR;
      propCenterY = centerY + prop.y * scaledHalfwayRadius * INWARD_FACTOR;
    } else {
      propCenterX =
        centerX +
        Math.cos(prop.centerPathAngle) * scaledHalfwayRadius * INWARD_FACTOR;
      propCenterY =
        centerY +
        Math.sin(prop.centerPathAngle) * scaledHalfwayRadius * INWARD_FACTOR;
    }

    const staffHalfWidth = (propDimensions.width / 2) * gridScaleFactor;
    const staffEndOffset = endType === 1 ? staffHalfWidth : -staffHalfWidth;

    const endX =
      propCenterX + Math.cos(prop.staffRotationAngle) * staffEndOffset;
    const endY =
      propCenterY + Math.sin(prop.staffRotationAngle) * staffEndOffset;

    return { x: endX, y: endY };
  }

  /**
   * Detect if animation has looped
   */
  function detectAnimationLoop(currentBeat: number | undefined): boolean {
    if (currentBeat === undefined) return false;
    const hasLooped = previousBeatForLoopDetection > 0.5 && currentBeat < 0.5;
    previousBeatForLoopDetection = currentBeat;
    return hasLooped;
  }

  /**
   * Capture a new trail point
   */
  function captureTrailPoint(
    prop: PropState,
    propDimensions: { width: number; height: number },
    propIndex: 0 | 1,
    currentTime: number,
    currentBeat: number | undefined
  ): void {
    if (!trailSettings.enabled || trailSettings.mode === TrailMode.OFF) {
      return;
    }

    // Check for loop and clear trails if in LOOP_CLEAR mode
    if (
      trailSettings.mode === TrailMode.LOOP_CLEAR &&
      detectAnimationLoop(currentBeat)
    ) {
      clearTrails();
    }

    const endsToTrack: Array<0 | 1> = trailSettings.trackBothEnds
      ? [0, 1]
      : [1];

    const buffer = propIndex === 0 ? blueTrailBuffer : redTrailBuffer;

    for (const endType of endsToTrack) {
      const endpoint = calculatePropEndpoint(
        prop,
        propDimensions,
        canvasSize,
        endType
      );

      const point: TrailPoint = {
        x: endpoint.x,
        y: endpoint.y,
        timestamp: currentTime,
        propIndex,
        endType,
      };

      buffer.push(point); // O(1) operation!
    }
  }

  /**
   * Remove old trail points based on fade duration
   */
  function pruneOldTrailPoints(currentTime: number): void {
    if (trailSettings.mode !== TrailMode.FADE) return;

    const cutoffTime = currentTime - trailSettings.fadeDurationMs;

    // O(n) but only when needed (fade mode)
    blueTrailBuffer.filterInPlace((p) => p.timestamp > cutoffTime);
    redTrailBuffer.filterInPlace((p) => p.timestamp > cutoffTime);
  }

  /**
   * Clear all trail points
   */
  function clearTrails(): void {
    blueTrailBuffer.clear();
    redTrailBuffer.clear();
  }

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

    if (!currentEnabled || currentMode === TrailMode.OFF) {
      clearTrails();
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

  // Clear blue trail when blue motion is hidden
  $effect(() => {
    if (!blueProp) {
      blueTrailBuffer.clear();
      needsRender = true;
    }
  });

  // Clear red trail when red motion is hidden
  $effect(() => {
    if (!redProp) {
      redTrailBuffer.clear();
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

  // Initialize PixiJS renderer (runs only once when container becomes available)
  $effect(() => {
    if (!containerElement) return;

    const initialize = async () => {
      try {
        // Initialize PixiJS renderer with DEFAULT size
        // Resize will be handled separately by ResizeObserver
        await pixiRenderer.initialize(containerElement, DEFAULT_CANVAS_SIZE);

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

  function renderLoop(currentTime?: number): void {
    if (!isInitialized) {
      rafId = null;
      return;
    }

    const now = currentTime ?? performance.now();

    // Capture trail points if enabled
    if (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF) {
      const currentBeat = beatData?.beatNumber;

      if (blueProp) {
        captureTrailPoint(blueProp, bluePropDimensions, 0, now, currentBeat);
      }
      if (redProp) {
        captureTrailPoint(redProp, redPropDimensions, 1, now, currentBeat);
      }

      // Prune old trail points (fade mode only)
      pruneOldTrailPoints(now);
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

  function render(currentTime: number): void {
    if (!isInitialized) return;

    // Get turn tuple for glyph rendering
    const turnsTuple = beatData?.motion
      ? `${beatData.motion.blue_attributes.turns}${beatData.motion.red_attributes.turns}`
      : null;

    // Render scene using PixiJS
    pixiRenderer.renderScene({
      blueProp,
      redProp,
      gridVisible,
      gridMode: gridMode?.toString() ?? null,
      letter: letter?.letter ?? null,
      turnsTuple,
      bluePropDimensions,
      redPropDimensions,
      blueTrailPoints: blueTrailBuffer.toArray(), // Convert CircularBuffer to array
      redTrailPoints: redTrailBuffer.toArray(),
      trailSettings,
      currentTime,
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
    width: min(95cqw, 95cqh);
    max-width: 600px;
    max-height: 600px;
  }

  @container (min-width: 300px) and (min-height: 300px) {
    .canvas-wrapper {
      width: min(92cqw, 92cqh);
    }
  }

  @container (min-width: 400px) and (min-height: 400px) {
    .canvas-wrapper {
      width: min(90cqw, 90cqh);
    }
  }

  @container (min-width: 600px) and (min-height: 600px) {
    .canvas-wrapper {
      width: min(85cqw, 85cqh);
    }
  }

  @container (min-width: 800px) and (min-height: 800px) {
    .canvas-wrapper {
      width: min(80cqw, 80cqh);
    }
  }

  .canvas-wrapper :global(canvas) {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: #ffffff;
    transition: all 0.3s ease;
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
