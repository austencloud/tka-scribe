<!--
OptionPictograph.svelte - Unified pictograph renderer for option grids

SINGLE SOURCE OF TRUTH for option pictograph rendering.
Used by both desktop (OptionCardContent) and mobile (OptionPictographCell) hierarchies.

Props:
- pictograph: Pre-calculated pictograph data with positions
- blueReversal/redReversal: Reversal indicator states
- lightsOff: Dark mode state (controls background, grid, and glyph inversion)

This is a PRIMITIVE - it renders one pictograph as an SVG.
Layout/interaction logic lives in the parent components.
-->

<script lang="ts">
  import type { PreparedPictographData } from "./PreparedPictographData";
  import GridSvg from "$lib/shared/pictograph/grid/components/GridSvg.svelte";
  import PropSvg from "$lib/shared/pictograph/prop/components/PropSvg.svelte";
  import ArrowSvg from "$lib/shared/pictograph/arrow/rendering/components/ArrowSvg.svelte";
  import TKAGlyph from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";
  import ReversalIndicators from "$lib/shared/pictograph/shared/components/ReversalIndicators.svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IGridModeDeriver } from "$lib/shared/pictograph/grid/services/contracts/IGridModeDeriver";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

  // Props
  let {
    pictograph,
    blueReversal = false,
    redReversal = false,
    lightsOff = false,
  } = $props<{
    pictograph: PreparedPictographData;
    blueReversal?: boolean;
    redReversal?: boolean;
    lightsOff?: boolean;
  }>();

  // Derive grid mode from pre-calculated or motions
  const gridMode = $derived(
    (() => {
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
    })()
  );

  // Pre-calculated positions
  const arrowPositions = $derived(pictograph._prepared?.arrowPositions || {});
  const arrowAssets = $derived(pictograph._prepared?.arrowAssets || {});
  const arrowMirroring = $derived(pictograph._prepared?.arrowMirroring || {});
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

<svg
  width="100%"
  height="100%"
  viewBox="0 0 950 950"
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label="Pictograph Option"
>
  <!-- Background -->
  <rect width="950" height="950" fill={lightsOff ? "#0a0a0f" : "white"} />

  <!-- Grid -->
  <GridSvg
    {gridMode}
    showNonRadialPoints={false}
    ledMode={lightsOff}
    onLoaded={() => {}}
    onError={() => {}}
  />

  <!-- Props -->
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

  <!-- Arrows -->
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

  <!-- TKA Glyph -->
  {#if pictograph.letter}
    <TKAGlyph
      letter={pictograph.letter}
      pictographData={pictograph}
      visible={true}
      previewMode={false}
      ledMode={lightsOff}
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
