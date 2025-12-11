<!--
HandPathOrchestrator.svelte - Main orchestrator for hand path assembly

Complete user flow:
1. Welcome screen (empty state) - explains the mode and lets user start
2. Blue hand phase - tap positions on grid to build blue hand path
3. Red hand phase - tap positions to build red hand path (must match blue length)
4. Rotation selection - choose CW or CCW for shift motions
5. Complete - sequence is built, option to build another

Integrates all Assembly components and manages state transitions.
-->
<script lang="ts">
  import {
    GridLocation,
    GridMode,
  } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import {
    MotionColor,
    RotationDirection,
    MotionType,
    Orientation,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import { createPictographData } from "$lib/shared/pictograph/shared/domain/factories/createPictographData";
  import { getSettings } from "$lib/shared/application/state/app-state.svelte";
  import { createHandPathAssembleState, type HandPathAssembleState } from "../state/handpath-assemble-state.svelte";
  import AssemblyWelcome from "./AssemblyWelcome.svelte";
  import AssemblyPhaseHeader from "./AssemblyPhaseHeader.svelte";
  import AssemblyControls from "./AssemblyControls.svelte";
  import HandPathGrid from "./HandPathGrid.svelte";
  import RotationSelector from "./RotationSelector.svelte";
  import { fade } from "svelte/transition";

  const {
    initialGridMode = GridMode.DIAMOND,
    onSequenceComplete,
    onSequenceUpdate,
    onHeaderTextChange,
    onStartPositionSet,
  } = $props<{
    initialGridMode?: GridMode;
    onSequenceComplete?: (sequence: PictographData[]) => void;
    onSequenceUpdate?: (sequence: PictographData[]) => void;
    onHeaderTextChange?: (text: string) => void;
    onStartPositionSet?: (startPosition: PictographData) => void;
  }>();

  // Local state for welcome screen
  let hasStarted = $state(false);
  let localGridMode = $state<GridMode>(initialGridMode);

  // Create state manager (recreated when grid mode changes)
  // HandPathAssembleState is already reactive internally, but we need $state for reassignment detection
  let assemblyState: HandPathAssembleState = $state(createHandPathAssembleState({ gridMode: initialGridMode }));

  // Derived values for UI
  const showWelcome = $derived(!hasStarted);
  const currentPhase = $derived(assemblyState.currentPhase);
  const bluePathLength = $derived(assemblyState.blueHandPath.length);
  const redPathLength = $derived(assemblyState.redHandPath.length);

  // Can proceed to red hand? Need at least 2 positions
  const canProceedToRed = $derived(bluePathLength >= 2);

  // Can complete? Red path must match blue path length
  const canComplete = $derived(
    redPathLength >= 2 && redPathLength === bluePathLength
  );

  // Update header text when phase changes
  $effect(() => {
    if (!hasStarted) {
      onHeaderTextChange?.("Hand Path Builder");
      return;
    }

    let text = "";
    switch (currentPhase) {
      case "blue":
        text = `Blue Hand • ${bluePathLength} position${bluePathLength !== 1 ? "s" : ""}`;
        break;
      case "red":
        text = `Red Hand • ${redPathLength}/${bluePathLength}`;
        break;
      case "rotation-selection":
        text = "Select Rotation";
        break;
      case "complete":
        text = "Sequence Complete!";
        break;
    }
    onHeaderTextChange?.(text);
  });

  // Handle starting from welcome screen
  function handleStart() {
    hasStarted = true;
  }

  // Handle grid mode change (from welcome screen)
  function handleGridModeChange(mode: GridMode) {
    localGridMode = mode;
    assemblyState = createHandPathAssembleState({ gridMode: mode });
  }

  // Handle position selection on grid
  function handlePositionSelect(position: GridLocation) {
    try {
      // Check if this is the first position (start position)
      const isFirstPosition =
        assemblyState.blueHandPath.length === 0 && assemblyState.currentPhase === "blue";

      assemblyState.addPosition(position);

      // If this was the first position, create and send the start position pictograph
      if (isFirstPosition && onStartPositionSet) {
        const startPositionPictograph = createStartPositionPictograph(
          position,
          MotionColor.BLUE,
          assemblyState.gridMode
        );
        onStartPositionSet(startPositionPictograph);
      }

      // Update workspace with current progress
      const preview = assemblyState.getCurrentHandPreview();
      if (preview.length > 0) {
        onSequenceUpdate?.(preview);
      }
    } catch (error) {
      console.error("Error adding position:", error);
    }
  }

  // Create a static start position pictograph
  function createStartPositionPictograph(
    location: GridLocation,
    color: MotionColor,
    gridMode: GridMode
  ): PictographData {
    const motion = createMotionData({
      color,
      startLocation: location,
      endLocation: location,
      motionType: MotionType.STATIC,
      rotationDirection: RotationDirection.NO_ROTATION,
      gridMode,
      propType: PropType.HAND,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      turns: 0,
      arrowLocation: location,
      isVisible: true,
    });

    return createPictographData({
      motions: {
        [color]: motion,
      },
    });
  }

  // Handle undo
  function handleUndo() {
    assemblyState.undoLastPosition();

    // Update workspace
    const preview = assemblyState.getCurrentHandPreview();
    onSequenceUpdate?.(preview);
  }

  // Handle proceeding to red hand phase
  function handleNextHand() {
    try {
      assemblyState.completeBlueHand();
    } catch (error) {
      console.error("Error completing blue hand:", error);
    }
  }

  // Handle proceeding to rotation selection
  function handleProceedToRotation() {
    try {
      assemblyState.completeRedHand();
    } catch (error) {
      console.error("Error completing red hand:", error);
    }
  }

  // Handle rotation selection
  function handleRotationSelect(rotation: RotationDirection) {
    try {
      assemblyState.selectRotation(rotation);

      // Get user's preferred prop types from settings
      const settings = getSettings();
      const bluePropType = settings.bluePropType || settings.propType || PropType.STAFF;
      const redPropType = settings.redPropType || settings.propType || PropType.STAFF;

      // Get final merged sequence with user's prop types applied
      const finalSequence = assemblyState.getFinalSequence(bluePropType, redPropType);

      // Notify parent
      onSequenceComplete?.(finalSequence);
      onSequenceUpdate?.(finalSequence);
    } catch (error) {
      console.error("Error selecting rotation:", error);
    }
  }

  // Handle going back to previous phase
  function handleBack() {
    assemblyState.goBackPhase();

    // Update workspace preview
    const preview = assemblyState.getCurrentHandPreview();
    onSequenceUpdate?.(preview);
  }

  // Handle reset (build another)
  function handleReset() {
    assemblyState.reset();
    onSequenceUpdate?.([]);
  }

  // Full reset (back to welcome screen)
  function handleFullReset() {
    hasStarted = false;
    assemblyState.reset();
    onSequenceUpdate?.([]);
  }
</script>

<div class="handpath-orchestrator">
  {#if showWelcome}
    <!-- Welcome Screen -->
    <div class="welcome-phase" in:fade={{ duration: 300 }}>
      <AssemblyWelcome
        gridMode={localGridMode}
        onStart={handleStart}
        onGridModeChange={handleGridModeChange}
      />
    </div>
  {:else}
    <!-- Building Phases -->
    <div class="build-phases" in:fade={{ duration: 300 }}>
      <!-- Phase Header -->
      <AssemblyPhaseHeader
        phase={currentPhase}
        {bluePathLength}
        {redPathLength}
        onBack={currentPhase !== "blue" && currentPhase !== "complete"
          ? handleBack
          : undefined}
      />

      <!-- Phase Content -->
      <div class="phase-content">
        {#if currentPhase === "blue" || currentPhase === "red"}
          <!-- Grid Building Phase -->
          <div class="grid-phase">
            <div class="grid-container">
              <HandPathGrid
                gridMode={assemblyState.gridMode}
                currentPosition={assemblyState.currentPosition}
                onPositionSelect={handlePositionSelect}
              />
            </div>

            <!-- Visual path indicator -->
            <div class="path-indicator">
              {#if currentPhase === "blue"}
                <div class="path-dots blue">
                  {#each assemblyState.blueHandPath as pos, i}
                    <span class="path-dot" title={pos}>{i + 1}</span>
                  {/each}
                  {#if bluePathLength === 0}
                    <span class="path-placeholder">Tap a position to start</span>
                  {/if}
                </div>
              {:else}
                <div class="path-dots red">
                  {#each assemblyState.redHandPath as pos, i}
                    <span class="path-dot" title={pos}>{i + 1}</span>
                  {/each}
                  {#if redPathLength === 0}
                    <span class="path-placeholder">Tap a position to start</span>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {:else if currentPhase === "rotation-selection"}
          <!-- Rotation Selection Phase -->
          <div class="rotation-phase">
            <RotationSelector onSelect={handleRotationSelect} />
          </div>
        {:else if currentPhase === "complete"}
          <!-- Completion Phase -->
          <div class="complete-phase">
            <div class="complete-content">
              <div class="complete-icon">✓</div>
              <h2 class="complete-title">Sequence Complete!</h2>
              <p class="complete-text">
                Built a {bluePathLength - 1}-beat dual-prop sequence
              </p>
            </div>
          </div>
        {/if}
      </div>

      <!-- Controls -->
      {#if currentPhase !== "rotation-selection"}
        <AssemblyControls
          phase={currentPhase}
          {bluePathLength}
          {redPathLength}
          {canProceedToRed}
          {canComplete}
          onUndo={handleUndo}
          onNextHand={handleNextHand}
          onComplete={handleProceedToRotation}
          onReset={handleFullReset}
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .handpath-orchestrator {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      rgba(15, 23, 42, 0.95) 0%,
      rgba(30, 41, 59, 0.98) 100%
    );
  }

  .welcome-phase {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .build-phases {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .phase-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  /* Grid Building Phase */
  .grid-phase {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .grid-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    min-height: 0;
  }

  /* Path indicator */
  .path-indicator {
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .path-dots {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .path-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: white;
  }

  .path-dots.blue .path-dot {
    background: rgba(59, 130, 246, 0.8);
  }

  .path-dots.red .path-dot {
    background: rgba(239, 68, 68, 0.8);
  }

  .path-placeholder {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  /* Rotation Phase */
  .rotation-phase {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
    padding: 16px;
  }

  /* Complete Phase */
  .complete-phase {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .complete-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }

  .complete-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40px;
    color: white;
    box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
  }

  .complete-title {
    font-size: 28px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .complete-text {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
  }

  /* Mobile adjustments */
  @media (max-width: 480px) {
    .grid-container {
      padding: 12px;
    }

    .complete-icon {
      width: 64px;
      height: 64px;
      font-size: 32px;
    }

    .complete-title {
      font-size: 24px;
    }
  }
</style>
