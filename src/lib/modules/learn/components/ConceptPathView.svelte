<!--
ConceptPathView - Simplified learning path display

Shows:
- Progress header at top
- Category sections (always expanded)
- Compact concept cards
- Simple completion banner
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    getConceptsByCategory,
    type LearnConcept,
    type ConceptCategory,
  } from "../domain";
  import { conceptProgressService } from "../services/ConceptProgressService";
  import ConceptCard from "./ConceptCard.svelte";
  import CategoryHeader from "./CategoryHeader.svelte";
  import ProgressHeader from "./ProgressHeader.svelte";

  let { onConceptClick }: { onConceptClick?: (concept: LearnConcept) => void } =
    $props();

  // Progress state
  let progress = $state(conceptProgressService.getProgress());

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
</script>

<div class="concept-path">
  <ProgressHeader {progress} />

  <div class="categories">
    {#each categories as category}
      {@const categoryProgress = getCategoryProgress(category)}
      {@const concepts = getConceptsByCategory(category)}

      <section class="category-section">
        <CategoryHeader
          {category}
          completedCount={categoryProgress.completed}
          totalCount={categoryProgress.total}
        />
        <div class="concept-list">
          {#each concepts as concept (concept.id)}
            {@const status = conceptProgressService.getConceptStatus(
              concept.id
            )}
            <ConceptCard {concept} {status} onClick={onConceptClick} />
          {/each}
        </div>
      </section>
    {/each}
  </div>

  {#if progress.overallProgress >= 100}
    <div class="complete-banner">Level 1 Complete!</div>
  {/if}
</div>

<style>
  .concept-path {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    padding-bottom: 5rem;
    background: rgb(20, 20, 28);
    min-height: 100%;
  }

  .categories {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .category-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .concept-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.5rem;
  }

  .complete-banner {
    padding: 12px 16px;
    background: rgba(80, 200, 120, 0.1);
    border: 1px solid rgba(80, 200, 120, 0.2);
    border-radius: 8px;
    text-align: center;
    color: #50c878;
    font-weight: 600;
  }
</style>
