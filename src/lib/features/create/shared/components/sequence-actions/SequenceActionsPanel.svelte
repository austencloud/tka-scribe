<!--
  SequenceActionsPanel.svelte

  Main orchestrator for sequence editing.
  Composes: SequenceActionsHeader, TurnsEditMode, TransformsGridMode, TransformHelpSheet
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import { MotionColor, RotationDirection } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import type { BeatData } from "../../domain/models/BeatData";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { ISequenceEncoderService } from "$lib/shared/navigation/services/contracts/ISequenceEncoderService";
  import { goto } from "$app/navigation";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";

  import CreatePanelDrawer from "../CreatePanelDrawer.svelte";
  import PanelHeader from "../PanelHeader.svelte";
  import ConfirmDialog from "$lib/shared/foundation/ui/ConfirmDialog.svelte";
  import SequenceActionsHeader from "./SequenceActionsHeader.svelte";
  import TurnsEditMode from "./TurnsEditMode.svelte";
  import TransformsGridMode from "./TransformsGridMode.svelte";
  import TransformHelpSheet from "../transform-help/TransformHelpSheet.svelte";

  type EditMode = "turns" | "transforms";

  interface Props {
    show: boolean;
    onClose?: () => void;
  }

  let { show, onClose }: Props = $props();

  // Context and state
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;
  const activeSequenceState = $derived(CreateModuleState.getActiveTabSequenceState());
  const sequence = $derived(activeSequenceState.currentSequence);
  const hasSequence = $derived(activeSequenceState.hasSequence());
  const isInConstructTab = $derived(navigationState.currentCreateMode === "constructor");
  const panelHeight = $derived(panelState.navigationBarHeight + panelState.toolPanelHeight);

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Local state
  let isOpen = $state(show);
  let currentMode = $state<EditMode>("transforms");
  let isTransforming = $state(false);
  let showConfirmDialog = $state(false);
  let pendingSequenceTransfer = $state<any>(null);
  let showHelpSheet = $state(false);

  // Sync isOpen with show prop
  $effect(() => { isOpen = show; });

  // Reset mode when panel closes
  $effect(() => { if (!show) currentMode = "transforms"; });

  // Auto-switch to turns mode when beat selected
  const selectedBeatNumber = $derived(activeSequenceState.selectedBeatNumber);
  const selectedBeatData = $derived(activeSequenceState.selectedBeatData);
  $effect(() => { if (show && selectedBeatNumber !== null) currentMode = "turns"; });

  // Beat editing derived state
  const hasSelection = $derived(selectedBeatNumber !== null);
  const isStartPositionSelected = $derived(selectedBeatNumber === 0);
  const blueMotion = $derived(selectedBeatData?.motions?.[MotionColor.BLUE]);
  const redMotion = $derived(selectedBeatData?.motions?.[MotionColor.RED]);

  const normalizeTurns = (turns: number | string | undefined): number =>
    turns === "fl" ? -0.5 : Number(turns) || 0;

  const currentBlueTurns = $derived(normalizeTurns(blueMotion?.turns));
  const currentRedTurns = $derived(normalizeTurns(redMotion?.turns));
  const displayBlueTurns = $derived(blueMotion?.turns === "fl" ? "fl" : currentBlueTurns);
  const displayRedTurns = $derived(redMotion?.turns === "fl" ? "fl" : currentRedTurns);
  const showBlueRotation = $derived(currentBlueTurns >= 0);
  const showRedRotation = $derived(currentRedTurns >= 0);
  const blueRotation = $derived(blueMotion?.rotationDirection ?? RotationDirection.NO_ROTATION);
  const redRotation = $derived(redMotion?.rotationDirection ?? RotationDirection.NO_ROTATION);

  const beatLabel = $derived.by(() => {
    if (selectedBeatNumber === null) return "";
    return selectedBeatNumber === 0 ? "Start Position" : `Beat ${selectedBeatNumber}`;
  });

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
    } catch (e) { /* Optional service */ }
  });

  // Beat editing handlers
  function handleTurnsChange(color: MotionColor, delta: number) {
    if (selectedBeatNumber === null || !selectedBeatData?.motions) return;
    hapticService?.trigger("selection");

    const motionData = selectedBeatData.motions[color];
    if (!motionData) return;

    const currentTurns = color === MotionColor.BLUE ? currentBlueTurns : currentRedTurns;
    const newNumericTurns = Math.max(-0.5, currentTurns + delta);
    const newTurns: number | "fl" = newNumericTurns === -0.5 ? "fl" : newNumericTurns;

    const updatedMotions = { ...selectedBeatData.motions, [color]: { ...motionData, turns: newTurns } };

    if (isStartPositionSelected) {
      activeSequenceState.setStartPosition({ ...selectedBeatData, motions: updatedMotions } as BeatData);
    } else {
      activeSequenceState.updateBeat(selectedBeatNumber - 1, { motions: updatedMotions });
    }
  }

  function handleRotationChange(color: MotionColor, direction: RotationDirection) {
    if (selectedBeatNumber === null || !selectedBeatData?.motions) return;
    hapticService?.trigger("selection");

    const motionData = selectedBeatData.motions[color];
    if (!motionData) return;

    const updatedMotions = { ...selectedBeatData.motions, [color]: { ...motionData, rotationDirection: direction } };

    if (isStartPositionSelected) {
      activeSequenceState.setStartPosition({ ...selectedBeatData, motions: updatedMotions } as BeatData);
    } else {
      activeSequenceState.updateBeat(selectedBeatNumber - 1, { motions: updatedMotions });
    }
  }

  // Transform handlers
  async function handleMirror() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try { await activeSequenceState.mirrorSequence(); }
    finally { isTransforming = false; }
  }

  async function handleRotateCW() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try { await activeSequenceState.rotateSequence("clockwise"); }
    finally { isTransforming = false; }
  }

  async function handleRotateCCW() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try { await activeSequenceState.rotateSequence("counterclockwise"); }
    finally { isTransforming = false; }
  }

  async function handleSwap() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try { await activeSequenceState.swapColors(); }
    finally { isTransforming = false; }
  }

  async function handleReverse() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try { await activeSequenceState.reverseSequence(); }
    finally { isTransforming = false; }
  }

  function handlePreview() {
    if (!sequence) return;
    hapticService?.trigger("selection");
    handleClose();
    try {
      const encoderService = resolve<ISequenceEncoderService>(TYPES.ISequenceEncoderService);
      const { url } = encoderService.generateViewerURL(sequence, { compress: true });
      goto(new URL(url).pathname);
    } catch (err) {
      console.error("Failed to generate preview URL:", err);
    }
  }

  function handleEditInConstructor() {
    if (!sequence) return;
    hapticService?.trigger("selection");

    const constructTabState = ctx.constructTabState;
    if (!constructTabState?.sequenceState) return;

    if (constructTabState.sequenceState.hasSequence()) {
      pendingSequenceTransfer = sequence;
      showConfirmDialog = true;
    } else {
      performSequenceTransfer(sequence);
    }
  }

  async function performSequenceTransfer(sequenceToTransfer: any) {
    const constructTabState = ctx.constructTabState;
    if (!constructTabState?.sequenceState) return;

    const sequenceCopy = JSON.parse(JSON.stringify(sequenceToTransfer));
    handleClose();
    navigationState.setActiveTab("constructor");
    await new Promise((r) => setTimeout(r, 600));

    constructTabState.sequenceState.setCurrentSequence(sequenceCopy);

    const startPos = sequenceCopy.startPosition || sequenceCopy.startingPositionBeat;
    if (startPos) {
      constructTabState.sequenceState.setStartPosition(startPos);
      constructTabState.setSelectedStartPosition(startPos);
      constructTabState.setShowStartPositionPicker(false);
    }

    constructTabState.syncPickerStateWithSequence?.();
  }

  function handleClose() {
    hapticService?.trigger("selection");
    onClose?.();
  }
</script>

<CreatePanelDrawer
  bind:isOpen
  panelName="sequence-actions"
  combinedPanelHeight={panelHeight}
  showHandle={true}
  closeOnBackdrop={true}
  focusTrap={false}
  lockScroll={false}
  ariaLabel="Sequence editor panel"
  onClose={handleClose}
>
  <div class="editor-panel">
    <PanelHeader
      title={currentMode === "turns" && hasSelection ? beatLabel : "Sequence Actions"}
      isMobile={true}
      onClose={handleClose}
    />

    <SequenceActionsHeader
      {currentMode}
      onModeChange={(m) => (currentMode = m)}
      onShowHelp={() => (showHelpSheet = true)}
    />

    <div class="controls-content">
      {#if currentMode === "turns"}
        <TurnsEditMode
          {hasSelection}
          blueTurns={displayBlueTurns}
          redTurns={displayRedTurns}
          blueRotation={blueRotation}
          redRotation={redRotation}
          {showBlueRotation}
          {showRedRotation}
          onTurnsChange={handleTurnsChange}
          onRotationChange={handleRotationChange}
        />
      {:else}
        <TransformsGridMode
          {hasSequence}
          {isTransforming}
          showEditInConstructor={!isInConstructTab}
          onMirror={handleMirror}
          onRotateCW={handleRotateCW}
          onRotateCCW={handleRotateCCW}
          onSwap={handleSwap}
          onReverse={handleReverse}
          onPreview={handlePreview}
          onEditInConstructor={handleEditInConstructor}
        />
      {/if}
    </div>
  </div>
</CreatePanelDrawer>

<!-- Render help sheet outside drawer so it can be a true full-viewport overlay -->
<TransformHelpSheet show={showHelpSheet} onClose={() => (showHelpSheet = false)} />

<ConfirmDialog
  bind:isOpen={showConfirmDialog}
  title="Replace Constructor Sequence?"
  message="The Constructor tab has an active sequence. Replacing it will overwrite your current work."
  confirmText="Replace & Edit"
  cancelText="Keep Current"
  variant="warning"
  onConfirm={() => { performSequenceTransfer(pendingSequenceTransfer); pendingSequenceTransfer = null; }}
  onCancel={() => { pendingSequenceTransfer = null; }}
/>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .controls-content {
    flex: 1;
    min-height: 0;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
</style>
