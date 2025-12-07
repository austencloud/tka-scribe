<!--
  GridSection.svelte - Beat Grid visualization wrapper for Practice tab

  Displays the BeatGrid component with proper aspect ratio and empty state.
  Used as one of the visualization panels in the Practice view.
-->
<script lang="ts">
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  interface Props {
    sequence: SequenceData | null;
    currentBeatIndex?: number;
    onBeatSelect?: (beatIndex: number) => void;
    onBrowseSequences?: () => void;
  }

  let {
    sequence = null,
    currentBeatIndex = 0,
    onBeatSelect,
    onBrowseSequences,
  }: Props = $props();

  // Handle beat click from BeatGrid - converts from 1-indexed beat number to 0-indexed
  function handleBeatClick(beatNumber: number) {
    // BeatGrid uses 1-indexed beat numbers, convert to 0-indexed for state
    const beatIndex = beatNumber - 1;
    onBeatSelect?.(beatIndex);
  }

  // Handle start position click - use -1 to represent start position
  function handleStartClick() {
    onBeatSelect?.(-1);
  }
</script>

<div class="grid-section">
  {#if sequence}
    <BeatGrid
      beats={sequence.beats}
      startPosition={sequence.startPosition}
      practiceBeatNumber={currentBeatIndex + 1}
      onBeatClick={handleBeatClick}
      onStartClick={handleStartClick}
    />
  {:else}
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-th"></i>
      </div>
      <p class="empty-text">No sequence selected</p>
      {#if onBrowseSequences}
        <button class="browse-btn" onclick={onBrowseSequences}>
          <i class="fas fa-folder-open"></i>
          Browse
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .grid-section {
    position: relative;
    width: 100%;
    height: 100%;
    aspect-ratio: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: transparent;
    border-radius: 12px;
    overflow: hidden;
    align-self: center;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 12px;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.15),
      rgba(139, 92, 246, 0.15)
    );
    border: 1px solid rgba(59, 130, 246, 0.25);
    border-radius: 12px;
    color: rgba(96, 165, 250, 0.8);
    font-size: 1.25rem;
  }

  .empty-text {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .browse-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 40px;
    padding: 0.5rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2),
      rgba(139, 92, 246, 0.2)
    );
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: rgba(147, 197, 253, 0.9);
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .browse-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.3),
      rgba(139, 92, 246, 0.3)
    );
    border-color: rgba(59, 130, 246, 0.5);
    transform: translateY(-1px);
  }
</style>
