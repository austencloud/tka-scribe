<script lang="ts">
  /**
   * Sequence Actions Coordinator Component
   *
   * Manages sequence transformation actions (mirror, rotate, color swap, copy JSON).
   * Extracts sequence actions logic from CreateModule.svelte for better separation of concerns.
   *
   * Domain: Create module - Sequence Transformation Coordination
   */

  import { createComponentLogger } from "$shared";
  import SequenceActionsSheet from "../../../workspace-panel/shared/components/SequenceActionsSheet.svelte";
  import type { PanelCoordinationState } from "../../state/panel-coordination-state.svelte";
  import type { createCreateModuleState as CreateModuleStateType } from "../../state/create-module-state.svelte";

  type CreateModuleState = ReturnType<typeof CreateModuleStateType>;

  const logger = createComponentLogger('SequenceActionsCoordinator');

  // Props
  let {
    CreateModuleState,
    panelState,
    show = $bindable()
  }: {
    CreateModuleState: CreateModuleState;
    panelState: PanelCoordinationState;
    show: boolean;
  } = $props();

  // Event handlers
  function handleClose() {
    show = false;
  }

  function handleMirror() {
    // TODO: Implement mirror transformation
    logger.log("Mirror action triggered");
  }

  function handleRotate() {
    // TODO: Implement rotation transformation
    logger.log("Rotate action triggered");
  }

  function handleColorSwap() {
    // TODO: Implement color swap transformation
    logger.log("Color swap action triggered");
  }

  function handleCopyJSON() {
    if (!CreateModuleState.sequenceState.currentSequence) return;
    navigator.clipboard.writeText(
      JSON.stringify(CreateModuleState.sequenceState.currentSequence, null, 2)
    );
    logger.log("Sequence JSON copied to clipboard");
  }
</script>

<SequenceActionsSheet
  {show}
  hasSequence={CreateModuleState.hasSequence}
  combinedPanelHeight={panelState.combinedPanelHeight}
  onMirror={handleMirror}
  onRotate={handleRotate}
  onColorSwap={handleColorSwap}
  onCopyJSON={handleCopyJSON}
  onClose={handleClose}
/>
