<!--
	Letter to Pictograph Quiz - Clean Balanced Design

	Shows a letter and asks the user to identify the correct pictograph.
	Balanced layout that uses available space well on all devices.
-->

<script lang="ts">
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import { QuestionGeneratorService } from "../services/implementations/QuestionGenerator";
  import { QuizType } from "../domain/enums/quiz-enums";
  import type { QuizQuestionData } from "../domain/models/quiz-models";

  // Props
  let { onAnswerSubmit, onNextQuestion, onBack } = $props<{
    onAnswerSubmit?: (isCorrect: boolean) => void;
    onNextQuestion?: () => void;
    onBack?: () => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  // State
  let questionData = $state<QuizQuestionData | null>(null);
  let selectedAnswerId = $state<string | null>(null);
  let isAnswered = $state(false);
  let showFeedback = $state(false);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let questionKey = $state(0);

  // Derived state
  let questionLetter = $derived(questionData?.questionContent as string);
  let isCorrectAnswer = $derived(
    selectedAnswerId
      ? (questionData?.answerOptions.find((o) => o.id === selectedAnswerId)
          ?.isCorrect ?? false)
      : false
  );

  // Initialize
  onMount(async () => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    await loadQuestion();
  });

  async function loadQuestion() {
    isLoading = true;
    error = null;

    try {
      questionData = await QuestionGeneratorService.generateQuestion(
        QuizType.LETTER_TO_PICTOGRAPH
      );
      questionKey++;
    } catch (err) {
      console.error("Failed to load question:", err);
      error = err instanceof Error ? err.message : "Failed to load question";
    } finally {
      isLoading = false;
    }
  }

  function handleAnswerClick(optionId: string, isCorrect: boolean) {
    if (isAnswered) return;

    hapticService?.trigger("selection");

    selectedAnswerId = optionId;
    isAnswered = true;
    showFeedback = true;

    setTimeout(() => {
      if (isCorrect) {
        hapticService?.trigger("success");
      } else {
        hapticService?.trigger("error");
      }
    }, 100);

    onAnswerSubmit?.(isCorrect);

    setTimeout(() => {
      handleNextQuestion();
    }, 1200);
  }

  async function handleNextQuestion() {
    selectedAnswerId = null;
    isAnswered = false;
    showFeedback = false;
    await loadQuestion();
    onNextQuestion?.();
  }

  function getButtonState(
    optionId: string,
    isCorrect: boolean
  ): "default" | "correct" | "incorrect" | "dimmed" {
    if (!isAnswered) return "default";
    if (isCorrect) return "correct";
    if (selectedAnswerId === optionId) return "incorrect";
    return "dimmed";
  }
</script>

{#if isLoading}
  <div class="quiz-container">
    {#if onBack}
      <button
        class="back-button"
        onclick={onBack}
        aria-label="Back to quiz selector"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading...</p>
    </div>
  </div>
{:else if error}
  <div class="quiz-container">
    {#if onBack}
      <button
        class="back-button"
        onclick={onBack}
        aria-label="Back to quiz selector"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
    <div class="error-state">
      <p class="error-text">{error}</p>
      <button class="retry-btn" onclick={loadQuestion}>Try Again</button>
    </div>
  </div>
{:else if questionData && questionLetter}
  <div class="quiz-container">
    {#if onBack}
      <button
        class="back-button"
        onclick={onBack}
        aria-label="Back to quiz selector"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
    <!-- Subtle prompt text -->
    <p class="quiz-prompt">Which pictograph represents this letter?</p>

    <div class="quiz-content">
      <!-- Letter Section -->
      {#key questionKey}
        <div class="letter-section">
          <div class="letter-card">
            <span class="letter">{questionLetter}</span>
          </div>
        </div>
      {/key}

      <!-- Answer Section -->
      <div class="answer-section">
        <div class="answer-grid">
          {#each questionData.answerOptions as option (option.id)}
            {@const state = getButtonState(option.id, option.isCorrect)}
            <button
              class="answer-btn"
              class:correct={state === "correct"}
              class:incorrect={state === "incorrect"}
              class:dimmed={state === "dimmed"}
              onclick={() => handleAnswerClick(option.id, option.isCorrect)}
              disabled={isAnswered}
            >
              <div class="pictograph-wrapper">
                <Pictograph
                  pictographData={option.content as PictographData}
                  showTKA={false}
                  showVTG={false}
                  showElemental={false}
                  showPositions={false}
                />
              </div>
              {#if state === "correct"}
                <span class="result-icon correct-icon">✓</span>
              {:else if state === "incorrect"}
                <span class="result-icon incorrect-icon">✗</span>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Feedback Banner -->
        {#if showFeedback}
          <div class="feedback-banner" class:correct={isCorrectAnswer}>
            <span class="feedback-text">
              {#if isCorrectAnswer}
                Correct! That's "{questionLetter}"
              {:else}
                The correct pictograph is highlighted
              {/if}
            </span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* ===========================================
     Quiz Container - Elegant centered layout
     Position content at visual sweet spot
     =========================================== */
  .quiz-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 1.5rem;
    /* Ensure top padding clears back button (50px) + breathing room */
    padding-top: 4.5rem;
    box-sizing: border-box;
    /* Slight upward bias for visual balance */
    padding-bottom: 3rem;
  }

  /* ===========================================
     Back Button - Subtle top-left positioning
     =========================================== */
  .back-button {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    transform: translateX(-2px);
  }

  .back-button:active {
    transform: translateX(-1px) scale(0.98);
  }

  /* Subtle prompt - establishes context */
  .quiz-prompt {
    margin: 0 0 1.5rem 0;
    font-size: 1rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 0.02em;
    text-align: center;
    /* Add horizontal padding to avoid back button overlap */
    padding: 0 4rem;
    width: 100%;
    box-sizing: border-box;
  }

  /* Mobile: Vertical stack layout */
  .quiz-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    width: 100%;
    max-width: 360px;
  }

  /* ===========================================
     Loading & Error States
     =========================================== */
  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
  }

  .loading-spinner {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-left-color: var(--theme-accent, #667eea);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text,
  .error-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9375rem;
    font-weight: 500;
  }

  .retry-btn {
    padding: 0.625rem 1.5rem;
    background: var(--theme-accent, #667eea);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.9375rem;
    cursor: pointer;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px
      color-mix(in srgb, var(--theme-accent) 40%, transparent);
  }

  /* ===========================================
     Letter Section - Hero element
     =========================================== */
  .letter-section {
    display: flex;
    justify-content: center;
    align-items: center;
    animation: letterEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes letterEntrance {
    from {
      opacity: 0;
      transform: scale(0.92) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .letter-card {
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--theme-accent) 15%, transparent),
      color-mix(in srgb, var(--theme-accent) 15%, transparent)
    );
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.15);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 0 80px -20px color-mix(in srgb, var(--theme-accent) 15%, transparent);
  }

  .letter {
    font-size: 5rem;
    font-weight: 800;
    color: white;
    font-family: Georgia, serif;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* ===========================================
     Answer Section
     =========================================== */
  .answer-section {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    width: 100%;
  }

  .answer-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    width: 100%;
  }

  /* ===========================================
     Answer Buttons - Refined styling
     =========================================== */
  .answer-btn {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .answer-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    border-color: color-mix(in srgb, var(--theme-accent) 40%, transparent);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .answer-btn:active:not(:disabled) {
    transform: translateY(-1px) scale(0.98);
  }

  .pictograph-wrapper {
    width: 100%;
    height: 100%;
    max-width: 120px;
    max-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  /* ===========================================
     Answer Button States
     =========================================== */
  .answer-btn.correct {
    background: rgba(34, 197, 94, 0.2);
    border-color: rgba(34, 197, 94, 0.6);
    animation: correctPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes correctPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    50% {
      transform: scale(1.04);
      box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
    }
  }

  .answer-btn.incorrect {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.6);
    animation: incorrectShake 0.4s ease-out;
  }

  @keyframes incorrectShake {
    0%,
    100% {
      transform: translateX(0);
    }
    20%,
    60% {
      transform: translateX(-5px);
    }
    40%,
    80% {
      transform: translateX(5px);
    }
  }

  .answer-btn.dimmed {
    opacity: 0.35;
    cursor: default;
  }

  .answer-btn:disabled {
    cursor: default;
  }

  /* Result Icons */
  .result-icon {
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 1rem;
    font-weight: bold;
    animation: iconPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes iconPop {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .correct-icon {
    color: rgb(34, 197, 94);
  }

  .incorrect-icon {
    color: rgb(239, 68, 68);
  }

  /* ===========================================
     Feedback Banner - Fixed position to escape overflow:hidden parents
     =========================================== */
  .feedback-banner {
    position: fixed;
    bottom: calc(var(--primary-nav-height, 64px) + 1rem);
    left: 50%;
    transform: translateX(-50%);
    padding: 0.75rem 1.25rem;
    background: rgba(239, 68, 68, 0.9);
    border-radius: 12px;
    text-align: center;
    animation: bannerFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    backdrop-filter: blur(8px);
    white-space: nowrap;
    /* Must be above bottom nav (z-index: 100) */
    z-index: 150;
  }

  .feedback-banner.correct {
    background: rgba(34, 197, 94, 0.9);
  }

  @keyframes bannerFadeIn {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  .feedback-text {
    color: white;
    font-size: 0.9375rem;
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  /* ===========================================
     Tablet/Desktop: Refined proportions
     =========================================== */
  @media (min-width: 600px) {
    .quiz-container {
      padding: 2rem;
      padding-bottom: 4rem;
    }

    .quiz-prompt {
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }

    .quiz-content {
      max-width: 420px;
      gap: 2rem;
    }

    .letter-card {
      width: 160px;
      height: 160px;
      border-radius: 24px;
    }

    .letter {
      font-size: 6rem;
    }

    .answer-grid {
      gap: 1rem;
    }

    .pictograph-wrapper {
      max-width: 140px;
      max-height: 140px;
    }
  }

  /* ===========================================
     Desktop: Larger, more spacious
     =========================================== */
  @media (min-width: 900px) {
    .quiz-container {
      padding: 2.5rem;
      padding-bottom: 5rem;
    }

    .quiz-prompt {
      font-size: 1.25rem;
      margin-bottom: 2.5rem;
      color: rgba(255, 255, 255, 0.45);
    }

    .quiz-content {
      max-width: 480px;
      gap: 2.5rem;
    }

    .letter-card {
      width: 180px;
      height: 180px;
      box-shadow:
        0 12px 50px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(255, 255, 255, 0.06),
        0 0 120px -30px color-mix(in srgb, var(--theme-accent) 20%, transparent);
    }

    .letter {
      font-size: 7rem;
    }

    .answer-grid {
      gap: 1.25rem;
    }

    .pictograph-wrapper {
      max-width: 160px;
      max-height: 160px;
    }

    .feedback-banner {
      padding: 0.875rem 1.5rem;
    }

    .feedback-text {
      font-size: 1rem;
    }
  }

  /* ===========================================
     Large Desktop: Maximum refinement
     =========================================== */
  @media (min-width: 1200px) {
    .quiz-content {
      max-width: 520px;
    }

    .letter-card {
      width: 200px;
      height: 200px;
    }

    .letter {
      font-size: 8rem;
    }

    .pictograph-wrapper {
      max-width: 180px;
      max-height: 180px;
    }
  }

  /* ===========================================
     Reduced Motion
     =========================================== */
  @media (prefers-reduced-motion: reduce) {
    .letter-section,
    .answer-btn.correct,
    .answer-btn.incorrect,
    .feedback-banner,
    .result-icon {
      animation: none;
    }

    .answer-btn {
      transition:
        background 0.15s ease,
        border-color 0.15s ease;
    }
  }
</style>
