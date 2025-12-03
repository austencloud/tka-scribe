<!--
AnimationCard.svelte

Card component for displaying saved animations in the browse grid.
Adapted from SequenceCard but for animations with mode indicators.

Features:
- Thumbnail or placeholder
- Animation name (truncated if long)
- Mode indicator icon
- Sequence count badge
- Creator info
- Hover effects
-->
<script lang="ts">
  import type { SavedAnimation } from "../state/browse-state.svelte";

  const {
    animation,
    selected = false,
    onPrimaryAction = () => {},
  }: {
    animation: SavedAnimation;
    selected?: boolean;
    onPrimaryAction?: (animation: SavedAnimation) => void;
  } = $props();

  // Mode icon mapping
  const modeIcons = {
    single: "fa-play",
    mirror: "fa-clone",
    tunnel: "fa-layer-group",
    grid: "fa-th",
  };

  // Mode display names
  const modeNames = {
    single: "Single",
    mirror: "Mirror",
    tunnel: "Tunnel",
    grid: "Grid",
  };

  // Truncate title to 24 characters
  const displayTitle = $derived(() => {
    const name = animation.name || "Untitled";
    if (name.length <= 24) {
      return name;
    }
    return name.substring(0, 24) + "…";
  });

  function handleClick() {
    onPrimaryAction(animation);
  }
</script>

<button class="animation-card" class:selected onclick={handleClick}>
  <!-- Thumbnail / Placeholder -->
  <div class="card-media">
    {#if animation.thumbnailUrl}
      <img
        src={animation.thumbnailUrl}
        alt={animation.name}
        class="thumbnail"
      />
    {:else}
      <div class="placeholder">
        <i class="fas {modeIcons[animation.mode]} placeholder-icon"></i>
      </div>
    {/if}

    <!-- Mode indicator badge -->
    <div class="mode-badge" title={modeNames[animation.mode]}>
      <i class="fas {modeIcons[animation.mode]}"></i>
    </div>

    <!-- Favorite indicator -->
    {#if animation.isFavorite}
      <div class="favorite-badge" title="Favorite">
        <i class="fas fa-heart"></i>
      </div>
    {/if}
  </div>

  <!-- Card footer -->
  <div class="card-footer">
    <h3 class="animation-title">{displayTitle()}</h3>
    <div class="card-meta">
      <span class="sequence-count" title="Number of sequences">
        <i class="fas fa-file-alt"></i>
        {animation.sequences.length}
      </span>
      <span class="creator" title="Creator">
        <i class="fas fa-user"></i>
        {animation.creator}
      </span>
    </div>
  </div>
</button>

<style>
  .animation-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    background: rgba(8, 8, 12, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    display: flex;
    flex-direction: column;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition:
      transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.15s cubic-bezier(0.4, 0, 0.2, 1),
      border-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .animation-card:hover {
    transform: scale(1.02);
    box-shadow: 0 14px 48px rgba(0, 0, 0, 0.38);
    border-color: rgba(255, 255, 255, 0.12);
  }

  /* Active state for mobile */
  @media (hover: none) and (pointer: coarse) {
    .animation-card:active {
      transform: scale(0.98);
      transition-duration: 0.1s;
    }
  }

  .animation-card:focus {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }

  .animation-card.selected {
    border-color: rgba(102, 126, 234, 0.8);
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.4);
  }

  /* Card Media */
  .card-media {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.03);
    overflow: hidden;
  }

  .thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.1) 0%,
      rgba(37, 99, 235, 0.05) 100%
    );
  }

  .placeholder-icon {
    font-size: 48px;
    color: rgba(255, 255, 255, 0.2);
  }

  /* Mode badge */
  .mode-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
  }

  /* Favorite badge */
  .favorite-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.2);
    backdrop-filter: blur(8px);
    border-radius: 6px;
    border: 1px solid rgba(239, 68, 68, 0.4);
    font-size: 14px;
    color: #ef4444;
  }

  /* Card Footer */
  .card-footer {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: linear-gradient(
      135deg,
      rgba(30, 30, 40, 0.95) 0%,
      rgba(20, 20, 30, 0.95) 100%
    );
  }

  .animation-title {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .card-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .card-meta i {
    font-size: 10px;
    opacity: 0.7;
  }

  /* Responsive adjustments */
  @container (max-width: 200px) {
    .card-footer {
      padding: 8px;
      gap: 6px;
    }

    .animation-title {
      font-size: 13px;
    }

    .card-meta {
      font-size: 11px;
      gap: 8px;
    }

    .mode-badge,
    .favorite-badge {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }

    .placeholder-icon {
      font-size: 36px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .animation-card {
      transition: none;
    }

    .animation-card:hover {
      transform: none;
    }
  }
</style>
