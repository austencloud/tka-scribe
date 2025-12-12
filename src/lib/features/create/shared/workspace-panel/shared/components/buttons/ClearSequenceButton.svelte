<!--
  ClearSequencePanelButton.svelte

  Clear sequence button for ButtonPanel (panel-style, not floating).
  Clears the entire sequence when clicked.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  // Props
  const {
    onclick,
  }: {
    onclick?: () => void;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    hapticService?.trigger("selection");
    onclick?.();
  }
</script>

<button
  class="panel-button clear-button"
  onclick={handleClick}
  aria-label="Clear sequence"
  title="Clear sequence"
>
  <i class="fa-solid fa-broom" aria-hidden="true"></i>
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

  .clear-button {
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 80%, transparent);
    border-color: color-mix(in srgb, var(--semantic-error, #ef4444) 30%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--semantic-error, #ef4444) 40%, transparent);
  }

  .clear-button:hover {
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 90%, transparent);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--semantic-error, #ef4444) 60%, transparent);
  }

  /* Mobile responsive - 52px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .panel-button {
      width: 52px;
      height: 52px;
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .panel-button {
      width: 52px; /* Maintain 52px minimum */
      height: 52px;
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .panel-button {
      width: 52px; /* NEVER below 52px for accessibility */
      height: 52px;
      font-size: 14px;
    }
  }

  /* 🎯 LANDSCAPE MOBILE: Maintain 52px minimum for accessibility */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .panel-button {
      width: 52px; /* Maintain 52px minimum for accessibility */
      height: 52px;
      font-size: 14px;
    }
  }
</style>
