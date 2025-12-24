<!--
OptionGrid.svelte - Renders a grid of option cards

Single responsibility: Layout option cards in a responsive grid.
Handles fade transitions via CSS opacity.
-->
<script lang="ts">
  import type { PreparedPictographData } from "../services/PictographPreparer";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import OptionCard from "./OptionCard.svelte";

  interface Props {
    options: PictographData[];
    cardSize: number;
    columns: number;
    gap?: string;
    isFading?: boolean;
    onSelect: (option: PreparedPictographData) => void;
  }

  const {
    options,
    cardSize,
    columns: _columns, // kept for API compatibility
    gap = "8px",
    isFading = false,
    onSelect,
  }: Props = $props();
</script>

<div
  class="option-grid"
  style:gap
  style:opacity={isFading ? 0 : 1}
>
  {#each options as option (option.id || `${option.letter}-${option.startPosition}-${option.endPosition}`)}
    <OptionCard
      pictograph={option as PreparedPictographData}
      size={cardSize}
      disabled={isFading}
      blueReversal={(option as any).blueReversal || false}
      redReversal={(option as any).redReversal || false}
      onSelect={(p) => onSelect(p)}
    />
  {/each}
</div>

<style>
  .option-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    transition: opacity 250ms ease-out;
  }
</style>
