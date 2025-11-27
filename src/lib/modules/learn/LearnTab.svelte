<!--
Learn Tab - Master learning interface

Two learning destinations:
- Concepts: Progressive concept mastery path
- Play: Fun games to test your pictograph skills (with optional Letters Reference sidebar)

Navigation via bottom tabs (mobile-first UX pattern)
-->
<script lang="ts">
  import {
    navigationState,
    resolve,
    TYPES,
    type IHapticFeedbackService,
  } from "$shared";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import ConceptPathView from "./components/ConceptPathView.svelte";
  import ConceptDetailView from "./components/ConceptDetailView.svelte";
  import CodexComponent from "./codex/components/CodexComponent.svelte";
  import QuizTab from "./quiz/components/QuizTab.svelte";
  import type { LearnConcept } from "./domain";

  type LearnMode = "concepts" | "play";

  // Props
  let {
    onHeaderChange,
  }: {
    onHeaderChange?: (header: string) => void;
  } = $props();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Active mode synced with navigation state
  let activeMode = $state<LearnMode>("concepts");

  // Concept detail view state
  let selectedConcept = $state<LearnConcept | null>(null);

  // Codex sidebar state (only visible in Play mode)
  let isCodexOpen = $state(false);

  // Sync with navigation state (bottom nav controls this)
  $effect(() => {
    const navMode = navigationState.currentLearnMode;

    // Map legacy modes to new structure
    if (navMode === "codex" || navMode === "concepts") {
      activeMode = "concepts";
    } else if (navMode === "quiz" || navMode === "drills" || navMode === "play") {
      activeMode = "play";
    }
  });

  // Reset states when switching modes
  $effect(() => {
    const mode = activeMode; // Track dependency
    selectedConcept = null;
    // Close codex when leaving play mode
    if (mode !== "play") {
      isCodexOpen = false;
    }
  });

  // Effect: Update header when mode or selected concept changes
  $effect(() => {
    if (!onHeaderChange) return;

    let header = "";

    if (activeMode === "concepts") {
      if (selectedConcept) {
        header = selectedConcept.name || "Concept Details";
      } else {
        header = "Learning Path";
      }
    } else if (activeMode === "play") {
      header = "Play";
    }

    onHeaderChange(header);
  });

  // Initialize on mount
  onMount(async () => {
    // Set default mode if none persisted
    const navMode = navigationState.currentLearnMode;
    if (!navMode || navMode === "codex") {
      navigationState.setLearnMode("concepts");
    }
  });

  // Handle concept selection
  function handleConceptClick(concept: LearnConcept) {
    selectedConcept = concept;
  }

  // Handle back from detail view
  function handleBackToPath() {
    selectedConcept = null;
  }

  // Handle codex toggle (only in Play mode)
  function handleCodexToggle() {
    hapticService?.trigger("selection");
    isCodexOpen = !isCodexOpen;
  }

  // Check if mode is active
  function isModeActive(mode: LearnMode): boolean {
    return activeMode === mode;
  }
</script>

<div class="learn-tab">
  <!-- Content area with smooth transitions -->
  <div class="content-container" class:codex-open={isCodexOpen && activeMode === "play"}>
    {#key activeMode}
      <div class="mode-panel" transition:fade={{ duration: 200 }}>
        {#if isModeActive("concepts")}
          {#if selectedConcept}
            <ConceptDetailView
              concept={selectedConcept}
              onClose={handleBackToPath}
            />
          {:else}
            <ConceptPathView onConceptClick={handleConceptClick} />
          {/if}
        {:else if isModeActive("play")}
          <div class="play-layout" class:with-codex={isCodexOpen}>
            <!-- Quiz content -->
            <div class="quiz-container">
              <QuizTab />
            </div>

            <!-- Codex sidebar (inline, not overlay) - slides in from right -->
            {#if isCodexOpen}
              <aside class="codex-sidebar" transition:fly={{ x: 400, duration: 300, easing: cubicOut }}>
                <div class="codex-header">
                  <h3>Letters Reference</h3>
                  <button
                    class="close-codex-button"
                    onclick={handleCodexToggle}
                    aria-label="Close letters reference"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="codex-content">
                  <CodexComponent isVisible={isCodexOpen} />
                </div>
              </aside>
            {/if}
          </div>
        {/if}
      </div>
    {/key}
  </div>

  <!-- Floating Codex Button (only visible in Play mode) -->
  {#if activeMode === "play" && !isCodexOpen}
    <button
      class="floating-codex-button glass-surface"
      onclick={handleCodexToggle}
      aria-label="Open letters reference"
      title="Letters Reference"
      transition:fade={{ duration: 150 }}
    >
      <i class="fas fa-book-open"></i>
      <span class="button-label">Letters</span>
    </button>
  {/if}
</div>

<style>
  .learn-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
    container-type: size;
    container-name: learn-tab;
  }

  /* Content container */
  .content-container {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Mode panels */
  .mode-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Play mode layout - quiz + optional codex sidebar */
  .play-layout {
    display: flex;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .quiz-container {
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    transition: flex 300ms ease;
  }

  /* Codex sidebar */
  .codex-sidebar {
    width: 380px;
    max-width: 45%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: linear-gradient(
      180deg,
      rgba(25, 28, 35, 0.98) 0%,
      rgba(18, 20, 28, 0.99) 100%
    );
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    will-change: transform;
    flex-shrink: 0;
  }

  .codex-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .codex-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .close-codex-button {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 200ms ease;
  }

  .close-codex-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .codex-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* Floating Codex Button */
  .floating-codex-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 50;

    display: flex;
    align-items: center;
    gap: 0.5rem;

    min-width: 44px;
    min-height: 44px;
    padding: 0.75rem 1rem;

    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;

    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    font-weight: 600;

    cursor: pointer;
    transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);

    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  }

  .floating-codex-button i {
    font-size: 1.125rem;
    line-height: 1;
  }

  .floating-codex-button .button-label {
    line-height: 1;
  }

  .floating-codex-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 8px 24px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  }

  .floating-codex-button:active {
    transform: translateY(0) scale(0.98);
    transition-duration: 100ms;
  }

  .floating-codex-button:focus-visible {
    outline: 2px solid rgba(74, 158, 255, 1);
    outline-offset: 2px;
  }

  /* Mobile: codex takes full width as overlay */
  @container learn-tab (max-width: 700px) {
    .play-layout.with-codex {
      flex-direction: column;
    }

    .play-layout.with-codex .quiz-container {
      display: none;
    }

    .codex-sidebar {
      width: 100%;
      max-width: 100%;
      border-left: none;
    }

    .floating-codex-button {
      padding: 0.75rem;
    }

    .floating-codex-button .button-label {
      display: none;
    }
  }

  /* Desktop: side by side */
  @container learn-tab (min-width: 1000px) {
    .codex-sidebar {
      width: 450px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .floating-codex-button,
    .quiz-container,
    .close-codex-button {
      transition: none;
    }
  }
</style>
