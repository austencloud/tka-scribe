<script lang="ts">
  /**
   * TrackLane - A horizontal lane containing clips
   *
   * Renders clips positioned along the timeline.
   * Handles clip interactions (click to select, drag to move).
   */

  import type { TimelineTrack } from "../domain/timeline-types";
  import { getTimelineState } from "../state/timeline-state.svelte";
  import TimelineClip from "./TimelineClip.svelte";
  import { timeToPixels } from "../domain/timeline-types";

  interface Props {
    track: TimelineTrack;
    pixelsPerSecond: number;
  }

  let { track, pixelsPerSecond }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Deduplicate clips by ID to prevent Svelte each_key_duplicate errors
  const deduplicatedClips = $derived.by(() => {
    const seenIds = new Set<string>();
    return track.clips.filter((clip) => {
      if (seenIds.has(clip.id)) {
        console.warn(`[TrackLane] Filtered duplicate clip ID: ${clip.id}`);
        return false;
      }
      seenIds.add(clip.id);
      return true;
    });
  });

  // Local reactive state
  let isDimmed = $state(false);
  let selectedClipIds = $state<string[]>([]);

  // Sync local state from timeline state
  $effect(() => {
    const state = getState();
    const hasSoloedTrack = state.project.tracks.some((t) => t.solo);
    isDimmed = track.muted || (hasSoloedTrack && !track.solo);
    selectedClipIds = state.selection.selectedClipIds;
  });

  // Handle drop of sequence onto track
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const data = e.dataTransfer?.getData("application/json");
    if (!data) return;

    try {
      const sequence = JSON.parse(data);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = x / pixelsPerSecond;
      getState().addClip(sequence, track.id, time);
    } catch (err) {
      console.error("Failed to parse dropped sequence:", err);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    e.dataTransfer!.dropEffect = "copy";
  }
</script>

<div
  class="track-lane"
  class:muted={track.muted}
  class:dimmed={isDimmed}
  class:locked={track.locked}
  style="height: {track.height}px"
  ondrop={handleDrop}
  ondragover={handleDragOver}
  role="list"
  aria-label="Track {track.name}"
>
  <!-- Grid lines (beat markers would go here) -->
  <div class="grid-lines"></div>

  <!-- Clips -->
  {#each deduplicatedClips as clip (clip.id)}
    <TimelineClip
      {clip}
      {pixelsPerSecond}
      selected={selectedClipIds.includes(clip.id)}
    />
  {/each}

  <!-- Lock overlay -->
  {#if track.locked}
    <div class="lock-overlay">
      <i class="fa-solid fa-lock"></i>
    </div>
  {/if}
</div>

<style>
  .track-lane {
    position: relative;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    transition: all 0.2s ease;
  }

  /* Alternating track colors for visual distinction */
  .track-lane:nth-child(odd) {
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
  }

  .track-lane.dimmed {
    opacity: 0.35;
  }

  .track-lane.locked {
    pointer-events: none;
  }

  .grid-lines {
    position: absolute;
    inset: 0;
    pointer-events: none;
    /* Subtle vertical grid lines using theme */
    background-image: repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent calc(100% - 1px),
      var(--theme-stroke, rgba(255, 255, 255, 0.08)) calc(100% - 1px),
      var(--theme-stroke, rgba(255, 255, 255, 0.08)) 100%
    );
    background-size: 50px 100%; /* Adjusts with zoom via parent */
  }

  .lock-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--theme-panel-bg, rgba(0, 0, 0, 0.6)) 70%, transparent);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: 24px;
    pointer-events: none;
  }
</style>
