<!--
OptionGrid.svelte - Renders a grid of option cards

Single responsibility: Layout option cards in a responsive grid.
Handles fade transitions via CSS opacity.
Computes reversal indicators for options based on current sequence.
-->
<script lang="ts">
  import type { PreparedPictographData } from "../services/PictographPreparer";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import type { IReversalDetectionService, PictographWithReversals } from "$lib/features/create/shared/services/contracts/IReversalDetectionService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import OptionCard from "./OptionCard.svelte";

  interface Props {
    options: PictographData[];
    cardSize: number;
    columns: number;
    gap?: string;
    isFading?: boolean;
    onSelect: (option: PreparedPictographData) => void;
    // Sequence context for reversal detection
    currentSequence?: PictographData[];
  }

  const {
    options,
    cardSize,
    columns,
    gap = "8px",
    isFading = false,
    onSelect,
    currentSequence = [],
  }: Props = $props();

  // Get reversal detection service
  const reversalDetectionService = resolve(TYPES.IReversalDetectionService) as IReversalDetectionService;

  // Compute reversals for all options based on current sequence
  const optionsWithReversals = $derived(() => {
    return reversalDetectionService.detectReversalsForOptions(
      currentSequence,
      options
    );
  });
</script>

<div
  class="option-grid"
  style:gap
  style:opacity={isFading ? 0 : 1}
  style:grid-template-columns="repeat({columns}, {cardSize}px)"
>
  {#each optionsWithReversals() as option (option.id || `${option.letter}-${option.startPosition}-${option.endPosition}`)}
    <OptionCard
      pictograph={option as PreparedPictographData}
      size={cardSize}
      disabled={isFading}
      blueReversal={option.blueReversal || false}
      redReversal={option.redReversal || false}
      onSelect={(p) => onSelect(p)}
    />
  {/each}
</div>

<style>
  .option-grid {
    display: grid;
    justify-content: center;
    width: 100%;
    transition: opacity 250ms ease-out;
  }
</style>
