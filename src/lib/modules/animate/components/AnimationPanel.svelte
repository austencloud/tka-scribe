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
  import { CreatePanelDrawer } from "$lib/modules/create/shared/components";
  import PanelHeader from "$lib/modules/create/shared/components/PanelHeader.svelte";
  import { GridMode, type Letter, type BeatData } from "$shared";
  import type { PropState } from "../domain/types/PropState";

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
          <div class="canvas-area">
            <AnimatorCanvas
              {blueProp}
              {redProp}
              {gridVisible}
              {gridMode}
              {letter}
              {beatData}
              {onCanvasReady}
            />
          </div>

          <div class="controls-sidebar">
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

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .animation-panel {
    }
  }

  @media (max-width: 480px) {
    .animation-panel {
    }
  }

  /* Landscape mobile: Adjust spacing */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .animation-panel {
    }

    /* Tighter controls in landscape mode */
    .controls-sidebar {
      min-width: clamp(140px, 12vw, 180px);
      max-width: clamp(180px, 16vw, 220px);
    }
  }
</style>
