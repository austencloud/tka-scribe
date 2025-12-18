<script lang="ts">
  /**
   * YouTubeVideoCard
   *
   * Individual video result card with extract action.
   */

  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { YouTubeTypes } from "$lib/shared/inversify/types";
  import type { IYouTubeAudioService } from "../services/contracts/IYouTubeAudioService";
  import type { YouTubeVideo } from "../domain/models/YouTubeVideo";

  interface Props {
    video: YouTubeVideo;
    onSelect: () => void;
    onAudioReady: (audioBlob: Blob, metadata: { title: string; duration: number }) => void;
  }

  let { video, onSelect, onAudioReady }: Props = $props();

  let isExtracting = $derived(
    youtubeAudioState.extractingVideo?.videoId === video.videoId
  );

  async function handleExtract() {
    if (isExtracting) return;

    youtubeAudioState.startExtraction(video);

    try {
      const audioService = resolve<IYouTubeAudioService>(
        YouTubeTypes.IYouTubeAudioService
      );

      const result = await audioService.extractAudio(video, "medium", (progress) => {
        youtubeAudioState.updateExtractionProgress(progress);
      });

      youtubeAudioState.finishExtraction();

      if (result.success && result.audioBlob) {
        onAudioReady(result.audioBlob, {
          title: video.title,
          duration: video.durationSeconds,
        });
      }
    } catch (error) {
      youtubeAudioState.finishExtraction();
      console.error("Failed to extract audio:", error);
    }
  }
</script>

<div class="video-card" class:extracting={isExtracting}>
  <button class="card-button" onclick={handleExtract} disabled={isExtracting}>
    <div class="thumbnail-wrapper">
      <img
        src={video.thumbnailUrl}
        alt={video.title}
        class="thumbnail"
        loading="lazy"
      />
      <span class="duration">{video.durationFormatted}</span>
      {#if isExtracting}
        <div class="extracting-overlay">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      {:else}
        <div class="play-overlay">
          <i class="fas fa-music"></i>
        </div>
      {/if}
    </div>

    <div class="info">
      <h3 class="title">{video.title}</h3>
      <p class="channel">{video.channelName}</p>
    </div>
  </button>
</div>

<style>
  .video-card {
    border-radius: var(--settings-radius-md, 8px);
    overflow: hidden;
    transition: transform 0.15s ease;
  }

  .video-card:hover {
    transform: translateY(-2px);
  }

  .card-button {
    width: 100%;
    padding: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: var(--settings-radius-md, 8px);
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
  }

  .card-button:hover {
    border-color: var(--theme-accent, #8b5cf6);
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
  }

  .card-button:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .thumbnail-wrapper {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .duration {
    position: absolute;
    bottom: 6px;
    right: 6px;
    padding: 2px 6px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 4px;
    color: #ffffff;
    font-size: var(--font-size-xs, 12px);
    font-weight: 500;
  }

  .play-overlay,
  .extracting-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .card-button:hover .play-overlay,
  .extracting-overlay {
    opacity: 1;
  }

  .play-overlay i,
  .extracting-overlay i {
    font-size: 32px;
    color: #ffffff;
  }

  .extracting .extracting-overlay {
    opacity: 1;
    background: rgba(139, 92, 246, 0.7);
  }

  .info {
    padding: var(--settings-spacing-sm, 8px);
  }

  .title {
    margin: 0 0 4px;
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    color: var(--theme-text, #ffffff);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .channel {
    margin: 0;
    font-size: var(--font-size-xs, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
