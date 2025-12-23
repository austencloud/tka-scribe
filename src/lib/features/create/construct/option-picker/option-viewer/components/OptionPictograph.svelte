<!--
OptionPictograph.svelte - Lightweight pictograph renderer for option grids

DESIGN PHILOSOPHY:
- Pure rendering component (no async, no loading states, no lifecycle)
- Expects pre-calculated positions passed as props
- Single responsibility: render a static pictograph for option selection
- Optimized for batch rendering in grids (16+ pictographs at once)

This is a PRIMITIVE - it does ONE thing simply.
For full-featured pictographs (animation, editing, etc), use Pictograph.svelte
-->

<script lang="ts">
  import type { PreparedPictographData } from "../utils/pictograph-batch-preparer";
  import GridSvg from "$lib/shared/pictograph/grid/components/GridSvg.svelte";
  import PropSvg from "$lib/shared/pictograph/prop/components/PropSvg.svelte";
  import ArrowSvg from "$lib/shared/pictograph/arrow/rendering/components/ArrowSvg.svelte";
  import TKAGlyph from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";
  import ReversalIndicators from "$lib/shared/pictograph/shared/components/ReversalIndicators.svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { onMount } from "svelte";

  // Props
  let {
    pictographData,
    blueReversal = false,
    redReversal = false,
  } = $props<{
    pictographData: PreparedPictographData;
    blueReversal?: boolean;
    redReversal?: boolean;
  }>();

  // Debug: Log when component mounts/updates
  onMount(() => {
    console.log(
      `🎨 [OptionPictograph] MOUNTED ${pictographData.letter || "no-letter"} (id: ${pictographData.id})`
    );
    return () => {
      console.log(
        `💀 [OptionPictograph] UNMOUNTED ${pictographData.letter || "no-letter"} (id: ${pictographData.id})`
      );
    };
  });

  $effect(() => {
    console.log(
      `♻️ [OptionPictograph] UPDATED ${pictographData.letter || "no-letter"} (id: ${pictographData.id})`
    );
  });

  // Derive grid mode from motions
  const gridMode = $derived(
    (() => {
      // Use pre-calculated if available
      if (pictographData._prepared?.gridMode) {
        return pictographData._prepared.gridMode;
      }

      // Otherwise derive it
      if (!pictographData.motions?.blue || !pictographData.motions?.red) {
        return GridMode.DIAMOND;
      }

      try {
        const gridModeService = resolve<IGridModeDeriver>(
          TYPES.IGridModeDeriver
        );
        return gridModeService.deriveGridMode(
          pictographData.motions.blue,
          pictographData.motions.red
        );
      } catch {
        return GridMode.DIAMOND;
      }
    })()
  );

  // Use pre-calculated positions or empty objects
  const arrowPositions = $derived(
    pictographData._prepared?.arrowPositions || {}
  );
  const arrowAssets = $derived(pictographData._prepared?.arrowAssets || {});
  const arrowMirroring = $derived(
    pictographData._prepared?.arrowMirroring || {}
  );
  const propPositions = $derived(pictographData._prepared?.propPositions || {});
  const propAssets = $derived(pictographData._prepared?.propAssets || {});

  // Filter motions to render
  const motionsToRender = $derived(() => {
    if (!pictographData.motions) return [];

    return Object.entries(pictographData.motions)
      .filter((entry): entry is [string, any] => entry[1] !== undefined)
      .map(([color, motionData]) => ({
        color: color as "blue" | "red",
        motionData,
      }));
  });

  // Standard viewBox
  const viewBox = "0 0 950 950";
</script>

<div class="option-pictograph">
  <svg
    width="100%"
    height="100%"
    {viewBox}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Pictograph Option"
  >
    <!-- White background -->
    <rect width="950" height="950" fill="white" />

    <!-- Grid (static, non-interactive) -->
    <GridSvg
      {gridMode}
      showNonRadialPoints={false}
      onLoaded={() => {}}
      onError={() => {}}
    />

    <!-- Props (pre-calculated positions) -->
    {#each motionsToRender() as { color, motionData } (color)}
      {#if propAssets[color] && propPositions[color]}
        <PropSvg
          {motionData}
          propAssets={propAssets[color]}
          propPosition={propPositions[color]}
          showProp={true}
        />
      {/if}
    {/each}

    <!-- Arrows (pre-calculated positions) -->
    {#each motionsToRender() as { color, motionData } (color)}
      {#if arrowAssets[color] && arrowPositions[color]}
        <ArrowSvg
          {motionData}
          {color}
          {pictographData}
          arrowAssets={arrowAssets[color]}
          arrowPosition={arrowPositions[color]}
          shouldMirror={arrowMirroring[color] || false}
          showArrow={true}
          isClickable={false}
        />
      {/if}
    {/each}

    <!-- TKA Glyph (always visible for options) -->
    {#if pictographData.letter}
      <TKAGlyph
        letter={pictographData.letter}
        {pictographData}
        visible={true}
        previewMode={false}
      />
    {/if}

    <!-- Reversal indicators -->
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
  .option-pictograph {
    width: 100%;
    height: 100%;
    display: block;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  svg {
    display: block;
    box-sizing: border-box;
  }
</style>
