<!--
  ExportActionsPanel.svelte

  2026 Bento Box Design - Save button with settings access
  Uses WebCodecs for hardware-accelerated MP4 export with precise timing.
  Settings icon opens export options sheet (loop count, etc.)
-->
<script lang="ts">
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";

  let {
    onExportVideo = () => {},
    onCancelExport = () => {},
    isExporting = false,
    exportProgress = null,
    isCircular = false,
    loopCount = 1,
    onLoopCountChange = () => {},
  }: {
    onExportVideo?: () => void;
    onCancelExport?: () => void;
    isExporting?: boolean;
    exportProgress?: { progress: number; stage: string } | null;
    isCircular?: boolean;
    loopCount?: number;
    onLoopCountChange?: (count: number) => void;
  } = $props();

  // Settings sheet state
  let isSettingsOpen = $state(false);

  function handleSaveClick() {
    if (isExporting) return;
    onExportVideo();
  }

  function handleCancelClick() {
    onCancelExport();
  }

  function handleSettingsClick(e: MouseEvent) {
    e.stopPropagation();
    if (isExporting) return;
    isSettingsOpen = true;
  }

  function handleLoopPresetClick(count: number) {
    onLoopCountChange(count);
  }

  // Derive display text based on export state
  const buttonText = $derived(() => {
    if (!isExporting) return "Share";
    if (!exportProgress) return "Starting...";

    const { stage, progress } = exportProgress;
    if (stage === "capturing") {
      return `Capturing ${Math.round(progress * 100)}%`;
    } else if (stage === "encoding") {
      return "Encoding...";
    } else if (stage === "complete") {
      return "Complete!";
    }
    return "Exporting...";
  });

  const buttonHint = $derived(() => {
    if (!isExporting) {
      if (isCircular && loopCount > 1) {
        return `MP4 · ${loopCount}x loop`;
      }
      return "MP4 Video";
    }
    if (exportProgress?.stage === "complete") return "Ready to share";
    return "Please wait...";
  });

  const loopPresets = [1, 2, 4, 8];
</script>

<div class="export-actions-panel">
  <div class="save-button-container">
    <!-- Main save button (or cancel button when exporting) -->
    {#if isExporting && exportProgress?.stage !== "complete"}
      <!-- Cancel button during export -->
      <button
        class="save-btn cancelling"
        onclick={handleCancelClick}
        type="button"
        aria-label="Cancel export"
      >
        <i class="fas main-icon fa-times" aria-hidden="true"></i>
        <span class="btn-label">Cancel</span>
        <span class="btn-hint">Tap to stop export</span>

        {#if exportProgress?.stage === "capturing"}
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {exportProgress.progress * 100}%"
            ></div>
          </div>
        {/if}
      </button>
    {:else}
      <!-- Share button -->
      <button
        class="save-btn"
        class:complete={exportProgress?.stage === "complete"}
        onclick={handleSaveClick}
        type="button"
        aria-label="Share as MP4 video"
      >
        <i
          class="fas main-icon"
          class:fa-share={exportProgress?.stage !== "complete"}
          class:fa-check={exportProgress?.stage === "complete"}
          aria-hidden="true"
        ></i>
        <span class="btn-label">{buttonText()}</span>
        <span class="btn-hint">{buttonHint()}</span>
      </button>
    {/if}

    <!-- Settings button (gear icon) -->
    <button
      class="settings-btn"
      class:has-settings={isCircular && loopCount > 1}
      onclick={handleSettingsClick}
      type="button"
      disabled={isExporting}
      aria-label="Export settings"
    >
      <i class="fas fa-cog" aria-hidden="true"></i>
    </button>
  </div>
</div>

<!-- Export Settings Sheet -->
<Drawer
  bind:isOpen={isSettingsOpen}
  placement="bottom"
  respectLayoutMode={true}
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Export Settings"
  showHandle={true}
  class="export-settings-sheet"
>
  <div class="settings-sheet">
    <header class="sheet-header">
      <h3 class="sheet-title">Export Settings</h3>
      <button
        class="sheet-close-btn"
        onclick={() => (isSettingsOpen = false)}
        aria-label="Close"
        type="button"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </header>

    <div class="sheet-body">
      <!-- Loop Count Section -->
      {#if isCircular}
        <section class="settings-section">
          <div class="section-header">
            <i class="fas fa-infinity section-icon" aria-hidden="true"></i>
            <div class="section-info">
              <h4 class="section-title">Loop Count</h4>
              <p class="section-desc">This sequence loops seamlessly</p>
            </div>
          </div>
          <div class="loop-presets">
            {#each loopPresets as count}
              <button
                class="loop-preset-btn"
                class:active={loopCount === count}
                onclick={() => handleLoopPresetClick(count)}
                type="button"
                aria-label="Export {count} loop{count > 1 ? 's' : ''}"
              >
                {count}x
              </button>
            {/each}
          </div>
        </section>
      {:else}
        <section class="settings-section">
          <div class="section-header">
            <i class="fas fa-info-circle section-icon muted" aria-hidden="true"></i>
            <div class="section-info">
              <h4 class="section-title muted">Loop Count</h4>
              <p class="section-desc">
                Not available - sequence doesn't loop seamlessly
              </p>
            </div>
          </div>
        </section>
      {/if}

      <!-- Future settings can be added here -->
      <!--
      <section class="settings-section">
        <div class="section-header">
          <i class="fas fa-film section-icon" aria-hidden="true"></i>
          <div class="section-info">
            <h4 class="section-title">Quality</h4>
            <p class="section-desc">Video bitrate and resolution</p>
          </div>
        </div>
      </section>
      -->
    </div>

    <footer class="sheet-footer">
      <button
        class="done-btn"
        onclick={() => (isSettingsOpen = false)}
        type="button"
      >
        Done
      </button>
    </footer>
  </div>
</Drawer>

<style>
  /* ===========================
     2026 BENTO BOX DESIGN
     Export Actions Panel
     =========================== */

  .export-actions-panel {
    width: 100%;
  }

  .save-button-container {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  /* Share Button - Compact horizontal layout */
  .save-btn {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 0 16px;
    min-height: var(--min-touch-target);
    flex: 1;
    border-radius: 12px;
    color: var(--theme-text);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-accent, rgba(139, 92, 246, 0.35));
    box-shadow:
      0 2px 8px var(--theme-shadow),
      inset 0 1px 0 var(--theme-stroke);
  }

  .save-btn .main-icon {
    font-size: var(--font-size-lg);
    color: var(--theme-accent, rgba(139, 92, 246, 1));
    transition: transform 0.2s ease;
  }

  .btn-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--theme-text);
    letter-spacing: 0.3px;
  }

  .btn-hint {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--theme-text-dim);
    opacity: 0.8;
  }

  /* Settings Button */
  .settings-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    flex-shrink: 0;
    border-radius: 14px;
    background: var(--theme-card-bg, var(--theme-card-bg));
    border: 1.5px solid var(--theme-stroke);
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: var(--font-size-lg);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .settings-btn.has-settings {
    color: var(--theme-accent, rgba(139, 92, 246, 0.8));
    border-color: var(--theme-accent, rgba(139, 92, 246, 0.25));
  }

  @media (hover: hover) and (pointer: fine) {
    .save-btn:hover:not(:disabled) {
      background: var(--theme-card-hover-bg);
      border-color: var(--theme-accent, rgba(139, 92, 246, 0.5));
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px var(--theme-shadow),
        inset 0 1px 0 var(--theme-card-hover-bg);
    }

    .save-btn:hover .main-icon {
      transform: scale(1.08);
    }

    .settings-btn:hover:not(:disabled) {
      background: var(--theme-card-hover-bg);
      border-color: var(--theme-stroke-strong);
      color: var(--theme-text);
    }

    .settings-btn.has-settings:hover:not(:disabled) {
      border-color: var(--theme-accent, rgba(139, 92, 246, 0.4));
      color: var(--theme-accent, rgba(139, 92, 246, 1));
    }
  }

  .save-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .settings-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .save-btn:disabled,
  .settings-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .save-btn.cancelling {
    background: var(--theme-card-bg);
    border-color: var(--semantic-error, rgba(239, 68, 68, 0.35));
    box-shadow:
      0 2px 10px var(--theme-shadow),
      inset 0 1px 0 var(--theme-stroke);
  }

  .save-btn.cancelling .main-icon {
    color: var(--semantic-error, rgba(239, 68, 68, 1));
  }

  @media (hover: hover) and (pointer: fine) {
    .save-btn.cancelling:hover {
      background: var(--theme-card-hover-bg);
      border-color: var(--semantic-error, rgba(239, 68, 68, 0.5));
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px var(--theme-shadow),
        inset 0 1px 0 var(--theme-card-hover-bg);
    }
  }

  .save-btn.complete {
    background: var(--theme-card-bg);
    border-color: var(--semantic-success, rgba(34, 197, 94, 0.5));
    box-shadow:
      0 2px 14px var(--theme-shadow),
      inset 0 1px 0 var(--theme-card-hover-bg);
  }

  .save-btn.complete .main-icon {
    color: var(--semantic-success, rgba(34, 197, 94, 1));
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--theme-card-bg);
    border-radius: 0 0 14px 14px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--theme-accent, rgba(139, 92, 246, 1));
    transition: width 0.3s ease;
  }

  /* ===========================
     SETTINGS SHEET
     =========================== */

  /* Export settings sheet drawer styling */
  :global(.drawer-content.export-settings-sheet) {
    /* Ensure proper z-index above animation panel */
    z-index: 1001;
  }

  .settings-sheet {
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    max-height: 70vh;
    background: var(--theme-panel-elevated-bg);
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--theme-stroke);
    margin-bottom: 20px;
  }

  .sheet-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--theme-text);
    margin: 0;
  }

  .sheet-close-btn {
    width: 48px; /* WCAG AAA touch target */
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    background: var(--theme-card-bg, var(--theme-card-bg));
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sheet-close-btn:hover {
    background: var(--theme-card-hover-bg);
    color: var(--theme-text, var(--theme-text));
  }

  .sheet-body {
    display: flex;
    flex-direction: column;
    gap: 20px;
    flex: 1;
    overflow-y: auto;
  }

  .sheet-footer {
    padding-top: 20px;
    border-top: 1px solid var(--theme-stroke);
    margin-top: 20px;
  }

  .done-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    background: var(--theme-accent);
    border: 1.5px solid var(--theme-accent);
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .done-btn:hover {
    filter: brightness(1.1);
  }

  .done-btn:active {
    transform: scale(0.98);
  }

  /* Settings Sections */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .section-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .section-icon {
    font-size: var(--font-size-lg);
    color: var(--theme-accent, rgba(139, 92, 246, 0.9));
    margin-top: 2px;
  }

  .section-icon.muted {
    color: var(--theme-text-dim); /* Improved contrast for WCAG AAA */
  }

  .section-info {
    flex: 1;
  }

  .section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--theme-text, var(--theme-text));
    margin: 0 0 4px 0;
  }

  .section-title.muted {
    color: var(--theme-text-dim);
    opacity: 0.6;
  }

  .section-desc {
    font-size: 0.75rem;
    color: var(--theme-text-dim, var(--theme-text-dim));
    margin: 0;
  }

  /* Loop Presets */
  .loop-presets {
    display: flex;
    gap: 8px;
    padding-left: 30px;
  }

  .loop-preset-btn {
    flex: 1;
    min-height: 44px;
    padding: 10px 16px;
    background: var(--theme-card-bg, var(--theme-card-bg));
    border: 1.5px solid var(--theme-stroke);
    border-radius: 10px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .loop-preset-btn:hover {
      background: var(--theme-card-hover-bg);
      border-color: var(--theme-stroke-strong);
      color: var(--theme-text);
    }
  }

  .loop-preset-btn:active {
    transform: scale(0.95);
  }

  .loop-preset-btn.active {
    background: var(--theme-accent);
    border-color: var(--theme-accent);
    color: white;
    box-shadow: 0 0 16px var(--theme-shadow);
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 360px) {
    .save-btn {
      padding: 0 12px;
      gap: 8px;
    }

    .save-btn .main-icon {
      font-size: var(--font-size-base);
    }

    .btn-label {
      font-size: 0.8rem;
    }

    .btn-hint {
      display: none; /* Hide hint on very small screens */
    }

    .settings-btn {
      font-size: var(--font-size-base);
    }

    .loop-presets {
      padding-left: 0;
    }

    .loop-preset-btn {
      padding: 8px 12px;
      font-size: 0.8rem;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .save-btn,
    .save-btn .main-icon,
    .settings-btn,
    .loop-preset-btn {
      transition: none;
    }

    .save-btn:hover,
    .save-btn:active,
    .settings-btn:active,
    .loop-preset-btn:active {
      transform: none;
    }
  }
</style>
