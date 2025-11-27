<!--
ConceptPathView - Modern learning path display

Shows all TKA concepts in an engaging, journey-style layout:
- Hero progress section at top
- Collapsible category sections with progress
- Connected concept cards showing learning progression
- Celebration/motivational states
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { slide, fade } from "svelte/transition";
  import {
    TKA_CONCEPTS,
    CONCEPT_CATEGORIES,
    getConceptsByCategory,
    type LearnConcept,
    type ConceptCategory,
  } from "../domain";
  import { conceptProgressService } from "../services/ConceptProgressService";
  import ConceptCard from "./ConceptCard.svelte";
  import CategoryHeader from "./CategoryHeader.svelte";
  import ProgressHeader from "./ProgressHeader.svelte";

  let { onConceptClick } = $props<{
    onConceptClick?: (concept: LearnConcept) => void;
  }>();

  // Progress state
  let progress = $state(conceptProgressService.getProgress());

  // Expanded categories state (all expanded by default)
  let expandedCategories = $state<Record<ConceptCategory, boolean>>({
    foundation: true,
    letters: true,
    combinations: true,
    advanced: true,
  });

  // Subscribe to progress updates
  onMount(() => {
    const unsubscribe = conceptProgressService.subscribe((newProgress) => {
      progress = newProgress;
    });

    return unsubscribe;
  });

  // Categories in order
  const categories: ConceptCategory[] = [
    "foundation",
    "letters",
    "combinations",
    "advanced",
  ];

  // Get completed count for a category
  function getCategoryProgress(category: ConceptCategory): {
    completed: number;
    total: number;
  } {
    const concepts = getConceptsByCategory(category);
    const completed = concepts.filter((c) =>
      progress.completedConcepts.has(c.id)
    ).length;
    return { completed, total: concepts.length };
  }

  // Toggle category expansion
  function toggleCategory(category: ConceptCategory) {
    expandedCategories[category] = !expandedCategories[category];
  }

  // Get the "next up" concept for display
  const nextConcept = $derived(() => {
    for (const concept of TKA_CONCEPTS) {
      const status = conceptProgressService.getConceptStatus(concept.id);
      if (status === "available" || status === "in-progress") {
        return concept;
      }
    }
    return null;
  });
</script>

<div class="concept-path">
  <!-- Hero Progress Section -->
  <div class="hero-section" in:fade={{ duration: 300 }}>
    <ProgressHeader {progress} />

    <!-- Next up indicator -->
    {#if nextConcept() && progress.overallProgress < 100}
      <div class="next-up-card" in:fade={{ duration: 300, delay: 150 }}>
        <div class="next-up-label">
          <span class="next-up-icon">▶</span>
          <span>Continue Learning</span>
        </div>
        <button
          class="next-up-action"
          onclick={() => nextConcept() && onConceptClick?.(nextConcept()!)}
        >
          <span class="next-up-name">{nextConcept()?.shortName}</span>
          <svg
            class="next-up-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </button>
      </div>
    {/if}
  </div>

  <!-- Category Sections -->
  <div class="categories-container">
    {#each categories as category, categoryIndex}
      {@const categoryProgress = getCategoryProgress(category)}
      {@const concepts = getConceptsByCategory(category)}
      {@const isExpanded = expandedCategories[category]}

      <section
        class="category-section"
        data-category={category}
        in:fade={{ duration: 300, delay: 100 + categoryIndex * 50 }}
      >
        <!-- Category header with progress -->
        <CategoryHeader
          {category}
          completedCount={categoryProgress.completed}
          totalCount={categoryProgress.total}
          expanded={isExpanded}
          onToggle={() => toggleCategory(category)}
        />

        <!-- Concept cards (collapsible) -->
        {#if isExpanded}
          <div class="concept-list" transition:slide={{ duration: 250 }}>
            {#each concepts as concept, index (concept.id)}
              {@const status = conceptProgressService.getConceptStatus(
                concept.id
              )}
              {@const conceptProgress =
                conceptProgressService.getConceptProgress(concept.id)}
              {@const showConnector = index > 0}

              <ConceptCard
                {concept}
                {status}
                progress={conceptProgress}
                onClick={onConceptClick}
                {showConnector}
              />
            {/each}
          </div>
        {/if}
      </section>
    {/each}
  </div>

  <!-- Bottom state (completion or motivation) -->
  <div class="path-footer">
    {#if progress.overallProgress >= 100}
      <div class="completion-celebration" in:fade={{ duration: 400 }}>
        <div class="celebration-glow"></div>
        <div class="celebration-content">
          <div class="trophy-container">
            <span class="trophy-icon">🏆</span>
            <div class="sparkles">
              <span class="sparkle">✨</span>
              <span class="sparkle">✨</span>
              <span class="sparkle">✨</span>
            </div>
          </div>
          <h3 class="celebration-title">Master of The Kinetic Alphabet!</h3>
          <p class="celebration-text">
            You've completed the entire Level 1 curriculum. Your dedication has
            paid off. Keep practicing to maintain your skills and explore
            advanced techniques!
          </p>
          <div class="celebration-stats">
            <div class="stat">
              <span class="stat-value">28</span>
              <span class="stat-label">Concepts Mastered</span>
            </div>
            <div class="stat">
              <span class="stat-value">{progress.badges.length}</span>
              <span class="stat-label">Badges Earned</span>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="journey-footer" in:fade={{ duration: 300 }}>
        <div class="journey-progress-visual">
          <div class="progress-dots">
            {#each Array(4) as _, i}
              <div
                class="progress-dot"
                class:active={progress.overallProgress >= (i + 1) * 25}
                class:current={progress.overallProgress >= i * 25 &&
                  progress.overallProgress < (i + 1) * 25}
              ></div>
            {/each}
          </div>
          <div class="progress-line">
            <div
              class="progress-fill"
              style="width: {progress.overallProgress}%"
            ></div>
          </div>
        </div>
        <p class="journey-message">
          <span class="journey-emoji">🌟</span>
          {#if progress.overallProgress === 0}
            Your journey begins with a single step
          {:else if progress.overallProgress < 25}
            Building the foundation of mastery
          {:else if progress.overallProgress < 50}
            You're making excellent progress!
          {:else if progress.overallProgress < 75}
            Over halfway to becoming a TKA master
          {:else}
            The finish line is in sight!
          {/if}
        </p>
        <p class="concepts-remaining">
          {28 - progress.completedConcepts.size} concepts remaining
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .concept-path {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.25rem;
    max-width: 720px;
    margin: 0 auto;
    width: 100%;
    padding-bottom: 6rem; /* Space for bottom nav */
  }

  /* Hero section */
  .hero-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /* Next up card */
  .next-up-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.875rem 1rem;
    background: linear-gradient(
      135deg,
      rgba(74, 144, 226, 0.1) 0%,
      rgba(123, 104, 238, 0.08) 100%
    );
    border: 1px solid rgba(74, 144, 226, 0.2);
    border-radius: 14px;
    backdrop-filter: blur(8px);
  }

  .next-up-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.6);
  }

  .next-up-icon {
    color: #4a90e2;
    font-size: 0.625rem;
  }

  .next-up-action {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: linear-gradient(135deg, #4a90e2, #7b68ee);
    border: none;
    border-radius: 10px;
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .next-up-action:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 16px rgba(74, 144, 226, 0.4);
  }

  .next-up-arrow {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }

  .next-up-action:hover .next-up-arrow {
    transform: translateX(2px);
  }

  /* Categories container */
  .categories-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Category section */
  .category-section {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }

  /* Concept list */
  .concept-list {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    padding-left: 0.5rem;
  }

  /* Path footer */
  .path-footer {
    margin-top: 1rem;
  }

  /* Journey footer (non-complete state) */
  .journey-footer {
    text-align: center;
    padding: 1.5rem;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
  }

  .journey-progress-visual {
    position: relative;
    margin-bottom: 1rem;
  }

  .progress-dots {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 1;
    padding: 0 2px;
  }

  .progress-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
  }

  .progress-dot.active {
    background: linear-gradient(135deg, #50c878, #7be495);
    border-color: #50c878;
    box-shadow: 0 0 8px rgba(80, 200, 120, 0.5);
  }

  .progress-dot.current {
    background: linear-gradient(135deg, #4a90e2, #7b68ee);
    border-color: #4a90e2;
    box-shadow: 0 0 8px rgba(74, 144, 226, 0.5);
    animation: currentPulse 2s ease-in-out infinite;
  }

  @keyframes currentPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  .progress-line {
    position: absolute;
    top: 50%;
    left: 6px;
    right: 6px;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    transform: translateY(-50%);
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #50c878, #4a90e2, #7b68ee);
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .journey-message {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 0.5rem 0;
    font-weight: 500;
  }

  .journey-emoji {
    margin-right: 0.375rem;
  }

  .concepts-remaining {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
  }

  /* Completion celebration */
  .completion-celebration {
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(80, 200, 120, 0.15) 0%,
      rgba(74, 144, 226, 0.1) 50%,
      rgba(123, 104, 238, 0.1) 100%
    );
    border: 2px solid rgba(80, 200, 120, 0.3);
    border-radius: 20px;
    padding: 2rem;
  }

  .celebration-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
      ellipse at center,
      rgba(255, 215, 0, 0.1) 0%,
      transparent 50%
    );
    animation: celebrationRotate 10s linear infinite;
  }

  @keyframes celebrationRotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .celebration-content {
    position: relative;
    z-index: 1;
    text-align: center;
  }

  .trophy-container {
    position: relative;
    display: inline-block;
    margin-bottom: 1rem;
  }

  .trophy-icon {
    font-size: 4rem;
    display: block;
    animation: trophyBounce 2s ease-in-out infinite;
  }

  @keyframes trophyBounce {
    0%,
    100% {
      transform: translateY(0) rotate(-5deg);
    }
    50% {
      transform: translateY(-8px) rotate(5deg);
    }
  }

  .sparkles {
    position: absolute;
    inset: -20px;
    pointer-events: none;
  }

  .sparkle {
    position: absolute;
    font-size: 1.25rem;
    animation: sparkle 1.5s ease-in-out infinite;
  }

  .sparkle:nth-child(1) {
    top: 0;
    left: 20%;
    animation-delay: 0s;
  }

  .sparkle:nth-child(2) {
    top: 30%;
    right: 0;
    animation-delay: 0.5s;
  }

  .sparkle:nth-child(3) {
    bottom: 0;
    left: 50%;
    animation-delay: 1s;
  }

  @keyframes sparkle {
    0%,
    100% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1);
    }
  }

  .celebration-title {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
    margin: 0 0 0.75rem 0;
    background: linear-gradient(135deg, #ffd700, #ffec8b);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .celebration-text {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 1.5rem 0;
    line-height: 1.6;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }

  .celebration-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
  }

  .celebration-stats .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .celebration-stats .stat-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
  }

  .celebration-stats .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .concept-path {
      gap: 1.25rem;
      padding: 1rem;
    }

    .hero-section {
      gap: 0.875rem;
    }

    .next-up-card {
      flex-direction: column;
      align-items: stretch;
      gap: 0.75rem;
      padding: 0.75rem;
    }

    .next-up-action {
      justify-content: center;
    }

    .categories-container {
      gap: 1.25rem;
    }

    .category-section {
      gap: 0.75rem;
    }

    .concept-list {
      gap: 0.5rem;
      padding-left: 0.375rem;
    }

    .journey-footer {
      padding: 1.25rem;
    }

    .journey-message {
      font-size: 0.9375rem;
    }

    .completion-celebration {
      padding: 1.5rem;
    }

    .trophy-icon {
      font-size: 3rem;
    }

    .celebration-title {
      font-size: 1.25rem;
    }

    .celebration-text {
      font-size: 0.875rem;
    }

    .celebration-stats {
      gap: 1.5rem;
    }

    .celebration-stats .stat-value {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .concept-path {
      gap: 1rem;
      padding: 0.75rem;
      padding-bottom: 5rem;
    }

    .next-up-label {
      font-size: 0.6875rem;
    }

    .next-up-action {
      font-size: 0.8125rem;
      padding: 0.5rem 0.75rem;
    }

    .categories-container {
      gap: 1rem;
    }

    .concept-list {
      gap: 0.5rem;
      padding-left: 0.25rem;
    }

    .journey-footer {
      padding: 1rem;
      border-radius: 12px;
    }

    .progress-dot {
      width: 10px;
      height: 10px;
    }

    .journey-message {
      font-size: 0.875rem;
    }

    .concepts-remaining {
      font-size: 0.75rem;
    }

    .completion-celebration {
      padding: 1.25rem;
      border-radius: 16px;
    }

    .trophy-icon {
      font-size: 2.5rem;
    }

    .celebration-title {
      font-size: 1.125rem;
    }

    .celebration-text {
      font-size: 0.8125rem;
    }

    .celebration-stats {
      gap: 1rem;
    }

    .celebration-stats .stat-value {
      font-size: 1.25rem;
    }

    .celebration-stats .stat-label {
      font-size: 0.6875rem;
    }
  }

  /* Smooth scrolling */
  @media (prefers-reduced-motion: no-preference) {
    .concept-path {
      scroll-behavior: smooth;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .progress-dot.current,
    .trophy-icon,
    .sparkle,
    .celebration-glow {
      animation: none;
    }
  }
</style>
