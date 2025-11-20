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
  import AnimatorCanvas from "./AnimatorCanvas.svelte";
  import AnimationControls from "./AnimationControls.svelte";
  import TrailSettings from "./TrailSettings.svelte";
  import { CreatePanelDrawer } from "$lib/modules/create/shared/components";
  import PanelHeader from "$lib/modules/create/shared/components/PanelHeader.svelte";
  import {
    GridMode,
    type Letter,
    type BeatData,
    type SequenceData,
    MotionColor,
  } from "$shared";
  import type { PropState } from "../domain/types/PropState";
  import {
    type TrailSettings as TrailSettingsType,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
    TrackingMode,
    TrailMode,
  } from "../domain/types/TrailTypes";
  import { getVisibilityStateManager } from "$shared/pictograph/shared/state/visibility-state.svelte";
  import { browser } from "$app/environment";

  // ============================================================================
  // PERSISTENCE CONSTANTS
  // ============================================================================

  const COLLAPSE_STATE_KEY = "tka_animation_collapse_states";

  // ============================================================================
  // PERSISTENCE HELPERS
  // ============================================================================

  /**
   * Load trail settings from localStorage
   */
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
      // Path caching was added for trail rendering, so trails should be enabled
      if (parsed.usePathCache && !parsed.enabled) {
        parsed.enabled = true;
        // Also ensure mode is not OFF
        if (parsed.mode === TrailMode.OFF) {
          parsed.mode = TrailMode.FADE;
        }
      }

      // Migration: Add previewMode if not present (defaults to false = normal trail mode)
      if (!("previewMode" in parsed)) {
        parsed.previewMode = false;
      }

      return { ...DEFAULT_TRAIL_SETTINGS, ...parsed };
    } catch (error) {
      console.error("❌ Failed to load trail settings:", error);
      return { ...DEFAULT_TRAIL_SETTINGS };
    }
  }

  /**
   * Save trail settings to localStorage
   */
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

  /**
   * Load collapse states from localStorage
   */
  function loadCollapseStates(): { playback: boolean; trail: boolean } {
    if (!browser) return { playback: false, trail: false };
    try {
      const stored = localStorage.getItem(COLLAPSE_STATE_KEY);
      if (!stored) return { playback: false, trail: false };
      return JSON.parse(stored);
    } catch (error) {
      console.error("❌ Failed to load collapse states:", error);
      return { playback: false, trail: false };
    }
  }

  /**
   * Save collapse states to localStorage
   */
  function saveCollapseStates(playback: boolean, trail: boolean): void {
    if (!browser) return;
    try {
      localStorage.setItem(
        COLLAPSE_STATE_KEY,
        JSON.stringify({ playback, trail })
      );
    } catch (error) {
      console.error("❌ Failed to save collapse states:", error);
    }
  }

  // Props - ALL state comes from parent
  let {
    show = false,
    combinedPanelHeight = 0,
    isSideBySideLayout = false,
    loading = false,
    error = null,
    speed = 1,
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
    onCanvasReady = () => {},
  }: {
    show?: boolean;
    combinedPanelHeight?: number;
    isSideBySideLayout?: boolean;
    loading?: boolean;
    error?: string | null;
    speed?: number;
    blueProp?: PropState | null;
    redProp?: PropState | null;
    gridVisible?: boolean;
    gridMode?: GridMode | null | undefined;
    letter?: Letter | null;
    beatData?: BeatData | null;
    sequenceData?: SequenceData | null;
    onClose?: () => void;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  } = $props();

  // Get visibility state manager
  const visibilityManager = getVisibilityStateManager();

  // Local state for trail settings and section collapse states (with persistence)
  const initialCollapseStates = loadCollapseStates();
  let trailSettings = $state<TrailSettingsType>(loadTrailSettings());
  let playbackCollapsed = $state(initialCollapseStates.playback);
  let trailCollapsed = $state(initialCollapseStates.trail);

  // ============================================================================
  // AUTO-SAVE EFFECTS
  // ============================================================================

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

  // Auto-save collapse states whenever they change
  $effect(() => {
    saveCollapseStates(playbackCollapsed, trailCollapsed);
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
      // Panel opened - save current global state
      savedMotionVisibility = visibilityManager.saveMotionVisibilityState();
    }
  });

  // Wrap onClose to restore motion visibility before calling parent handler
  function handleClose() {
    // Restore saved motion visibility state
    if (savedMotionVisibility !== null) {
      visibilityManager.restoreMotionVisibilityState(savedMotionVisibility);
      savedMotionVisibility = null;
    }
    // Call parent close handler
    onClose();
  }

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

  function togglePlaybackCollapsed() {
    playbackCollapsed = !playbackCollapsed;
  }

  function toggleTrailCollapsed() {
    trailCollapsed = !trailCollapsed;
  }

  function toggleBlueMotion() {
    const newVisibility = !blueMotionVisible;
    visibilityManager.setMotionVisibility(MotionColor.BLUE, newVisibility);
  }

  function toggleRedMotion() {
    const newVisibility = !redMotionVisible;
    visibilityManager.setMotionVisibility(MotionColor.RED, newVisibility);
  }
</script>

<CreatePanelDrawer
  isOpen={show}
  panelName="animation"
  {combinedPanelHeight}
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
    <PanelHeader
      title="Animation Viewer"
      isMobile={!isSideBySideLayout}
      onClose={handleClose}
    />

    <h2 id="animation-panel-title" class="sr-only">Animation Viewer</h2>

    {#if loading}
      <div class="loading-message">Loading animation...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else}
      <!-- Animation Viewer with Adaptive Layout -->
      <div class="canvas-container">
        <div class="content-wrapper">
          <!-- Canvas Area -->
          <div class="canvas-area">
            <AnimatorCanvas
              blueProp={visibleBlueProp}
              redProp={visibleRedProp}
              {gridVisible}
              {gridMode}
              {letter}
              {beatData}
              {sequenceData}
              {onCanvasReady}
              bind:trailSettings
            />
          </div>

          <!-- Unified Controls Panel -->
          <div class="controls-panel">
            <!-- Speed Control + Inline Visibility Buttons Row -->
            <div class="control-group speed-visibility-row">
              <AnimationControls {speed} {onSpeedChange} {onPlaybackStart} />

              <!-- Motion Visibility Buttons -->
              <div class="visibility-buttons-inline">
                <button
                  class="vis-btn blue-vis-btn"
                  class:active={blueMotionVisible}
                  onclick={toggleBlueMotion}
                  type="button"
                  title={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
                >
                  <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                </button>
                <button
                  class="vis-btn red-vis-btn"
                  class:active={redMotionVisible}
                  onclick={toggleRedMotion}
                  type="button"
                  title={redMotionVisible ? "Hide red motion" : "Show red motion"}
                >
                  <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                </button>
              </div>
            </div>

            <!-- Trail Settings -->
            <div class="control-group trail-group">
              <TrailSettings
                bind:settings={trailSettings}
                compact={true}
                hideVisibilityButtons={true}
              />
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</CreatePanelDrawer>

<style>
  /* ===========================
     2026 DESIGN SYSTEM
     Modern, glassmorphic animation panel
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
    flex-direction: column; /* Stack content-wrapper vertically */
    align-items: stretch;
    justify-content: flex-start;
    min-height: 0;
    padding: clamp(12px, 2vw, 20px);
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    flex: 1; /* Allow wrapper to grow and fill canvas-container */
    gap: 10px;
    min-height: 0;
  }

  /* ===========================
     CANVAS AREA
     =========================== */

  .canvas-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 200px; /* Ensure canvas is always visible */
    min-width: 0;
    /* Canvas expands aggressively to fill available space */
    flex: 1 1 auto;
    container-type: size;
    container-name: canvas-zone;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    overflow: hidden;
  }

  /* ===========================
     UNIFIED CONTROLS PANEL
     All controls in one cohesive layout
     =========================== */

  .controls-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 0 0 auto; /* Don't shrink, only take intrinsic size */
    gap: clamp(10px, 2vw, 14px); /* Tighter gaps for space efficiency */
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(10px, 2vw, 16px);
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(12px, 2.4vw, 16px);
    backdrop-filter: blur(12px);
    box-shadow:
      0 4px 20px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    -webkit-overflow-scrolling: touch;
  }

  /* Custom scrollbar */
  .controls-panel::-webkit-scrollbar {
    width: 6px;
  }

  .controls-panel::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .controls-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .controls-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* ===========================
     CONTROL GROUPS
     Logical groupings with subtle separation
     =========================== */

  .control-group {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.2vw, 10px); /* Tighter for better space usage */
  }

  /* Speed + Visibility Row */
  .speed-visibility-row {
    flex-direction: row;
    align-items: center;
    gap: clamp(8px, 1.6vw, 12px);
  }

  /* Equal width allocation for all direct children */
  .speed-visibility-row > .controls-container {
    flex: 1 1 0 !important;
    min-width: 0;
  }

  .speed-visibility-row > .visibility-buttons-inline {
    flex: 1 1 0 !important;
    min-width: 0;
  }

  .visibility-buttons-inline {
    display: flex;
    gap: clamp(4px, 0.8vw, 6px);
  }

  /* Visibility buttons - compact inline version */
  .vis-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: clamp(44px, 8.8vw, 48px);
    min-height: clamp(44px, 8.8vw, 48px);
    padding: clamp(8px, 1.6vw, 10px);
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(8px, 1.6vw, 10px);
    color: rgba(255, 255, 255, 0.5);
    font-size: clamp(16px, 3.2vw, 18px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
  }

  .vis-btn:active {
    transform: scale(0.98);
  }

  /* Blue visibility button */
  .vis-btn.active.blue-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(46, 49, 146, 0.6) 0%,
      rgba(59, 130, 246, 0.6) 100%
    );
    border-color: rgba(59, 130, 246, 0.8);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.blue-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(46, 49, 146, 0.7) 0%,
        rgba(59, 130, 246, 0.7) 100%
      );
      border-color: rgba(59, 130, 246, 1);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
    }
  }

  /* Red visibility button */
  .vis-btn.active.red-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(237, 28, 36, 0.6) 0%,
      rgba(239, 68, 68, 0.6) 100%
    );
    border-color: rgba(239, 68, 68, 0.8);
    color: rgba(254, 202, 202, 1);
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.red-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(237, 28, 36, 0.7) 0%,
        rgba(239, 68, 68, 0.7) 100%
      );
      border-color: rgba(239, 68, 68, 1);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
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

    .canvas-area {
      flex: 1 1 auto;
      width: auto;
      height: 100%;
    }
  }

  /* ===========================
     DESKTOP OPTIMIZATIONS
     No scrolling, perfect fit
     =========================== */

  @container animator-canvas (min-width: 400px) {
    .controls-panel {
      overflow-y: hidden !important;
      overflow-x: hidden;
      gap: 0.8cqh; /* Tighter gaps to maximize canvas */
      padding: 1cqh 1.2cqw;
      /* Don't set height/max-height - let it take intrinsic size */
    }

    /* Landscape: panel on right */
    @container animator-canvas (min-aspect-ratio: 1.2/1) {
      .controls-panel {
        width: min(280px, 26cqw); /* Slightly narrower for more canvas */
        height: 100%; /* In landscape, controls can be full height */
        max-height: 100%;
      }
    }

    /* Control groups maintain spacing */
    .control-group {
      gap: 0.6cqh; /* Tighter for space efficiency */
    }

    /* Speed + Visibility Row - Desktop optimizations */
    .speed-visibility-row {
      gap: 0.5cqw;
      flex-wrap: nowrap;
    }

    /* Maintain equal width for all children */
    .speed-visibility-row > * {
      flex: 1 1 0;
      min-width: 0;
    }

    .visibility-buttons-inline {
      gap: 0.3cqw;
    }

    .vis-btn {
      min-width: 2.5cqh;
      min-height: 2.5cqh;
      padding: 0;
      font-size: 1cqh;
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

  /* ===========================
     ACCESSIBILITY
     =========================== */

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .controls-panel {
      transition: none;
      animation: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .controls-panel {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  /* ===========================
     MOBILE OPTIMIZATIONS
     =========================== */

  @media (max-width: 480px) {
    .controls-panel {
      padding: 14px;
      gap: 18px;
    }
  }

  /* Landscape mobile - compact layout */
  @media (max-height: 500px) and (orientation: landscape) {
    .controls-panel {
      padding: 10px;
      gap: 12px;
    }
  }

  /* Intentional blank to fix parsing */
  @keyframes intentionalBlankToAvoidParseErrors {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
