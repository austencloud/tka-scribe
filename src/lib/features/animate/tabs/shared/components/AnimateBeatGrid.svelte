<!--
  AnimateBeatGrid.svelte

  Read-only beat grid for displaying sequences in the Animate module.
  Shows pictographs with current beat highlighting.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { StartPositionData } from "../../../../create/shared/domain/models/StartPositionData";
  import type { BeatData } from "../../../../create/shared/domain/models/BeatData";
  import { isBeat } from "../../../../create/shared/domain/type-guards/pictograph-type-guards";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";

  // Props
  let {
    sequence,
    currentBeat = 0,
    customColors: _customColors = undefined,
  }: {
    sequence: SequenceData;
    currentBeat?: number;
    customColors?: {
      blue: string;
      red: string;
    };
  } = $props();

  // All beats including start position
  const allBeats = $derived.by(() => {
    const beats: (BeatData | StartPositionData)[] = [];

    // Add start position if it exists
    if (sequence.startPosition) {
      beats.push(sequence.startPosition);
    } else if (sequence.startingPositionBeat) {
      // Fallback to startingPositionBeat
      beats.push(sequence.startingPositionBeat);
    }

    // Add all sequence beats
    beats.push(...(sequence.beats || []));

    console.log(
      `AnimateBeatGrid: ${sequence.word} has ${beats.length} total beats`
    );
    return beats;
  });

  // Determine if a beat is the current one being animated
  function isCurrentBeat(index: number): boolean {
    return index === currentBeat;
  }

  // Get beat number for display
  function getBeatNumber(index: number): string {
    if (index === 0) return "S"; // Start
    return index.toString();
  }
</script>

<div class="animate-beat-grid">
  {#if allBeats.length === 0}
    <div class="no-beats-message">
      <i class="fas fa-info-circle"></i>
      <p>No beats in this sequence</p>
    </div>
  {:else}
    {#each allBeats as beat, index}
      <div class="beat-cell" class:current={isCurrentBeat(index)}>
        <div class="beat-number">{getBeatNumber(index)}</div>
        <div class="pictograph-container">
          {#if beat && (!isBeat(beat) || !beat.isBlank)}
            <Pictograph
              pictographData={beat}
              showTKA={false}
              showVTG={false}
              showElemental={false}
              showPositions={false}
            />
          {:else}
            <div class="empty-beat">
              <i class="fas fa-plus"></i>
            </div>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .animate-beat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-md, 12px);
    background: rgba(255, 255, 255, 0.03);
    border-radius: var(--border-radius-md, 8px);
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }

  .beat-cell {
    position: relative;
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-sm, 4px);
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .beat-cell.current {
    border-color: #ec4899;
    box-shadow: 0 0 12px rgba(236, 72, 153, 0.6);
    background: rgba(236, 72, 153, 0.1);
  }

  .beat-number {
    position: absolute;
    top: 4px;
    left: 4px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    z-index: 10;
  }

  .beat-cell.current .beat-number {
    background: #ec4899;
  }

  .pictograph-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .empty-beat {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    opacity: 0.3;
  }

  .empty-beat i {
    font-size: 1.5rem;
  }

  .no-beats-message {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-xl);
    opacity: 0.5;
  }

  .no-beats-message i {
    font-size: 2rem;
  }

  .no-beats-message p {
    margin: 0;
    font-size: 0.875rem;
  }
</style>
