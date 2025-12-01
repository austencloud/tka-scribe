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
-->
<script lang="ts">
  import { browser } from "$app/environment";

  // Extracted components (from animate module)
  import AnimationPanelHeader from "$lib/features/animate/components/canvas/AnimationPanelHeader.svelte";
  import AnimationCanvas from "$lib/features/animate/components/canvas/AnimationCanvas.svelte";
  import AnimationControlsPanel from "$lib/features/animate/components/canvas/AnimationControlsPanel.svelte";
  import { CreatePanelDrawer } from "$lib/features/create/shared/components";

  // Types
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { PropState } from "$lib/features/animate/shared/domain/types/PropState";
  import type { TrailSettings as TrailSettingsType } from "$lib/features/animate/shared/domain/types/TrailTypes";
  import {
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
    TrackingMode,
    TrailMode,
  } from "$lib/features/animate/shared/domain/types/TrailTypes";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { getVisibilityStateManager } from "$lib/shared/pictograph/shared/state/visibility-state.svelte";
  import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";

  // ============================================================================
  // TRAIL SETTINGS PERSISTENCE (inlined)
  // ============================================================================

  function loadTrailSettings(): TrailSettingsType {
    if (!browser) return { ...DEFAULT_TRAIL_SETTINGS };
    try {
      const stored = localStorage.getItem(TRAIL_SETTINGS_STORAGE_KEY);
      if (!stored) return { ...DEFAULT_TRAIL_SETTINGS };
      const parsed = JSON.parse(stored);

      // Migration: convert old trackBothEnds boolean to new trackingMode enum
      if ("trackBothEnds" in parsed && !("trackingMode" in parsed)) {
        parsed.trackingMode = parsed.trackBothEnds
          ? TrackingMode.BOTH_ENDS
          : TrackingMode.RIGHT_END;
        delete parsed.trackBothEnds;
      }

      // Migration: Auto-enable trails if path caching is enabled
      if (parsed.usePathCache && !parsed.enabled) {
        parsed.enabled = true;
        if (parsed.mode === TrailMode.OFF) {
          parsed.mode = TrailMode.FADE;
        }
      }

      // Migration: Add previewMode if not present
      if (!("previewMode" in parsed)) {
        parsed.previewMode = false;
      }

      return { ...DEFAULT_TRAIL_SETTINGS, ...parsed };
    } catch (error) {
      console.error("❌ Failed to load trail settings:", error);
      return { ...DEFAULT_TRAIL_SETTINGS };
    }
  }

  function saveTrailSettings(settings: TrailSettingsType): void {
    if (!browser) return;
    try {
      localStorage.setItem(
        TRAIL_SETTINGS_STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error("❌ Failed to save trail settings:", error);
    }
  }

  // ============================================================================
  // MOBILE SCROLL HANDLER STATE (inlined)
  // ============================================================================

  let mobileIsExpanded = $state(false);
  let mobileLastScrollTop = $state(0);
  let mobileTouchStartY = $state(0);
  let mobileTouchStartX = $state(0);
  let mobileScrollContainerRef: HTMLDivElement | null = null;
  let mobileRafId: number | null = null;

  function handleMobileTouchStart(e: TouchEvent, _isSideBySideLayout: boolean) {
    const touch = e.touches[0];
    if (!touch) return;
    mobileTouchStartY = touch.pageY;
    mobileTouchStartX = touch.pageX;
    if (touch.pageX < 10) {
      e.preventDefault();
    }
  }

  function handleMobileTouchMove(e: TouchEvent, sideBySide: boolean) {
    const touch = e.touches[0];
    if (!touch) return;

    const currentY = touch.pageY;
    const currentX = touch.pageX;
    const deltaY = mobileTouchStartY - currentY;
    const deltaX = currentX - mobileTouchStartX;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    if (isHorizontalSwipe && Math.abs(deltaX) > 5) {
      e.preventDefault();
    }

    if (!sideBySide && !mobileIsExpanded && mobileScrollContainerRef) {
      if (!isHorizontalSwipe && deltaY > 30) {
        mobileIsExpanded = true;
      }
    }
  }

  function preventBackNavigation(node: HTMLElement, sideBySide: boolean) {
    const onTouchStart = (e: TouchEvent) =>
      handleMobileTouchStart(e, sideBySide);
    const onTouchMove = (e: TouchEvent) => handleMobileTouchMove(e, sideBySide);
    const onWheel = (e: WheelEvent) => {
      const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (isHorizontalSwipe && Math.abs(e.deltaX) > 5) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    node.addEventListener("touchstart", onTouchStart, { passive: false });
    node.addEventListener("touchmove", onTouchMove, { passive: false });
    node.addEventListener("wheel", onWheel, { passive: false });

    return {
      update(newSideBySide: boolean) {
        node.removeEventListener("touchstart", onTouchStart);
        node.removeEventListener("touchmove", onTouchMove);
        node.removeEventListener("wheel", onWheel);

        const updatedOnTouchStart = (e: TouchEvent) =>
          handleMobileTouchStart(e, newSideBySide);
        const updatedOnTouchMove = (e: TouchEvent) =>
          handleMobileTouchMove(e, newSideBySide);

        node.addEventListener("touchstart", updatedOnTouchStart, {
          passive: false,
        });
        node.addEventListener("touchmove", updatedOnTouchMove, {
          passive: false,
        });
        node.addEventListener("wheel", onWheel, { passive: false });
      },
      destroy() {
        node.removeEventListener("touchstart", onTouchStart);
        node.removeEventListener("touchmove", onTouchMove);
        node.removeEventListener("wheel", onWheel);
      },
    };
  }

  function handleMobileScroll(e: Event, sideBySide: boolean) {
    if (!sideBySide && mobileIsExpanded && mobileScrollContainerRef) {
      if (mobileRafId !== null) {
        cancelAnimationFrame(mobileRafId);
      }
      mobileRafId = requestAnimationFrame(() => {
        const target = e.target as HTMLDivElement;
        const { scrollTop } = target;
        const scrollingUp = scrollTop < mobileLastScrollTop;

        if (scrollTop === 0 && scrollingUp) {
          mobileIsExpanded = false;
          target.scrollTop = 0;
        }

        mobileLastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
        mobileRafId = null;
      });
    }
  }

  function resetMobileScroll() {
    mobileIsExpanded = false;
    mobileLastScrollTop = 0;
  }

  function setMobileScrollContainer(element: HTMLDivElement | null) {
    mobileScrollContainerRef = element;
  }

  function toggleMobileExpanded() {
    mobileIsExpanded = !mobileIsExpanded;
  }

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
      blueMotionVisible = visibilityManager.getMotionVisibility(
        MotionColor.BLUE
      );
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
  // MOBILE SCROLL HANDLER EFFECTS
  // ============================================================================

  let scrollContainerRef = $state<HTMLDivElement | null>(null);

  // Sync scroll container ref
  $effect(() => {
    setMobileScrollContainer(scrollContainerRef);
  });

  // Reset when panel closes or layout changes
  $effect(() => {
    if (!show || isSideBySideLayout) {
      resetMobileScroll();
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
  fullHeightOnMobile={mobileIsExpanded && !isSideBySideLayout}
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
        <div
          class="content-wrapper"
          class:mobile-expanded={mobileIsExpanded && !isSideBySideLayout}
        >
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
            {onPlaybackToggle}
            bind:trailSettings
          />

          <!-- Unified Controls Panel -->
          <AnimationControlsPanel
            {speed}
            {isPlaying}
            {blueMotionVisible}
            {redMotionVisible}
            {isSideBySideLayout}
            isExpanded={mobileIsExpanded}
            bind:scrollContainerRef
            {onSpeedChange}
            {onPlaybackStart}
            {onPlaybackToggle}
            onToggleBlue={toggleBlueMotion}
            onToggleRed={toggleRedMotion}
            onToggleExpanded={toggleMobileExpanded}
            preventBackNavAction={preventBackNavigation}
            onScroll={(e) => handleMobileScroll(e, isSideBySideLayout)}
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
