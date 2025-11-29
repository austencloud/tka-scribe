<!--
ConceptDetailView - Direct view of concept content
-->
<script lang="ts">
import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
import { resolve } from "$lib/shared/inversify";
import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { ConceptProgress, LearnConcept } from "../domain";
  import { conceptProgressService } from "../services/ConceptProgressService";
  import { GridConceptExperience } from "./interactive";
  import { PositionsConceptExperience } from "./interactive/positions";
  import { MotionsConceptExperience } from "./interactive/motions";
  import { VTGConceptExperience } from "./interactive/vtg";
  import { WordsConceptExperience } from "./interactive/words";
  import { StaffConceptExperience } from "./interactive/staff";
  import { Type1ConceptExperience } from "./interactive/letters/type1";

  let { concept, onClose } = $props<{
    concept: LearnConcept;
    onClose?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let progress = $state<ConceptProgress>(
    conceptProgressService.getConceptProgress(concept.id)
  );

  // Reference to the current experience component for back navigation
  let experienceComponent: { handleBack?: () => void } | null = $state(null);

  // Start the concept when detail view opens
  onMount(() => {
    if (progress.status === "available") {
      conceptProgressService.startConcept(concept.id);
    }

    // Subscribe to progress updates
    const unsubscribe = conceptProgressService.subscribe(() => {
      progress = conceptProgressService.getConceptProgress(concept.id);
    });

    return unsubscribe;
  });

  function handleClose() {
    hapticService?.trigger("selection");
    onClose?.();
  }

  function handleBackButton() {
    hapticService?.trigger("selection");
    // Try to navigate back within the experience first
    if (experienceComponent?.handleBack) {
      experienceComponent.handleBack();
    } else {
      // No experience or no back handler, just close
      onClose?.();
    }
  }

  function handlePracticeComplete() {
    conceptProgressService.recordPracticeAttempt(concept.id, true, 0);
    // After completing, go back to concept list
    handleClose();
  }

  // Check if this concept has interactive content
  function hasInteractiveContent(conceptId: string): boolean {
    return (
      conceptId === "grid" ||
      conceptId === "hand-positions" ||
      conceptId === "hand-motions" ||
      conceptId === "vtg-fundamentals" ||
      conceptId === "words-alpha-beta" ||
      conceptId === "staff-positions" ||
      conceptId === "type1-abc-ghi"
    );
  }
</script>

<div class="concept-detail">
  <!-- Simple back button -->
  <button
    class="back-button"
    onclick={handleBackButton}
    aria-label="Go back"
  >
    <span class="back-icon">‹</span>
    <span class="back-text">Back</span>
  </button>

  <!-- Content - key block forces full remount when concept changes -->
  <div class="concept-detail-content">
    {#key concept.id}
      {#if hasInteractiveContent(concept.id)}
        {#if concept.id === "grid"}
          <GridConceptExperience
            bind:this={experienceComponent}
            onComplete={handlePracticeComplete}
            onBack={handleClose}
          />
        {:else if concept.id === "hand-positions"}
        <PositionsConceptExperience onComplete={handlePracticeComplete} />
      {:else if concept.id === "hand-motions"}
        <MotionsConceptExperience onComplete={handlePracticeComplete} />
      {:else if concept.id === "vtg-fundamentals"}
        <VTGConceptExperience onComplete={handlePracticeComplete} />
      {:else if concept.id === "words-alpha-beta"}
        <WordsConceptExperience onComplete={handlePracticeComplete} />
      {:else if concept.id === "staff-positions"}
        <StaffConceptExperience onComplete={handlePracticeComplete} />
      {:else if concept.id === "type1-abc-ghi"}
        <Type1ConceptExperience onComplete={handlePracticeComplete} />
      {/if}
      {:else}
        <!-- Coming Soon placeholder -->
        <div class="coming-soon">
          <span class="coming-soon-icon">🚧</span>
          <h2 class="coming-soon-title">Interactive Content Coming Soon!</h2>
          <p class="coming-soon-text">
            We're building interactive experiences for this concept.
          </p>
        </div>
      {/if}
    {/key}
  </div>
</div>

<style>
  .concept-detail {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    background: var(--background, #000000);
    color: var(--foreground, #ffffff);
  }

  .back-button {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 100;

    display: flex;
    align-items: center;
    gap: 0.25rem;

    padding: 0.5rem 1rem;

    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;

    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    font-weight: 600;

    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateX(-2px);
  }

  .back-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .back-text {
    line-height: 1;
  }

  .concept-detail-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 3rem;
    text-align: center;
    height: 100%;
  }

  .coming-soon-icon {
    font-size: 4rem;
  }

  .coming-soon-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .coming-soon-text {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  @media (max-width: 768px) {
    .back-button {
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.375rem 0.75rem;
    }
  }
</style>
