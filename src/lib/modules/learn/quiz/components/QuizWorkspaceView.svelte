<!-- LessonWorkspaceView.svelte - Enhanced lesson workspace with full functionality -->
<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import {
    QuizMode as QuizModeEnum,
    type QuizLayoutMode,
    type QuizMode,
    type QuizProgress,
    type QuizResults,
  } from "../domain";
  import QuizTimer from "./QuizTimer.svelte";

  import TopBar from "$lib/shared/navigation/components/TopBar.svelte";
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  // Import quiz services
  import { QuizType } from "../domain";
  import {
    QuizConfigurator,
    QuizSessionService,
  } from "../services/implementations";
  import LetterToPictographQuiz from "./LetterToPictographQuiz.svelte";
  import PictographToLetterQuiz from "./PictographToLetterQuiz.svelte";

  // Props
  let {
    quizId = null,
    quizType = null,
    quizMode = null,
    questionIndex = 0,
    onBackToSelector,
    onQuizComplete,
    onAnswerSubmit,
  } = $props<{
    quizId?: string | null,
    quizType?: QuizType | null,
    quizMode?: QuizMode | null,
    layoutMode?: QuizLayoutMode,
    questionIndex?: number,
    onBackToSelector?: () => void,
    onQuizComplete?: (results: QuizResults) => void,
    onAnswerSubmit?: (answer: any) => void
  }>();

  // State
  let sessionId: string | null = null;
  let progress: QuizProgress | null = $state(null);
  let timeRemaining = $state(0);
  let isLoading = $state(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let isPaused = $state(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let hasStarted = $state(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let correctAnswers = $state(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let totalQuestions = $state(0);

  // Component references
  let timerComponent = $state<QuizTimer>();

  // Services
  let hapticService: IHapticFeedbackService;

  // Initialize haptic service
  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Derived state
  const isCountdownMode = $derived(quizMode === QuizModeEnum.COUNTDOWN);
  const isFixedQuestionMode = $derived(
    quizMode === QuizModeEnum.FIXED_QUESTION
  );

  // Lifecycle
  onMount(() => {
    if (quizType && quizMode) {
      startQuiz();
    }
  });

  onDestroy(() => {
    // TODO: Re-enable when services are fixed
    // if (sessionId) {
    //   QuizSessionService.abandonSession(sessionId);
    // }
  });

  // Methods
  function startQuiz() {
    if (!quizType || !quizMode) return;

    isLoading = true;

    // Create quiz session
    sessionId = QuizSessionService.createSession(quizType, quizMode);

    // Set up timer for countdown mode
    if (isCountdownMode) {
      timeRemaining = QuizConfigurator.getQuizTime(quizMode);
      if (timerComponent) {
        timerComponent.start();
      }
    }

    // Initialize state
    correctAnswers = 0;
    totalQuestions = 0;
    updateProgress();
    hasStarted = true;

    isLoading = false;
  }

  function handleAnswerSubmit(isCorrect: boolean) {
    totalQuestions++;
    if (isCorrect) {
      correctAnswers++;
    }

    if (sessionId) {
      QuizSessionService.updateSessionProgress(sessionId, isCorrect, 0);
      updateProgress();
    }

    // Check if quiz should continue
    if (!shouldContinueQuiz()) {
      completeQuiz();
    }
  }

  function handleNextQuestion() {
    // Quiz components handle their own question generation
    // This is just for any additional logic needed between questions
  }

  function shouldContinueQuiz(): boolean {
    if (!sessionId) return false;

    const session = QuizSessionService.getSession(sessionId);
    if (!session || !session.isActive) return false;

    if (isFixedQuestionMode) {
      return session.questionsAnswered < session.totalQuestions;
    } else if (isCountdownMode) {
      return timeRemaining > 0;
    }

    return false;
  }

  function updateProgress() {
    if (!sessionId) return;
    const session = QuizSessionService.getSession(sessionId);
    if (session) {
      progress = {
        questionsAnswered: session.questionsAnswered,
        correctAnswers: session.correctAnswers,
        incorrectAnswers: session.incorrectGuesses,
        currentQuestion: session.currentQuestion,
        totalQuestions: session.totalQuestions,
        timeElapsed: 0,
        streakCurrent: 0,
        streakLongest: 0,
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleTimerTick(data: { timeRemaining: number }) {
    timeRemaining = data.timeRemaining;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleTimeUp() {
    completeQuiz();
  }

  function completeQuiz() {
    if (!sessionId) return;

    const results = QuizSessionService.completeSession(sessionId);
    if (results) {
      onQuizComplete?.(results);
    }
  }

  function handleBackClick() {
    // Trigger navigation haptic for back action
    hapticService?.trigger("selection");

    if (sessionId) {
      QuizSessionService.abandonSession(sessionId);
    }
    onBackToSelector?.();
  }

  // Quiz control handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handlePauseClicked() {
    // Trigger selection haptic for pause
    hapticService?.trigger("selection");

    isPaused = true;
    if (timerComponent) {
      timerComponent.pause();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleResumeClicked() {
    // Trigger selection haptic for resume
    hapticService?.trigger("selection");

    isPaused = false;
    if (timerComponent) {
      timerComponent.resume();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleRestartClicked() {
    // Trigger navigation haptic for restart
    hapticService?.trigger("selection");

    if (sessionId) {
      QuizSessionService.abandonSession(sessionId);
    }
    // Restart the quiz
    startQuiz();
  }

  function formatQuizTitle(): string {
    if (!quizType) return "Unknown Quiz";
    return QuizConfigurator.getFormattedQuizTitle(quizType);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function getQuizModeDisplay(): string {
    if (!quizMode) return "Unknown Mode";
    return QuizConfigurator.getQuizModeName(quizMode);
  }
</script>

<div class="quiz-workspace">
  {#if isLoading}
    <div class="loading-screen">
      <div class="loading-spinner"></div>
      <p>Starting quiz...</p>
    </div>
  {:else}
    <!-- Top Bar with Back Button -->
    <TopBar navigationLayout="top">
      {#snippet left()}
        <button class="back-button" onclick={handleBackClick}>
          <i class="fas fa-arrow-left"></i>
          Back
        </button>
      {/snippet}

      {#snippet content()}
        <h2 class="quiz-title">{formatQuizTitle()}</h2>
      {/snippet}
    </TopBar>

    <!-- Main Content -->
    <div class="workspace-content">
      {#if quizType === QuizType.PICTOGRAPH_TO_LETTER}
        <PictographToLetterQuiz
          onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect)}
          onNextQuestion={handleNextQuestion}
        />
      {:else if quizType === QuizType.LETTER_TO_PICTOGRAPH}
        <LetterToPictographQuiz
          onAnswerSubmit={(isCorrect) => handleAnswerSubmit(isCorrect)}
          onNextQuestion={handleNextQuestion}
        />
      {:else if quizType}
        <div class="coming-soon">
          <p>Quiz 3 coming soon...</p>
        </div>
      {:else}
        <div class="no-question">
          <p>No quiz selected</p>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .quiz-workspace {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    gap: clamp(0.25rem, 1cqi, 0.5rem);
    padding: 0;
  }

  .back-button {
    padding: clamp(0.5rem, 1.5cqi, 0.625rem) clamp(0.75rem, 2.5cqi, 1rem);
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(0.75rem, 2cqi, 0.875rem);
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 0.25rem;
    min-height: 44px;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(102, 126, 234, 0.4);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  }

  .quiz-title {
    color: white;
    font-family: Georgia, serif;
    font-size: clamp(0.875rem, 3cqi, 1.125rem);
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .workspace-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: auto;
    padding: 0;
  }

  .no-question {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    color: #94a3b8;
    font-size: 1.125rem;
  }

  .loading-screen {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 1rem;
    color: #ffffff;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .quiz-title {
      font-size: 1rem;
    }
  }
</style>
