<!--
  ThumbnailPictograph - Lightweight Pictograph for Gallery Thumbnails

  Key differences from full Pictograph.svelte:
  - No createPictographState() - receives pre-computed data
  - No service resolution per instance
  - No $effect subscriptions
  - No transitions/animations
  - Static SVG rendering only

  ~80 lines vs 764 lines in full Pictograph
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { ThumbnailRenderConfig, ComputedPosition, ComputedAssets } from "./thumbnail-types";
  import ThumbnailGrid from "./ThumbnailGrid.svelte";
  import TKAGlyph from "$lib/shared/pictograph/tka-glyph/components/TKAGlyph.svelte";

  let {
    beatData,
    gridMode = GridMode.DIAMOND,
    renderConfig,
    blueProps = null,
    redProps = null,
    blueArrow = null,
    redArrow = null,
    size = 100,
  } = $props<{
    beatData: BeatData | null;
    gridMode?: GridMode;
    renderConfig: ThumbnailRenderConfig;
    blueProps?: { position: ComputedPosition; assets: ComputedAssets } | null;
    redProps?: { position: ComputedPosition; assets: ComputedAssets } | null;
    blueArrow?: { position: ComputedPosition; assets: ComputedAssets; shouldMirror?: boolean } | null;
    redArrow?: { position: ComputedPosition; assets: ComputedAssets; shouldMirror?: boolean } | null;
    size?: number;
  }>();

  // Standard viewBox for pictograph (matches full Pictograph.svelte)
  const viewBox = "0 0 950 950";

  // Get letter from beat data for TKA glyph
  const letter = $derived(beatData?.letter ?? null);
</script>

<div class="thumbnail-pictograph" style="width: {size}px; height: {size}px;">
  <svg
    width="100%"
    height="100%"
    {viewBox}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Beat pictograph"
  >
    <!-- White background -->
    <rect width="950" height="950" fill="white" />

    <!-- Grid (simplified - no rotation animation) -->
    <ThumbnailGrid
      {gridMode}
      showNonRadialPoints={renderConfig.showNonRadialPoints}
    />

    <!-- Props (rendered first so arrows appear on top) -->
    {#if blueProps}
      <g
        class="prop-svg blue-prop-svg"
        style="transform: translate({blueProps.position.x}px, {blueProps.position.y}px)
                         rotate({blueProps.position.rotation}deg)
                         translate({-blueProps.assets.center.x}px, {-blueProps.assets.center.y}px);"
      >
        {@html blueProps.assets.imageSrc}
      </g>
    {/if}

    {#if redProps}
      <g
        class="prop-svg red-prop-svg"
        style="transform: translate({redProps.position.x}px, {redProps.position.y}px)
                         rotate({redProps.position.rotation}deg)
                         translate({-redProps.assets.center.x}px, {-redProps.assets.center.y}px);"
      >
        {@html redProps.assets.imageSrc}
      </g>
    {/if}

    <!-- Arrows -->
    {#if blueArrow}
      <g
        class="arrow-svg blue-arrow-svg"
        style="transform: translate({blueArrow.position.x}px, {blueArrow.position.y}px)
                         rotate({blueArrow.position.rotation}deg)
                         {blueArrow.shouldMirror ? 'scale(-1, 1)' : ''};"
      >
        <g transform="translate({-blueArrow.assets.center.x}, {-blueArrow.assets.center.y})">
          {@html blueArrow.assets.imageSrc}
        </g>
      </g>
    {/if}

    {#if redArrow}
      <g
        class="arrow-svg red-arrow-svg"
        style="transform: translate({redArrow.position.x}px, {redArrow.position.y}px)
                         rotate({redArrow.position.rotation}deg)
                         {redArrow.shouldMirror ? 'scale(-1, 1)' : ''};"
      >
        <g transform="translate({-redArrow.assets.center.x}, {-redArrow.assets.center.y})">
          {@html redArrow.assets.imageSrc}
        </g>
      </g>
    {/if}

    <!-- TKA Glyph (if enabled and letter exists) -->
    {#if renderConfig.showTKA && letter}
      <TKAGlyph {letter} />
    {/if}
  </svg>
</div>

<style>
  .thumbnail-pictograph {
    position: relative;
    overflow: hidden;
    border-radius: 4px;
  }

  .prop-svg,
  .arrow-svg {
    pointer-events: none;
  }
</style>
