<!--
  ThumbnailGrid - Simplified Grid for Thumbnail Rendering

  Uses pre-loaded grid SVG from cache instead of per-instance service resolution.
  No rotation animations - static rendering only.
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { getThumbnailAssetCache } from "./thumbnail-asset-cache.svelte";

  let {
    gridMode = GridMode.DIAMOND,
    showNonRadialPoints = false,
  } = $props<{
    gridMode?: GridMode;
    showNonRadialPoints?: boolean;
  }>();

  // Get cached grid SVG
  const assetCache = getThumbnailAssetCache();
  const gridSvg = $derived(assetCache.getGridSvg());

  // Apply grid mode styling
  const styledGridSvg = $derived.by(() => {
    if (!gridSvg) return "";
    return applyGridModeStyles(gridSvg, gridMode, showNonRadialPoints);
  });

  // Rotation for box mode (45 degrees)
  const rotation = $derived(gridMode === GridMode.BOX ? 45 : 0);

  // Apply styling to grid SVG (simplified from GridSvg.svelte)
  function applyGridModeStyles(
    svgContent: string,
    mode: GridMode,
    showNonRadial: boolean
  ): string {
    const outerPointIds = [
      "n_diamond_outer_point",
      "e_diamond_outer_point",
      "s_diamond_outer_point",
      "w_diamond_outer_point",
    ];

    const nonRadialPointIds = [
      "ne_diamond_layer2_point",
      "se_diamond_layer2_point",
      "sw_diamond_layer2_point",
      "nw_diamond_layer2_point",
    ];

    const handPointIds = [
      "n_diamond_hand_point",
      "e_diamond_hand_point",
      "s_diamond_hand_point",
      "w_diamond_hand_point",
    ];

    const centerPointId = "center_point";

    let modifiedSvg = svgContent;

    // Box mode: show outer points, hide hand points
    // Diamond mode: hide outer points, show hand points
    const showOuterPoints = mode === GridMode.BOX;
    const showHandPoints = mode === GridMode.DIAMOND;

    // Apply visibility for outer points
    outerPointIds.forEach((id) => {
      const pattern = new RegExp(`(id="${id}"[^>]*)>`, "g");
      modifiedSvg = modifiedSvg.replace(pattern, (match, prefix) => {
        const opacity = showOuterPoints ? "1" : "0";
        if (prefix.includes("opacity=")) {
          return prefix.replace(/opacity="[^"]*"/, `opacity="${opacity}"`) + ">";
        }
        return `${prefix} opacity="${opacity}">`;
      });
    });

    // Apply visibility for hand points
    handPointIds.forEach((id) => {
      const pattern = new RegExp(`(id="${id}"[^>]*)>`, "g");
      modifiedSvg = modifiedSvg.replace(pattern, (match, prefix) => {
        const opacity = showHandPoints ? "1" : "0";
        if (prefix.includes("opacity=")) {
          return prefix.replace(/opacity="[^"]*"/, `opacity="${opacity}"`) + ">";
        }
        return `${prefix} opacity="${opacity}">`;
      });
    });

    // Apply visibility for non-radial points
    nonRadialPointIds.forEach((id) => {
      const pattern = new RegExp(`(id="${id}"[^>]*)>`, "g");
      modifiedSvg = modifiedSvg.replace(pattern, (match, prefix) => {
        const opacity = showNonRadial ? "1" : "0";
        if (prefix.includes("opacity=")) {
          return prefix.replace(/opacity="[^"]*"/, `opacity="${opacity}"`) + ">";
        }
        return `${prefix} opacity="${opacity}">`;
      });
    });

    return modifiedSvg;
  }
</script>

{#if styledGridSvg}
  <g
    class="thumbnail-grid"
    style="transform: rotate({rotation}deg); transform-origin: 475px 475px;"
  >
    {@html styledGridSvg}
  </g>
{:else}
  <!-- Fallback: simple grid lines -->
  <g class="thumbnail-grid-fallback">
    <line x1="475" y1="100" x2="475" y2="850" stroke="#e0e0e0" stroke-width="2" />
    <line x1="100" y1="475" x2="850" y2="475" stroke="#e0e0e0" stroke-width="2" />
    <circle cx="475" cy="475" r="5" fill="#888" />
  </g>
{/if}

<style>
  .thumbnail-grid,
  .thumbnail-grid-fallback {
    pointer-events: none;
  }
</style>
