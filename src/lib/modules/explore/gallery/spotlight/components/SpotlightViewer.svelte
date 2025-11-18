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
    show?: boolean;
    sequence?: SequenceData;
    thumbnailService?: IExploreThumbnailService;
    onClose?: () => void;
  }>();

  // State
  let isVisible = $state(false);
  let isClosing = $state(false);
  let imageUrl = $state<string>("");
  let imageElement = $state<HTMLImageElement | null>(null);
  let shouldRotate = $state(false);

  // Track fullscreen state
  let spotlightElement = $state<HTMLElement | null>(null);

  // Show/hide logic
  $effect(() => {
    if (show && sequence && thumbnailService) {
      console.log('✨ Spotlight viewer opened');
      isVisible = true;
      isClosing = false;

      // Enter fullscreen and lock orientation
      enterFullscreenAndLock();

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

  // Enter fullscreen mode and lock orientation
  async function enterFullscreenAndLock() {
    try {
      // Request fullscreen on the spotlight element
      // Fullscreen is required for orientation lock to work reliably on mobile
      if (spotlightElement && document.fullscreenElement !== spotlightElement) {
        await spotlightElement.requestFullscreen();
        console.log('🖥️ Entered fullscreen mode');
      }

      // Wait a bit for fullscreen to activate, then lock orientation
      setTimeout(async () => {
        try {
          // Use type assertion since Screen Orientation API isn't fully typed
          const orientation = screen.orientation as any;
          if (orientation && typeof orientation.lock === 'function') {
            const currentOrientation = orientation.type;

            // Lock to current orientation to prevent auto-rotate
            if (currentOrientation.includes('portrait')) {
              await orientation.lock('portrait');
              console.log('🔒 Screen locked to portrait');
            } else {
              await orientation.lock('landscape');
              console.log('🔒 Screen locked to landscape');
            }
          }
        } catch (error) {
          console.log('ℹ️ Screen orientation lock failed:', error);
        }
      }, 100);
    } catch (error) {
      console.log('ℹ️ Fullscreen not available:', error);
    }
  }

  // Exit fullscreen and unlock orientation
  async function exitFullscreenAndUnlock() {
    try {
      // Unlock orientation first
      const orientation = screen.orientation as any;
      if (orientation && typeof orientation.unlock === 'function') {
        orientation.unlock();
        console.log('🔓 Screen orientation unlocked');
      }
    } catch (error) {
      console.log('ℹ️ Screen orientation unlock not needed');
    }

    try {
      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        console.log('🖥️ Exited fullscreen mode');
      }
    } catch (error) {
      console.log('ℹ️ Fullscreen exit not needed');
    }
  }

  // Calculate if image should be rotated based on viewport and image aspect ratios
  function calculateRotation() {
    if (!imageElement) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportIsLandscape = viewportWidth > viewportHeight;

    const imageIsLandscape = imageElement.naturalWidth > imageElement.naturalHeight;

    // Rotate if orientations don't match
    const newRotation = viewportIsLandscape !== imageIsLandscape;

    console.log('🔄 Rotation calculation:', {
      viewport: { width: viewportWidth, height: viewportHeight, isLandscape: viewportIsLandscape },
      image: { width: imageElement.naturalWidth, height: imageElement.naturalHeight, isLandscape: imageIsLandscape },
      shouldRotate: newRotation
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

    // Exit fullscreen and unlock orientation
    exitFullscreenAndUnlock();

    // Wait for animation
    setTimeout(() => {
      isVisible = false;
      isClosing = false;
      shouldRotate = false;
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

  // Handle fullscreen change (user exits fullscreen manually)
  function handleFullscreenChange() {
    if (!document.fullscreenElement && isVisible && !isClosing) {
      // User exited fullscreen manually, close the spotlight
      console.log('👋 Fullscreen exited manually, closing spotlight');
      handleClose();
    }
  }
</script>

<svelte:window
  onkeydown={handleKeydown}
  onresize={handleResize}
  onorientationchange={handleResize}
/>

<svelte:document
  onfullscreenchange={handleFullscreenChange}
/>

{#if isVisible && imageUrl}
  <!-- Fullscreen overlay - clicking anywhere closes -->
  <div
    bind:this={spotlightElement}
    class="spotlight"
    class:closing={isClosing}
    onclick={handleClose}
    onkeydown={handleDialogKeydown}
    role="dialog"
    aria-modal="true"
    aria-label="Fullscreen sequence view"
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
</style>
