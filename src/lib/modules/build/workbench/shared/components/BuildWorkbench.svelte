<script lang="ts">
  import { navigationState } from "$shared";
  import { type SequenceState } from "../../../shared/state";
  import SequenceDisplay from "../../sequence-display/components/SequenceDisplay.svelte";


  // Props
  let {
    sequenceState: externalSequenceState,
    onClearSequence,
    buildTabState,
    practiceBeatIndex = null,
    animationStateRef = null,
    isSideBySideLayout = false
  } = $props<{
    sequenceState?: SequenceState;
    onClearSequence?: () => Promise<void>;
    buildTabState?: any; // TODO: Type this properly
    practiceBeatIndex?: number | null;
    animationStateRef?: any | null; // Animation state for Animate tab
    isSideBySideLayout?: boolean;
  }>();

  // Use external sequence state directly
  const sequenceState = externalSequenceState;

  // Beat selection state
  let selectedBeatIndex = $state<number | null>(null);

  // Note: Button-related reactive values moved to ButtonPanel component

  // Get current word from sequence state
  const currentWord = $derived(() => {
    return sequenceState?.sequenceWord() ?? "";
  });

  // Note: Clear sequence functionality moved to ButtonPanel component

  function handleBeatSelected(index: number) {
    if (!sequenceState) return;

    // Check if we're in Animate tab
    const isAnimateTab = buildTabState?.activeSubTab === "animate";

    if (isAnimateTab && animationStateRef) {
      // In Animate tab: Jump to this beat in the animation
      animationStateRef.jumpToBeat(index);
      // Still update local selection for visual feedback
      selectedBeatIndex = index;
      sequenceState.selectBeat(index);
    } else {
      // In other tabs: Switch to edit tab (existing behavior)
      selectedBeatIndex = index;
      sequenceState.selectBeat(index);

      // Automatically switch to edit tab when a beat is selected
      if (buildTabState && buildTabState.setActiveRightPanel) {
        buildTabState.setActiveRightPanel("edit");
      }

      // Also directly update navigation state to ensure visual tab switching
      if (navigationState && navigationState.setCurrentSubMode) {
        navigationState.setCurrentSubMode("edit");
      }
    }
  }

  function handleStartPositionSelected() {
    if (!sequenceState) return;

    // Only proceed if there's actually a start position selected
    if (!sequenceState.hasStartPosition || !sequenceState.selectedStartPosition) {
      return;
    }

    // Select start position for editing (this will clear beat selection and set start position as selected)
    selectedBeatIndex = null;
    sequenceState.selectStartPositionForEditing();

    // Automatically switch to edit tab when start position is selected
    if (buildTabState && buildTabState.setActiveRightPanel) {
      buildTabState.setActiveRightPanel("edit");
    }

    // Also directly update navigation state to ensure visual tab switching
    if (navigationState && navigationState.setCurrentSubMode) {
      navigationState.setCurrentSubMode("edit");
    }
  }

  // Note: Save functionality moved to ButtonPanel component


</script>

{#if sequenceState}
<div class="build-workbench">
  <div class="main-layout">
    <div class="sequence-display-container">
      <SequenceDisplay {sequenceState} currentWord={currentWord()} onBeatSelected={handleBeatSelected} onStartPositionSelected={handleStartPositionSelected} {selectedBeatIndex} {isSideBySideLayout} />

      <!-- Remove action buttons from sequence-display-container -->
    </div>
  </div>

  <!-- Action buttons now handled by ButtonPanel in BuildTab -->
</div>
{:else}
<div class="build-workbench loading">
  <div class="loading-message">Initializing workbench...</div>
</div>
{/if}

<style>
  .build-workbench {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: transparent;
  }

  .main-layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .sequence-display-container {
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    /* No padding - word label inside will naturally create spacing */
  }



  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    /* Corner buttons handle their own mobile positioning */
  }

  /* Ultra-narrow mobile optimization */
  @media (max-width: 480px) {
    .main-layout {
      gap: 2px;
    }
  }
</style>
