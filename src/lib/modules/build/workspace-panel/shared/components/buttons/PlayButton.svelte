<!--
  PlayButton.svelte

  Central play button that opens inline AnimatorPanel for sequence playback
-->
<script lang="ts">
  import { resolve, TYPES } from "$shared/inversify";
  import type { IHapticFeedbackService } from "$shared/application/services/contracts";

  let {
    onclick,
    isAnimating = false,
  } = $props<{
    onclick?: () => void;
    isAnimating?: boolean;
  }>();

  // Resolve haptic feedback service
  const hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

  function handleClick() {
    hapticService?.trigger("selection");
    onclick?.();
  }
</script>

<button
  class="play-button glass-button"
  class:is-animating={isAnimating}
  onclick={handleClick}
  aria-label={isAnimating ? "Stop animation" : "Play animation"}
  title={isAnimating ? "Stop" : "Play"}
>
  {#if isAnimating}
    <i class="fas fa-stop"></i>
    <span class="button-label">Stop</span>
  {:else}
    <i class="fas fa-play"></i>
    <span class="button-label">Play</span>
  {/if}
</button>

<style>
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 20px;
    border: none;
    background: rgba(59, 130, 246, 0.2); /* Subtle blue tint for primary action */
    backdrop-filter: blur(10px);
    border-radius: 16px;
    color: rgba(255, 255, 255, 0.95);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }

  .play-button:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: translateY(-1px);
  }

  .play-button:active {
    transform: scale(0.95);
  }

  /* Animating state - red/stop color */
  .play-button.is-animating {
    background: rgba(239, 68, 68, 0.2); /* Red tint when animating */
  }

  .play-button.is-animating:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .play-button i {
    font-size: 16px;
  }

  .button-label {
    font-size: 14px;
    font-weight: 500;
  }

  /* Mobile: Hide label, show only icon */
  @media (max-width: 768px) {
    .button-label {
      display: none;
    }

    .play-button {
      padding: 12px;
      min-width: 44px;
      min-height: 44px;
    }

    .play-button i {
      font-size: 18px;
    }
  }

  /* Landscape mobile: Ultra-compact */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .play-button {
      padding: 8px;
      min-width: 36px;
      min-height: 36px;
    }

    .play-button i {
      font-size: 16px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .play-button {
      background: rgba(59, 130, 246, 0.3);
      border: 2px solid rgba(59, 130, 246, 0.7);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .play-button {
      transition: none;
    }

    .play-button:hover {
      transform: none;
    }

    .play-button:active {
      transform: none;
    }
  }
</style>
