<!--
  SequenceActionsButton.svelte

  Opens a sheet with various sequence actions (Animate, Mirror, Rotate, etc.)
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
  class="sequence-actions-button glass-button"
  onclick={handleClick}
  aria-label="Sequence actions"
  title="Sequence actions"
  data-testid="sequence-actions-button"
>
  <i class="fas fa-tools"></i>
</button>

<style>
  .sequence-actions-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border: 1px solid color-mix(in srgb, var(--semantic-info, #06b6d4) 30%, transparent);
    background: linear-gradient(135deg, var(--semantic-info, #06b6d4) 0%, color-mix(in srgb, var(--semantic-info, #06b6d4) 85%, #0e7490) 100%);
    border-radius: 50%;
    color: var(--theme-text, #ffffff);
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 4px 12px color-mix(in srgb, var(--semantic-info, #06b6d4) 40%, transparent);
  }

  .sequence-actions-button:hover {
    background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-info, #06b6d4) 85%, #0e7490) 0%, color-mix(in srgb, var(--semantic-info, #06b6d4) 70%, #0e7490) 100%);
    transform: scale(1.05);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--semantic-info, #06b6d4) 60%, transparent);
  }

  .sequence-actions-button:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .sequence-actions-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .sequence-actions-button i {
    font-size: 18px;
  }

  /* Mobile responsive - 52px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .sequence-actions-button {
      width: 52px;
      height: 52px;
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .sequence-actions-button {
      width: 52px; /* Maintain 52px minimum */
      height: 52px;
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .sequence-actions-button {
      width: 52px; /* NEVER below 52px for accessibility */
      height: 52px;
      font-size: 14px;
    }
  }

  /* Landscape mobile: Maintain 52px minimum */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .sequence-actions-button {
      width: 52px; /* Maintain 52px minimum for accessibility */
      height: 52px;
    }

    .sequence-actions-button i {
      font-size: 16px;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .sequence-actions-button {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.2));
      border: 2px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.5));
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .sequence-actions-button {
      transition: none;
    }

    .sequence-actions-button:hover {
      transform: none;
    }

    .sequence-actions-button:active {
      transform: none;
    }
  }
</style>
