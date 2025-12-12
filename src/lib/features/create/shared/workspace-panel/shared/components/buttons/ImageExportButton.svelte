<!--
  ImageExportButton.svelte

  Opens the image export panel from the ButtonPanel. Highlights when the panel is visible.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  const {
    onclick,
    isActive = false,
    disabled = false,
  }: {
    onclick?: () => void;
    isActive?: boolean;
    disabled?: boolean;
  } = $props();

  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    if (disabled) return;
    hapticService?.trigger("selection");
    onclick?.();
  }
</script>

<button
  class="panel-button image-export-button"
  class:active={isActive}
  onclick={handleClick}
  aria-pressed={isActive}
  aria-label={isActive ? "Close image export" : "Export as image"}
  title="Export Image"
  {disabled}
>
  <i class="fas fa-image" aria-hidden="true"></i>
</button>

<style>
  .panel-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    font-size: 18px;
    color: var(--theme-text, #ffffff);

    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #8b5cf6) 90%, transparent),
      color-mix(in srgb, #ec4899 90%, transparent)
    );
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
    box-shadow:
      0 2px 8px color-mix(in srgb, var(--theme-accent, #4f46e5) 35%, transparent),
      0 6px 18px color-mix(in srgb, #ec4899 25%, transparent);
  }

  .panel-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow:
      0 4px 12px color-mix(in srgb, var(--theme-accent, #4f46e5) 45%, transparent),
      0 8px 22px color-mix(in srgb, #ec4899 35%, transparent);
  }

  .panel-button:active:not(:disabled) {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .panel-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .panel-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .image-export-button.active {
    background: linear-gradient(
      135deg,
      var(--theme-accent, #8b5cf6),
      #ec4899
    );
    box-shadow:
      0 4px 14px color-mix(in srgb, var(--theme-accent, #4f46e5) 55%, transparent),
      0 10px 26px color-mix(in srgb, #ec4899 40%, transparent);
  }

  /* Mobile responsive - ALWAYS 52px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .panel-button {
      width: 52px;
      height: 52px;
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .panel-button {
      width: 52px; /* Keep 52px minimum */
      height: 52px;
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .panel-button {
      width: 52px; /* NEVER below 52px for accessibility */
      height: 52px;
      font-size: 14px; /* Smaller icon, same touch target */
    }
  }

  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .panel-button {
      width: 52px; /* Maintain 52px minimum for accessibility */
      height: 52px;
      font-size: 14px;
    }
  }
</style>
