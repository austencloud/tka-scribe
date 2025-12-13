<!--
  SimplifiedPictograph - Ultra-lightweight Pictograph for Gallery Thumbnails

  MVP version that shows:
  - Grid background
  - Letter (TKA glyph)
  - Color indicators for blue/red motions

  Full prop/arrow rendering will be added in Phase 2 optimization.
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { ThumbnailRenderConfig } from "./thumbnail-types";
  import ThumbnailGrid from "./ThumbnailGrid.svelte";
  import { preloadThumbnailAssets, getThumbnailAssetCache } from "./thumbnail-asset-cache.svelte";
  import { onMount } from "svelte";

  let {
    beatData,
    gridMode = GridMode.DIAMOND,
    renderConfig,
    size = 100,
  } = $props<{
    beatData: BeatData | StartPositionData | null;
    gridMode?: GridMode;
    renderConfig: ThumbnailRenderConfig;
    size?: number;
  }>();

  // Standard viewBox
  const viewBox = "0 0 950 950";

  // Get letter from beat data
  const letter = $derived((beatData as BeatData)?.letter ?? null);

  // Check for blue/red motions
  const hasBlueMotion = $derived(
    beatData?.motions?.blue &&
    beatData.motions.blue.motion !== "static" &&
    beatData.motions.blue.motion !== null
  );

  const hasRedMotion = $derived(
    beatData?.motions?.red &&
    beatData.motions.red.motion !== "static" &&
    beatData.motions.red.motion !== null
  );

  // Ensure assets are loaded
  let assetsReady = $state(false);

  onMount(async () => {
    await preloadThumbnailAssets();
    assetsReady = getThumbnailAssetCache().isReady();
  });
</script>

<div class="simplified-pictograph" style="width: {size}px; height: {size}px;">
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

    <!-- Grid -->
    {#if assetsReady}
      <ThumbnailGrid
        {gridMode}
        showNonRadialPoints={renderConfig.showNonRadialPoints}
      />
    {:else}
      <!-- Fallback grid while loading -->
      <g class="fallback-grid">
        <line x1="475" y1="100" x2="475" y2="850" stroke="#e0e0e0" stroke-width="2" />
        <line x1="100" y1="475" x2="850" y2="475" stroke="#e0e0e0" stroke-width="2" />
        <circle cx="475" cy="475" r="8" fill="#888" />
      </g>
    {/if}

    <!-- Motion indicators (simplified - colored circles showing motion presence) -->
    {#if hasBlueMotion}
      <circle
        cx="350"
        cy="475"
        r="60"
        fill="var(--prop-blue, #3b82f6)"
        opacity="0.3"
      />
      <circle
        cx="350"
        cy="475"
        r="30"
        fill="var(--prop-blue, #3b82f6)"
        opacity="0.7"
      />
    {/if}

    {#if hasRedMotion}
      <circle
        cx="600"
        cy="475"
        r="60"
        fill="var(--prop-red, #ef4444)"
        opacity="0.3"
      />
      <circle
        cx="600"
        cy="475"
        r="30"
        fill="var(--prop-red, #ef4444)"
        opacity="0.7"
      />
    {/if}

    <!-- Letter glyph (if enabled) -->
    {#if renderConfig.showTKA && letter}
      <g class="letter-glyph">
        <text
          x="475"
          y="200"
          text-anchor="middle"
          dominant-baseline="middle"
          font-family="Arial, sans-serif"
          font-size="120"
          font-weight="bold"
          fill="#333"
        >
          {letter}
        </text>
      </g>
    {/if}
  </svg>
</div>

<style>
  .simplified-pictograph {
    position: relative;
    overflow: hidden;
    border-radius: 2px;
  }
</style>
