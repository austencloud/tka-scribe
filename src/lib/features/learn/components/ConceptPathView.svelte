<!--
ConceptPathView - Hero + mini-map focused learning experience

Shows:
- Progress mini-map with all concepts as dots
- Hero card for current/next concept
- Previous/next context
- Expandable "View all" section
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import {
    TKA_CONCEPTS,
    getConceptsByCategory,
    getNextConcept,
    getPreviousConcept,
  } from "../domain/concepts";
  import type { LearnConcept, ConceptCategory } from "../domain/types";
  import type { IConceptProgressService } from "../services/contracts/IConceptProgressService";
  import ProgressMiniMap from "./ProgressMiniMap.svelte";
  import HeroConceptCard from "./HeroConceptCard.svelte";
  import ConceptContext from "./ConceptContext.svelte";
  import ConceptCard from "./ConceptCard.svelte";
  import CategoryHeader from "./CategoryHeader.svelte";

  let { onConceptClick }: { onConceptClick?: (concept: LearnConcept) => void } =
    $props();

  // Resolve service via DI
  const conceptProgressService = resolve<IConceptProgressService>(
    TYPES.IConceptProgressService
  );

  // Progress state
  let progress = $state(conceptProgressService.getProgress());
  let showAllConcepts = $state(true); // Auto-expanded by default

  // Subscribe to progress updates
  onMount(() => {
    const unsubscribe = conceptProgressService.subscribe((newProgress) => {
      progress = newProgress;
    });
    return unsubscribe;
  });

  // Find the current concept (first non-completed, non-locked)
  // Always returns a concept since TKA_CONCEPTS is never empty
  const currentConcept = $derived((): LearnConcept => {
    // First, find any in-progress concept
    const inProgress = TKA_CONCEPTS.find(
      (c) => conceptProgressService.getConceptStatus(c.id) === "in-progress"
    );
    if (inProgress) return inProgress;

    // Otherwise, find first available concept
    const available = TKA_CONCEPTS.find(
      (c) => conceptProgressService.getConceptStatus(c.id) === "available"
    );
    if (available) return available;

    // If all completed, return last concept
    if (progress.completedConcepts.size === TKA_CONCEPTS.length) {
      return TKA_CONCEPTS[TKA_CONCEPTS.length - 1]!;
    }

    // Default to first concept (always exists)
    return TKA_CONCEPTS[0]!;
  });

  const currentConceptStatus = $derived(
    conceptProgressService.getConceptStatus(currentConcept().id)
  );

  // Previous and next for context
  const previousConcept = $derived(() => {
    const current = currentConcept();
    if (!current) return undefined;
    return getPreviousConcept(current.id);
  });

  const nextUpConcept = $derived(() => {
    const current = currentConcept();
    if (!current) return undefined;
    return getNextConcept(current.id);
  });

  // Categories for "View all" section
  const categories: ConceptCategory[] = [
    "foundation",
    "letters",
    "combinations",
    "advanced",
  ];

  function getCategoryProgress(category: ConceptCategory) {
    const concepts = getConceptsByCategory(category);
    const completed = concepts.filter((c) =>
      progress.completedConcepts.has(c.id)
    ).length;
    return { completed, total: concepts.length };
  }

  function handleConceptStart(concept: LearnConcept) {
    onConceptClick?.(concept);
  }

  function toggleShowAll() {
    showAllConcepts = !showAllConcepts;
  }

  // Check if journey is complete
  const isJourneyComplete = $derived(
    progress.completedConcepts.size === TKA_CONCEPTS.length
  );
</script>

<div class="concept-path">
  <!-- Progress Arc -->
  <ProgressMiniMap {progress} />

  <!-- Main content area -->
  <div class="main-content">
    {#if isJourneyComplete}
      <!-- Celebration state -->
      <div class="completion-celebration">
        <div class="celebration-icon">
          <i class="fa-solid fa-trophy"></i>
        </div>
        <h2>Level 1 Complete!</h2>
        <p>You've mastered all 28 concepts of The Kinetic Alphabet.</p>
        <button class="review-button" onclick={() => (showAllConcepts = true)}>
          <i class="fa-solid fa-rotate"></i>
          Review Concepts
        </button>
      </div>
    {:else}
      <!-- Hero Card -->
      <HeroConceptCard
        concept={currentConcept()}
        status={currentConceptStatus}
        onStart={handleConceptStart}
      />

      <!-- Journey position -->
      <ConceptContext
        previousConcept={previousConcept()}
        nextConcept={nextUpConcept()}
      />
    {/if}
  </div>

  <!-- View All Toggle -->
  <button class="view-all-toggle" onclick={toggleShowAll}>
    <span>{showAllConcepts ? "Hide learning path" : "View learning path"}</span>
    <i class="fa-solid {showAllConcepts ? 'fa-chevron-up' : 'fa-chevron-down'}"
    ></i>
  </button>

  <!-- Expandable All Concepts Path -->
  {#if showAllConcepts}
    <div class="all-concepts" transition:slide={{ duration: 300 }}>
      {#each categories as category, categoryIndex}
        {@const categoryProgress = getCategoryProgress(category)}
        {@const concepts = getConceptsByCategory(category)}

        <section class="category-section">
          <CategoryHeader
            {category}
            completedCount={categoryProgress.completed}
            totalCount={categoryProgress.total}
          />
          <div class="concept-list">
            {#each concepts as concept, i (concept.id)}
              {@const status = conceptProgressService.getConceptStatus(
                concept.id
              )}
              <div class="concept-item">
                {#if i > 0}
                  <div
                    class="connector-line"
                    class:completed={status === "completed"}
                  ></div>
                {/if}
                <ConceptCard {concept} {status} onClick={onConceptClick} />
              </div>
            {/each}
          </div>
        </section>

        {#if categoryIndex < categories.length - 1}
          <div class="category-connector">
            <div class="connector-arrow">
              <i class="fa-solid fa-chevron-down"></i>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/if}
</div>

<style>
  .concept-path {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    padding-bottom: 5rem;
    min-height: 100%;
    overflow-y: auto;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  .main-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  /* Completion celebration */
  .completion-celebration {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 2rem;
    background: linear-gradient(
      135deg,
      rgba(255, 215, 0, 0.1) 0%,
      rgba(255, 215, 0, 0.02) 100%
    );
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 16px;
  }

  .celebration-icon {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 215, 0, 0.15);
    border-radius: 50%;
    margin-bottom: 1.5rem;
  }

  .celebration-icon i {
    font-size: 2.5rem;
    color: #ffd700;
    text-shadow: 0 0 24px rgba(255, 215, 0, 0.5);
  }

  .completion-celebration h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #ffd700;
    margin: 0 0 0.5rem;
  }

  .completion-celebration p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 1.5rem;
  }

  .review-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.875rem 1.5rem;
    min-height: var(--min-touch-target);
    background: rgba(255, 215, 0, 0.15);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 10px;
    color: #ffd700;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .review-button:hover {
    background: rgba(255, 215, 0, 0.25);
  }

  /* View all toggle */
  .view-all-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.875rem 1rem;
    min-height: var(--min-touch-target);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-all-toggle:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
  }

  .view-all-toggle i {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }

  /* All concepts path */
  .all-concepts {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .category-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .concept-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding-left: 1rem;
  }

  .concept-item {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .connector-line {
    position: relative;
    width: 2px;
    height: 12px;
    margin-left: 17px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 1px;
  }

  .connector-line.completed {
    background: rgba(80, 200, 120, 0.4);
  }

  /* Connector between categories */
  .category-connector {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }

  .connector-arrow {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .view-all-toggle i,
    .review-button {
      transition: none;
    }
  }
</style>
