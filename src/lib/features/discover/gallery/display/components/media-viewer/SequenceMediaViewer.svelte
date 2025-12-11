<!--
  SequenceMediaViewer.svelte

  Unified media viewer for sequence detail panels.
  Supports three media types:
  - Image: Static thumbnails with variation navigation
  - Animation: Live rendered animation playback
  - Video: Performance videos attached to the sequence
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { IDiscoverThumbnailService } from "../../services/contracts/IDiscoverThumbnailService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import InlineAnimationPlayer from "./InlineAnimationPlayer.svelte";

  type MediaType = "image" | "animation" | "video";

  let {
    sequence,
    thumbnailService = null,
    initialMediaType = "image",
    onCreatorClick,
  }: {
    sequence: SequenceData;
    thumbnailService?: IDiscoverThumbnailService | null;
    initialMediaType?: MediaType;
    onCreatorClick?: () => void;
  } = $props();

  let hapticService: IHapticFeedbackService | null = null;

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  // State
  let activeMediaType = $state<MediaType>(initialMediaType);
  let currentImageIndex = $state(0);
  let currentVideoIndex = $state(0);

  // Image crossfade state
  let currentImageUrl = $state<string | undefined>(undefined);
  let previousImageUrl = $state<string | undefined>(undefined);
  let isTransitioning = $state(false);

  // Derived: available media types
  const hasImages = $derived((sequence?.thumbnails?.length ?? 0) > 0);
  // Animation is always available - we generate it live from sequence data
  const hasAnimation = $derived(!!sequence);
  const hasVideo = $derived(!!sequence?.performanceVideoUrl);

  const availableMediaTypes = $derived.by(() => {
    const types: MediaType[] = [];
    if (hasImages) types.push("image");
    if (hasAnimation) types.push("animation");
    if (hasVideo) types.push("video");
    return types;
  });

  // Image navigation
  const totalImages = $derived(sequence?.thumbnails?.length ?? 0);
  const canGoPrevImage = $derived(currentImageIndex > 0);
  const canGoNextImage = $derived(currentImageIndex < totalImages - 1);

  // Current thumbnail URL
  const currentThumbnailUrl = $derived.by(() => {
    if (!sequence?.thumbnails?.[currentImageIndex] || !thumbnailService) return undefined;
    try {
      const thumbnail = sequence.thumbnails[currentImageIndex];
      if (!thumbnail) return undefined;
      return thumbnailService.getThumbnailUrl(sequence.id, thumbnail);
    } catch {
      return undefined;
    }
  });

  // Watch for thumbnail changes and trigger crossfade
  $effect(() => {
    const newUrl = currentThumbnailUrl;
    if (newUrl && newUrl !== currentImageUrl) {
      const shouldAnimate = currentImageUrl !== undefined;
      previousImageUrl = shouldAnimate ? currentImageUrl : undefined;
      currentImageUrl = newUrl;
      isTransitioning = shouldAnimate;

      if (shouldAnimate) {
        setTimeout(() => {
          isTransitioning = false;
          previousImageUrl = undefined;
        }, 200);
      }
    }
  });

  // Reset indices when sequence changes
  $effect(() => {
    if (sequence) {
      currentImageIndex = 0;
      currentVideoIndex = 0;
    }
  });

  // Handlers
  function selectMediaType(type: MediaType) {
    hapticService?.trigger("selection");
    activeMediaType = type;
  }

  function prevImage() {
    if (canGoPrevImage) {
      hapticService?.trigger("selection");
      currentImageIndex--;
    }
  }

  function nextImage() {
    if (canGoNextImage) {
      hapticService?.trigger("selection");
      currentImageIndex++;
    }
  }

  function handleImageClick() {
    // Switch to animation when clicking on image
    if (hasAnimation) {
      selectMediaType("animation");
    }
  }
</script>

<div class="media-viewer">
  <!-- Media Type Tabs -->
  {#if availableMediaTypes.length > 1}
    <div class="media-tabs">
      {#each availableMediaTypes as mediaType}
        <button
          class="media-tab"
          class:active={activeMediaType === mediaType}
          onclick={() => selectMediaType(mediaType)}
        >
          {#if mediaType === "image"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Image</span>
          {:else if mediaType === "animation"}
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <span>Animate</span>
          {:else if mediaType === "video"}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <span>Video</span>
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Media Content Area -->
  <div class="media-content">
    {#if activeMediaType === "image"}
      <!-- Image View -->
      <div class="image-view" role="button" tabindex="0" onclick={handleImageClick} onkeypress={(e) => e.key === 'Enter' && handleImageClick()}>
        {#if currentImageUrl || previousImageUrl}
          <div class="image-crossfade-container">
            {#if isTransitioning && previousImageUrl}
              <img
                src={previousImageUrl}
                alt="Previous"
                class="media-image previous"
              />
            {/if}
            {#if currentImageUrl}
              <img
                src={currentImageUrl}
                alt={sequence.name}
                class="media-image current"
                class:transitioning={isTransitioning}
              />
            {/if}
          </div>

          <!-- Play overlay hint -->
          {#if hasAnimation}
            <div class="play-overlay">
              <div class="play-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <span>Click to animate</span>
            </div>
          {/if}
        {:else}
          <div class="placeholder">No preview available</div>
        {/if}

        <!-- Image Navigation (if multiple) -->
        {#if totalImages > 1}
          <div class="image-nav">
            <button
              class="nav-arrow"
              disabled={!canGoPrevImage}
              onclick={(e) => { e.stopPropagation(); prevImage(); }}
              aria-label="Previous variation"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <span class="image-counter">{currentImageIndex + 1} / {totalImages}</span>
            <button
              class="nav-arrow"
              disabled={!canGoNextImage}
              onclick={(e) => { e.stopPropagation(); nextImage(); }}
              aria-label="Next variation"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>
          </div>
        {/if}
      </div>

    {:else if activeMediaType === "animation"}
      <!-- Animation View -->
      <div class="animation-view">
        <InlineAnimationPlayer
          {sequence}
          autoPlay={true}
        />
      </div>

    {:else if activeMediaType === "video"}
      <!-- Video View -->
      <div class="video-view">
        {#if sequence.performanceVideoUrl}
          <video
            src={sequence.performanceVideoUrl}
            controls
            playsinline
            class="video-player"
          >
            <track kind="captions" />
            Your browser does not support video playback.
          </video>
        {:else}
          <div class="placeholder">No video available</div>
        {/if}

        <!-- Back to image button -->
        <button class="back-btn" onclick={() => selectMediaType("image")} aria-label="Close video">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    {/if}
  </div>
</div>

<style>
  .media-viewer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 8px;
  }

  /* Media Type Tabs */
  .media-tabs {
    display: flex;
    justify-content: center;
    gap: 4px;
    padding: 4px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    flex-shrink: 0;
  }

  .media-tab {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .media-tab svg {
    width: 16px;
    height: 16px;
  }

  .media-tab:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .media-tab.active {
    background: rgba(59, 130, 246, 0.25);
    color: white;
  }

  /* Media Content */
  .media-content {
    flex: 1;
    min-height: 0;
    position: relative;
    border-radius: 10px;
    overflow: hidden;
  }

  /* Image View */
  .image-view {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .image-crossfade-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .media-image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .media-image.previous {
    position: absolute;
    animation: fadeOut 200ms ease forwards;
  }

  .media-image.current.transitioning {
    animation: fadeIn 200ms ease forwards;
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Play overlay */
  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.4);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .image-view:hover .play-overlay {
    opacity: 1;
  }

  .play-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59, 130, 246, 0.9);
    border-radius: 50%;
    color: white;
  }

  .play-icon svg {
    width: 28px;
    height: 28px;
    margin-left: 3px;
  }

  .play-overlay span {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
  }

  /* Image Navigation */
  .image-nav {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    border-radius: 20px;
  }

  .nav-arrow {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-arrow svg {
    width: 20px;
    height: 20px;
  }

  .nav-arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-arrow:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .image-counter {
    font-size: 13px;
    font-weight: 600;
    color: white;
    min-width: 50px;
    text-align: center;
  }

  /* Animation View */
  .animation-view {
    width: 100%;
    height: 100%;
  }

  /* Video View */
  .video-view {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: black;
  }

  .video-player {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .back-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn svg {
    width: 18px;
    height: 18px;
  }

  .back-btn:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  /* Placeholder */
  .placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .media-tab,
    .nav-arrow,
    .play-overlay {
      transition: none;
    }

    .media-image.previous,
    .media-image.current.transitioning {
      animation: none;
    }
  }
</style>
