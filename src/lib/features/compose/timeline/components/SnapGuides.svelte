<script lang="ts">
  /**
   * SnapGuides - Visual indicators for snap points
   *
   * Shows vertical lines when clips are being dragged near snap points.
   * Provides visual feedback for beat markers, clip edges, grid, and playhead.
   */

  import { getTimelineState } from "../state/timeline-state.svelte";
  import { timeToPixels, type TimeSeconds } from "../domain/timeline-types";
  import { generateBeatTimestamps } from "$lib/features/compose/compose/phases/audio/bpm-analyzer";

  interface Props {
    /** Active snap point (shown when dragging) */
    activeSnapTime: TimeSeconds | null;
    /** Height of the timeline tracks area */
    height: number;
  }

  let { activeSnapTime, height }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Local reactive state (synced via effects)
  let beatMarkers = $state<TimeSeconds[]>([]);
  let downbeats = $state<TimeSeconds[]>([]);
  let gridLines = $state<TimeSeconds[]>([]);
  let clipEdges = $state<TimeSeconds[]>([]);
  let activeSnapX = $state<number | null>(null);
  let pixelsPerSecond = $state(50);
  let playheadPosition = $state(0);
  let snapToBeats = $state(false);

  // Sync local state from timeline state
  $effect(() => {
    const state = getState();
    pixelsPerSecond = state.viewport.pixelsPerSecond;
    playheadPosition = state.playhead.position;
    snapToBeats = state.project.snap.snapToBeats;

    // Generate beat markers from audio BPM
    if (state.project.audio.bpm && state.project.audio.duration && state.project.snap.snapToBeats) {
      beatMarkers = generateBeatTimestamps(state.project.audio.bpm, state.project.audio.duration);
      downbeats = beatMarkers.filter((_, i) => i % 4 === 0);
    } else {
      beatMarkers = [];
      downbeats = [];
    }

    // Grid lines based on interval
    if (state.project.snap.snapToGrid) {
      const lines: TimeSeconds[] = [];
      const interval = state.project.snap.gridInterval;
      const maxTime = state.totalDuration + 10;
      for (let t = 0; t <= maxTime; t += interval) {
        lines.push(t);
      }
      gridLines = lines;
    } else {
      gridLines = [];
    }

    // Clip edges
    if (state.project.snap.snapToClips) {
      const edges: TimeSeconds[] = [];
      for (const track of state.project.tracks) {
        for (const clip of track.clips) {
          edges.push(clip.startTime);
          edges.push(clip.startTime + clip.duration);
        }
      }
      clipEdges = [...new Set(edges)];
    } else {
      clipEdges = [];
    }

    // Active snap position in pixels
    activeSnapX = activeSnapTime !== null
      ? timeToPixels(activeSnapTime, pixelsPerSecond)
      : null;
  });

  // Determine snap type for styling
  function getSnapType(time: TimeSeconds): "beat" | "clip" | "grid" | "playhead" {
    if (Math.abs(time - playheadPosition) < 0.01) return "playhead";
    if (downbeats.includes(time)) return "beat";
    if (clipEdges.includes(time)) return "clip";
    return "grid";
  }
</script>

<div class="snap-guides" style="height: {height}px">
  <!-- Beat marker guides (subtle, always visible when snapping to beats) -->
  {#if snapToBeats}
    {#each downbeats as beatTime}
      {@const x = timeToPixels(beatTime, pixelsPerSecond)}
      <div
        class="snap-guide beat"
        style="left: {x}px; height: {height}px"
      ></div>
    {/each}
  {/if}

  <!-- Grid guides (subtle, always visible when snapping to grid) -->
  {#if gridLines.length > 0}
    {#each gridLines as gridTime}
      {@const x = timeToPixels(gridTime, pixelsPerSecond)}
      <div
        class="snap-guide grid"
        style="left: {x}px; height: {height}px"
      ></div>
    {/each}
  {/if}

  <!-- Active snap indicator (bright, shown during drag) -->
  {#if activeSnapX !== null && activeSnapTime !== null}
    {@const snapType = getSnapType(activeSnapTime)}
    <div
      class="snap-guide active {snapType}"
      style="left: {activeSnapX}px; height: {height}px"
    >
      <div class="snap-label">{activeSnapTime.toFixed(2)}s</div>
    </div>
  {/if}
</div>

<style>
  .snap-guides {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  }

  .snap-guide {
    position: absolute;
    top: 0;
    width: 1px;
    transition: opacity 0.1s ease;
  }

  /* Beat marker guides - purple */
  .snap-guide.beat {
    background: rgba(139, 92, 246, 0.15);
  }

  /* Grid guides - gray */
  .snap-guide.grid {
    background: rgba(255, 255, 255, 0.05);
  }

  /* Clip edge guides - blue */
  .snap-guide.clip {
    background: rgba(74, 158, 255, 0.15);
  }

  /* Active snap indicator - bright and prominent */
  .snap-guide.active {
    width: 2px;
    z-index: 10;
  }

  .snap-guide.active.beat {
    background: rgba(139, 92, 246, 0.8);
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
  }

  .snap-guide.active.clip {
    background: rgba(74, 158, 255, 0.8);
    box-shadow: 0 0 8px rgba(74, 158, 255, 0.6);
  }

  .snap-guide.active.grid {
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
  }

  .snap-guide.active.playhead {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  }

  .snap-label {
    position: absolute;
    top: 4px;
    left: 6px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    color: white;
    white-space: nowrap;
  }
</style>
