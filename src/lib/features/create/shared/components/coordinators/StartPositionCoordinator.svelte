<script lang="ts">
  /**
   * Start Position Coordinator Component
   *
   * Manages start position selection panel state at CreateModule level.
   * Extracts panel logic from StartPositionCard for proper stacking context.
   *
   * Domain: Create module - Start Position Panel Coordination
   */

import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import StartPositionSelectionPanel from "../../../generate/components/modals/StartPositionSelectionPanel.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";

  // Get context
  const ctx = getCreateModuleContext();
  const { panelState } = ctx;

  // Event handlers
  function handleConfirm(position: PictographData) {
    // Apply the selection via the onChange callback
    if (panelState.startPositionOnChange) {
      panelState.startPositionOnChange(position);
    }

    // Close the panel
    panelState.closeStartPositionPanel();
  }

  function handleClose() {
    // Close without applying changes
    panelState.closeStartPositionPanel();
  }
</script>

<StartPositionSelectionPanel
  isOpen={panelState.isStartPositionPanelOpen}
  currentPosition={panelState.startPositionCurrentPosition}
  onConfirm={handleConfirm}
  onClose={handleClose}
/>
