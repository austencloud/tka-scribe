<!--
VTGQuiz - Quiz to identify VTG modes from animations
User watches animation and identifies which VTG mode is being shown
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$lib/shared/inversify";
import { TYPES } from "$lib/shared/inversify/types";
  import VTGVisualizer from "./VTGVisualizer.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type VTGMode = "SS" | "TS" | "SO" | "TO" | "QS" | "QO";

  const VTG_MODES: { mode: VTGMode; name: string; color: string }[] = [
    { mode: "SS", name: "Split-Same", color: "#22D3EE" },
    { mode: "TS", name: "Together-Same", color: "#4ADE80" },
    { mode: "SO", name: "Same-Opposite", color: "#F472B6" },
    { mode: "TO", name: "Together-Opposite", color: "#FB923C" },
    { mode: "QS", name: "Quarter-Same", color: "#A78BFA" },
    { mode: "QO", name: "Quarter-Opposite", color: "#F59E0B" },
  ];

  // Quiz questions - each VTG mode appears twice
  const QUESTIONS: VTGMode[] = [
    "SS", "TS", "SO", "TO", "QS", "QO",
    "SS", "TS", "SO", "TO", "QS", "QO",
  ];

  // Shuffle the questions
  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j]!, arr[i]!];
    }
    return arr;
  }

  // Take 8 questions for quiz
  const quizQuestions = $state(shuffle(QUESTIONS).slice(0, 8));

  let currentQuestionIndex = $state(0);
  let selectedAnswer = $state<VTGMode | null>(null);
  let showResult = $state(false);
  let correctCount = $state(0);
  let quizComplete = $state(false);

  const currentQuestion = $derived(quizQuestions[currentQuestionIndex]);

  function selectAnswer(answer: VTGMode) {
    if (showResult || !currentQuestion) return;

    selectedAnswer = answer;
    showResult = true;

    if (answer === currentQuestion) {
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

  const score = $derived(Math.round((correctCount / quizQuestions.length) * 100));
  const isPassing = $derived(score >= 70);

  function getModeInfo(m: VTGMode) {
    return VTG_MODES.find(v => v.mode === m)!;
  }
</script>

<div class="vtg-quiz">
  {#if !quizComplete}
    <!-- Quiz in progress -->
    <div class="quiz-header">
      <span class="progress">Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
      <span class="score">Score: {correctCount}/{currentQuestionIndex + (showResult ? 1 : 0)}</span>
    </div>

    {#if currentQuestion}
      <div class="question-area">
        <p class="question-prompt">What VTG mode is this?</p>

        <VTGVisualizer mode={currentQuestion} showLabels={true} autoPlay={false} />
      </div>

      <div class="answers-grid">
        {#each VTG_MODES as vtgMode}
          {@const isCorrect = vtgMode.mode === currentQuestion}
          {@const isSelected = vtgMode.mode === selectedAnswer}
          <button
            class="answer-button"
            class:selected={isSelected}
            class:correct={showResult && isCorrect}
            class:incorrect={showResult && isSelected && !isCorrect}
            style="--type-color: {vtgMode.color}"
            onclick={() => selectAnswer(vtgMode.mode)}
            disabled={showResult}
          >
            <span class="mode-code">{vtgMode.mode}</span>
            <span class="mode-name">{vtgMode.name}</span>
            {#if showResult && isCorrect}
              <i class="fa-solid fa-check result-icon"></i>
            {:else if showResult && isSelected && !isCorrect}
              <i class="fa-solid fa-xmark result-icon"></i>
            {/if}
          </button>
        {/each}
      </div>

      {#if showResult}
        <div class="result-feedback" class:correct={selectedAnswer === currentQuestion}>
          {#if selectedAnswer === currentQuestion}
            <i class="fa-solid fa-check-circle"></i>
            <span>Correct! It's {currentQuestion}.</span>
          {:else}
            <i class="fa-solid fa-times-circle"></i>
            <span>Not quite. The answer is {currentQuestion}.</span>
          {/if}
        </div>

        <button class="next-button" onclick={nextQuestion}>
          {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "See Results"}
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
        <span class="score-label">{correctCount} of {quizQuestions.length} correct</span>
      </div>

      <div class="mode-review">
        <h4>VTG Modes Review</h4>
        <div class="review-grid">
          {#each VTG_MODES as vtgMode}
            <div class="review-item" style="--type-color: {vtgMode.color}">
              <span class="review-code">{vtgMode.mode}</span>
              <span class="review-name">{vtgMode.name}</span>
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
  .vtg-quiz {
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
    color: #22D3EE;
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
    border-color: #4ADE80;
    color: #4ADE80;
  }

  .answer-button.incorrect {
    background: rgba(248, 113, 113, 0.15);
    border-color: #F87171;
    color: #F87171;
  }

  .mode-code {
    font-family: monospace;
    font-size: 0.875rem;
    font-weight: 800;
  }

  .mode-name {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    opacity: 0.8;
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
    color: #4ADE80;
  }

  .result-feedback:not(.correct) {
    background: rgba(248, 113, 113, 0.15);
    border: 1px solid rgba(248, 113, 113, 0.3);
    color: #F87171;
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
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%);
    border: 1px solid rgba(34, 211, 238, 0.4);
    border-radius: 10px;
    color: #22D3EE;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .next-button:hover {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.35) 0%, rgba(6, 182, 212, 0.35) 100%);
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
    color: #4ADE80;
  }

  .results-icon:not(.passing) {
    background: rgba(251, 146, 60, 0.15);
    color: #FB923C;
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
    color: #4ADE80;
  }

  .score-value:not(.passing) {
    color: #FB923C;
  }

  .score-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Mode review */
  .mode-review {
    width: 100%;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .mode-review h4 {
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

  .review-code {
    font-family: monospace;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--type-color);
  }

  .review-name {
    font-size: 0.5625rem;
    font-weight: 600;
    color: var(--type-color);
    opacity: 0.8;
  }

  /* Finish button */
  .finish-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 2.5rem;
    background: linear-gradient(135deg, rgba(74, 222, 128, 0.3) 0%, rgba(34, 197, 94, 0.3) 100%);
    border: 2px solid rgba(74, 222, 128, 0.5);
    border-radius: 12px;
    color: white;
    font-size: 1.0625rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .finish-button:hover {
    background: linear-gradient(135deg, rgba(74, 222, 128, 0.4) 0%, rgba(34, 197, 94, 0.4) 100%);
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
