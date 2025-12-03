<script lang="ts">
  /**
   * RecentCompositions - Shows recent saved compositions for quick resume
   *
   * Displays up to 4 most recent compositions with mini previews.
   * Allows quick-play without going through mode selection.
   */

  import { onMount } from "svelte";
  import { getBrowseState, type SavedAnimation } from "../../browse/state/browse-state.svelte";
  import { getAnimateModuleState, type AnimateMode } from "$lib/features/animate/shared/state/animate-module-state.svelte";
  import { tryResolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  // Get state instances
  const browseState = getBrowseState();
  const animateModuleState = getAnimateModuleState();

  let hapticService: IHapticFeedbackService | null = null;

  // Get recent compositions (max 4, sorted by date)
  const recentCompositions = $derived(
    browseState.animations
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 4)
  );

  // Mode colors for consistency
  const modeColors: Record<AnimateMode, string> = {
    single: "#3b82f6",
    mirror: "#8b5cf6",
    tunnel: "#ec4899",
    grid: "#f59e0b"
  };

  // Mode icons
  const modeIcons: Record<AnimateMode, string> = {
    single: "fa-play",
    mirror: "fa-clone",
    tunnel: "fa-circle-notch",
    grid: "fa-th-large"
  };

  onMount(async () => {
    hapticService = tryResolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Ensure animations are loaded
    if (browseState.animations.length === 0) {
      await browseState.loadAnimations();
    }
  });

  function handlePlay(composition: SavedAnimation) {
    hapticService?.trigger("selection");

    // Set mode and open playback
    animateModuleState.setCurrentMode(composition.mode);
    animateModuleState.openPlayback("arrange");

    console.log("🎬 RecentCompositions: Quick play:", composition.name);
  }

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
</script>

{#if recentCompositions.length > 0}
  <section class="recent-compositions">
    <div class="section-header">
      <h2 class="section-title">
        <i class="fas fa-history"></i>
        Recent Compositions
      </h2>
      <span class="section-hint">Quick resume</span>
    </div>

    <div class="compositions-grid">
      {#each recentCompositions as composition (composition.id)}
        <button
          class="composition-card"
          style="--mode-color: {modeColors[composition.mode]}"
          onclick={() => handlePlay(composition)}
          aria-label="Play {composition.name}"
        >
          <!-- Mode indicator -->
          <div class="mode-badge">
            <i class="fas {modeIcons[composition.mode]}"></i>
          </div>

          <!-- Card content -->
          <div class="card-content">
            <h3 class="composition-name">{composition.name}</h3>
            <div class="composition-meta">
              <span class="mode-label">{composition.mode}</span>
              <span class="separator">-</span>
              <span class="date">{formatDate(composition.updatedAt)}</span>
            </div>
          </div>

          <!-- Play indicator on hover -->
          <div class="play-overlay">
            <i class="fas fa-play"></i>
          </div>

          <!-- Favorite indicator -->
          {#if composition.isFavorite}
            <div class="favorite-badge" aria-label="Favorited">
              <i class="fas fa-heart"></i>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </section>
{/if}

<style>
  .recent-compositions {
    padding: clamp(1rem, 4vw, 1.5rem);
    padding-top: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: clamp(0.75rem, 3vw, 1rem);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0;
    font-size: clamp(0.875rem, 3vw, 1.125rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .section-title i {
    font-size: 0.875em;
    opacity: 0.7;
  }

  .section-hint {
    font-size: clamp(0.75rem, 2.5vw, 0.875rem);
    color: rgba(255, 255, 255, 0.5);
  }

  .compositions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(180px, 100%), 1fr));
    gap: clamp(0.625rem, 2.5vw, 1rem);
  }

  .composition-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: clamp(0.75rem, 3vw, 1rem);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(0.625rem, 2.5vw, 1rem);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    text-align: left;
  }

  .composition-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      var(--mode-color) 0%,
      transparent 100%
    );
    opacity: 0.1;
    transition: opacity 0.2s ease;
  }

  .composition-card:hover {
    border-color: var(--mode-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .composition-card:hover::before {
    opacity: 0.2;
  }

  .composition-card:active {
    transform: scale(0.98);
    transition-duration: 50ms;
  }

  .mode-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(1.75rem, 7vw, 2.25rem);
    height: clamp(1.75rem, 7vw, 2.25rem);
    background: var(--mode-color);
    border-radius: clamp(0.375rem, 1.5vw, 0.5rem);
    color: white;
    font-size: clamp(0.75rem, 3vw, 1rem);
    margin-bottom: clamp(0.5rem, 2vw, 0.75rem);
  }

  .card-content {
    position: relative;
    z-index: 1;
  }

  .composition-name {
    margin: 0 0 clamp(0.25rem, 1vw, 0.375rem) 0;
    font-size: clamp(0.875rem, 3.5vw, 1rem);
    font-weight: 600;
    color: white;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .composition-meta {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: clamp(0.6875rem, 2.5vw, 0.8125rem);
    color: rgba(255, 255, 255, 0.6);
  }

  .mode-label {
    text-transform: capitalize;
  }

  .separator {
    opacity: 0.4;
  }

  .play-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: clamp(1.5rem, 6vw, 2rem);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .composition-card:hover .play-overlay {
    opacity: 1;
  }

  .favorite-badge {
    position: absolute;
    top: clamp(0.375rem, 1.5vw, 0.5rem);
    right: clamp(0.375rem, 1.5vw, 0.5rem);
    color: #ec4899;
    font-size: clamp(0.625rem, 2.5vw, 0.75rem);
    z-index: 2;
  }

  @media (prefers-reduced-motion: reduce) {
    .composition-card,
    .composition-card::before,
    .play-overlay {
      transition: none;
    }

    .composition-card:hover {
      transform: none;
    }
  }
</style>
