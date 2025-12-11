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
    isExporting = false,
    exportProgress = null,
    isCircular = false,
    loopCount = 1,
    onLoopCountChange = () => {},
  }: {
    onExportVideo?: () => void;
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
    console.log("💾 ExportActionsPanel: Save button clicked");
    onExportVideo();
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
    if (!isExporting) return "Save";
    if (!exportProgress) return "Starting...";

    const { stage, progress } = exportProgress;
    if (stage === "capturing") {
      return `Capturing ${Math.round(progress * 100)}%`;
    } else if (stage === "encoding") {
      return "Encoding...";
    } else if (stage === "complete") {
      return "Complete!";
    }
    return "Saving...";
  });

  const buttonHint = $derived(() => {
    if (!isExporting) {
      if (isCircular && loopCount > 1) {
        return `MP4 · ${loopCount}x loop`;
      }
      return "Download as MP4";
    }
    if (exportProgress?.stage === "complete") return "Download started";
    return "Please wait...";
  });

  const loopPresets = [1, 2, 4, 8];
</script>

<div class="export-actions-panel">
  <div class="save-button-container">
    <!-- Main save button -->
    <button
      class="save-btn"
      class:exporting={isExporting}
      class:complete={exportProgress?.stage === "complete"}
      onclick={handleSaveClick}
      type="button"
      disabled={isExporting && exportProgress?.stage !== "complete"}
      aria-label={isExporting ? "Saving..." : "Save as MP4 video"}
    >
      <i
        class="fas main-icon"
        class:fa-download={!isExporting}
        class:fa-spinner={isExporting && exportProgress?.stage !== "complete"}
        class:fa-spin={isExporting && exportProgress?.stage !== "complete"}
        class:fa-check={exportProgress?.stage === "complete"}
      ></i>
      <span class="btn-label">{buttonText()}</span>
      <span class="btn-hint">{buttonHint()}</span>

      {#if isExporting && exportProgress?.stage === "capturing"}
        <div class="progress-bar">
          <div class="progress-fill" style="width: {exportProgress.progress * 100}%"></div>
        </div>
      {/if}
    </button>

    <!-- Settings button (gear icon) -->
    <button
      class="settings-btn"
      class:has-settings={isCircular && loopCount > 1}
      onclick={handleSettingsClick}
      type="button"
      disabled={isExporting}
      aria-label="Export settings"
    >
      <i class="fas fa-cog"></i>
    </button>
  </div>
</div>

<!-- Export Settings Sheet -->
<Drawer
  bind:isOpen={isSettingsOpen}
  placement="bottom"
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Export Settings"
  showHandle={true}
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
        <i class="fas fa-times"></i>
      </button>
    </header>

    <div class="sheet-body">
      <!-- Loop Count Section -->
      {#if isCircular}
        <section class="settings-section">
          <div class="section-header">
            <i class="fas fa-infinity section-icon"></i>
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
            <i class="fas fa-info-circle section-icon muted"></i>
            <div class="section-info">
              <h4 class="section-title muted">Loop Count</h4>
              <p class="section-desc">Not available - sequence doesn't loop seamlessly</p>
            </div>
          </div>
        </section>
      {/if}

      <!-- Future settings can be added here -->
      <!--
      <section class="settings-section">
        <div class="section-header">
          <i class="fas fa-film section-icon"></i>
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

  /* Save Button - Cyan/Teal theme */
  .save-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 16px 20px;
    flex: 1;
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.2) 0%,
      rgba(8, 145, 178, 0.15) 100%
    );
    border: 1.5px solid rgba(6, 182, 212, 0.35);
    box-shadow:
      0 2px 10px rgba(6, 182, 212, 0.15),
      0 0 20px rgba(6, 182, 212, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .save-btn .main-icon {
    font-size: 24px;
    color: rgba(6, 182, 212, 1);
    transition: transform 0.2s ease;
  }

  .btn-label {
    font-size: 0.85rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: 0.3px;
  }

  .btn-hint {
    font-size: 0.65rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.2px;
  }

  /* Settings Button */
  .settings-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    flex-shrink: 0;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.5);
    font-size: 18px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .settings-btn.has-settings {
    color: rgba(6, 182, 212, 0.8);
    border-color: rgba(6, 182, 212, 0.25);
  }

  @media (hover: hover) and (pointer: fine) {
    .save-btn:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(6, 182, 212, 0.3) 0%,
        rgba(8, 145, 178, 0.25) 100%
      );
      border-color: rgba(6, 182, 212, 0.5);
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px rgba(6, 182, 212, 0.25),
        0 0 28px rgba(6, 182, 212, 0.18),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .save-btn:hover .main-icon {
      transform: scale(1.08);
    }

    .settings-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.8);
    }

    .settings-btn.has-settings:hover:not(:disabled) {
      border-color: rgba(6, 182, 212, 0.4);
      color: rgba(6, 182, 212, 1);
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

  .save-btn.exporting {
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.22) 0%,
      rgba(8, 145, 178, 0.18) 100%
    );
  }

  .save-btn.complete {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.25) 0%,
      rgba(22, 163, 74, 0.2) 100%
    );
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow:
      0 2px 14px rgba(34, 197, 94, 0.25),
      0 0 24px rgba(34, 197, 94, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
  }

  .save-btn.complete .main-icon {
    color: rgba(34, 197, 94, 1);
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 0 0 14px 14px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(
      90deg,
      rgba(6, 182, 212, 1) 0%,
      rgba(8, 145, 178, 1) 100%
    );
    transition: width 0.3s ease;
  }

  /* ===========================
     SETTINGS SHEET
     =========================== */

  .settings-sheet {
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    max-height: 70vh;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
  }

  .sheet-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .sheet-close-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sheet-close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
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
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin-top: 20px;
  }

  .done-btn {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.25) 0%,
      rgba(8, 145, 178, 0.2) 100%
    );
    border: 1.5px solid rgba(6, 182, 212, 0.4);
    color: rgba(255, 255, 255, 0.95);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .done-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.35) 0%,
      rgba(8, 145, 178, 0.3) 100%
    );
    border-color: rgba(6, 182, 212, 0.5);
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
    font-size: 18px;
    color: rgba(6, 182, 212, 0.9);
    margin-top: 2px;
  }

  .section-icon.muted {
    color: rgba(255, 255, 255, 0.3);
  }

  .section-info {
    flex: 1;
  }

  .section-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 4px 0;
  }

  .section-title.muted {
    color: rgba(255, 255, 255, 0.4);
  }

  .section-desc {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
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
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .loop-preset-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.95);
    }
  }

  .loop-preset-btn:active {
    transform: scale(0.95);
  }

  .loop-preset-btn.active {
    background: linear-gradient(
      135deg,
      rgba(6, 182, 212, 0.3) 0%,
      rgba(8, 145, 178, 0.25) 100%
    );
    border-color: rgba(6, 182, 212, 0.5);
    color: rgba(255, 255, 255, 1);
    box-shadow: 0 0 16px rgba(6, 182, 212, 0.2);
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 360px) {
    .save-btn {
      padding: 14px 16px;
    }

    .save-btn .main-icon {
      font-size: 22px;
    }

    .btn-label {
      font-size: 0.8rem;
    }

    .btn-hint {
      font-size: 0.6rem;
    }

    .settings-btn {
      width: 48px;
      font-size: 16px;
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
