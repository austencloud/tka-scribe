<!--
MotionIdentificationQuiz - Quiz to identify motion types from animations
User must play animation first, then identify the motion type (1-6)
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import MotionVisualizer from "./MotionVisualizer.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type HandPosition = "N" | "E" | "S" | "W";
  type MotionType = "shift" | "dash" | "static";
  type MotionTypeNumber = 1 | 2 | 3 | 4 | 5 | 6;

  interface QuizQuestion {
    leftStart: HandPosition;
    leftEnd: HandPosition;
    rightStart: HandPosition;
    rightEnd: HandPosition;
    leftMotion: MotionType;
    rightMotion: MotionType;
    correctAnswer: MotionTypeNumber;
  }

  // Quiz questions covering all 6 motion types
  const QUESTIONS: QuizQuestion[] = [
    // Type 1: Dual-Shift
    {
      leftStart: "N",
      leftEnd: "E",
      rightStart: "S",
      rightEnd: "W",
      leftMotion: "shift",
      rightMotion: "shift",
      correctAnswer: 1,
    },
    {
      leftStart: "E",
      leftEnd: "S",
      rightStart: "W",
      rightEnd: "N",
      leftMotion: "shift",
      rightMotion: "shift",
      correctAnswer: 1,
    },
    // Type 2: Shift
    {
      leftStart: "N",
      leftEnd: "E",
      rightStart: "S",
      rightEnd: "S",
      leftMotion: "shift",
      rightMotion: "static",
      correctAnswer: 2,
    },
    {
      leftStart: "W",
      leftEnd: "W",
      rightStart: "E",
      rightEnd: "S",
      leftMotion: "static",
      rightMotion: "shift",
      correctAnswer: 2,
    },
    // Type 3: Cross-Shift
    {
      leftStart: "N",
      leftEnd: "E",
      rightStart: "S",
      rightEnd: "N",
      leftMotion: "shift",
      rightMotion: "dash",
      correctAnswer: 3,
    },
    {
      leftStart: "E",
      leftEnd: "W",
      rightStart: "S",
      rightEnd: "E",
      leftMotion: "dash",
      rightMotion: "shift",
      correctAnswer: 3,
    },
    // Type 4: Dash
    {
      leftStart: "N",
      leftEnd: "S",
      rightStart: "E",
      rightEnd: "E",
      leftMotion: "dash",
      rightMotion: "static",
      correctAnswer: 4,
    },
    {
      leftStart: "W",
      leftEnd: "W",
      rightStart: "S",
      rightEnd: "N",
      leftMotion: "static",
      rightMotion: "dash",
      correctAnswer: 4,
    },
    // Type 5: Dual-Dash
    {
      leftStart: "N",
      leftEnd: "S",
      rightStart: "S",
      rightEnd: "N",
      leftMotion: "dash",
      rightMotion: "dash",
      correctAnswer: 5,
    },
    {
      leftStart: "E",
      leftEnd: "W",
      rightStart: "W",
      rightEnd: "E",
      leftMotion: "dash",
      rightMotion: "dash",
      correctAnswer: 5,
    },
    // Type 6: Static
    {
      leftStart: "N",
      leftEnd: "N",
      rightStart: "S",
      rightEnd: "S",
      leftMotion: "static",
      rightMotion: "static",
      correctAnswer: 6,
    },
    {
      leftStart: "E",
      leftEnd: "E",
      rightStart: "W",
      rightEnd: "W",
      leftMotion: "static",
      rightMotion: "static",
      correctAnswer: 6,
    },
  ];

  // Shuffle questions
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  // Take 8 questions for the quiz
  const quizQuestions = $state(shuffle(QUESTIONS).slice(0, 8));

  let currentQuestionIndex = $state(0);
  let selectedAnswer = $state<MotionTypeNumber | null>(null);
  let showResult = $state(false);
  let correctCount = $state(0);
  let quizComplete = $state(false);

  const currentQuestion = $derived(quizQuestions[currentQuestionIndex]);

  // Motion type info for answer buttons
  const MOTION_TYPES: { num: MotionTypeNumber; name: string; color: string }[] =
    [
      { num: 1, name: "Dual-Shift", color: "#22D3EE" },
      { num: 2, name: "Shift", color: "#4ADE80" },
      { num: 3, name: "Cross-Shift", color: "#F472B6" },
      { num: 4, name: "Dash", color: "#FB923C" },
      { num: 5, name: "Dual-Dash", color: "#A78BFA" },
      { num: 6, name: "Static", color: "#94A3B8" },
    ];

  function selectAnswer(answer: MotionTypeNumber) {
    if (showResult || !currentQuestion) return;

    selectedAnswer = answer;
    showResult = true;

    if (answer === currentQuestion.correctAnswer) {
      correctCount++;
      hapticService?.trigger("success");
    } else {
      hapticService?.trigger("error");
    }
  }

  function nextQuestion() {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex++;
      selectedAnswer = null;
      showResult = false;
      hapticService?.trigger("selection");
    } else {
      quizComplete = true;
      hapticService?.trigger("success");
    }
  }

  function finishQuiz() {
    onComplete?.();
  }

  const score = $derived(
    Math.round((correctCount / quizQuestions.length) * 100)
  );
  const isPassing = $derived(score >= 70);
</script>

<div class="motion-quiz">
  {#if !quizComplete}
    <!-- Quiz in progress -->
    <div class="quiz-header">
      <span class="progress"
        >Question {currentQuestionIndex + 1} of {quizQuestions.length}</span
      >
      <span class="score"
        >Score: {correctCount}/{currentQuestionIndex +
          (showResult ? 1 : 0)}</span
      >
    </div>

    {#if currentQuestion}
      <div class="question-area">
        <p class="question-prompt">What type of motion is this?</p>

        <MotionVisualizer
          leftStart={currentQuestion.leftStart}
          leftEnd={currentQuestion.leftEnd}
          rightStart={currentQuestion.rightStart}
          rightEnd={currentQuestion.rightEnd}
          leftMotion={currentQuestion.leftMotion}
          rightMotion={currentQuestion.rightMotion}
          motionType={currentQuestion.correctAnswer}
          showLabels={true}
          showMotionType={false}
        />
      </div>

      <div class="answers-grid">
        {#each MOTION_TYPES as type}
          {@const isCorrect = type.num === currentQuestion.correctAnswer}
          {@const isSelected = type.num === selectedAnswer}
          <button
            class="answer-button"
            class:selected={isSelected}
            class:correct={showResult && isCorrect}
            class:incorrect={showResult && isSelected && !isCorrect}
            style="--type-color: {type.color}"
            onclick={() => selectAnswer(type.num)}
            disabled={showResult}
          >
            <span class="type-num">{type.num}</span>
            <span class="type-name">{type.name}</span>
            {#if showResult && isCorrect}
              <i class="fa-solid fa-check result-icon"></i>
            {:else if showResult && isSelected && !isCorrect}
              <i class="fa-solid fa-xmark result-icon"></i>
            {/if}
          </button>
        {/each}
      </div>

      {#if showResult}
        <div
          class="result-feedback"
          class:correct={selectedAnswer === currentQuestion.correctAnswer}
        >
          {#if selectedAnswer === currentQuestion.correctAnswer}
            <i class="fa-solid fa-check-circle"></i>
            <span>Correct! It's Type {currentQuestion.correctAnswer}.</span>
          {:else}
            <i class="fa-solid fa-times-circle"></i>
            <span
              >Not quite. The answer is Type {currentQuestion.correctAnswer}.</span
            >
          {/if}
        </div>

        <button class="next-button" onclick={nextQuestion}>
          {currentQuestionIndex < quizQuestions.length - 1
            ? "Next Question"
            : "See Results"}
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      {/if}
    {/if}
  {:else}
    <!-- Quiz complete -->
    <div class="results">
      <div class="results-icon" class:passing={isPassing}>
        {#if isPassing}
          <i class="fa-solid fa-trophy"></i>
        {:else}
          <i class="fa-solid fa-book-open"></i>
        {/if}
      </div>

      <h3 class="results-title">
        {#if isPassing}
          Excellent Work!
        {:else}
          Keep Practicing!
        {/if}
      </h3>

      <div class="score-display">
        <span class="score-value" class:passing={isPassing}>{score}%</span>
        <span class="score-label"
          >{correctCount} of {quizQuestions.length} correct</span
        >
      </div>

      <div class="type-review">
        <h4>Motion Types Review</h4>
        <div class="review-grid">
          {#each MOTION_TYPES as type}
            <div class="review-item" style="--type-color: {type.color}">
              <span class="review-num">{type.num}</span>
              <span class="review-name">{type.name}</span>
            </div>
          {/each}
        </div>
      </div>

      <button class="finish-button" onclick={finishQuiz}>
        {#if isPassing}
          <i class="fa-solid fa-check"></i>
          Complete Lesson
        {:else}
          <i class="fa-solid fa-arrow-left"></i>
          Review & Try Again
        {/if}
      </button>
    </div>
  {/if}
</div>

<style>
  .motion-quiz {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    width: 100%;
  }

  /* Quiz header */
  .quiz-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
  }

  .progress {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .score {
    font-size: 0.875rem;
    font-weight: 600;
    color: #22d3ee;
  }

  /* Question area */
  .question-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .question-prompt {
    font-size: 1.125rem;
    font-weight: 600;
    color: white;
    margin: 0;
  }

  /* Answers grid */
  .answers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.625rem;
  }

  .answer-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    background: rgba(255, 255, 255, 0.04);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .answer-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--type-color) 10%, transparent);
    border-color: color-mix(in srgb, var(--type-color) 40%, transparent);
    color: var(--type-color);
  }

  .answer-button:disabled {
    cursor: default;
  }

  .answer-button.selected {
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-color: var(--type-color);
    color: var(--type-color);
  }

  .answer-button.correct {
    background: rgba(74, 222, 128, 0.15);
    border-color: #4ade80;
    color: #4ade80;
  }

  .answer-button.incorrect {
    background: rgba(248, 113, 113, 0.15);
    border-color: #f87171;
    color: #f87171;
  }

  .type-num {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: currentColor;
    color: black;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 6px;
  }

  .answer-button.correct .type-num,
  .answer-button.incorrect .type-num {
    background: currentColor;
  }

  .type-name {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .result-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    font-size: 0.75rem;
  }

  /* Result feedback */
  .result-feedback {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 1rem 1.25rem;
    border-radius: 10px;
    font-weight: 600;
  }

  .result-feedback.correct {
    background: rgba(74, 222, 128, 0.15);
    border: 1px solid rgba(74, 222, 128, 0.3);
    color: #4ade80;
  }

  .result-feedback:not(.correct) {
    background: rgba(248, 113, 113, 0.15);
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: #f87171;
  }

  .result-feedback i {
    font-size: 1.25rem;
  }

  /* Next button */
  .next-button {
    align-self: center;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.25) 0%,
      rgba(6, 182, 212, 0.25) 100%
    );
    border: 1px solid rgba(34, 211, 238, 0.4);
    border-radius: 10px;
    color: #22d3ee;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .next-button:hover {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.35) 0%,
      rgba(6, 182, 212, 0.35) 100%
    );
    border-color: rgba(34, 211, 238, 0.6);
  }

  /* Results */
  .results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 1.5rem;
    text-align: center;
  }

  .results-icon {
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 2rem;
  }

  .results-icon.passing {
    background: rgba(74, 222, 128, 0.15);
    color: #4ade80;
  }

  .results-icon:not(.passing) {
    background: rgba(251, 146, 60, 0.15);
    color: #fb923c;
  }

  .results-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .score-display {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1;
  }

  .score-value.passing {
    color: #4ade80;
  }

  .score-value:not(.passing) {
    color: #fb923c;
  }

  .score-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Type review */
  .type-review {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .type-review h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 0.75rem 0;
  }

  .review-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }

  .review-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem;
    background: color-mix(in srgb, var(--type-color) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--type-color) 20%, transparent);
    border-radius: 6px;
  }

  .review-num {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--type-color);
    color: black;
    font-size: 0.6875rem;
    font-weight: 700;
    border-radius: 4px;
  }

  .review-name {
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--type-color);
  }

  /* Finish button */
  .finish-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(
      135deg,
      rgba(74, 222, 128, 0.3) 0%,
      rgba(34, 197, 94, 0.3) 100%
    );
    border: 2px solid rgba(74, 222, 128, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.0625rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .finish-button:hover {
    background: linear-gradient(
      135deg,
      rgba(74, 222, 128, 0.4) 0%,
      rgba(34, 197, 94, 0.4) 100%
    );
    border-color: rgba(74, 222, 128, 0.7);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .answers-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .review-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
