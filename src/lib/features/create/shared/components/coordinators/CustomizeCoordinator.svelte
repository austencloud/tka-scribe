<script lang="ts">
  /**
   * Customize Options Coordinator Component
   *
   * Manages customize options sheet state at CreateModule level.
   * Coordinates start/end position and letter constraint selection.
   *
   * Domain: Create module - Customize Options Panel Coordination
   */

  import type { CustomizeOptions } from "../../state/panel-coordination-state.svelte";
  import CustomizeSheet from "../../../generate/components/modals/CustomizeSheet.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";

  // Get context
  const ctx = getCreateModuleContext();
  const { panelState } = ctx;

  // Local pending state - tracks changes before sheet closes
  let pendingOptions = $state<CustomizeOptions | null>(null);

  // Use pending options if available, otherwise use the original
  const displayOptions = $derived(
    pendingOptions || panelState.customizeOptions || {
      startPosition: null,
      endPosition: null,
      mustContainLetters: [],
      mustNotContainLetters: [],
    }
  );

  function handleChange(options: CustomizeOptions) {
    pendingOptions = { ...options };

    // Apply changes immediately to the callback
    if (panelState.customizeOnChange) {
      panelState.customizeOnChange(options);
    }
  }

  function handleClose() {
    // Reset pending and close
    pendingOptions = null;
    panelState.closeCustomizePanel();
  }

  // Reset pending state when panel closes
  $effect(() => {
    if (!panelState.isCustomizePanelOpen) {
      pendingOptions = null;
    }
  });
</script>

<CustomizeSheet
  isOpen={panelState.isCustomizePanelOpen}
  options={displayOptions}
  onChange={handleChange}
  onClose={handleClose}
  isFreeformMode={panelState.customizeIsFreeformMode}
/>
