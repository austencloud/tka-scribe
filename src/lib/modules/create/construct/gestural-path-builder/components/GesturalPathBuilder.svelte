<!--
GesturalPathBuilder.svelte - Main orchestrator for gestural path building

Coordinates state, services, and UI components for touch-based sequence construction.
Provides setup wizard, drawing interface, and conversion to MotionData.
-->
<script lang="ts">
  import { GridLocation, GridMode, HandMotionType, PropType, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import type { IHandPathDirectionDetector, IPathToMotionConverter } from "../services/contracts";
  import { createGesturalPathState, type GesturalPathState } from "../state";
  import PathControlPanel from "./PathControlPanel.svelte";
  import SequenceLengthPicker from "./SequenceLengthPicker.svelte";
  import TouchableGrid from "./TouchableGrid.svelte";

  // Props
  let {
    onSequenceComplete,
    onCancel,
  }: {
    onSequenceComplete?: (motions: { blue: any[]; red: any[] }) => void;
    onCancel?: () => void;
  } = $props();

  // Services
  let handPathDirectionDetector = $state<IHandPathDirectionDetector | null>(null);
  let pathToMotionConverter = $state<IPathToMotionConverter | null>(null);

  // State
  const pathState: GesturalPathState = createGesturalPathState();

  // Simple state - no wizard needed
  let sequenceLength = $state(16);
  let gridMode = $state<GridMode>(GridMode.DIAMOND);
  let isStarted = $state(false);

  // Initialize services
  onMount(() => {
    handPathDirectionDetector = resolve<IHandPathDirectionDetector>(TYPES.IHandPathDirectionDetector);
    pathToMotionConverter = resolve<IPathToMotionConverter>(TYPES.IPathToMotionConverter);
  });

  // Start or restart drawing
  function startDrawing(): void {
    // Default starting location based on grid mode
    const startLocation = gridMode === GridMode.DIAMOND ? GridLocation.NORTH : GridLocation.NORTHEAST;
    pathState.initializeSession(sequenceLength, gridMode, startLocation);
    isStarted = true;
  }

  // Handle segment complete
  function handleSegmentComplete(start: GridLocation, end: GridLocation): void {
    if (!handPathDirectionDetector || !pathState.config) return;

    const handMotionType = handPathDirectionDetector.getHandMotionType(
      start,
      end,
      pathState.config.gridMode
    );

    pathState.recordSegment(start, end, handMotionType);

    // Auto-complete hand if all beats drawn
    if (pathState.isCurrentHandComplete) {
      pathState.completeCurrentHand();
    }
  }

  // Handle advance button press
  function handleAdvancePressed(): void {
    pathState.pressAdvanceButton();
  }

  // Handle advance button release
  function handleAdvanceReleased(): void {
    pathState.releaseAdvanceButton();
  }

  // Handle hand complete
  function handleHandComplete(): void {
    pathState.completeCurrentHand();
  }

  // Handle restart - reset and go back to settings
  function handleRestart(): void {
    pathState.reset();
    isStarted = false;
  }

  // Handle finish
  function handleFinish(): void {
    if (!pathToMotionConverter || !pathState.selectedRotationDirection) {
      alert("Please select a rotation direction before finishing.");
      return;
    }

    const blueMotions = pathState.blueHandPath
      ? pathToMotionConverter.convertHandPathToMotions(
          pathState.blueHandPath,
          pathState.selectedRotationDirection,
          PropType.HAND
        )
      : [];

    const redMotions = pathState.redHandPath
      ? pathToMotionConverter.convertHandPathToMotions(
          pathState.redHandPath,
          pathState.selectedRotationDirection,
          PropType.HAND
        )
      : [];

    onSequenceComplete?.({ blue: blueMotions, red: redMotions });
  }
</script>

<div class="gestural-path-builder" data-testid="gestural-path-builder">
  {#if !isStarted}
    <!-- Initial setup view -->
    <div class="setup-container" in:fade={{ duration: 200 }}>
      <h2 class="title">Draw Hand Paths</h2>
      <p class="subtitle">Create sequences by drawing gestures on the grid</p>

      <SequenceLengthPicker bind:sequenceLength bind:gridMode />

      <button class="start-btn" onclick={startDrawing}>
        <i class="fas fa-play"></i>
        Start Drawing
      </button>

      {#if onCancel}
        <button class="cancel-btn" onclick={onCancel}>
          <i class="fas fa-times"></i>
          Cancel
        </button>
      {/if}
    </div>
  {:else}
    <!-- Drawing interface with inline settings -->
    <div class="drawing-container" in:fade={{ duration: 200 }}>
      <!-- Header with inline settings and restart -->
      <div class="drawing-header">
        <div class="header-row">
          <h2 class="title">Draw Hand Paths</h2>
          <button class="restart-btn" onclick={handleRestart} title="Change settings">
            <i class="fas fa-cog"></i>
          </button>
        </div>
        <SequenceLengthPicker bind:sequenceLength bind:gridMode />
      </div>

      <!-- Drawing workspace -->
      <div class="drawing-workspace">
        <TouchableGrid
          {pathState}
          gridMode={pathState.config?.gridMode || GridMode.DIAMOND}
          onSegmentComplete={handleSegmentComplete}
          onAdvancePressed={handleAdvancePressed}
          onAdvanceReleased={handleAdvanceReleased}
        />

        <PathControlPanel
          {pathState}
          onComplete={handleHandComplete}
          onReset={handleRestart}
        />
      </div>

      <!-- Finish button when complete -->
      {#if pathState.isSessionComplete}
        <div class="complete-actions" in:fade={{ duration: 200 }}>
          <button class="action-btn primary" onclick={handleFinish}>
            <i class="fas fa-check"></i>
            Finish & Import
          </button>
          <button class="action-btn secondary" onclick={() => pathState.backToBlueHand()}>
            <i class="fas fa-redo"></i>
            Redraw Blue Hand
          </button>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .gestural-path-builder {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: clamp(0.75rem, 2vh, 1.5rem);
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  .setup-container,
  .drawing-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 1000px;
    margin: auto;
  }

  .title {
    font-size: clamp(1.25rem, 4vw, 1.75rem);
    font-weight: 700;
    color: white;
    text-align: center;
    margin: 0;
    line-height: 1.2;
  }

  .subtitle {
    font-size: clamp(0.875rem, 2.5vw, 1rem);
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    margin: 0;
    line-height: 1.4;
  }

  .drawing-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .restart-btn {
    width: 44px;
    height: 44px;
    padding: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .restart-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .restart-btn i {
    font-size: 1.1rem;
  }

  .drawing-workspace {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  /* Tablet and up: Side-by-side layout when there's room */
  @media (min-width: 768px) {
    .drawing-workspace {
      grid-template-columns: 1fr minmax(300px, 380px);
      gap: 2rem;
    }
  }

  /* Large screens: More spacing */
  @media (min-width: 1024px) {
    .drawing-workspace {
      grid-template-columns: 1fr 400px;
      gap: 2.5rem;
    }
  }

  .start-btn {
    padding: 1rem;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
  }

  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .start-btn i {
    font-size: 1.1rem;
  }

  .complete-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
  }

  @media (min-width: 500px) {
    .complete-actions {
      flex-direction: row;
    }
  }

  .action-btn {
    flex: 1;
    padding: 0.875rem 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 48px;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    border: none;
  }

  .action-btn.primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .action-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.35);
    color: white;
    transform: translateY(-1px);
  }

  .cancel-btn {
    padding: 0.75rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 44px;
    font-size: 0.9rem;
  }

  .cancel-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: #ef4444;
    transform: translateY(-1px);
  }

  /* Small screens: Compact spacing */
  @media (max-width: 375px) {
    .gestural-path-builder {
      padding: 0.75rem;
    }

    .drawing-workspace {
      gap: 1rem;
    }
  }
</style>
