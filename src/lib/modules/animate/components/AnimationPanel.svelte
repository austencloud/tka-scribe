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

  // Local state for view toggle and trail settings
  let showSettings = $state(false);
  let trailSettings = $state<TrailSettingsType>({ ...DEFAULT_TRAIL_SETTINGS });

  // Motion visibility state - reactive to visibility manager
  let blueMotionVisible = $state(visibilityManager.getMotionVisibility(MotionColor.BLUE));
  let redMotionVisible = $state(visibilityManager.getMotionVisibility(MotionColor.RED));

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

  function toggleSettingsView() {
    showSettings = !showSettings;
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
      title={showSettings ? "Trail Settings" : "Animation Viewer"}
      isMobile={!isSideBySideLayout}
      {onClose}
    >
      {#snippet actionButtons()}
        <button
          class="action-button settings-button"
          onclick={toggleSettingsView}
          aria-label={showSettings ? "Show animation" : "Show trail settings"}
          type="button"
        >
          <i class={showSettings ? "fas fa-play" : "fas fa-cog"}></i>
        </button>
      {/snippet}
    </PanelHeader>

    <h2 id="animation-panel-title" class="sr-only">Animation Viewer</h2>

    {#if loading}
      <div class="loading-message">Loading animation...</div>
    {:else if error}
      <div class="error-message">{error}</div>
    {:else if showSettings}
      <!-- Trail Settings View -->
      <div class="settings-container">
        <TrailSettings bind:settings={trailSettings} />
      </div>
    {:else}
      <!-- Animation Viewer with Adaptive Layout -->
      <div class="canvas-container">
        <div class="content-wrapper">
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

          <div class="controls-sidebar">
            <!-- Motion Visibility Controls -->
            <div class="motion-controls">
              <h3>Motion Visibility</h3>
              <div class="motion-toggles">
                <button
                  class="motion-toggle blue-toggle"
                  class:active={blueMotionVisible}
                  onclick={toggleBlueMotion}
                  aria-label={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
                  type="button"
                >
                  <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                  <span>Blue Motion</span>
                </button>
                <button
                  class="motion-toggle red-toggle"
                  class:active={redMotionVisible}
                  onclick={toggleRedMotion}
                  aria-label={redMotionVisible ? "Hide red motion" : "Show red motion"}
                  type="button"
                >
                  <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
                  <span>Red Motion</span>
                </button>
              </div>
            </div>

            <AnimationControls {speed} {onSpeedChange} {onPlaybackStart} />
          </div>
        </div>
      </div>
    {/if}
  </div>
</CreatePanelDrawer>

<style>
  .animation-panel {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Align to top for header */
    padding: 0; /* No padding - PanelHeader handles its own spacing */
    width: 100%;
    height: 100%;
    /* Background is on CreatePanelDrawer */
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
  }

  /* Content wrapper for canvas + controls - adaptive layout */
  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 20px;
    min-height: 0;
  }

  /* Canvas area wrapper */
  .canvas-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
    min-width: 0;
    flex: 1;
    container-type: size;
    container-name: canvas-zone;
  }

  /* Controls sidebar */
  .controls-sidebar {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  /* Row layout when aspect ratio is wide (width >= 125% of height) */
  @container animator-canvas (min-aspect-ratio: 5/4) {
    .content-wrapper {
      flex-direction: row;
      align-items: stretch;
      gap: clamp(20px, 3vw, 32px);
    }

    .canvas-area {
      flex: 1;
      width: auto;
      height: 100%;
      /* Canvas area takes full height of container */
    }

    .controls-sidebar {
      flex: 1;
      width: auto;
      height: 100%;
      align-self: stretch;
      /* Stretch to full height */
      justify-content: center;
    }
  }

  /* Optimize for very wide aspect ratios - even more horizontal space */
  @container animator-canvas (min-aspect-ratio: 16/9) {
    .content-wrapper {
      gap: clamp(24px, 4vw, 48px);
    }
  }

  .loading-message,
  .error-message {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .error-message {
    color: rgba(255, 100, 100, 0.9);
  }

  /* Settings Container */
  .settings-container {
    container-type: size;
    container-name: settings-view;
    flex: 1;
    width: 100%;
    max-width: 100%;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 0;
  }

  /* Settings button - green gradient to indicate secondary action */
  :global(.panel-header .settings-button) {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.9),
      rgba(22, 163, 74, 0.9)
    );
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow:
      0 2px 8px rgba(34, 197, 94, 0.35),
      0 6px 18px rgba(22, 163, 74, 0.25);
  }

  :global(.panel-header .settings-button:hover) {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 1),
      rgba(22, 163, 74, 1)
    );
    box-shadow:
      0 4px 12px rgba(34, 197, 94, 0.45),
      0 8px 22px rgba(22, 163, 74, 0.35);
  }

  /* Motion Visibility Controls */
  .motion-controls {
    width: 100%;
    margin-bottom: 20px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .motion-controls h3 {
    margin: 0 0 12px 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    text-align: center;
  }

  .motion-toggles {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .motion-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .motion-toggle:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .motion-toggle.active.blue-toggle {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
    border-color: rgba(59, 130, 246, 0.6);
    color: rgba(147, 197, 253, 1);
  }

  .motion-toggle.active.blue-toggle:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(37, 99, 235, 0.4));
    border-color: rgba(59, 130, 246, 0.8);
  }

  .motion-toggle.active.red-toggle {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(220, 38, 38, 0.3));
    border-color: rgba(239, 68, 68, 0.6);
    color: rgba(252, 165, 165, 1);
  }

  .motion-toggle.active.red-toggle:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.4), rgba(220, 38, 38, 0.4));
    border-color: rgba(239, 68, 68, 0.8);
  }

  .motion-toggle i {
    font-size: 1rem;
  }

  /* Landscape mobile: Adjust spacing */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    /* Tighter controls in landscape mode */
    .controls-sidebar {
      min-width: clamp(140px, 12vw, 180px);
      max-width: clamp(180px, 16vw, 220px);
    }
  }
</style>
