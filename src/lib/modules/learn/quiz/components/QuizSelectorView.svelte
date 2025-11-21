<!-- LessonSelectorView.svelte - Main lesson selection interface -->
<script lang="ts">
  import { LESSON_INFO, QuizMode, QuizType } from "../domain";
  import LessonButton from "./LessonButton.svelte";
  import LessonModeToggle from "./QuizModeToggle.svelte";

  // Props
  let {
    selectedMode = $bindable(QuizMode.FIXED_QUESTION),
    availableQuizzes = Object.values(QuizType),
    isLoading = false,
    onQuizSelect,
    onQuizRequested,
    onModeChanged,
  } = $props<{
    selectedMode?: QuizMode,
    availableQuizzes?: QuizType[],
    isLoading?: boolean,
    onQuizSelect?: (value: { quizType: QuizType; quizMode: QuizMode }) => void,
    onQuizRequested?: (value: {,
      quizType: QuizType,
      quizMode: QuizMode
    }) => void
    onModeChanged?: (value: QuizMode) => void
  }>();

  // Handle mode change
  function handleModeChanged(mode: QuizMode) {
    selectedMode = mode;
    onModeChanged?.(selectedMode);
  }

  // Handle quiz selection
  function handleQuizClicked(quizType: QuizType) {
    const data = { quizType, quizMode: selectedMode };
    onQuizSelect?.(data);
    onQuizRequested?.(data);
  }

  // Check if quiz is available
  function isQuizAvailable(quizType: QuizType): boolean {
    return availableQuizzes.includes(quizType);
  }
</script>

<div class="quiz-selector">
  <!-- Title Section -->
  <div class="title-section">
    <h1 class="title">Select a Quiz:</h1>
  </div>

  <!-- Mode Toggle Section -->
  <div class="mode-section">
    <LessonModeToggle
      bind:selectedMode
      disabled={isLoading}
      onModeChanged={handleModeChanged}
    />
  </div>

  <!-- Quizzes Section -->
  <div class="quizzes-section">
    {#each LESSON_INFO as quiz}
      <LessonButton
        text={quiz.name}
        lessonType={quiz.lessonType}
        description={quiz.description}
        disabled={isLoading || !isQuizAvailable(quiz.lessonType)}
        onClicked={handleQuizClicked}
      />
    {/each}
  </div>
</div>

<style>
  .quiz-selector {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Always start from top */
    height: 100%;
    width: 100%;
    padding: var(--spacing-xl);
    gap: var(--spacing-lg);
  }

  .title-section {
    flex: 0 0 auto; /* Never grow/shrink */
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding: 0; /* Remove padding */
  }

  .title {
    color: white;
    font-family: Georgia, serif;
    font-weight: 800;
    font-size: 2.5rem;
    text-align: center;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
    background: linear-gradient(135deg, #ffffff, #e0e0e0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mode-section {
    flex: 0 0 auto; /* Never grow/shrink */
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0; /* Remove margin */
  }

  .quizzes-section {
    flex: 1 1 auto; /* Allow growth to fill available space */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly; /* Distribute space evenly around quizzes */
    gap: var(--spacing-md);
    width: 100%;
    max-width: 400px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .quiz-selector {
      padding: var(--spacing-sm) var(--spacing-md); /* Tighter padding */
      gap: var(--spacing-sm); /* Reduced gap */
    }

    .title-section {
      padding: 0; /* No padding */
    }

    .title {
      font-size: 1.5rem; /* 24px */
    }

    .mode-section {
      margin: var(--spacing-xs) 0; /* Minimal margin */
    }

    .quizzes-section {
      gap: var(--spacing-xs); /* Tighter gaps between quizzes */
    }
  }

  @media (max-width: 480px) {
    .quiz-selector {
      padding: var(--spacing-xs) var(--spacing-sm); /* Very tight padding */
      gap: var(--spacing-xs); /* Minimal gap */
    }

    .title {
      font-size: 1.25rem; /* 20px */
    }

    .mode-section {
      margin: 4px 0; /* Tiny margin */
    }

    .quizzes-section {
      max-width: 100%;
      width: 100%;
      gap: 4px; /* Very tight gaps */
    }
  }

  /* Responsive font sizing based on container */
  @container (max-width: 600px) {
    .title {
      font-size: 18px;
    }
  }

  @container (max-width: 400px) {
    .title {
      font-size: 16px;
    }
  }
</style>
