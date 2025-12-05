<!--
  ExportActionsPanel.svelte

  GIF export button for Animation Panel.
  Animation Panel focuses on animated GIF export.
  Static image export lives in Share Panel.
-->
<script lang="ts">
  let {
    onExportGif = () => {},
    isExporting = false,
    exportProgress = null,
  }: {
    onExportGif?: () => void;
    isExporting?: boolean;
    exportProgress?: { progress: number; stage: string } | null;
  } = $props();

  function handleClick() {
    if (isExporting) return; // Prevent double-clicks
    console.log("🎬 ExportActionsPanel: Export GIF button clicked");
    console.log("🎬 onExportGif handler:", onExportGif);
    onExportGif();
  }

  // Derive display text based on export state
  const buttonText = $derived(() => {
    if (!isExporting) return "Export GIF";
    if (!exportProgress) return "Starting...";

    const { stage, progress } = exportProgress;
    if (stage === "capturing") {
      return `Capturing ${Math.round(progress * 100)}%`;
    } else if (stage === "encoding") {
      return "Encoding GIF...";
    } else if (stage === "transcoding") {
      return "Transcoding...";
    } else if (stage === "complete") {
      return "Complete!";
    }
    return "Exporting...";
  });

  const buttonHint = $derived(() => {
    if (!isExporting) return "Save animation";
    if (exportProgress?.stage === "complete") return "Download started";
    return "Please wait...";
  });
</script>

<div class="export-actions-panel">
  <button
    class="export-btn gif-btn"
    class:exporting={isExporting}
    class:complete={exportProgress?.stage === "complete"}
    onclick={handleClick}
    type="button"
    disabled={isExporting && exportProgress?.stage !== "complete"}
    aria-label={isExporting ? "Exporting GIF..." : "Export as GIF"}
  >
    <i class="fas" class:fa-film={!isExporting} class:fa-spinner={isExporting && exportProgress?.stage !== "complete"} class:fa-spin={isExporting && exportProgress?.stage !== "complete"} class:fa-check={exportProgress?.stage === "complete"}></i>
    <span class="btn-label">{buttonText()}</span>
    <span class="btn-hint">{buttonHint()}</span>

    {#if isExporting && exportProgress?.stage === "capturing"}
      <div class="progress-bar">
        <div class="progress-fill" style="width: {exportProgress.progress * 100}%"></div>
      </div>
    {/if}
  </button>
</div>

<style>
  .export-actions-panel {
    display: flex;
    padding: 8px;
  }

  .export-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 16px;
    width: 100%;
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
  }

  .export-btn i {
    font-size: 24px;
    transition: transform 0.2s ease;
    color: rgba(168, 85, 247, 1);
  }

  .btn-label {
    font-size: 13px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: 0.3px;
  }

  .btn-hint {
    font-size: 10px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.2px;
  }

  @media (hover: hover) and (pointer: fine) {
    .export-btn:hover {
      background: linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%);
      border-color: rgba(168, 85, 247, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
    }

    .export-btn:hover i {
      transform: scale(1.1);
    }
  }

  .export-btn:active {
    transform: scale(0.98);
  }

  .export-btn:disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }

  .export-btn.exporting {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
  }

  .export-btn.complete {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.15) 100%);
    border-color: rgba(34, 197, 94, 0.5);
  }

  .export-btn.complete i {
    color: rgba(34, 197, 94, 1);
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 0 0 12px 12px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, rgba(168, 85, 247, 1) 0%, rgba(147, 51, 234, 1) 100%);
    transition: width 0.3s ease;
  }

  /* Responsive */
  @media (max-width: 360px) {
    .export-btn {
      padding: 14px;
    }

    .export-btn i {
      font-size: 22px;
    }

    .btn-label {
      font-size: 12px;
    }

    .btn-hint {
      font-size: 9px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .export-btn,
    .export-btn i {
      transition: none;
    }

    .export-btn:hover,
    .export-btn:active {
      transform: none;
    }
  }
</style>
