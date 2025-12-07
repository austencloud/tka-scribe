<!--
HandPathOrchestrator.svelte - Main orchestrator for hand path assembly

Manages the three-phase flow:
1. Blue hand construction
2. Red hand construction
3. Rotation selection
4. Completion

Integrates HandPathGrid, HandDisplay, and RotationSelector.
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
import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData"
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";;
  import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import { createPictographData } from "$lib/shared/pictograph/shared/domain/factories/createPictographData";
  import { createHandPathAssembleState } from "../state/handpath-assemble-state.svelte";
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

  // Create state
  const state = createHandPathAssembleState({
    gridMode: initialGridMode,
    // PropType.HAND is always used in hand path assembly (enforced in converter)
  });

  // Reactive values
  let phaseHeaderText = $derived(
    state.currentPhase === "blue"
      ? "Build Blue Hand"
      : state.currentPhase === "red"
        ? "Build Red Hand"
        : state.currentPhase === "rotation-selection"
          ? "Select Rotation"
          : "Complete!"
  );

  // Update header text when phase changes
  $effect(() => {
    onHeaderTextChange?.(phaseHeaderText);
  });

  // Handle position selection
  function handlePositionSelect(position: GridLocation) {
    try {
      // Check if this is the first position (start position)
      const isFirstPosition =
        state.blueHandPath.length === 0 && state.currentPhase === "blue";

      state.addPosition(position);

      // If this was the first position, create and send the start position pictograph
      if (isFirstPosition && onStartPositionSet) {
        const startPositionPictograph = createStartPositionPictograph(
          position,
          MotionColor.BLUE,
          state.gridMode
        );
        onStartPositionSet(startPositionPictograph);
      }

      // Update workspace with current progress
      const preview = state.getCurrentHandPreview();
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

  // Handle rotation selection
  function handleRotationSelect(rotation: RotationDirection) {
    try {
      state.selectRotation(rotation);

      // Get final merged sequence
      const finalSequence = state.getFinalSequence();

      // Notify parent
      onSequenceComplete?.(finalSequence);
      onSequenceUpdate?.(finalSequence);
    } catch (error) {
      console.error("Error selecting rotation:", error);
      alert(
        error instanceof Error ? error.message : "Error selecting rotation"
      );
    }
  }
</script>

<div class="handpath-orchestrator">
  {#if state.currentPhase === "blue" || state.currentPhase === "red"}
    <!-- Building Phase (Blue or Red Hand) -->
    <div class="build-phase">
      <HandPathGrid
        gridMode={state.gridMode}
        currentPosition={state.currentPosition}
        onPositionSelect={handlePositionSelect}
      />
    </div>
  {:else if state.currentPhase === "rotation-selection"}
    <!-- Rotation Selection Phase -->
    <div class="rotation-phase">
      <RotationSelector onSelect={handleRotationSelect} />
    </div>
  {:else if state.currentPhase === "complete"}
    <!-- Completion Phase -->
    <div class="complete-phase">
      <h1>Sequence Complete!</h1>
      <p>Your dual-prop hand sequence has been created.</p>
    </div>
  {/if}

  <!-- Button Panel - Always at bottom -->
  <div
    class="button-panel-wrapper"
    in:fade={{ duration: 400, delay: 200 }}
    out:fade={{ duration: 300 }}
  ></div>
</div>

<style>
  .handpath-orchestrator {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  /* Button Panel Wrapper - Positioned at bottom like StandardWorkspaceLayout */
  .button-panel-wrapper {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }

  /* Build Phase Layout */
  .build-phase {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 20px;
    overflow: hidden;
  }

  /* Rotation Phase */
  .rotation-phase {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    padding: 20px;
    overflow-y: auto;
  }

  /* Complete Phase */
  .complete-phase {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 32px;
    padding: 40px;
    text-align: center;
    height: 100%;
  }

  .complete-phase h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
  }

  .complete-phase p {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
    margin: 0;
    line-height: 1.5;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .build-phase,
    .rotation-phase {
      padding: 16px;
    }

    .complete-phase {
      padding: 24px;
      gap: 24px;
    }

    .complete-phase h1 {
      font-size: 24px;
    }
  }
</style>
