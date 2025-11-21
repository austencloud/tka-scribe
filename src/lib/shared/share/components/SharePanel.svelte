<!-- SharePanel.svelte - Modern Share Interface with Advanced Options -->
<script lang="ts">
  import { browser } from "$app/environment";
  import type {
    IHapticFeedbackService,
    SequenceData,
    // IDeviceDetector, // Reserved for future responsive features
  } from "$shared";
  import { createServiceResolver, resolve, TYPES } from "$shared";
  // import type { ResponsiveSettings } from "$shared/device/domain/models/device-models";
  import { onMount } from "svelte";
  import type { IShareService } from "../services/contracts";
  import { createShareState } from "../state";
  import InstagramLinkSheet from "./InstagramLinkSheet.svelte";
  import ContentTypeSelector from "./ContentTypeSelector.svelte";
  import { getInstagramLink } from "../domain";
  import type { InstagramLink } from "../domain";

  // Services
  let hapticService: IHapticFeedbackService;
  // let deviceDetector: IDeviceDetector | null = null; // Reserved for future use

  // Reactive responsive settings from DeviceDetector (reserved for future responsive features)
  // let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // Reactive mobile detection (available for future use)
  // const isMobile = $derived(responsiveSettings?.isMobile ?? false);

  let {
    currentSequence = null,
    shareState: providedShareState = null,
    onClose: _onClose,
    onSequenceUpdate,
    onExpandedChange,
  }: {
    currentSequence?: SequenceData | null;
    shareState?: ReturnType<typeof createShareState> | null;
    onClose?: () => void;
    onSequenceUpdate?: (sequence: SequenceData) => void;
    onExpandedChange?: (expanded: boolean) => void;
  } = $props();

  // Content type state
  type ContentType = "video" | "animation" | "image";
  let selectedTypes = $state<ContentType[]>(["image"]);

  // Instagram modal state
  let showInstagramModal = $state(false);

  // View mode state - swap between main and preview views
  type ViewMode = "main" | "preview";
  let viewMode = $state<ViewMode>("main");

  // Track if panel should be expanded (full height) - used by parent via callback

  // Open preview view (swap in place, expand panel)
  function openPreviewView() {
    hapticService?.trigger("selection");
    viewMode = "preview";
    onExpandedChange?.(true);
  }

  // Return to main view (collapse panel)
  function backToMainView() {
    hapticService?.trigger("selection");
    viewMode = "main";
    onExpandedChange?.(false);
  }

  onMount(() => {
    // Service resolution
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Initialize DeviceDetector service (reserved for future responsive features)
    // try {
    //   deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
    //   responsiveSettings = deviceDetector.getResponsiveSettings();

    //   // Return cleanup function from onCapabilitiesChanged
    //   return deviceDetector.onCapabilitiesChanged(() => {
    //     responsiveSettings = deviceDetector!.getResponsiveSettings();
    //   });
    // } catch (error) {
    //   console.warn("SharePanel: Failed to resolve DeviceDetector", error);
    // }

    // return undefined;
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
    // Instagram posting will be handled by the InstagramCarouselComposer
    // For now, just trigger feedback
  }

  function handleRetryPreview() {
    if (currentSequence && shareState) {
      shareState.generatePreview(currentSequence);
    }
  }

  // Instagram handlers (reserved for future use)
  // function handleAddInstagramLink() {
  //   showInstagramModal = true;
  // }

  // function handleEditInstagramLink() {
  //   showInstagramModal = true;
  // }

  function handleSaveInstagramLink(link: InstagramLink) {
    if (!currentSequence) return;

    // Update sequence metadata with Instagram link
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

    // Remove Instagram link from metadata
    const { instagramLink, ...restMetadata } = currentSequence.metadata;
    const updatedSequence = {
      ...currentSequence,
      metadata: restMetadata,
    };

    onSequenceUpdate?.(updatedSequence);
  }

  // Handle toggle with haptic feedback
  function handleToggle(
    key: keyof NonNullable<ReturnType<typeof createShareState>>["options"]
  ) {
    hapticService?.trigger("selection");
    if (!shareState) return;
    shareState.updateOptions({ [key]: !shareState.options[key] });
  }

  // Computed properties
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
      <!-- MAIN VIEW - Unified Compact Layout -->

      <!-- Unified Actions Section - Everything in one cohesive area -->
      <section class="unified-actions-section">
        <!-- Content Type Row -->
        <div class="content-type-row">
          <ContentTypeSelector bind:selectedTypes />
        </div>

        <!-- Primary Actions Row -->
        <div class="primary-actions-row">
          <button
            class="action-btn primary"
            disabled={!canShare()}
            onclick={handleDownload}
          >
            {#if shareState?.isDownloading}
              <span class="btn-spinner"></span>
            {:else}
              <i class="fas fa-download"></i>
            {/if}
            <span>Download</span>
          </button>

          <button
            class="action-btn secondary"
            disabled={!canShare()}
            onclick={handleShareViaDevice}
          >
            <i class="fas fa-share-nodes"></i>
            <span>Share</span>
          </button>

          <button
            class="action-btn social-compact instagram"
            disabled={!canShare()}
            onclick={handleInstagramPost}
          >
            <i class="fab fa-instagram"></i>
            <span>Instagram</span>
          </button>
        </div>

        <!-- Preview Options Row -->
        {#if selectedTypes.includes("image")}
          <button
            class="preview-options-compact"
            onclick={openPreviewView}
            disabled={!canShare()}
          >
            <i class="fas fa-sliders"></i>
            <span>Preview & Options</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        {/if}
      </section>
    {:else if viewMode === "preview"}
      <!-- PREVIEW VIEW -->

      <!-- Back Button -->
      <section class="preview-header">
        <button class="back-button" onclick={backToMainView}>
          <i class="fas fa-chevron-left"></i>
          <span>Back</span>
        </button>
        <h3>Preview & Options</h3>
      </section>

      <!-- Preview Section -->
      <section class="preview-section">
        {#if !currentSequence}
          <div class="preview-placeholder">
            <p>No sequence selected</p>
            <span>Create or select a sequence to see preview</span>
          </div>
        {:else if currentSequence.beats?.length === 0}
          <div class="preview-placeholder">
            <p>Empty sequence</p>
            <span>Add beats to generate preview</span>
          </div>
        {:else if shareState?.isGeneratingPreview}
          <div class="preview-loading">
            <div class="loading-spinner"></div>
            <p>Generating preview...</p>
          </div>
        {:else if shareState?.previewError}
          <div class="preview-error">
            <p>Preview failed</p>
            <span>{shareState.previewError}</span>
            <button class="retry-button" onclick={handleRetryPreview}
              >Try Again</button
            >
          </div>
        {:else if shareState?.previewUrl}
          <img
            src={shareState.previewUrl}
            alt="Sequence preview"
            class="preview-image"
          />
        {:else}
          <div class="preview-placeholder">
            <p>Preview will appear here</p>
          </div>
        {/if}
      </section>

      <!-- Image Options - Compact Toggles Only -->
      {#if shareState?.options}
        <section class="options-section">
          <div class="toggle-options-compact">
            <label class="toggle-option-compact">
              <input
                type="checkbox"
                checked={shareState.options.addWord}
                onchange={() => handleToggle("addWord")}
              />
              <span class="toggle-switch-compact"></span>
              <span class="toggle-label-compact">Word</span>
            </label>

            <label class="toggle-option-compact">
              <input
                type="checkbox"
                checked={shareState.options.addBeatNumbers}
                onchange={() => handleToggle("addBeatNumbers")}
              />
              <span class="toggle-switch-compact"></span>
              <span class="toggle-label-compact">Beats</span>
            </label>

            <label class="toggle-option-compact">
              <input
                type="checkbox"
                checked={shareState.options.addDifficultyLevel}
                onchange={() => handleToggle("addDifficultyLevel")}
              />
              <span class="toggle-switch-compact"></span>
              <span class="toggle-label-compact">Difficulty</span>
            </label>

            <label class="toggle-option-compact">
              <input
                type="checkbox"
                checked={shareState.options.includeStartPosition}
                onchange={() => handleToggle("includeStartPosition")}
              />
              <span class="toggle-switch-compact"></span>
              <span class="toggle-label-compact">Start Pos</span>
            </label>

            <label class="toggle-option-compact">
              <input
                type="checkbox"
                checked={shareState.options.addUserInfo}
                onchange={() => handleToggle("addUserInfo")}
              />
              <span class="toggle-switch-compact"></span>
              <span class="toggle-label-compact">User Info</span>
            </label>
          </div>
        </section>
      {/if}
    {/if}
  </div>
</div>

<!-- Instagram Link Sheet -->
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

  /* ============================================================================
     UNIFIED ACTIONS SECTION - Intelligent, Container-Aware Layout
     ============================================================================ */

  .unified-actions-section {
    /* Single cohesive section containing all actions */
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.02),
      rgba(255, 255, 255, 0.01)
    );
    border-radius: clamp(12px, 2vh, 16px);
    padding: clamp(12px, 1.8vh, 16px);
    border: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    flex-direction: column;
    gap: clamp(10px, 1.5vh, 14px);
    transition: all 0.3s ease;
  }

  .unified-actions-section:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    );
    border-color: rgba(255, 255, 255, 0.08);
  }

  /* Content Type Row - ContentTypeSelector handles its own styling */

  /* Primary Actions Row - 3-column grid that adapts */
  .primary-actions-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(8px, 1.2vh, 12px);
  }

  /* Container query: stack vertically on very short panels */
  @container panel-content (max-height: 350px) {
    .primary-actions-row {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
    }

    .primary-actions-row .action-btn:nth-child(3) {
      grid-column: 1 / -1; /* Instagram spans both columns */
    }
  }

  /* Container query: wider spacing on tall panels */
  @container panel-content (min-height: 500px) {
    .unified-actions-section {
      gap: clamp(14px, 2vh, 18px);
    }

    .primary-actions-row {
      gap: clamp(12px, 1.5vh, 16px);
    }
  }

  /* Preview Options Compact Button */
  .preview-options-compact {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(8px, 1vh, 12px);
    padding: clamp(10px, 1.5vh, 14px) clamp(14px, 2vh, 18px);
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.1),
      rgba(37, 99, 235, 0.06)
    );
    border: 1.5px solid rgba(59, 130, 246, 0.25);
    border-radius: clamp(10px, 1.5vh, 12px);
    color: rgba(255, 255, 255, 0.95);
    font-size: clamp(13px, 2vh, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .preview-options-compact:hover:not(:disabled) {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.15),
      rgba(37, 99, 235, 0.1)
    );
    border-color: rgba(59, 130, 246, 0.35);
    transform: translateY(-1px);
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.15);
  }

  .preview-options-compact:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .preview-options-compact i:first-child {
    font-size: clamp(14px, 2vh, 16px);
  }

  .preview-options-compact i:last-child {
    font-size: clamp(11px, 1.5vh, 13px);
    opacity: 0.7;
  }

  /* Action Buttons - Compact, Container-Aware */
  .action-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1vh, 10px);
    padding: clamp(10px, 1.5vh, 14px) clamp(12px, 1.8vh, 18px);
    border: none;
    border-radius: clamp(10px, 1.5vh, 12px);
    font-size: clamp(13px, 1.8vh, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: hidden;
    isolation: isolate;
  }

  .action-btn > * {
    position: relative;
    z-index: 2;
  }

  .action-btn i {
    font-size: clamp(14px, 2vh, 16px);
  }

  /* ============================================================================
     PREVIEW VIEW STYLES
     ============================================================================ */

  /* Preview Header with Back Button - Container-aware compact sizing */
  .preview-header {
    flex: 0 0 auto; /* Fixed size based on content */
    display: flex;
    align-items: center;
    gap: clamp(10px, 1.5vw, 14px);
    padding-bottom: clamp(8px, 1.2vh, 12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .preview-header h3 {
    flex: 1;
    margin: 0;
    font-size: clamp(15px, 2.5vw, 17px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  /* Container query: Even more compact header on short panels */
  @container panel-content (max-height: 400px) {
    .preview-header {
      padding-bottom: clamp(6px, 1vh, 8px);
      gap: clamp(8px, 1.2vw, 10px);
    }

    .preview-header h3 {
      font-size: clamp(14px, 2vw, 15px);
    }

    .back-button {
      padding: clamp(6px, 1vh, 8px) clamp(10px, 1.5vh, 14px);
      font-size: clamp(12px, 1.8vh, 13px);
    }
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateX(-2px);
  }

  /* Preview Section - Intelligent sizing based on container height */
  .preview-section {
    /* Don't grow arbitrarily - use intelligent fixed ratio */
    flex: 0 0 auto;
    /* Container-aware height allocation */
    height: clamp(180px, 45vh, 400px);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(10px, 1.5vh, 12px);
    padding: clamp(8px, 1.2vh, 12px);
    overflow: hidden;
    position: relative;
  }

  /* Container query: Adjust preview/toggles ratio based on available height */
  @container panel-content (min-height: 600px) {
    .preview-section {
      height: clamp(250px, 50vh, 500px); /* Larger preview on tall panels */
    }
  }

  @container panel-content (max-height: 450px) {
    .preview-section {
      height: clamp(
        150px,
        40vh,
        280px
      ); /* Smaller preview, more room for toggles */
    }
  }

  @container panel-content (max-height: 350px) {
    .preview-section {
      height: clamp(120px, 35vh, 200px); /* Very compact for short panels */
    }
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain; /* Maintain aspect ratio, no cropping */
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  .preview-placeholder,
  .preview-loading,
  .preview-error {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  .preview-placeholder p,
  .preview-loading p,
  .preview-error p {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }

  .preview-placeholder span,
  .preview-error span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid rgba(59, 130, 246, 0.8);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .retry-button {
    margin-top: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .retry-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  }

  /* Options Section - Flex-grow to fill remaining space after preview */
  .options-section {
    flex: 1 1 auto; /* Grow to fill remaining space */
    min-height: 0; /* Allow shrinking */
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vh, 12px);
    /* Make scrollable if toggles overflow on very short panels */
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Compact Toggle Options - Responsive Grid Layout */
  .toggle-options-compact {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: clamp(6px, 1vh, 10px);
  }

  /* Container query: 3 columns on wider panels */
  @container share-panel (min-width: 500px) {
    .toggle-options-compact {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Container query: Adjust toggle grid based on height */
  @container panel-content (min-height: 600px) {
    .toggle-options-compact {
      gap: clamp(10px, 1.5vh, 14px);
    }

    .toggle-option-compact {
      padding: clamp(10px, 1.5vh, 14px) clamp(12px, 1.8vh, 16px);
    }
  }

  @container panel-content (max-height: 400px) {
    .toggle-options-compact {
      gap: clamp(6px, 0.8vh, 8px);
    }

    .toggle-option-compact {
      padding: clamp(6px, 1vh, 8px) clamp(8px, 1.2vh, 10px);
    }

    .toggle-label-compact {
      font-size: clamp(11px, 1.5vh, 12px);
    }
  }

  .toggle-option-compact {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04),
      rgba(255, 255, 255, 0.02)
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .toggle-option-compact:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08),
      rgba(255, 255, 255, 0.04)
    );
    border-color: rgba(255, 255, 255, 0.15);
  }

  .toggle-option-compact input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  /* Compact iOS-style Toggle Switch */
  .toggle-switch-compact {
    position: relative;
    width: 38px;
    height: 22px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 11px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .toggle-switch-compact::before {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .toggle-option-compact
    input[type="checkbox"]:checked
    + .toggle-switch-compact {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    border-color: #3b82f6;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
  }

  .toggle-option-compact
    input[type="checkbox"]:checked
    + .toggle-switch-compact::before {
    transform: translateX(16px);
  }

  .toggle-label-compact {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.85);
    flex: 1;
  }

  .action-btn::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 0;
  }

  .action-btn::after {
    z-index: 1;
  }

  .action-btn:hover::before {
    opacity: 1;
  }

  .action-btn.primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    box-shadow:
      0 4px 16px rgba(59, 130, 246, 0.4),
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    position: relative;
  }

  .action-btn.primary::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(
      circle at top left,
      rgba(255, 255, 255, 0.2),
      transparent 50%
    );
    pointer-events: none;
  }

  .action-btn.primary::before {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .action-btn.primary:hover:not(:disabled) {
    transform: scale(1.03) translateY(-2px);
    box-shadow:
      0 8px 24px rgba(59, 130, 246, 0.5),
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .action-btn.primary i {
    font-size: 18px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
  }

  .action-btn.secondary {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12),
      rgba(255, 255, 255, 0.08)
    );
    color: rgba(255, 255, 255, 0.95);
    border: 1.5px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    position: relative;
  }

  .action-btn.secondary::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 14px;
    background: radial-gradient(
      circle at top right,
      rgba(255, 255, 255, 0.1),
      transparent 60%
    );
    pointer-events: none;
  }

  .action-btn.secondary::before {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.18),
      rgba(255, 255, 255, 0.12)
    );
  }

  .action-btn.secondary:hover:not(:disabled) {
    transform: scale(1.02) translateY(-1px);
    border-color: rgba(255, 255, 255, 0.35);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.secondary i {
    font-size: 18px;
    opacity: 0.9;
  }

  /* Removed unused .action-btn.social styles - not currently used */

  /* Compact Instagram button */
  .action-btn.social-compact.instagram {
    background: linear-gradient(
      135deg,
      #f09433 0%,
      #e6683c 25%,
      #dc2743 50%,
      #cc2366 75%,
      #bc1888 100%
    );
    border: none;
    color: white;
    box-shadow:
      0 2px 12px rgba(188, 24, 136, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .action-btn.social-compact.instagram::before {
    background: linear-gradient(
      135deg,
      #e6683c 0%,
      #dc2743 25%,
      #cc2366 50%,
      #bc1888 75%,
      #8a0868 100%
    );
  }

  .action-btn.social-compact.instagram:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
      0 4px 16px rgba(188, 24, 136, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }

  .action-btn.social-compact.instagram i {
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .action-btn:disabled::before {
    display: none;
  }

  .btn-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Unified entrance animation */
  .unified-actions-section {
    animation: fadeInUnified 0.35s ease-out backwards;
  }

  @keyframes fadeInUnified {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
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

    .action-btn:hover {
      transform: none !important;
    }
  }

  /* Container query adjustments for narrow panels */
  @container share-panel (max-width: 400px) {
    .toggle-options-compact {
      grid-template-columns: repeat(2, 1fr);
    }

    .toggle-option-compact {
      padding: 6px 10px;
    }

    .toggle-label-compact {
      font-size: 12px;
    }
  }

  /* Container query: Further compacting on very constrained heights */
  @container panel-content (max-height: 300px) {
    .unified-actions-section {
      padding: clamp(10px, 1.5vh, 12px);
      gap: clamp(8px, 1.2vh, 10px);
    }

    .primary-actions-row {
      gap: clamp(6px, 1vh, 8px);
    }

    .action-btn {
      padding: clamp(8px, 1.2vh, 10px) clamp(10px, 1.5vh, 14px);
      font-size: clamp(12px, 1.6vh, 13px);
    }

    .preview-options-compact {
      padding: clamp(8px, 1.2vh, 10px) clamp(12px, 1.6vh, 14px);
    }
  }
</style>
