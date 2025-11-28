<!-- SpotlightViewer.svelte - Simplified fullscreen image viewer -->
<script lang="ts">
import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import type { IDiscoverThumbnailService } from "../../display";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    show = false,
    sequence,
    thumbnailService,
    onClose = () => {},
  } = $props<{
    show?: boolean;
    sequence?: SequenceData;
    thumbnailService?: IDiscoverThumbnailService;
    onClose?: () => void;
  }>();

  // State
  let isVisible = $state(false);
  let isClosing = $state(false);
  let imageUrl = $state<string>("");
  let imageElement = $state<HTMLImageElement | null>(null);
  let shouldRotate = $state(false);
  let manualRotationOverride = $state<boolean | null>(null); // null = auto, true/false = manual

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
      } catch {}

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

    // If user has manually overridden rotation, respect that
    if (manualRotationOverride !== null) {
      shouldRotate = manualRotationOverride;
      return;
    }

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

  // Toggle rotation manually
  function toggleRotation(event?: MouseEvent) {
    // Stop propagation to prevent closing the spotlight
    event?.stopPropagation();

    // Toggle the rotation state
    shouldRotate = !shouldRotate;
    manualRotationOverride = shouldRotate;

    console.log("🔄 Manual rotation toggled:", shouldRotate);
  }

  // Close handler
  function handleClose() {
    isClosing = true;

    // Wait for animation
    setTimeout(() => {
      isVisible = false;
      isClosing = false;
      shouldRotate = false;
      manualRotationOverride = null; // Reset manual override on close
      try {
        document.documentElement.classList.remove("tka-no-select");
      } catch {}
      onClose();
    }, 300);
  }

  // Handle escape key and rotation shortcut
  function handleKeydown(event: KeyboardEvent) {
    if (!isVisible) return;

    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
    } else if (event.key === "r" || event.key === "R") {
      event.preventDefault();
      toggleRotation();
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

    <!-- Rotate button - bottom right corner -->
    <button
      class="rotate-button"
      onclick={toggleRotation}
      aria-label="Rotate image"
      title="Rotate image (R)"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
      </svg>
    </button>
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

  /* Rotate button */
  .rotate-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    z-index: 10000;
    pointer-events: auto; /* Allow clicks on button */
  }

  .rotate-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  .rotate-button:active {
    transform: scale(0.95);
  }

  .rotate-button svg {
    width: 24px;
    height: 24px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .spotlight,
    .spotlight-image,
    .rotate-button {
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
