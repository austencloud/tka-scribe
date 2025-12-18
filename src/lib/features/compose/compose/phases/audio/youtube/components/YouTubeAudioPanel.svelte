<script lang="ts">
  /**
   * YouTubeAudioPanel
   *
   * Main container for YouTube audio import feature.
   * Contains tabs for Search and Library views.
   */

  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";
  import YouTubeSearchForm from "./YouTubeSearchForm.svelte";
  import YouTubeSearchResults from "./YouTubeSearchResults.svelte";
  import YouTubeLibrary from "./YouTubeLibrary.svelte";
  import YouTubeDownloadProgress from "./YouTubeDownloadProgress.svelte";
  import type { YouTubeVideo } from "../domain/models/YouTubeVideo";

  interface Props {
    onAudioSelected: (audioBlob: Blob, metadata: { title: string; duration: number }) => void;
    onClose: () => void;
  }

  let { onAudioSelected, onClose }: Props = $props();

  const tabs = [
    { id: "search" as const, label: "Search" },
    { id: "library" as const, label: "My Library" },
  ];

  function handleVideoSelect(video: YouTubeVideo) {
    youtubeAudioState.selectVideo(video);
  }

  function handleAudioReady(audioBlob: Blob, metadata: { title: string; duration: number }) {
    onAudioSelected(audioBlob, metadata);
    youtubeAudioState.close();
  }
</script>

<div class="youtube-panel">
  <header class="panel-header">
    <h2>Import from YouTube</h2>
    <button class="close-btn" onclick={onClose} aria-label="Close">
      <i class="fas fa-times"></i>
    </button>
  </header>

  <nav class="tab-nav">
    {#each tabs as tab}
      <button
        class="tab-btn"
        class:active={youtubeAudioState.activeTab === tab.id}
        onclick={() => youtubeAudioState.setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </nav>

  <div class="panel-content">
    {#if youtubeAudioState.activeTab === "search"}
      <div class="search-view">
        <YouTubeSearchForm />
        <YouTubeSearchResults
          onSelect={handleVideoSelect}
          onAudioReady={handleAudioReady}
        />
      </div>
    {:else}
      <YouTubeLibrary
        onSelect={handleVideoSelect}
        onAudioReady={handleAudioReady}
      />
    {/if}
  </div>

  {#if youtubeAudioState.isExtracting}
    <YouTubeDownloadProgress />
  {/if}
</div>

<style>
  .youtube-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.8));
    border-radius: var(--settings-radius-lg, 12px);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--settings-spacing-md, 16px);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .panel-header h2 {
    margin: 0;
    font-size: var(--font-size-lg, 18px);
    font-weight: 600;
    color: var(--theme-text, #ffffff);
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
  }

  .panel-header h2::before {
    content: "";
    display: inline-block;
    width: 24px;
    height: 24px;
    background: #ff0000;
    mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M23.5 6.2c-.3-1-1-1.8-2-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.5.6c-1 .3-1.7 1.1-2 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8c.3 1 1 1.8 2 2.1 1.9.6 9.5.6 9.5.6s7.6 0 9.5-.6c1-.3 1.7-1.1 2-2.1.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z'/%3E%3C/svg%3E")
      center / contain no-repeat;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: var(--settings-radius-sm, 6px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .tab-nav {
    display: flex;
    gap: var(--settings-spacing-xs, 4px);
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .tab-btn {
    flex: 1;
    padding: var(--settings-spacing-sm, 8px) var(--settings-spacing-md, 16px);
    background: transparent;
    border: none;
    border-radius: var(--settings-radius-sm, 6px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tab-btn:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    color: var(--theme-text, #ffffff);
  }

  .tab-btn.active {
    background: var(--theme-accent, #8b5cf6);
    color: #ffffff;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--settings-spacing-md, 16px);
  }

  .search-view {
    display: flex;
    flex-direction: column;
    gap: var(--settings-spacing-md, 16px);
    height: 100%;
  }
</style>
