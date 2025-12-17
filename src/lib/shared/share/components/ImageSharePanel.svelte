<!-- SharePanel.svelte - Image Composition and Sharing Interface -->
<script module lang="ts">
  export type ViewMode = "main" | "preview";
</script>

<script lang="ts">
  import { browser } from "$app/environment";
  import type { SequenceData } from "../../foundation/domain/models/SequenceData";
  import type { ISequenceEncoderService } from "$lib/shared/navigation/services/contracts/ISequenceEncoderService";
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import type { IShareService } from "../services/contracts/IShareService";
  import { createShareState } from "../state/share-state.svelte";
  import InstagramLinkSheet from "./InstagramLinkSheet.svelte";
  import { getInstagramLink } from "../domain/models/InstagramLink";
  import type { InstagramLink } from "../domain/models/InstagramLink";
  import { createServiceResolver } from "../../utils/service-resolver.svelte";
  import { getSettings } from "../../application/state/app-state.svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);
  let sequenceEncoderService: ISequenceEncoderService | null = $state(null);

  // Reactive settings - properly tracks changes
  let settings = $derived(getSettings());

  let {
    currentSequence = null,
    shareState: providedShareState = null,
    viewMode = $bindable("main"),
    onClose: _onClose,
    onSequenceUpdate,
    onExpandedChange,
  }: {
    currentSequence?: SequenceData | null;
    shareState?: ReturnType<typeof createShareState> | null;
    viewMode?: ViewMode;
    onClose?: () => void;
    onSequenceUpdate?: (sequence: SequenceData) => void;
    onExpandedChange?: (expanded: boolean) => void;
  } = $props();

  // Copy link state
  let isCopyingLink = $state(false);

  // Instagram modal state
  let showInstagramModal = $state(false);

  // Options configuration
  const exportOptions = [
    { key: "addWord" as const, label: "Word", icon: "fa-font" },
    { key: "addBeatNumbers" as const, label: "Beat #s", icon: "fa-list-ol" },
    {
      key: "addDifficultyLevel" as const,
      label: "Difficulty",
      icon: "fa-signal",
    },
    { key: "includeStartPosition" as const, label: "Start", icon: "fa-play" },
    { key: "addUserInfo" as const, label: "User", icon: "fa-user" },
  ];

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    sequenceEncoderService = resolve<ISequenceEncoderService>(
      TYPES.ISequenceEncoderService
    );
  });

  // HMR-safe service resolution
  const shareServiceResolver = createServiceResolver<IShareService>(
    TYPES.IShareService
  );

  // Use provided share state or create a new one
  // IMPORTANT: Track the service instance to avoid recreating shareState on every render
  let shareState = $state<ReturnType<typeof createShareState> | null>(null);
  let lastServiceInstance: IShareService | null = null;

  $effect(() => {
    if (providedShareState) {
      shareState = providedShareState;
      lastServiceInstance = null;
    } else if (shareServiceResolver.value) {
      // Only create new shareState if service changed or shareState doesn't exist
      if (shareServiceResolver.value !== lastServiceInstance || !shareState) {
        lastServiceInstance = shareServiceResolver.value;
        shareState = createShareState(shareServiceResolver.value);
      }
    } else {
      shareState = null;
      lastServiceInstance = null;
    }
  });

  // Generate image preview - regenerates when sequence, options, OR prop types change
  $effect(() => {
    if (providedShareState) return;
    if (!shareState || !currentSequence || currentSequence.beats?.length === 0)
      return;

    // Track dependencies: options AND current prop types from settings
    // Using $derived(getSettings()) properly tracks reactive changes
    const options = shareState.options;
    const blueProp = settings.bluePropType;
    const redProp = settings.redPropType;
    const legacyProp = settings.propType;

    // Regenerate preview when any dependency changes
    shareState.generatePreview(currentSequence);
  });

  // Event handlers
  async function handleDownload() {
    if (!shareState || !currentSequence || shareState.isDownloading) return;
    try {
      await shareState.downloadImage(currentSequence);
      hapticService?.trigger("success");
    } catch (error) {
      console.error("Download failed:", error);
      hapticService?.trigger("error");
    }
  }

  async function handleShareViaDevice() {
    if (!shareState || !currentSequence || shareState.isDownloading) return;
    hapticService?.trigger("selection");

    if (navigator.share && navigator.canShare) {
      try {
        const shareService = resolve<any>(TYPES.IShareService);
        const blob = await shareService.getImageBlob(
          currentSequence,
          shareState.options
        );
        const filename = shareService.generateFilename(
          currentSequence,
          shareState.options
        );
        const mimeType =
          shareState.options.format === "PNG"
            ? "image/png"
            : shareState.options.format === "JPEG"
              ? "image/jpeg"
              : "image/webp";
        const file = new File([blob], filename, {
          type: mimeType,
          lastModified: Date.now(),
        });
        const shareData = {
          title: "TKA Sequence",
          text: `Check out this TKA sequence: ${currentSequence?.name || "Untitled"}`,
          files: [file],
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          hapticService?.trigger("success");
          return;
        } else {
          await navigator.share({
            title: "TKA Sequence",
            text: `Check out this TKA sequence: ${currentSequence?.name || "Untitled"}`,
            url: window.location.href,
          });
          hapticService?.trigger("success");
          return;
        }
      } catch {
        hapticService?.trigger("error");
        return;
      }
    }
    alert(
      "Sharing not available on this device. Use the download button to save the image."
    );
    hapticService?.trigger("error");
  }

  async function handleCopyLink() {
    if (!currentSequence || isCopyingLink || !sequenceEncoderService) return;
    try {
      // Use the standalone sequence viewer URL format
      const { url } = sequenceEncoderService.generateViewerURL(
        currentSequence,
        { compress: true }
      );
      await navigator.clipboard.writeText(url);
      isCopyingLink = true;
      hapticService?.trigger("success");
      setTimeout(() => {
        isCopyingLink = false;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      hapticService?.trigger("error");
    }
  }

  function handleInstagramPost() {
    hapticService?.trigger("selection");
  }

  function handleRetryPreview() {
    if (currentSequence && shareState) {
      shareState.generatePreview(currentSequence, true);
    }
  }

  function handleToggle(
    key: keyof NonNullable<ReturnType<typeof createShareState>>["options"]
  ) {
    hapticService?.trigger("selection");
    if (!shareState) return;
    shareState.updateOptions({ [key]: !shareState.options[key] });
  }

  function handleSaveInstagramLink(link: InstagramLink) {
    if (!currentSequence) return;
    onSequenceUpdate?.({
      ...currentSequence,
      metadata: { ...currentSequence.metadata, instagramLink: link },
    });
  }

  function handleRemoveInstagramLink() {
    if (!currentSequence) return;
    const { instagramLink: _, ...restMetadata } = currentSequence.metadata;
    onSequenceUpdate?.({ ...currentSequence, metadata: restMetadata });
  }

  let canShare = $derived(() =>
    Boolean(
      browser &&
        shareState &&
        currentSequence &&
        currentSequence.beats?.length > 0 &&
        !shareState.isDownloading
    )
  );
  let hasSequence = $derived(() =>
    Boolean(currentSequence && currentSequence.beats?.length > 0)
  );
  let instagramLink = $derived(() =>
    currentSequence ? getInstagramLink(currentSequence.metadata) : null
  );
</script>

<div class="share-panel">
  <!-- IMAGE PREVIEW SECTION -->
  <section class="preview-section">
    {#if !currentSequence || currentSequence.beats?.length === 0}
      <div class="preview-empty">
        <i class="fas fa-image"></i>
        <span>Add beats to preview</span>
      </div>
    {:else if shareState?.isGeneratingPreview}
      <div class="preview-loading">
        <div class="spinner"></div>
        <span>Generating...</span>
      </div>
    {:else if shareState?.previewError}
      <div class="preview-error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>Preview failed</span>
        <button onclick={handleRetryPreview}>Retry</button>
      </div>
    {:else if shareState?.previewUrl}
      <img src={shareState.previewUrl} alt="Preview" class="preview-image" />
      <button
        class="refresh-btn"
        onclick={handleRetryPreview}
        title="Regenerate"
        aria-label="Regenerate preview"
      >
        <i class="fas fa-sync-alt"></i>
      </button>
    {/if}
  </section>

  <!-- IMAGE COMPOSITION OPTIONS -->
  <section class="options-section">
    <div class="options-chips">
      {#each exportOptions as opt}
        <button
          class="chip"
          class:active={shareState?.options[opt.key]}
          onclick={() => handleToggle(opt.key)}
          disabled={!canShare()}
        >
          <i class="fas {opt.icon}"></i>
          <span>{opt.label}</span>
        </button>
      {/each}
    </div>
  </section>

  <!-- PRIMARY ACTIONS - Main buttons -->
  <section class="actions-section">
    <div class="action-row">
      <button
        class="action-btn download-btn"
        disabled={!canShare()}
        onclick={handleDownload}
      >
        {#if shareState?.isDownloading}
          <span class="btn-spinner"></span>
        {:else}
          <i class="fas fa-download"></i>
        {/if}
        <span class="btn-label">Download</span>
        <span class="btn-hint">Save to device</span>
      </button>

      <button
        class="action-btn share-btn"
        disabled={!canShare()}
        onclick={handleShareViaDevice}
      >
        <i class="fas fa-share-nodes"></i>
        <span class="btn-label">Share</span>
        <span class="btn-hint">Send to others</span>
      </button>
    </div>

    <div class="action-row">
      <button
        class="action-btn link-btn"
        disabled={!canShare() || isCopyingLink}
        onclick={handleCopyLink}
      >
        <i class="fas {isCopyingLink ? 'fa-check' : 'fa-link'}"></i>
        <span class="btn-label">{isCopyingLink ? "Copied!" : "Copy Link"}</span>
        <span class="btn-hint">Share via URL</span>
      </button>

      <button
        class="action-btn instagram-btn"
        disabled={!canShare()}
        onclick={handleInstagramPost}
      >
        <i class="fab fa-instagram"></i>
        <span class="btn-label">Instagram</span>
        <span class="btn-hint">Post to story</span>
      </button>
    </div>
  </section>
</div>

<InstagramLinkSheet
  show={showInstagramModal}
  existingLink={instagramLink()}
  onSave={handleSaveInstagramLink}
  onRemove={handleRemoveInstagramLink}
  onClose={() => (showInstagramModal = false)}
/>

<style>
  .share-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 16px;
    gap: 12px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* ============================================
     PREVIEW SECTION - Fills available space
     ============================================ */
  .preview-section {
    flex: 1 1 auto;
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }

  .preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .preview-empty,
  .preview-loading,
  .preview-error,
  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
  }

  .preview-empty i,
  .preview-error i {
    font-size: 32px;
    opacity: 0.5;
  }

  .preview-error {
    color: #ef4444;
  }
  .preview-error button {
    margin-top: 4px;
    padding: 6px 14px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-radius: 6px;
    color: #ef4444;
    font-size: 12px;
    cursor: pointer;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .refresh-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    min-width: var(--min-touch-target);
    min-height: var(--min-touch-target);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    opacity: 0.6;
    transition: all 0.2s;
  }

  .refresh-btn:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.8);
  }

  /* ============================================
     ANIMATION CONTAINER
     ============================================ */
  .animation-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* ============================================
     PREVIEW MODE SELECTOR
     ============================================ */
  .mode-section {
    flex-shrink: 0;
  }

  .mode-row {
    display: flex;
    gap: 6px;
    background: rgba(255, 255, 255, 0.03);
    padding: 4px;
    border-radius: 10px;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 16px;
    min-height: var(--min-touch-target);
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-btn:hover:not(:disabled) {
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.05);
  }

  .mode-btn.selected {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
  }

  .mode-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* ============================================
     OPTIONS CHIPS - Horizontal wrap
     ============================================ */
  .options-section {
    flex-shrink: 0;
  }

  .options-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 18px;
    min-height: var(--min-touch-target);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }

  .chip i {
    font-size: 12px;
  }

  .chip:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .chip.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.5);
    color: #60a5fa;
  }

  .chip:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ============================================
     ACTION BUTTONS - 2x2 Grid (Colored Glass Style)
     ============================================ */
  .actions-section {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-row {
    display: flex;
    gap: 8px;
  }

  /* Shared button styles - Colored Glass */
  .action-btn {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 14px 12px;
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

  /* Download Button - Blue theme */
  .download-btn {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.15) 0%,
      rgba(37, 99, 235, 0.12) 100%
    );
    border: 1.5px solid rgba(59, 130, 246, 0.3);
    box-shadow:
      0 2px 8px rgba(59, 130, 246, 0.12),
      0 0 16px rgba(59, 130, 246, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .download-btn i {
    color: rgba(59, 130, 246, 1);
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

  /* Link Button - Green theme */
  .link-btn {
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.15) 0%,
      rgba(5, 150, 105, 0.12) 100%
    );
    border: 1.5px solid rgba(16, 185, 129, 0.3);
    box-shadow:
      0 2px 8px rgba(16, 185, 129, 0.12),
      0 0 16px rgba(16, 185, 129, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .link-btn i {
    color: rgba(16, 185, 129, 1);
  }

  /* Instagram Button - Gradient theme */
  .instagram-btn {
    background: linear-gradient(
      135deg,
      rgba(245, 96, 64, 0.15) 0%,
      rgba(193, 53, 132, 0.12) 50%,
      rgba(131, 58, 180, 0.12) 100%
    );
    border: 1.5px solid rgba(193, 53, 132, 0.3);
    box-shadow:
      0 2px 8px rgba(193, 53, 132, 0.12),
      0 0 16px rgba(193, 53, 132, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .instagram-btn i {
    color: rgba(193, 53, 132, 1);
  }

  /* Hover states */
  @media (hover: hover) and (pointer: fine) {
    .download-btn:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.25) 0%,
        rgba(37, 99, 235, 0.2) 100%
      );
      border-color: rgba(59, 130, 246, 0.5);
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px rgba(59, 130, 246, 0.2),
        0 0 24px rgba(59, 130, 246, 0.15),
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

    .link-btn:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(16, 185, 129, 0.25) 0%,
        rgba(5, 150, 105, 0.2) 100%
      );
      border-color: rgba(16, 185, 129, 0.5);
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px rgba(16, 185, 129, 0.2),
        0 0 24px rgba(16, 185, 129, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }

    .instagram-btn:hover:not(:disabled) {
      background: linear-gradient(
        135deg,
        rgba(245, 96, 64, 0.25) 0%,
        rgba(193, 53, 132, 0.2) 50%,
        rgba(131, 58, 180, 0.2) 100%
      );
      border-color: rgba(193, 53, 132, 0.5);
      transform: translateY(-2px);
      box-shadow:
        0 4px 16px rgba(193, 53, 132, 0.2),
        0 0 24px rgba(193, 53, 132, 0.15),
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
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-spinner {
    width: 22px;
    height: 22px;
    border: 2px solid rgba(59, 130, 246, 0.3);
    border-top-color: rgba(59, 130, 246, 1);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
