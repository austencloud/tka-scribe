<!--
WordsConceptExperience - Multi-page lesson on TKA word formation
Orchestrator component that manages page navigation and state
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  import WordsProgressIndicator from "./components/WordsProgressIndicator.svelte";
  import WordsIntroPage from "./pages/WordsIntroPage.svelte";
  import AlphaBetaPage from "./pages/AlphaBetaPage.svelte";
  import AABBDemoPage from "./pages/AABBDemoPage.svelte";
  import MorePatternsPage from "./pages/MorePatternsPage.svelte";
  import QuizPage from "./pages/QuizPage.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  let currentPage = $state(1);
  const totalPages = 5;

  // Animation state for demos
  let aabbBeatIndex = $state(0);
  let ggggBeatIndex = $state(0);
  let ccccBeatIndex = $state(0);
  let isAnimating = $state(false);

  function handleNext() {
    hapticService?.trigger("selection");
    if (currentPage < totalPages) {
      currentPage++;
      resetAnimationState();
    } else {
      onComplete?.();
    }
  }

  function handlePrevious() {
    hapticService?.trigger("selection");
    if (currentPage > 1) {
      currentPage--;
    }
  }

  function handleQuizComplete() {
    hapticService?.trigger("success");
    onComplete?.();
  }

  function toggleAnimation() {
    isAnimating = !isAnimating;
    hapticService?.trigger("selection");
  }

  function resetAnimationState() {
    isAnimating = false;
    aabbBeatIndex = 0;
    ggggBeatIndex = 0;
    ccccBeatIndex = 0;
  }
</script>

<div class="words-experience">
  {#if currentPage === 1}
    <WordsIntroPage onNext={handleNext} />
  {:else if currentPage === 2}
    <AlphaBetaPage onBack={handlePrevious} onNext={handleNext} />
  {:else if currentPage === 3}
    <AABBDemoPage
      {isAnimating}
      beatIndex={aabbBeatIndex}
      onBack={handlePrevious}
      onNext={handleNext}
      onToggleAnimation={toggleAnimation}
      onBeatChange={(i) => (aabbBeatIndex = i)}
    />
  {:else if currentPage === 4}
    <MorePatternsPage
      {ggggBeatIndex}
      {ccccBeatIndex}
      onBack={handlePrevious}
      onNext={handleNext}
      onGGGGBeatChange={(i) => (ggggBeatIndex = i)}
      onCCCCBeatChange={(i) => (ccccBeatIndex = i)}
    />
  {:else if currentPage === 5}
    <QuizPage onComplete={handleQuizComplete} />
  {/if}

  <WordsProgressIndicator {currentPage} {totalPages} />
</div>

<style>
  .words-experience {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
    position: relative;
  }

  @media (max-width: 600px) {
    .words-experience {
      padding: 1rem;
    }
  }
</style>
