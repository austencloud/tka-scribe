<script lang="ts">
  /**
   * Sequence Actions Coordinator Component
   *
   * Manages the fullscreen sequence editor panel that combines:
   * - Beat grid display with selection
   * - Individual beat editing (turns, rotation)
   * - Sequence transformations (mirror, rotate, swap, reverse)
   *
   * Replaces the old partial-screen SequenceActionsPanel with a comprehensive
   * fullscreen editing experience.
   *
   * Domain: Create module - Sequence Editing Coordination
   */

  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import FullscreenEditorPanel from "../FullscreenEditorPanel.svelte";
  import { getCreateModuleContext } from "../../context";

  const logger = createComponentLogger("SequenceActionsCoordinator");

  // Get context
  const ctx = getCreateModuleContext();
  const { panelState } = ctx;

  const isEditorOpen = $derived.by(() => panelState.isSequenceActionsPanelOpen);

  // Event handlers
  function handleClose() {
    logger.log("SequenceActionsCoordinator closing fullscreen editor panel");
    panelState.closeSequenceActionsPanel();
  }

  // Debug effect to track panel visibility
  $effect(() => {
    logger.log(
      "SequenceActionsCoordinator editor panel state changed:",
      panelState.isSequenceActionsPanelOpen
    );
  });
</script>

<FullscreenEditorPanel
  show={isEditorOpen}
  onClose={handleClose}
/>
