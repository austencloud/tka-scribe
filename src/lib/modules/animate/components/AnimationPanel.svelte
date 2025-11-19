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
  import { GridMode, type Letter, type BeatData, MotionColor } from "$shared";
  import type { PropState } from "../domain/types/PropState";
  import {
    type TrailSettings as TrailSettingsType,
    DEFAULT_TRAIL_SETTINGS,
    TRAIL_SETTINGS_STORAGE_KEY,
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
      localStorage.setItem(TRAIL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
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
  function saveCollapseStates(
    playback: boolean,
    trail: boolean
  ): void {
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
    void trailSettings.trackBothEnds;
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
  {onClose}
>
  <div
    class="animation-panel"
    role="dialog"
    aria-labelledby="animation-panel-title"
  >
    <PanelHeader
      title="Animation Viewer"
      isMobile={!isSideBySideLayout}
      {onClose}
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
              {onCanvasReady}
              bind:trailSettings
            />
          </div>

          <!-- Unified Controls Panel -->
          <div class="controls-panel">
            <!-- Motion Visibility -->
            <div class="control-group visibility-group">
              <button
                class="visibility-btn blue-btn"
                class:active={blueMotionVisible}
                onclick={toggleBlueMotion}
                aria-label={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
                type="button"
              >
                <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                <span class="btn-label">Blue</span>
              </button>
              <button
                class="visibility-btn red-btn"
                class:active={redMotionVisible}
                onclick={toggleRedMotion}
                aria-label={redMotionVisible ? "Hide red motion" : "Show red motion"}
                type="button"
              >
                <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                <span class="btn-label">Red</span>
              </button>
            </div>

            <!-- Speed Control -->
            <div class="control-group speed-group">
              <AnimationControls
                {speed}
                {onSpeedChange}
                {onPlaybackStart}
              />
            </div>

            <!-- Trail Settings -->
            <div class="control-group trail-group">
              <TrailSettings bind:settings={trailSettings} compact={true} />
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
    align-items: center;
    justify-content: center;
    min-height: 0;
    padding: clamp(12px, 2vw, 20px);
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
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
    min-height: 0;
    min-width: 0;
    /* Canvas should take up most space on mobile */
    flex: 1 1 60%;
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
    flex: 0 1 auto;
    max-height: 40%;
    gap: clamp(16px, 3.2vw, 24px); /* Generous breathing room */
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(12px, 2.4vw, 20px);
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
    gap: clamp(8px, 1.6vw, 12px);
  }

  /* ===========================
     VISIBILITY BUTTONS
     Larger touch targets with labels
     =========================== */

  .visibility-group {
    display: flex;
    flex-direction: row;
    gap: clamp(10px, 2vw, 14px);
  }

  .visibility-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 0.8vw, 6px);
    min-height: clamp(48px, 9.6vw, 56px); /* Better touch target */
    padding: clamp(8px, 1.6vw, 12px);
    background: rgba(0, 0, 0, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(10px, 2vw, 14px);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .visibility-btn i {
    font-size: clamp(18px, 3.6vw, 22px); /* Larger icons */
  }

  .visibility-btn .btn-label {
    font-size: clamp(11px, 2.2vw, 13px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.8;
  }

  @media (hover: hover) and (pointer: fine) {
    .visibility-btn:hover {
      background: rgba(0, 0, 0, 0.35);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
  }

  .visibility-btn:active {
    transform: scale(0.98);
  }

  .visibility-btn.active.blue-btn {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.35) 0%,
      rgba(37, 99, 235, 0.35) 100%
    );
    border-color: rgba(59, 130, 246, 0.7);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 3px 12px rgba(59, 130, 246, 0.3);
  }

  .visibility-btn.active.blue-btn .btn-label {
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    .visibility-btn.active.blue-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.45) 0%,
        rgba(37, 99, 235, 0.45) 100%
      );
      border-color: rgba(59, 130, 246, 0.9);
      box-shadow: 0 5px 16px rgba(59, 130, 246, 0.4);
    }
  }

  .visibility-btn.active.red-btn {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.35) 0%,
      rgba(220, 38, 38, 0.35) 100%
    );
    border-color: rgba(239, 68, 68, 0.7);
    color: rgba(254, 202, 202, 1);
    box-shadow: 0 3px 12px rgba(239, 68, 68, 0.3);
  }

  .visibility-btn.active.red-btn .btn-label {
    opacity: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    .visibility-btn.active.red-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.45) 0%,
        rgba(220, 38, 38, 0.45) 100%
      );
      border-color: rgba(239, 68, 68, 0.9);
      box-shadow: 0 5px 16px rgba(239, 68, 68, 0.4);
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
      gap: 1.2cqh; /* Generous breathing room on desktop */
      padding: 1.2cqh 1.5cqw;
      height: 100%;
      max-height: 100%;
    }

    /* Landscape: panel on right */
    @container animator-canvas (min-aspect-ratio: 1.2/1) {
      .controls-panel {
        width: min(300px, 28cqw);
      }
    }

    /* Visibility buttons - larger on desktop */
    .visibility-btn {
      min-height: 4.5cqh;
    }

    .visibility-btn i {
      font-size: 2cqh;
    }

    .visibility-btn .btn-label {
      font-size: 1.1cqh;
    }

    /* Control groups maintain spacing */
    .control-group {
      gap: 0.8cqh;
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
    .controls-panel,
    .visibility-btn {
      transition: none;
      animation: none;
    }

    .visibility-btn:hover,
    .visibility-btn:active {
      transform: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .controls-panel {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .visibility-btn {
      border-width: 3px;
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

  @media (max-width: 360px) {
    .visibility-btn {
      min-height: 48px; /* Maintain minimum touch target */
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
