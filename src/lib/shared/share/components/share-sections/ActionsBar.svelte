<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import ContentTypeSelector from "../ContentTypeSelector.svelte";

  type ContentType = "video" | "animation" | "image";

  let {
    selectedTypes = $bindable<ContentType[]>([]),
    canShare = false,
    isDownloading = false,
    isCopyingLink = false,
    hapticService = null,
    hidePreviewButton = false,
    onDownload,
    onShare,
    onInstagram,
    onCopyLink,
    onOpenPreview,
  }: {
    selectedTypes?: ContentType[];
    canShare: boolean;
    isDownloading: boolean;
    isCopyingLink?: boolean;
    hapticService: IHapticFeedbackService | null;
    hidePreviewButton?: boolean;
    onDownload: () => void;
    onShare: () => void;
    onInstagram: () => void;
    onCopyLink: () => void;
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

  function handleCopyLink() {
    hapticService?.trigger("selection");
    onCopyLink();
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
      <span class="btn-icon">
        {#if isDownloading}
          <span class="btn-spinner"></span>
        {:else}
          <i class="fas fa-download"></i>
        {/if}
      </span>
      <span class="btn-label">Download</span>
      <span class="btn-shine"></span>
    </button>

    <button
      class="action-btn secondary"
      disabled={!canShare}
      onclick={handleShare}
    >
      <span class="btn-icon"><i class="fas fa-share-nodes"></i></span>
      <span class="btn-label">Share</span>
      <span class="btn-shine"></span>
    </button>

    <button
      class="action-btn tertiary"
      disabled={!canShare || isCopyingLink}
      onclick={handleCopyLink}
    >
      <span class="btn-icon">
        {#if isCopyingLink}
          <i class="fas fa-check"></i>
        {:else}
          <i class="fas fa-link"></i>
        {/if}
      </span>
      <span class="btn-label">{isCopyingLink ? "Copied!" : "Copy Link"}</span>
      <span class="btn-shine"></span>
    </button>
  </div>

  <!-- Social Actions Row -->
  <div class="social-actions-row">
    <button
      class="action-btn social-compact instagram"
      disabled={!canShare}
      onclick={handleInstagram}
    >
      <span class="btn-icon"><i class="fab fa-instagram"></i></span>
      <span class="btn-label">Instagram</span>
      <span class="btn-shine"></span>
    </button>
  </div>

  <!-- Preview Options Row - only show if not hidden -->
  {#if selectedTypes.includes("image") && !hidePreviewButton}
    <button
      class="preview-options-compact"
      onclick={handleOpenPreview}
      disabled={!canShare}
    >
      <span class="preview-left">
        <i class="fas fa-sliders"></i>
        <span>Preview & Options</span>
      </span>
      <i class="fas fa-chevron-right chevron"></i>
    </button>
  {/if}
</section>

<style>
  .unified-actions-section {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2cqw, 16px);
    width: 100%;
  }

  .content-type-row {
    width: 100%;
  }

  .primary-actions-row {
    display: flex;
    gap: clamp(8px, 1.5cqw, 12px);
    width: 100%;
  }

  /* ============================================
     MODERN GLASS BUTTON STYLING
     ============================================ */
  .action-btn {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1cqw, 10px);
    padding: clamp(12px, 1.8cqh, 16px) clamp(14px, 2cqw, 20px);
    border: none;
    border-radius: 12px;
    font-size: clamp(13px, 1.2cqw, 15px);
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    min-height: 48px;
    overflow: hidden;
    isolation: isolate;

    /* Glass morphism base */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);

    /* Smooth transitions */
    transition:
      transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.25s ease,
      filter 0.2s ease;
  }

  .btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1em;
    z-index: 1;
  }

  .btn-label {
    z-index: 1;
  }

  /* Shine effect overlay */
  .btn-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 50%,
      transparent 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }

  .action-btn:hover:not(:disabled) .btn-shine {
    opacity: 1;
  }

  /* Primary - Blue */
  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(59, 130, 246, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.primary:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 8px 24px rgba(59, 130, 246, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .action-btn.primary:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  /* Secondary - Purple */
  .action-btn.secondary {
    background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(139, 92, 246, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.secondary:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 8px 24px rgba(139, 92, 246, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .action-btn.secondary:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  /* Tertiary - Green */
  .action-btn.tertiary {
    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(16, 185, 129, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.tertiary:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 8px 24px rgba(16, 185, 129, 0.45),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .action-btn.tertiary:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  /* Instagram - Gradient */
  .action-btn.instagram {
    background: linear-gradient(135deg, #f56040 0%, #e1306c 40%, #c13584 70%, #833ab4 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(225, 48, 108, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.instagram:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow:
      0 8px 24px rgba(225, 48, 108, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }

  .action-btn.instagram:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  .social-actions-row {
    display: flex;
    gap: clamp(8px, 1.5cqw, 12px);
    width: 100%;
  }

  .social-actions-row .action-btn {
    flex: none;
    width: auto;
    padding: clamp(10px, 1.4cqh, 14px) clamp(18px, 3cqw, 28px);
  }

  .action-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    filter: grayscale(30%);
    transform: none !important;
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

  /* ============================================
     PREVIEW OPTIONS BUTTON
     ============================================ */
  .preview-options-compact {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: clamp(12px, 1.6cqh, 16px) clamp(14px, 2cqw, 20px);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: var(--text-color, rgba(255, 255, 255, 0.9));
    font-size: clamp(13px, 1.2cqw, 15px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .preview-left {
    display: flex;
    align-items: center;
    gap: clamp(10px, 1.5cqw, 14px);
  }

  .preview-left i {
    font-size: 1.1em;
    opacity: 0.8;
  }

  .chevron {
    opacity: 0.5;
    font-size: 0.9em;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .preview-options-compact:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.04) 100%
    );
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(2px);
  }

  .preview-options-compact:hover:not(:disabled) .chevron {
    transform: translateX(4px);
    opacity: 0.8;
  }

  .preview-options-compact:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* ============================================
     RESPONSIVE ADJUSTMENTS
     ============================================ */
  @container (max-width: 380px) {
    .btn-label {
      font-size: 0.85em;
    }

    .action-btn {
      padding: 10px 12px;
      min-height: 44px;
    }
  }
</style>
