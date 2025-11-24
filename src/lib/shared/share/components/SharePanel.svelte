<!-- SharePanel.svelte - Modern Share Interface with Advanced Options -->
<script lang="ts">
  import { browser } from "$app/environment";
  import type { IHapticFeedbackService, SequenceData } from "$shared";
  import { createServiceResolver, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { IShareService } from "../services/contracts";
  import { createShareState } from "../state";
  import InstagramLinkSheet from "./InstagramLinkSheet.svelte";
  import { getInstagramLink } from "../domain";
  import type { InstagramLink } from "../domain";
  import { ActionsBar, PreviewFullscreen } from "./share-sections";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Export ViewMode type for parent components
  export type ViewMode = "main" | "preview";

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

  // Content type state
  type ContentType = "video" | "animation" | "image";
  let selectedTypes = $state<ContentType[]>(["image"]);

  // Instagram modal state
  let showInstagramModal = $state(false);

  function openPreviewView() {
    viewMode = "preview";
    onExpandedChange?.(true);
  }

  function backToMainView() {
    viewMode = "main";
    onExpandedChange?.(false);
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // HMR-safe service resolution
  const shareServiceResolver = createServiceResolver<IShareService>(
    TYPES.IShareService
  );

  // Use provided share state or create a new one when service becomes available
  let shareState = $state<ReturnType<typeof createShareState> | null>(null);

  $effect(() => {
    // If a share state was provided (from background rendering), use it
    if (providedShareState) {
      shareState = providedShareState;
    } else if (shareServiceResolver.value) {
      // Otherwise create a new share state
      shareState = createShareState(shareServiceResolver.value);
    } else {
      shareState = null;
    }
  });

  // Only run preview generation effect when NOT using a provided state
  // When using provided state, ShareCoordinator handles all rendering
  $effect(() => {
    // Skip entirely if using provided state
    if (providedShareState) return;

    // Only for self-managed state (no background rendering)
    if (!shareState || !currentSequence || currentSequence.beats?.length === 0)
      return;

    // Track options as a dependency (so effect re-runs when options change)
    // Reference options to create reactive dependency
    void shareState.options;

    // Generate preview when sequence or options change
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

    // Try native sharing with actual image file
    if (navigator.share && navigator.canShare) {
      try {
        // Get the actual image blob from the share service
        const shareService = resolve<any>(TYPES.IShareService);
        const blob = await shareService.getImageBlob(
          currentSequence,
          shareState.options
        );

        // Create a File object with optimal metadata for Android sharing
        const filename = shareService.generateFilename(
          currentSequence,
          shareState.options
        );

        // Ensure proper MIME type based on format
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

        // Check if we can share files
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
          // Fallback to URL sharing if file sharing not supported
          await navigator.share({
            title: "TKA Sequence",
            text: `Check out this TKA sequence: ${currentSequence?.name || "Untitled"}`,
            url: window.location.href,
          });
          hapticService?.trigger("success");
          return;
        }
      } catch (error) {
        // Native sharing failed or was cancelled (user closed share dialog)
        hapticService?.trigger("error");
        return;
      }
    }

    // If no native sharing available, show message
    alert(
      "Sharing not available on this device. Use the download button to save the image."
    );
    hapticService?.trigger("error");
  }

  async function handleInstagramPost() {
    hapticService?.trigger("selection");
  }

  function handleRetryPreview() {
    if (currentSequence && shareState) {
      shareState.generatePreview(currentSequence, true); // Force regenerate (bypass cache)
    }
  }

  function handleSaveInstagramLink(link: InstagramLink) {
    if (!currentSequence) return;
    const updatedSequence = {
      ...currentSequence,
      metadata: {
        ...currentSequence.metadata,
        instagramLink: link,
      },
    };
    onSequenceUpdate?.(updatedSequence);
  }

  function handleRemoveInstagramLink() {
    if (!currentSequence) return;
    const { instagramLink, ...restMetadata } = currentSequence.metadata;
    const updatedSequence = {
      ...currentSequence,
      metadata: restMetadata,
    };
    onSequenceUpdate?.(updatedSequence);
  }

  function handleToggle(
    key: keyof NonNullable<ReturnType<typeof createShareState>>["options"]
  ) {
    hapticService?.trigger("selection");
    if (!shareState) return;
    shareState.updateOptions({ [key]: !shareState.options[key] });
  }

  let canShare = $derived(() => {
    return Boolean(
      browser &&
        shareState &&
        currentSequence &&
        currentSequence.beats?.length > 0 &&
        !shareState.isDownloading
    );
  });

  let instagramLink = $derived(() => {
    if (!currentSequence) return null;
    return getInstagramLink(currentSequence.metadata);
  });
</script>

<div class="share-panel-container">
  <div class="panel-content" class:preview-mode={viewMode === "preview"}>
    {#if viewMode === "main"}
      <ActionsBar
        bind:selectedTypes
        canShare={canShare()}
        isDownloading={shareState?.isDownloading ?? false}
        {hapticService}
        onDownload={handleDownload}
        onShare={handleShareViaDevice}
        onInstagram={handleInstagramPost}
        onOpenPreview={openPreviewView}
      />
    {:else}
      <PreviewFullscreen
        {currentSequence}
        {shareState}
        {hapticService}
        onBack={backToMainView}
        onRetry={handleRetryPreview}
      />
    {/if}
  </div>
</div>

<InstagramLinkSheet
  show={showInstagramModal}
  existingLink={instagramLink()}
  onSave={handleSaveInstagramLink}
  onRemove={handleRemoveInstagramLink}
  onClose={() => (showInstagramModal = false)}
/>

<style>
  /* Container query support */
  .share-panel-container {
    container-type: inline-size;
    container-name: share-panel;
    width: 100%;
    height: 100%;
  }

  /* Main Content Area - Container-aware adaptive layout */
  .panel-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    /* Intelligent padding that adapts to container height */
    padding: clamp(12px, 2.5vh, 20px);
    overflow-y: auto;
    overflow-x: hidden;
    container-type: size; /* Track both width AND height */
    container-name: panel-content;
  }

  /* Main view: minimal gap for compact layout */
  .panel-content:not(.preview-mode) {
    gap: clamp(10px, 1.5vh, 16px);
  }

  /* Preview mode: tighter spacing for content density */
  .panel-content.preview-mode {
    gap: clamp(12px, 1.5vh, 18px);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>
