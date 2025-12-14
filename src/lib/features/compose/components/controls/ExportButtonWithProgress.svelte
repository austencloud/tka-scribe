<!--
  ExportButtonWithProgress.svelte

  Export button that shows different states:
  - Ready to export (Save button)
  - Exporting with progress (Cancel button + progress bar)
  - Export complete (Complete checkmark)
-->
<script lang="ts">
  type ExportProgress = { progress: number; stage: string } | null;

  let {
    isExporting = false,
    exportProgress = null,
    onExport = () => {},
    onCancel = () => {},
  }: {
    isExporting?: boolean;
    exportProgress?: ExportProgress;
    onExport?: () => void;
    onCancel?: () => void;
  } = $props();
</script>

<div class="export-button-container">
  {#if isExporting && exportProgress?.stage !== "complete"}
    <!-- Cancel button during export -->
    <button
      class="export-btn cancelling"
      onclick={onCancel}
      type="button"
      aria-label="Cancel export"
    >
      <i class="fas fa-times"></i>
      <span>Cancel</span>
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
    <!-- Save button -->
    <button
      class="export-btn"
      class:complete={exportProgress?.stage === "complete"}
      onclick={onExport}
      type="button"
      aria-label="Save as MP4 video"
    >
      <i
        class="fas"
        class:fa-download={exportProgress?.stage !== "complete"}
        class:fa-check={exportProgress?.stage === "complete"}
      ></i>
      <span>
        {#if !isExporting}
          Save
        {:else if !exportProgress}
          Starting...
        {:else if exportProgress.stage === "capturing"}
          Capturing {Math.round(exportProgress.progress * 100)}%
        {:else if exportProgress.stage === "encoding"}
          Encoding...
        {:else if exportProgress.stage === "complete"}
          Complete!
        {:else}
          Saving...
        {/if}
      </span>
    </button>
  {/if}
</div>

<style>
  .export-button-container {
    width: 100%;
  }

  /* Export button */
  .export-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    padding: 12px 20px;
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.25) 0%,
      rgba(22, 163, 74, 0.2) 100%
    );
    border: 1.5px solid rgba(34, 197, 94, 0.4);
    border-radius: 12px;
    color: rgba(134, 239, 172, 1);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 2px 8px rgba(34, 197, 94, 0.15),
      0 0 16px rgba(34, 197, 94, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .export-btn.complete {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.35) 0%,
      rgba(22, 163, 74, 0.3) 100%
    );
    border-color: rgba(34, 197, 94, 0.6);
  }

  .export-btn.cancelling {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(220, 38, 38, 0.2) 100%
    );
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(254, 202, 202, 1);
    box-shadow:
      0 2px 8px rgba(239, 68, 68, 0.15),
      0 0 16px rgba(239, 68, 68, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .export-btn:hover:not(.cancelling) {
      background: linear-gradient(
        135deg,
        rgba(34, 197, 94, 0.35) 0%,
        rgba(22, 163, 74, 0.3) 100%
      );
      border-color: rgba(34, 197, 94, 0.6);
      transform: translateY(-1px);
      box-shadow:
        0 4px 14px rgba(34, 197, 94, 0.25),
        0 0 20px rgba(34, 197, 94, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .export-btn.cancelling:hover {
      background: linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.35) 0%,
        rgba(220, 38, 38, 0.3) 100%
      );
      border-color: rgba(239, 68, 68, 0.6);
      transform: translateY(-1px);
      box-shadow:
        0 4px 14px rgba(239, 68, 68, 0.25),
        0 0 20px rgba(239, 68, 68, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  .export-btn:active {
    transform: scale(0.98);
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: rgba(134, 239, 172, 0.8);
    transition: width 0.2s ease-out;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .export-btn {
      min-height: 48px;
      padding: 10px 16px;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 375px) and (max-height: 670px) {
    .export-btn {
      min-height: 44px;
      padding: 8px 14px;
      font-size: 0.8rem;
    }
  }
</style>
