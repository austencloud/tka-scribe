<!--
  CompositeFormatPanel.svelte

  Composite video export: Animation + grid side-by-side with synchronized beat highlighting.
  The "fantastic and essential" feature!

  TODO Phase 3:
  - Create ICompositeVideoRenderer interface
  - Implement CompositeVideoRenderer service (grid caching + beat highlighting)
  - Modify VideoExportOrchestrator to support composite mode
  - Integrate AnimationCanvas for animation preview
  - Integrate grid rendering with beat highlighting
  - Wire up export orchestration
-->
<script lang="ts">
  import type { SequenceData } from '$lib/shared/foundation/domain/models/SequenceData';
  import type { CompositeExportOptions } from '../../domain/models/CompositeExportOptions';
  import { DEFAULT_COMPOSITE_OPTIONS } from '../../domain/models/CompositeExportOptions';

  let {
    sequence,
  }: {
    sequence: SequenceData;
  } = $props();

  // Composite export configuration
  let options = $state<CompositeExportOptions>({ ...DEFAULT_COMPOSITE_OPTIONS });

  // Export state
  let isExporting = $state(false);
  let exportProgress = $state(0);

  function handleExport() {
    // TODO: Integrate CompositeVideoRenderer + VideoExportOrchestrator
    console.log('Export composite video:', {
      sequence: sequence.word,
      options,
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
    }, 300);
  }
</script>

<div class="composite-format-panel">
  <!-- Preview Section -->
  <div class="preview-section">
    <div
      class="composite-preview"
      class:horizontal={options.orientation === 'horizontal'}
      class:vertical={options.orientation === 'vertical'}
    >
      <!-- Animation Pane -->
      <div class="animation-pane preview-placeholder">
        <i class="fas fa-play-circle"></i>
        <p>Animation</p>
        <p class="preview-note">Canvas preview</p>
      </div>

      <!-- Grid Pane -->
      <div class="grid-pane preview-placeholder">
        <i class="fas fa-th"></i>
        <p>Beat Grid</p>
        <p class="preview-note">
          {options.showBeatNumbers ? 'With' : 'Without'} beat numbers<br />
          Gold highlight on current beat
        </p>
      </div>
    </div>
  </div>

  <!-- Configuration Section -->
  <div class="config-section">
    <!-- Orientation -->
    <section class="settings-section">
      <h4 class="settings-section-title">Layout Orientation</h4>
      <div class="orientation-toggle">
        <button
          class="toggle-btn"
          class:active={options.orientation === 'horizontal'}
          onclick={() => (options.orientation = 'horizontal')}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-grip-horizontal" aria-hidden="true"></i>
          <span>Horizontal</span>
        </button>
        <button
          class="toggle-btn"
          class:active={options.orientation === 'vertical'}
          onclick={() => (options.orientation = 'vertical')}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-grip-vertical" aria-hidden="true"></i>
          <span>Vertical</span>
        </button>
      </div>
    </section>

    <!-- Grid Options -->
    <section class="settings-section">
      <h4 class="settings-section-title">Grid Options</h4>
      <div class="options-row">
        <button
          class="option-toggle"
          class:active={options.showBeatNumbers}
          onclick={() => (options.showBeatNumbers = !options.showBeatNumbers)}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-hashtag" aria-hidden="true"></i>
          <span>Beat Numbers</span>
        </button>
        <button
          class="option-toggle"
          class:active={options.includeStartPosition}
          onclick={() => (options.includeStartPosition = !options.includeStartPosition)}
          disabled={isExporting}
          type="button"
        >
          <i class="fas fa-home" aria-hidden="true"></i>
          <span>Start Position</span>
        </button>
      </div>
    </section>

    <!-- Frame Rate -->
    <section class="settings-section">
      <h4 class="settings-section-title">Frame Rate</h4>
      <div class="chips">
        {#each [30, 50, 60] as fps}
          <button
            class="chip"
            class:active={options.fps === fps}
            onclick={() => (options.fps = fps)}
            disabled={isExporting}
            type="button"
          >
            {fps} FPS{fps === 50 ? ' ✓' : ''}
          </button>
        {/each}
      </div>
    </section>

    <!-- Loop Count -->
    <section class="settings-section">
      <h4 class="settings-section-title">Loop Count</h4>
      <div class="chips">
        {#each [1, 2, 3, 4, 5] as count}
          <button
            class="chip"
            class:active={options.loopCount === count}
            onclick={() => (options.loopCount = count)}
            disabled={isExporting}
            type="button"
          >
            {count}x
          </button>
        {/each}
      </div>
    </section>

    <!-- Export Button -->
    <button
      class="export-button"
      onclick={handleExport}
      disabled={isExporting}
      aria-label="Export composite video"
    >
      {#if isExporting}
        <i class="fas fa-spinner fa-spin"></i>
        Exporting... {exportProgress}%
      {:else}
        <i class="fas fa-download"></i>
        Export Composite Video
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
  .composite-format-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    height: 100%;
    overflow-y: auto;
  }

  .preview-section {
    flex: 1;
    min-height: 400px;
  }

  .composite-preview {
    display: flex;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .composite-preview.horizontal {
    flex-direction: row;
  }

  .composite-preview.vertical {
    flex-direction: column;
  }

  .animation-pane,
  .grid-pane {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 20px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .animation-pane {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.05),
      rgba(124, 58, 237, 0.05)
    );
    border-right: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .composite-preview.vertical .animation-pane {
    border-right: none;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .grid-pane {
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.05),
      rgba(5, 150, 105, 0.05)
    );
  }

  .preview-placeholder i {
    font-size: 48px;
  }

  .preview-placeholder p {
    margin: 0;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .preview-note {
    font-size: var(--font-size-compact, 12px) !important;
    font-weight: 400 !important;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5)) !important;
    text-align: center;
    line-height: 1.4;
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

  /* Orientation toggle */
  .orientation-toggle {
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

  /* Grid options */
  .options-row {
    display: flex;
    gap: 8px;
  }

  .option-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--min-touch-target);
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .option-toggle.active {
    background: var(--theme-accent-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(255, 255, 255, 0.3));
    color: var(--theme-text, white);
  }

  .option-toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .option-toggle:active:not(:disabled) {
    transform: scale(0.97);
  }

  /* Chips for FPS and loop count */
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
    .composite-format-panel {
      padding: 16px;
    }

    .preview-section {
      min-height: 300px;
    }

    /* Force vertical layout on mobile */
    .composite-preview {
      flex-direction: column !important;
    }

    .animation-pane {
      border-right: none !important;
      border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1)) !important;
    }
  }
</style>
