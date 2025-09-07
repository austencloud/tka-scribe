<script lang="ts">
  import { onMount } from "svelte";
  import SequenceDisplay from "../../sequence-display/components/SequenceDisplay.svelte";
  import { SequenceToolbar } from "../../sequence-toolkit/components";
  import { useWorkbenchServices } from "../services";
  import { createSequenceState, type SequenceState } from "../state/sequence-state.svelte";
  import { createBeatGridState } from "../../sequence-display";
  import { createWorkbenchState } from "../state/workbench-state.svelte";

  // Props
  let { sequenceState: externalSequenceState } = $props<{
    sequenceState?: SequenceState;
  }>();

  // Get services from DI container
  const services = useWorkbenchServices();

  // Use external sequence state if provided, otherwise create our own
  const sequenceState = externalSequenceState || createSequenceState({
    sequenceStateService: services.sequenceStateService,
  });
  const beatGridState = createBeatGridState(services.beatGridService);
  const workbenchState = createWorkbenchState(
    services.workbenchService,
    services.workbenchCoordinationService,
    sequenceState,
    beatGridState
  );

  const hasSelection = $derived(sequenceState.selectedBeatIndex !== null && sequenceState.selectedBeatIndex >= 0);

  onMount(() => {
    workbenchState.initialize();

    // Container element is available for future use if needed
  });

  function handleDeleteBeat() {
    const idx = sequenceState.selectedBeatIndex;
    if (idx !== null && idx >= 0) {
      // TODO: Replace with WorkbenchBeatOperationsService.removeBeat
      // For now, use the state service directly
      sequenceState.removeBeat(idx);
    }
  }

  function handleClearSequence() {
    sequenceState.clearSequence();
  }

  function handleBeatSelected(index: number) {
    workbenchState.handleBeatClick(index);
  }

  // Advanced button actions (to be wired to services later)
  function handleAddToDictionary() {
    console.log("Add to Dictionary - to be implemented");
  }

  function handleSpotlight() {
    console.log("Fullscreen - to be implemented");
  }

  function handleMirror() {
    console.log("Mirror sequence - to be implemented");
  }

  function handleSwapColors() {
    console.log("Swap colors - to be implemented");
  }

  function handleRotate() {
    console.log("Rotate sequence - to be implemented");
  }

  function handleCopyJson() {
    const seq = sequenceState.currentSequence;
    if (seq) {
      navigator.clipboard.writeText(JSON.stringify(seq, null, 2));
      console.log("Copied sequence JSON to clipboard");
    }
  }
</script>

<div class="build-workbench">
  <div class="main-layout">
    <div class="left-vbox">
      <SequenceDisplay {sequenceState} onBeatSelected={handleBeatSelected} />
    </div>
    <div class="workbench-button-panel">
      <SequenceToolbar
        {hasSelection}
        onDeleteBeat={handleDeleteBeat}
        onClearSequence={handleClearSequence}
        onAddToDictionary={handleAddToDictionary}
        onFullscreen={handleSpotlight}
        onMirror={handleMirror}
        onSwapColors={handleSwapColors}
        onRotate={handleRotate}
        onCopyJson={handleCopyJson}
      />
    </div>
  </div>
</div>

<style>
  .build-workbench {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    /* Transparent background to show beautiful app background */
    background: transparent;
  }

  .main-layout {
    display: grid;
    grid-template-columns: 1fr auto; /* left fills, right button panel auto width */
    gap: var(--spacing-xs); /* Add small gap between content and button panel */
    width: 100%;
    height: 100%;
  }

  .left-vbox {
    min-width: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    flex: 1;
  }

  .workbench-button-panel {
    display: flex;
  }
</style>
