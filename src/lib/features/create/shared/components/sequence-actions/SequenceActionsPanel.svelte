<!--
  SequenceActionsPanel.svelte

  Panel for sequence-wide operations: transforms, patterns, autocomplete.
  Individual beat editing (turns, rotation) is handled by BeatEditorPanel.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import type {
    IAutocompleter,
    AutocompleteAnalysis,
  } from "../../services/contracts/IAutocompleter";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import { openSpotlightWithBeatGrid } from "$lib/shared/application/state/ui/ui-state.svelte";
  import { toast } from "$lib/shared/toast/state/toast-state.svelte";
  import { areSequencesEqual } from "../../utils/sequence-comparison";
  import { CAPType } from "$lib/features/create/generate/circular/domain/models/circular-models";
  import { isAdmin } from "$lib/shared/auth/state/authState.svelte";

  import CreatePanelDrawer from "../CreatePanelDrawer.svelte";
  import SequencePreviewDialog from "./SequencePreviewDialog.svelte";
  import TransformsGridMode from "./TransformsGridMode.svelte";
  import TransformHelpSheet from "../transform-help/TransformHelpSheet.svelte";
  import TurnPatternDrawer from "./TurnPatternDrawer.svelte";
  import RotationDirectionDrawer from "./RotationDirectionDrawer.svelte";
  import AutocompleteDrawer from "./AutocompleteDrawer.svelte";
  import BeatGridSection from "./BeatGridSection.svelte";
  import ShiftStartConfirmDialog from "./ShiftStartConfirmDialog.svelte";
  import { setGridRotationDirection } from "$lib/shared/pictograph/grid/state/grid-rotation-state.svelte";

  interface Props {
    show: boolean;
    onClose?: () => void;
  }

  let { show, onClose }: Props = $props();

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

  // Track viewport width reactively for compact mode detection
  let viewportWidth = $state(typeof window !== 'undefined' ? window.innerWidth : 1000);

  $effect(() => {
    if (typeof window === 'undefined') return;
    viewportWidth = window.innerWidth; // Update on mount
    const handleResize = () => { viewportWidth = window.innerWidth; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  // Compact mode for mobile portrait - horizontal icon+text layout
  // Applies to most mobile widths, disabled at tablet/desktop widths
  const useCompactMode = $derived(!isSideBySideLayout && viewportWidth < 600);

  // Panel height for drawer content
  const panelHeight = $derived(
    panelState.navigationBarHeight + panelState.toolPanelHeight
  );

  // Services
  let hapticService: IHapticFeedback | null = $state(null);
  let Autocompleter: IAutocompleter | null = $state(null);

  // Local state - $effect below handles initial and prop changes
  let isOpen = $state(false);
  let isTransforming = $state(false);
  let showConfirmDialog = $state(false);
  let pendingSequenceTransfer = $state<any>(null);
  let showHelpSheet = $state(false);
  let showTurnPatternDrawer = $state(false);
  let showRotationDirectionDrawer = $state(false);
  let showAutocompleteDrawer = $state(false);
  let autocompleteAnalysis = $state<AutocompleteAnalysis | null>(null);
  let isAutocompleting = $state(false);
  let showShiftConfirmDialog = $state(false);
  let pendingShiftBeatNumber = $state<number | null>(null);

  // Shift start mode uses panelState for cross-component coordination
  const isShiftStartMode = $derived(panelState.isShiftStartMode);

  // Sync isOpen with show prop
  $effect(() => {
    isOpen = show;
  });

  // Beat selection state (for displaying in beat grid)
  const selectedBeatNumber = $derived(activeSequenceState.selectedBeatNumber);
  const hasSelection = $derived(selectedBeatNumber !== null);

  // Autocomplete availability - check if sequence can be completed
  const canAutocomplete = $derived.by(() => {
    if (!sequence || !Autocompleter) return false;
    try {
      const analysis = Autocompleter.analyzeSequence(sequence);
      return analysis.canComplete;
    } catch {
      return false;
    }
  });

  // Shift start availability - need at least 2 beats
  const canShiftStart = $derived(
    !!(sequence && sequence.beats && sequence.beats.length >= 2)
  );

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedback>(
        TYPES.IHapticFeedback
      );
    } catch {
      /* Optional service */
    }
    try {
      Autocompleter = resolve<IAutocompleter>(
        TYPES.IAutocompleter
      );
    } catch {
      /* Optional service */
    }
  });

  // Transform helper - eliminates boilerplate across all transform handlers
  async function withTransform(action: () => Promise<void>, beforeAction?: () => void) {
    if (!sequence || isTransforming) return;
    isTransforming = true;
    hapticService?.trigger("selection");
    beforeAction?.();
    try {
      await action();
    } finally {
      isTransforming = false;
    }
  }

  // Transform handlers - clean one-liners using the helper
  const handleMirror = () => withTransform(() => activeSequenceState.mirrorSequence());
  const handleSwap = () => withTransform(() => activeSequenceState.swapColors());
  const handleRewind = () => withTransform(() => activeSequenceState.rewindSequence());
  const handleFlip = () => withTransform(() => activeSequenceState.flipSequence());
  const handleInvert = () => withTransform(() => activeSequenceState.invertSequence());

  // Rotation handlers set grid animation direction before transform
  const handleRotateCW = () => withTransform(
    () => activeSequenceState.rotateSequence("clockwise"),
    () => setGridRotationDirection(1)
  );
  const handleRotateCCW = () => withTransform(
    () => activeSequenceState.rotateSequence("counterclockwise"),
    () => setGridRotationDirection(-1)
  );

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

  function handleTurnPatternApply(result: {
    sequence: any;
    warnings?: readonly string[];
  }) {
    // Update the active sequence with the pattern-applied sequence
    activeSequenceState.setCurrentSequence(result.sequence);
    hapticService?.trigger("success");
  }

  function handleRotationDirection() {
    hapticService?.trigger("selection");
    showRotationDirectionDrawer = true;
  }

  function handleRotationDirectionApply(result: {
    sequence: any;
    warnings?: readonly string[];
  }) {
    // Update the active sequence with the pattern-applied sequence
    activeSequenceState.setCurrentSequence(result.sequence);
    hapticService?.trigger("success");
  }

  function handleAutocomplete() {
    if (!sequence || !Autocompleter) return;
    hapticService?.trigger("selection");

    // Analyze the sequence to get available CAP options
    const analysis = Autocompleter.analyzeSequence(sequence);

    if (!analysis.canComplete) {
      toast.warning("Cannot autocomplete this sequence");
      return;
    }

    // Store the analysis and show the drawer
    autocompleteAnalysis = analysis;
    showAutocompleteDrawer = true;
  }

  async function handleAutocompleteApply(capType: CAPType) {
    if (!sequence || !Autocompleter || isAutocompleting) return;
    isAutocompleting = true;
    hapticService?.trigger("selection");

    try {
      const completedSequence = await Autocompleter.autocompleteSequence(
        sequence,
        { capType }
      );

      if (completedSequence.beats?.length === sequence.beats?.length) {
        console.warn("[Autocomplete] No new beats were added!");
        toast.warning("No completion beats generated");
        return;
      }

      activeSequenceState.setCurrentSequence(completedSequence);
      hapticService?.trigger("success");
      toast.success(
        `Completed with ${capType.replace(/_/g, " ")}! Added ${(completedSequence.beats?.length || 0) - (sequence.beats?.length || 0)} beats`
      );

      // Close the drawer on success
      showAutocompleteDrawer = false;
      autocompleteAnalysis = null;
    } catch (error) {
      console.error("[Autocomplete] Failed:", error);
      toast.error("Could not complete sequence");
      hapticService?.trigger("error");
    } finally {
      isAutocompleting = false;
    }
  }

  function handleEditInConstructor() {
    if (!sequence) return;
    hapticService?.trigger("selection");

    const constructTabState = ctx.constructTabState;
    if (!constructTabState?.sequenceState) return;

    const currentConstructorSequence =
      constructTabState.sequenceState.currentSequence;

    // Check if sequences are identical - if so, skip modal and just navigate
    if (areSequencesEqual(sequence, currentConstructorSequence)) {
      toast.info("Sequence already loaded in Constructor");
      handleClose();
      navigationState.setActiveTab("constructor");
      return;
    }

    // Different sequences - show modal if constructor has content
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

    // CRITICAL: Save to persistence BEFORE switching tabs!
    // Otherwise restoreStateForTab will load the OLD persisted sequence and overwrite our new one
    await constructTabState.sequenceState.saveCurrentState("constructor");

    // Close panel and switch tab AFTER state is saved
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
    // Opening Beat Editor is handled by the auto-open effect
  }

  function handleOpenBeatEditor() {
    hapticService?.trigger("selection");
    panelState.openBeatEditorPanel();
  }

  function handleShiftStart() {
    if (!sequence || !canShiftStart) return;
    hapticService?.trigger("selection");
    panelState.enterShiftStartMode(handleShiftStartBeatSelect);
    toast.info("Tap the beat you want to play first — it will become Beat 1");
  }

  function handleShiftStartBeatSelect(beatNumber: number) {
    if (!sequence || beatNumber < 1) return;
    hapticService?.trigger("selection");

    // No-op if selecting beat 1
    if (beatNumber === 1) {
      toast.info("That's already Beat 1");
      panelState.exitShiftStartMode();
      return;
    }

    // For circular sequences, shift immediately
    if (sequence.isCircular) {
      executeShiftStart(beatNumber);
    } else {
      // For non-circular, show confirmation
      pendingShiftBeatNumber = beatNumber;
      showShiftConfirmDialog = true;
    }
  }

  async function executeShiftStart(beatNumber: number) {
    if (!sequence || isTransforming) return;
    isTransforming = true;

    try {
      await activeSequenceState.shiftStartPosition(beatNumber);
      const beatsRemoved = sequence.isCircular ? 0 : beatNumber - 1;
      if (beatsRemoved > 0) {
        toast.success(
          `Shifted start. Removed ${beatsRemoved} beat${beatsRemoved > 1 ? "s" : ""}.`
        );
      } else {
        toast.success(`Beat ${beatNumber} is now beat 1`);
      }
      hapticService?.trigger("success");
    } catch (error) {
      console.error("[ShiftStart] Failed:", error);
      toast.error("Could not shift start position");
      hapticService?.trigger("error");
    } finally {
      isTransforming = false;
      panelState.exitShiftStartMode();
      pendingShiftBeatNumber = null;
      showShiftConfirmDialog = false;
    }
  }

  function cancelShiftStart() {
    panelState.exitShiftStartMode();
    pendingShiftBeatNumber = null;
    showShiftConfirmDialog = false;
  }

  async function handleCopySequenceJson() {
    if (!sequence) return;
    hapticService?.trigger("selection");

    try {
      // Create minimal representation - strip placement data fluff
      const minimalSequence = {
        name: sequence.name,
        word: sequence.word,
        isCircular: sequence.isCircular,
        gridMode: sequence.gridMode,
        propType: sequence.propType,
        startPosition: minimalBeat(
          sequence.startPosition || sequence.startingPositionBeat
        ),
        beats: sequence.beats.map(minimalBeat),
      };

      const jsonString = JSON.stringify(minimalSequence, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success("Sequence JSON copied to clipboard");
    } catch (error) {
      console.error("Failed to copy sequence JSON:", error);
      toast.error("Failed to copy to clipboard");
    }
  }

  function minimalMotion(motion: any) {
    if (!motion) return null;
    return {
      type: motion.motionType,
      dir: motion.rotationDirection,
      start: motion.startLocation,
      end: motion.endLocation,
      turns: motion.turns,
      startOri: motion.startOrientation,
      endOri: motion.endOrientation,
    };
  }

  function minimalBeat(beat: any) {
    if (!beat) return null;
    return {
      beat: beat.beatNumber,
      letter: beat.letter,
      start: beat.startPosition,
      end: beat.endPosition,
      blue: minimalMotion(beat.motions?.blue),
      red: minimalMotion(beat.motions?.red),
    };
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
  ariaLabel="Sequence actions panel"
  onClose={handleClose}
>
  <div class="editor-panel">
    <!-- Simple header with title and actions -->
    <div class="compact-header">
      <h2 class="panel-title">Sequence Actions</h2>

      <div class="header-actions">
        {#if isAdmin() && hasSequence}
          <button
            class="icon-btn copy"
            onclick={handleCopySequenceJson}
            aria-label="Copy sequence JSON"
            title="Copy sequence JSON"
          >
            <i class="fas fa-code" aria-hidden="true"></i>
          </button>
        {/if}
        <button
          class="icon-btn help"
          onclick={() => (showHelpSheet = true)}
          aria-label="Help"
        >
          <i class="fas fa-circle-question" aria-hidden="true"></i>
        </button>
        <button class="icon-btn close" onclick={handleClose} aria-label="Close">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <!-- Beat grid display: shows on mobile at 50% height -->
    {#if hasSequence && isSideBySideLayout === false && sequence}
      <BeatGridSection
        beats={sequence.beats}
        startPosition={sequence.startPosition ||
          sequence.startingPositionBeat ||
          null}
        {selectedBeatNumber}
        isShiftMode={isShiftStartMode}
        onBeatClick={isShiftStartMode
          ? handleShiftStartBeatSelect
          : handleBeatSelect}
        onStartClick={() => (isShiftStartMode ? null : handleBeatSelect(0))}
        onBeatLongPress={handlePreview}
        onCancelShiftMode={cancelShiftStart}
      />
    {/if}

    <div class="controls-content">
      <TransformsGridMode
        {hasSequence}
        {hasSelection}
        {isTransforming}
        {canAutocomplete}
        {isAutocompleting}
        {canShiftStart}
        showEditInConstructor={!isInConstructTab}
        isDesktopPanel={isSideBySideLayout}
        compactMode={useCompactMode}
        onTurns={handleOpenBeatEditor}
        onMirror={handleMirror}
        onFlip={handleFlip}
        onInvert={handleInvert}
        onRotateCW={handleRotateCW}
        onRotateCCW={handleRotateCCW}
        onSwap={handleSwap}
        onRewind={handleRewind}
        onTurnPattern={handleTurnPattern}
        onRotationDirection={handleRotationDirection}
        onAutocomplete={handleAutocomplete}
        onShiftStart={handleShiftStart}
        onEditInConstructor={handleEditInConstructor}
      />
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

<RotationDirectionDrawer
  bind:isOpen={showRotationDirectionDrawer}
  {sequence}
  onClose={() => (showRotationDirectionDrawer = false)}
  onApply={handleRotationDirectionApply}
/>

<AutocompleteDrawer
  bind:isOpen={showAutocompleteDrawer}
  analysis={autocompleteAnalysis}
  isApplying={isAutocompleting}
  toolPanelWidth={panelState.toolPanelWidth}
  onClose={() => {
    showAutocompleteDrawer = false;
    autocompleteAnalysis = null;
  }}
  onApply={handleAutocompleteApply}
/>

<!-- Shift Start Confirmation Dialog (non-circular sequences) -->
<ShiftStartConfirmDialog
  show={showShiftConfirmDialog && pendingShiftBeatNumber !== null}
  beatNumber={pendingShiftBeatNumber ?? 1}
  onConfirm={() => executeShiftStart(pendingShiftBeatNumber!)}
  onCancel={cancelShiftStart}
/>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
  }

  /* Compact header */
  .compact-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(15, 20, 30, 0.95);
    border-bottom: 1px solid var(--theme-stroke);
    height: var(--min-touch-target);
    flex-shrink: 0;
  }

  .panel-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text);
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
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border-radius: 50%;
    cursor: pointer;
    font-size: var(--font-size-base);
    transition: all 0.15s ease;
    border: 1px solid var(--theme-stroke-strong);
  }

  .icon-btn.copy {
    background: rgba(59, 130, 246, 0.15);
    color: rgba(59, 130, 246, 0.8);
    border-color: rgba(59, 130, 246, 0.3);
  }

  .icon-btn.copy:hover {
    background: rgba(59, 130, 246, 0.25);
    color: rgba(59, 130, 246, 1);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .icon-btn.help {
    background: var(--theme-card-bg);
    color: var(--theme-text-dim);
  }

  .icon-btn.help:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--theme-text);
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

  /* Narrow screens */
  @media (max-width: 400px) {
    .compact-header {
      padding: 4px 10px;
    }

    .icon-btn {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: var(--font-size-sm);
    }
  }

  /* Note: Beat grid visibility is controlled by isSideBySideLayout in the template,
     not by CSS media queries. The JavaScript logic considers device type,
     orientation, and viewport dimensions for proper responsive behavior. */

  .controls-content {
    flex: 1;
    min-height: 180px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    .icon-btn {
      transition: none;
    }
  }
</style>
