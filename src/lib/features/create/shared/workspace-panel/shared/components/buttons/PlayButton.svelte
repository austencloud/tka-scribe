<!--
  PlayButton.svelte

  Button to open the animation viewer for sequence playback.
  Note: This only opens the viewer - actual playback controls are inside the viewer.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  let { onclick } = $props<{
    onclick?: () => void;
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
  onclick={handleClick}
  aria-label="Play sequence animation"
  title="Animate"
>
  <i class="fas fa-play"></i>
</button>

<style>
  .play-button {
    display: flex;
    align-items: center;
    justify-content: center;
    /* Desktop: 48px, Mobile: 48px minimum (iOS/Android touch target guidelines) */
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: linear-gradient(
      135deg,
      #a78bfa 0%,
      color-mix(in srgb, #a78bfa 85%, #8b5cf6) 100%
    ); /* Purple gradient */
    border: 1px solid color-mix(in srgb, #a78bfa 30%, transparent);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 4px 12px color-mix(in srgb, #a78bfa 40%, transparent);
  }

  .play-button:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, #a78bfa 85%, #8b5cf6) 0%,
      color-mix(in srgb, #a78bfa 70%, #8b5cf6) 100%
    );
    transform: scale(1.05);
    box-shadow: 0 6px 16px color-mix(in srgb, #a78bfa 60%, transparent);
  }

  .play-button:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .play-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .play-button i {
    font-size: 18px;
  }

  /* Mobile responsive adjustments - ALWAYS 48px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .play-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  /* Keep 48px on all smaller screens - reduce gaps instead of buttons */
  @media (max-width: 480px) {
    .play-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }

    .play-button i {
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .play-button {
      width: var(--min-touch-target); /* NEVER below 48px for accessibility */
      height: var(--min-touch-target);
      font-size: 16px;
    }

    .play-button i {
      font-size: 14px; /* Slightly smaller icon, but same touch target */
    }
  }

  /* Landscape mobile: Maintain 48px minimum */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .play-button {
      width: var(
        --min-touch-target
      ); /* Maintain 48px minimum for accessibility */
      height: var(--min-touch-target);
    }

    .play-button i {
      font-size: 16px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .play-button {
      background: color-mix(in srgb, #a78bfa 30%, transparent);
      border: 2px solid color-mix(in srgb, #a78bfa 70%, transparent);
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
