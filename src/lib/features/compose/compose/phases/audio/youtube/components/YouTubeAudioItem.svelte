<script lang="ts">
  /**
   * YouTubeAudioItem
   *
   * Library item row with load/download and delete actions.
   */

  import type { YouTubeAudioTrackLocal } from "../domain/models/YouTubeAudioTrack";
  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";

  interface Props {
    track: YouTubeAudioTrackLocal;
    onLoad: () => void;
    onDelete: () => void;
  }

  let { track, onLoad, onDelete }: Props = $props();

  let isExtracting = $derived(
    youtubeAudioState.extractingVideo?.videoId === track.videoId
  );

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function formatFileSize(bytes?: number): string {
    if (!bytes) return "";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  }
</script>

<div class="audio-item" class:extracting={isExtracting}>
  <img src={track.thumbnailUrl} alt={track.title} class="thumbnail" />

  <div class="info">
    <h3 class="title">{track.title}</h3>
    <div class="meta">
      <span class="channel">{track.channelName}</span>
      <span class="separator">•</span>
      <span class="duration">{formatDuration(track.duration)}</span>
      {#if track.fileSize}
        <span class="separator">•</span>
        <span class="size">{formatFileSize(track.fileSize)}</span>
      {/if}
    </div>
    <div class="status">
      {#if track.isLocallyAvailable}
        <span class="status-badge local">
          <i class="fas fa-check-circle"></i>
          Cached locally
        </span>
      {:else}
        <span class="status-badge cloud">
          <i class="fas fa-cloud"></i>
          Needs download
        </span>
      {/if}
      <span class="added-date">Added {formatDate(track.addedAt)}</span>
    </div>
  </div>

  <div class="actions">
    <button
      class="action-btn load"
      onclick={onLoad}
      disabled={isExtracting}
      title={track.isLocallyAvailable ? "Load audio" : "Download audio"}
    >
      {#if isExtracting}
        <i class="fas fa-spinner fa-spin"></i>
      {:else if track.isLocallyAvailable}
        <i class="fas fa-play"></i>
      {:else}
        <i class="fas fa-download"></i>
      {/if}
    </button>
    <button
      class="action-btn delete"
      onclick={onDelete}
      disabled={isExtracting}
      title="Remove from library"
    >
      <i class="fas fa-trash"></i>
    </button>
  </div>
</div>

<style>
  .audio-item {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-md, 12px);
    padding: var(--settings-spacing-sm, 8px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: var(--settings-radius-md, 8px);
    transition: all 0.15s ease;
  }

  .audio-item:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-hover, rgba(255, 255, 255, 0.15));
  }

  .audio-item.extracting {
    opacity: 0.7;
    pointer-events: none;
  }

  .thumbnail {
    width: 64px;
    height: 36px;
    object-fit: cover;
    border-radius: var(--settings-radius-sm, 4px);
    flex-shrink: 0;
  }

  .info {
    flex: 1;
    min-width: 0;
  }

  .title {
    margin: 0;
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    color: var(--theme-text, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 2px;
    font-size: var(--font-size-xs, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
  }

  .separator {
    opacity: 0.5;
  }

  .status {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
    margin-top: 4px;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: var(--font-size-xs, 11px);
    font-weight: 500;
  }

  .status-badge.local {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .status-badge.cloud {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .added-date {
    font-size: var(--font-size-xs, 11px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
  }

  .actions {
    display: flex;
    gap: var(--settings-spacing-xs, 4px);
    flex-shrink: 0;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: var(--settings-radius-sm, 6px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn:hover:not(:disabled) {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .action-btn.load:hover:not(:disabled) {
    border-color: var(--theme-accent, #8b5cf6);
    color: var(--theme-accent, #8b5cf6);
  }

  .action-btn.delete:hover:not(:disabled) {
    border-color: var(--semantic-error, #ef4444);
    color: var(--semantic-error, #ef4444);
  }
</style>
