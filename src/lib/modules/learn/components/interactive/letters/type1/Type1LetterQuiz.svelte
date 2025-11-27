<!--
Type1LetterQuiz - Quiz to identify motion types for Type 1 (Dual-Shift) letters
Shows pictograph, user identifies the motion pattern (Pro-Pro, Anti-Anti, or Hybrid)
-->
<script lang="ts">
  import {
    GridMode,
    GridPositionGroup,
    Letter,
    MotionType,
    Pictograph,
    resolve,
    TYPES,
    type IHapticFeedbackService,
    type ILetterQueryHandler,
    type PictographData,
  } from "$shared";
  import { onMount } from "svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type MotionPattern = "pro-pro" | "anti-anti" | "hybrid";
  type AnswerState = "idle" | "correct" | "incorrect";

  interface QuizQuestion {
    letter: Letter;
    pattern: MotionPattern;
    blueMotion: MotionType;
    redMotion: MotionType;
  }

  // Quiz state
  let currentQuestionIndex = $state(0);
  let score = $state(0);
  let answerState = $state<AnswerState>("idle");
  let selectedAnswer = $state<MotionPattern | null>(null);
  let isLoadingPictograph = $state(true);
  let currentPictographData = $state<PictographData | null>(null);
  let lastLoadedQuestionIndex = $state(-1); // Track which question we loaded

  // Generate questions from Type 1 letters
  const questions = $state<QuizQuestion[]>(generateQuestions());

  function generateQuestions(): QuizQuestion[] {
    // All Type 1 letters with their motion patterns
    const type1Letters: QuizQuestion[] = [
      // Pro-Pro (7 letters)
      { letter: Letter.A, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      { letter: Letter.D, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      { letter: Letter.G, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      { letter: Letter.J, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      { letter: Letter.M, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      { letter: Letter.P, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      { letter: Letter.S, pattern: "pro-pro", blueMotion: MotionType.PRO, redMotion: MotionType.PRO },
      // Anti-Anti (7 letters)
      { letter: Letter.B, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      { letter: Letter.E, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      { letter: Letter.H, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      { letter: Letter.K, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      { letter: Letter.N, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      { letter: Letter.Q, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      { letter: Letter.T, pattern: "anti-anti", blueMotion: MotionType.ANTI, redMotion: MotionType.ANTI },
      // Hybrid (8 letters)
      { letter: Letter.C, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.F, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.I, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.L, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.O, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.R, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.U, pattern: "hybrid", blueMotion: MotionType.ANTI, redMotion: MotionType.PRO },
      { letter: Letter.V, pattern: "hybrid", blueMotion: MotionType.PRO, redMotion: MotionType.ANTI },
    ];

    // Select 12 questions: 4 of each pattern
    const selected: QuizQuestion[] = [];

    const proProLetters = type1Letters.filter(q => q.pattern === "pro-pro");
    const antiAntiLetters = type1Letters.filter(q => q.pattern === "anti-anti");
    const hybridLetters = type1Letters.filter(q => q.pattern === "hybrid");

    // Shuffle each category
    const shuffledProPro = [...proProLetters].sort(() => Math.random() - 0.5);
    const shuffledAntiAnti = [...antiAntiLetters].sort(() => Math.random() - 0.5);
    const shuffledHybrid = [...hybridLetters].sort(() => Math.random() - 0.5);

    // Take 4 from each
    selected.push(...shuffledProPro.slice(0, 4));
    selected.push(...shuffledAntiAnti.slice(0, 4));
    selected.push(...shuffledHybrid.slice(0, 4));

    // Shuffle final selection
    return selected.sort(() => Math.random() - 0.5);
  }

  // Load pictograph for current question
  async function loadCurrentPictograph(questionIndex: number) {
    if (questionIndex >= questions.length) return;

    isLoadingPictograph = true;
    currentPictographData = null;
    lastLoadedQuestionIndex = questionIndex;

    try {
      const letterQueryHandler = resolve<ILetterQueryHandler>(
        TYPES.ILetterQueryHandler
      );

      const currentQuestion = questions[questionIndex];
      if (!currentQuestion) return;

      const data = await letterQueryHandler.getPictographByLetter(
        currentQuestion.letter,
        GridMode.DIAMOND
      );

      // Only update if still on the same question
      if (lastLoadedQuestionIndex === questionIndex && data) {
        currentPictographData = data;
      }
    } catch (e) {
      console.error("Failed to load pictograph:", e);
    } finally {
      if (lastLoadedQuestionIndex === questionIndex) {
        isLoadingPictograph = false;
      }
    }
  }

  // Load first pictograph on mount
  onMount(() => {
    loadCurrentPictograph(0);
  });

  // Load pictograph when question changes
  // Use $effect.pre to avoid reading lastLoadedQuestionIndex which creates a dependency cycle
  let prevQuestionIndex = -1;
  $effect(() => {
    const idx = currentQuestionIndex;
    // Only react to currentQuestionIndex changes, not lastLoadedQuestionIndex
    if (idx !== prevQuestionIndex && idx < questions.length) {
      prevQuestionIndex = idx;
      loadCurrentPictograph(idx);
    }
  });

  function getCurrentQuestion(): QuizQuestion | null {
    return questions[currentQuestionIndex] ?? null;
  }

  function handleAnswer(answer: MotionPattern) {
    if (answerState !== "idle") return;

    selectedAnswer = answer;
    const question = getCurrentQuestion();
    if (!question) return;

    if (answer === question.pattern) {
      answerState = "correct";
      score++;
      hapticService?.trigger("success");
    } else {
      answerState = "incorrect";
      hapticService?.trigger("error");
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        answerState = "idle";
        selectedAnswer = null;
      } else {
        // Quiz complete
        answerState = "idle";
        currentQuestionIndex++;
      }
    }, 1500);
  }

  function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    answerState = "idle";
    selectedAnswer = null;
    lastLoadedQuestionIndex = -1; // Reset to allow loading question 0
    questions.length = 0;
    questions.push(...generateQuestions());
    loadCurrentPictograph(0);
  }

  function getProgressPercent() {
    return (currentQuestionIndex / questions.length) * 100;
  }

  function getScoreMessage() {
    const percent = (score / questions.length) * 100;
    if (percent === 100) return "Perfect! You've mastered Type 1 letters!";
    if (percent >= 80) return "Excellent! You know your motion patterns!";
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

  const isComplete = $derived(currentQuestionIndex >= questions.length);

  // Pattern display info
  const patternInfo: Record<MotionPattern, { icon: string; label: string; color: string; description: string }> = {
    "pro-pro": {
      icon: "fa-rotate-right",
      label: "Pro-Pro",
      color: "#22D3EE",
      description: "Both hands prospin"
    },
    "anti-anti": {
      icon: "fa-rotate-left",
      label: "Anti-Anti",
      color: "#A855F7",
      description: "Both hands antispin"
    },
    "hybrid": {
      icon: "fa-shuffle",
      label: "Hybrid",
      color: "#F59E0B",
      description: "Different motions"
    },
  };
</script>

<div class="type1-quiz">
  <!-- Progress bar -->
  <div class="quiz-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {getProgressPercent()}%"></div>
    </div>
    <div class="progress-text">
      {#if !isComplete}
        Question {currentQuestionIndex + 1} of {questions.length}
      {:else}
        Complete!
      {/if}
    </div>
  </div>

  {#if !isComplete}
    {@const question = getCurrentQuestion()}
    <div class="quiz-section">
      <h3 class="quiz-title">What motion pattern is this letter?</h3>

      <!-- Letter display -->
      {#if question}
        <div class="letter-display">
          <span class="quiz-letter">{question.letter}</span>
        </div>
      {/if}

      <!-- Pictograph visualizer -->
      <div class="visualizer-container">
        {#if isLoadingPictograph}
          <div class="loading-state">
            <div class="loading-spinner"></div>
          </div>
        {:else if currentPictographData}
          <Pictograph
            pictographData={currentPictographData}
            showTKA={false}
            showVTG={false}
            showElemental={false}
            showPositions={false}
            showReversals={false}
            disableContentTransitions={true}
          />
        {:else}
          <div class="error-state">
            <span class="error-icon">⚠</span>
            <span>Could not load pictograph</span>
          </div>
        {/if}
      </div>

      <!-- Answer buttons -->
      <div class="answer-buttons">
        {#each (["pro-pro", "anti-anti", "hybrid"] as MotionPattern[]) as pattern}
          {@const info = patternInfo[pattern]}
          {@const isSelected = selectedAnswer === pattern}
          {@const isCorrectAnswer = question?.pattern === pattern}
          {@const showCorrect = answerState === "correct" && isSelected}
          {@const showIncorrect = answerState === "incorrect" && isSelected}
          {@const revealCorrect = answerState === "incorrect" && isCorrectAnswer}

          <button
            class="answer-btn"
            class:selected={isSelected}
            class:correct={showCorrect || revealCorrect}
            class:incorrect={showIncorrect}
            style="--pattern-color: {info.color}"
            onclick={() => handleAnswer(pattern)}
            disabled={answerState !== "idle" || isLoadingPictograph}
          >
            <i class="fa-solid {info.icon}"></i>
            <div class="answer-content">
              <span class="answer-label">{info.label}</span>
              <span class="answer-desc">{info.description}</span>
            </div>
            {#if answerState !== "idle" && isSelected}
              <span class="result-icon">{answerState === "correct" ? "✓" : "✗"}</span>
            {:else if revealCorrect}
              <span class="result-icon correct">✓</span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- Feedback -->
      {#if answerState !== "idle" && question}
        {@const correctInfo = patternInfo[question.pattern]}
        <div class="feedback" class:correct={answerState === "correct"} class:incorrect={answerState === "incorrect"}>
          {#if answerState === "correct"}
            <span>
              Correct! <strong>{question.letter}</strong> is
              <strong style="color: {correctInfo.color}">{correctInfo.label}</strong>
            </span>
          {:else}
            <span>
              Not quite! <strong>{question.letter}</strong> is
              <strong style="color: {correctInfo.color}">{correctInfo.label}</strong>
            </span>
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
          <i class="fa-solid fa-check"></i>
          Complete Lesson
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .type1-quiz {
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
  }

  /* Letter display */
  .letter-display {
    padding: 0.75rem 2rem;
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.3);
    border-radius: 12px;
  }

  .quiz-letter {
    font-size: 2.5rem;
    font-weight: 800;
    color: #22d3ee;
  }

  /* Visualizer container */
  .visualizer-container {
    width: 160px;
    height: 160px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    gap: 0.5rem;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(34, 211, 238, 0.2);
    border-top-color: #22d3ee;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state {
    background: rgba(239, 68, 68, 0.05);
    color: #ef4444;
  }

  .error-icon {
    font-size: 1.5rem;
  }

  /* Answer buttons */
  .answer-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 400px;
  }

  .answer-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: left;
  }

  .answer-btn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--pattern-color) 15%, transparent);
    border-color: color-mix(in srgb, var(--pattern-color) 50%, transparent);
    transform: translateX(4px);
  }

  .answer-btn:disabled {
    cursor: default;
  }

  .answer-btn i {
    font-size: 1.5rem;
    color: var(--pattern-color);
    width: 32px;
    text-align: center;
  }

  .answer-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    flex: 1;
  }

  .answer-label {
    font-size: 1rem;
    font-weight: 700;
  }

  .answer-desc {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .answer-btn.correct {
    background: color-mix(in srgb, var(--pattern-color) 20%, transparent);
    border-color: var(--pattern-color);
    animation: correctPulse 0.5s ease;
  }

  @keyframes correctPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.02);
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
    font-size: 1.25rem;
    font-weight: 700;
    color: #ff4a4a;
  }

  .result-icon.correct,
  .answer-btn.correct .result-icon {
    color: var(--pattern-color);
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
    .type1-quiz {
      padding: 1rem;
    }

    .quiz-title {
      font-size: 1.125rem;
    }

    .quiz-letter {
      font-size: 2rem;
    }

    .visualizer-container {
      width: 140px;
      height: 140px;
    }

    .complete-actions {
      flex-direction: column;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .quiz-section,
    .answer-btn,
    .feedback,
    .progress-fill,
    .loading-spinner {
      animation: none;
      transition: none;
    }
  }
</style>
