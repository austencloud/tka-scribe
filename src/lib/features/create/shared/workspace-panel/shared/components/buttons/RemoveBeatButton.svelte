<!--
  RemoveBeatButton.svelte

  Remove beat button for ButtonPanel.
  Removes the selected beat and all following beats.
-->
<script lang="ts">
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  // Props
  const {
    beatNumber,
    onclick,
  }: {
    beatNumber: number;
    onclick?: () => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedback;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  function handleClick() {
    hapticService?.trigger("warning");
    onclick?.();
  }
</script>

<button
  class="panel-button remove-beat-button"
  onclick={handleClick}
  aria-label="Remove Beat {beatNumber} and all following beats"
  title="Remove Beat {beatNumber} and all following beats"
>
  <i class="fa-solid fa-trash" aria-hidden="true"></i>
</button>

<style>
  .panel-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all var(--transition-normal, 0.3s cubic-bezier(0.4, 0, 0.2, 1));
    font-size: 18px;
    color: var(--theme-text, #ffffff);

    /* Base button styling */
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.2));
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .panel-button:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .panel-button:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .panel-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .remove-beat-button {
    background: linear-gradient(
      135deg,
      var(--semantic-warning, #ff9800) 0%,
      color-mix(in srgb, var(--semantic-warning, #ff9800) 80%, #ff0000) 100%
    );
    border-color: color-mix(
      in srgb,
      var(--semantic-warning, #ff9800) 30%,
      transparent
    );
    box-shadow: 0 4px 12px
      color-mix(in srgb, var(--semantic-warning, #ff9800) 40%, transparent);
  }

  .remove-beat-button:hover {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--semantic-warning, #ff9800) 80%, #ff0000) 0%,
      color-mix(in srgb, var(--semantic-warning, #ff9800) 60%, #ff0000) 100%
    );
    box-shadow: 0 6px 16px
      color-mix(in srgb, var(--semantic-warning, #ff9800) 60%, transparent);
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .panel-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .panel-button {
      width: var(
        --min-touch-target
      ); /* Maintain 48px minimum for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }

  @media (max-width: 320px) {
    .panel-button {
      width: var(--min-touch-target); /* NEVER below 48px for accessibility */
      height: var(--min-touch-target);
      font-size: 12px;
    }
  }

  /* 🎯 LANDSCAPE MOBILE: Maintain 48px minimum for accessibility */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .panel-button {
      width: var(
        --min-touch-target
      ); /* Maintain 48px minimum for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }
</style>
