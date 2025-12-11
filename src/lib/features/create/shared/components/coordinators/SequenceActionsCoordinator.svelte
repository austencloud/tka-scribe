<script lang="ts">
  /**
   * Sequence Actions Coordinator Component
   *
   * Manages the sequence actions panel that combines:
   * - Individual beat editing (turns, rotation)
   * - Sequence transformations (mirror, rotate, swap, reverse)
   *
   * Domain: Create module - Sequence Editing Coordination
   */

  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import SequenceActionsPanel from "../sequence-actions/SequenceActionsPanel.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";

  const logger = createComponentLogger("SequenceActionsCoordinator");

  // Get context
  const ctx = getCreateModuleContext();
  const { panelState } = ctx;

  const isEditorOpen = $derived.by(() => panelState.isSequenceActionsPanelOpen);

  // Event handlers
  function handleClose() {
    logger.log("SequenceActionsCoordinator closing sequence actions panel");
    panelState.closeSequenceActionsPanel();
  }

  // Debug effect to track panel visibility
  $effect(() => {
    logger.log(
      "SequenceActionsCoordinator panel state changed:",
      panelState.isSequenceActionsPanelOpen
    );
  });
</script>

<SequenceActionsPanel
  show={isEditorOpen}
  onClose={handleClose}
/>
