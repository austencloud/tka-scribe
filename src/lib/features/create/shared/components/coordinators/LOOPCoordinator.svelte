<script lang="ts">
  /**
   * LOOP Coordinator Component
   *
   * Manages LOOP selection modal state at CreateModule level.
   * Extracts LOOP modal logic from CAPCard for proper stacking context.
   *
   * Domain: Create module - LOOP Panel Coordination
   */

  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ILOOPTypeResolver } from "$lib/features/create/generate/shared/services/contracts/ILOOPTypeResolver";
  import LOOPSelectionPanel from "../../../generate/components/modals/LOOPSelectionPanel.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";

  // Get context
  const ctx = getCreateModuleContext();
  const { panelState } = ctx;

  let LOOPTypeResolver: ILOOPTypeResolver = resolve<ILOOPTypeResolver>(
    TYPES.ILOOPTypeResolver
  );

  // Local pending state - tracks changes before applying
  let pendingComponents = $state<Set<any> | null>(null);

  // Use pending components if available, otherwise use the original
  const displayComponents = $derived(
    pendingComponents || panelState.capSelectedComponents || new Set()
  );

  // Event handlers
  function handleConfirm() {
    // Apply pending changes if any
    if (pendingComponents && panelState.capOnChange) {
      // Check if the combination is implemented
      const isImplemented = LOOPTypeResolver.isImplemented(pendingComponents);

      if (!isImplemented) {
        // Show "Coming Soon" message
        const componentNames = Array.from(pendingComponents)
          .map((c) => c.charAt(0) + c.slice(1).toLowerCase())
          .join(" + ");

        alert(
          `${componentNames} combination is coming soon! This combination hasn't been implemented yet, but we're working on it.`
        );
        return; // Don't close the panel, let user select a different combination
      }

      const finalLOOPType = LOOPTypeResolver.generateLOOPType(pendingComponents);
      panelState.capOnChange(finalLOOPType);
    }

    // Reset state and close
    pendingComponents = null;
    panelState.closeCAPPanel();
  }

  function handleClose() {
    // Discard pending changes without applying them
    pendingComponents = null;
    panelState.closeCAPPanel();
  }

  function handleToggleComponent(component: any) {
    // Initialize pending if not set
    if (!pendingComponents) {
      pendingComponents = new Set(
        panelState.capSelectedComponents || new Set()
      );
    }

    // Toggle the component
    if (pendingComponents.has(component)) {
      pendingComponents.delete(component);
    } else {
      pendingComponents.add(component);
    }

    // Trigger reactivity
    pendingComponents = new Set(pendingComponents);
  }

  // Reset pending state when panel closes
  $effect(() => {
    if (!panelState.isCAPPanelOpen) {
      pendingComponents = null;
    }
  });
</script>

<LOOPSelectionPanel
  isOpen={panelState.isCAPPanelOpen}
  selectedComponents={displayComponents}
  onToggleComponent={handleToggleComponent}
  onConfirm={handleConfirm}
  onClose={handleClose}
/>
