<!--
  ExportActionsPanel.svelte

  GIF export button for Animation Panel.
  Animation Panel focuses on animated GIF export.
  Static image export lives in Share Panel.
-->
<script lang="ts">
  let {
    onExportGif = () => {},
  }: {
    onExportGif?: () => void;
  } = $props();
</script>

<div class="export-actions-panel">
  <button
    class="export-btn gif-btn"
    onclick={onExportGif}
    type="button"
    aria-label="Export as GIF"
  >
    <i class="fas fa-film"></i>
    <span class="btn-label">Export GIF</span>
    <span class="btn-hint">Save animation</span>
  </button>
</div>

<style>
  .export-actions-panel {
    display: flex;
    padding: 8px;
  }

  .export-btn {
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
