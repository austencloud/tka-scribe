<!--
  BeatEditorCoordinator.svelte

  Manages the Beat Editor panel that opens when clicking a pictograph.
  Handles single-beat editing: turns, rotation, orientation, delete.

  This coordinator is separate from SequenceActionsCoordinator because:
  - Beat Editor opens directly on pictograph click (bypasses Sequence Actions)
  - Beat Editor is non-modal (allows clicking other pictographs while open)
  - Sequence Actions is for sequence-wide transforms

  Domain: Create module - Beat Editing Coordination
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import BeatEditorPanel from "../sequence-actions/BeatEditorPanel.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IBeatOperationsService } from "../../services/contracts/IBeatOperationsService";
  import {
    MotionColor,
    RotationDirection,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  const logger = createComponentLogger("BeatEditorCoordinator");

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);
  let beatOperationsService: IBeatOperationsService | null = $state(null);

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    } catch { /* Optional service */ }
    try {
      beatOperationsService = resolve<IBeatOperationsService>(TYPES.IBeatOperationsService);
    } catch { /* Optional service */ }
  });

  // Panel state
  const isOpen = $derived(panelState.isBeatEditorPanelOpen);

  // Get active sequence state and selected beat data
  const activeSequenceState = $derived(CreateModuleState.getActiveTabSequenceState());
  const selectedBeatNumber = $derived(activeSequenceState.selectedBeatNumber);
  const selectedBeatData = $derived(activeSequenceState.selectedBeatData);

  // Derived state for turns calculations
  const blueMotion = $derived(selectedBeatData?.motions?.[MotionColor.BLUE]);
  const redMotion = $derived(selectedBeatData?.motions?.[MotionColor.RED]);

  const normalizeTurns = (turns: number | string | undefined): number =>
    turns === "fl" ? -0.5 : Number(turns) || 0;

  const currentBlueTurns = $derived(normalizeTurns(blueMotion?.turns));
  const currentRedTurns = $derived(normalizeTurns(redMotion?.turns));

  // Event handlers
  function handleClose() {
    logger.log("BeatEditorCoordinator closing beat editor panel");
    panelState.closeBeatEditorPanel();
    // Note: We do NOT clear beat selection when closing Beat Editor
    // This allows the user to click another beat or re-open the editor
  }

  function handleTurnsChange(color: MotionColor, delta: number) {
    if (selectedBeatNumber === null || !beatOperationsService) return;
    hapticService?.trigger("selection");

    const currentTurns = color === MotionColor.BLUE ? currentBlueTurns : currentRedTurns;
    const newNumericTurns = Math.min(3, Math.max(-0.5, currentTurns + delta));
    const newTurns: number | "fl" = newNumericTurns === -0.5 ? "fl" : newNumericTurns;

    beatOperationsService.updateBeatTurns(
      selectedBeatNumber,
      color,
      newTurns,
      CreateModuleState,
      panelState
    );
  }

  function handleRotationChange(color: MotionColor, direction: RotationDirection) {
    if (selectedBeatNumber === null || !beatOperationsService) return;
    hapticService?.trigger("selection");

    const directionString = direction === RotationDirection.CLOCKWISE ? "cw" : "ccw";
    beatOperationsService.updateRotationDirection(
      selectedBeatNumber,
      color,
      directionString,
      CreateModuleState,
      panelState
    );
  }

  function handleOrientationChange(color: MotionColor, orientation: string) {
    if (selectedBeatNumber === null || !beatOperationsService) return;
    hapticService?.trigger("selection");

    beatOperationsService.updateBeatOrientation(
      selectedBeatNumber,
      color,
      orientation,
      CreateModuleState,
      panelState
    );
  }

  function handleBeatDelete() {
    if (selectedBeatNumber === null || !beatOperationsService) return;
    hapticService?.trigger("warning");

    // For start position (0), clear the start position
    if (selectedBeatNumber === 0) {
      activeSequenceState.setStartPosition(null);
      activeSequenceState.clearSelection();
      return;
    }

    // For regular beats, remove the beat
    const beatIndex = selectedBeatNumber - 1;
    beatOperationsService.removeBeat(beatIndex, CreateModuleState);

    // Clear selection after deletion
    activeSequenceState.clearSelection();
  }

  // Debug effect to track panel visibility
  $effect(() => {
    logger.log("BeatEditorCoordinator panel state changed:", panelState.isBeatEditorPanelOpen);
  });
</script>

<BeatEditorPanel
  {isOpen}
  {selectedBeatNumber}
  {selectedBeatData}
  onClose={handleClose}
  onTurnsChange={handleTurnsChange}
  onRotationChange={handleRotationChange}
  onOrientationChange={handleOrientationChange}
  onDelete={handleBeatDelete}
/>
