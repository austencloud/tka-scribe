<!--
OptionCardContent.svelte - Renders pictograph SVG content

Single responsibility: Render the visual content of an option card.
Uses pre-calculated positions for arrows and props.
-->
<script lang="ts">
  import type { PreparedPictographData } from "../services/PictographPreparer";
  import GridSvg from "$lib/shared/pictograph/grid/components/GridSvg.svelte";
  import PropSvg from "$lib/shared/pictograph/prop/components/PropSvg.svelte";
  import ArrowSvg from "$lib/shared/pictograph/arrow/rendering/components/ArrowSvg.svelte";
  import TKAGlyph from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";
  import ReversalIndicators from "$lib/shared/pictograph/shared/components/ReversalIndicators.svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  interface Props {
    pictograph: PreparedPictographData;
    blueReversal?: boolean;
    redReversal?: boolean;
  }

  const {
    pictograph,
    blueReversal = false,
    redReversal = false,
  }: Props = $props();

  // Derive grid mode
  const gridMode = $derived(() => {
    if (pictograph._prepared?.gridMode) {
      return pictograph._prepared.gridMode;
    }
    if (!pictograph.motions?.blue || !pictograph.motions?.red) {
      return GridMode.DIAMOND;
    }
    try {
      const service = resolve<IGridModeDeriver>(TYPES.IGridModeDeriver);
      return service.deriveGridMode(
        pictograph.motions.blue,
        pictograph.motions.red
      );
    } catch {
      return GridMode.DIAMOND;
    }
  });

  // Pre-calculated positions
  const arrowPositions = $derived(
    pictograph._prepared?.arrowPositions || {}
  );
  const arrowAssets = $derived(pictograph._prepared?.arrowAssets || {});
  const arrowMirroring = $derived(
    pictograph._prepared?.arrowMirroring || {}
  );
  const propPositions = $derived(pictograph._prepared?.propPositions || {});
  const propAssets = $derived(pictograph._prepared?.propAssets || {});

  // Motions to render
  const motions = $derived(() => {
    if (!pictograph.motions) return [];
    return Object.entries(pictograph.motions)
      .filter((entry): entry is [string, any] => entry[1] !== undefined)
      .map(([color, data]) => ({ color: color as "blue" | "red", data }));
  });
</script>

<div class="option-card-content">
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 950 950"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Pictograph Option"
  >
    <rect width="950" height="950" fill="white" />

    <GridSvg
      gridMode={gridMode()}
      showNonRadialPoints={false}
      onLoaded={() => {}}
      onError={() => {}}
    />

    {#each motions() as { color, data } (color)}
      {#if propAssets[color] && propPositions[color]}
        <PropSvg
          motionData={data}
          propAssets={propAssets[color]}
          propPosition={propPositions[color]}
          showProp={true}
        />
      {/if}
    {/each}

    {#each motions() as { color, data } (color)}
      {#if arrowAssets[color] && arrowPositions[color]}
        <ArrowSvg
          motionData={data}
          {color}
          pictographData={pictograph}
          arrowAssets={arrowAssets[color]}
          arrowPosition={arrowPositions[color]}
          shouldMirror={arrowMirroring[color] || false}
          showArrow={true}
          isClickable={false}
        />
      {/if}
    {/each}

    {#if pictograph.letter}
      <TKAGlyph
        letter={pictograph.letter}
        pictographData={pictograph}
        visible={true}
        previewMode={false}
      />
    {/if}

    <ReversalIndicators
      {blueReversal}
      {redReversal}
      hasValidData={true}
      visible={true}
      previewMode={false}
    />
  </svg>
</div>

<style>
  .option-card-content {
    width: 100%;
    height: 100%;
    display: block;
  }

  svg {
    display: block;
  }
</style>
