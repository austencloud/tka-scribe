<!--
  PracticeViewContainer.svelte - Layout manager for Practice tab visualization

  Manages responsive layouts for three display views:
  - camera-canvas: Camera + AnimatorCanvas (side-by-side)
  - camera-grid: Camera + BeatGrid (side-by-side)
  - camera-canvas-grid: Camera + AnimatorCanvas + BeatGrid (all three)
-->
<script lang="ts">
  import type { DisplayView } from "../../state/train-practice-state.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { DetectionFrame } from "../../domain/models/DetectionFrame";
  import type { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { TrainMode } from "../../domain/enums/TrainEnums";
  import CameraSection from "./CameraSection.svelte";
  import GridSection from "./GridSection.svelte";
  import CanvasSection from "./CanvasSection.svelte";

  interface Props {
    displayView: DisplayView;
    sequence: SequenceData | null;
    currentBeatIndex?: number;
    isPlaying?: boolean;
    bpm?: number;
    // Camera props
    isCameraReady?: boolean;
    isDetectionReady?: boolean;
    isDetectionActive?: boolean;
    isPerforming?: boolean;
    currentFrame?: DetectionFrame | null;
    expectedPositions?: {
      blue: GridLocation | null;
      red: GridLocation | null;
    } | null;
    mode?: TrainMode;
    countdownValue?: number | null;
    currentScore?: number;
    currentCombo?: number;
    lastHitResult?: boolean | null;
    lastHitPoints?: number;
    // Callbacks
    onCameraReady?: () => void;
    onCameraError?: (error: string) => void;
    onFrame?: (video: HTMLVideoElement) => void;
    onBeatSelect?: (beatIndex: number) => void;
    onBrowseSequences?: () => void;
  }

  let {
    displayView,
    sequence = null,
    currentBeatIndex = 0,
    isPlaying = false,
    bpm = 60,
    isCameraReady = false,
    isDetectionReady = false,
    isDetectionActive = false,
    isPerforming = false,
    currentFrame = null,
    expectedPositions = null,
    mode = TrainMode.SETUP,
    countdownValue = null,
    currentScore = 0,
    currentCombo = 0,
    lastHitResult = null,
    lastHitPoints = 0,
    onCameraReady,
    onCameraError,
    onFrame,
    onBeatSelect,
    onBrowseSequences,
  }: Props = $props();

  // Determine which panels to show
  const showCanvas = $derived(
    displayView === "camera-canvas" || displayView === "camera-canvas-grid"
  );
  const showGrid = $derived(
    displayView === "camera-grid" || displayView === "camera-canvas-grid"
  );
  const isTripleView = $derived(displayView === "camera-canvas-grid");
</script>

<div
  class="view-container"
  class:view-camera-canvas={displayView === "camera-canvas"}
  class:view-camera-grid={displayView === "camera-grid"}
  class:view-camera-canvas-grid={displayView === "camera-canvas-grid"}
>
  <!-- Camera is always shown -->
  <div class="panel camera-panel">
    <CameraSection
      {isCameraReady}
      {isDetectionReady}
      {isDetectionActive}
      {isPerforming}
      {currentFrame}
      {expectedPositions}
      {mode}
      {countdownValue}
      {currentScore}
      {currentCombo}
      {lastHitResult}
      {lastHitPoints}
      {bpm}
      {onCameraReady}
      {onCameraError}
      {onFrame}
    />
  </div>

  <!-- Canvas panel (Views A and C) -->
  {#if showCanvas}
    <div class="panel canvas-panel">
      <CanvasSection
        {sequence}
        {currentBeatIndex}
        {isPlaying}
        {isPerforming}
        {bpm}
        {onBrowseSequences}
      />
    </div>
  {/if}

  <!-- Grid panel (Views B and C) -->
  {#if showGrid}
    <div class="panel grid-panel">
      <GridSection
        {sequence}
        {currentBeatIndex}
        {onBeatSelect}
        {onBrowseSequences}
      />
    </div>
  {/if}
</div>

<style>
  .view-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    background: transparent;
    overflow: hidden;
  }

  .panel {
    min-height: 0;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Camera panel always takes priority space */
  .camera-panel {
    flex: 1 1 auto;
  }

  .canvas-panel,
  .grid-panel {
    flex: 1 1 auto;
  }

  /* ============================================
	   MOBILE LAYOUTS (stacked vertically, max-width: 767px)
	   ============================================ */
  @media (max-width: 767px) {
    /* View A: Camera + Canvas - equal space for both squares */
    .view-camera-canvas .camera-panel {
      flex: 1 1 0;
    }

    .view-camera-canvas .canvas-panel {
      flex: 1 1 0;
      width: 100%;
    }

    /* View B: Camera + Grid - similar distribution */
    .view-camera-grid .camera-panel {
      flex: 1 1 60%;
    }

    .view-camera-grid .grid-panel {
      flex: 0 0 auto;
      width: 100%;
    }

    /* View C: Three panels stacked - canvas gets 60%, grid gets 40% of remaining space */
    .view-camera-canvas-grid .canvas-panel {
      flex: 3 1 auto;
      max-height: 36%;
    }

    .view-camera-canvas-grid .grid-panel {
      flex: 2 1 auto;
      max-height: 24%;
    }
  }



  /* ============================================
	   DESKTOP LAYOUTS (side-by-side when nav visible)
	   ============================================ */

  @media (min-width: 1024px) {
    .view-container {
      flex-direction: row;
      align-items: stretch;
      gap: 1rem;
      padding: 1rem;
    }

    /* View A: Camera + Canvas (50/50) - reset mobile constraints */
    .view-camera-canvas .camera-panel {
      flex: 1 1 50%;
      max-width: 50%;
      max-height: none;
      height: 100%;
    }

    .view-camera-canvas .canvas-panel {
      flex: 1 1 50%;
      max-width: 50%;
      max-height: none;
      height: 100%;
    }

    /* View B: Camera + Grid (50/50) */
    .view-camera-grid .camera-panel {
      flex: 1 1 50%;
      max-width: 50%;
      max-height: none;
      height: 100%;
    }

    .view-camera-grid .grid-panel {
      flex: 1 1 50%;
      max-width: 50%;
      max-height: none;
      height: 100%;
    }

    /* View C: Camera left (50%), Canvas+Grid stacked right (50%) */
    .view-camera-canvas-grid {
      flex-wrap: wrap;
    }

    .view-camera-canvas-grid .camera-panel {
      flex: 1 1 50%;
      max-width: 50%;
      height: 100%;
    }

    .view-camera-canvas-grid .canvas-panel,
    .view-camera-canvas-grid .grid-panel {
      flex: 1 1 calc(50% - 0.5rem);
      max-width: calc(50% - 0.5rem);
      max-height: calc(50% - 0.25rem);
    }

    /* Make the right side a nested grid: canvas 60%, grid 40% */
    .view-camera-canvas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 3fr 2fr;
      gap: 0.5rem;
    }

    .view-camera-canvas-grid .camera-panel {
      grid-row: 1 / -1;
      max-width: 100%;
    }

    .view-camera-canvas-grid .canvas-panel {
      grid-column: 2;
      grid-row: 1;
      max-width: 100%;
      max-height: 100%;
    }

    .view-camera-canvas-grid .grid-panel {
      grid-column: 2;
      grid-row: 2;
      max-width: 100%;
      max-height: 100%;
    }
  }

  /* Tablet intermediate layout */
  @media (min-width: 768px) and (max-width: 1023px) {
    .view-container {
      gap: 0.75rem;
      padding: 0.75rem;
    }

    /* Two-panel views can go side-by-side on tablet */
    .view-camera-canvas,
    .view-camera-grid {
      flex-direction: row;
    }

    .view-camera-canvas .camera-panel,
    .view-camera-canvas .canvas-panel {
      flex: 1 1 50%;
      max-width: 50%;
      max-height: none;
      height: 100%;
    }

    .view-camera-grid .camera-panel,
    .view-camera-grid .grid-panel {
      flex: 1 1 50%;
      max-width: 50%;
      max-height: none;
      height: 100%;
    }

    /* Three-panel stays stacked on tablet */
    .view-camera-canvas-grid {
      flex-direction: column;
    }
  }
</style>
