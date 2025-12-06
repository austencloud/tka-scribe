<!--
SequenceDetailContent - Shared content for sequence detail view

Displays:
- Large sequence preview image
- Sequence metadata (word, difficulty, length, author)
- Navigation controls (previous/next variation)
- Action buttons (Play, Favorite, Edit, Delete, Maximize)

Used by both desktop side panel and mobile slide-up overlay.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { IDiscoverThumbnailService } from "../services/contracts/IDiscoverThumbnailService";
  import AvatarImage from "../../../creators/components/profile/AvatarImage.svelte";
  import { discoverNavigationState } from "../../../shared/state/discover-navigation-state.svelte";
  import { galleryPanelManager } from "../../../shared/state/gallery-panel-state.svelte";

  let hapticService: IHapticFeedbackService | null = null;

  const {
    sequence,
    onClose = () => {},
    onAction = () => {},
  } = $props<{
    sequence: SequenceData;
    onClose?: () => void;
    onAction?: (action: string, sequence: SequenceData) => void;
  }>();

  // Services - resolved lazily to ensure feature module is loaded
  let thumbnailService: IDiscoverThumbnailService | null = $state(null);

  onMount(() => {
    thumbnailService = tryResolve<IDiscoverThumbnailService>(
      TYPES.IDiscoverThumbnailService
    );
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // State
  let currentVariationIndex = $state(0);

  // Crossfade state
  let currentImageUrl = $state<string | undefined>(undefined);
  let previousImageUrl = $state<string | undefined>(undefined);
  let isTransitioning = $state<boolean>(false);

  // Derived
  const coverUrl = $derived.by(() => {
    const thumbnail = sequence?.thumbnails?.[currentVariationIndex];
    if (!thumbnail || !thumbnailService) return undefined;
    try {
      return thumbnailService.getThumbnailUrl(sequence.id, thumbnail);
    } catch (error) {
      console.warn("Failed to resolve thumbnail", error);
      return undefined;
    }
  });

  const totalVariations = $derived(sequence?.thumbnails?.length || 1);
  const canGoBack = $derived(currentVariationIndex > 0);
  const canGoForward = $derived(currentVariationIndex < totalVariations - 1);

  // Reset variation index when sequence changes
  $effect(() => {
    if (sequence) {
      currentVariationIndex = 0;
    }
  });

  // Watch for coverUrl changes and trigger scale + fade transition
  $effect(() => {
    const newUrl = coverUrl;
    if (newUrl && newUrl !== currentImageUrl) {
      // Only animate if we're switching from one image to another
      // Skip animation on initial load for immediate display
      const shouldAnimate = currentImageUrl !== undefined;

      previousImageUrl = shouldAnimate ? currentImageUrl : undefined;
      currentImageUrl = newUrl;
      isTransitioning = shouldAnimate;

      // End transition after animation completes
      if (shouldAnimate) {
        setTimeout(() => {
          isTransitioning = false;
          previousImageUrl = undefined;
        }, 200); // Match the CSS transition duration
      }
    }
  });

  // Handlers
  function handlePrevious() {
    if (canGoBack) {
      hapticService?.trigger("selection");
      currentVariationIndex--;
    }
  }

  function handleNext() {
    if (canGoForward) {
      hapticService?.trigger("selection");
      currentVariationIndex++;
    }
  }

  function handleAction(action: string) {
    hapticService?.trigger("selection");
    onAction(action, sequence);
  }

  function handleMaximize() {
    hapticService?.trigger("selection");
    onAction("fullscreen", sequence);
  }

  function handleCreatorClick() {
    if (!sequence.ownerId) return;
    hapticService?.trigger("selection");

    // Close the detail panel
    galleryPanelManager.close();

    // Navigate to creator profile using unified navigation state
    discoverNavigationState.viewCreatorProfile(
      sequence.ownerId,
      sequence.ownerDisplayName
    );
  }

  // Check if we have creator info to display
  const hasCreatorInfo = $derived(Boolean(sequence.ownerId));
</script>

<div class="detail-content">
  <!-- Header with close button -->
  <header class="detail-header">
    <span class="header-title">Sequence Details</span>
    <button class="close-button" onclick={onClose} aria-label="Close">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  </header>

  <!-- Sequence Preview -->
  <div class="preview-container">
    <!-- Creator avatar badge (upper left) -->
    {#if hasCreatorInfo}
      <button
        class="creator-badge"
        onclick={handleCreatorClick}
        aria-label={`View ${sequence.ownerDisplayName || "creator"}'s profile`}
      >
        <AvatarImage
          src={sequence.ownerAvatarUrl}
          alt={sequence.ownerDisplayName || "Creator"}
          size={48}
        />
      </button>
    {/if}

    {#if currentImageUrl || previousImageUrl}
      <div class="image-crossfade-container">
        <!-- Previous image (fading out) -->
        {#if isTransitioning && previousImageUrl}
          <img
            src={previousImageUrl}
            alt="Previous sequence"
            class="preview-image previous-image"
          />
        {/if}

        <!-- Current image (fading in) -->
        {#if currentImageUrl}
          <img
            src={currentImageUrl}
            alt={sequence.name}
            class="preview-image current-image"
            class:transitioning={isTransitioning}
          />
        {/if}
      </div>
    {:else}
      <div class="preview-placeholder">No preview available</div>
    {/if}
  </div>

  <!-- Variation Navigation -->
  {#if totalVariations > 1}
    <div class="variation-nav">
      <button
        class="nav-btn"
        onclick={handlePrevious}
        disabled={!canGoBack}
        aria-label="Previous variation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <span class="variation-counter">
        {currentVariationIndex + 1} / {totalVariations}
      </span>

      <button
        class="nav-btn"
        onclick={handleNext}
        disabled={!canGoForward}
        aria-label="Next variation"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </button>
    </div>
  {/if}

  <!-- Metadata -->
  <div class="metadata">
    <h2 class="viewer-word-label">{sequence.name || sequence.word}</h2>
    <div class="metadata-row">
      <span class="metadata-item">Length: {sequence.sequenceLength} beats</span>
      <span class="metadata-item">Level: {sequence.difficultyLevel}</span>
    </div>
    {#if hasCreatorInfo || sequence.author}
      <div class="metadata-row">
        {#if hasCreatorInfo}
          <button class="creator-link" onclick={handleCreatorClick}>
            <span class="creator-label"
              >By {sequence.ownerDisplayName ||
                sequence.author ||
                "Unknown"}</span
            >
            <svg
              class="creator-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        {:else}
          <span class="metadata-item">By {sequence.author}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button
      class="action-btn action-btn-primary"
      onclick={() => handleAction("play")}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M8 5v14l11-7z" />
      </svg>
      <span>Play</span>
    </button>

    <button
      class="action-btn"
      class:favorited={sequence.isFavorite}
      onclick={() => handleAction("favorite")}
      aria-label={sequence.isFavorite
        ? "Remove from favorites"
        : "Add to favorites"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={sequence.isFavorite ? "currentColor" : "none"}
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        />
      </svg>
    </button>

    <button
      class="action-btn"
      onclick={() => handleAction("edit")}
      aria-label="Edit sequence"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    </button>

    <button
      class="action-btn"
      onclick={() => handleAction("delete")}
      aria-label="Delete sequence"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path
          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
        />
      </svg>
    </button>

    <button
      class="action-btn action-btn-maximize"
      onclick={handleMaximize}
      aria-label="Maximize details"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
        />
      </svg>
      <span>Maximize</span>
    </button>
  </div>
</div>

<style>
  .detail-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: clamp(12px, 4cqi, 24px);
    gap: clamp(12px, 3cqi, 20px);
    overflow-y: auto;
    container-type: inline-size;
    container-name: detail-panel;
  }

  /* Header row with title and close button */
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: clamp(8px, 2cqi, 12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .header-title {
    font-size: clamp(14px, 4cqi, 18px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Close button - uses global touch target token */
  .close-button {
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .close-button svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .close-button:active {
    transform: scale(0.95);
  }

  /* Preview - Space Maximization Algorithm (from legacy Sequence Viewer) */
  .preview-container {
    flex: 1;
    min-height: clamp(152px, 40cqi, 252px);
    max-height: 65%;
    width: 95%;
    max-width: 100%;
    margin: 0 auto;
    border-radius: clamp(8px, 2cqi, 12px);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  /* Creator avatar badge - clickable, upper left corner */
  .creator-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    z-index: 10;
    padding: 0;
    margin: 0;
    background: rgba(0, 0, 0, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .creator-badge:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .creator-badge:active {
    transform: scale(0.95);
  }

  /* Style the avatar inside the badge */
  .creator-badge :global(.avatar-image) {
    display: block;
  }

  .image-crossfade-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .preview-image.previous-image {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 1;
    animation: fadeOut 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    z-index: 1;
  }

  .preview-image.current-image {
    position: relative;
    opacity: 1;
    z-index: 2;
  }

  .preview-image.current-image.transitioning {
    animation: fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .preview-placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-size: clamp(12px, 3cqi, 14px);
  }

  /* Variation Navigation */
  .variation-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(12px, 4cqi, 20px);
    padding: clamp(6px, 2cqi, 10px);
  }

  /* Nav buttons - uses global touch target token */
  .nav-btn {
    width: var(--touch-target-min);
    height: var(--touch-target-min);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .nav-btn svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
  }

  .nav-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .nav-btn:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .nav-btn:not(:disabled):active {
    transform: scale(0.95);
  }

  .variation-counter {
    font-size: clamp(12px, 3.5cqi, 15px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    min-width: clamp(52px, 15cqi, 70px);
    text-align: center;
  }

  /* Metadata */
  .metadata {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 2cqi, 10px);
  }

  .viewer-word-label {
    font-size: clamp(18px, 6cqi, 28px);
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
  }

  .metadata-row {
    display: flex;
    gap: clamp(10px, 3cqi, 16px);
    justify-content: center;
    flex-wrap: wrap;
  }

  .metadata-item {
    font-size: clamp(12px, 3cqi, 14px);
    color: rgba(255, 255, 255, 0.7);
  }

  .creator-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 8px 14px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .creator-link:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.35);
  }

  .creator-link:active {
    transform: scale(0.97);
  }

  .creator-label {
    font-size: clamp(12px, 3cqi, 14px);
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  .creator-link:hover .creator-label {
    color: white;
  }

  .creator-arrow {
    opacity: 0.6;
    transition: all 0.2s ease;
  }

  .creator-link:hover .creator-arrow {
    opacity: 1;
    transform: translateX(2px);
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: clamp(8px, 2cqi, 12px);
    flex-wrap: wrap;
    justify-content: center;
    margin-top: auto;
    padding-top: clamp(8px, 2cqi, 12px);
  }

  /* Action buttons - uses global touch target token */
  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 2cqi, 10px);
    padding: clamp(10px, 2.5cqi, 14px) clamp(12px, 3cqi, 18px);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: clamp(6px, 2cqi, 10px);
    color: white;
    font-size: clamp(12px, 3cqi, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: var(--touch-target-min);
    min-width: var(--touch-target-min);
  }

  .action-btn svg {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    flex-shrink: 0;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .action-btn:active {
    transform: scale(0.97);
  }

  .action-btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    flex: 1;
    min-width: clamp(100px, 30cqi, 140px);
  }

  .action-btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .action-btn-maximize {
    flex: 1;
    min-width: clamp(100px, 30cqi, 140px);
  }

  .action-btn.favorited {
    color: #f87171;
    border-color: #f87171;
  }

  /* Compact layout for smaller containers */
  @container detail-panel (max-width: 320px) {
    .action-btn span {
      display: none;
    }

    .action-btn-primary,
    .action-btn-maximize {
      flex: 0;
      min-width: var(--touch-target-min);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .close-button,
    .nav-btn,
    .action-btn {
      transition: none;
    }

    .close-button:active,
    .nav-btn:not(:disabled):active,
    .action-btn:active {
      transform: none;
    }
  }
</style>
