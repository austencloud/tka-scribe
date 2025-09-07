<!-- SpotlightViewer.svelte - Fullscreen sequence viewer with actions -->
<script lang="ts">
  import type { SequenceData } from "../../../../shared/domain";
  import type { IGalleryThumbnailService } from "../../gallery/services/contracts";
  import SpotlightActionButtons from "./SpotlightActionButtons.svelte";
  import SpotlightImage from "./SpotlightImage.svelte";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    show = false,
    sequence,
    thumbnailService,
    onClose = () => {},
    onAction = () => {},
  } = $props<{
    show?: boolean;
    sequence?: SequenceData;
    thumbnailService?: IGalleryThumbnailService;
    onClose?: () => void;
    onAction?: (action: string, sequence: SequenceData) => void;
  }>();

  // State for current variation (shared with image viewer)
  let currentVariationIndex = $state(0);

  // State for closing animation
  let isClosing = $state(false);

  // State for content visibility (synchronized with image loading)
  let isContentVisible = $state(false);

  // Reset state when sequence changes
  $effect(() => {
    if (sequence) {
      currentVariationIndex = 0;
      isContentVisible = false; // Reset content visibility when sequence changes

      // Hide the hint after 3 seconds
      const timeoutId = setTimeout(() => {}, 3000);

      return () => clearTimeout(timeoutId);
    }
  });

  // Reset closing state when viewer is shown
  $effect(() => {
    if (show) {
      const viewerStartTime = performance.now();
      console.log(
        `🎭 [TIMING] Spotlight viewer opened at ${viewerStartTime.toFixed(2)}ms`
      );

      isClosing = false;
      isContentVisible = false; // Reset content visibility when viewer opens
    }
  });

  // Event handlers
  function handleClose() {
    console.log("❌ Closing fullscreen viewer");
    isClosing = true;

    // Wait for fade-out animation to complete before actually closing
    setTimeout(() => {
      isClosing = false;
      onClose();
    }, 400); // Updated to match improved fade-out duration
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Handle image load event from SpotlightImage
  function handleImageLoaded() {
    const timestamp = performance.now();
    console.log(
      `🖼️ [TIMING] Image loaded at ${timestamp.toFixed(2)}ms, triggering content fade-in`
    );
    isContentVisible = true;

    // Log when content fade-in starts
    console.log(
      `🎬 [TIMING] Content fade-in started at ${timestamp.toFixed(2)}ms`
    );

    // Log when content fade-in should complete (400ms transition)
    setTimeout(() => {
      const endTimestamp = performance.now();
      console.log(
        `✅ [TIMING] Content fade-in completed at ${endTimestamp.toFixed(2)}ms (duration: ${(endTimestamp - timestamp).toFixed(2)}ms)`
      );
    }, 400);
  }
</script>

{#if show && sequence}
  <!-- Fullscreen overlay -->
  <div
    class="fullscreen-overlay"
    class:closing={isClosing}
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === "Escape" && handleClose()}
    role="dialog"
    aria-modal="true"
    aria-labelledby="fullscreen-title"
    aria-describedby="dismissal-instructions"
    tabindex="-1"
  >
    <!-- Main content area -->
    <div class="fullscreen-content" class:visible={isContentVisible}>
      <!-- Header with title and close button -->
      <div class="sequence-title-container">
        <!-- Invisible spacer to balance the close button -->
        <div class="header-spacer"></div>

        <!-- Centered title and difficulty -->
        <div class="title-content">
          <h1 class="sequence-title" id="fullscreen-title">
            {sequence?.word || "Sequence"}
          </h1>
          {#if sequence?.difficulty}
            <span
              class="difficulty-badge"
              class:beginner={sequence.difficulty === "Beginner"}
              class:intermediate={sequence.difficulty === "Intermediate"}
              class:advanced={sequence.difficulty === "Advanced"}
            >
              {sequence.difficulty}
            </span>
          {/if}
        </div>

        <!-- Close button in header -->
        <button
          class="close-button"
          onclick={handleClose}
          aria-label="Close fullscreen viewer"
        >
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- Image viewer (centered) -->
      <SpotlightImage
        {sequence}
        {thumbnailService}
        bind:currentVariationIndex
        onImageLoaded={handleImageLoaded}
      />

      <!-- Centered bottom panel -->
      <div class="bottom-panel">
        <SpotlightActionButtons {sequence} {onAction} />
      </div>
    </div>
  </div>
{/if}

<style>
  .fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    animation: backgroundFadeIn 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  .fullscreen-overlay.closing {
    animation: backgroundFadeOut 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes backgroundFadeIn {
    from {
      background: rgba(0, 0, 0, 0);
      backdrop-filter: blur(0px);
    }
    to {
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
    }
  }

  @keyframes backgroundFadeOut {
    from {
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(10px);
    }
    to {
      background: rgba(0, 0, 0, 0);
      backdrop-filter: blur(0px);
    }
  }

  .close-button {
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: white;
    backdrop-filter: blur(4px);
    flex-shrink: 0; /* Prevent shrinking */
  }

  .close-button:hover {
    background: rgba(0, 0, 0, 0.9);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .close-button:active {
    transform: scale(0.95);
  }

  .close-icon {
    font-size: 1.25rem;
    font-weight: 300;
  }

  .fullscreen-content {
    flex: 1;
    display: flex;
    flex-direction: column; /* Always use vertical layout */
    position: relative;
    min-height: 0;
    padding: 2rem 2rem 2rem 2rem; /* Reduced top padding since header is simplified */
    gap: 1rem; /* Reduced gap for tighter layout */
    opacity: 0; /* Start invisible */
    transition: opacity 0.4s ease-out; /* Smooth fade-in when content becomes visible */
  }

  .fullscreen-content.visible {
    opacity: 1; /* Fade in when image is loaded */
  }

  .fullscreen-overlay.closing .fullscreen-content {
    animation: contentFadeOut 0.4s ease-out forwards;
  }

  @keyframes contentFadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .sequence-title-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    width: 100%;
  }

  .header-spacer {
    width: 3rem; /* Same width as close button to balance layout */
    flex-shrink: 0;
  }

  .title-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    flex: 1; /* Take up remaining space */
  }

  .sequence-title {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    text-align: center;
  }

  .difficulty-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .difficulty-badge.beginner {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .difficulty-badge.intermediate {
    background: rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .difficulty-badge.advanced {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .bottom-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    max-width: 600px;
    margin: 0 auto;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(1rem);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .close-button {
      width: 2.5rem;
      height: 2.5rem;
      right: 0.75rem;
      z-index: 10000;
    }

    .close-icon {
      font-size: 1rem;
    }

    .fullscreen-content {
      padding: 1rem;
      gap: 1rem;
    }

    .sequence-title {
      font-size: 1.25rem;
    }

    .sequence-title-container {
      margin-bottom: 0.75rem;
    }

    .bottom-panel {
      gap: 1rem;
      max-width: 100%;
    }
  }
</style>
