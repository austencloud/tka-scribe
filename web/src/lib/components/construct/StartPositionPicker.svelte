<!-- StartPositionPicker.svelte - Clean component following TKA architecture -->
<script lang="ts">
  import type { PictographData } from "$domain/PictographData";
  import { resolve } from "$services/bootstrap";
  import type { IStartPositionService } from "$services/interfaces/application-interfaces";
  import type { IStartPositionSelectionService } from "$lib/services/interfaces/IStartPositionSelectionService";
  import { onMount } from "svelte";

  // State management
  import { createStartPositionStateService } from "$lib/state/StartPositionState.svelte";

  // UI Components
  import LoadingState from "./start-position/ui/LoadingState.svelte";
  import ErrorState from "./start-position/ui/ErrorState.svelte";
  import PictographGrid from "./start-position/ui/PictographGrid.svelte";
  import TransitionOverlay from "./start-position/ui/TransitionOverlay.svelte";

  // Props using runes
  const { gridMode = GridMode.DIAMOND } = $props<{
    gridMode?: GridMode;
  }>();

  // Services
  let startPositionService = $state<IStartPositionService | null>(null);
  let selectionService = $state<IStartPositionSelectionService | null>(null);

  // State management service
  let stateService = $state<ReturnType<
    typeof createStartPositionStateService
  > | null>(null);

  // Initialize services and state
  $effect(() => {
    try {
      console.log("StartPositionPicker: Attempting to resolve services...");

      // Resolve services
      if (!startPositionService) {
        try {
          startPositionService = resolve("IStartPositionService");
          console.log("StartPositionPicker: ✅ IStartPositionService resolved");
        } catch (error) {
          console.log(
            "StartPositionPicker: ❌ Failed to resolve IStartPositionService:",
            error
          );
          return; // Container not ready yet
        }
      }

      if (!selectionService) {
        try {
          selectionService = resolve("IStartPositionSelectionService");
          console.log(
            "StartPositionPicker: ✅ IStartPositionSelectionService resolved"
          );
        } catch (error) {
          console.log(
            "StartPositionPicker: ❌ Failed to resolve IStartPositionSelectionService:",
            error
          );
          return; // Container not ready yet
        }
      }

      // Initialize state service once we have the required service
      if (startPositionService && !stateService) {
        console.log("StartPositionPicker: Creating state service...");
        stateService = createStartPositionStateService(startPositionService);
        console.log("StartPositionPicker: ✅ State service created");
      }
    } catch (error) {
      console.error("StartPositionPicker: Failed to resolve services:", error);
    }
  });

  // Load start positions using state service
  async function loadStartPositions() {
    console.log(
      "StartPositionPicker: loadStartPositions called, stateService:",
      !!stateService
    );
    if (stateService) {
      console.log(
        "StartPositionPicker: Calling stateService.loadStartPositions with gridMode:",
        gridMode
      );
      await stateService.loadStartPositions(gridMode);
      console.log("StartPositionPicker: loadStartPositions completed");
    } else {
      console.log("StartPositionPicker: stateService not available yet");
    }
  }

  // Handle start position selection using service
  async function handleSelect(startPosPictograph: PictographData) {
    if (!selectionService || !startPositionService || !stateService) {
      console.error("Services not available for start position selection");
      return;
    }

    try {
      // Set transition state
      stateService.setTransitioning(true);
      stateService.setSelectedStartPos(startPosPictograph);

      // Use selection service to handle the complex business logic
      await selectionService.selectStartPosition(
        startPosPictograph,
        startPositionService
      );

      // Clear transition state after a short delay
      setTimeout(() => {
        stateService?.setTransitioning(false);
      }, 200);
    } catch (error) {
      console.error(
        "StartPositionPicker: Error selecting start position:",
        error
      );
      stateService.setTransitioning(false);

      // Show user-friendly error
      alert(
        `Failed to select start position: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Initialize on mount
  onMount(() => {
    console.log("StartPositionPicker: onMount called");
    loadStartPositions();
  });

  // Reload when grid mode changes
  $effect(() => {
    if (gridMode) {
      loadStartPositions();
    }
  });

  // Listen for sequence state changes to clear transition state
  import { sequenceStateService } from "$lib/services/SequenceStateService.svelte";
  import { GridMode } from "$lib/domain";

  $effect(() => {
    const currentSequence = sequenceStateService.currentSequence;

    // If a sequence with startPosition exists and we're transitioning, clear the transition
    if (
      currentSequence &&
      currentSequence.startPosition &&
      stateService?.isTransitioning
    ) {
      stateService.setTransitioning(false);
    }
  });
</script>

<div class="start-pos-picker" data-testid="start-position-picker">
  {#if !stateService}
    <LoadingState />
  {:else if stateService.isLoading}
    <LoadingState />
  {:else if stateService.loadingError}
    <ErrorState />
  {:else if stateService.startPositionPictographs.length === 0}
    <ErrorState
      message="No valid start positions found for the current configuration."
      hasRefreshButton={false}
    />
  {:else}
    <PictographGrid
      pictographs={stateService.startPositionPictographs}
      selectedPictograph={stateService.selectedStartPos}
      onPictographSelect={handleSelect}
    />
  {/if}

  <!-- Debug info -->
  {#if stateService}
    <div
      style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.8); color: white; padding: 5px; font-size: 10px;"
    >
      Debug: isLoading={stateService.isLoading}, pictographs={stateService
        .startPositionPictographs.length}, error={stateService.loadingError}
    </div>
  {/if}

  <!-- Loading overlay during transition -->
  {#if stateService?.isTransitioning}
    <TransitionOverlay />
  {/if}
</div>

<style>
  .start-pos-picker {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding: var(--spacing-lg);
    background: transparent;
    position: relative;
  }
</style>
