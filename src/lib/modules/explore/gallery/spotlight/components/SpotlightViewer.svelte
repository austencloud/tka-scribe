<!-- SpotlightViewer.svelte - Simplified fullscreen image viewer -->
<script lang="ts">
  import type { SequenceData } from "$shared";
  import type { IExploreThumbnailService } from "../../display";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    show = false,
    sequence,
    thumbnailService,
    onClose = () => {},
  } = $props<{
    show?: boolean,
    sequence?: SequenceData,
    thumbnailService?: IExploreThumbnailService,
    onClose?: () => void
  }>();

  // State
  let isVisible = $state(false);
  let isClosing = $state(false);
  let imageUrl = $state<string>("");
  let imageElement = $state<HTMLImageElement | null>(null);
  let shouldRotate = $state(false);

  // Track fullscreen state
  let _spotlightElement = $state<HTMLElement | null>(null);

  // Show/hide logic
  $effect(() => {
    if (show && sequence && thumbnailService) {
      console.log("✨ Spotlight viewer opened");
      isVisible = true;
      isClosing = false;

      // Prevent inadvertent text/image selection while overlay is open (desktop emulation)
      try {
        document.documentElement.classList.add("tka-no-select");
      } catch (error) {
        // Intentionally ignoring errors from optional DOM manipulation
        console.debug("Could not add no-select class", error);
      }

      // Get first variation thumbnail
      const thumbnail = sequence.thumbnails?.[0];
      if (thumbnail) {
        try {
          imageUrl = thumbnailService.getThumbnailUrl(sequence.id, thumbnail);
        } catch (error) {
          console.warn("Failed to resolve thumbnail", error);
        }
      }
    }
  });

  // Calculate if image should be rotated based on viewport and image aspect ratios
  function calculateRotation() {
    if (!imageElement) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportIsLandscape = viewportWidth > viewportHeight;

    const imageIsLandscape =
      imageElement.naturalWidth > imageElement.naturalHeight;

    // Rotate if orientations don't match
    const newRotation = viewportIsLandscape !== imageIsLandscape;

    console.log("🔄 Rotation calculation:", {
      viewport: {
        width: viewportWidth,
        height: viewportHeight,
        isLandscape: viewportIsLandscape,
      },
      image: {
        width: imageElement.naturalWidth,
        height: imageElement.naturalHeight,
        isLandscape: imageIsLandscape,
      },
      shouldRotate: newRotation,
    });

    shouldRotate = newRotation;
  }

  // Check rotation when image loads
  function handleImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    imageElement = img;
    calculateRotation();
  }

  // Debounce timer for resize
  let resizeTimer: number | undefined;

  // Recalculate rotation on window resize (debounced for performance)
  function handleResize() {
    // Clear existing timer
    if (resizeTimer) {
      clearTimeout(resizeTimer);
    }

    // Debounce to avoid too many calculations during resize
    resizeTimer = setTimeout(() => {
      calculateRotation();
    }, 100) as unknown as number;
  }

  // Close handler
  function handleClose() {
    isClosing = true;

    // Wait for animation
    setTimeout(() => {
      isVisible = false;
      isClosing = false;
      shouldRotate = false;
      try {
        document.documentElement.classList.remove("tka-no-select");
      } catch (error) {
        // Intentionally ignoring errors from optional DOM cleanup
        console.debug("Could not remove no-select class", error);
      }
      onClose();
    }, 300);
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && isVisible) {
      event.preventDefault();
      handleClose();
    }
  }

  // Handle keyboard interaction for the dialog (accessibility)
  function handleDialogKeydown(event: KeyboardEvent) {
    // Close on Enter or Space (when focused on the dialog itself)
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleClose();
    }
  }

  // No Fullscreen API: viewport-only overlay, nothing to handle here
</script>

<svelte:window
  onkeydown={handleKeydown}
  onresize={handleResize}
  onorientationchange={handleResize}
/>

{#if isVisible && imageUrl}
  <!-- Fullscreen overlay - clicking anywhere closes -->
  <div
    bind:this={_spotlightElement}
    class="spotlight"
    class:closing={isClosing}
    onclick={handleClose}
    onkeydown={handleDialogKeydown}
    role="dialog"
    aria-modal="true"
    aria-label="Maximized sequence view"
    tabindex="-1"
  >
    <!-- Image maximized to fill screen -->
    <img
      src={imageUrl}
      alt={sequence?.name || sequence?.word || "Sequence"}
      class="spotlight-image"
      class:rotated={shouldRotate}
      onload={handleImageLoad}
    />
  </div>
{/if}

<style>
  .spotlight {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.98);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    -webkit-tap-highlight-color: transparent; /* Remove tap highlight on mobile */
    user-select: none;
  }

  .spotlight.closing {
    animation: fadeOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
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

  .spotlight-image {
    max-width: 100vw;
    max-height: 100vh;
    width: auto;
    height: auto;
    object-fit: contain;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    pointer-events: none; /* prevent selecting image; clicks handled by overlay */
  }

  /* Rotate image 90 degrees when orientations don't match */
  .spotlight-image.rotated {
    transform: rotate(90deg);
    /* When rotated, swap width/height constraints */
    max-width: 100vh;
    max-height: 100vw;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .spotlight,
    .spotlight-image {
      animation: none;
      transition: none;
    }

    .spotlight-image.rotated {
      transition: none;
    }
  }

  /* Disable selection globally while spotlight is open */
  :global(.tka-no-select),
  :global(.tka-no-select *) {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
  }
</style>
