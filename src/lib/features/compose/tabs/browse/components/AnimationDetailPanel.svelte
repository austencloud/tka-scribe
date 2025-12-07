<!--
AnimationDetailPanel.svelte

Detail drawer for viewing and managing saved animations.
Adapted from SequenceDetailContent for animations.

Features:
- Large preview area
- Animation metadata (name, mode, creator, date)
- Sequence info and list
- Action buttons (Play, Edit, Duplicate, Delete, Share)
- Desktop: Right-side drawer
- Mobile: Bottom sheet
-->
<script lang="ts">
  import type { SavedAnimation } from "../state/browse-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  let hapticService: IHapticFeedbackService | null = null;

  const {
    animation,
    onClose = () => {},
    onAction = () => {},
  } = $props<{
    animation: SavedAnimation;
    onClose?: () => void;
    onAction?: (action: string, animation: SavedAnimation) => void;
  }>();

  onMount(() => {
    hapticService = tryResolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Mode display
  const modeIcons: Record<string, string> = {
    single: "fa-play",
    mirror: "fa-clone",
    tunnel: "fa-layer-group",
    grid: "fa-th",
    "side-by-side": "fa-columns",
  };

  const modeNames: Record<string, string> = {
    single: "Single Mode",
    mirror: "Mirror Mode",
    tunnel: "Tunnel Mode",
    grid: "Grid Mode",
    "side-by-side": "Side by Side Mode",
  };

  // Format date
  const formattedDate = $derived(() => {
    const date = animation.updatedAt;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  });

  // Handlers
  function handleAction(action: string) {
    hapticService?.trigger("selection");
    onAction(action, animation);
  }

  function handleClose() {
    hapticService?.trigger("selection");
    onClose();
  }
</script>

<div class="detail-content">
  <!-- Close button -->
  <button class="close-button" onclick={handleClose} aria-label="Close">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>

  <!-- Spacer for close button -->
  <div class="close-button-spacer"></div>

  <!-- Animation Preview -->
  <div class="preview-container">
    {#if animation.thumbnailUrl}
      <img
        src={animation.thumbnailUrl}
        alt={animation.name}
        class="preview-image"
      />
    {:else}
      <div class="preview-placeholder">
        <i class="fas {modeIcons[animation.mode]} placeholder-icon"></i>
        <p class="placeholder-text">No preview available</p>
      </div>
    {/if}
  </div>

  <!-- Metadata -->
  <div class="metadata">
    <h2 class="animation-name">{animation.name}</h2>

    <div class="mode-indicator">
      <i class="fas {modeIcons[animation.mode]}"></i>
      <span>{modeNames[animation.mode]}</span>
    </div>

    <div class="metadata-grid">
      <div class="metadata-item">
        <span class="metadata-label">Creator</span>
        <span class="metadata-value">{animation.creator}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Updated</span>
        <span class="metadata-value">{formattedDate()}</span>
      </div>
      <div class="metadata-item">
        <span class="metadata-label">Sequences</span>
        <span class="metadata-value">{animation.sequences.length}</span>
      </div>
      {#if animation.viewCount !== undefined}
        <div class="metadata-item">
          <span class="metadata-label">Views</span>
          <span class="metadata-value">{animation.viewCount}</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Sequence List (if applicable) -->
  {#if animation.sequences.length > 0}
    <div class="sequence-list">
      <h3 class="sequence-list-title">Sequences</h3>
      <div class="sequence-items">
        {#each animation.sequences as sequence, index}
          <div class="sequence-item">
            <span class="sequence-index">{index + 1}</span>
            <span class="sequence-name">{sequence.word || sequence.name}</span>
            <span class="sequence-length">{sequence.sequenceLength} beats</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Action Buttons -->
  <div class="action-buttons">
    <button
      class="action-btn action-btn-primary"
      onclick={() => handleAction("play")}
    >
      <i class="fas fa-play"></i>
      <span>Play</span>
    </button>

    <button class="action-btn" onclick={() => handleAction("edit")}>
      <i class="fas fa-edit"></i>
      <span>Edit</span>
    </button>

    <button
      class="action-btn"
      class:favorited={animation.isFavorite}
      onclick={() => handleAction("favorite")}
      aria-label={animation.isFavorite
        ? "Remove from favorites"
        : "Add to favorites"}
    >
      <i
        class="fas fa-heart"
        class:filled={animation.isFavorite}
        class:outlined={!animation.isFavorite}
      ></i>
    </button>

    <button
      class="action-btn"
      onclick={() => handleAction("duplicate")}
      aria-label="Duplicate animation"
    >
      <i class="fas fa-copy"></i>
    </button>

    <button
      class="action-btn"
      onclick={() => handleAction("share")}
      aria-label="Share animation"
    >
      <i class="fas fa-share-alt"></i>
    </button>

    <button
      class="action-btn action-btn-danger"
      onclick={() => handleAction("delete")}
      aria-label="Delete animation"
    >
      <i class="fas fa-trash"></i>
    </button>
  </div>
</div>

<style>
  .detail-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: clamp(16px, 4vw, 24px);
    gap: clamp(16px, 3vw, 20px);
    position: relative;
    overflow-y: auto;
  }

  /* Close button */
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
  }

  .close-button-spacer {
    height: 52px;
    flex-shrink: 0;
  }

  /* Preview */
  .preview-container {
    flex: 1;
    min-height: 200px;
    max-height: 65%;
    width: 95%;
    max-width: 100%;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: rgba(255, 255, 255, 0.03);
  }

  .preview-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
  }

  .preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 40px;
  }

  .placeholder-icon {
    font-size: 64px;
    color: rgba(255, 255, 255, 0.15);
  }

  .placeholder-text {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    margin: 0;
  }

  /* Metadata */
  .metadata {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .animation-name {
    font-size: clamp(20px, 5vw, 28px);
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .mode-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 6px;
    color: #3b82f6;
    font-size: 14px;
    font-weight: 600;
    width: fit-content;
  }

  .metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
  }

  .metadata-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metadata-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metadata-value {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Sequence List */
  .sequence-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sequence-list-title {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
  }

  .sequence-items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sequence-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 6px;
  }

  .sequence-index {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(59, 130, 246, 0.2);
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
    flex-shrink: 0;
  }

  .sequence-name {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .sequence-length {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    flex-shrink: 0;
  }

  /* Action Buttons */
  .action-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: auto;
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 52px;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .action-btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    flex: 1;
    min-width: 120px;
  }

  .action-btn-primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .action-btn-danger {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
  }

  .action-btn-danger:hover {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .action-btn.favorited {
    color: #f87171;
    border-color: #f87171;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .detail-content {
      padding: 16px;
      gap: 16px;
    }

    .action-buttons {
      gap: 8px;
    }

    .action-btn {
      padding: 10px 12px;
      font-size: 13px;
    }

    .metadata-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .close-button,
    .action-btn {
      transition: none;
    }

    .close-button:hover,
    .action-btn:hover {
      transform: none;
    }
  }
</style>
