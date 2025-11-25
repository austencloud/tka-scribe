<!--
  AnimationPanel.svelte

  Pure presentation component for animation display.
  All business logic lives in AnimationCoordinator.

  This component:
  - Receives all state as props
  - Displays UI based on props
  - Emits events when user interacts
  - Has ZERO business logic
  - ONLY shows animation and allows exiting (export moved to Share panel)

  Refactored: Uses extracted components and utility modules for clean separation of concerns.
-->
<script lang="ts">
  // Extracted components
  import AnimationPanelHeader from "./AnimationPanelHeader.svelte";
  import AnimationCanvas from "./AnimationCanvas.svelte";
  import AnimationControlsPanel from "./AnimationControlsPanel.svelte";
  import { CreatePanelDrawer } from "$lib/modules/create/shared/components";

  // Utilities
  import { loadTrailSettings, saveTrailSettings } from "../utils/animation-panel-persistence";
  import { createMobileScrollHandler } from "../utils/mobile-scroll-handler.svelte";

  // Types
  import {
    GridMode,
    type Letter,
    type BeatData,
    type SequenceData,
    MotionColor,
  } from "$shared";
  import type { StartPositionData } from "$create/shared";
  import type { PropState } from "../domain/types/PropState";
  import type { TrailSettings as TrailSettingsType } from "../domain/types/TrailTypes";
  import { getVisibilityStateManager } from "$shared/pictograph/shared/state/visibility-state.svelte";

  // Props - ALL state comes from parent
  let {
    show = false,
    combinedPanelHeight = 0,
    isSideBySideLayout = false,
    loading = false,
    error = null,
    speed = 1,
    isPlaying = false,
    blueProp = null,
    redProp = null,
    gridVisible = true,
    gridMode = null,
    letter = null,
    beatData = null,
    sequenceData = null,
    onClose = () => {},
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
    onPlaybackToggle = () => {},
    onCanvasReady = () => {},
    onVideoBeatChange = () => {},
  }: {
    show?: boolean;
    combinedPanelHeight?: number;
    isSideBySideLayout?: boolean;
    loading?: boolean;
    error?: string | null;
    speed?: number;
    isPlaying?: boolean;
    blueProp?: PropState | null;
    redProp?: PropState | null;
    gridVisible?: boolean;
    gridMode?: GridMode | null | undefined;
    letter?: Letter | null;
    beatData?: StartPositionData | BeatData | null;
    sequenceData?: SequenceData | null;
    onClose?: () => void;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onPlaybackToggle?: () => void;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    onVideoBeatChange?: (beat: number) => void;
  } = $props();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Get visibility state manager
  const visibilityManager = getVisibilityStateManager();

  // Trail settings with auto-persistence
  let trailSettings = $state<TrailSettingsType>(loadTrailSettings());

  // Auto-save trail settings whenever they change
  $effect(() => {
    // Access all properties to track changes (reactivity)
    void trailSettings.mode;
    void trailSettings.fadeDurationMs;
    void trailSettings.lineWidth;
    void trailSettings.glowEnabled;
    void trailSettings.trackingMode;
    void trailSettings.hideProps;
    void trailSettings.enabled;

    // Save to localStorage
    saveTrailSettings(trailSettings);
  });

  // Motion visibility state - reactive to visibility manager
  let blueMotionVisible = $state(
    visibilityManager.getMotionVisibility(MotionColor.BLUE)
  );
  let redMotionVisible = $state(
    visibilityManager.getMotionVisibility(MotionColor.RED)
  );

  // Saved motion visibility state for temporary overrides
  let savedMotionVisibility: { blue: boolean; red: boolean } | null = null;

  // Save motion visibility when panel opens
  $effect(() => {
    if (show && savedMotionVisibility === null) {
      savedMotionVisibility = visibilityManager.saveMotionVisibilityState();
    }
  });

  // Register observer to update visibility when it changes
  $effect(() => {
    const updateVisibility = () => {
      blueMotionVisible = visibilityManager.getMotionVisibility(MotionColor.BLUE);
      redMotionVisible = visibilityManager.getMotionVisibility(MotionColor.RED);
    };

    visibilityManager.registerObserver(updateVisibility, ["motion"]);

    return () => {
      visibilityManager.unregisterObserver(updateVisibility);
    };
  });

  // Computed props based on visibility
  const visibleBlueProp = $derived(blueMotionVisible ? blueProp : null);
  const visibleRedProp = $derived(redMotionVisible ? redProp : null);

  // ============================================================================
  // MOBILE SCROLL HANDLER
  // ============================================================================

  // Create mobile scroll handler with all touch/scroll logic
  const scrollHandler = createMobileScrollHandler();
  let scrollContainerRef = $state<HTMLDivElement | null>(null);

  // Sync scroll container ref to handler
  $effect(() => {
    scrollHandler.setScrollContainer(scrollContainerRef);
  });

  // Reset when panel closes or layout changes
  $effect(() => {
    if (!show || isSideBySideLayout) {
      scrollHandler.reset();
    }
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function handleClose() {
    // Restore saved motion visibility state
    if (savedMotionVisibility !== null) {
      visibilityManager.restoreMotionVisibilityState(savedMotionVisibility);
      savedMotionVisibility = null;
    }
    onClose();
  }

  function toggleBlueMotion() {
    visibilityManager.setMotionVisibility(MotionColor.BLUE, !blueMotionVisible);
  }

  function toggleRedMotion() {
    visibilityManager.setMotionVisibility(MotionColor.RED, !redMotionVisible);
  }
</script>

<CreatePanelDrawer
  isOpen={show}
  panelName="animation"
  {combinedPanelHeight}
  fullHeightOnMobile={scrollHandler.isExpanded && !isSideBySideLayout}
  showHandle={true}
  closeOnBackdrop={false}
  focusTrap={false}
  lockScroll={false}
  labelledBy="animation-panel-title"
  onClose={handleClose}
>
  <div
    class="animation-panel"
    role="dialog"
    aria-labelledby="animation-panel-title"
  >
    <!-- Header (Mobile/Desktop adaptive) -->
    <AnimationPanelHeader {isSideBySideLayout} onClose={handleClose} />

    <h2 id="animation-panel-title" class="sr-only">Animation Viewer</h2>

    {#if loading}
      <div class="loading-message">Loading animation...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else}
      <!-- Animation Viewer with Adaptive Layout -->
      <div class="canvas-container">
        <div class="content-wrapper" class:mobile-expanded={scrollHandler.isExpanded && !isSideBySideLayout}>
          <!-- Canvas Area -->
          <AnimationCanvas
            blueProp={visibleBlueProp}
            redProp={visibleRedProp}
            {gridVisible}
            {gridMode}
            {letter}
            {beatData}
            {sequenceData}
            {isPlaying}
            {speed}
            {onCanvasReady}
            {onVideoBeatChange}
            bind:trailSettings
          />

          <!-- Unified Controls Panel -->
          <AnimationControlsPanel
            {speed}
            {isPlaying}
            {blueMotionVisible}
            {redMotionVisible}
            bind:trailSettings
            {isSideBySideLayout}
            isExpanded={scrollHandler.isExpanded}
            bind:scrollContainerRef
            {onSpeedChange}
            {onPlaybackStart}
            {onPlaybackToggle}
            onToggleBlue={toggleBlueMotion}
            onToggleRed={toggleRedMotion}
            onToggleExpanded={scrollHandler.toggleExpanded}
            preventBackNavAction={scrollHandler.preventBackNavigation}
            onScroll={(e) => scrollHandler.handleScroll(e, isSideBySideLayout)}
          />
        </div>
      </div>
    {/if}
  </div>
</CreatePanelDrawer>

<style>
  /* ===========================
     ANIMATION PANEL
     Main container and layout styles
     (Component-specific styles are in child components)
     =========================== */

  .animation-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    /* Prevent browser back navigation on horizontal swipes */
    overscroll-behavior-x: contain;
    touch-action: pan-y pinch-zoom;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* ===========================
     MAIN LAYOUT
     =========================== */

  .canvas-container {
    container-type: size;
    container-name: animator-canvas;
    flex: 1;
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    min-height: 0;
    padding: clamp(4px, 2vw, 20px);
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    flex: 1;
    gap: 10px;
    min-height: 0;
  }

  /* Mobile Expanded: Responsive layout that adapts to viewport size */
  .content-wrapper.mobile-expanded {
    gap: 4px;
  }

  /* Small devices (iPhone SE, small phones): Fixed compact canvas */
  @media (max-width: 430px) and (max-height: 750px) {
    .content-wrapper.mobile-expanded :global(.canvas-area) {
      flex: 0 0 150px;
      min-height: 140px;
    }

    .content-wrapper.mobile-expanded :global(.controls-panel) {
      flex: 1 1 0;
      overflow-y: auto;
      max-height: none;
      padding: 4px;
      gap: 6px;
    }

    .animation-panel:has(.content-wrapper.mobile-expanded) .canvas-container {
      padding: 4px !important;
    }
  }

  /* Medium to large devices (Galaxy Fold, tablets): Responsive flexible layout */
  @media (min-width: 431px), (min-height: 751px) {
    .content-wrapper.mobile-expanded :global(.canvas-area) {
      flex: 1 1 auto;
      min-height: 200px;
      max-height: 60vh;
    }

    .content-wrapper.mobile-expanded :global(.controls-panel) {
      flex: 0 1 auto;
      overflow-y: auto;
      padding: 8px;
      gap: 10px;
    }

    .animation-panel:has(.content-wrapper.mobile-expanded) .canvas-container {
      padding: 8px !important;
    }
  }

  /* ===========================
     LANDSCAPE LAYOUT - Side-by-side
     =========================== */

  @container animator-canvas (min-aspect-ratio: 1.2/1) {
    .content-wrapper {
      flex-direction: row;
      gap: 1.5cqw;
    }

    .content-wrapper :global(.canvas-area) {
      flex: 1 1 auto;
      width: auto;
      height: 100%;
    }
  }

  /* ===========================
     LOADING & ERROR STATES
     =========================== */

  .loading-message,
  .error-message {
    text-align: center;
    padding: clamp(20px, 4vw, 32px);
    font-size: clamp(13px, 2.8vw, 15px);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    border-radius: clamp(12px, 2vw, 16px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
  }

  .error-message {
    color: rgba(252, 165, 165, 1);
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }
</style>
