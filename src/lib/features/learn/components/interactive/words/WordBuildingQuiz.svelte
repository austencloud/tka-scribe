<!--
WordBuildingQuiz - Quiz to test understanding of TKA word formation
Questions about letter sequences, motion types, position transitions, and CAPs
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import WordVisualizer from "./WordVisualizer.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  type HandPosition = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";
  type MotionType = "pro" | "anti" | "hybrid";
  type AnswerState = "idle" | "correct" | "incorrect";

  interface LetterDefinition {
    letter: string;
    startLeft: HandPosition;
    startRight: HandPosition;
    endLeft: HandPosition;
    endRight: HandPosition;
    leftMotion: MotionType;
    rightMotion: MotionType;
  }

  interface QuizQuestion {
    type:
      | "identify-word"
      | "motion-pattern"
      | "position-transition"
      | "letter-sequence"
      | "cap-concept";
    question: string;
    letters?: LetterDefinition[];
    options: string[];
    correctAnswer: number;
    explanation: string;
  }

  // Quiz state
  let currentQuestion = $state(0);
  let score = $state(0);
  let answerState = $state<AnswerState>("idle");
  let selectedAnswer = $state<number | null>(null);
  let currentBeat = $state(0);

  // Sample letter definitions for visualizations
  const letterA: LetterDefinition = {
    letter: "A",
    startLeft: "N",
    startRight: "S",
    endLeft: "E",
    endRight: "W",
    leftMotion: "pro",
    rightMotion: "pro",
  };

  const letterB: LetterDefinition = {
    letter: "B",
    startLeft: "N",
    startRight: "S",
    endLeft: "W",
    endRight: "E",
    leftMotion: "anti",
    rightMotion: "anti",
  };

  const letterC: LetterDefinition = {
    letter: "C",
    startLeft: "E",
    startRight: "W",
    endLeft: "S",
    endRight: "N",
    leftMotion: "pro",
    rightMotion: "pro",
  };

  const letterG: LetterDefinition = {
    letter: "G",
    startLeft: "N",
    startRight: "N",
    endLeft: "E",
    endRight: "E",
    leftMotion: "pro",
    rightMotion: "pro",
  };

  const letterH: LetterDefinition = {
    letter: "H",
    startLeft: "N",
    startRight: "N",
    endLeft: "W",
    endRight: "W",
    leftMotion: "anti",
    rightMotion: "anti",
  };

  // Quiz questions (at least 8)
  const questions: QuizQuestion[] = [
    {
      type: "motion-pattern",
      question: "What motion type repeats throughout the TKA alphabet?",
      options: [
        "Pro, Anti, Static",
        "Pro, Anti, Hybrid",
        "Pro, Pro, Anti",
        "Hybrid, Hybrid, Pro",
      ],
      correctAnswer: 1,
      explanation:
        "The Pro-Anti-Hybrid pattern repeats throughout the alphabet (A=Pro, B=Anti, C=Hybrid, D=Pro, E=Anti, F=Hybrid, etc.)",
    },
    {
      type: "identify-word",
      question: "Watch the animation. What word is being spelled?",
      letters: [letterA, letterA],
      options: ["AB", "AA", "BB", "CC"],
      correctAnswer: 1,
      explanation:
        "This shows the letter A performed twice in sequence, forming the word 'AA'.",
    },
    {
      type: "position-transition",
      question:
        "In Alpha (α) position, where are the hands relative to each other?",
      options: [
        "Same point (together)",
        "Opposite sides (180°)",
        "Right angle (90°)",
        "Adjacent points",
      ],
      correctAnswer: 1,
      explanation:
        "Alpha position has hands on opposite sides of the grid (180° apart), like N-S or E-W.",
    },
    {
      type: "letter-sequence",
      question: "What makes letters connect in a TKA word?",
      options: [
        "Letters must be alphabetical",
        "End position of one letter = Start of next",
        "All letters must be the same",
        "Letters must alternate motion types",
      ],
      correctAnswer: 1,
      explanation:
        "Letters connect when the end position of one letter matches the start position of the next letter.",
    },
    {
      type: "cap-concept",
      question: "What is a CAP (Continuous Assembly Pattern)?",
      options: [
        "A letter that uses only one hand",
        "A word where end position returns to start",
        "A transition between pro and anti",
        "A position with both hands together",
      ],
      correctAnswer: 1,
      explanation:
        "A CAP is a word where the final position returns to the original starting position, creating a loop.",
    },
    {
      type: "identify-word",
      question: "Watch this sequence. What letters are being performed?",
      letters: [letterA, letterB],
      options: ["AA", "AB", "BA", "BB"],
      correctAnswer: 1,
      explanation:
        "First a Pro motion (letter A), then an Anti motion (letter B), forming 'AB'.",
    },
    {
      type: "motion-pattern",
      question: "Letter A uses which motion type for both hands?",
      letters: [letterA],
      options: ["Antispin", "Prospin", "Hybrid", "Static"],
      correctAnswer: 1,
      explanation:
        "Letter A uses Prospin motion for both hands - they rotate in the same direction as their travel.",
    },
    {
      type: "position-transition",
      question: "In Beta (β) position, where are the hands?",
      options: [
        "Opposite sides",
        "Right angle apart",
        "Same point (together)",
        "Diagonal corners",
      ],
      correctAnswer: 2,
      explanation:
        "Beta position has both hands at the same point on the grid (0° apart).",
    },
    {
      type: "letter-sequence",
      question:
        "If a letter ends in Alpha position (α), what must the next letter start in?",
      options: ["Beta (β)", "Gamma (γ)", "Alpha (α)", "Any position"],
      correctAnswer: 2,
      explanation:
        "For letters to connect, the end position type must match the next letter's start position type.",
    },
    {
      type: "cap-concept",
      question: "Which word type creates a seamless loop?",
      options: [
        "Any word with 2+ letters",
        "Words starting with A",
        "CAPs (returning to start)",
        "Words with all Pro motions",
      ],
      correctAnswer: 2,
      explanation:
        "CAPs (Continuous Assembly Patterns) return to the starting position, creating seamless loops.",
    },
    {
      type: "identify-word",
      question: "What word is shown? (Both hands move together)",
      letters: [letterG, letterG],
      options: ["AA", "BB", "GG", "HH"],
      correctAnswer: 2,
      explanation:
        "Letter G shows both hands starting at the same point (Beta) and moving together with Pro motion.",
    },
    {
      type: "motion-pattern",
      question: "What distinguishes Antispin from Prospin?",
      options: [
        "Antispin is faster",
        "Antispin rotates opposite to travel direction",
        "Antispin uses only one hand",
        "Antispin starts from Beta position",
      ],
      correctAnswer: 1,
      explanation:
        "In Antispin, the props rotate opposite to their direction of travel. In Prospin, they rotate the same direction.",
    },
  ];

  // Shuffle questions for variety
  const shuffledQuestions = $state(
    [...questions].sort(() => Math.random() - 0.5).slice(0, 9)
  );

  function getCurrentQuestion(): QuizQuestion {
    return shuffledQuestions[currentQuestion]!;
  }

  function handleAnswer(answerIndex: number) {
    if (answerState !== "idle") return;

    selectedAnswer = answerIndex;
    const question = getCurrentQuestion();

    if (answerIndex === question.correctAnswer) {
      answerState = "correct";
      score++;
      hapticService?.trigger("success");
    } else {
      answerState = "incorrect";
      hapticService?.trigger("error");
    }

    // Auto-advance after delay
    setTimeout(() => {
      if (currentQuestion < shuffledQuestions.length - 1) {
        currentQuestion++;
        answerState = "idle";
        selectedAnswer = null;
        currentBeat = 0;
      } else {
        // Quiz complete
        answerState = "idle";
        currentQuestion++;
      }
    }, 2500);
  }

  function restartQuiz() {
    shuffledQuestions.length = 0;
    shuffledQuestions.push(
      ...[...questions].sort(() => Math.random() - 0.5).slice(0, 9)
    );
    currentQuestion = 0;
    score = 0;
    answerState = "idle";
    selectedAnswer = null;
    currentBeat = 0;
  }

  function getProgressPercent(): number {
    return (currentQuestion / shuffledQuestions.length) * 100;
  }

  function getScoreMessage(): string {
    const percent = (score / shuffledQuestions.length) * 100;
    if (percent === 100) return "Perfect! You're a Word Master!";
    if (percent >= 80) return "Excellent! You understand TKA words!";
    if (percent >= 60) return "Good job! Keep practicing!";
    return "Keep learning! Review the lesson and try again.";
  }

  function getScoreEmoji(): string {
    const percent = (score / shuffledQuestions.length) * 100;
    if (percent === 100) return "🏆";
    if (percent >= 80) return "🌟";
    if (percent >= 60) return "👍";
    return "📚";
  }

  const isComplete = $derived(currentQuestion >= shuffledQuestions.length);

  // Question type icons
  const typeIcons: Record<QuizQuestion["type"], string> = {
    "identify-word": "fa-eye",
    "motion-pattern": "fa-rotate",
    "position-transition": "fa-arrows-left-right",
    "letter-sequence": "fa-link",
    "cap-concept": "fa-circle-notch",
  };

  // Handle beat changes for visualizer
  function handleBeatChange(index: number) {
    currentBeat = index;
  }
</script>

<div class="word-quiz">
  <!-- Progress bar -->
  <div class="quiz-progress">
    <div class="progress-bar">
      <div class="progress-fill" style="width: {getProgressPercent()}%"></div>
    </div>
    <div class="progress-text">
      {#if !isComplete}
        Question {currentQuestion + 1} of {shuffledQuestions.length}
      {:else}
        Complete!
      {/if}
    </div>
  </div>

  {#if !isComplete}
    {@const question = getCurrentQuestion()}
    <div class="quiz-section">
      <!-- Question type badge -->
      <div class="question-type">
        <i class="fa-solid {typeIcons[question.type]}"></i>
        <span>{question.type.replace(/-/g, " ")}</span>
      </div>

      <h3 class="quiz-title">{question.question}</h3>

      <!-- Word visualizer if question has letters -->
      {#if question.letters && question.letters.length > 0}
        <div class="visualizer-container">
          <WordVisualizer
            letters={question.letters}
            currentBeatIndex={currentBeat}
            isAnimating={true}
            animationSpeed={1500}
            showLetterLabel={answerState !== "idle"}
            showBeatNumber={true}
            onBeatChange={handleBeatChange}
          />
        </div>
      {/if}

      <!-- Answer options -->
      <div class="answer-options">
        {#each question.options as option, i}
          {@const isSelected = selectedAnswer === i}
          {@const isCorrectAnswer = question.correctAnswer === i}
          {@const showCorrect = answerState === "correct" && isSelected}
          {@const showIncorrect = answerState === "incorrect" && isSelected}
          {@const revealCorrect =
            answerState === "incorrect" && isCorrectAnswer}

          <button
            class="answer-btn"
            class:selected={isSelected}
            class:correct={showCorrect || revealCorrect}
            class:incorrect={showIncorrect}
            onclick={() => handleAnswer(i)}
            disabled={answerState !== "idle"}
          >
            <span class="option-letter">{String.fromCharCode(65 + i)}</span>
            <span class="option-text">{option}</span>
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

      <!-- Feedback with explanation -->
      {#if answerState !== "idle"}
        <div
          class="feedback"
          class:correct={answerState === "correct"}
          class:incorrect={answerState === "incorrect"}
        >
          {#if answerState === "correct"}
            <div class="feedback-header">
              <i class="fa-solid fa-check-circle"></i>
              <span>Correct!</span>
            </div>
          {:else}
            <div class="feedback-header">
              <i class="fa-solid fa-times-circle"></i>
              <span>Not quite!</span>
            </div>
          {/if}
          <p class="explanation">{question.explanation}</p>
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
        <span class="score-total">{shuffledQuestions.length}</span>
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
  .word-quiz {
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
    background: linear-gradient(90deg, #a855f7, #ec4899);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.6);
    text-align: center;
  }

  /* Question type badge */
  .question-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.3);
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #a855f7;
    text-transform: capitalize;
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
    max-width: 280px;
  }

  /* Answer options */
  .answer-options {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    width: 100%;
    max-width: 500px;
  }

  .answer-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    color: white;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
  }

  .answer-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateX(4px);
  }

  .answer-btn:disabled {
    cursor: default;
  }

  .option-letter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }

  .option-text {
    flex: 1;
    line-height: 1.4;
  }

  .answer-btn.correct {
    background: rgba(34, 211, 238, 0.15);
    border-color: rgba(34, 211, 238, 0.5);
    animation: correctPulse 0.5s ease;
  }

  .answer-btn.correct .option-letter {
    background: rgba(34, 211, 238, 0.3);
    color: #22d3ee;
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
    background: rgba(255, 74, 74, 0.15);
    border-color: rgba(255, 74, 74, 0.5);
    animation: shake 0.4s ease;
  }

  .answer-btn.incorrect .option-letter {
    background: rgba(255, 74, 74, 0.3);
    color: #ff4a4a;
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
    right: 1rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #ff4a4a;
  }

  .result-icon.correct,
  .answer-btn.correct .result-icon {
    color: #22d3ee;
  }

  /* Feedback */
  .feedback {
    width: 100%;
    max-width: 500px;
    padding: 1rem 1.25rem;
    border-radius: 12px;
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
    background: rgba(34, 211, 238, 0.1);
    border: 1px solid rgba(34, 211, 238, 0.25);
  }

  .feedback.incorrect {
    background: rgba(255, 158, 74, 0.1);
    border: 1px solid rgba(255, 158, 74, 0.25);
  }

  .feedback-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    font-weight: 700;
    font-size: 1rem;
  }

  .feedback.correct .feedback-header {
    color: #22d3ee;
  }

  .feedback.incorrect .feedback-header {
    color: #ff9e4a;
  }

  .explanation {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.8);
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
    background: linear-gradient(135deg, #a855f7, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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
    max-width: 352px;
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1.25rem;
    min-height: var(--min-touch-target);
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
      rgba(168, 85, 247, 0.3),
      rgba(236, 72, 153, 0.3)
    );
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: white;
  }

  .action-btn.primary:hover {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.4),
      rgba(236, 72, 153, 0.4)
    );
    border-color: rgba(168, 85, 247, 0.6);
    transform: translateY(-2px);
  }

  /* Responsive */
  @media (max-width: 500px) {
    .word-quiz {
      padding: 1rem;
    }

    .quiz-title {
      font-size: 1.125rem;
    }

    .answer-btn {
      padding: 0.75rem;
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
