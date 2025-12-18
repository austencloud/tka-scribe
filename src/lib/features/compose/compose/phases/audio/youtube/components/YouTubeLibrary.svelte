<script lang="ts">
  /**
   * YouTubeLibrary
   *
   * User's saved YouTube audio library with local/cloud status.
   */

  import { onMount } from "svelte";
  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { YouTubeTypes } from "$lib/shared/inversify/types";
  import type { IYouTubeAudioService } from "../services/contracts/IYouTubeAudioService";
  import YouTubeAudioItem from "./YouTubeAudioItem.svelte";
  import type { YouTubeVideo } from "../domain/models/YouTubeVideo";

  interface Props {
    onSelect: (video: YouTubeVideo) => void;
    onAudioReady: (audioBlob: Blob, metadata: { title: string; duration: number }) => void;
  }

  let { onSelect, onAudioReady }: Props = $props();

  onMount(async () => {
    youtubeAudioState.startLibraryLoad();
    try {
      const audioService = resolve<IYouTubeAudioService>(
        YouTubeTypes.IYouTubeAudioService
      );
      const library = await audioService.getLibrary();
      youtubeAudioState.setLibrary(library);
    } catch (error) {
      console.error("Failed to load library:", error);
      youtubeAudioState.setLibrary([]);
    }
  });

  async function handleLoad(videoId: string) {
    const track = youtubeAudioState.library.find((t) => t.videoId === videoId);
    if (!track) return;

    const audioService = resolve<IYouTubeAudioService>(
      YouTubeTypes.IYouTubeAudioService
    );

    if (track.isLocallyAvailable) {
      // Load from local cache
      const blob = await audioService.loadLocalAudio(videoId);
      if (blob) {
        onAudioReady(blob, { title: track.title, duration: track.duration });
      }
    } else {
      // Need to re-download
      const video: YouTubeVideo = {
        videoId: track.videoId,
        title: track.title,
        channelName: track.channelName,
        thumbnailUrl: track.thumbnailUrl,
        durationSeconds: track.duration,
        durationFormatted: formatDuration(track.duration),
      };

      youtubeAudioState.startExtraction(video);

      const result = await audioService.extractAudio(video, track.quality, (progress) => {
        youtubeAudioState.updateExtractionProgress(progress);
      });

      youtubeAudioState.finishExtraction();

      if (result.success && result.audioBlob) {
        youtubeAudioState.updateTrackAvailability(videoId, true);
        onAudioReady(result.audioBlob, { title: track.title, duration: track.duration });
      }
    }
  }

  async function handleDelete(videoId: string) {
    const audioService = resolve<IYouTubeAudioService>(
      YouTubeTypes.IYouTubeAudioService
    );
    await audioService.removeFromLibrary(videoId);
    youtubeAudioState.removeFromLibrary(videoId);
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
</script>

<div class="library-container">
  {#if youtubeAudioState.isLibraryLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading your library...</p>
    </div>
  {:else if youtubeAudioState.hasLibraryItems}
    <div class="library-list">
      {#each youtubeAudioState.library as track (track.videoId)}
        <YouTubeAudioItem
          {track}
          onLoad={() => handleLoad(track.videoId)}
          onDelete={() => handleDelete(track.videoId)}
        />
      {/each}
    </div>
  {:else}
    <div class="empty-state">
      <i class="fas fa-music"></i>
      <p>No saved tracks yet</p>
      <span>Search for music and extract audio to build your library</span>
    </div>
  {/if}
</div>

<style>
  .library-container {
    height: 100%;
    overflow-y: auto;
  }

  .library-list {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-sm, 8px);
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--settings-spacing-xl, 48px);
    text-align: center;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .loading-state i,
  .empty-state i {
    font-size: 48px;
    margin-bottom: var(--settings-spacing-md, 16px);
    opacity: 0.5;
  }

  .loading-state i {
    color: var(--theme-accent, #8b5cf6);
    opacity: 1;
  }

  .loading-state p,
  .empty-state p {
    margin: 0 0 var(--settings-spacing-xs, 4px);
    font-size: var(--font-size-md, 16px);
    color: var(--theme-text, #ffffff);
  }

  .empty-state span {
    font-size: var(--font-size-sm, 14px);
  }
</style>
