<!--
  BeatMarkerTrack.svelte

  Overlay component that displays beat markers on the waveform timeline.
  Shows generated beat positions based on BPM, allows adding/removing markers.
-->
<script lang="ts">
  import type { BeatMarker } from "../../state/composition-state.svelte";
  import { generateBeatTimestamps } from "./bpm-analyzer";

  let {
    duration,
    bpm,
    currentTime = 0,
    beatMarkers = [],
    onAddMarker,
    onRemoveMarker,
  }: {
    duration: number;
    bpm: number | null;
    currentTime?: number;
    beatMarkers?: BeatMarker[];
    onAddMarker?: (marker: BeatMarker) => void;
    onRemoveMarker?: (id: string) => void;
  } = $props();

  // Generate beat positions based on BPM
  const generatedBeats = $derived(
    bpm && duration > 0 ? generateBeatTimestamps(bpm, duration) : []
  );

  // Get position percentage for a timestamp
  function getPositionPercent(time: number): number {
    return duration > 0 ? (time / duration) * 100 : 0;
  }

  // Find current beat index
  const currentBeatIndex = $derived(() => {
    if (!bpm || duration <= 0) return -1;
    const beatInterval = 60 / bpm;
    return Math.floor(currentTime / beatInterval);
  });

  // Add a custom marker at current playhead position
  function addMarkerAtPlayhead() {
    if (duration <= 0) return;

    const newMarker: BeatMarker = {
      id: `marker-${Date.now()}`,
      beat: Math.floor((currentTime / duration) * (generatedBeats.length || 1)),
      time: currentTime,
    };

    onAddMarker?.(newMarker);
  }

  // Check if a beat has a custom marker
  function hasCustomMarker(beatTime: number): BeatMarker | undefined {
    // Find marker within 0.1s tolerance
    return beatMarkers.find((m) => Math.abs(m.time - beatTime) < 0.1);
  }
</script>

<div class="beat-marker-track">
  <!-- Generated beat markers -->
  {#if generatedBeats.length > 0}
    <div class="beats-container">
      {#each generatedBeats as beatTime, index}
        {@const position = getPositionPercent(beatTime)}
        {@const isCurrentBeat = currentBeatIndex() === index}
        {@const customMarker = hasCustomMarker(beatTime)}
        <div
          class="beat-marker"
          class:current={isCurrentBeat}
          class:custom={customMarker}
          class:downbeat={index % 4 === 0}
          style="left: {position}%"
          title="Beat {index + 1} at {beatTime.toFixed(2)}s"
        >
          {#if index % 4 === 0}
            <span class="beat-number">{Math.floor(index / 4) + 1}</span>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-beats">
      <span>No BPM detected - beat markers unavailable</span>
    </div>
  {/if}

  <!-- Custom markers (user-added) -->
  {#if beatMarkers.length > 0}
    <div class="custom-markers">
      {#each beatMarkers as marker}
        <button
          class="custom-marker"
          style="left: {getPositionPercent(marker.time)}%"
          onclick={() => onRemoveMarker?.(marker.id)}
          title="Custom marker at {marker.time.toFixed(2)}s - click to remove"
        >
          <i class="fas fa-flag"></i>
        </button>
      {/each}
    </div>
  {/if}

  <!-- Playhead indicator -->
  <div
    class="playhead"
    style="left: {getPositionPercent(currentTime)}%"
  ></div>

  <!-- Controls -->
  <div class="track-controls">
    <button
      class="add-marker-btn"
      onclick={addMarkerAtPlayhead}
      disabled={duration <= 0}
      title="Add marker at current position"
    >
      <i class="fas fa-plus"></i>
      Add Marker
    </button>
    <span class="marker-count">
      {beatMarkers.length} custom marker{beatMarkers.length !== 1 ? "s" : ""}
    </span>
  </div>
</div>

<style>
  .beat-marker-track {
    position: relative;
    width: 100%;
    height: 48px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    margin-top: 0.5rem;
    overflow: hidden;
  }

  .beats-container {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .beat-marker {
    position: absolute;
    top: 0;
    width: 1px;
    height: 100%;
    background: rgba(139, 92, 246, 0.3);
    transition: background 0.1s ease;
  }

  .beat-marker.downbeat {
    width: 2px;
    background: rgba(139, 92, 246, 0.5);
  }

  .beat-marker.current {
    background: rgba(167, 139, 250, 0.9);
    box-shadow: 0 0 4px rgba(167, 139, 250, 0.5);
  }

  .beat-marker.custom {
    background: rgba(251, 191, 36, 0.7);
  }

  .beat-number {
    position: absolute;
    top: 2px;
    left: 4px;
    font-size: 0.65rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    user-select: none;
  }

  .no-beats {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
  }

  .custom-markers {
    position: absolute;
    inset: 0;
    z-index: 2;
  }

  .custom-marker {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(251, 191, 36, 0.2);
    border: 1px solid rgba(251, 191, 36, 0.5);
    border-radius: 50%;
    color: rgba(251, 191, 36, 0.9);
    font-size: 0.6rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .custom-marker:hover {
    background: rgba(251, 191, 36, 0.3);
    border-color: rgba(251, 191, 36, 0.8);
    transform: translate(-50%, -50%) scale(1.15);
  }

  .playhead {
    position: absolute;
    top: 0;
    width: 2px;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    z-index: 3;
    pointer-events: none;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
  }

  .track-controls {
    position: absolute;
    bottom: 4px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    z-index: 4;
  }

  .add-marker-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.25rem 0.5rem;
    background: rgba(139, 92, 246, 0.2);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 4px;
    color: rgba(167, 139, 250, 0.9);
    font-size: 0.7rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-marker-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .add-marker-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .marker-count {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
