<!--
PositionsConceptExperience - 4-page hand positions learning flow
Page 1: Alpha position (hands at opposite points)
Page 2: Beta position (hands at same point)
Page 3: Gamma position (hands at right angles)
Page 4: Interactive quiz
-->
<script lang="ts">
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import {
    ALPHA_EXAMPLES,
    BETA_EXAMPLES,
    GAMMA_EXAMPLES,
  } from "../../../domain/constants/positions-experience-data";
  import PositionPage from "./positions-experience/PositionPage.svelte";
  import PositionsQuizPage from "./positions-experience/PositionsQuizPage.svelte";

  let { onComplete } = $props<{
    onComplete?: () => void;
  }>();

  const hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);

  let currentPage = $state(1);
  const totalPages = 4;

  function handleNext() {
    hapticService?.trigger("selection");
    if (currentPage < totalPages) {
      currentPage++;
    } else {
      onComplete?.();
    }
  }

  function handleQuizComplete() {
    hapticService?.trigger("success");
    onComplete?.();
  }
</script>

<div class="positions-experience">
  {#if currentPage === 1}
    <PositionPage type="alpha" examples={ALPHA_EXAMPLES} onNext={handleNext} />
  {:else if currentPage === 2}
    <PositionPage type="beta" examples={BETA_EXAMPLES} onNext={handleNext} />
  {:else if currentPage === 3}
    <PositionPage
      type="gamma"
      examples={GAMMA_EXAMPLES}
      showSummary={true}
      onNext={handleNext}
    />
  {:else if currentPage === 4}
    <PositionsQuizPage onComplete={handleQuizComplete} />
  {/if}
</div>

<style>
  .positions-experience {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media (max-width: 600px) {
    .positions-experience {
      padding: 1rem;
    }
  }
</style>
