<!--
  AnimationFormatPanel.svelte

  Video export panel with configuration options.
  Integrates with VideoExportOrchestrator for MP4/WebM export.

  TODO Phase 3:
  - Integrate AnimationCanvas for preview
  - Wire up VideoExportOrchestrator
  - Implement progress tracking
-->
<script lang="ts">
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import type { VideoExportFormat } from '$lib/features/compose/services/contracts/IVideoExportOrchestrator';

  let {
    sequence,
  }: {
    sequence: SequenceData;
  } = $props();

  // Export configuration state
  let loopCount = $state(1);
  let fps = $state(50);
  let format = $state<VideoExportFormat>('mp4');
  let addWord = $state(true);
  let addBeatNumbers = $state(false);
  let addDifficulty = $state(false);

  // Export state
  let isExporting = $state(false);
  let exportProgress = $state(0);

  function handleExport() {
    // TODO: Integrate VideoExportOrchestrator
    console.log('Export animation:', {
      sequence: sequence.word,
      loopCount,
      fps,
      format,
      overlays: { addWord, addBeatNumbers, addDifficulty },
    });
    isExporting = true;
    // Mock progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      exportProgress = progress;
      if (progress >= 100) {
        clearInterval(interval);
        isExporting = false;
        exportProgress = 0;
      }
    }, 200);
  }
</script>

<div class="animation-format-panel">
  <!-- Preview Area (Placeholder) -->
  <div class="preview-section">
    <div class="preview-placeholder">
      <i class="fas fa-play-circle"></i>
      <p>Animation Preview</p>
      <p class="preview-note">Canvas preview coming in Phase 3</p>
    </div>
  </div>

  <!-- Export Configuration -->
  <div class="config-section">
    <!-- Loop Count -->
    <section class="settings-section">
      <h4 class="settings-section-title">Loop Count</h4>
      <div class="chips">
        {#each [1, 2, 3, 4, 5] as count}
          <button
            class="chip"
            class:active={loopCount === count}
            onclick={() => (loopCount = count)}
            disabled={isExporting}
            type="button"
          >
            {count}x
          </button>
        {/each}
      </div>
    </section>

    <!-- Frame Rate -->
    <section class="settings-section">
      <h4 class="settings-section-title">Frame Rate</h4>
      <div class="chips">
        {#each [30, 50, 60] as fpsValue}
          <button
            class="chip"
            class:active={fps === fpsValue}
            onclick={() => (fps = fpsValue)}
            disabled={isExporting}
            type="button"
          >
            {fpsValue} FPS{fpsValue === 50 ? ' ✓' : ''}
          </button>
        {/each}
      </div>
    </section>

    <!-- Format -->
    <section class="settings-section">
      <h4 class="settings-section-title">Video Format</h4>
      <div class="format-toggle">
        <button
          class="toggle-btn"
          class:active={format === 'mp4'}
          onclick={() => (format = 'mp4')}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-file-video" aria-hidden="true"></i>
          <span>MP4</span>
        </button>
        <button
          class="toggle-btn"
          class:active={format === 'webm'}
          onclick={() => (format = 'webm')}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-video" aria-hidden="true"></i>
          <span>WebM</span>
        </button>
      </div>
    </section>

    <!-- Overlays -->
    <section class="settings-section">
      <h4 class="settings-section-title">Overlays</h4>
      <div class="overlays-grid">
        <button
          class="overlay-toggle"
          class:active={addWord}
          onclick={() => (addWord = !addWord)}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-font" aria-hidden="true"></i>
          <span>Word</span>
        </button>
        <button
          class="overlay-toggle"
          class:active={addBeatNumbers}
          onclick={() => (addBeatNumbers = !addBeatNumbers)}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-hashtag" aria-hidden="true"></i>
          <span>Beat #</span>
        </button>
        <button
          class="overlay-toggle"
          class:active={addDifficulty}
          onclick={() => (addDifficulty = !addDifficulty)}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-signal" aria-hidden="true"></i>
          <span>Difficulty</span>
        </button>
      </div>
    </section>

    <!-- Export Button -->
    <button
      class="export-button"
      onclick={handleExport}
      disabled={isExporting}
      aria-label="Export animation video"
    >
      {#if isExporting}
        <i class="fas fa-spinner fa-spin"></i>
        Exporting... {exportProgress}%
      {:else}
        <i class="fas fa-download"></i>
        Export Video
      {/if}
    </button>

    {#if isExporting}
      <div class="progress-bar">
        <div class="progress-fill" style:width="{exportProgress}%"></div>
      </div>
    {/if}
  </div>
</div>

<style>
  .animation-format-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }

  .preview-section {
    flex: 1;
    min-height: 300px;
    border-radius: 12px;
    overflow: hidden;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .preview-placeholder i {
    font-size: 48px;
  }

  .preview-placeholder p {
    margin: 0;
    font-size: var(--font-size-min, 14px);
  }

  .preview-note {
    font-size: var(--font-size-compact, 12px) !important;
    font-style: italic;
  }

  .config-section {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Settings sections */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Chips for loop count and FPS */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .chip {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 80px;
    min-height: 44px;
    padding: 10px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .chip.active {
    background: var(--theme-accent-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(255, 255, 255, 0.3));
    color: var(--theme-text, white);
    box-shadow: 0 0 12px var(--theme-accent-glow, rgba(255, 255, 255, 0.1));
  }

  .chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .chip:active:not(:disabled) {
    transform: scale(0.95);
  }

  /* Format toggle */
  .format-toggle {
    display: flex;
    gap: 4px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    padding: 4px;
  }

  .toggle-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--min-touch-target);
    padding: 10px 14px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .toggle-btn.active {
    background: var(--theme-accent-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, white);
    box-shadow: 0 0 12px var(--theme-accent-glow, rgba(255, 255, 255, 0.1));
  }

  .toggle-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  /* Overlays grid */
  .overlays-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 8px;
  }

  .overlay-toggle {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 80px;
    padding: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .overlay-toggle i {
    font-size: 1.25rem;
  }

  .overlay-toggle.active {
    background: var(--theme-accent-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(255, 255, 255, 0.3));
    color: var(--theme-text, white);
  }

  .overlay-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .overlay-toggle:active:not(:disabled) {
    transform: scale(0.97);
  }

  .export-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    min-height: var(--touch-target-min, 48px);
    background: var(--theme-accent, rgba(255, 255, 255, 0.15));
    border: none;
    border-radius: 12px;
    color: var(--theme-text, white);
    font-size: var(--font-size-min, 14px);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .export-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px var(--theme-accent-glow, rgba(255, 255, 255, 0.2));
  }

  .export-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--theme-accent, rgba(255, 255, 255, 0.3));
    transition: width 0.3s ease-out;
  }

  /* Mobile responsive */
  @media (max-width: 600px) {
    .animation-format-panel {
      padding: 16px;
    }

    .preview-section {
      min-height: 200px;
    }
  }
</style>
