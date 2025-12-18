<script lang="ts">
  /**
   * TrackHeader - Track name and controls (mute, solo, lock)
   *
   * Displayed to the left of each track lane.
   */

  import type { TimelineTrack } from "../domain/timeline-types";
  import { getTimelineState } from "../state/timeline-state.svelte";

  interface Props {
    track: TimelineTrack;
  }

  let { track }: Props = $props();

  function getState() {
    return getTimelineState();
  }

  // Local reactive state
  let hasSoloedTrack = $state(false);
  let isDimmed = $state(false);
  let trackCount = $state(1);

  // Sync local state from timeline state
  $effect(() => {
    const state = getState();
    hasSoloedTrack = state.project.tracks.some((t) => t.solo);
    isDimmed = hasSoloedTrack && !track.solo;
    trackCount = state.project.tracks.length;
  });

  // Editable name
  let isEditing = $state(false);
  let editValue = $state(track.name);

  function startEdit() {
    editValue = track.name;
    isEditing = true;
  }

  function confirmEdit() {
    if (editValue.trim()) {
      getState().updateTrack(track.id, { name: editValue.trim() });
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter") {
      confirmEdit();
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  }
</script>

<div
  class="track-header"
  class:dimmed={isDimmed}
  style="height: {track.height}px; --track-color: {track.color}"
>
  <!-- Color indicator -->
  <div class="color-indicator"></div>

  <!-- Track name -->
  <div class="track-name" ondblclick={startEdit}>
    {#if isEditing}
      <input
        type="text"
        class="name-input"
        bind:value={editValue}
        onblur={confirmEdit}
        onkeydown={handleKeyDown}
        autofocus
      />
    {:else}
      <span class="name-text">{track.name}</span>
    {/if}
  </div>

  <!-- Track controls -->
  <div class="track-controls">
    <!-- Mute -->
    <button
      class="track-btn"
      class:active={track.muted}
      onclick={() => getState().setTrackMuted(track.id, !track.muted)}
      title="Mute track (M)"
      aria-label={track.muted ? "Unmute track" : "Mute track"}
    >
      M
    </button>

    <!-- Solo -->
    <button
      class="track-btn solo"
      class:active={track.solo}
      onclick={() => getState().setTrackSolo(track.id, !track.solo)}
      title="Solo track (S)"
      aria-label={track.solo ? "Unsolo track" : "Solo track"}
    >
      S
    </button>

    <!-- Lock -->
    <button
      class="track-btn"
      class:active={track.locked}
      onclick={() => getState().updateTrack(track.id, { locked: !track.locked })}
      title="Lock track"
      aria-label={track.locked ? "Unlock track" : "Lock track"}
    >
      <i class="fa-solid fa-lock" style="font-size: 9px"></i>
    </button>

    <!-- Delete button (shown on hover) -->
    {#if trackCount > 1}
      <button
        class="delete-btn"
        onclick={() => getState().removeTrack(track.id)}
        title="Delete track"
        aria-label="Delete track"
      >
        <i class="fa-solid fa-trash"></i>
      </button>
    {/if}
  </div>
</div>

<style>
  .track-header {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    background: #16161e;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: opacity 0.2s ease;
    position: relative;
  }

  .track-header.dimmed {
    opacity: 0.5;
  }

  .color-indicator {
    width: 4px;
    height: 60%;
    border-radius: 2px;
    background: var(--track-color, #868e96);
    flex-shrink: 0;
  }

  .track-name {
    flex: 1;
    min-width: 0;
    cursor: text;
  }

  .name-text {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .name-input {
    width: 100%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--theme-accent, #4a9eff);
    border-radius: 3px;
    padding: 2px 4px;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text, white);
    outline: none;
  }

  .track-controls {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
  }

  .track-btn {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: none;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    font-size: 9px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
    flex-shrink: 0;
  }

  .track-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .track-btn.active {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  .track-btn.solo.active {
    background: #ffd43b;
    color: #1a1a1a;
  }

  .delete-btn {
    width: 18px;
    height: 18px;
    border-radius: 3px;
    border: none;
    background: transparent;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.3));
    cursor: pointer;
    font-size: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.15s ease;
    flex-shrink: 0;
    margin-left: 2px;
  }

  .track-header:hover .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: rgba(255, 68, 68, 0.2);
    color: #ff4444;
  }
</style>
