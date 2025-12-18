<script lang="ts">
  /**
   * YouTubeSearchForm
   *
   * Search input with debouncing for YouTube queries.
   */

  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { YouTubeTypes } from "$lib/shared/inversify/types";
  import type { IYouTubeSearchService } from "../services/contracts/IYouTubeSearchService";

  let inputValue = $state(youtubeAudioState.searchQuery);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const DEBOUNCE_MS = 400;

  async function performSearch(query: string) {
    if (!query.trim()) {
      youtubeAudioState.clearSearch();
      return;
    }

    youtubeAudioState.startSearch();
    youtubeAudioState.setSearchQuery(query);

    try {
      const searchService = resolve<IYouTubeSearchService>(
        YouTubeTypes.IYouTubeSearchService
      );

      // Check if query is a YouTube URL
      const videoId = searchService.extractVideoId(query);
      if (videoId) {
        const video = await searchService.getVideoDetails(videoId);
        if (video) {
          youtubeAudioState.setSearchResults([video]);
          return;
        }
      }

      // Regular search
      const result = await searchService.search(query, { maxResults: 12 });
      youtubeAudioState.setSearchResults(result.videos, result.nextPageToken);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Search failed";
      youtubeAudioState.setSearchError(message);
    }
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    inputValue = target.value;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
      performSearch(inputValue);
    }, DEBOUNCE_MS);
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    performSearch(inputValue);
  }

  function handleClear() {
    inputValue = "";
    youtubeAudioState.clearSearch();
  }
</script>

<form class="search-form" onsubmit={handleSubmit}>
  <div class="input-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input
      type="text"
      placeholder="Search YouTube or paste a URL..."
      value={inputValue}
      oninput={handleInput}
      class="search-input"
    />
    {#if inputValue}
      <button
        type="button"
        class="clear-btn"
        onclick={handleClear}
        aria-label="Clear search"
      >
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  {#if youtubeAudioState.isSearching}
    <div class="loading-indicator">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
  {/if}
</form>

{#if youtubeAudioState.searchError}
  <div class="error-message">
    <i class="fas fa-exclamation-circle"></i>
    {youtubeAudioState.searchError}
  </div>
{/if}

<style>
  .search-form {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
  }

  .input-wrapper {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
    font-size: 14px;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: 10px 36px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-md, 8px);
    color: var(--theme-text, #ffffff);
    font-size: var(--font-size-sm, 14px);
    transition: all 0.15s ease;
  }

  .search-input::placeholder {
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
  }

  .search-input:focus {
    outline: none;
    border-color: var(--theme-accent, #8b5cf6);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
  }

  .clear-btn {
    position: absolute;
    right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: var(--settings-radius-sm, 6px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .loading-indicator {
    color: var(--theme-accent, #8b5cf6);
    font-size: 16px;
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--settings-radius-sm, 6px);
    color: var(--semantic-error, #ef4444);
    font-size: var(--font-size-sm, 14px);
    margin-top: var(--settings-spacing-sm, 8px);
  }
</style>
