<!--
  AnimationShareDrawer.svelte

  Drawer component for animated GIF export and playback.
  All business logic lives in AnimationCoordinator.

  This component:
  - Receives all state as props
  - Displays animation playback UI
  - Handles GIF export controls
  - Emits events when user interacts
  - Has ZERO business logic
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  // Extracted components (from animate module)
  import AnimationPanelHeader from "$lib/features/compose/components/canvas/AnimationPanelHeader.svelte";
  import AnimationCanvas from "$lib/features/compose/components/canvas/AnimationCanvas.svelte";
  import AnimationControlsPanel from "$lib/features/compose/components/canvas/AnimationControlsPanel.svelte";
  import CreatePanelDrawer from "$lib/features/create/shared/components/CreatePanelDrawer.svelte";

  // Services
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IResponsiveLayoutService } from "$lib/features/create/shared/services/contracts/IResponsiveLayoutService";

  // Types
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { PropState } from "$lib/features/compose/shared/domain/types/PropState";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { getVisibilityStateManager } from "$lib/shared/pictograph/shared/state/visibility-state.svelte";
  import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import { animationSettings } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";

  // ============================================================================
  // MOBILE STATE
  // ============================================================================

  // Mobile is always full-height now (no half-height state)
  // The expand toggle now shows/hides additional controls within the tool area
  let mobileIsExpanded = $state(false); // Whether the drawer is expanded to full height on mobile
  let mobileToolsExpanded = $state(true); // Whether to show full controls or just toolbar
  let mobileToolView = $state<"controls" | "beat-grid">("controls"); // Toggle between views

  // Toggle mobile tool view between controls and beat-grid
  function toggleMobileToolView() {
    mobileToolView = mobileToolView === "controls" ? "beat-grid" : "controls";
  }

  // Legacy scroll handling state (kept for desktop compatibility)
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

    const currentX = touch.pageX;
    const deltaX = currentX - mobileTouchStartX;
    const deltaY = mobileTouchStartY - touch.pageY;
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);

    // Prevent horizontal swipes from triggering back navigation
    if (isHorizontalSwipe && Math.abs(deltaX) > 5) {
      e.preventDefault();
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
    isSideBySideLayout: isSideBySideLayoutProp,
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
    isExporting = false,
    exportProgress = null,
    onClose = () => {},
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
    onPlaybackToggle = () => {},
    onCanvasReady = () => {},
    onVideoBeatChange = () => {},
    onExportGif = () => {},
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
    isExporting?: boolean;
    exportProgress?: { progress: number; stage: string } | null;
    onClose?: () => void;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onPlaybackToggle?: () => void;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
    onVideoBeatChange?: (beat: number) => void;
    onExportGif?: () => void;
  } = $props();

  // ============================================================================
  // LAYOUT DETECTION
  // ============================================================================

  // Detect side-by-side layout internally if not provided via prop
  let layoutService: IResponsiveLayoutService | null = null;
  let detectedSideBySide = $state(false);

  onMount(() => {
    layoutService = tryResolve<IResponsiveLayoutService>(
      TYPES.IResponsiveLayoutService
    );
    if (layoutService) {
      detectedSideBySide = layoutService.shouldUseSideBySideLayout();
    }
  });

  // Update on resize
  $effect(() => {
    if (!browser || !layoutService) return;

    const handleResize = () => {
      if (layoutService) {
        detectedSideBySide = layoutService.shouldUseSideBySideLayout();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  // Use prop if explicitly provided, otherwise use detected value
  const isSideBySideLayout = $derived(
    isSideBySideLayoutProp !== undefined
      ? isSideBySideLayoutProp
      : detectedSideBySide
  );

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Get visibility state manager
  const visibilityManager = getVisibilityStateManager();

  // Trail settings from global animation settings (derived for reactivity)
  let trailSettings = $derived(animationSettings.settings.trail);

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
            {trailSettings}
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
            {mobileToolView}
            {sequenceData}
            currentBeat={sharedAnimationState.currentBeat}
            {onSpeedChange}
            {onPlaybackStart}
            {onPlaybackToggle}
            onToggleBlue={toggleBlueMotion}
            onToggleRed={toggleRedMotion}
            onToggleExpanded={toggleMobileExpanded}
            onToggleToolView={toggleMobileToolView}
            {onExportGif}
            {isExporting}
            {exportProgress}
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
  @media (max-width: 430px) and (max-height: 752px) {
    .content-wrapper.mobile-expanded :global(.canvas-area) {
      flex: 0 0 152px;
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

  @container animator-canvas (min-aspect-ratio: 1.5/1) {
    .content-wrapper {
      flex-direction: row;
      gap: 1.5cqw;
      align-items: stretch;
    }

    .content-wrapper :global(.canvas-area) {
      flex: 1 1 50%;
      min-width: 0;
      width: auto;
      height: 100%;
    }

    .content-wrapper :global(.controls-panel) {
      flex: 0 0 auto;
      min-width: 280px;
      max-width: 400px;
      height: 100%;
      overflow-y: auto;
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
