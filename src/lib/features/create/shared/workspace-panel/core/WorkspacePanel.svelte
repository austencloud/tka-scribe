<!--
	WorkspacePanel.svelte

	Workspace panel containing the sequence display and action buttons.
	Main area for viewing and interacting with the sequence.
-->
<script lang="ts">
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { openSpotlightWithBeatGrid } from "$lib/shared/application/state/ui/ui-state.svelte";
  import { onMount } from "svelte";
  import Toast from "../components/Toast.svelte";
  import SequenceDisplay from "../sequence-display/components/SequenceDisplay.svelte";
  import HandPathWorkspace from "../hand-path/HandPathWorkspace.svelte";
  import type { IBeatOperationsService } from "../../services/contracts/IBeatOperationsService";

  // Services
  let beatOperationsService: IBeatOperationsService | null = null;

  // Props
  let {
    sequenceState,
    createModuleState,
    practiceBeatIndex = null,
    animatingBeatNumber = null,
    shouldOrbitAroundCenter = false,

    // Animation state ref (for animate tab)
    animationStateRef = null,

    // Layout mode
    isSideBySideLayout = false,

    // Current word display
    currentDisplayWord = "",
  }: {
    sequenceState?: any; // TODO: Type this properly
    createModuleState?: any; // TODO: Type this properly
    practiceBeatIndex?: number | null;
    animatingBeatNumber?: number | null;
    shouldOrbitAroundCenter?: boolean;

    // Animation state ref
    animationStateRef?: any | null;

    // Layout mode
    isSideBySideLayout?: boolean;

    // Current word display
    currentDisplayWord?: string;
  } = $props();

  // Local beat selection state (beatNumber: 0=start, 1=first beat, etc.)
  let localSelectedBeatNumber = $state<number | null>(null);

  // Effect: Update local selection when animation is playing
  $effect(() => {
    if (animatingBeatNumber !== null) {
      localSelectedBeatNumber = animatingBeatNumber;
    }
  });

  // Effect: Sync local selection with sequenceState selection
  // This ensures UI updates when selection is cleared via edit panel close
  $effect(() => {
    if (!sequenceState) return;

    const globalSelection = sequenceState.selectedBeatNumber;
    // Only sync if animation isn't playing (animation takes precedence)
    if (animatingBeatNumber === null) {
      localSelectedBeatNumber = globalSelection;
    }
  });

  // Toast message for validation errors
  let toastMessage = $state<string | null>(null);

  // Handle beat selection (receives beatNumber: 1, 2, 3...)
  function handleBeatSelected(beatNumber: number) {
    if (!sequenceState) return;

    // Note: Animate is no longer a Create tab, it's a separate panel
    // This check may need to be updated to check panel state instead
    const isAnimateTabActive = false; // TODO: Update this to check animate panel state

    if (isAnimateTabActive && animationStateRef) {
      // In Animate tab: Jump to this beat in the animation (needs array index)
      const arrayIndex = beatNumber - 1;
      animationStateRef.jumpToBeat(arrayIndex);
      // Still update local selection for visual feedback (using beatNumber)
      localSelectedBeatNumber = beatNumber;
      sequenceState.selectBeat(beatNumber);
    } else {
      // In other tabs: Just select the beat - the edit panel will open automatically
      localSelectedBeatNumber = beatNumber;
      sequenceState.selectBeat(beatNumber);

      // Note: We no longer switch to edit tab! The edit slide panel will open instead.
      // This is handled by an effect in CreateModule.svelte that watches for beat selection.
    }
  }

  // Handle start position selection (beatNumber 0)
  function handleStartPositionSelected() {
    if (!sequenceState) return;

    // Only proceed if there's actually a start position selected
    if (
      !sequenceState.hasStartPosition ||
      !sequenceState.selectedStartPosition
    ) {
      return;
    }

    // Select start position for editing (beatNumber 0)
    localSelectedBeatNumber = 0;
    sequenceState.selectStartPositionForEditing();

    // Note: We no longer switch to edit tab! The edit slide panel will open instead.
    // This is handled by an effect in CreateModule.svelte that watches for start position selection.
  }

  // Handle beat deletion via keyboard
  function handleBeatDelete(beatNumber: number) {
    if (!beatOperationsService || !createModuleState) {
      console.warn("Cannot delete beat - services not initialized");
      return;
    }

    // Convert beatNumber (1, 2, 3...) to beatIndex (0, 1, 2...)
    const beatIndex = beatNumber - 1;

    try {
      beatOperationsService.removeBeat(beatIndex, createModuleState);
    } catch (err) {
      console.error("Failed to remove beat", err);
      toastMessage = "Failed to remove beat";
      setTimeout(() => (toastMessage = null), 3000);
    }
  }

  // Handle long-press on beat to open fullscreen preview
  function handleBeatLongPress() {
    if (!sequenceState?.currentSequence) return;
    openSpotlightWithBeatGrid(sequenceState.currentSequence);
  }

  // Initialize services on mount
  onMount(() => {
    beatOperationsService = resolve<IBeatOperationsService>(
      TYPES.IBeatOperationsService
    );
  });
</script>

{#if sequenceState}
  {#if navigationState.activeTab === "gestural" && createModuleState?.handPathCoordinator?.isStarted}
    <!-- Hand Path Builder Workspace - only visible when started -->
    <div class="workspace-panel" data-testid="workspace-panel">
      <div class="hand-path-workspace-container">
        <HandPathWorkspace
          pathState={createModuleState.handPathCoordinator.pathState}
          isStarted={createModuleState.handPathCoordinator.isStarted}
          onSegmentComplete={createModuleState.handPathCoordinator
            .handleSegmentComplete}
          onAdvancePressed={createModuleState.handPathCoordinator
            .handleAdvancePressed}
          onAdvanceReleased={createModuleState.handPathCoordinator
            .handleAdvanceReleased}
        />
      </div>
    </div>
  {:else if navigationState.activeTab !== "gestural"}
    <!-- Standard Sequence Display (not in gestural mode) -->
    <div class="workspace-panel" data-testid="workspace-panel">
      <!-- Sequence Display -->
      <div class="sequence-display-container">
        <SequenceDisplay
          {sequenceState}
          onBeatSelected={handleBeatSelected}
          onStartPositionSelected={handleStartPositionSelected}
          onBeatDelete={handleBeatDelete}
          onBeatLongPress={handleBeatLongPress}
          selectedBeatNumber={localSelectedBeatNumber}
          practiceBeatNumber={practiceBeatIndex}
          {isSideBySideLayout}
          {shouldOrbitAroundCenter}
          activeMode={createModuleState?.activeSection ?? null}
          {currentDisplayWord}
        />
      </div>

      <!-- Toast for validation errors -->
      <Toast
        message={toastMessage ?? ""}
        onDismiss={() => (toastMessage = null)}
      />
    </div>
  {/if}
{:else}
  <div class="workspace-panel loading" data-testid="workspace-panel">
    <div class="loading-message">Initializing workspace...</div>
  </div>
{/if}

<style>
  .workspace-panel {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column; /* Always stack sequence display above buttons */
    /* Transparent background to show beautiful background without blur */
    background: transparent;
    border: none;
    border-radius: var(--border-radius);
    overflow: hidden;
    border-radius: 12px;
  }

  .sequence-display-container,
  .hand-path-workspace-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
  }

  .workspace-panel.loading {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading-message {
    color: #666;
    font-size: 14px;
  }
</style>
