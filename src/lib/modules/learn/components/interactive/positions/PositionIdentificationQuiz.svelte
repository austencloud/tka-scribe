<!--
PositionIdentificationQuiz - Quiz to identify Alpha, Beta, and Gamma positions
Shows hand positions on grid, user identifies the type
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$lib/shared/inversify";
import { TYPES } from "$lib/shared/inversify/types";
  import PositionVisualizer from "./PositionVisualizer.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type PositionType = "alpha" | "beta" | "gamma";
  type AnswerState = "idle" | "correct" | "incorrect";
  type HandPosition = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

  // Quiz state
  let currentQuestion = $state(0);
  let score = $state(0);
  let answerState = $state<AnswerState>("idle");
  let selectedAnswer = $state<PositionType | null>(null);

  // Generate quiz questions
  const questions = $state(generateQuestions());

  function generateQuestions() {
    const alphaPositions: { left: HandPosition; right: HandPosition }[] = [
      { left: "N", right: "S" },
      { left: "E", right: "W" },
      { left: "NE", right: "SW" },
      { left: "NW", right: "SE" },
    ];

    const betaPositions: { left: HandPosition; right: HandPosition }[] = [
      { left: "N", right: "N" },
      { left: "E", right: "E" },
      { left: "S", right: "S" },
      { left: "NW", right: "NW" },
    ];

    const gammaPositions: { left: HandPosition; right: HandPosition }[] = [
      { left: "N", right: "E" },
      { left: "N", right: "W" },
      { left: "S", right: "E" },
      { left: "S", right: "W" },
      { left: "NE", right: "SE" },
      { left: "NE", right: "NW" },
    ];

    // Create a mix of questions
    const q: { left: HandPosition; right: HandPosition; type: PositionType }[] = [];

    // Add 3 of each type
    for (let i = 0; i < 3; i++) {
      const alphaIdx = Math.floor(Math.random() * alphaPositions.length);
      q.push({ ...alphaPositions[alphaIdx]!, type: "alpha" });

      const betaIdx = Math.floor(Math.random() * betaPositions.length);
      q.push({ ...betaPositions[betaIdx]!, type: "beta" });

      const gammaIdx = Math.floor(Math.random() * gammaPositions.length);
      q.push({ ...gammaPositions[gammaIdx]!, type: "gamma" });
    }

    // Shuffle
    return q.sort(() => Math.random() - 0.5);
  }

  function getCurrentQuestion() {
    return questions[currentQuestion]!;
  }

  function handleAnswer(answer: PositionType) {
    if (answerState !== "idle") return;

    selectedAnswer = answer;
    const question = getCurrentQuestion();
    if (!question) return;

    if (answer === question.type) {
      answerState = "correct";
      score++;
      hapticService?.trigger("success");
    } else {
      answerState = "incorrect";
      hapticService?.trigger("error");
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        answerState = "idle";
        selectedAnswer = null;
      } else {
        // Quiz complete - handled by completion state
        answerState = "idle";
        currentQuestion++; // Increment to show complete state
      }
    }, 1500);
  }

  function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    answerState = "idle";
    selectedAnswer = null;
    questions.length = 0;
    questions.push(...generateQuestions());
  }

  function getProgressPercent() {
    return (currentQuestion / questions.length) * 100;
  }

  function getScoreMessage() {
    const percent = (score / questions.length) * 100;
    if (percent === 100) return "Perfect! You're a Position Master!";
    if (percent >= 80) return "Excellent! You know your positions!";
    if (percent >= 60) return "Good job! Keep practicing!";
    return "Keep learning! Review the lesson and try again.";
  }

  function getScoreEmoji() {
    const percent = (score / questions.length) * 100;
    if (percent === 100) return "🏆";
    if (percent >= 80) return "🌟";
    if (percent >= 60) return "👍";
    return "📚";
  }

  const isComplete = $derived(currentQuestion >= questions.length);

  // Position type info
  const positionInfo: Record<PositionType, { icon: string; label: string; color: string }> = {
    alpha: { icon: "fa-arrows-left-right", label: "Alpha", color: "#FF6B6B" },
    beta: { icon: "fa-circle-dot", label: "Beta", color: "#4ECDC4" },
    gamma: { icon: "fa-rotate-right", label: "Gamma", color: "#FFE66D" },
  };
</script>

<div class="position-quiz">
  <!-- Progress bar -->
  <div class="quiz-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {getProgressPercent()}%"></div>
    </div>
    <div class="progress-text">
      {#if !isComplete}
        Question {currentQuestion + 1} of {questions.length}
      {:else}
        Complete!
      {/if}
    </div>
  </div>

  {#if !isComplete}
    {@const question = getCurrentQuestion()}
    <div class="quiz-section">
      <h3 class="quiz-title">What position is this?</h3>
      <p class="quiz-subtitle">Identify: Alpha, Beta, or Gamma</p>

      <!-- Position visualizer -->
      <div class="visualizer-container">
        <PositionVisualizer
          leftHand={question.left}
          rightHand={question.right}
          showLabels={true}
          highlightType={answerState !== "idle" ? question.type : null}
        />
      </div>

      <!-- Answer buttons -->
      <div class="answer-buttons">
        {#each (["alpha", "beta", "gamma"] as PositionType[]) as type}
          {@const info = positionInfo[type]}
          {@const isSelected = selectedAnswer === type}
          {@const isCorrectAnswer = question.type === type}
          {@const showCorrect = answerState === "correct" && isSelected}
          {@const showIncorrect = answerState === "incorrect" && isSelected}
          {@const revealCorrect = answerState === "incorrect" && isCorrectAnswer}

          <button
            class="answer-btn"
            class:selected={isSelected}
            class:correct={showCorrect || revealCorrect}
            class:incorrect={showIncorrect}
            style="--type-color: {info.color}"
            onclick={() => handleAnswer(type)}
            disabled={answerState !== "idle"}
          >
            <i class="fa-solid {info.icon}"></i>
            <span>{info.label}</span>
            {#if answerState !== "idle" && isSelected}
              <span class="result-icon">{answerState === "correct" ? "✓" : "✗"}</span>
            {:else if revealCorrect}
              <span class="result-icon correct">✓</span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Feedback -->
      {#if answerState !== "idle"}
        {@const correctInfo = positionInfo[question.type]}
        <div class="feedback" class:correct={answerState === "correct"} class:incorrect={answerState === "incorrect"}>
          {#if answerState === "correct"}
            <span>Correct! That's <strong style="color: {correctInfo.color}">{correctInfo.label}</strong> position.</span>
          {:else}
            <span>Not quite! That was <strong style="color: {correctInfo.color}">{correctInfo.label}</strong> position.</span>
          {/if}
        </div>
      {/if}
    </div>

  {:else}
    <!-- Complete state -->
    <div class="quiz-section complete">
      <div class="complete-icon">{getScoreEmoji()}</div>
      <h3 class="complete-title">Quiz Complete!</h3>
      <div class="score-display">
        <span class="score-value">{score}</span>
        <span class="score-separator">/</span>
        <span class="score-total">{questions.length}</span>
      </div>
      <p class="score-message">{getScoreMessage()}</p>

      <div class="complete-actions">
        <button class="action-btn secondary" onclick={restartQuiz}>
          <i class="fa-solid fa-rotate"></i>
          Try Again
        </button>
        <button class="action-btn primary" onclick={() => onComplete?.()}>
          <i class="fa-solid fa-arrow-right"></i>
          Continue
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .position-quiz {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
  }

  /* Progress bar */
  .quiz-progress {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #22D3EE, #06B6D4);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  /* Quiz section */
  .quiz-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .quiz-title {
    font-size: 1.375rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
  }

  .quiz-subtitle {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    text-align: center;
  }

  .visualizer-container {
    width: 100%;
    max-width: 320px;
  }

  /* Answer buttons */
  .answer-buttons {
    display: flex;
    gap: 0.75rem;
    width: 100%;
    max-width: 450px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .answer-btn {
    flex: 1;
    min-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    min-height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .answer-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--type-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--type-color) 50%, transparent);
    transform: translateY(-2px);
  }

  .answer-btn:disabled {
    cursor: default;
  }

  .answer-btn i {
    font-size: 1.25rem;
    color: var(--type-color);
  }

  .answer-btn.correct {
    background: color-mix(in srgb, var(--type-color) 20%, transparent);
    border-color: var(--type-color);
    animation: correctPulse 0.5s ease;
  }

  @keyframes correctPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.03); }
    100% { transform: scale(1); }
  }

  .answer-btn.incorrect {
    background: rgba(255, 74, 74, 0.2);
    border-color: rgba(255, 74, 74, 0.6);
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }

  .result-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #FF4A4A;
  }

  .result-icon.correct,
  .answer-btn.correct .result-icon {
    color: var(--type-color);
  }

  /* Feedback */
  .feedback {
    padding: 0.875rem 1.25rem;
    border-radius: 10px;
    font-size: 0.9375rem;
    text-align: center;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .feedback.correct {
    background: rgba(34, 211, 238, 0.15);
    border: 1px solid rgba(34, 211, 238, 0.3);
    color: #22D3EE;
  }

  .feedback.incorrect {
    background: rgba(255, 158, 74, 0.15);
    border: 1px solid rgba(255, 158, 74, 0.3);
    color: #FF9E4A;
  }

  /* Complete section */
  .complete {
    padding: 2rem 1rem;
  }

  .complete-icon {
    font-size: 4rem;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .complete-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .score-display {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    margin: 1rem 0;
  }

  .score-value {
    font-size: 3rem;
    font-weight: 800;
    color: #22D3EE;
  }

  .score-separator {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .score-total {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .score-message {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 1.5rem;
    text-align: center;
  }

  .complete-actions {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 350px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    min-height: 48px;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn.secondary {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
  }

  .action-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .action-btn.primary {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(6, 182, 212, 0.3));
    border: 1px solid rgba(34, 211, 238, 0.4);
    color: white;
  }

  .action-btn.primary:hover {
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.4), rgba(6, 182, 212, 0.4));
    border-color: rgba(34, 211, 238, 0.6);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 500px) {
    .position-quiz {
      padding: 1rem;
    }

    .quiz-title {
      font-size: 1.25rem;
    }

    .answer-buttons {
      flex-direction: column;
    }

    .answer-btn {
      min-width: auto;
      flex-direction: row;
      justify-content: center;
      gap: 0.75rem;
      min-height: 56px;
    }

    .complete-actions {
      flex-direction: column;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quiz-section,
    .answer-btn,
    .feedback,
    .progress-fill {
      animation: none;
      transition: none;
    }
  }
</style>
