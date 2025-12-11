<!--
  ExportActionsPanel.svelte

  2026 Bento Box Design - GIF export and share buttons
  Animation Panel focuses on animated GIF export and sharing.
  Static image export lives in Share Panel.
-->
<script lang="ts">
  let {
    onExportGif = () => {},
    onShareAnimation = () => {},
    isExporting = false,
    exportProgress = null,
    isSharing = false,
  }: {
    onExportGif?: () => void;
    onShareAnimation?: () => void;
    isExporting?: boolean;
    exportProgress?: { progress: number; stage: string } | null;
    isSharing?: boolean;
  } = $props();

  function handleExportClick() {
    if (isExporting) return; // Prevent double-clicks
    console.log("🎬 ExportActionsPanel: Export GIF button clicked");
    console.log("🎬 onExportGif handler:", onExportGif);
    onExportGif();
  }

  function handleShareClick() {
    if (isSharing || isExporting) return; // Prevent double-clicks
    console.log("📤 ExportActionsPanel: Share animation button clicked");
    onShareAnimation();
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
  <!-- Export GIF Button -->
  <button
    class="action-btn export-btn"
    class:exporting={isExporting}
    class:complete={exportProgress?.stage === "complete"}
    onclick={handleExportClick}
    type="button"
    disabled={isExporting && exportProgress?.stage !== "complete"}
    aria-label={isExporting ? "Exporting GIF..." : "Export as GIF"}
  >
    <i class="fas" class:fa-download={!isExporting} class:fa-spinner={isExporting && exportProgress?.stage !== "complete"} class:fa-spin={isExporting && exportProgress?.stage !== "complete"} class:fa-check={exportProgress?.stage === "complete"}></i>
    <span class="btn-label">{buttonText()}</span>
    <span class="btn-hint">{buttonHint()}</span>

    {#if isExporting && exportProgress?.stage === "capturing"}
      <div class="progress-bar">
        <div class="progress-fill" style="width: {exportProgress.progress * 100}%"></div>
      </div>
    {/if}
  </button>

  <!-- Share Animation Button -->
  <button
    class="action-btn share-btn"
    class:sharing={isSharing}
    onclick={handleShareClick}
    type="button"
    disabled={isSharing || isExporting}
    aria-label={isSharing ? "Sharing..." : "Share animation"}
  >
    <i class="fas" class:fa-share-nodes={!isSharing} class:fa-spinner={isSharing} class:fa-spin={isSharing}></i>
    <span class="btn-label">{isSharing ? "Sharing..." : "Share"}</span>
    <span class="btn-hint">{isSharing ? "Please wait..." : "Send to others"}</span>
  </button>
</div>

<style>
  /* ===========================
     2026 BENTO BOX DESIGN
     Export Actions Panel
     =========================== */

  .export-actions-panel {
    display: flex;
    gap: 8px;
    width: 100%;
  }

  /* Shared button styles */
  .action-btn {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 14px 12px;
    flex: 1;
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
  }

  .action-btn i {
    font-size: 22px;
    transition: transform 0.2s ease;
  }

  .btn-label {
    font-size: 0.8rem;
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

  /* Export GIF Button - Purple theme */
  .export-btn {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.15) 0%,
      rgba(147, 51, 234, 0.12) 100%
    );
    border: 1.5px solid rgba(168, 85, 247, 0.3);
    box-shadow:
      0 2px 8px rgba(168, 85, 247, 0.12),
      0 0 16px rgba(168, 85, 247, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .export-btn i {
    color: rgba(168, 85, 247, 1);
  }

  /* Share Button - Pink/Magenta theme */
  .share-btn {
    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.15) 0%,
      rgba(219, 39, 119, 0.12) 100%
    );
    border: 1.5px solid rgba(236, 72, 153, 0.3);
    box-shadow:
      0 2px 8px rgba(236, 72, 153, 0.12),
      0 0 16px rgba(236, 72, 153, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .share-btn i {
    color: rgba(236, 72, 153, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .export-btn:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(168, 85, 247, 0.25) 0%,
        rgba(147, 51, 234, 0.2) 100%
      );
      border-color: rgba(168, 85, 247, 0.5);
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px rgba(168, 85, 247, 0.2),
        0 0 24px rgba(168, 85, 247, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .share-btn:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(236, 72, 153, 0.25) 0%,
        rgba(219, 39, 119, 0.2) 100%
      );
      border-color: rgba(236, 72, 153, 0.5);
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px rgba(236, 72, 153, 0.2),
        0 0 24px rgba(236, 72, 153, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .action-btn:hover i {
      transform: scale(1.08);
    }
  }

  .action-btn:active:not(:disabled) {
    transform: scale(0.98);
  }

  .action-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .export-btn.exporting {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.18) 0%,
      rgba(147, 51, 234, 0.15) 100%
    );
  }

  .export-btn.complete {
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.2) 0%,
      rgba(22, 163, 74, 0.15) 100%
    );
    border-color: rgba(34, 197, 94, 0.5);
    box-shadow:
      0 2px 12px rgba(34, 197, 94, 0.2),
      0 0 20px rgba(34, 197, 94, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .export-btn.complete i {
    color: rgba(34, 197, 94, 1);
  }

  .share-btn.sharing {
    background: linear-gradient(
      135deg,
      rgba(236, 72, 153, 0.18) 0%,
      rgba(219, 39, 119, 0.15) 100%
    );
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
      rgba(168, 85, 247, 1) 0%,
      rgba(147, 51, 234, 1) 100%
    );
    transition: width 0.3s ease;
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 360px) {
    .action-btn {
      padding: 12px 8px;
    }

    .action-btn i {
      font-size: 20px;
    }

    .btn-label {
      font-size: 0.75rem;
    }

    .btn-hint {
      font-size: 0.6rem;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .action-btn,
    .action-btn i {
      transition: none;
    }

    .action-btn:hover,
    .action-btn:active {
      transform: none;
    }
  }
</style>
