<!-- Learn Tab - Educational content with beautiful sub-tabs -->
<script lang="ts">
  import type { PictographData } from "$domain";
  import { LearnView, LessonType, QuizMode, type LessonResults } from "$domain";
  import { getSettings } from "$state";
  import { fade } from "svelte/transition";
  import CodexComponent from "../codex/CodexComponent.svelte";
  import LessonResultsView from "./LessonResultsView.svelte";
  import LessonSelectorView from "./LessonSelectorView.svelte";
  import LessonWorkspaceView from "./LessonWorkspaceView.svelte";

  // Sub-tab system
  type LearnSubTab = "codex" | "quiz";
  let activeSubTab = $state<LearnSubTab>("codex");

  // Quiz state management
  let currentView = $state<LearnView>(LearnView.LESSON_SELECTOR);
  let selectedMode = $state<QuizMode>(QuizMode.FIXED_QUESTION);
  let currentLessonType = $state<LessonType | null>(null);
  let currentResults = $state<LessonResults | null>(null);
  let isLoading = $state<boolean>(false);

  // Available lessons (all enabled for now)
  let availableLessons: LessonType[] = Object.values(LessonType);

  // Get settings for animation control
  let settings = $derived(getSettings());

  // Transition functions that respect animation settings - same as main interface
  const contentOut = (node: Element) => {
    const animationsEnabled = settings.animationsEnabled !== false;
    return fade(node, {
      duration: animationsEnabled ? 250 : 0,
    });
  };

  const contentIn = (node: Element) => {
    const animationsEnabled = settings.animationsEnabled !== false;
    return fade(node, {
      duration: animationsEnabled ? 300 : 0,
      delay: animationsEnabled ? 250 : 0, // Wait for out transition
    });
  };

  // Sub-tab switching
  function switchToSubTab(subTab: LearnSubTab) {
    activeSubTab = subTab;
  }

  // Navigation handlers
  function handleLessonRequested(event: {
    lessonType: LessonType;
    quizMode: QuizMode;
  }) {
    isLoading = true;

    // Small delay for smooth transition
    setTimeout(() => {
      currentLessonType = event.lessonType;
      selectedMode = event.quizMode;
      currentView = LearnView.LESSON_WORKSPACE;
      currentResults = null;
      isLoading = false;
    }, 300);
  }

  function handleModeChanged(mode: QuizMode) {
    selectedMode = mode;
  }

  function handleBackToSelector() {
    isLoading = true;

    // Small delay for smooth transition
    setTimeout(() => {
      currentView = LearnView.LESSON_SELECTOR;
      currentLessonType = null;
      currentResults = null;
      isLoading = false;
    }, 200);
  }

  function handleRetryLesson() {
    if (currentLessonType) {
      isLoading = true;

      // Small delay for smooth transition
      setTimeout(() => {
        currentView = LearnView.LESSON_WORKSPACE;
        currentResults = null;
        isLoading = false;
      }, 200);
    }
  }

  function handlePictographSelected(pictograph: PictographData) {
    // Handle pictograph selection from codex (for reference during learning)
    console.log("Pictograph selected:", pictograph.letter);
  }

  function handleLessonComplete(results: LessonResults) {
    isLoading = true;

    // Small delay for smooth transition
    setTimeout(() => {
      currentResults = results;
      currentView = LearnView.LESSON_RESULTS;
      isLoading = false;
    }, 500); // Longer delay to show completion feedback
  }
</script>

<div class="learn-tab">
  <!-- Sub-tab Navigation -->
  <div class="sub-tab-nav">
    <button
      class="sub-tab-button"
      class:active={activeSubTab === "codex"}
      onclick={() => switchToSubTab("codex")}
    >
      📚 Codex
    </button>
    <button
      class="sub-tab-button"
      class:active={activeSubTab === "quiz"}
      onclick={() => switchToSubTab("quiz")}
    >
      🧠 Quiz
    </button>
  </div>

  <!-- Sub-tab Content with proper key-based transitions -->
  <div class="sub-tab-content">
    <!-- Loading Overlay -->
    {#if isLoading && activeSubTab === "quiz"}
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-text">
          {#if currentView === LearnView.LESSON_SELECTOR}
            Loading lessons...
          {:else if currentView === LearnView.LESSON_WORKSPACE}
            Starting lesson...
          {:else}
            Processing results...
          {/if}
        </p>
      </div>
    {/if}

    <!-- Keep CodexComponent alive but show/hide with CSS -->
    <div class="codex-container" class:hidden={activeSubTab !== "codex"}>
      <CodexComponent
        isVisible={activeSubTab === "codex"}
        onPictographSelected={handlePictographSelected}
      />
    </div>

    <!-- Sub-tab content with proper transitions for quiz only -->
    {#key activeSubTab}
      <div
        class="tab-content-wrapper"
        class:hidden={activeSubTab !== "quiz"}
        in:contentIn
        out:contentOut
      >
        {#if activeSubTab === "quiz"}
          <div class="quiz-container" class:loading={isLoading}>
            {#if currentView === LearnView.LESSON_SELECTOR}
              <div class="view-container" class:active={!isLoading}>
                <LessonSelectorView
                  bind:selectedMode
                  {availableLessons}
                  isLoading={false}
                  onLessonRequested={handleLessonRequested}
                  onModeChanged={handleModeChanged}
                />
              </div>
            {:else if currentView === LearnView.LESSON_WORKSPACE}
              <div class="view-container" class:active={!isLoading}>
                <LessonWorkspaceView
                  lessonType={currentLessonType}
                  quizMode={selectedMode}
                  onBackToSelector={handleBackToSelector}
                  onLessonComplete={handleLessonComplete}
                />
              </div>
            {:else if currentView === LearnView.LESSON_RESULTS}
              <div class="view-container" class:active={!isLoading}>
                <LessonResultsView
                  results={currentResults}
                  onBackToSelector={handleBackToSelector}
                  onRetryLesson={handleRetryLesson}
                />
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .learn-tab {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    background: transparent;
  }

  /* Sub-tab Navigation */
  .sub-tab-nav {
    display: flex;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0;
    margin: 0;
    flex-shrink: 0;
  }

  .sub-tab-button {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.7);
    padding: 1rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border-bottom: 3px solid transparent;
    position: relative;
  }

  .sub-tab-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
  }

  .sub-tab-button.active {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
    border-bottom-color: #667eea;
  }

  /* Sub-tab Content */
  .sub-tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    position: relative;
  }

  /* Hide inactive content while keeping it in DOM for caching */
  .hidden {
    display: none !important;
  }

  /* Content Containers */
  .codex-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    padding: 1rem;
  }

  .quiz-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    position: relative;
  }

  .quiz-container.loading {
    opacity: 0.3;
    pointer-events: none;
  }

  .view-container {
    width: 100%;
    height: 100%;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.4s ease-out;
  }

  .view-container.active {
    opacity: 1;
    transform: translateY(0);
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.3s ease-out;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-left: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-text {
    color: #ffffff;
    font-size: 1rem;
    font-weight: 500;
    margin: 0;
    text-align: center;
  }

  /* Animations */
  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* Responsive Design */
  @media (max-width: 640px) {
    .sub-tab-button {
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
    }

    .codex-container {
      padding: 0.5rem;
    }

    .loading-text {
      font-size: 0.875rem;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border-width: 3px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .sub-tab-button,
    .loading-overlay,
    .quiz-container,
    .view-container {
      transition: none;
      animation: none;
    }

    .loading-spinner {
      animation: none;
      border-left-color: transparent;
      border-top-color: #667eea;
    }
  }
</style>
