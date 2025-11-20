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
  import GlyphRenderer from "./GlyphRenderer.svelte";
  import {
    type TrailPoint,
    type TrailSettings,
    TrailMode,
    TrailStyle,
    TrackingMode,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
  } from "../domain/types/TrailTypes";
  import { CircularBuffer } from "../utils/CircularBuffer";
  import {
    AnimationPathCache,
    type AnimationPathCacheData,
  } from "../services/implementations/AnimationPathCache";
  import type { ISequenceAnimationOrchestrator } from "../services/contracts/ISequenceAnimationOrchestrator";
  import { MotionPathCalculator } from "../services/implementations/MotionPathCalculator";
  import type { IEndpointCalculator } from "../services/contracts/IEndpointCalculator";
  import type { IAngleCalculator } from "../services/contracts/IAngleCalculator";

  // Resolve services from DI container
  const pixiRenderer = resolve(
    TYPES.IPixiAnimationRenderer
  ) as IPixiAnimationRenderer;
  const endpointCalculator = resolve(TYPES.IEndpointCalculator) as IEndpointCalculator;
  const angleCalculator = resolve(TYPES.IAngleCalculator) as IAngleCalculator;

  // Motion path calculator (simple, testable!)
  const motionPathCalculator = new MotionPathCalculator(endpointCalculator, angleCalculator);
  const svgGenerator = resolve(TYPES.ISVGGenerator) as ISVGGenerator;
  const settingsService = resolve(TYPES.ISettingsService) as ISettingsService;
  const orchestrator = resolve(
    TYPES.ISequenceAnimationOrchestrator
  ) as ISequenceAnimationOrchestrator;

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

  // Trail state using CircularBuffer for O(1) performance
  // Primary sequence (blue/red)
  let blueTrailBuffer = $state<CircularBuffer<TrailPoint>>(
    new CircularBuffer(1000)
  );
  let redTrailBuffer = $state<CircularBuffer<TrailPoint>>(
    new CircularBuffer(1000)
  );
  // Secondary sequence (blue2/red2)
  let secondaryBlueTrailBuffer = $state<CircularBuffer<TrailPoint>>(
    new CircularBuffer(1000)
  );
  let secondaryRedTrailBuffer = $state<CircularBuffer<TrailPoint>>(
    new CircularBuffer(1000)
  );
  let trailSettings = $state<TrailSettings>(
    externalTrailSettings ?? loadTrailSettings()
  );
  let previousBeatForLoopDetection = $state<number>(0);

  // Path cache for gap-free trail rendering
  let pathCache = $state<AnimationPathCache | null>(null);
  let pathCacheData = $state<AnimationPathCacheData | null>(null);
  let isCachePrecomputing = $state(false);
  let cacheSequenceId = $state<string | null>(null); // Track which sequence is cached
  let cacheLoopStartBeat = $state<number>(0); // Track which beat the current loop started at for LOOP_CLEAR mode
  let hasLoggedCacheSuccess = false; // Debug flag to log cache success once
  let lastCapturedCacheTime = $state<number>(-1); // Track last cache time we captured from (to add points incrementally)

  // Animation timing state (for beat-based cache queries)
  let animationStartTime = $state<number | null>(null); // performance.now() when animation started
  let lastAnimationBeat = $state<number>(0); // Track last beat for loop detection

  // Track last captured position for each prop/end combination (for distance-based sampling)
  // Key format: "propIndex-endType" (e.g., "0-1" = blue prop, right end)
  interface LastCapturedPoint {
    x: number;
    y: number;
    beat: number;
    timestamp: number; // animation-relative timestamp (0ms to totalDurationMs)
  }
  const lastCapturedPoints = new Map<string, LastCapturedPoint>();

  // Adaptive trail density based on device performance
  let devicePerformanceTier = $state<'high' | 'medium' | 'low'>('high');
  let frameTimeHistory: number[] = [];
  const PERFORMANCE_SAMPLE_SIZE = 30;

  // Motion path calculation (disabled - using continuous trail capture instead)
  let useCalculatedPaths = $state(false); // Use continuous trail capture for spirograph effect
  const calculatedPathCache = new Map<string, Array<{x: number; y: number}>>(); // In-memory cache (unused for now)

  // ============================================================================
  // TRAIL MANAGEMENT FUNCTIONS
  // ============================================================================

  function loadTrailSettings(): TrailSettings {
    try {
      const stored = localStorage.getItem(TRAIL_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Migration: convert old trackBothEnds boolean to new trackingMode enum
        if ('trackBothEnds' in parsed && !('trackingMode' in parsed)) {
          parsed.trackingMode = parsed.trackBothEnds
            ? TrackingMode.BOTH_ENDS
            : TrackingMode.RIGHT_END;
          delete parsed.trackBothEnds;
        }

        // Migration: Add previewMode if not present (defaults to false = normal trail mode)
        if (!('previewMode' in parsed)) {
          parsed.previewMode = false;
        }

        // Always use SMOOTH_LINE style for best visual quality
        return {
          ...DEFAULT_TRAIL_SETTINGS,
          ...parsed,
          style: TrailStyle.SMOOTH_LINE,
          usePathCache: parsed.usePathCache ?? true,
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
   * Calculate an endpoint position of a prop
   * Uses strict point positioning for animation viewer
   */
  function calculatePropEndpoint(
    prop: PropState,
    propDimensions: { width: number; height: number },
    canvasSize: number,
    endType: 0 | 1
  ): { x: number; y: number } {
    // Strict hand point radius (150px from center) - matches strict grid points for animation mode
    const GRID_HALFWAY_POINT_OFFSET = 150;
    // No inward adjustment - use exact grid point coordinates
    const INWARD_FACTOR = 1.0;
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
        console.log(`   Created new AnimationPathCache instance (using 950x950 standard coordinate system)`);
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

  /**
   * Get cached trail points for rendering (beat-based)
   * Scales points from 950x950 standard coordinate space to current canvas size
   */
  function getCachedTrailPoints(
    propIndex: 0 | 1,
    endType: 0 | 1,
    startBeat: number,
    endBeat: number
  ): TrailPoint[] {
    if (!pathCache || !pathCacheData || !pathCache.isValid()) {
      return [];
    }

    // Get points from cache using beat range
    const points = pathCache.getTrailPoints(propIndex, endType, startBeat, endBeat);

    // Scale points from 950x950 standard coordinate space to current canvas size
    const scaleFactor = canvasSize / 950;
    const scaledPoints = points.map(p => ({
      ...p,
      x: p.x * scaleFactor,
      y: p.y * scaleFactor,
    }));

    // Debug log occasionally (every ~60 frames)
    if (Math.random() < 0.016 && points.length > 0) {
      const propName = propIndex === 0 ? "blue" : "red";
      const endName = endType === 0 ? "left" : "right";
      console.log(
        `📊 Cache lookup: ${propName} ${endName}, beats ${startBeat.toFixed(2)}-${endBeat.toFixed(2)} → ${points.length} points`
      );
    }

    return scaledPoints;
  }

  /**
   * Detect device performance tier for adaptive trail density
   */
  function updatePerformanceTier(frameTime: number): void {
    frameTimeHistory.push(frameTime);

    if (frameTimeHistory.length > PERFORMANCE_SAMPLE_SIZE) {
      frameTimeHistory.shift();
    }

    if (frameTimeHistory.length >= PERFORMANCE_SAMPLE_SIZE) {
      const avgFrameTime = frameTimeHistory.reduce((a, b) => a + b, 0) / frameTimeHistory.length;
      const fps = 1000 / avgFrameTime;

      const previousTier = devicePerformanceTier;

      // Classify device performance
      if (fps >= 55) {
        devicePerformanceTier = 'high'; // 55+ FPS = high-end
      } else if (fps >= 40) {
        devicePerformanceTier = 'medium'; // 40-55 FPS = mid-range
      } else {
        devicePerformanceTier = 'low'; // <40 FPS = low-end
      }

      // Log tier changes
      if (devicePerformanceTier !== previousTier) {
        const spacing = getAdaptivePointSpacing();
        console.log(`📊 Performance tier: ${previousTier} → ${devicePerformanceTier} (${fps.toFixed(1)} FPS, spacing: ${spacing}px)`);
      }
    }
  }

  /**
   * Get minimum point spacing based on device performance
   * Returns distance in pixels that prop must move before adding a new trail point
   */
  function getAdaptivePointSpacing(): number {
    switch (devicePerformanceTier) {
      case 'high':
        return 0.5; // High-end: ULTRA-dense trails for glass-smooth spirographs!
      case 'medium':
        return 0.75; // Mid-range: very dense trails
      case 'low':
        return 1.0; // Low-end: still dense (splines will smooth it out)
      default:
        return 0.75;
    }
  }

  /**
   * Capture trail points with DISTANCE-BASED SAMPLING and intelligent cache backfill
   *
   * MODERN 2025 APPROACH:
   * 1. Distance-based sampling: Only add points when prop moves >N pixels (adaptive to device)
   * 2. Intelligent backfill: Use cache to fill gaps during device stutters
   * 3. Beat-based coordinates: Cache queries use beat numbers (always aligned!)
   * 4. Adaptive density: Adjust spacing based on device performance
   *
   * Result: Perfectly smooth trails regardless of device performance!
   */
  function captureTrailPoint(
    prop: PropState,
    propDimensions: { width: number; height: number },
    propIndex: 0 | 1 | 2 | 3,
    currentTime: number,
    currentBeat: number | undefined
  ): void {
    if (!trailSettings.enabled || trailSettings.mode === TrailMode.OFF) {
      return;
    }

    // Initialize animation start time on first call
    if (animationStartTime === null) {
      animationStartTime = currentTime;
    }

    // Calculate animation-relative time (0ms to totalDurationMs)
    const animRelativeTime = currentTime - animationStartTime;

    // Use current beat (fallback to 0 if undefined)
    const beat = currentBeat ?? 0;

    // Check for loop and clear trails if in LOOP_CLEAR mode
    if (
      trailSettings.mode === TrailMode.LOOP_CLEAR &&
      detectAnimationLoop(beat)
    ) {
      clearTrails();
      // Reset all last captured points on loop
      lastCapturedPoints.clear();
      // Reset animation start time
      animationStartTime = currentTime;
    }

    // Determine which ends to track based on tracking mode
    const endsToTrack: Array<0 | 1> =
      trailSettings.trackingMode === TrackingMode.BOTH_ENDS
        ? [0, 1]
        : trailSettings.trackingMode === TrackingMode.LEFT_END
          ? [0]
          : [1]; // RIGHT_END

    // Select buffer based on prop index (0=blue, 1=red, 2=secondaryBlue, 3=secondaryRed)
    const buffer =
      propIndex === 0 ? blueTrailBuffer :
      propIndex === 1 ? redTrailBuffer :
      propIndex === 2 ? secondaryBlueTrailBuffer :
      secondaryRedTrailBuffer;

    // Get adaptive point spacing for current device performance
    const minSpacing = getAdaptivePointSpacing();

    for (const endType of endsToTrack) {
      const key = `${propIndex}-${endType}`;
      const lastPoint = lastCapturedPoints.get(key);

      // Calculate current endpoint position
      const endpoint = calculatePropEndpoint(
        prop,
        propDimensions,
        canvasSize,
        endType
      );

      // DECISION TREE: Should we use cache backfill or real-time sampling?

      if (lastPoint === undefined) {
        // FIRST POINT: Wait for animation initialization to complete
        // Use elapsed time (not beat number) since animation loops and might start at any beat
        // Wait 500ms for panel to open, textures to load, and props to settle at their positions
        const INITIALIZATION_DELAY_MS = 500;

        // Only capture first point after initialization delay
        if (animRelativeTime >= INITIALIZATION_DELAY_MS) {
          const point: TrailPoint = {
            x: endpoint.x,
            y: endpoint.y,
            timestamp: animRelativeTime,
            propIndex,
            endType,
          };
          buffer.push(point);
        }

        // Always update tracking position (even if we don't capture the point yet)
        lastCapturedPoints.set(key, {
          x: endpoint.x,
          y: endpoint.y,
          beat,
          timestamp: animRelativeTime,
        });
      } else {
        // SUBSEQUENT POINTS: Use distance-based sampling with optional cache backfill

        const beatDelta = Math.abs(beat - lastPoint.beat);

        // Check if we have a LARGE beat gap (real device stutter or seeking, not normal frame drops)
        // Disable aggressive backfill - only fill MASSIVE gaps from seeking
        // At 60 BPM, 60 FPS: 0.0167 beats/frame, so 3 beats = ~3 seconds of missing frames
        const hasLargeBeatGap = beatDelta > 3.0; // >3 beats = only seeking/major stutters

        if (
          hasLargeBeatGap &&
          trailSettings.usePathCache &&
          pathCache &&
          pathCacheData &&
          pathCache.isValid()
        ) {
          // CACHE BACKFILL: Device stuttered - fill gap with high-quality cached points
          const cachedPoints = getCachedTrailPoints(
            propIndex < 2 ? propIndex : (propIndex - 2) as 0 | 1, // Map secondary props to primary (0/1)
            endType,
            lastPoint.beat,
            beat
          );

          // Debug log backfill events (helps diagnose false triggers)
          const propName = propIndex === 0 ? 'blue' : propIndex === 1 ? 'red' : propIndex === 2 ? 'blue2' : 'red2';
          const endName = endType === 0 ? 'left' : 'right';
          console.log(`🔄 BACKFILL: ${propName}-${endName}, gap ${beatDelta.toFixed(3)} beats (${lastPoint.beat.toFixed(2)}→${beat.toFixed(2)}), adding ${cachedPoints.length} cached points`);

          // Add cached points but apply distance filtering to maintain consistent spacing
          let lastAddedX = lastPoint.x;
          let lastAddedY = lastPoint.y;
          let addedCount = 0;

          for (const cachedPoint of cachedPoints) {
            const dist = Math.hypot(
              cachedPoint.x - lastAddedX,
              cachedPoint.y - lastAddedY
            );

            if (dist >= minSpacing) {
              buffer.push(cachedPoint);
              lastAddedX = cachedPoint.x;
              lastAddedY = cachedPoint.y;
              addedCount++;
            }
          }

          console.log(`   → Filtered to ${addedCount} points (spacing: ${minSpacing.toFixed(1)}px)`);

          // Update last captured point
          lastCapturedPoints.set(key, {
            x: endpoint.x,
            y: endpoint.y,
            beat,
            timestamp: animRelativeTime,
          });
        } else {
          // REAL-TIME SAMPLING: Normal playback - use distance-based sampling
          const distance = Math.hypot(
            endpoint.x - lastPoint.x,
            endpoint.y - lastPoint.y
          );

          // Detect initial jump (from default position to first beat position)
          // If distance is huge (>200px), this is the initial jump - skip drawing it
          const isInitialJump = distance > 200;

          // DEBUG: Log initial jumps
          if (isInitialJump) {
            console.log(`🚫 INITIAL JUMP DETECTED - Skipping trail`);
            console.log(`   Prop: ${propIndex === 0 ? 'blue' : 'red'}, End: ${endType === 0 ? 'left' : 'right'}`);
            console.log(`   Distance: ${distance.toFixed(1)}px`);
            console.log(`   From: (${lastPoint.x.toFixed(1)}, ${lastPoint.y.toFixed(1)})`);
            console.log(`   To: (${endpoint.x.toFixed(1)}, ${endpoint.y.toFixed(1)})`);
          }

          if (isInitialJump) {
            // Just update the tracking position without adding a trail point
            lastCapturedPoints.set(key, {
              x: endpoint.x,
              y: endpoint.y,
              beat,
              timestamp: animRelativeTime,
            });
          } else if (distance >= minSpacing) {
            // Normal trail capture - add point if prop moved far enough
            const point: TrailPoint = {
              x: endpoint.x,
              y: endpoint.y,
              timestamp: animRelativeTime,
              propIndex,
              endType,
            };

            buffer.push(point);
            lastCapturedPoints.set(key, {
              x: endpoint.x,
              y: endpoint.y,
              beat,
              timestamp: animRelativeTime,
            });
          }
          // If distance < minSpacing, skip this point (prevents oversaturation)
        }
      }
    }
  }

  /**
   * Remove old trail points based on fade duration
   * Uses animation-relative timestamps (0ms to totalDurationMs)
   */
  function pruneOldTrailPoints(currentTime: number): void {
    if (trailSettings.mode !== TrailMode.FADE) return;
    if (animationStartTime === null) return;

    // Calculate animation-relative time
    const animRelativeTime = currentTime - animationStartTime;
    const cutoffTime = animRelativeTime - trailSettings.fadeDurationMs;

    // O(n) but only when needed (fade mode)
    blueTrailBuffer.filterInPlace((p) => p.timestamp > cutoffTime);
    redTrailBuffer.filterInPlace((p) => p.timestamp > cutoffTime);
    secondaryBlueTrailBuffer.filterInPlace((p) => p.timestamp > cutoffTime);
    secondaryRedTrailBuffer.filterInPlace((p) => p.timestamp > cutoffTime);
  }

  /**
   * Clear all trail points and reset tracking state
   */
  function clearTrails(): void {
    blueTrailBuffer.clear();
    redTrailBuffer.clear();
    secondaryBlueTrailBuffer.clear();
    secondaryRedTrailBuffer.clear();
    lastCapturedPoints.clear();
    animationStartTime = null; // Reset animation timing
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
      console.log(`   ✅ Triggering pre-computation for new sequence: ${sequenceId}`);
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
        await pixiRenderer.initialize(containerElement, DEFAULT_CANVAS_SIZE, backgroundAlpha);

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

  let lastFrameTime = performance.now();

  function renderLoop(currentTime?: number): void {
    if (!isInitialized) {
      rafId = null;
      return;
    }

    const now = currentTime ?? performance.now();

    // Track frame time for adaptive performance tier detection
    const frameTime = now - lastFrameTime;
    if (frameTime > 0 && frameTime < 1000) { // Sanity check (ignore pauses)
      updatePerformanceTier(frameTime);
    }
    lastFrameTime = now;

    // Capture trail points if enabled (continuous spirograph effect!)
    if (trailSettings.enabled && trailSettings.mode !== TrailMode.OFF) {
      const currentBeat = beatData?.beatNumber;

      // Detect loop for LOOP_CLEAR mode with cached paths
      if (
        trailSettings.mode === TrailMode.LOOP_CLEAR &&
        detectAnimationLoop(currentBeat)
      ) {
        clearTrails();
        // Reset loop start beat for cached path filtering
        cacheLoopStartBeat = currentBeat ?? 0;
      }

      // Capture primary sequence trail points
      if (blueProp) {
        captureTrailPoint(blueProp, bluePropDimensions, 0, now, currentBeat);
      }
      if (redProp) {
        captureTrailPoint(redProp, redPropDimensions, 1, now, currentBeat);
      }

      // Capture secondary sequence trail points
      if (secondaryBlueProp) {
        captureTrailPoint(secondaryBlueProp, bluePropDimensions, 2, now, currentBeat);
      }
      if (secondaryRedProp) {
        captureTrailPoint(secondaryRedProp, redPropDimensions, 3, now, currentBeat);
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

  // Track if we've logged the first render (for debugging)
  let hasLoggedFirstRender = $state(false);

  function render(currentTime: number): void {
    if (!isInitialized) return;

    // Get turn tuple for glyph rendering
    // Note: motions is a Partial<Record<MotionColor, MotionData>>, not an array
    const blueMotion = beatData?.motions?.blue;
    const redMotion = beatData?.motions?.red;
    const turnsTuple =
      blueMotion && redMotion
        ? `${blueMotion.turns}${redMotion.turns}`
        : null;

    // Get trail points - NEW GENIUS SYSTEM: Use pre-computed primitives!
    let blueTrailPoints: TrailPoint[] = [];
    let redTrailPoints: TrailPoint[] = [];
    let secondaryBlueTrailPoints: TrailPoint[] = [];
    let secondaryRedTrailPoints: TrailPoint[] = [];

    // Get trail points from accumulated buffers (continuous spirograph effect!)
    blueTrailPoints = blueTrailBuffer.toArray();
    redTrailPoints = redTrailBuffer.toArray();
    secondaryBlueTrailPoints = secondaryBlueTrailBuffer.toArray();
    secondaryRedTrailPoints = secondaryRedTrailBuffer.toArray();

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

    // Calculate animation-relative time for renderer (for fade calculations)
    const animRelativeTime = animationStartTime !== null
      ? currentTime - animationStartTime
      : 0;

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
      currentTime: animRelativeTime, // Pass animation-relative time (matches trail point timestamps!)
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
