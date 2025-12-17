<!--
  SaveSequencePanelButton.svelte

  Save sequence button for ButtonPanel (panel-style, not floating).
  Saves the current sequence to the Explore.
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

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    hapticService?.trigger("success");
    onclick?.();
  }
</script>

<button
  class="panel-button save-button"
  onclick={handleClick}
  aria-label="Save sequence"
  title="Save sequence"
>
  <i class="fa-solid fa-save" aria-hidden="true"></i>
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

  .save-button {
    background: linear-gradient(135deg, var(--semantic-success, #22c55e) 0%, color-mix(in srgb, var(--semantic-success, #22c55e) 80%, #15803d) 100%);
    border-color: color-mix(in srgb, var(--semantic-success, #22c55e) 30%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--semantic-success, #22c55e) 40%, transparent);
  }

  .save-button:hover {
    background: linear-gradient(135deg, color-mix(in srgb, var(--semantic-success, #22c55e) 80%, #15803d) 0%, color-mix(in srgb, var(--semantic-success, #22c55e) 60%, #15803d) 100%);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--semantic-success, #22c55e) 60%, transparent);
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
      width: var(--min-touch-target); /* Maintain 48px minimum for accessibility */
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
      width: var(--min-touch-target); /* Maintain 48px minimum for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }
</style>
