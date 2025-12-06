<!--
StaffIdentificationQuiz - Quiz to identify staff positions and rotation types
Tests understanding of:
- Alpha, Beta, Gamma positions with staffs
- Thumb orientations (in, out)
- Prospin vs Antispin rotations
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import StaffPositionVisualizer from "./StaffPositionVisualizer.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type HandPosition = "N" | "E" | "S" | "W";
  type ThumbOrientation = "in" | "out";
  type PositionType = "alpha" | "beta" | "gamma";
  type RotationType = "prospin" | "antispin";
  type AnswerState = "idle" | "correct" | "incorrect";

  type QuestionType = "position" | "thumb" | "rotation";

  interface Question {
    type: QuestionType;
    leftPos: HandPosition;
    rightPos: HandPosition;
    leftThumb: ThumbOrientation;
    rightThumb: ThumbOrientation;
    correctAnswer: string;
    options: string[];
    questionText: string;
    showRotationPath?: boolean;
    rotationType?: RotationType;
  }

  // Quiz state
  let currentQuestion = $state(0);
  let score = $state(0);
  let answerState = $state<AnswerState>("idle");
  let selectedAnswer = $state<string | null>(null);

  // Generate quiz questions
  const questions = $state<Question[]>(generateQuestions());

  function generateQuestions(): Question[] {
    const q: Question[] = [];

    // Position identification questions (4 questions)
    q.push({
      type: "position",
      leftPos: "N",
      rightPos: "S",
      leftThumb: "in",
      rightThumb: "in",
      correctAnswer: "alpha",
      options: ["alpha", "beta", "gamma"],
      questionText: "What position type is shown?",
    });

    q.push({
      type: "position",
      leftPos: "E",
      rightPos: "E",
      leftThumb: "in",
      rightThumb: "in",
      correctAnswer: "beta",
      options: ["alpha", "beta", "gamma"],
      questionText: "What position type is shown?",
    });

    q.push({
      type: "position",
      leftPos: "N",
      rightPos: "E",
      leftThumb: "in",
      rightThumb: "in",
      correctAnswer: "gamma",
      options: ["alpha", "beta", "gamma"],
      questionText: "What position type is shown?",
    });

    q.push({
      type: "position",
      leftPos: "W",
      rightPos: "S",
      leftThumb: "out",
      rightThumb: "out",
      correctAnswer: "gamma",
      options: ["alpha", "beta", "gamma"],
      questionText: "What position type is shown?",
    });

    // Thumb orientation questions (2 questions)
    q.push({
      type: "thumb",
      leftPos: "N",
      rightPos: "S",
      leftThumb: "in",
      rightThumb: "in",
      correctAnswer: "Both thumbs in",
      options: ["Both thumbs in", "Both thumbs out", "Left in, Right out"],
      questionText: "What is the thumb orientation?",
    });

    q.push({
      type: "thumb",
      leftPos: "E",
      rightPos: "W",
      leftThumb: "out",
      rightThumb: "in",
      correctAnswer: "Left out, Right in",
      options: ["Both thumbs in", "Left out, Right in", "Both thumbs out"],
      questionText: "What is the thumb orientation?",
    });

    // Rotation type questions (4 questions)
    q.push({
      type: "rotation",
      leftPos: "N",
      rightPos: "S",
      leftThumb: "in",
      rightThumb: "in",
      correctAnswer: "prospin",
      options: ["prospin", "antispin"],
      questionText:
        "If the thumbs STAY IN during motion, what rotation type is this?",
      showRotationPath: true,
      rotationType: "prospin",
    });

    q.push({
      type: "rotation",
      leftPos: "E",
      rightPos: "W",
      leftThumb: "out",
      rightThumb: "out",
      correctAnswer: "antispin",
      options: ["prospin", "antispin"],
      questionText:
        "If thumbs started IN and now are OUT, what rotation occurred?",
      showRotationPath: true,
      rotationType: "antispin",
    });

    q.push({
      type: "rotation",
      leftPos: "N",
      rightPos: "E",
      leftThumb: "in",
      rightThumb: "in",
      correctAnswer: "prospin",
      options: ["prospin", "antispin"],
      questionText: "Thumb orientation unchanged = which rotation?",
      showRotationPath: true,
      rotationType: "prospin",
    });

    q.push({
      type: "rotation",
      leftPos: "S",
      rightPos: "W",
      leftThumb: "out",
      rightThumb: "out",
      correctAnswer: "antispin",
      options: ["prospin", "antispin"],
      questionText: "Thumb swapped from IN to OUT = which rotation?",
      showRotationPath: true,
      rotationType: "antispin",
    });

    // Shuffle questions
    return q.sort(() => Math.random() - 0.5);
  }

  function getCurrentQuestion(): Question {
    return questions[currentQuestion]!;
  }

  function handleAnswer(answer: string) {
    if (answerState !== "idle") return;

    selectedAnswer = answer;
    const question = getCurrentQuestion();

    if (answer === question.correctAnswer) {
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
        answerState = "idle";
        currentQuestion++;
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
    if (percent === 100) return "Perfect! You're a Staff Master!";
    if (percent >= 80) return "Excellent! Great understanding!";
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

  // Answer button info by type
  const answerInfo: Record<string, { icon: string; color: string }> = {
    alpha: { icon: "fa-arrows-left-right", color: "#FF6B6B" },
    beta: { icon: "fa-circle-dot", color: "#4ECDC4" },
    gamma: { icon: "fa-rotate-right", color: "#FFE66D" },
    prospin: { icon: "fa-sync-alt", color: "#22D3EE" },
    antispin: { icon: "fa-retweet", color: "#F97316" },
    "Both thumbs in": { icon: "fa-compress-alt", color: "#3B82F6" },
    "Both thumbs out": { icon: "fa-expand-alt", color: "#A855F7" },
    "Left in, Right out": { icon: "fa-arrows-alt-h", color: "#10B981" },
    "Left out, Right in": { icon: "fa-arrows-alt-h", color: "#EC4899" },
  };

  function getAnswerInfo(answer: string) {
    return answerInfo[answer] || { icon: "fa-question", color: "#888" };
  }
</script>

<div class="staff-quiz">
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
      <div
        class="question-type-badge"
        class:position={question.type === "position"}
        class:thumb={question.type === "thumb"}
        class:rotation={question.type === "rotation"}
      >
        {#if question.type === "position"}
          <i class="fa-solid fa-crosshairs"></i>
          <span>Position</span>
        {:else if question.type === "thumb"}
          <i class="fa-solid fa-hand-point-up"></i>
          <span>Thumb</span>
        {:else}
          <i class="fa-solid fa-sync-alt"></i>
          <span>Rotation</span>
        {/if}
      </div>

      <h3 class="quiz-title">{question.questionText}</h3>

      <!-- Position visualizer -->
      <div class="visualizer-container">
        <StaffPositionVisualizer
          leftPosition={question.leftPos}
          rightPosition={question.rightPos}
          leftThumbOrientation={question.leftThumb}
          rightThumbOrientation={question.rightThumb}
          showLabels={true}
          showRotationPath={question.showRotationPath || false}
          rotationType={question.rotationType || "none"}
          highlightType={answerState !== "idle" && question.type === "position"
            ? (question.correctAnswer as PositionType)
            : null}
        />
      </div>

      <!-- Answer buttons -->
      <div class="answer-buttons" class:two-col={question.options.length === 2}>
        {#each question.options as option}
          {@const info = getAnswerInfo(option)}
          {@const isSelected = selectedAnswer === option}
          {@const isCorrectAnswer = question.correctAnswer === option}
          {@const showCorrect = answerState === "correct" && isSelected}
          {@const showIncorrect = answerState === "incorrect" && isSelected}
          {@const revealCorrect =
            answerState === "incorrect" && isCorrectAnswer}

          <button
            class="answer-btn"
            class:selected={isSelected}
            class:correct={showCorrect || revealCorrect}
            class:incorrect={showIncorrect}
            style="--type-color: {info.color}"
            onclick={() => handleAnswer(option)}
            disabled={answerState !== "idle"}
          >
            <i class="fa-solid {info.icon}"></i>
            <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
            {#if answerState !== "idle" && isSelected}
              <span class="result-icon"
                >{answerState === "correct" ? "✓" : "✗"}</span
              >
            {:else if revealCorrect}
              <span class="result-icon correct">✓</span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Feedback -->
      {#if answerState !== "idle"}
        {@const correctInfo = getAnswerInfo(question.correctAnswer)}
        <div
          class="feedback"
          class:correct={answerState === "correct"}
          class:incorrect={answerState === "incorrect"}
        >
          {#if answerState === "correct"}
            <span
              >Correct! That's <strong style="color: {correctInfo.color}"
                >{question.correctAnswer}</strong
              >.</span
            >
          {:else}
            <span
              >Not quite! The answer is <strong
                style="color: {correctInfo.color}"
                >{question.correctAnswer}</strong
              >.</span
            >
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

      <div class="score-breakdown">
        <h4>Topics Covered</h4>
        <div class="topic-badges">
          <span class="topic-badge position">
            <i class="fa-solid fa-crosshairs"></i>
            Positions
          </span>
          <span class="topic-badge thumb">
            <i class="fa-solid fa-hand-point-up"></i>
            Thumbs
          </span>
          <span class="topic-badge rotation">
            <i class="fa-solid fa-sync-alt"></i>
            Rotations
          </span>
        </div>
      </div>

      <div class="complete-actions">
        <button class="action-btn secondary" onclick={restartQuiz}>
          <i class="fa-solid fa-rotate"></i>
          Try Again
        </button>
        <button class="action-btn primary" onclick={() => onComplete?.()}>
          <i class="fa-solid fa-check"></i>
          Finish
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .staff-quiz {
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
    background: linear-gradient(90deg, #22d3ee, #06b6d4);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  /* Question type badge */
  .question-type-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.375rem 0.875rem;
    border-radius: 16px;
    font-size: 0.8125rem;
    font-weight: 600;
  }

  .question-type-badge.position {
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
  }

  .question-type-badge.thumb {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .question-type-badge.rotation {
    background: rgba(34, 211, 238, 0.15);
    color: #22d3ee;
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
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .quiz-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
    line-height: 1.4;
  }

  .visualizer-container {
    width: 100%;
    max-width: 320px;
  }

  /* Answer buttons */
  .answer-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    width: 100%;
    max-width: 500px;
  }

  .answer-buttons.two-col {
    grid-template-columns: repeat(2, 1fr);
    max-width: 352px;
  }

  .answer-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.75rem;
    min-height: 80px;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: white;
    font-size: 0.875rem;
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

  .answer-btn span {
    text-align: center;
    line-height: 1.2;
  }

  .answer-btn.correct {
    background: color-mix(in srgb, var(--type-color) 20%, transparent);
    border-color: var(--type-color);
    animation: correctPulse 0.5s ease;
  }

  @keyframes correctPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.03);
    }
    100% {
      transform: scale(1);
    }
  }

  .answer-btn.incorrect {
    background: rgba(255, 74, 74, 0.2);
    border-color: rgba(255, 74, 74, 0.6);
    animation: shake 0.4s ease;
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }

  .result-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    color: #ff4a4a;
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
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .feedback.correct {
    background: rgba(34, 211, 238, 0.15);
    border: 1px solid rgba(34, 211, 238, 0.3);
    color: #22d3ee;
  }

  .feedback.incorrect {
    background: rgba(255, 158, 74, 0.15);
    border: 1px solid rgba(255, 158, 74, 0.3);
    color: #ff9e4a;
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
    color: #22d3ee;
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
    margin: 0 0 1rem;
    text-align: center;
  }

  /* Score breakdown */
  .score-breakdown {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    margin-bottom: 1rem;
    width: 100%;
    max-width: 352px;
  }

  .score-breakdown h4 {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 0.75rem;
    text-align: center;
  }

  .topic-badges {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .topic-badge {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .topic-badge.position {
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
  }

  .topic-badge.thumb {
    background: rgba(59, 130, 246, 0.15);
    color: #3b82f6;
  }

  .topic-badge.rotation {
    background: rgba(34, 211, 238, 0.15);
    color: #22d3ee;
  }

  .complete-actions {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 352px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    min-height: 52px;
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
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.3),
      rgba(6, 182, 212, 0.3)
    );
    border: 1px solid rgba(34, 211, 238, 0.4);
    color: white;
  }

  .action-btn.primary:hover {
    background: linear-gradient(
      135deg,
      rgba(34, 211, 238, 0.4),
      rgba(6, 182, 212, 0.4)
    );
    border-color: rgba(34, 211, 238, 0.6);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 500px) {
    .staff-quiz {
      padding: 1rem;
    }

    .quiz-title {
      font-size: 1.125rem;
    }

    .answer-buttons {
      grid-template-columns: 1fr;
    }

    .answer-buttons.two-col {
      grid-template-columns: 1fr;
    }

    .answer-btn {
      flex-direction: row;
      justify-content: center;
      gap: 0.75rem;
      min-height: 56px;
      padding: 0.875rem 1rem;
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
