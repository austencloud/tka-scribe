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
  } from "../domain/types/TrailTypes";
  import { getVisibilityStateManager } from "$shared/pictograph/shared/state/visibility-state.svelte";

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

  // Local state for trail settings and section collapse states
  let trailSettings = $state<TrailSettingsType>({ ...DEFAULT_TRAIL_SETTINGS });
  let playbackCollapsed = $state(false);
  let trailCollapsed = $state(false);

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

          <!-- Controls Sidebar -->
          <div class="controls-sidebar">
            <!-- Motion Visibility Controls - Minimal Space -->
            <div class="visibility-bar">
              <button
                class="visibility-toggle blue-toggle"
                class:active={blueMotionVisible}
                onclick={toggleBlueMotion}
                aria-label={blueMotionVisible
                  ? "Hide blue motion"
                  : "Show blue motion"}
                type="button"
                title={blueMotionVisible ? "Hide Blue" : "Show Blue"}
              >
                <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
                ></i>
              </button>
              <button
                class="visibility-toggle red-toggle"
                class:active={redMotionVisible}
                onclick={toggleRedMotion}
                aria-label={redMotionVisible
                  ? "Hide red motion"
                  : "Show red motion"}
                type="button"
                title={redMotionVisible ? "Hide Red" : "Show Red"}
              >
                <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"
                ></i>
              </button>
            </div>

            <!-- Speed Controls - Collapsible on Mobile -->
            <div class="control-section speed-section">
              <button
                class="section-header"
                onclick={togglePlaybackCollapsed}
                aria-expanded={!playbackCollapsed}
                type="button"
              >
                <h3 class="section-title">
                  <i class="fas fa-tachometer-alt section-icon"></i>
                  <span class="title-text">Playback</span>
                </h3>
                <i
                  class="fas fa-chevron-{playbackCollapsed
                    ? 'down'
                    : 'up'} collapse-icon mobile-only-icon"
                ></i>
              </button>
              {#if !playbackCollapsed}
                <div class="section-content">
                  <AnimationControls
                    {speed}
                    {onSpeedChange}
                    {onPlaybackStart}
                  />
                </div>
              {/if}
            </div>

            <!-- Trail Settings - Always Visible, Collapsible on Mobile -->
            <div class="control-section trail-section">
              <button
                class="section-header"
                onclick={toggleTrailCollapsed}
                aria-expanded={!trailCollapsed}
                type="button"
              >
                <h3 class="section-title">
                  <i class="fas fa-wave-square section-icon"></i>
                  <span class="title-text">Trail Effects</span>
                </h3>
                <i
                  class="fas fa-chevron-{trailCollapsed
                    ? 'down'
                    : 'up'} collapse-icon mobile-only-icon"
                ></i>
              </button>
              {#if !trailCollapsed}
                <div class="section-content">
                  <TrailSettings bind:settings={trailSettings} compact={true} />
                </div>
              {/if}
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
     CONTROLS SIDEBAR
     Mobile: scrollable, limited height
     =========================== */

  .controls-sidebar {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    width: 100%;
    /* Controls shrink and scroll on mobile */
    flex: 0 1 auto;
    max-height: 40%;
    gap: 6px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 2px;
    -webkit-overflow-scrolling: touch;
  }

  /* Custom scrollbar for controls sidebar */
  .controls-sidebar::-webkit-scrollbar {
    width: 6px;
  }

  .controls-sidebar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .controls-sidebar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .controls-sidebar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  /* ===========================
     CONTROL SECTIONS
     Modern card-based design
     =========================== */

  .control-section {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(8px, 1.6vw, 16px);
    padding: clamp(8px, 1.6vw, 18px);
    backdrop-filter: blur(12px);
    box-shadow:
      0 4px 16px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  /* ===========================
     VISIBILITY BAR - Minimal Space
     =========================== */

  .visibility-bar {
    display: flex;
    gap: clamp(4px, 0.8vw, 6px);
    flex-shrink: 0;
    width: 100%;
  }

  .visibility-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(8px, 1.6vw, 10px);
    background: rgba(0, 0, 0, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(6px, 1.2vw, 8px);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .visibility-toggle i {
    font-size: clamp(14px, 2.8vw, 16px);
  }

  @media (hover: hover) and (pointer: fine) {
    .visibility-toggle:hover {
      background: rgba(0, 0, 0, 0.35);
      border-color: rgba(255, 255, 255, 0.25);
      transform: scale(1.02);
    }
  }

  .visibility-toggle:active {
    transform: scale(0.98);
  }

  .visibility-toggle.active.blue-toggle {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.35) 0%,
      rgba(37, 99, 235, 0.35) 100%
    );
    border-color: rgba(59, 130, 246, 0.7);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
  }

  @media (hover: hover) and (pointer: fine) {
    .visibility-toggle.active.blue-toggle:hover {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.45) 0%,
        rgba(37, 99, 235, 0.45) 100%
      );
      border-color: rgba(59, 130, 246, 0.9);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
    }
  }

  .visibility-toggle.active.red-toggle {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.35) 0%,
      rgba(220, 38, 38, 0.35) 100%
    );
    border-color: rgba(239, 68, 68, 0.7);
    color: rgba(254, 202, 202, 1);
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
  }

  @media (hover: hover) and (pointer: fine) {
    .visibility-toggle.active.red-toggle:hover {
      background: linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.45) 0%,
        rgba(220, 38, 38, 0.45) 100%
      );
      border-color: rgba(239, 68, 68, 0.9);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .control-section:hover {
      border-color: rgba(255, 255, 255, 0.15);
      box-shadow:
        0 6px 24px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
  }

  /* Section Header - Collapsible Button */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: none;
    border: none;
    padding: 0;
    margin-bottom: clamp(8px, 2vw, 12px);
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: opacity 0.2s ease;
  }

  /* When section is expanded, show content normally */
  .speed-section:has(.section-content) .section-header,
  .trail-section:has(.section-content) .section-header {
    margin-bottom: clamp(8px, 2vw, 12px);
  }

  /* When section is collapsed, no bottom margin needed */
  .speed-section:not(:has(.section-content)) .section-header,
  .trail-section:not(:has(.section-content)) .section-header {
    margin-bottom: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    .section-header:hover {
      opacity: 0.8;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: clamp(4px, 1vw, 8px);
    margin: 0;
    font-size: clamp(9px, 1.8vw, 13px);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.85);
    text-transform: uppercase;
    letter-spacing: 0.8px;
  }

  /* Hide title text on mobile for visibility section */
  .desktop-title {
    margin-bottom: clamp(6px, 1.5vw, 14px);
  }

  .section-icon {
    font-size: clamp(10px, 2vw, 14px);
    opacity: 0.7;
  }

  .title-text {
    display: none;
  }

  .collapse-icon {
    font-size: clamp(10px, 2vw, 12px);
    color: rgba(255, 255, 255, 0.6);
    transition: transform 0.3s ease;
  }

  .mobile-only-icon {
    display: block;
  }

  .section-content {
    animation: slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ===========================
     DESKTOP LAYOUT - Side-by-side, NO SCROLLING
     Use container query units for precise sizing
     =========================== */

  @container animator-canvas (min-aspect-ratio: 5/4) {
    .content-wrapper {
      flex-direction: row;
      gap: 14px;
    }

    .canvas-area {
      flex: 1 1 auto;
      width: auto;
      height: 100%;
    }

    /* Desktop sidebar: fit in available space, NO overflow */
    .controls-sidebar {
      flex: 0 0 auto;
      width: min(280px, 25cqw);
      height: 100%;
      max-height: 100%;
      overflow-y: hidden;
      overflow-x: hidden;
      gap: 1.2cqh;
      padding: 0;
    }

    .title-text {
      display: inline;
    }

    .mobile-only-icon {
      display: none;
    }

    .section-header {
      cursor: default;
      pointer-events: none;
    }

    .control-section {
      padding: 1.5cqh 1.8cqw;
      flex-shrink: 1;
      min-height: 0;
    }

    .section-title {
      font-size: 1.8cqh;
      gap: 0.8cqw;
      margin-bottom: 1cqh;
    }

    .section-icon {
      font-size: 1.8cqh;
    }

    /* Visibility bar - minimal */
    .visibility-bar {
      gap: 0.8cqw;
      flex-shrink: 0;
    }

    .visibility-toggle {
      padding: 1.2cqh;
    }

    .visibility-toggle i {
      font-size: 2.2cqh;
    }
  }

  /* ===========================
     SECTION CONTENT - Desktop flex adjustments
     =========================== */

  @container animator-canvas (min-aspect-ratio: 5/4) {
    .section-content {
      flex-shrink: 1;
      min-height: 0;
    }

    /* Ensure sections can shrink proportionally */
    .speed-section {
      flex: 0 0 auto;
    }

    .trail-section {
      flex: 1 1 auto;
      min-height: 0;
      overflow: visible;
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
    .control-section,
    .motion-toggle,
    .section-header,
    .section-content,
    .collapse-icon {
      transition: none;
      animation: none;
    }

    .control-section:hover,
    .motion-toggle:hover,
    .motion-toggle:active {
      transform: none;
    }

    @keyframes slideDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .control-section {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.4);
    }

    .section-title {
      color: #ffffff;
    }

    .motion-toggle {
      border-width: 2px;
    }
  }

  /* ===========================
     MOBILE OPTIMIZATIONS
     =========================== */

  @media (max-width: 480px) {
    .canvas-container {
      padding: clamp(10px, 2vw, 16px);
    }

    .control-section {
      padding: 12px;
    }

    .motion-toggles {
      gap: 6px;
    }
  }

  /* Landscape mobile - compact layout */
  @media (max-height: 500px) and (orientation: landscape) {
    .control-section {
      padding: 10px 12px;
    }

    .section-title {
      margin-bottom: 8px;
      font-size: 10px;
    }
  }
</style>
