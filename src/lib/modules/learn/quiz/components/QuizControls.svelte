<!--
	Lesson Controls Component

	Provides lesson navigation and control buttons including
	pause/resume and restart functionality with desktop-matching styling.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";

  // Props
  let {
    currentView = "",
    showPauseButton = false,
    showRestartButton = false,
    isPaused = false,
    isDisabled = false,
    onPauseClicked,
    onResumeClicked,
    onRestartClicked,
    onReturnToSelector,
  } = $props<{
    currentView?: string;
    showPauseButton?: boolean;
    showRestartButton?: boolean;
    isPaused?: boolean;
    isDisabled?: boolean;
    onPauseClicked?: () => void;
    onResumeClicked?: () => void;
    onRestartClicked?: () => void;
    onReturnToSelector?: () => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Methods
  function handlePauseClick() {
    // Trigger selection haptic feedback for pause/resume
    hapticService?.trigger("selection");

    if (isPaused) {
      onResumeClicked?.();
    } else {
      onPauseClicked?.();
    }
  }

  function handleRestartClick() {
    // Trigger warning haptic feedback for restart (destructive action)
    hapticService?.trigger("warning");

    onRestartClicked?.();
  }

  function handleReturnToSelector() {
    // Trigger navigation haptic feedback for return to selector
    hapticService?.trigger("selection");

    onReturnToSelector?.();
  }
</script>

<div class="lesson-controls">
  {#if showPauseButton}
    <button
      class="control-button pause-button"
      class:paused={isPaused}
      disabled={isDisabled}
      onclick={handlePauseClick}
    >
      {isPaused ? "▶ Resume" : "⏸ Pause"}
    </button>
  {/if}

  {#if showRestartButton}
    <button
      class="control-button restart-button"
      disabled={isDisabled}
      onclick={handleRestartClick}
    >
      ↻ Restart
    </button>
  {/if}
</div>

<style>
  .lesson-controls {
    display: flex;
    align-items: center;
    gap: var(--desktop-spacing-md);
  }

  .control-button {
    font-family: var(--desktop-font-family);
    font-weight: bold;
    border-radius: var(--desktop-border-radius);
    border: 2px solid;
    cursor: pointer;
    transition: all var(--desktop-transition-normal);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: var(--desktop-spacing-sm) var(--desktop-spacing-lg);
    font-size: var(--desktop-font-size-base);
    min-width: 80px;
    gap: 0.25rem;
  }

  .control-button:hover {
    transform: translateY(-1px);
    box-shadow: var(--desktop-shadow-md);
  }

  .control-button:active {
    transform: translateY(0);
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  /* Pause/Resume button - Orange theme matching desktop */
  .pause-button {
    background-color: var(--desktop-orange);
    border-color: var(--desktop-orange-border);
    color: var(--desktop-text-primary);
  }

  .pause-button:hover:not(:disabled) {
    background-color: var(--desktop-orange-hover);
    border-color: var(--desktop-orange-hover-border);
  }

  .pause-button:active:not(:disabled) {
    background-color: var(--desktop-orange-active);
  }

  /* Resume state styling */
  .pause-button.paused {
    background-color: rgba(34, 197, 94, 0.7);
    border-color: rgba(34, 197, 94, 0.9);
  }

  .pause-button.paused:hover:not(:disabled) {
    background-color: rgba(34, 197, 94, 0.8);
    border-color: rgba(74, 222, 128, 1);
  }

  /* Restart button - Blue theme matching desktop */
  .restart-button {
    background-color: var(--desktop-restart-blue);
    border-color: var(--desktop-restart-blue-border);
    color: var(--desktop-text-primary);
  }

  .restart-button:hover:not(:disabled) {
    background-color: var(--desktop-restart-blue-hover);
    border-color: var(--desktop-restart-blue-hover-border);
  }

  .restart-button:active:not(:disabled) {
    background-color: var(--desktop-restart-blue-active);
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .lesson-controls {
      gap: var(--desktop-spacing-sm);
    }

    .control-button {
      min-width: 70px;
    }
  }

  @media (max-width: 480px) {
    .control-button {
      min-width: 60px;
    }
  }
</style>
