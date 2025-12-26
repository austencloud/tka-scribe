<!--
AnimatorCanvas.svelte - PixiJS WebGL Animation Canvas

================================================================================
ARCHITECTURAL NOTE - READ BEFORE ATTEMPTING TO REFACTOR
================================================================================

This component is ~700 lines. That is INTENTIONAL and OPTIMAL.

PREVIOUS REFACTOR ATTEMPTS FAILED:
A v2 version attempted to split this into coordinators (AnimatorTextureCoordinator,
AnimatorPrecomputationCoordinator, AnimatorRenderCoordinator) plus utility files.
Result: 1,200+ total lines (vs 700) with no reduction in complexity - just
indirection. The coordinators were thin pass-throughs that added overhead
without meaningful abstraction. That approach was abandoned and deleted.

WHY THIS COMPONENT CANNOT BE MEANINGFULLY SPLIT:

PixiJS WebGL rendering has inherent lifecycle coupling:

1. CANVAS ELEMENT must exist before PixiJS can initialize
2. TEXTURE LOADING must happen after PixiJS init but before rendering
3. STATE SYNC (visibility, props, trails) must trigger re-renders
4. RENDER LOOP needs access to all the above

These are phases of a single lifecycle, not separable responsibilities.
Splitting them creates artificial boundaries that require complex coordination.

WHAT IS ALREADY WELL-FACTORED (the actual work is in services):

- AnimatorCanvasInitializer     → PixiJS bootstrap sequence
- AnimationRenderLoopService    → Frame rendering logic
- PropTextureService            → Prop SVG → texture conversion
- GlyphTextureService           → TKA glyph → texture conversion
- AnimationVisibilitySyncService → Visibility state subscriptions
- TrailSettingsSyncService      → Trail settings subscriptions
- PropTypeChangeService         → Prop type change detection
- SequenceCacheService          → Cache lifecycle management
- GlyphTransitionService        → Letter cross-fade animations
- CanvasResizeService           → Container resize handling
- AnimationPrecomputationService → Path/frame pre-computation

The component's role is ORCHESTRATION: wiring services together with
Svelte 5 $effect() calls. The ~20 $effect() blocks are the minimum
needed to connect reactive props to imperative WebGL operations.

DO NOT:
- Try to split this into smaller components (lifecycle coupling prevents it)
- Create "coordinator" wrapper classes (they just add indirection)
- Extract $effect() blocks to separate files (breaks reactivity context)

DO:
- Extract NEW discrete services when adding features
- Keep the orchestration logic here
- Add to existing services when extending functionality

Last audit: 2025-12-20
================================================================================
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import type { StartPositionData } from "../../../features/create/shared/domain/models/StartPositionData";
  import type { BeatData } from "../../../features/create/shared/domain/models/BeatData";
  import type { IPixiAnimationRenderer } from "$lib/features/compose/services/contracts/IPixiAnimationRenderer";
  import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
  import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
  import type { ITurnsTupleGeneratorService } from "$lib/shared/pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";
  import GlyphRenderer from "./GlyphRenderer.svelte";
  import GlyphOverlay from "./layers/GlyphOverlay.svelte";
  import ProgressOverlay from "./layers/ProgressOverlay.svelte";
  import { CanvasResizeService } from "../services/implementations/CanvasResizeService";
  import {
    DEFAULT_CANVAS_SIZE,
    type ICanvasResizeService,
  } from "../services/contracts/ICanvasResizeService";
  import { loadAnimatorServices as loadServices } from "../services/implementations/AnimatorServiceLoader";
  import type { AnimatorServices } from "../services/contracts/IAnimatorServiceLoader";
  import { type TrailSettings } from "../domain/types/TrailTypes";
  import { loadTrailSettings } from "$lib/features/compose/utils/animation-panel-persistence";
  import { GlyphTextureService } from "../services/implementations/GlyphTextureService";
  import type { IGlyphTextureService } from "../services/contracts/IGlyphTextureService";
  import { PropTextureService } from "../services/implementations/PropTextureService";
  import type { IPropTextureService } from "../services/contracts/IPropTextureService";
  import { AnimationPrecomputationService } from "../services/implementations/AnimationPrecomputationService";
  import type { IAnimationPrecomputationService } from "../services/contracts/IAnimationPrecomputationService";
  import { AnimationRenderLoopService } from "../services/implementations/AnimationRenderLoopService";
  import type {
    IAnimationRenderLoopService,
    RenderFrameParams,
  } from "../services/contracts/IAnimationRenderLoopService";
  import type { AnimationPathCacheData } from "$lib/features/compose/services/implementations/AnimationPathCache";
  import type { ISequenceAnimationOrchestrator } from "$lib/features/compose/services/contracts/ISequenceAnimationOrchestrator";
  import type { PreRenderProgress } from "$lib/features/compose/services/implementations/SequenceFramePreRenderer";
  import type { ISettingsState } from "../../settings/services/contracts/ISettingsState";
  import type { PropState } from "../domain/PropState";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import { AnimationVisibilitySyncService } from "../services/implementations/AnimationVisibilitySyncService";
  import type { AnimationVisibilityState } from "../services/contracts/IAnimationVisibilitySyncService";
  import { getAnimationVisibilityManager } from "../state/animation-visibility-state.svelte";
  import { GlyphTransitionService } from "../services/implementations/GlyphTransitionService";
  import type { GlyphTransitionState } from "../services/contracts/IGlyphTransitionService";
  import { SequenceCacheService } from "../services/implementations/SequenceCacheService";
  import { TrailSettingsSyncService } from "../services/implementations/TrailSettingsSyncService";
  import { PropTypeChangeService } from "../services/implementations/PropTypeChangeService";
  import { AnimatorCanvasInitializer } from "../services/implementations/AnimatorCanvasInitializer";
  import { onMount, untrack } from "svelte";

  const debug = createComponentLogger("AnimatorCanvas");

  // Animation visibility state - synced via service
  // Initialize from manager to avoid flash of incorrect state
  const visibilityManager = getAnimationVisibilityManager();
  let visibilityState = $state<AnimationVisibilityState>({
    grid: visibilityManager.getGridMode() !== "none",
    beatNumbers: visibilityManager.getVisibility("beatNumbers"),
    props: visibilityManager.getVisibility("props"),
    trails: visibilityManager.getTrailStyle() !== "off",
    tkaGlyph: visibilityManager.getVisibility("tkaGlyph"),
    turnNumbers: visibilityManager.getVisibility("turnNumbers"),
    blueMotion: visibilityManager.getVisibility("blueMotion"),
    redMotion: visibilityManager.getVisibility("redMotion"),
  });

  // Derived visibility accessors for cleaner template usage
  const gridVisibleFromManager = $derived(visibilityState.grid);
  const beatNumbersVisibleFromManager = $derived(visibilityState.beatNumbers);
  const propsVisibleFromManager = $derived(visibilityState.props);
  const trailsVisibleFromManager = $derived(visibilityState.trails);
  const tkaGlyphVisibleFromManager = $derived(visibilityState.tkaGlyph);
  const blueMotionVisibleFromManager = $derived(visibilityState.blueMotion);
  const redMotionVisibleFromManager = $derived(visibilityState.redMotion);

  // Services - resolved lazily after animator module is loaded
  let svgGenerator = $state<ISVGGenerator | null>(null);
  let settingsService = $state<ISettingsState | null>(null);
  let orchestrator = $state<ISequenceAnimationOrchestrator | null>(null);
  let trailCaptureService = $state<ITrailCaptureService | null>(null);
  let turnsTupleGenerator = $state<ITurnsTupleGeneratorService | null>(null);
  let servicesReady = $state(false);

  // Heavy services - loaded on-demand (pixi.js ~500KB)
  let pixiRenderer = $state<IPixiAnimationRenderer | null>(null);
  let pixiLoading = $state(false);
  let pixiError = $state<string | null>(null);

  // Load animator services on-demand (using extracted loader)
  async function loadAnimatorServices(): Promise<boolean> {
    const result = await loadServices();

    if (result.success) {
      // CRITICAL: Validate that required services are actually present
      if (!result.services?.svgGenerator) {
        console.error(
          "[AnimatorCanvas] CRITICAL: DI container returned success but svgGenerator is null!"
        );
        console.error("[AnimatorCanvas] Services returned:", result.services);
        pixiError = "Failed to load SVG generator service";
        return false;
      }

      if (!result.services?.orchestrator) {
        console.error(
          "[AnimatorCanvas] CRITICAL: DI container returned success but orchestrator is null!"
        );
        pixiError = "Failed to load animation orchestrator service";
        return false;
      }

      if (!result.services?.trailCaptureService) {
        console.error(
          "[AnimatorCanvas] CRITICAL: DI container returned success but trailCaptureService is null!"
        );
        pixiError = "Failed to load trail capture service";
        return false;
      }

      svgGenerator = result.services.svgGenerator;
      settingsService = result.services.settingsService;
      orchestrator = result.services.orchestrator;
      trailCaptureService = result.services.trailCaptureService;
      turnsTupleGenerator = result.services.turnsTupleGenerator;
      servicesReady = true;
      return true;
    }
    console.error("[AnimatorCanvas] Failed to load services:", result.error);
    pixiError = result.error || "Failed to load animator services";
    return false;
  }

  // Glyph cross-fade transition - managed by service
  let glyphTransitionService: GlyphTransitionService | null = null;
  let glyphTransition = $state<GlyphTransitionState>({
    displayedLetter: null,
    displayedTurnsTuple: "(s, 0, 0)",
    displayedBeatNumber: null,
    fadingOutLetter: null,
    fadingOutTurnsTuple: null,
    fadingOutBeatNumber: null,
    isNewLetter: false,
  });

  // Derived accessors for template usage
  const fadingOutLetter = $derived(glyphTransition.fadingOutLetter);
  const fadingOutTurnsTuple = $derived(glyphTransition.fadingOutTurnsTuple);
  const fadingOutBeatNumber = $derived(glyphTransition.fadingOutBeatNumber);
  const displayedLetter = $derived(glyphTransition.displayedLetter);
  const displayedTurnsTuple = $derived(glyphTransition.displayedTurnsTuple);
  const displayedBeatNumber = $derived(glyphTransition.displayedBeatNumber);
  const isNewLetter = $derived(glyphTransition.isNewLetter);

  // Convert float currentBeat to integer beat number for display
  // NOTE: We derive from beatData instead of currentBeat because currentBeat prop isn't reactive
  const beatNumber = $derived.by(() => {
    if (!sequenceData || !beatData) return 0;

    // Find the index of the current beatData in the sequence
    const beatIndex = sequenceData.beats?.findIndex((b) => b === beatData);
    if (beatIndex !== undefined && beatIndex >= 0) {
      return beatIndex + 1; // Beat numbers are 1-indexed
    }

    // If no beat data, we're at the start position
    return 0;
  });

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

  // Calculate turns tuple from beat data for glyph rendering
  const turnsTuple = $derived.by(() => {
    if (!beatData || !beatData.motions?.blue || !beatData.motions?.red) {
      return "(s, 0, 0)";
    }
    return turnsTupleGenerator?.generateTurnsTuple(beatData) ?? "(s, 0, 0)";
  });

  // Extract prop types for bilateral detection in trail capture (legacy - kept for SimpleTrailControls)
  // NOTE: For trail service, we use currentBluePropType/currentRedPropType from settings instead
  const bluePropType = $derived.by(() => {
    const firstBeat = sequenceData?.beats?.[0];
    return firstBeat?.motions?.blue?.propType ?? sequenceData?.propType ?? null;
  });

  const redPropType = $derived.by(() => {
    const firstBeat = sequenceData?.beats?.[0];
    return firstBeat?.motions?.red?.propType ?? sequenceData?.propType ?? null;
  });

  // Canvas size - controlled by CSS container queries
  let canvasSize = $state(DEFAULT_CANVAS_SIZE);

  // Unique instance ID for debugging multiple canvas instances
  const instanceId = Math.random().toString(36).substring(2, 8);
  let containerElement: HTMLDivElement;
  let hasLoggedFrameParams = false;

  // Resize handler (extracted utility)
  let canvasResizeService: ICanvasResizeService | null = null;

  // ViewBox dimensions from the prop SVGs
  let bluePropDimensions = { width: 252.8, height: 77.8 };
  let redPropDimensions = { width: 252.8, height: 77.8 };
  let isInitialized = $state(false);
  let needsRender = $state(true);
  let currentPropType = $state<string>("staff");

  // Glyph texture loader (handles queuing when not initialized)
  let glyphTextureService: IGlyphTextureService | null = null;

  // Prop texture service
  let propTextureService: IPropTextureService | null = null;

  // Pre-computation service (paths + frames)
  let precomputationService: IAnimationPrecomputationService | null = null;

  // Render loop service
  let renderLoopService: IAnimationRenderLoopService | null = null;

  // Trail settings (managed by TrailCaptureService)
  let trailSettings = $state<TrailSettings>(
    externalTrailSettings ?? loadTrailSettings()
  );

  // Pre-computation state (managed by precomputationManager)
  let pathCacheData = $state<AnimationPathCacheData | null>(null);
  let isCachePrecomputing = $state(false);
  let cacheSequenceId = $state<string | null>(null);
  let isPreRendering = $state(false);
  let preRenderProgress = $state<PreRenderProgress | null>(null);
  let preRenderedFramesReady = $state(false);

  // ============================================================================
  // ANIMATION VISIBILITY INITIALIZATION
  // ============================================================================

  // Visibility sync service - handles all visibility state subscriptions
  let visibilitySyncService: AnimationVisibilitySyncService | null = null;

  // Sequence cache service - manages cache lifecycle
  let sequenceCacheService: SequenceCacheService | null = null;

  // Trail settings sync service
  let trailSettingsSyncService: TrailSettingsSyncService | null = null;

  // Prop type change service
  let propTypeChangeService: PropTypeChangeService | null = null;

  // Canvas initializer service - created immediately (not in onMount)
  const canvasInitializer = new AnimatorCanvasInitializer();

  onMount(() => {
    // Initialize visibility sync
    visibilitySyncService = new AnimationVisibilitySyncService();
    const unsubscribeVisibility = visibilitySyncService.subscribe((state) => {
      visibilityState = state;
    });

    // Initialize glyph transition service
    glyphTransitionService = new GlyphTransitionService();
    glyphTransitionService.setStateCallback((state) => {
      glyphTransition = state;
    });

    // Initialize sequence cache service
    sequenceCacheService = new SequenceCacheService();
    sequenceCacheService.setClearCallback(() => {
      precomputationService?.clearCaches();
      trailCaptureService?.clearTrails();
      cacheSequenceId = null;
    });
    sequenceCacheService.setPreRenderClearCallback(() => {
      precomputationService?.getFramePreRenderer()?.clear();
      preRenderedFramesReady = false;
    });

    // Initialize trail settings sync service
    trailSettingsSyncService = new TrailSettingsSyncService();
    trailSettingsSyncService.setSettingsUpdateCallback((newSettings) => {
      trailSettings = newSettings;
    });

    // Initialize prop type change service
    propTypeChangeService = new PropTypeChangeService();
    propTypeChangeService.setStateCallback((state) => {
      currentBluePropType = state.bluePropType;
      currentRedPropType = state.redPropType;
      currentPropType = state.legacyPropType;
    });
    propTypeChangeService.setTextureReloadCallback(() => {
      isInitialized = false;
      loadPropTextures();
    });

    return () => {
      unsubscribeVisibility();
      visibilitySyncService?.dispose();
      visibilitySyncService = null;

      glyphTransitionService?.dispose();
      glyphTransitionService = null;

      sequenceCacheService?.dispose();
      sequenceCacheService = null;

      trailSettingsSyncService?.dispose();
      trailSettingsSyncService = null;

      propTypeChangeService?.dispose();
      propTypeChangeService = null;
    };
  });

  // Initialize pre-computation service
  function initializePrecomputationService() {
    if (!orchestrator) return;

    precomputationService = new AnimationPrecomputationService();
    precomputationService.initialize({
      orchestrator,
      trailCaptureService,
      pixiRenderer,
      propDimensions: bluePropDimensions,
      canvasSize,
      instanceId,
    });
    precomputationService.setStateCallback((state) => {
      if (state.pathCacheData !== undefined)
        pathCacheData = state.pathCacheData;
      if (state.isCachePrecomputing !== undefined)
        isCachePrecomputing = state.isCachePrecomputing;
      if (state.isPreRendering !== undefined)
        isPreRendering = state.isPreRendering;
      if (state.preRenderProgress !== undefined)
        preRenderProgress = state.preRenderProgress;
      if (state.preRenderedFramesReady !== undefined)
        preRenderedFramesReady = state.preRenderedFramesReady;
    });
  }

  // ============================================================================
  // TRAIL SERVICE INITIALIZATION
  // ============================================================================

  // Track whether settings have been loaded (prop types are no longer defaults)
  let settingsLoaded = $state(false);
  $effect(() => {
    // Settings are "loaded" once prop types differ from defaults or settings service confirms
    if (
      currentBluePropType !== "staff" ||
      currentRedPropType !== "staff" ||
      settingsService?.currentSettings
    ) {
      settingsLoaded = true;
    }
  });

  // Initialize trail capture service reactively (only when services AND settings are ready)
  $effect(() => {
    if (!trailCaptureService || !settingsLoaded) return;
    // Use settings-based prop types (currentBluePropType/currentRedPropType)
    // instead of sequence data - settings has the actual prop types being rendered
    trailCaptureService.initialize({
      canvasSize,
      bluePropDimensions,
      redPropDimensions,
      trailSettings,
      bluePropType: currentBluePropType,
      redPropType: currentRedPropType,
    });
    // Initialize trail settings sync with capture service
    trailSettingsSyncService?.initialize(trailCaptureService, () =>
      renderLoopService?.triggerRender(getFrameParams)
    );
  });

  // Update trail capture service when prop types change (after initial load)
  $effect(() => {
    if (!trailCaptureService || !settingsLoaded) return;
    // Track prop type changes from settings
    const blue = currentBluePropType;
    const red = currentRedPropType;
    trailCaptureService.updateConfig({
      bluePropType: blue,
      redPropType: red,
    });
  });

  // ============================================================================
  // EFFECTS AND LIFECYCLE
  // ============================================================================

  // Track prop and visibility changes to trigger re-renders
  // Only run when initialized to prevent render triggers during initialization
  $effect(() => {
    // Track dependencies
    blueProp;
    redProp;
    gridVisible;
    gridMode;
    letter;
    // Also track visibility manager state changes
    visibilityState.grid;
    visibilityState.props;
    visibilityState.trails;
    visibilityState.blueMotion;
    visibilityState.redMotion;

    // Only trigger render if initialized (grid texture loaded)
    if (isInitialized) {
      renderLoopService?.triggerRender(getFrameParams);
    }
  });

  // Track gridMode changes and reload grid texture when it changes
  let previousGridMode = $state<string | null>(gridMode?.toString() ?? null);
  $effect(() => {
    const currentGridMode = gridMode?.toString() ?? null;
    if (isInitialized && pixiRenderer && currentGridMode !== previousGridMode) {
      previousGridMode = currentGridMode;
      // Reload grid texture with new mode
      pixiRenderer.loadGridTexture(currentGridMode ?? "diamond").then(() => {
        renderLoopService?.triggerRender(getFrameParams);
      });
    }
  });

  // Watch for trail settings changes (handled by service)
  $effect(() => {
    trailSettingsSyncService?.handleSettingsChange(
      trailSettings,
      externalTrailSettings !== undefined
    );
  });

  // Sync external trail settings (handled by service)
  $effect(() => {
    trailSettingsSyncService?.handleExternalSettingsSync(externalTrailSettings);
  });

  // Clear trails when BOTH props are hidden (sequence not loaded or all visibility off)
  // Individual prop visibility is handled by the render loop filtering trail points
  $effect(() => {
    if (!blueProp && !redProp) {
      trailCaptureService?.clearTrails();
      renderLoopService?.triggerRender(getFrameParams);
    }
  });

  // Clear caches when sequence changes (handled by service)
  $effect(() => {
    sequenceCacheService?.handleSequenceChange(sequenceData);
  });

  // Clear pre-rendered frames when playback stops (handled by service)
  $effect(() => {
    sequenceCacheService?.setHasPreRenderedFrames(preRenderedFramesReady);
    sequenceCacheService?.handlePlaybackChange(isPlaying);
  });

  // Watch for prop type changes (handled by service)
  let currentBluePropType = $state("staff");
  let currentRedPropType = $state("staff");

  $effect(() => {
    propTypeChangeService?.checkForChanges(settingsService);
  });

  // Initialize PixiJS renderer (orchestrated by canvasInitializer service)
  // Only containerElement is a tracked dependency - backgroundAlpha and gridMode
  // are read with untrack to prevent re-initialization on prop changes
  $effect(() => {
    if (!containerElement) return;

    // Read these values without tracking to prevent re-runs
    const initialBackgroundAlpha = untrack(() => backgroundAlpha);
    const initialGridMode = untrack(() => gridMode);

    canvasInitializer.initialize(
      {
        containerElement,
        backgroundAlpha: initialBackgroundAlpha,
        gridMode: initialGridMode,
        loadAnimatorServices,
        initializePrecomputationService: () => {
          initializePrecomputationService();
          precomputationService?.initializeFramePreRenderer();
        },
        initializePropTextureService,
        initializeResizeService: () => {
          initializeResizeService();
          canvasResizeService?.setup();
        },
        initializeGlyphTextureService,
        initializeRenderLoopService,
        loadPropTextures,
        startRenderLoop: () => renderLoopService?.triggerRender(getFrameParams),
      },
      {
        onPixiLoading: (loading) => {
          pixiLoading = loading;
        },
        onPixiError: (error) => {
          pixiError = error;
        },
        onPixiRendererReady: (renderer) => {
          pixiRenderer = renderer;
        },
        onInitialized: (initialized) => {
          isInitialized = initialized;
        },
        onCanvasReady: (canvas) => {
          onCanvasReady?.(canvas);
        },
      }
    );

    return () => {
      // CRITICAL: Use dispose() not stop() to fully clean up RAF and references
      // This prevents memory leaks on mobile during long playback sessions
      renderLoopService?.dispose();
      canvasResizeService?.teardown();

      // Clean up texture services to release WebGL textures from VRAM
      glyphTextureService?.dispose?.();
      propTextureService?.dispose?.();

      // Clean up precomputation service to release cached paths/frames
      precomputationService?.dispose?.();

      // Clean up trail capture to release trail point buffers
      trailCaptureService?.clearTrails();

      canvasInitializer.destroy({
        onCanvasReady: (canvas) => {
          onCanvasReady?.(canvas);
        },
        onInitialized: (initialized) => {
          isInitialized = initialized;
        },
      });
    };
  });

  // Initialize prop texture service
  function initializePropTextureService() {
    // Validate dependencies with specific error messages
    if (!pixiRenderer) {
      const error =
        "Cannot initialize PropTextureService: pixiRenderer is null";
      console.error(`[AnimatorCanvas] CRITICAL: ${error}`);
      pixiError = error;
      return;
    }

    if (!svgGenerator) {
      const error =
        "Cannot initialize PropTextureService: svgGenerator is null (DI container may have failed to load it)";
      console.error(`[AnimatorCanvas] CRITICAL: ${error}`);
      console.error(
        '[AnimatorCanvas] This usually means the "animate" feature module did not register ISVGGenerator properly'
      );
      pixiError = error;
      return;
    }

    propTextureService = new PropTextureService();
    propTextureService.initialize(pixiRenderer, svgGenerator);
    propTextureService.setTrailCaptureService(trailCaptureService);
    propTextureService.setDimensionsLoadedCallback((blue, red) => {
      bluePropDimensions = blue;
      redPropDimensions = red;
    });
    propTextureService.setLoadCompleteCallback(() => {
      renderLoopService?.triggerRender(getFrameParams);
    });
  }

  // Wrapper for prop texture loading
  async function loadPropTextures() {
    if (!propTextureService) {
      console.error(
        "[AnimatorCanvas] CRITICAL: Cannot load prop textures - propTextureService is null"
      );
      return;
    }

    await propTextureService.loadPropTextures(
      currentBluePropType,
      currentRedPropType
    );
  }

  // Create resize service with callbacks
  function initializeResizeService() {
    if (!containerElement || !pixiRenderer) return;

    canvasResizeService = new CanvasResizeService();
    canvasResizeService.initialize(containerElement, pixiRenderer);
    canvasResizeService.setSizeChangeCallback((newSize: number) => {
      canvasSize = newSize;
      // Update trail capture service with new canvas size
      trailCaptureService?.updateConfig({ canvasSize: newSize });
    });
    canvasResizeService.setResizeCompleteCallback(() => {
      renderLoopService?.triggerRender(getFrameParams);
    });
  }

  // Initialize glyph texture service
  function initializeGlyphTextureService() {
    if (!pixiRenderer) return;

    glyphTextureService = new GlyphTextureService();
    glyphTextureService.initialize(pixiRenderer);
    glyphTextureService.setLoadCompleteCallback(() => {
      renderLoopService?.triggerRender(getFrameParams);
    });
  }

  // Wrapper for GlyphRenderer callback (handles case when service not ready)
  function handleGlyphSvgReady(
    svgString: string,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    glyphTextureService?.handleGlyphSvgReady(svgString, width, height, x, y);
  }

  // Load pending glyph once initialized
  $effect(() => {
    if (
      isInitialized &&
      glyphTextureService?.getPendingGlyph() &&
      pixiRenderer
    ) {
      glyphTextureService.processPendingGlyph();
    }
  });

  // Helper to create frame params for render loop
  function getFrameParams(): RenderFrameParams {
    const params = {
      beatData,
      currentBeat,
      trailSettings,
      gridVisible,
      gridMode,
      letter,
      props: {
        blueProp,
        redProp,
        secondaryBlueProp,
        secondaryRedProp,
        bluePropDimensions,
        redPropDimensions,
      },
      visibility: {
        gridVisible: gridVisibleFromManager,
        propsVisible: propsVisibleFromManager,
        trailsVisible: trailsVisibleFromManager,
        blueMotionVisible: blueMotionVisibleFromManager,
        redMotionVisible: redMotionVisibleFromManager,
      },
    };

    return params;
  }

  // Initialize render loop service
  function initializeRenderLoopService() {
    if (!pixiRenderer) return;

    renderLoopService = new AnimationRenderLoopService();
    renderLoopService.initialize({
      pixiRenderer,
      trailCaptureService,
      pathCache: precomputationService?.getPathCache() ?? null,
      canvasSize,
    });
  }

  // Trigger glyph transition when letter/turns/beat changes (handled by service)
  $effect(() => {
    glyphTransitionService?.updateTarget(letter, turnsTuple, beatNumber);
  });
</script>

<!-- Hidden GlyphRenderer that converts TKAGlyph to SVG for PixiJS rendering -->
{#if letter}
  <GlyphRenderer {letter} {beatData} onSvgReady={handleGlyphSvgReady} />
{/if}

<div
  class="canvas-wrapper"
  bind:this={containerElement}
  data-transparent={backgroundAlpha === 0 ? "true" : "false"}
>
  <GlyphOverlay
    {letter}
    {displayedLetter}
    {displayedTurnsTuple}
    {displayedBeatNumber}
    {fadingOutLetter}
    {fadingOutTurnsTuple}
    {fadingOutBeatNumber}
    {isNewLetter}
    tkaGlyphVisible={tkaGlyphVisibleFromManager}
    beatNumbersVisible={beatNumbersVisibleFromManager}
  />

  <ProgressOverlay
    {isPreRendering}
    {preRenderProgress}
    {preRenderedFramesReady}
  />
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

  /* Canvas element - this is our positioning reference */
  .canvas-wrapper :global(canvas) {
    border: 1px solid rgba(229, 231, 235, 0.4);
    border-radius: 2px;
    background: var(--canvas-bg, #ffffff);
    display: block;
    width: 100%;
    height: 100%;
  }

  /* Transparent canvas when used as overlay */
  .canvas-wrapper[data-transparent="true"] :global(canvas) {
    background: transparent !important;
    border: none !important;
    --canvas-bg: transparent;
  }
</style>
