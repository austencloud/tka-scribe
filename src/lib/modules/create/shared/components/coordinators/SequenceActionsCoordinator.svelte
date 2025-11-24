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
  import SequenceActionsSheet from "../../workspace-panel/shared/components/SequenceActionsSheet.svelte";
  import { getCreateModuleContext } from "../../context";

  const logger = createComponentLogger("SequenceActionsCoordinator");

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  const isSheetOpen = $derived.by(() => panelState.isSequenceActionsPanelOpen);

  // Event handlers
  function handleClose() {
    logger.log("SequenceActionsCoordinator closing sequence actions panel");
    panelState.closeSequenceActionsPanel();
  }

  // Debug effect to track sheet visibility
  $effect(() => {
    logger.log(
      "SequenceActionsCoordinator sheet state changed:",
      panelState.isSequenceActionsPanelOpen
    );
  });

  async function handleMirror() {
    // Get the sequence state for the currently active tab
    const activeSequenceState = CreateModuleState.getActiveTabSequenceState();
    const currentSequence = activeSequenceState.currentSequence;

    console.log("🟢 handleMirror called");
    console.log("🟢 Active sequence state:", activeSequenceState);
    console.log("🟢 Current sequence:", currentSequence);

    if (!currentSequence) {
      logger.warn("No sequence to mirror");
      console.log("❌ No sequence to mirror");
      return;
    }

    logger.log("Mirroring sequence vertically (including start position)");
    console.log("🔄 Calling mirrorSequence()...");
    await activeSequenceState.mirrorSequence();
    console.log("✅ mirrorSequence() completed");
    logger.log("✅ Sequence mirrored and saved successfully");
  }

  async function handleRotate() {
    // Get the sequence state for the currently active tab
    const activeSequenceState = CreateModuleState.getActiveTabSequenceState();
    const currentSequence = activeSequenceState.currentSequence;

    if (!currentSequence) {
      logger.warn("No sequence to rotate");
      return;
    }

    logger.log("Rotating sequence 90° clockwise (including start position)");

    // Trigger orbit animation for props to rotate around center
    panelState.triggerOrbitAnimation();

    await activeSequenceState.rotateSequence("clockwise");
    logger.log("✅ Sequence rotated and saved successfully");
  }

  async function handleColorSwap() {
    // Get the sequence state for the currently active tab
    const activeSequenceState = CreateModuleState.getActiveTabSequenceState();
    const currentSequence = activeSequenceState.currentSequence;

    if (!currentSequence) {
      logger.warn("No sequence to color swap");
      return;
    }

    logger.log(
      "Swapping sequence colors (blue ↔ red, including start position)"
    );
    await activeSequenceState.swapColors();
    logger.log("✅ Sequence colors swapped and saved successfully");
  }

  async function handleReverse() {
    // Get the sequence state for the currently active tab
    const activeSequenceState = CreateModuleState.getActiveTabSequenceState();
    const currentSequence = activeSequenceState.currentSequence;

    if (!currentSequence) {
      logger.warn("No sequence to reverse");
      return;
    }

    logger.log("Reversing sequence (playing backwards)");
    await activeSequenceState.reverseSequence();
    logger.log("✅ Sequence reversed and saved successfully");
  }

  function handleCopyJSON() {
    // Get the sequence state for the currently active tab
    const activeSequenceState = CreateModuleState.getActiveTabSequenceState();
    const currentSequence = activeSequenceState.currentSequence;

    if (!currentSequence) return;

    navigator.clipboard.writeText(
      JSON.stringify(currentSequence, null, 2)
    );
    logger.log("Sequence JSON copied to clipboard");
  }
</script>

<SequenceActionsSheet
  show={isSheetOpen}
  hasSequence={CreateModuleState.getActiveTabSequenceState().hasSequence()}
  combinedPanelHeight={panelState.combinedPanelHeight}
  onMirror={handleMirror}
  onRotate={handleRotate}
  onColorSwap={handleColorSwap}
  onReverse={handleReverse}
  onCopyJSON={handleCopyJSON}
  onClose={handleClose}
/>
