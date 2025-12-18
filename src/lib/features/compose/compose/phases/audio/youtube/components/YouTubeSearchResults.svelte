<script lang="ts">
  /**
   * YouTubeSearchResults
   *
   * Grid display of YouTube search results.
   */

  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";
  import YouTubeVideoCard from "./YouTubeVideoCard.svelte";
  import type { YouTubeVideo } from "../domain/models/YouTubeVideo";

  interface Props {
    onSelect: (video: YouTubeVideo) => void;
    onAudioReady: (audioBlob: Blob, metadata: { title: string; duration: number }) => void;
  }

  let { onSelect, onAudioReady }: Props = $props();
</script>

<div class="results-container">
  {#if youtubeAudioState.hasSearchResults}
    <div class="results-grid">
      {#each youtubeAudioState.searchResults as video (video.videoId)}
        <YouTubeVideoCard
          {video}
          onSelect={() => onSelect(video)}
          {onAudioReady}
        />
      {/each}
    </div>
  {:else if youtubeAudioState.searchQuery && !youtubeAudioState.isSearching}
    <div class="empty-state">
      <i class="fas fa-search"></i>
      <p>No results found for "{youtubeAudioState.searchQuery}"</p>
      <span>Try different search terms or paste a YouTube URL</span>
    </div>
  {:else if !youtubeAudioState.searchQuery}
    <div class="empty-state">
      <i class="fab fa-youtube"></i>
      <p>Search for music on YouTube</p>
      <span>Enter a song name, artist, or paste a YouTube URL</span>
    </div>
  {/if}
</div>

<style>
  .results-container {
    flex: 1;
    overflow-y: auto;
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--settings-spacing-md, 16px);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--settings-spacing-xl, 48px);
    text-align: center;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .empty-state i {
    font-size: 48px;
    margin-bottom: var(--settings-spacing-md, 16px);
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0 0 var(--settings-spacing-xs, 4px);
    font-size: var(--font-size-md, 16px);
    color: var(--theme-text, #ffffff);
  }

  .empty-state span {
    font-size: var(--font-size-sm, 14px);
  }
</style>
