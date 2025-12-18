<script lang="ts">
  import { UndoOperationType } from "$lib/features/create/shared/services/contracts/IUndoService";
  import type { createCreateModuleState } from "$lib/features/create/shared/state/create-module-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  type CreateModuleState = ReturnType<typeof createCreateModuleState>;

  // Props
  let {
    CreateModuleState,
    onUndo = () => {},
  }: {
    CreateModuleState: CreateModuleState;
    onUndo?: () => void;
  } = $props();

  // Resolve haptic feedback service
  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Debug logging removed - this creates noise during reactive updates
  // $effect(() => {
  //   console.log('🔍 UndoButton: CreateModuleState.canUndo =', CreateModuleState.canUndo);
  // });

  // Derived state
  const undoButtonText = $derived(() => {
    if (!CreateModuleState.canUndo) return "Nothing to Undo";

    const lastEntry =
      CreateModuleState.undoHistory[CreateModuleState.undoHistory.length - 1];
    if (lastEntry?.metadata?.description) {
      return `Undo ${lastEntry.metadata.description}`;
    }

    // Fallback to type-based descriptions
    const typeDescriptions: Record<UndoOperationType, string> = {
      [UndoOperationType.ADD_BEAT]: "Add Beat",
      [UndoOperationType.REMOVE_BEATS]: "Remove Beats",
      [UndoOperationType.CLEAR_SEQUENCE]: "Clear Sequence",
      [UndoOperationType.SELECT_START_POSITION]: "Select Start Position",
      [UndoOperationType.UPDATE_BEAT]: "Update Beat",
      [UndoOperationType.INSERT_BEAT]: "Insert Beat",
      [UndoOperationType.MIRROR_SEQUENCE]: "Mirror Sequence",
      [UndoOperationType.ROTATE_SEQUENCE]: "Rotate Sequence",
      [UndoOperationType.SWAP_COLORS]: "Swap Colors",
      [UndoOperationType.MODIFY_BEAT_PROPERTIES]: "Modify Beat Properties",
      [UndoOperationType.GENERATE_SEQUENCE]: "Generate Sequence",
    };

    const lastType = lastEntry?.type as UndoOperationType | undefined;
    return `Undo ${lastType ? typeDescriptions[lastType] : "Last Action"}`;
  });

  const undoTooltip = $derived(() => {
    if (!CreateModuleState.canUndo) return "No actions to undo";

    const lastEntry =
      CreateModuleState.undoHistory[CreateModuleState.undoHistory.length - 1];
    if (lastEntry?.metadata?.description) {
      return `Undo: ${lastEntry.metadata.description}`;
    }

    return `Undo last action (${lastEntry?.type || "Unknown"})`;
  });

  // Functions
  function handleUndo() {
    hapticService?.trigger("selection");
    const success = CreateModuleState.undo();
    if (success) {
      onUndo();
    }
  }
</script>

<!-- Professional Undo Button matching ButtonPanel style - always visible but disabled when nothing to undo -->
<button
  class="undo-button"
  class:disabled={!CreateModuleState.canUndo}
  onclick={handleUndo}
  disabled={!CreateModuleState.canUndo}
  title={undoTooltip()}
  aria-label={undoButtonText()}
>
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M9 14L4 9L9 4"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M4 9H15A6 6 0 0 1 15 21H13"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</button>

<style>
  .undo-button {
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

    /* Purple gradient matching SaveToLibraryButton */
    background: linear-gradient(135deg, var(--theme-accent-strong, #8b5cf6) 0%, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 85%, var(--theme-accent-strong, #4f46e5)) 100%);
    border: 1px solid color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
  }

  .undo-button:hover:not(:disabled) {
    transform: scale(1.05);
    background: linear-gradient(135deg, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 85%, var(--theme-accent-strong, #4f46e5)) 0%, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 70%, var(--theme-accent-strong, #4f46e5)) 100%);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 60%, transparent);
  }

  .undo-button:active {
    transform: scale(0.95);
    transition: all 0.1s ease;
  }

  .undo-button:focus-visible {
    outline: 2px solid var(--theme-accent, #818cf8);
    outline-offset: 2px;
  }

  .undo-button:disabled,
  .undo-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .undo-button:disabled:hover,
  .undo-button.disabled:hover {
    transform: none;
    background: linear-gradient(135deg, var(--theme-accent-strong, #8b5cf6) 0%, color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 85%, var(--theme-accent-strong, #4f46e5)) 100%);
    box-shadow: 0 4px 12px color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 40%, transparent);
  }

  /* Mobile responsive - 48px minimum per iOS/Android guidelines */
  @media (max-width: 768px) {
    .undo-button {
      width: var(--min-touch-target);
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .undo-button {
      width: var(--min-touch-target); /* Maintain 48px minimum */
      height: var(--min-touch-target);
      font-size: 16px;
    }
  }

  @media (max-width: 320px) {
    .undo-button {
      width: var(--min-touch-target); /* NEVER below 48px for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }

  /* 🎯 LANDSCAPE MOBILE: Maintain 48px minimum for accessibility */
  @media (min-aspect-ratio: 17/10) and (max-height: 500px) {
    .undo-button {
      width: var(--min-touch-target); /* Maintain 48px minimum for accessibility */
      height: var(--min-touch-target);
      font-size: 14px;
    }
  }
</style>
