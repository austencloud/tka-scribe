<!-- LessonModeToggle.svelte - Quiz mode selection toggle -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import { QuizMode } from "../domain";

  // Props
  let {
    selectedMode = $bindable(QuizMode.FIXED_QUESTION),
    disabled = false,
    onModeChanged,
  } = $props<{
    selectedMode?: QuizMode;
    disabled?: boolean;
    onModeChanged?: (mode: QuizMode) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Handle mode selection
  function selectMode(mode: QuizMode) {
    if (disabled) return;

    // Trigger selection haptic feedback for quiz mode selection
    hapticService?.trigger("selection");

    selectedMode = mode;
    onModeChanged?.(mode);
  }
</script>

<div class="mode-toggle-container">
  <div class="toggle-group">
    <button
      class="toggle-button"
      class:active={selectedMode === QuizMode.FIXED_QUESTION}
      class:disabled
      onclick={() => selectMode(QuizMode.FIXED_QUESTION)}
      {disabled}
    >
      Fixed Questions
    </button>
    <button
      class="toggle-button"
      class:active={selectedMode === QuizMode.COUNTDOWN}
      class:disabled
      onclick={() => selectMode(QuizMode.COUNTDOWN)}
      {disabled}
    >
      Countdown
    </button>
  </div>
</div>

<style>
  .mode-toggle-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: var(--spacing-md) 0; /* Reduced from lg */
    width: 100%;
  }

  .toggle-group {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    padding: 4px;
    display: flex;
    gap: 0;
    backdrop-filter: var(--glass-backdrop);
  }

  .toggle-button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    font-family: Georgia, serif;
    font-size: 12px;
    font-weight: 500;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-normal);
    white-space: nowrap;
    min-width: 120px;
    text-align: center;
  }

  .toggle-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .toggle-button.active {
    background: rgba(62, 99, 221, 0.8);
    color: white;
    font-weight: bold;
  }

  .toggle-button.active:hover:not(.disabled) {
    background: rgba(62, 99, 221, 0.9);
  }

  .toggle-button:active:not(.disabled) {
    transform: scale(0.98);
  }

  .toggle-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .mode-toggle-container {
      margin: var(--spacing-xs) 0; /* Minimal margin on mobile */
    }

    .toggle-group {
      padding: 5px;
      border-width: 1.5px; /* Thicker border for visibility */
    }

    .toggle-button {
      font-size: 0.875rem; /* 14px - more readable */
      padding: 10px 18px;
      min-width: 130px;
      min-height: 44px; /* Good mobile touch target */
    }
  }

  @media (max-width: 480px) {
    .mode-toggle-container {
      margin: 4px 0; /* Tiny margin */
      padding: 0 var(--spacing-xs);
    }

    .toggle-group {
      padding: 6px;
      border-radius: 8px;
      width: 100%;
      max-width: 320px;
    }

    .toggle-button {
      font-size: 0.8125rem; /* 13px */
      padding: 12px 16px;
      min-width: 0; /* Allow flexible width */
      flex: 1; /* Equal width buttons */
      min-height: 48px; /* Generous touch target */
    }
  }

  @media (max-width: 400px) {
    .toggle-button {
      font-size: 0.75rem; /* 12px */
      padding: 14px 12px;
      min-height: 52px; /* Maximum touch target */
    }
  }
</style>
