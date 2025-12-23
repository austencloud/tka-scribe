<script lang="ts">
  /**
   * Share Hub Coordinator Component
   *
   * Orchestrates Share Hub drawer state and provides sequence data to ShareHub.
   * ShareHubDrawer is a pure presentation component that receives everything as props.
   *
   * Domain: Create module - Share Hub Coordination
   */

  import ShareHubDrawer from "$lib/shared/share-hub/components/ShareHubDrawer.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { getCreateModuleContext } from "../../context/create-module-context";

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // Resolve haptic service
  try {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  } catch (error) {
    console.warn("⚠️ Failed to resolve haptic feedback service:", error);
  }

  // Derived: Get current sequence from active tab
  const currentSequence = $derived(
    CreateModuleState.sequenceState.currentSequence
  );

  // Event handlers
  function handleClose() {
    hapticService?.trigger("selection");
    panelState.closeShareHubPanel();
  }
</script>

<ShareHubDrawer
  isOpen={panelState.isShareHubPanelOpen}
  sequence={currentSequence}
  onClose={handleClose}
/>
