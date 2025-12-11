<!-- SpotlightViewer.svelte - Fullscreen viewer for images or beat grids -->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IDiscoverThumbnailService } from "../../display/services/contracts/IDiscoverThumbnailService";
  import type { SpotlightDisplayMode } from "$lib/shared/application/state/ui/ui-state.svelte";
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    show = false,
    sequence,
    thumbnailService,
    displayMode = "image",
    onClose = () => {},
  } = $props<{
    show?: boolean;
    sequence?: SequenceData;
    thumbnailService?: IDiscoverThumbnailService;
    displayMode?: SpotlightDisplayMode;
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
    if (show && sequence) {
      console.log("✨ Spotlight viewer opened", { displayMode });
      isVisible = true;
      isClosing = false;

      // Prevent inadvertent text/image selection while overlay is open (desktop emulation)
      try {
        document.documentElement.classList.add("tka-no-select");
      } catch {}

      // Only load image URL in image mode
      if (displayMode === "image") {
        // Get first variation thumbnail
        const thumbnail = sequence.thumbnails?.[0];
        if (thumbnail) {
          // Check if thumbnail is already a full URL (starts with http or /)
          if (thumbnail.startsWith("http") || thumbnail.startsWith("/")) {
            // Use the URL directly
            imageUrl = thumbnail;
          } else if (thumbnailService) {
            // Use thumbnail service to construct the URL
            try {
              imageUrl = thumbnailService.getThumbnailUrl(sequence.id, thumbnail);
            } catch (error) {
              console.warn("Failed to resolve thumbnail via service", error);
              // Fallback: try using it as a relative path
              imageUrl = `/gallery/${thumbnail}`;
            }
          } else {
            // No service available, assume it's a gallery path
            imageUrl = `/gallery/${thumbnail}`;
          }
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

    // On desktop (screens wider than 1024px), don't auto-rotate
    // User has plenty of screen space and won't be rotating their monitor
    // They can still manually rotate using the button if desired
    const isDesktop = viewportWidth >= 1024;
    if (isDesktop) {
      shouldRotate = false;
      return;
    }

    // Mobile/tablet: apply smart rotation logic
    const viewportIsLandscape = viewportWidth > viewportHeight;

    const imageWidth = imageElement.naturalWidth;
    const imageHeight = imageElement.naturalHeight;
    const imageAspectRatio = imageWidth / imageHeight;

    // Check if image is approximately square (aspect ratio between 0.85 and 1.15)
    const isSquareImage = imageAspectRatio >= 0.85 && imageAspectRatio <= 1.15;

    const imageIsLandscape = imageWidth > imageHeight;

    let newRotation: boolean;

    if (isSquareImage) {
      // Square images (like 16-count sequences) should rotate by default on mobile
      // This uses more screen real estate on portrait phone screens
      newRotation = true;
    } else {
      // Non-square images: rotate if orientations don't match
      newRotation = viewportIsLandscape !== imageIsLandscape;
    }

    console.log("🔄 Rotation calculation:", {
      viewport: {
        width: viewportWidth,
        height: viewportHeight,
        isLandscape: viewportIsLandscape,
        isDesktop,
      },
      image: {
        width: imageWidth,
        height: imageHeight,
        aspectRatio: imageAspectRatio.toFixed(2),
        isSquare: isSquareImage,
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
  // Only applies to image mode - beatgrid mode locks rotation to user choice
  function handleResize() {
    // In beatgrid mode, don't auto-change rotation - user is in control
    if (displayMode === "beatgrid") return;

    // In image mode with manual override, also don't change
    if (manualRotationOverride !== null) return;

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

{#if isVisible && (imageUrl || displayMode === "beatgrid")}
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
    {#if displayMode === "beatgrid" && sequence}
      <!-- Beat grid mode: render sequence directly, filling viewport -->
      <!-- Tap anywhere to close - no buttons needed -->
      <div class="spotlight-beatgrid">
        <BeatGrid
          beats={sequence.beats ?? []}
          startPosition={sequence.startPosition ?? sequence.startingPositionBeat ?? null}
          isSideBySideLayout={true}
          isSpotlightMode={true}
        />
      </div>
    {:else}
      <!-- Image mode: show thumbnail, tap anywhere to close -->
      <img
        src={imageUrl}
        alt={sequence?.name || sequence?.word || "Sequence"}
        class="spotlight-image"
        class:rotated={shouldRotate}
        onload={handleImageLoad}
      />

      <!-- Rotate button - bottom right corner (image mode only) -->
      <button
        class="rotate-button"
        onclick={toggleRotation}
        aria-label="Rotate view"
        title="Rotate view (R)"
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
    {/if}
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

  /* Beat grid container - fills viewport, tap anywhere to close */
  .spotlight-beatgrid {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Clicks pass through to parent spotlight for closing */
    pointer-events: none;
  }

  /* Beat grid content also allows clicks through for closing */
  .spotlight-beatgrid :global(.beat-grid-container) {
    pointer-events: none;
  }

  /* Rotate button - image mode only */
  .rotate-button {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 52px;
    height: 52px;
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
    .spotlight-beatgrid,
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
