<!--
GridIdentificationQuiz - Comprehensive quiz for Grid concept
Two quiz phases:
1. Mode Identification: Diamond vs Box (5 questions)
2. Point Identification: Click the correct point for a given direction (8 questions)
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import LessonGridDisplay from "./LessonGridDisplay.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type QuizPhase = "mode" | "point" | "complete";
  type AnswerState = "idle" | "correct" | "incorrect";

  // Quiz state
  let phase = $state<QuizPhase>("mode");
  let currentQuestion = $state(0);
  let score = $state(0);
  let answerState = $state<AnswerState>("idle");
  let selectedAnswer = $state<string | null>(null);

  // Mode quiz questions (randomized diamond/box positions)
  const modeQuestions = $state(generateModeQuestions());

  // Point quiz questions
  const pointQuestions = $state(generatePointQuestions());

  // Grid point definitions
  const DIAMOND_POINTS = {
    N: { x: 50, y: 15 },
    E: { x: 85, y: 50 },
    S: { x: 50, y: 85 },
    W: { x: 15, y: 50 },
    center: { x: 50, y: 50 },
  };

  const BOX_POINTS = {
    NE: { x: 75, y: 25 },
    SE: { x: 75, y: 75 },
    SW: { x: 25, y: 75 },
    NW: { x: 25, y: 25 },
    center: { x: 50, y: 50 },
  };

  const ALL_POINTS = {
    N: { x: 50, y: 15, mode: "diamond" },
    NE: { x: 75, y: 25, mode: "box" },
    E: { x: 85, y: 50, mode: "diamond" },
    SE: { x: 75, y: 75, mode: "box" },
    S: { x: 50, y: 85, mode: "diamond" },
    SW: { x: 25, y: 75, mode: "box" },
    W: { x: 15, y: 50, mode: "diamond" },
    NW: { x: 25, y: 25, mode: "box" },
    center: { x: 50, y: 50, mode: "both" },
  };

  function generateModeQuestions() {
    const questions = [];
    for (let i = 0; i < 5; i++) {
      questions.push({
        correctAnswer: Math.random() > 0.5 ? "diamond" : "box",
        id: i,
      });
    }
    return questions;
  }

  function generatePointQuestions() {
    // All 8 directions + center
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    // Shuffle and take 8
    const shuffled = directions.sort(() => Math.random() - 0.5);
    return shuffled.map((dir, i) => ({
      direction: dir,
      id: i,
    }));
  }

  function getCurrentModeQuestion() {
    return modeQuestions[currentQuestion]!;
  }

  function getCurrentPointQuestion() {
    return pointQuestions[currentQuestion]!;
  }

  function handleModeAnswer(answer: "diamond" | "box") {
    if (answerState !== "idle") return;

    selectedAnswer = answer;
    const question = getCurrentModeQuestion();
    if (!question) return;

    if (answer === question.correctAnswer) {
      answerState = "correct";
      score++;
      hapticService?.trigger("success");
    } else {
      answerState = "incorrect";
      hapticService?.trigger("error");
    }

    // Auto-advance quickly - no delay needed for rapid quizzing
    setTimeout(() => {
      if (currentQuestion < modeQuestions.length - 1) {
        currentQuestion++;
        answerState = "idle";
        selectedAnswer = null;
      } else {
        // Move to point identification phase
        phase = "point";
        currentQuestion = 0;
        answerState = "idle";
        selectedAnswer = null;
      }
    }, 300);
  }

  function handlePointClick(direction: string) {
    if (answerState !== "idle") return;

    selectedAnswer = direction;
    const question = getCurrentPointQuestion();
    if (!question) return;

    if (direction === question.direction) {
      answerState = "correct";
      score++;
      hapticService?.trigger("success");
    } else {
      answerState = "incorrect";
      hapticService?.trigger("error");
    }

    // Auto-advance quickly - no delay needed for rapid quizzing
    setTimeout(() => {
      if (currentQuestion < pointQuestions.length - 1) {
        currentQuestion++;
        answerState = "idle";
        selectedAnswer = null;
      } else {
        phase = "complete";
      }
    }, 300);
  }

  function getProgressPercent() {
    const totalQuestions = modeQuestions.length + pointQuestions.length;
    const answered = phase === "mode"
      ? currentQuestion
      : modeQuestions.length + currentQuestion;
    return (answered / totalQuestions) * 100;
  }

  function getTotalQuestions() {
    return modeQuestions.length + pointQuestions.length;
  }

  function restartQuiz() {
    phase = "mode";
    currentQuestion = 0;
    score = 0;
    answerState = "idle";
    selectedAnswer = null;
    // Regenerate questions
    modeQuestions.length = 0;
    modeQuestions.push(...generateModeQuestions());
    pointQuestions.length = 0;
    pointQuestions.push(...generatePointQuestions());
  }

  function getScoreMessage() {
    const percent = (score / getTotalQuestions()) * 100;
    if (percent === 100) return "Perfect! You're a Grid Master!";
    if (percent >= 80) return "Excellent! You've got the grid down!";
    if (percent >= 60) return "Good job! Keep practicing!";
    return "Keep learning! Review the lesson and try again.";
  }

  function getScoreEmoji() {
    const percent = (score / getTotalQuestions()) * 100;
    if (percent === 100) return "🏆";
    if (percent >= 80) return "🌟";
    if (percent >= 60) return "👍";
    return "📚";
  }
</script>

<div class="grid-quiz">
  <!-- Progress bar -->
  <div class="quiz-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {getProgressPercent()}%"></div>
    </div>
    <div class="progress-text">
      {#if phase === "mode"}
        Mode Quiz: {currentQuestion + 1}/{modeQuestions.length}
      {:else if phase === "point"}
        Point Quiz: {currentQuestion + 1}/{pointQuestions.length}
      {:else}
        Complete!
      {/if}
    </div>
  </div>

  {#if phase === "mode"}
    <!-- Mode Identification Phase -->
    {@const question = getCurrentModeQuestion()}
    <div class="quiz-section mode-quiz">
      <h3 class="quiz-title">Which grid is this?</h3>
      <p class="quiz-subtitle">Identify if this is a Diamond or Box grid</p>

      <!-- Display grid -->
      <div class="grid-display">
        <LessonGridDisplay
          type={question.correctAnswer as "diamond" | "box"}
          size="medium"
        />
      </div>

      <!-- Answer buttons -->
      <div class="answer-buttons">
        <button
          class="answer-btn"
          class:selected={selectedAnswer === "diamond"}
          class:correct={answerState === "correct" && selectedAnswer === "diamond"}
          class:incorrect={answerState === "incorrect" && selectedAnswer === "diamond"}
          class:reveal-correct={answerState === "incorrect" && question.correctAnswer === "diamond"}
          onclick={() => handleModeAnswer("diamond")}
          disabled={answerState !== "idle"}
        >
          <i class="fa-solid fa-diamond"></i>
          <span>Diamond</span>
          {#if answerState !== "idle" && selectedAnswer === "diamond"}
            <span class="result-icon">{answerState === "correct" ? "✓" : "✗"}</span>
          {/if}
        </button>

        <button
          class="answer-btn"
          class:selected={selectedAnswer === "box"}
          class:correct={answerState === "correct" && selectedAnswer === "box"}
          class:incorrect={answerState === "incorrect" && selectedAnswer === "box"}
          class:reveal-correct={answerState === "incorrect" && question.correctAnswer === "box"}
          onclick={() => handleModeAnswer("box")}
          disabled={answerState !== "idle"}
        >
          <i class="fa-solid fa-square"></i>
          <span>Box</span>
          {#if answerState !== "idle" && selectedAnswer === "box"}
            <span class="result-icon">{answerState === "correct" ? "✓" : "✗"}</span>
          {/if}
        </button>
      </div>

      <!-- Feedback -->
      {#if answerState !== "idle"}
        <div class="feedback" class:correct={answerState === "correct"} class:incorrect={answerState === "incorrect"}>
          {#if answerState === "correct"}
            <span>Correct! That's the {question.correctAnswer} grid.</span>
          {:else}
            <span>Not quite! That was the <strong>{question.correctAnswer}</strong> grid.</span>
          {/if}
        </div>
      {/if}
    </div>

  {:else if phase === "point"}
    <!-- Point Identification Phase -->
    {@const question = getCurrentPointQuestion()}
    {@const pointInfo = ALL_POINTS[question.direction as keyof typeof ALL_POINTS]}
    <div class="quiz-section point-quiz">
      <h3 class="quiz-title">Find the point!</h3>
      <p class="quiz-subtitle">
        Click on the <strong>{question.direction}</strong> point
        <span class="direction-hint">
          ({pointInfo.mode === "diamond" ? "Diamond grid" : pointInfo.mode === "box" ? "Box grid" : ""})
        </span>
      </p>

      <!-- Interactive 8-point grid -->
      <div class="grid-display interactive">
        <svg viewBox="0 0 100 100" class="quiz-grid clickable">
          <!-- All grid lines -->
          <line x1="50" y1="15" x2="50" y2="85" stroke="white" stroke-width="0.5" opacity="0.2" />
          <line x1="15" y1="50" x2="85" y2="50" stroke="white" stroke-width="0.5" opacity="0.2" />
          <line x1="25" y1="25" x2="75" y2="75" stroke="white" stroke-width="0.5" opacity="0.2" />
          <line x1="75" y1="25" x2="25" y2="75" stroke="white" stroke-width="0.5" opacity="0.2" />

          <!-- Clickable points -->
          {#each Object.entries(ALL_POINTS) as [dir, point]}
            {#if dir !== "center"}
              {@const isCorrect = dir === question.direction}
              {@const isSelected = selectedAnswer === dir}
              {@const showCorrect = answerState === "correct" && isSelected}
              {@const showIncorrect = answerState === "incorrect" && isSelected}
              {@const revealCorrect = answerState === "incorrect" && isCorrect}

              <g
                class="point-group"
                class:correct={showCorrect}
                class:incorrect={showIncorrect}
                class:reveal={revealCorrect}
                onclick={() => handlePointClick(dir)}
                onkeydown={(e) => (e.key === "Enter" || e.key === " ") && handlePointClick(dir)}
                role="button"
                tabindex="0"
                aria-label="Point {dir}"
              >
                <!-- Hit area (larger, invisible) -->
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="10"
                  fill="transparent"
                  class="hit-area"
                />
                <!-- Glow effect -->
                {#if showCorrect || revealCorrect}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="#50C878"
                    opacity="0.3"
                    class="glow"
                  />
                {:else if showIncorrect}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="8"
                    fill="#FF4A4A"
                    opacity="0.3"
                    class="glow"
                  />
                {/if}
                <!-- Main point -->
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill={showCorrect || revealCorrect ? "#50C878" : showIncorrect ? "#FF4A4A" : "white"}
                  class="main-point"
                />
                <!-- Label on reveal -->
                {#if (showCorrect || revealCorrect) && answerState !== "idle"}
                  <text
                    x={point.x}
                    y={point.y - 8}
                    text-anchor="middle"
                    fill={revealCorrect ? "#50C878" : "white"}
                    font-size="6"
                    font-weight="700"
                    class="point-label"
                  >
                    {dir}
                  </text>
                {/if}
              </g>
            {/if}
          {/each}

          <!-- Center point (not clickable for this quiz) -->
          <circle cx="50" cy="50" r="3.5" fill="#FFD700" opacity="0.5" />
          <circle cx="50" cy="50" r="2.5" fill="#FFD700" />
        </svg>
      </div>

      <!-- Feedback -->
      {#if answerState !== "idle"}
        <div class="feedback" class:correct={answerState === "correct"} class:incorrect={answerState === "incorrect"}>
          {#if answerState === "correct"}
            <span>Correct! That's the {question.direction} point.</span>
          {:else}
            <span>Not quite! The <strong>{question.direction}</strong> point is highlighted in green.</span>
          {/if}
        </div>
      {/if}
    </div>

  {:else}
    <!-- Complete Phase -->
    <div class="quiz-section complete">
      <div class="complete-icon">{getScoreEmoji()}</div>
      <h3 class="complete-title">Quiz Complete!</h3>
      <div class="score-display">
        <span class="score-value">{score}</span>
        <span class="score-separator">/</span>
        <span class="score-total">{getTotalQuestions()}</span>
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
  .grid-quiz {
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
    background: linear-gradient(90deg, #4A9EFF, #A855F7);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  /* Quiz sections */
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

  .direction-hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Grid display */
  .grid-display {
    width: 100%;
    max-width: 280px;
    aspect-ratio: 1;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .grid-display.interactive {
    border-color: rgba(74, 158, 255, 0.3);
  }

  .quiz-grid {
    width: 100%;
    height: 100%;
  }

  .quiz-grid.clickable {
    cursor: pointer;
  }

  /* Point interaction */
  .point-group {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .point-group:hover .main-point {
    transform: scale(1.25);
    transform-origin: center;
    filter: brightness(1.2);
  }

  .point-group .hit-area {
    cursor: pointer;
  }

  .point-group.correct .main-point,
  .point-group.reveal .main-point {
    animation: correctPop 0.4s ease;
  }

  .point-group.incorrect .main-point {
    animation: shake 0.4s ease;
  }

  @keyframes correctPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); }
    100% { transform: scale(1); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  .point-label {
    animation: fadeIn 0.3s ease;
  }

  .glow {
    animation: pulse 1s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.5; }
  }

  /* Answer buttons */
  .answer-buttons {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 400px;
  }

  .answer-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.25rem;
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
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(74, 158, 255, 0.5);
    transform: translateY(-2px);
  }

  .answer-btn:disabled {
    cursor: default;
  }

  .answer-btn i {
    font-size: 1.5rem;
    opacity: 0.8;
  }

  .answer-btn.correct {
    background: rgba(80, 200, 120, 0.2);
    border-color: rgba(80, 200, 120, 0.6);
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

  .answer-btn.reveal-correct {
    background: rgba(80, 200, 120, 0.15);
    border-color: rgba(80, 200, 120, 0.4);
  }

  .result-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .answer-btn.correct .result-icon {
    color: #50C878;
  }

  .answer-btn.incorrect .result-icon {
    color: #FF4A4A;
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
    background: rgba(80, 200, 120, 0.15);
    border: 1px solid rgba(80, 200, 120, 0.3);
    color: #50C878;
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
    color: #4A9EFF;
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
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.3), rgba(168, 85, 247, 0.3));
    border: 1px solid rgba(74, 158, 255, 0.4);
    color: white;
  }

  .action-btn.primary:hover {
    background: linear-gradient(135deg, rgba(74, 158, 255, 0.4), rgba(168, 85, 247, 0.4));
    border-color: rgba(74, 158, 255, 0.6);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 500px) {
    .grid-quiz {
      padding: 1rem;
    }

    .quiz-title {
      font-size: 1.25rem;
    }

    .answer-buttons {
      flex-direction: column;
    }

    .complete-actions {
      flex-direction: column;
    }

    .grid-display {
      max-width: 240px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quiz-section,
    .answer-btn,
    .feedback,
    .point-group,
    .progress-fill {
      animation: none;
      transition: none;
    }
  }
</style>
