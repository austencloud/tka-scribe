<!--
  SaveToLibraryButton.svelte

  Compact save-to-library button for the sequence workspace top bar.
  Matches UndoButton styling - circular, 48px, professional glass effect.
  Opens SaveToLibraryDialog when clicked.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  // Props
  let {
    sequence = null,
    disabled = false,
    onclick,
  }: {
    sequence?: SequenceData | null;
    disabled?: boolean;
    onclick?: () => void;
  } = $props();

  // Resolve haptic feedback service
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Check if sequence has content worth saving
  const hasContent = $derived.by(() => {
    if (!sequence) return false;
    return (
      sequence.beats.length > 0 ||
      !!sequence.startPosition ||
      !!sequence.startingPositionBeat
    );
  });

  const isDisabled = $derived(!hasContent || disabled);

  function handleClick() {
    if (isDisabled) return;
    hapticService?.trigger("success");
    onclick?.();
  }

  const tooltip = $derived(
    isDisabled ? "Create a sequence first" : "Save to library"
  );
</script>

<button
  class="save-button"
  class:disabled={isDisabled}
  onclick={handleClick}
  disabled={isDisabled}
  title={tooltip}
  aria-label="Save to library"
>
  <i class="fa-solid fa-bookmark" aria-hidden="true"></i>
</button>

<style>
  .save-button {
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

    /* Purple gradient matching AddToLibraryButton */
    background: linear-gradient(135deg, var(--theme-accent-strong, #8b5cf6) 0%, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 85%, var(--theme-accent-strong, #4f46e5)) 100%);
    border: 1px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
  }

  .save-button:hover:not(:disabled) {
    transform: scale(1.05);
    background: linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 85%, var(--theme-accent-strong, #4f46e5)) 0%, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 70%, var(--theme-accent-strong, #4f46e5)) 100%);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 60%, transparent);
  }

  .save-button:active:not(:disabled) {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .save-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .save-button:disabled,
  .save-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .save-button:disabled:hover,
  .save-button.disabled:hover {
    transform: none;
    background: linear-gradient(135deg, var(--theme-accent-strong, #8b5cf6) 0%, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 85%, var(--theme-accent-strong, #4f46e5)) 100%);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
  }

  /* Mobile responsive - 48px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .save-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .save-button {
      width: var(--min-touch-target); /* Maintain 48px minimum */
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .save-button {
      width: var(--min-touch-target); /* NEVER below 48px for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }

  /* LANDSCAPE MOBILE: Maintain 48px minimum for accessibility */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .save-button {
      width: var(--min-touch-target); /* Maintain 48px minimum for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }
</style>
