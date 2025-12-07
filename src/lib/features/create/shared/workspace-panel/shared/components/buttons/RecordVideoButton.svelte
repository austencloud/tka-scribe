<!--
  RecordVideoButton.svelte

  Opens the video recording drawer from the ButtonPanel. Highlights when the drawer is visible.
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
  class="panel-button record-button"
  class:active={isActive}
  onclick={handleClick}
  aria-pressed={isActive}
  aria-label={isActive ? "Close video recorder" : "Record video"}
  title="Record Video"
  {disabled}
>
  <i class="fas fa-video" aria-hidden="true"></i>
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
    color: #ffffff;

    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.9),
      rgba(220, 38, 38, 0.9)
    );
    border: 1px solid rgba(255, 255, 255, 0.25);
    box-shadow:
      0 2px 8px rgba(239, 68, 68, 0.35),
      0 6px 18px rgba(220, 38, 38, 0.25);
  }

  .panel-button:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow:
      0 4px 12px rgba(239, 68, 68, 0.45),
      0 8px 22px rgba(220, 38, 38, 0.35);
  }

  .panel-button:active:not(:disabled) {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .panel-button:focus-visible {
    outline: 2px solid var(--primary-light, #fca5a5);
    outline-offset: 2px;
  }

  .panel-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
  }

  .record-button.active {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 1),
      rgba(220, 38, 38, 1)
    );
    box-shadow:
      0 4px 14px rgba(239, 68, 68, 0.55),
      0 10px 26px rgba(220, 38, 38, 0.4);
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
