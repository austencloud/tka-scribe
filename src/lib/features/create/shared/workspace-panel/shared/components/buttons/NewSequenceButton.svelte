<script lang="ts">
  /**
   * New Sequence Button
   *
   * Button to start a new sequence session.
   * Shows confirmation dialog if current session has unsaved changes.
   *
   * Domain: Create module - Session management
   */

  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";

  interface Props {
    onclick?: () => void;
    disabled?: boolean;
  }

  const { onclick, disabled = false }: Props = $props();

  let hapticService: IHapticFeedbackService;

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
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
  class="panel-button new-sequence-button"
  class:disabled
  onclick={handleClick}
  aria-label="New sequence"
  title="New sequence"
  {disabled}
>
  <i class="fa-solid fa-file-plus" aria-hidden="true"></i>
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

  .panel-button:hover:not(.disabled) {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .panel-button:active:not(.disabled) {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .panel-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .new-sequence-button {
    background: linear-gradient(
      135deg,
      var(--theme-accent, #667eea) 0%,
      color-mix(in srgb, var(--theme-accent, #667eea) 80%, #764ba2) 100%
    );
    border: 1px solid var(--theme-stroke-strong, rgba(255, 255, 255, 0.3));
  }

  .new-sequence-button:hover:not(.disabled) {
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent, #667eea) 90%, white) 0%,
      color-mix(in srgb, var(--theme-accent, #667eea) 70%, #764ba2) 100%
    );
  }

  .panel-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    .panel-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }
</style>
