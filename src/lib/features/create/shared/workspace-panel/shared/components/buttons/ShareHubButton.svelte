<!--
  ShareHubButton.svelte

  Share Hub button that opens the unified sharing drawer with multiple export formats.
  4th button in Create module button panel (alongside Play, Image, Record).
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  let { onclick, isActive = false } = $props<{
    onclick?: () => void;
    isActive?: boolean;
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
  class="share-hub-button glass-button"
  class:active={isActive}
  onclick={handleClick}
  aria-label="Open Share Hub"
  aria-pressed={isActive}
  title="Share"
>
  <i class="fas fa-share-alt"></i>
</button>

<style>
  .share-hub-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: linear-gradient(
      135deg,
      #10b981 0%,
      color-mix(in srgb, #10b981 85%, #059669) 100%
    ); /* Green gradient (matches composite format) */
    border: 1px solid color-mix(in srgb, #10b981 30%, transparent);
    backdrop-filter: blur(10px);
    border-radius: 50%;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 4px 12px color-mix(in srgb, #10b981 40%, transparent);
  }

  .share-hub-button:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, #10b981 85%, #059669) 0%,
      color-mix(in srgb, #10b981 70%, #059669) 100%
    );
    transform: scale(1.05);
    box-shadow: 0 6px 16px color-mix(in srgb, #10b981 60%, transparent);
  }

  .share-hub-button:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .share-hub-button:focus-visible {
    outline: 2px solid var(--theme-accent, #10b981);
    outline-offset: 2px;
  }

  .share-hub-button.active {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 6px 20px color-mix(in srgb, #10b981 70%, transparent);
  }

  .share-hub-button i {
    font-size: 18px;
  }

  /* Mobile responsive adjustments - ALWAYS 48px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .share-hub-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .share-hub-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }

    .share-hub-button i {
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .share-hub-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }

    .share-hub-button i {
      font-size: 14px;
    }
  }

  /* Landscape mobile: Maintain 48px minimum */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .share-hub-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
    }

    .share-hub-button i {
      font-size: 16px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .share-hub-button {
      background: color-mix(in srgb, #10b981 30%, transparent);
      border: 2px solid color-mix(in srgb, #10b981 70%, transparent);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .share-hub-button {
      transition: none;
    }

    .share-hub-button:hover {
      transform: none;
    }

    .share-hub-button:active {
      transform: none;
    }
  }
</style>
