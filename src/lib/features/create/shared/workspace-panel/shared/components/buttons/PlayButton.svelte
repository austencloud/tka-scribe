<!--
  PlayButton.svelte

  Central play button that opens inline AnimatorPanel for sequence playback
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  let { onclick, isAnimating = false } = $props<{
    onclick?: () => void;
    isAnimating?: boolean;
  }>();

  // Resolve haptic feedback service
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

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
  {:else}
    <i class="fas fa-play"></i>
  {/if}
</button>

<style>
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Desktop: 52px, Mobile: 52px minimum (iOS/Android touch target guidelines) */
    width: 52px;
    height: 52px;
    border: none;
    background: rgba(
      59,
      130,
      246,
      0.2
    ); /* Subtle blue tint for primary action */
    backdrop-filter: blur(10px);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.95);
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .play-button:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .play-button:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .play-button:focus-visible {
    outline: 2px solid var(--primary-light, #818cf8);
    outline-offset: 2px;
  }

  /* Animating state - red/stop color */
  .play-button.is-animating {
    background: rgba(239, 68, 68, 0.2); /* Red tint when animating */
  }

  .play-button.is-animating:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .play-button i {
    font-size: 18px;
  }

  /* Mobile responsive adjustments - ALWAYS 52px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .play-button {
      width: 52px;
      height: 52px;
      font-size: 16px;
    }
  }

  /* Keep 52px on all smaller screens - reduce gaps instead of buttons */
  @media (max-width: 480px) {
    .play-button {
      width: 52px;
      height: 52px;
      font-size: 16px;
    }

    .play-button i {
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .play-button {
      width: 52px; /* NEVER below 52px for accessibility */
      height: 52px;
      font-size: 16px;
    }

    .play-button i {
      font-size: 14px; /* Slightly smaller icon, but same touch target */
    }
  }

  /* Landscape mobile: Maintain 52px minimum */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .play-button {
      width: 52px; /* Maintain 52px minimum for accessibility */
      height: 52px;
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
