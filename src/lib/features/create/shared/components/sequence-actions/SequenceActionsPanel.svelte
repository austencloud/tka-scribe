<!--
  SequenceActionsPanel.svelte

  Main orchestrator for sequence editing.
  Composes: SequenceActionsHeader, TurnsEditMode, TransformsGridMode, TransformHelpSheet
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import {
    MotionColor,
    MotionType,
    RotationDirection,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import type { BeatData } from "../../domain/models/BeatData";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IBeatOperationsService } from "../../services/contracts/IBeatOperationsService";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import { createPersistenceHelper } from "$lib/shared/state/utils/persistent-state";
  import { openSpotlightWithBeatGrid } from "$lib/shared/application/state/ui/ui-state.svelte";

  import CreatePanelDrawer from "../CreatePanelDrawer.svelte";
  import SequencePreviewDialog from "./SequencePreviewDialog.svelte";
  import TurnsEditMode from "./TurnsEditMode.svelte";
  import StartPositionEditMode from "./StartPositionEditMode.svelte";
  import TransformsGridMode from "./TransformsGridMode.svelte";
  import TransformHelpSheet from "../transform-help/TransformHelpSheet.svelte";
  import TurnPatternDrawer from "./TurnPatternDrawer.svelte";
  import BeatGrid from "../../workspace-panel/sequence-display/components/BeatGrid.svelte";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";

  type EditMode = "turns" | "transforms";

  interface Props {
    show: boolean;
    onClose?: () => void;
  }

  let { show, onClose }: Props = $props();

  // Persistence
  const modePersistence = createPersistenceHelper({
    key: "tka_sequence_actions_panel_mode",
    defaultValue: "transforms" as EditMode,
  });

  // Context and state
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState, layout } = ctx;
  const activeSequenceState = $derived(
    CreateModuleState.getActiveTabSequenceState()
  );
  const sequence = $derived(activeSequenceState.currentSequence);
  const hasSequence = $derived(activeSequenceState.hasSequence());
  const isInConstructTab = $derived(
    navigationState.currentCreateMode === "constructor"
  );
  const isSideBySideLayout = $derived(layout.shouldUseSideBySideLayout);

  // Panel height for drawer content
  // On desktop: only used for reference (drawer uses CSS top/bottom positioning)
  // On mobile: used to determine drawer height from bottom
  const panelHeight = $derived(
    panelState.navigationBarHeight + panelState.toolPanelHeight
  );

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);
  let beatOperationsService: IBeatOperationsService | null = $state(null);

  // Local state
  let isOpen = $state(show);
  let currentMode = $state<EditMode>(modePersistence.load());
  let isTransforming = $state(false);
  let showConfirmDialog = $state(false);
  let pendingSequenceTransfer = $state<any>(null);
  let showHelpSheet = $state(false);
  let showTurnPatternDrawer = $state(false);
  let lastTrackedBeatNumber = $state<number | null>(null);

  // Sync isOpen with show prop
  $effect(() => {
    isOpen = show;
  });

  // Auto-save current mode
  $effect(() => {
    void currentMode;
    modePersistence.setupAutoSave(currentMode);
  });

  // Auto-switch to turns mode when beat selected
  const selectedBeatNumber = $derived(activeSequenceState.selectedBeatNumber);
  const selectedBeatData = $derived(activeSequenceState.selectedBeatData);

  // Only auto-switch to turns mode when a NEW beat is selected (not when reopening panel)
  $effect(() => {
    if (
      show &&
      selectedBeatNumber !== null &&
      selectedBeatNumber !== lastTrackedBeatNumber
    ) {
      currentMode = "turns";
      lastTrackedBeatNumber = selectedBeatNumber;
    } else if (selectedBeatNumber === null) {
      lastTrackedBeatNumber = null;
    }
  });

  // Beat editing derived state
  const hasSelection = $derived(selectedBeatNumber !== null);
  const isStartPositionSelected = $derived(selectedBeatNumber === 0);
  const blueMotion = $derived(selectedBeatData?.motions?.[MotionColor.BLUE]);
  const redMotion = $derived(selectedBeatData?.motions?.[MotionColor.RED]);

  const normalizeTurns = (turns: number | string | undefined): number =>
    turns === "fl" ? -0.5 : Number(turns) || 0;

  const currentBlueTurns = $derived(normalizeTurns(blueMotion?.turns));
  const currentRedTurns = $derived(normalizeTurns(redMotion?.turns));
  const displayBlueTurns = $derived(
    blueMotion?.turns === "fl" ? "fl" : currentBlueTurns
  );
  const displayRedTurns = $derived(
    redMotion?.turns === "fl" ? "fl" : currentRedTurns
  );
  // Determine if rotation can be shown for each prop
  // Disabled for:
  // - Float motions (turns == -0.5)
  // - Static or Dash motions with 0 turns
  const showBlueRotation = $derived.by(() => {
    if (currentBlueTurns < 0) return false; // Float motion
    if (
      (blueMotion?.motionType === MotionType.STATIC ||
        blueMotion?.motionType === MotionType.DASH) &&
      currentBlueTurns === 0
    ) {
      return false; // Static/Dash with 0 turns
    }
    return true;
  });

  const showRedRotation = $derived.by(() => {
    if (currentRedTurns < 0) return false; // Float motion
    if (
      (redMotion?.motionType === MotionType.STATIC ||
        redMotion?.motionType === MotionType.DASH) &&
      currentRedTurns === 0
    ) {
      return false; // Static/Dash with 0 turns
    }
    return true;
  });
  const blueRotation = $derived(
    blueMotion?.rotationDirection ?? RotationDirection.NO_ROTATION
  );
  const redRotation = $derived(
    redMotion?.rotationDirection ?? RotationDirection.NO_ROTATION
  );

  const beatLabel = $derived.by(() => {
    if (selectedBeatNumber === null) return "";
    return selectedBeatNumber === 0
      ? "Start Position"
      : `Beat ${selectedBeatNumber}`;
  });

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (e) {
      /* Optional service */
    }
    try {
      beatOperationsService = resolve<IBeatOperationsService>(
        TYPES.IBeatOperationsService
      );
    } catch (e) {
      /* Optional service */
    }
  });

  // Beat editing handlers
  function handleTurnsChange(color: MotionColor, delta: number) {
    console.log(
      `[SequenceActionsPanel] handleTurnsChange called: color=${color}, delta=${delta}, selectedBeatNumber=${selectedBeatNumber}`
    );
    if (selectedBeatNumber === null || !beatOperationsService) {
      console.log(
        `[SequenceActionsPanel] Early return: selectedBeatNumber=${selectedBeatNumber}, beatOperationsService=${!!beatOperationsService}`
      );
      return;
    }
    hapticService?.trigger("selection");

    const currentTurns =
      color === MotionColor.BLUE ? currentBlueTurns : currentRedTurns;
    // Cap turns between -0.5 (float) and 3 (max)
    const newNumericTurns = Math.min(3, Math.max(-0.5, currentTurns + delta));
    const newTurns: number | "fl" =
      newNumericTurns === -0.5 ? "fl" : newNumericTurns;

    console.log(
      `[SequenceActionsPanel] Calling beatOperationsService.updateBeatTurns: beatNumber=${selectedBeatNumber}, color=${color}, turns=${newTurns}`
    );
    // Use BeatOperationsService to handle motion type updates, float conversion, etc.
    beatOperationsService.updateBeatTurns(
      selectedBeatNumber,
      color,
      newTurns,
      CreateModuleState,
      panelState
    );
    console.log(`[SequenceActionsPanel] updateBeatTurns completed`);
  }

  function handleRotationChange(
    color: MotionColor,
    direction: RotationDirection
  ) {
    if (selectedBeatNumber === null || !beatOperationsService) return;
    hapticService?.trigger("selection");

    // Use BeatOperationsService to handle motion type flipping and letter recalculation
    // Map enum to string representation for the service
    const directionString =
      direction === RotationDirection.CLOCKWISE ? "cw" : "ccw";
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

  // Transform handlers
  async function handleMirror() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.mirrorSequence();
    } finally {
      isTransforming = false;
    }
  }

  async function handleRotateCW() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.rotateSequence("clockwise");
    } finally {
      isTransforming = false;
    }
  }

  async function handleRotateCCW() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.rotateSequence("counterclockwise");
    } finally {
      isTransforming = false;
    }
  }

  async function handleSwap() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.swapColors();
    } finally {
      isTransforming = false;
    }
  }

  async function handleRewind() {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    try {
      await activeSequenceState.rewindSequence();
    } finally {
      isTransforming = false;
    }
  }

  function handlePreview() {
    if (!sequence) return;
    hapticService?.trigger("selection");
    handleClose();
    // Open spotlight with beat grid - renders sequence directly without generating an image
    openSpotlightWithBeatGrid(sequence);
  }

  function handleTurnPattern() {
    hapticService?.trigger("selection");
    showTurnPatternDrawer = true;
  }

  function handleTurnPatternApply(result: { sequence: any; warnings?: readonly string[] }) {
    // Update the active sequence with the pattern-applied sequence
    activeSequenceState.setCurrentSequence(result.sequence);

    // Log any warnings
    if (result.warnings && result.warnings.length > 0) {
      console.log("[TurnPattern] Applied with warnings:", result.warnings);
    }

    hapticService?.trigger("success");
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

    // Sync grid mode and sequence state IMMEDIATELY before tab switch
    // This prevents the flicker of options disappearing and reappearing
    if (sequenceCopy.gridMode) {
      constructTabState.syncGridModeFromSequence?.(sequenceCopy.gridMode);
    }

    constructTabState.sequenceState.setCurrentSequence(sequenceCopy);

    const startPos =
      sequenceCopy.startPosition || sequenceCopy.startingPositionBeat;
    if (startPos) {
      constructTabState.sequenceState.setStartPosition(startPos);
      constructTabState.setSelectedStartPosition(startPos);
      constructTabState.setShowStartPositionPicker(false);
    }

    constructTabState.syncPickerStateWithSequence?.();

    // Close panel and switch tab AFTER state is already set
    handleClose();
    navigationState.setActiveTab("constructor");
  }

  function handleClose() {
    hapticService?.trigger("selection");
    onClose?.();
  }

  function handleBeatSelect(beatNumber: number) {
    hapticService?.trigger("selection");
    activeSequenceState.selectBeat(beatNumber);
  }
</script>

<CreatePanelDrawer
  bind:isOpen
  panelName="sequence-actions"
  combinedPanelHeight={panelHeight}
  fullHeightOnMobile={true}
  showHandle={true}
  closeOnBackdrop={true}
  focusTrap={false}
  lockScroll={false}
  ariaLabel="Sequence editor panel"
  onClose={handleClose}
>
  <div class="editor-panel">
    <!-- Compact header: mode toggle + beat label + actions in one row -->
    <div class="compact-header">
      <div class="mode-toggle">
        <button
          class="mode-btn"
          class:active={currentMode === "turns"}
          onclick={() => (currentMode = "turns")}
        >
          <i class="fas fa-sliders-h"></i>
          <span class="mode-label">Turns</span>
        </button>
        <button
          class="mode-btn"
          class:active={currentMode === "transforms"}
          onclick={() => (currentMode = "transforms")}
        >
          <i class="fas fa-wand-magic-sparkles"></i>
          <span class="mode-label">Transforms</span>
        </button>
      </div>

      {#if currentMode === "turns" && hasSelection}
        <span class="beat-label">{beatLabel}</span>
      {/if}

      <div class="header-actions">
        {#if currentMode === "transforms"}
          <button
            class="icon-btn help"
            onclick={() => (showHelpSheet = true)}
            aria-label="Help"
          >
            <i class="fas fa-circle-question"></i>
          </button>
        {/if}
        <button class="icon-btn close" onclick={handleClose} aria-label="Close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Desktop preview: shows selected beat pictograph above controls -->
    {#if isSideBySideLayout && currentMode === "turns" && hasSelection && selectedBeatData}
      <div class="desktop-preview-section">
        <div class="preview-pictograph">
          <Pictograph
            pictographData={selectedBeatData}
            disableContentTransitions={true}
          />
        </div>
      </div>
    {/if}

    <!-- Beat grid display: shows on mobile at 50% height -->
    {#if hasSequence && isSideBySideLayout === false && sequence}
      <div class="beat-grid-section">
        <BeatGrid
          beats={sequence.beats}
          startPosition={sequence.startPosition ||
            sequence.startingPositionBeat ||
            null}
          {selectedBeatNumber}
          onBeatClick={handleBeatSelect}
          onStartClick={() => handleBeatSelect(0)}
        />
      </div>
    {/if}

    <div class="controls-content">
      {#if currentMode === "turns"}
        {#if isStartPositionSelected}
          <StartPositionEditMode
            startPositionData={selectedBeatData}
            onOrientationChange={handleOrientationChange}
          />
        {:else}
          <TurnsEditMode
            {hasSelection}
            blueTurns={displayBlueTurns}
            redTurns={displayRedTurns}
            {blueRotation}
            {redRotation}
            {showBlueRotation}
            {showRedRotation}
            onTurnsChange={handleTurnsChange}
            onRotationChange={handleRotationChange}
          />
        {/if}
      {:else}
        <TransformsGridMode
          {hasSequence}
          {isTransforming}
          showEditInConstructor={!isInConstructTab}
          onMirror={handleMirror}
          onRotateCW={handleRotateCW}
          onRotateCCW={handleRotateCCW}
          onSwap={handleSwap}
          onRewind={handleRewind}
          onPreview={handlePreview}
          onTurnPattern={handleTurnPattern}
          onEditInConstructor={handleEditInConstructor}
        />
      {/if}
    </div>
  </div>
</CreatePanelDrawer>

<!-- Render help sheet outside drawer so it can be a true full-viewport overlay -->
<TransformHelpSheet
  show={showHelpSheet}
  onClose={() => (showHelpSheet = false)}
/>

<SequencePreviewDialog
  bind:isOpen={showConfirmDialog}
  currentSequence={ctx.constructTabState?.sequenceState?.currentSequence}
  incomingSequence={pendingSequenceTransfer}
  onConfirm={() => {
    performSequenceTransfer(pendingSequenceTransfer);
    pendingSequenceTransfer = null;
  }}
  onCancel={() => {
    pendingSequenceTransfer = null;
  }}
/>

<TurnPatternDrawer
  bind:isOpen={showTurnPatternDrawer}
  {sequence}
  onClose={() => (showTurnPatternDrawer = false)}
  onApply={handleTurnPatternApply}
/>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Compact header - saves ~60px vs separate header rows */
  .compact-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 4px 12px;
    background: rgba(15, 20, 30, 0.95);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    height: 52px;
    flex-shrink: 0;
  }

  .mode-toggle {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .mode-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 0 12px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid transparent;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.15s ease;
    height: 52px;
    min-width: 52px;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mode-btn.active {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
    color: #06b6d4;
  }

  .mode-btn i {
    font-size: 14px;
  }

  .beat-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    text-align: center;
    min-width: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.15s ease;
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .icon-btn.help {
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.6);
  }

  .icon-btn.help:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .icon-btn.close {
    background: linear-gradient(
      135deg,
      rgba(100, 100, 120, 0.85),
      rgba(70, 70, 90, 0.85)
    );
    color: white;
  }

  .icon-btn.close:hover {
    background: linear-gradient(
      135deg,
      rgba(120, 120, 140, 0.95),
      rgba(90, 90, 110, 0.95)
    );
  }

  /* Narrow screens: hide mode labels */
  @media (max-width: 400px) {
    .mode-label {
      display: none;
    }

    .mode-btn {
      padding: 0 10px;
      height: 48px;
      min-width: 48px;
    }

    .compact-header {
      padding: 2px 10px;
    }

    .icon-btn {
      width: 48px;
      height: 48px;
      font-size: 14px;
    }
  }

  /* Beat grid section - visible on mobile only, takes 50% height */
  .beat-grid-section {
    flex: 0 0 50%;
    min-height: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }

  /* Desktop (side-by-side): hide beat grid section */
  @media (min-width: 768px) {
    .beat-grid-section {
      display: none;
    }
  }

  /* Desktop preview section - shows pictograph above controls */
  .desktop-preview-section {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.15);
    flex: 1;
    min-height: 0;
  }

  .preview-pictograph {
    width: 100%;
    height: 100%;
    max-width: 280px;
    max-height: 280px;
    aspect-ratio: 1;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    overflow: hidden;
  }

  .controls-content {
    flex-shrink: 0;
    min-height: 180px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  /* When no preview section, controls can expand */
  .editor-panel:not(:has(.desktop-preview-section)) .controls-content {
    flex: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .icon-btn {
      transition: none;
    }
  }
</style>
