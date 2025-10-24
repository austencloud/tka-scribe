<!-- LessonSelectorView.svelte - Main lesson selection interface -->
<script lang="ts">
  import { LESSON_INFO, QuizMode, QuizType } from "../domain";
  import LessonButton from "./LessonButton.svelte";
  import LessonModeToggle from "./QuizModeToggle.svelte";

  // Props
  let {
    selectedMode = $bindable(QuizMode.FIXED_QUESTION),
    availableLessons = Object.values(QuizType),
    isLoading = false,
    onQuizSelect,
    onLessonRequested,
    onModeChanged,
  } = $props<{
    selectedMode?: QuizMode;
    availableLessons?: QuizType[];
    isLoading?: boolean;
    onQuizSelect?: (data: { lessonType: QuizType; quizMode: QuizMode }) => void;
    onLessonRequested?: (data: {
      lessonType: QuizType;
      quizMode: QuizMode;
    }) => void;
    onModeChanged?: (mode: QuizMode) => void;
  }>();

  // Handle mode change
  function handleModeChanged(mode: QuizMode) {
    selectedMode = mode;
    onModeChanged?.(selectedMode);
  }

  // Handle lesson selection
  function handleLessonClicked(lessonType: QuizType) {
    const data = { lessonType, quizMode: selectedMode };
    onQuizSelect?.(data);
    onLessonRequested?.(data);
  }

  // Check if lesson is available
  function isLessonAvailable(lessonType: QuizType): boolean {
    return availableLessons.includes(lessonType);
  }
</script>

<div class="lesson-selector">
  <!-- Title Section -->
  <div class="title-section">
    <h1 class="title">Select a Lesson:</h1>
  </div>

  <!-- Mode Toggle Section -->
  <div class="mode-section">
    <LessonModeToggle
      bind:selectedMode
      disabled={isLoading}
      onModeChanged={handleModeChanged}
    />
  </div>

  <!-- Lessons Section -->
  <div class="lessons-section">
    {#each LESSON_INFO as lesson}
      <LessonButton
        text={lesson.name}
        lessonType={lesson.lessonType}
        description={lesson.description}
        disabled={isLoading || !isLessonAvailable(lesson.lessonType)}
        onClicked={handleLessonClicked}
      />
    {/each}
  </div>
</div>

<style>
  .lesson-selector {
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

  .lessons-section {
    flex: 1 1 auto; /* Allow growth to fill available space */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly; /* Distribute space evenly around lessons */
    gap: var(--spacing-md);
    width: 100%;
    max-width: 400px;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .lesson-selector {
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

    .lessons-section {
      gap: var(--spacing-xs); /* Tighter gaps between lessons */
    }
  }

  @media (max-width: 480px) {
    .lesson-selector {
      padding: var(--spacing-xs) var(--spacing-sm); /* Very tight padding */
      gap: var(--spacing-xs); /* Minimal gap */
    }

    .title {
      font-size: 1.25rem; /* 20px */
    }

    .mode-section {
      margin: 4px 0; /* Tiny margin */
    }

    .lessons-section {
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
