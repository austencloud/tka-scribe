<script lang="ts">
  /**
   * Edit Coordinator Component
   *
   * Manages edit panel state, interactions, and beat editing operations.
   * Extracts edit panel logic from CreateModule.svelte for better separation of concerns.
   *
   * Domain: Create module - Edit Panel Coordination
   */

  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import EditSlidePanel from "../../../edit/components/EditSlidePanel.svelte";
  import ConfirmDialog from "$lib/shared/foundation/ui/ConfirmDialog.svelte";
  import type { BatchEditChanges } from "../../types/create-module-types";
  import { getCreateModuleContext } from "../../context/create-module-context";

  const logger = createComponentLogger("EditCoordinator");

  // Confirmation dialog state
  let showRemoveBeatConfirm = $state(false);
  let beatToRemove = $state<number | null>(null);

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState, services, layout, handlers } = ctx;
  const BeatOperator = services.BeatOperator;
  const shouldUseSideBySideLayout = $derived(layout.shouldUseSideBySideLayout);
  const onError = handlers.onError;

  // Derive beat data reactively from sequence state instead of using snapshot
  const selectedBeatData = $derived.by(() => {
    const beatIndex = panelState.editPanelBeatIndex;
    if (beatIndex === null) return null;

    // Beat 0 = start position - read from selectedStartPosition and convert to BeatData
    if (beatIndex === 0) {
      const startPos = CreateModuleState.sequenceState.selectedStartPosition;
      if (!startPos) return null;

      // Convert PictographData to BeatData
      return {
        ...startPos,
        beatNumber: 0,
        duration: 1000,
        blueReversal: false,
        redReversal: false,
        isBlank: false,
      };
    }

    // Regular beats (1, 2, 3...) - get from sequence
    const sequence = CreateModuleState.sequenceState.currentSequence;
    if (!sequence || !sequence.beats) return null;

    const arrayIndex = beatIndex - 1;
    return sequence.beats[arrayIndex] || null;
  });

  // Event handlers
  function handleOrientationChange(color: string, orientation: string) {
    const beatIndex = panelState.editPanelBeatIndex;

    if (beatIndex === null) {
      logger.warn("Cannot change orientation: no beat selected");
      return;
    }

    try {
      BeatOperator.updateBeatOrientation(
        beatIndex,
        color,
        orientation,
        CreateModuleState,
        panelState
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update orientation";
      logger.error("Failed to update orientation", err);
      onError?.(errorMessage);
    }
  }

  function handleTurnAmountChange(color: string, turnAmount: number | "fl") {
    const beatIndex = panelState.editPanelBeatIndex;
    if (beatIndex === null) {
      logger.warn("Cannot change turns: no beat selected");
      return;
    }

    try {
      BeatOperator.updateBeatTurns(
        beatIndex,
        color,
        turnAmount,
        CreateModuleState,
        panelState
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update turns";
      logger.error("Failed to update turns", err);
      onError?.(errorMessage);
    }
  }

  function handleRotationDirectionChange(
    color: string,
    rotationDirection: string
  ) {
    const beatIndex = panelState.editPanelBeatIndex;
    if (beatIndex === null) {
      logger.warn("Cannot change rotation direction: no beat selected");
      return;
    }

    try {
      BeatOperator.updateRotationDirection(
        beatIndex,
        color,
        rotationDirection,
        CreateModuleState,
        panelState
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update rotation direction";
      logger.error("Failed to update rotation direction", err);
      onError?.(errorMessage);
    }
  }

  function handleBatchApply(changes: BatchEditChanges) {
    try {
      BeatOperator.applyBatchChanges(changes, CreateModuleState);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to apply changes";
      logger.error("Failed to apply batch changes", err);
      onError?.(errorMessage);

      // Error recovery: Clear selection and close panel to prevent stuck UI
      CreateModuleState.sequenceState.clearSelection();
      panelState.closeEditPanel();
    }
  }

  function handleRemoveBeat(beatNumber: number) {
    // Show confirmation dialog instead of executing directly
    beatToRemove = beatNumber;
    showRemoveBeatConfirm = true;
  }

  function confirmRemoveBeat() {
    if (beatToRemove === null) return;

    try {
      BeatOperator.removeBeat(beatToRemove - 1, CreateModuleState);
      // Close edit panel after removing beat
      panelState.closeEditPanel();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove beat";
      logger.error("Failed to remove beat", err);
      onError?.(errorMessage);
    } finally {
      showRemoveBeatConfirm = false;
      beatToRemove = null;
    }
  }

  function cancelRemoveBeat() {
    showRemoveBeatConfirm = false;
    beatToRemove = null;
  }

  function handleClosePanel() {
    panelState.closeEditPanel();

    // Clear single beat selection
    CreateModuleState.sequenceState.clearSelection();

    // Exit multi-select mode if active
    const selectedCount =
      CreateModuleState.sequenceState.selectedBeatNumbers?.size ?? 0;
    if (selectedCount > 0) {
      CreateModuleState.sequenceState.exitMultiSelectMode();
    }
  }
</script>

<EditSlidePanel
  isOpen={panelState.isEditPanelOpen}
  selectedBeatNumber={panelState.editPanelBeatIndex}
  {selectedBeatData}
  selectedBeatsData={panelState.editPanelBeatsData}
  combinedPanelHeight={panelState.combinedPanelHeight}
  onClose={handleClosePanel}
  onOrientationChanged={handleOrientationChange}
  onTurnAmountChanged={handleTurnAmountChange}
  onRotationDirectionChanged={handleRotationDirectionChange}
  onBatchApply={handleBatchApply}
  onRemoveBeat={handleRemoveBeat}
/>

<!-- Remove Beat Confirmation Dialog -->
<ConfirmDialog
  bind:isOpen={showRemoveBeatConfirm}
  title="Remove Beat?"
  message="This will delete beat {beatToRemove} from your sequence. This action cannot be undone."
  confirmText="Remove"
  cancelText="Keep"
  variant="danger"
  onConfirm={confirmRemoveBeat}
  onCancel={cancelRemoveBeat}
/>
