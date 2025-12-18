<script lang="ts">
  /**
   * YouTubeDownloadProgress
   *
   * Modal overlay showing extraction progress.
   */

  import { youtubeAudioState } from "../state/youtube-audio-state.svelte";

  const stageLabels: Record<string, string> = {
    queued: "Starting...",
    extracting: "Extracting audio from YouTube",
    downloading: "Downloading audio file",
    caching: "Saving to local cache",
    complete: "Complete!",
    error: "Error",
  };

  let progress = $derived(youtubeAudioState.extractionProgress);
  let video = $derived(youtubeAudioState.extractingVideo);
</script>

{#if progress && video}
  <div class="progress-overlay">
    <div class="progress-modal">
      <div class="thumbnail-wrapper">
        <img src={video.thumbnailUrl} alt={video.title} class="thumbnail" />
        <div class="thumbnail-overlay">
          {#if progress.stage === "complete"}
            <i class="fas fa-check-circle success"></i>
          {:else if progress.stage === "error"}
            <i class="fas fa-exclamation-circle error"></i>
          {:else}
            <i class="fas fa-spinner fa-spin"></i>
          {/if}
        </div>
      </div>

      <div class="info">
        <h3 class="title">{video.title}</h3>
        <p class="stage">{stageLabels[progress.stage] || progress.message}</p>

        <div class="progress-bar-wrapper">
          <div class="progress-bar">
            <div
              class="progress-fill"
              class:error={progress.stage === "error"}
              class:complete={progress.stage === "complete"}
              style="width: {progress.progress}%"
            ></div>
          </div>
          <span class="progress-text">{progress.progress}%</span>
        </div>

        {#if progress.stage === "error"}
          <p class="error-message">{progress.message}</p>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .progress-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 100;
  }

  .progress-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--settings-spacing-lg, 24px);
    background: var(--theme-panel-bg, rgba(30, 30, 30, 0.95));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: var(--settings-radius-lg, 12px);
    max-width: 320px;
    width: 90%;
  }

  .thumbnail-wrapper {
    position: relative;
    width: 200px;
    aspect-ratio: 16 / 9;
    border-radius: var(--settings-radius-md, 8px);
    overflow: hidden;
    margin-bottom: var(--settings-spacing-md, 16px);
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .thumbnail-overlay i {
    font-size: 40px;
    color: #ffffff;
  }

  .thumbnail-overlay i.success {
    color: #22c55e;
  }

  .thumbnail-overlay i.error {
    color: #ef4444;
  }

  .info {
    width: 100%;
    text-align: center;
  }

  .title {
    margin: 0 0 var(--settings-spacing-sm, 8px);
    font-size: var(--font-size-sm, 14px);
    font-weight: 500;
    color: var(--theme-text, #ffffff);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .stage {
    margin: 0 0 var(--settings-spacing-md, 16px);
    font-size: var(--font-size-sm, 14px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
  }

  .progress-bar-wrapper {
    display: flex;
    align-items: center;
    gap: var(--settings-spacing-sm, 8px);
  }

  .progress-bar {
    flex: 1;
    height: 6px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--theme-accent, #8b5cf6);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-fill.complete {
    background: #22c55e;
  }

  .progress-fill.error {
    background: #ef4444;
  }

  .progress-text {
    font-size: var(--font-size-xs, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    min-width: 36px;
    text-align: right;
  }

  .error-message {
    margin: var(--settings-spacing-md, 16px) 0 0;
    padding: var(--settings-spacing-sm, 8px);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--settings-radius-sm, 6px);
    color: var(--semantic-error, #ef4444);
    font-size: var(--font-size-sm, 14px);
  }
</style>
