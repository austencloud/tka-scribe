<!-- LessonButton.svelte - Styled lesson selection button -->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { QuizType } from "../domain";

  // Props
  let {
    text,
    lessonType,
    description = "",
    disabled = false,
    onClicked,
  } = $props<{
    text: string,
    lessonType: QuizType,
    description?: string,
    disabled?: boolean,
    onClicked?: (value: QuizType) => void
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Handle button click
  function handleClick() {
    if (disabled) return;

    // Trigger selection haptic feedback for lesson selection
    hapticService?.trigger("selection");

    onClicked?.(lessonType);
  }
</script>

<div class="lesson-button-container">
  <button
    class="lesson-button"
    class:disabled
    onclick={handleClick}
    title={description}
    {disabled}
  >
    {text}
  </button>
  {#if description}
    <p class="lesson-description">{description}</p>
  {/if}
</div>

<style>
  .lesson-button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    margin: var(--spacing-md) 0;
    width: 100%;
  }

  .lesson-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px;
    color: white;
    font-family: Georgia, serif;
    font-weight: bold;
    font-size: 16px;
    padding: 12px 24px;
    cursor: pointer;
    transition: all var(--transition-normal);
    backdrop-filter: var(--glass-backdrop);
    box-shadow: var(--shadow-glass);
    min-width: 200px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .lesson-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    transition: left var(--transition-slow);
  }

  .lesson-button:hover:not(.disabled) {
    background: rgba(255, 255, 255, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: var(--shadow-glass-hover);
  }

  .lesson-button:hover:not(.disabled)::before {
    left: 100%;
  }

  .lesson-button:active:not(.disabled) {
    background: rgba(255, 255, 255, 0.4);
    border: 2px solid rgba(255, 255, 255, 0.6);
    transform: translateY(0);
  }

  .lesson-button.disabled {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    transform: none;
  }

  .lesson-description {
    color: rgba(255, 255, 255, 0.8);
    font-family: Georgia, serif;
    font-size: 12px;
    text-align: center;
    margin: 0;
    max-width: 300px;
    line-height: 1.4;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .lesson-button-container {
      margin: var(--spacing-sm) 0;
      gap: var(--spacing-xs);
    }

    .lesson-button {
      font-size: 1rem; /* 16px - good touch target */
      padding: 14px 28px; /* Larger touch target */
      min-width: 220px;
      min-height: 48px; /* Minimum mobile touch target */
      border-width: 2.5px; /* Thicker border for visibility */
    }

    .lesson-description {
      font-size: 0.875rem; /* 14px - more readable */
      max-width: 280px;
      line-height: 1.5;
    }
  }

  @media (max-width: 480px) {
    .lesson-button {
      font-size: 0.95rem; /* 15.2px */
      padding: 16px 24px; /* Even larger touch area */
      min-width: 240px;
      min-height: 52px; /* Generous touch target */
      width: 90%; /* Take most of available width */
      max-width: 320px;
    }

    .lesson-description {
      font-size: 0.8125rem; /* 13px */
      max-width: 90%;
      padding: 0 var(--spacing-xs);
    }
  }

  @media (max-width: 400px) {
    .lesson-button {
      font-size: 0.9rem;
      padding: 18px 20px; /* Maximum touch target */
      min-height: 56px;
      width: 95%;
    }

    .lesson-description {
      font-size: 0.75rem; /* 12px */
    }
  }

  /* Focus styles for accessibility */
  .lesson-button:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.6);
    outline-offset: 2px;
  }
</style>
