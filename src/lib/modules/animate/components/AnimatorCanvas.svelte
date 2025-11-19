<!--
AnimatorCanvas.svelte

Canvas component for rendering animated prop positions.
Handles prop visualization, SVG rendering, and canvas drawing
for sequence animation playback.
-->
<script lang="ts">
  import {
    GridMode,
    resolve,
    TYPES,
    type ISettingsService,
    type ISvgImageService,
    type BeatData,
  } from "$shared";
  import type { PropState } from "../domain/types/PropState";
  import type { ICanvasRenderer } from "../services/contracts/ICanvasRenderer";
  import type { ISVGGenerator } from "../services/contracts/ISVGGenerator";
  import GlyphRenderer from "./GlyphRenderer.svelte";
  import {
    type TrailPoint,
    type TrailSettings,
    TrailMode,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
  } from "../domain/types/TrailTypes";
  import { ANIMATION_CONSTANTS } from "../domain/constants";

  // Resolve services from DI container
  const canvasRenderer = resolve(TYPES.ICanvasRenderer) as ICanvasRenderer;
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

  // Canvas size is now controlled by CSS container queries
  // Default size for initial render and image loading
  const DEFAULT_CANVAS_SIZE = 500;
  let canvasSize = $state(DEFAULT_CANVAS_SIZE);
  let canvasResolution = $state(DEFAULT_CANVAS_SIZE);

  let canvasElement: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let gridImage: HTMLImageElement | null = null;
  let blueStaffImage: HTMLImageElement | null = null;
  let redStaffImage: HTMLImageElement | null = null;
  // Glyph state - unified rendering of complete TKAGlyph (letter + turns + future same/opp dots)
  let glyphImage: HTMLImageElement | null = null;
  let previousGlyphImage: HTMLImageElement | null = null;
  let glyphDimensions = { width: 0, height: 0, x: 0, y: 0 };
  let previousGlyphDimensions = { width: 0, height: 0, x: 0, y: 0 };
  let resizeObserver: ResizeObserver | null = null;

  // ViewBox dimensions from the prop SVGs (default to staff dimensions)
  let bluePropDimensions = { width: 252.8, height: 77.8 };
  let redPropDimensions = { width: 252.8, height: 77.8 };
  let imagesLoaded = $state(false);
  let rafId: number | null = null;
  let needsRender = $state(true);
  let currentPropType = $state<string>("staff");

  // Fade transition state
  let fadeProgress = $state(0); // 0 = show previous, 1 = show current
  let isFading = $state(false);
  let fadeStartTime: number | null = null;
  const FADE_DURATION_MS = 150; // 150ms crossfade

  // Trail state
  let blueTrailPoints = $state<TrailPoint[]>([]);
  let redTrailPoints = $state<TrailPoint[]>([]);
  let trailSettings = $state<TrailSettings>(
    externalTrailSettings ?? loadTrailSettings()
  );
  let previousBeatForLoopDetection = $state<number>(0);

  // Resolve SVG image service
  const svgImageService = resolve(TYPES.ISvgImageService) as ISvgImageService;

  // ============================================================================
  // TRAIL MANAGEMENT FUNCTIONS
  // ============================================================================

  /**
   * Load trail settings from localStorage
   */
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

  /**
   * Save trail settings to localStorage
   */
  function saveTrailSettings(settings: TrailSettings): void {
    try {
      localStorage.setItem(TRAIL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save trail settings:", error);
    }
  }

  /**
   * Calculate an endpoint position of a prop
   * Must match exactly how CanvasRenderer positions and rotates props
   * @param endType - 0 for left end, 1 for right end (tip)
   */
  function calculatePropEndpoint(
    prop: PropState,
    propDimensions: { width: number; height: number },
    canvasSize: number,
    endType: 0 | 1
  ): { x: number; y: number } {
    // Match CanvasRenderer constants exactly
    const GRID_HALFWAY_POINT_OFFSET = 150; // From CanvasRenderer.ts
    const INWARD_FACTOR = 0.95;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const gridScaleFactor = canvasSize / 950; // 950 is the viewBox size
    const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET * gridScaleFactor;

    // Calculate prop center position (matches CanvasRenderer.drawStaff)
    let propCenterX: number;
    let propCenterY: number;

    if (prop.x !== undefined && prop.y !== undefined) {
      // Dash motion - use Cartesian coordinates
      propCenterX = centerX + prop.x * scaledHalfwayRadius * INWARD_FACTOR;
      propCenterY = centerY + prop.y * scaledHalfwayRadius * INWARD_FACTOR;
    } else {
      // Regular motion - use angle
      propCenterX =
        centerX + Math.cos(prop.centerPathAngle) * scaledHalfwayRadius * INWARD_FACTOR;
      propCenterY =
        centerY + Math.sin(prop.centerPathAngle) * scaledHalfwayRadius * INWARD_FACTOR;
    }

    // Staff dimensions (from prop viewBox)
    // For standard staff: viewBox="0 0 252.8 77.8", center at (126.4, 38.9)
    // Right end (tip): +126.4 offset, Left end: -126.4 offset
    const staffHalfWidth = (propDimensions.width / 2) * gridScaleFactor; // 126.4 * gridScaleFactor
    const staffEndOffset = endType === 1 ? staffHalfWidth : -staffHalfWidth;

    // Calculate endpoint position based on staff rotation
    // The staff rotates around its center, so we offset by staffEndOffset in the rotation direction
    const endX = propCenterX + Math.cos(prop.staffRotationAngle) * staffEndOffset;
    const endY = propCenterY + Math.sin(prop.staffRotationAngle) * staffEndOffset;

    return { x: endX, y: endY };
  }

  /**
   * Detect if animation has looped (beat went backwards)
   */
  function detectAnimationLoop(currentBeat: number | undefined): boolean {
    if (currentBeat === undefined) return false;

    // Loop detected if beat jumped backwards significantly (more than 0.5 beats)
    const hasLooped =
      previousBeatForLoopDetection > 0.5 && currentBeat < 0.5;

    previousBeatForLoopDetection = currentBeat;
    return hasLooped;
  }

  /**
   * Capture a new trail point for a prop
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
    if (trailSettings.mode === TrailMode.LOOP_CLEAR && detectAnimationLoop(currentBeat)) {
      console.log("🔄 Animation looped - clearing trails");
      clearTrails();
    }

    // Determine which ends to track
    const endsToTrack: Array<0 | 1> = trailSettings.trackBothEnds ? [0, 1] : [1];

    // Capture point(s) for each end
    for (const endType of endsToTrack) {
      const endpoint = calculatePropEndpoint(prop, propDimensions, canvasSize, endType);

      const point: TrailPoint = {
        x: endpoint.x,
        y: endpoint.y,
        timestamp: currentTime,
        propIndex,
        endType,
      };

      // Add point to appropriate trail
      if (propIndex === 0) {
        blueTrailPoints.push(point);
        // Limit trail length (but only for FADE and LOOP_CLEAR modes)
        if (
          trailSettings.mode !== TrailMode.PERSISTENT &&
          blueTrailPoints.length > trailSettings.maxPoints
        ) {
          blueTrailPoints.shift();
        }
      } else {
        redTrailPoints.push(point);
        // Limit trail length (but only for FADE and LOOP_CLEAR modes)
        if (
          trailSettings.mode !== TrailMode.PERSISTENT &&
          redTrailPoints.length > trailSettings.maxPoints
        ) {
          redTrailPoints.shift();
        }
      }
    }
  }

  /**
   * Remove old trail points based on fade duration (fade mode only)
   */
  function pruneOldTrailPoints(currentTime: number): void {
    if (trailSettings.mode !== TrailMode.FADE) {
      return;
    }

    const cutoffTime = currentTime - trailSettings.fadeDurationMs;

    blueTrailPoints = blueTrailPoints.filter((p) => p.timestamp > cutoffTime);
    redTrailPoints = redTrailPoints.filter((p) => p.timestamp > cutoffTime);
  }

  /**
   * Clear all trail points
   */
  function clearTrails(): void {
    blueTrailPoints = [];
    redTrailPoints = [];
  }

  /**
   * Render trail segments for a specific set of points
   */
  function renderTrailSegments(
    ctx: CanvasRenderingContext2D,
    points: TrailPoint[],
    color: string,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    ctx.save();

    // Set line style
    ctx.lineWidth = trailSettings.lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = color;

    // Enable glow if configured
    if (trailSettings.glowEnabled) {
      ctx.shadowColor = color;
      ctx.shadowBlur = trailSettings.glowBlur;
    }

    // Draw trail segments with varying opacity
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i]!;
      const nextPoint = points[i + 1]!;

      // Calculate opacity based on age and mode
      let opacity: number;

      if (trailSettings.mode === TrailMode.FADE) {
        // Fade based on time elapsed
        const age = currentTime - point.timestamp;
        const progress = age / trailSettings.fadeDurationMs;
        opacity =
          trailSettings.maxOpacity -
          progress * (trailSettings.maxOpacity - trailSettings.minOpacity);
        opacity = Math.max(trailSettings.minOpacity, Math.min(trailSettings.maxOpacity, opacity));
      } else {
        // LOOP_CLEAR and PERSISTENT modes - use gradient from old to new
        const progress = i / (points.length - 1);
        opacity =
          trailSettings.minOpacity +
          progress * (trailSettings.maxOpacity - trailSettings.minOpacity);
      }

      ctx.globalAlpha = opacity;

      // Draw line segment
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(nextPoint.x, nextPoint.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Render trail to canvas
   * When tracking both ends, separates points by endType to create independent trails
   */
  function renderTrail(
    ctx: CanvasRenderingContext2D,
    points: TrailPoint[],
    color: string,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // When tracking both ends, separate points by endType for independent trails
    if (trailSettings.trackBothEnds) {
      const leftEndPoints = points.filter(p => p.endType === 0);
      const rightEndPoints = points.filter(p => p.endType === 1);

      // Render each trail independently
      if (leftEndPoints.length >= 2) {
        renderTrailSegments(ctx, leftEndPoints, color, currentTime);
      }
      if (rightEndPoints.length >= 2) {
        renderTrailSegments(ctx, rightEndPoints, color, currentTime);
      }
    } else {
      // Single trail - render all points
      renderTrailSegments(ctx, points, color, currentTime);
    }
  }

  // Track prop changes
  $effect(() => {
    letter;
    beatData;
  });

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

  // Watch for trail settings changes and sync with external prop
  $effect(() => {
    const currentMode = trailSettings.mode;
    const currentEnabled = trailSettings.enabled;

    // Clear trails when mode changes or trails are disabled
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

  // Sync external trail settings to internal state
  $effect(() => {
    if (externalTrailSettings !== undefined) {
      trailSettings = externalTrailSettings;
    }
  });

  // Load prop images with current prop type
  async function loadPropImages() {
    try {
      const [bluePropData, redPropData] = await Promise.all([
        svgGenerator.generateBluePropSvg(currentPropType),
        svgGenerator.generateRedPropSvg(currentPropType),
      ]);

      // Store the viewBox dimensions
      bluePropDimensions = {
        width: bluePropData.width,
        height: bluePropData.height,
      };
      redPropDimensions = {
        width: redPropData.width,
        height: redPropData.height,
      };

      [blueStaffImage, redStaffImage] = await Promise.all([
        svgImageService.convertSvgStringToImage(
          bluePropData.svg,
          bluePropData.width,
          bluePropData.height
        ),
        svgImageService.convertSvgStringToImage(
          redPropData.svg,
          redPropData.width,
          redPropData.height
        ),
      ]);

      imagesLoaded = true;
      needsRender = true;
      startRenderLoop();
    } catch (err) {
      console.error("Failed to load prop images:", err);
    }
  }

  function resizeCanvasToWrapper() {
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const nextDisplaySize =
      Math.min(
        rect.width || DEFAULT_CANVAS_SIZE,
        rect.height || DEFAULT_CANVAS_SIZE
      ) || DEFAULT_CANVAS_SIZE;
    const pixelRatio =
      typeof window !== "undefined" && window.devicePixelRatio
        ? window.devicePixelRatio
        : 1;

    canvasSize = nextDisplaySize;
    canvasResolution = Math.max(1, Math.round(nextDisplaySize * pixelRatio));

    canvasElement.width = canvasResolution;
    canvasElement.height = canvasResolution;

    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(pixelRatio, pixelRatio);
    }

    needsRender = true;
  }

  function teardownResizeObservers() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", resizeCanvasToWrapper);
    }
  }

  // Initial load of images and canvas setup
  $effect(() => {
    // Track canvasElement so effect re-runs when it's bound
    if (!canvasElement) return;
    onCanvasReady?.(canvasElement);

    const loadImages = async () => {
      try {
        gridImage = await svgImageService.convertSvgStringToImage(
          svgGenerator.generateGridSvg(gridMode ?? GridMode.DIAMOND),
          canvasSize,
          canvasSize
        );

        // Check if canvas still exists after async operations
        if (!canvasElement) {
          return;
        }

        ctx = canvasElement.getContext("2d");
        if (!ctx) {
          console.error("Failed to get 2D context from canvas");
          return;
        }

        resizeCanvasToWrapper();
        teardownResizeObservers();
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => resizeCanvasToWrapper());
          resizeObserver.observe(canvasElement);
        }
        if (typeof window !== "undefined") {
          window.addEventListener("resize", resizeCanvasToWrapper);
        }

        // Load prop images
        await loadPropImages();
      } catch (err) {
        console.error("Failed to load SVG images:", err);
      }
    };

    loadImages();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      teardownResizeObservers();
      onCanvasReady?.(null);
    };
  });

  // Watch for prop type changes in settings
  $effect(() => {
    const settings = settingsService.currentSettings;
    const newPropType = settings.propType || "staff";
    if (newPropType !== currentPropType) {
      currentPropType = newPropType;
      imagesLoaded = false;
      loadPropImages();
    }
  });

  // Callback from GlyphRenderer when SVG is ready
  function handleGlyphSvgReady(
    svgString: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    loadGlyphFromSvg(svgString, width, height, x, y);
  }

  /**
   * Load glyph from SVG string (called by GlyphRenderer)
   * Converts the complete TKAGlyph SVG to an image for canvas rendering
   */
  async function loadGlyphFromSvg(
    svgString: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    try {
      // Save previous glyph for fade transition
      const hadPreviousGlyph = glyphImage !== null;
      if (hadPreviousGlyph) {
        previousGlyphImage = glyphImage;
        previousGlyphDimensions = glyphDimensions;
      }

      // Convert SVG string to image
      // IMPORTANT: The SVG has viewBox="0 0 950 950", so we must create the image at 950x950
      // The width/height/x/y parameters tell us where the glyph is within that 950x950 space
      const newImage = await svgImageService.convertSvgStringToImage(
        svgString,
        950,
        950
      );

      glyphImage = newImage;
      glyphDimensions = { width, height, x, y };

      // Start fade transition if we had a previous glyph
      if (hadPreviousGlyph) {
        startFadeTransition();
      } else {
        // First glyph - no fade
        needsRender = true;
        startRenderLoop();
      }
    } catch (err) {
      console.error("[AnimatorCanvas] Failed to load glyph from SVG:", err);
      glyphImage = null;
      glyphDimensions = { width: 0, height: 0, x: 0, y: 0 };
    }
  }

  function startFadeTransition() {
    isFading = true;
    fadeProgress = 0;
    fadeStartTime = performance.now();
    needsRender = true;
    startRenderLoop();
  }

  function updateFadeProgress(currentTime: number) {
    if (!isFading || fadeStartTime === null) return;

    const elapsed = currentTime - fadeStartTime;
    fadeProgress = Math.min(elapsed / FADE_DURATION_MS, 1);

    if (fadeProgress >= 1) {
      // Fade complete - clear previous glyph
      isFading = false;
      fadeProgress = 1;
      previousGlyphImage = null;
      previousGlyphDimensions = { width: 0, height: 0, x: 0, y: 0 };
    }

    needsRender = true;
  }

  function renderLoop(currentTime?: number): void {
    if (!ctx || !imagesLoaded) {
      rafId = null;
      return;
    }

    const now = currentTime ?? performance.now();

    // Update fade progress if fading
    if (isFading) {
      updateFadeProgress(now);
    }

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

    if (needsRender || isFading || (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF)) {
      render(now);
      needsRender = false;
      rafId = requestAnimationFrame(renderLoop);
    } else {
      // Stop loop when no render is needed
      rafId = null;
    }
  }

  function startRenderLoop(): void {
    if (rafId === null && ctx && imagesLoaded) {
      rafId = requestAnimationFrame(renderLoop);
    }
  }

  function render(currentTime?: number): void {
    if (!ctx || !imagesLoaded) return;

    const now = currentTime ?? performance.now();

    // Allow rendering even if one or both props are null (for motion visibility controls)
    canvasRenderer.renderScene(
      ctx,
      canvasSize,
      gridVisible,
      gridImage,
      blueStaffImage,
      redStaffImage,
      blueProp,
      redProp,
      bluePropDimensions,
      redPropDimensions
    );

    // Render trails after props but before glyph
    if (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF) {
      renderTrail(ctx, blueTrailPoints, trailSettings.blueColor, now);
      renderTrail(ctx, redTrailPoints, trailSettings.redColor, now);
    }

    // Render complete glyph (letter + turns + future same/opp dots) with crossfade
    if (isFading) {
      // Draw previous glyph fading out
      if (previousGlyphImage && previousGlyphDimensions.width > 0) {
        ctx.globalAlpha = 1 - fadeProgress;
        renderGlyphToCanvas(previousGlyphImage, previousGlyphDimensions);
      }

      // Draw current glyph fading in
      if (glyphImage && glyphDimensions.width > 0) {
        ctx.globalAlpha = fadeProgress;
        renderGlyphToCanvas(glyphImage, glyphDimensions);
      }

      // Reset alpha
      ctx.globalAlpha = 1;
    } else {
      // Normal rendering - no fade
      if (glyphImage && glyphDimensions.width > 0) {
        renderGlyphToCanvas(glyphImage, glyphDimensions);
      }
    }
  }

  /**
   * Render a complete glyph image to canvas
   * The glyph image has a full 950x950 viewBox, so we draw the entire image scaled to canvas
   * The dimensions parameter tells us where the glyph is within that viewBox (for reference only)
   */
  function renderGlyphToCanvas(
    image: HTMLImageElement,
    dimensions: { width: number; height: number; x: number; y: number }
  ): void {
    if (!ctx) return;

    // Calculate scale factor from 950px viewBox to canvas
    const scale = canvasSize / 950;

    // The image contains the full 950x950 viewBox, so we draw it at (0, 0) covering the entire canvas
    // The glyph will appear in the correct position because it's positioned correctly within the SVG
    ctx.drawImage(image, 0, 0, canvasSize, canvasSize);
  }
</script>

<!-- Hidden GlyphRenderer that converts TKAGlyph to SVG for canvas rendering -->
{#if letter}
  <GlyphRenderer {letter} {beatData} onSvgReady={handleGlyphSvgReady} />
{/if}

<div class="canvas-wrapper">
  <canvas
    bind:this={canvasElement}
    width={canvasResolution}
    height={canvasResolution}
  ></canvas>
</div>

<style>
  .canvas-wrapper {
    position: relative;
    display: inline-block;
    /* CRITICAL: Always maintain 1:1 aspect ratio */
    aspect-ratio: 1 / 1;
    /* Size based on the SMALLER of container width or height to ensure it fits */
    /* Use min() to take the smaller dimension, but allow it to grow larger */
    width: min(95cqw, 95cqh);
    max-width: 600px;
    max-height: 600px;
  }

  /* Responsive sizing using container queries based on BOTH dimensions */
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

  canvas {
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    background: #ffffff;
    transition: all 0.3s ease;
    display: block;
    /* CRITICAL: Canvas must be perfectly square - 100% of wrapper which has aspect-ratio 1/1 */
    width: 100%;
    height: 100%;
  }
</style>
