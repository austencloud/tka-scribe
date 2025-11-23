<script lang="ts">
  import type { IHapticFeedbackService, BuildModeId } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { SequenceState } from "../../../state";
  import BeatGrid from "./BeatGrid.svelte";
  import WordLabel from "./WordLabel.svelte";
  // import WorkspaceHeader from "./WorkspaceHeader.svelte"; // Moved to TopBar

  let {
    sequenceState,
    onBeatSelected,
    onStartPositionSelected,
    onBeatDelete,
    selectedBeatNumber = null,
    practiceBeatNumber = null,
    isSideBySideLayout = false,
    isMultiSelectMode = false,
    selectedBeatNumbers = new Set<number>(),
    onBeatLongPress,
    onStartLongPress,
    activeMode = null,
  } = $props<{
    sequenceState: SequenceState;
    onBeatSelected?: (beatNumber: number) => void;
    onStartPositionSelected?: () => void;
    onBeatDelete?: (beatNumber: number) => void;
    selectedBeatNumber?: number | null; // 0=start, 1=first beat, 2=second beat, etc.
    practiceBeatNumber?: number | null; // 0=start, 1=first beat, 2=second beat, etc.
    isSideBySideLayout?: boolean;
    isMultiSelectMode?: boolean;
    selectedBeatNumbers?: Set<number>;
    onBeatLongPress?: (beatNumber: number) => void;
    activeMode?: BuildModeId | null;
    onStartLongPress?: () => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  // Initialize haptic service on mount
  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  const currentSequence = $derived(sequenceState.currentSequence);
  const selectedStartPosition = $derived(sequenceState.selectedStartPosition);
  const removingBeatIndex = $derived(sequenceState.getRemovingBeatIndex());
  const removingBeatIndices = $derived(sequenceState.getRemovingBeatIndices());
  const isClearing = $derived(sequenceState.getIsClearing());

  // Current word for display
  // In assembler/gestural modes, we don't show the word since sequences are built one hand at a time
  // In other modes (constructor, generator), we show the actual sequence word
  const currentWord = $derived.by(() => {
    const isAssemblyMode = activeMode === "assembler" || activeMode === "gestural";

    // In assembly mode, don't show a word (could show contextual info if needed)
    if (isAssemblyMode) {
      return ""; // Could be changed to show helpful info if desired
    }

    // For all other modes, show the sequence word
    return sequenceState.sequenceWord() ?? "";
  });

  // Convert selectedStartPosition (PictographData) to BeatData format for BeatGrid
  const startPositionBeat = $derived(() => {
    if (!selectedStartPosition) return null;

    // Create BeatData that extends the PictographData
    return {
      ...selectedStartPosition,
      beatNumber: 0,
      duration: 1000,
      blueReversal: false,
      redReversal: false,
      isBlank: false,
    };
  });

  function handleBeatClick(beatNumber: number) {
    hapticService?.trigger("selection");
    onBeatSelected?.(beatNumber);
  }

  function handleStartPositionClick() {
    hapticService?.trigger("selection");
    onStartPositionSelected?.();
  }
</script>

<div class="sequence-container">
  <div class="content-wrapper">
    <div class="label-and-beatframe-unit">
      <!-- Current word label above beat grid -->
      <div class="word-label-area">
        <WordLabel word={currentWord} scrollMode={false} />
      </div>

      <div class="beat-grid-wrapper">
        <BeatGrid
          beats={currentSequence?.beats ?? []}
          startPosition={startPositionBeat() ?? undefined}
          onBeatClick={handleBeatClick}
          onStartClick={handleStartPositionClick}
          {onBeatDelete}
          {selectedBeatNumber}
          {removingBeatIndex}
          {removingBeatIndices}
          {isClearing}
          {practiceBeatNumber}
          {isSideBySideLayout}
          {isMultiSelectMode}
          {selectedBeatNumbers}
          {onBeatLongPress}
          {onStartLongPress}
          {activeMode}
        />
      </div>
    </div>
  </div>
</div>

<style>
  .sequence-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    overflow: visible;
    padding: 0; /* Removed padding - parent SequenceDisplay handles top spacing for word label */
    box-sizing: border-box;
    transition: all 0.3s ease-out;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    transition: all 0.3s ease-out;
  }

  .label-and-beatframe-unit {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: 0;
    flex: 1 1 auto;
    min-height: 0;
    transition: all 0.3s ease-out;
  }

  .word-label-area {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
  }

  .beat-grid-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
    min-height: 0;
  }
</style>
