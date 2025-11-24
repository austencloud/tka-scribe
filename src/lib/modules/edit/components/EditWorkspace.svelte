<!--
  EditWorkspace.svelte

  Displays the sequence being edited with selectable beats.
  Reuses the existing BeatGrid component from the Create module.
-->
<script lang="ts">
  import { resolve, TYPES, type BeatData, type SequenceData } from "$shared";
  import type { StartPositionData } from "$create/shared";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import type { ISequenceNormalizationService } from "$lib/modules/animate/services/contracts";
  import { onMount } from "svelte";

  interface Props {
    sequence: SequenceData | null;
    selectedBeatNumber: number | null;
    selectedBeatNumbers: number[];
    onBeatSelect: (beatNumber: number, beatData: BeatData | null) => void;
    onBeatMultiSelect: (beatNumber: number) => void;
    onChangeSequence?: () => void;
  }

  let {
    sequence,
    selectedBeatNumber,
    selectedBeatNumbers,
    onBeatSelect,
    onBeatMultiSelect,
    onChangeSequence,
  }: Props = $props();

  // Service for normalizing sequence data
  let normalizationService: ISequenceNormalizationService | null = $state(null);

  onMount(() => {
    try {
      normalizationService = resolve<ISequenceNormalizationService>(
        TYPES.ISequenceNormalizationService
      );
    } catch (error) {
      console.warn("EditWorkspace: Failed to resolve ISequenceNormalizationService:", error);
    }
  });

  // Normalize sequence data (separate beats from startPosition)
  const normalizedData = $derived.by(() => {
    if (!sequence || !normalizationService) {
      return { beats: sequence?.beats ?? [], startPosition: sequence?.startPosition ?? sequence?.startingPositionBeat ?? null };
    }
    return normalizationService.separateBeatsFromStartPosition(sequence);
  });

  // Get beats and start position
  const beats = $derived(normalizedData.beats);
  const startPosition = $derived<StartPositionData | BeatData | null>(normalizedData.startPosition);

  // Convert selectedBeatNumbers array to Set for BeatGrid
  const selectedBeatNumbersSet = $derived(new Set(selectedBeatNumbers));

  // Handle beat click from BeatGrid
  function handleBeatClick(beatNumber: number) {
    const beatData = beatNumber === 0
      ? (startPosition as BeatData | null)
      : (beats[beatNumber - 1] ?? null);
    onBeatSelect(beatNumber, beatData);
  }

  // Handle start position click
  function handleStartClick() {
    onBeatSelect(0, startPosition as BeatData | null);
  }

  // Handle long press for multi-select
  function handleBeatLongPress(beatNumber: number) {
    onBeatMultiSelect(beatNumber);
  }

  function handleStartLongPress() {
    onBeatMultiSelect(0);
  }
</script>

<div class="edit-workspace">
  {#if sequence}
    <div class="sequence-header">
      <div class="header-left">
        <h3 class="sequence-name">{sequence.name || "Untitled Sequence"}</h3>
        <span class="beat-count">{beats.length} beats</span>
      </div>
      {#if onChangeSequence}
        <button class="change-sequence-btn" onclick={onChangeSequence} title="Change sequence" aria-label="Change sequence">
          <i class="fas fa-folder-open"></i>
        </button>
      {/if}
    </div>

    <div class="beat-grid-wrapper">
      <BeatGrid
        {beats}
        {startPosition}
        {selectedBeatNumber}
        selectedBeatNumbers={selectedBeatNumbersSet}
        onBeatClick={handleBeatClick}
        onStartClick={handleStartClick}
        onBeatLongPress={handleBeatLongPress}
        onStartLongPress={handleStartLongPress}
        isMultiSelectMode={selectedBeatNumbers.length > 0}
      />
    </div>

    <div class="workspace-hint">
      Click a beat to select. Long-press to multi-select.
    </div>
  {:else}
    <div class="no-sequence">
      No sequence loaded
    </div>
  {/if}
</div>

<style>
  .edit-workspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 12px;
    overflow: hidden;
  }

  .sequence-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .sequence-name {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .beat-count {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    flex-shrink: 0;
  }

  .change-sequence-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    color: #06b6d4;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .change-sequence-btn:hover {
    background: rgba(6, 182, 212, 0.2);
    border-color: rgba(6, 182, 212, 0.5);
  }

  /* Wrapper for the reused BeatGrid component */
  .beat-grid-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .workspace-hint {
    text-align: center;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    padding-top: 8px;
    flex-shrink: 0;
  }

  .no-sequence {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
