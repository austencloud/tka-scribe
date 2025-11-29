<!--
  AddToLibraryButton.svelte

  Add to Library button for ButtonPanel.
  Saves the current constructed sequence to the user's Firebase library.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  // Props
  const {
    onclick,
    disabled = false,
  }: {
    onclick?: () => void;
    disabled?: boolean;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleClick() {
    if (disabled) return;
    hapticService?.trigger("success");
    onclick?.();
  }
</script>

<button
  class="panel-button add-to-library-button"
  onclick={handleClick}
  {disabled}
  aria-label="Add to library"
  title="Add to library"
>
  <i class="fa-solid fa-bookmark" aria-hidden="true"></i>
</button>

<style>
  .panel-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-size: 18px;
    color: #ffffff;

    /* Base button styling */
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .panel-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .panel-button:active:not(:disabled) {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .panel-button:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 2px;
  }

  .panel-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  .add-to-library-button {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }

  .add-to-library-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    box-shadow: 0 6px 16px rgba(139, 92, 246, 0.6);
  }

  /* Mobile responsive adjustments */
  @media (max-width: 768px) {
    .panel-button {
      width: 44px;
      height: 44px;
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .panel-button {
      width: 44px; /* Maintain 44px minimum for accessibility */
      height: 44px;
      font-size: 14px;
    }
  }

  @media (max-width: 320px) {
    .panel-button {
      width: 44px; /* NEVER below 44px for accessibility */
      height: 44px;
      font-size: 12px;
    }
  }

  /* 🎯 LANDSCAPE MOBILE: Maintain 44px minimum for accessibility */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .panel-button {
      width: 44px; /* Maintain 44px minimum for accessibility */
      height: 44px;
      font-size: 14px;
    }
  }
</style>
