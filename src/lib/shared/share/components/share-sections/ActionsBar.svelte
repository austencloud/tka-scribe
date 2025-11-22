<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import ContentTypeSelector from "../ContentTypeSelector.svelte";

  type ContentType = "video" | "animation" | "image";

  let {
    selectedTypes = $bindable<ContentType[]>([]),
    canShare = false,
    isDownloading = false,
    hapticService = null,
    onDownload,
    onShare,
    onInstagram,
    onOpenPreview,
  }: {
    selectedTypes?: ContentType[];
    canShare: boolean;
    isDownloading: boolean;
    hapticService: IHapticFeedbackService | null;
    onDownload: () => void;
    onShare: () => void;
    onInstagram: () => void;
    onOpenPreview: () => void;
  } = $props();

  function handleDownload() {
    hapticService?.trigger("selection");
    onDownload();
  }

  function handleShare() {
    hapticService?.trigger("selection");
    onShare();
  }

  function handleInstagram() {
    hapticService?.trigger("selection");
    onInstagram();
  }

  function handleOpenPreview() {
    hapticService?.trigger("selection");
    onOpenPreview();
  }
</script>

<section class="unified-actions-section">
  <!-- Content Type Row -->
  <div class="content-type-row">
    <ContentTypeSelector bind:selectedTypes />
  </div>

  <!-- Primary Actions Row -->
  <div class="primary-actions-row">
    <button
      class="action-btn primary"
      disabled={!canShare}
      onclick={handleDownload}
    >
      {#if isDownloading}
        <span class="btn-spinner"></span>
      {:else}
        <i class="fas fa-download"></i>
      {/if}
      <span>Download</span>
    </button>

    <button
      class="action-btn secondary"
      disabled={!canShare}
      onclick={handleShare}
    >
      <i class="fas fa-share-nodes"></i>
      <span>Share</span>
    </button>

    <button
      class="action-btn social-compact instagram"
      disabled={!canShare}
      onclick={handleInstagram}
    >
      <i class="fab fa-instagram"></i>
      <span>Instagram</span>
    </button>
  </div>

  <!-- Preview Options Row -->
  {#if selectedTypes.includes("image")}
    <button
      class="preview-options-compact"
      onclick={handleOpenPreview}
      disabled={!canShare}
    >
      <i class="fas fa-sliders"></i>
      <span>Preview & Options</span>
      <i class="fas fa-chevron-right"></i>
    </button>
  {/if}
</section>

<style>
  .unified-actions-section {
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 1.8vh, 14px);
    width: 100%;
  }

  .content-type-row {
    width: 100%;
  }

  .primary-actions-row {
    display: flex;
    gap: clamp(8px, 1.5vw, 12px);
    width: 100%;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1vw, 8px);
    padding: clamp(10px, 1.5vh, 14px) clamp(12px, 2vw, 16px);
    border: none;
    border-radius: 8px;
    font-size: clamp(13px, 1.2vw, 15px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    min-height: 42px;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
  }

  .action-btn.secondary {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
  }

  .action-btn.instagram {
    background: linear-gradient(135deg, #e1306c 0%, #c13584 50%, #833ab4 100%);
    color: white;
  }

  .action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .preview-options-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: clamp(10px, 1.5vh, 14px) clamp(12px, 2vw, 16px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-color);
    font-size: clamp(13px, 1.2vw, 15px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: clamp(8px, 1.5vw, 12px);
  }

  .preview-options-compact:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .preview-options-compact:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-options-compact i:last-child {
    opacity: 0.5;
    font-size: 0.9em;
  }
</style>
