<!--
GridSvg.svelte - Grid Component with Beautiful Rotation Animation

Loads diamond grid and rotates it 45° with cumulative rotation.
Pure reactive approach - grid mode determines styling, rotation provides animation.
-->
<script lang="ts">
  import { GridMode } from "$shared";
  import { resolve, TYPES } from "../../../inversify";
  import type { ISvgPreloadService } from "../../shared/services/contracts/ISvgPreloadService";

  let {
    gridMode = GridMode.DIAMOND,
    showNonRadialPoints = false,
    onLoaded,
    onError,
    onToggleNonRadial = undefined,
  } = $props<{
    /** Grid mode - derived from motion data */
    gridMode?: GridMode;
    /** Show non-radial points (layer 2 diagonal points) */
    showNonRadialPoints?: boolean;
    /** Called when grid is successfully loaded */
    onLoaded?: () => void;
    /** Called when grid loading fails */
    onError?: (error: string) => void;
    /** Callback when non-radial points are clicked to toggle visibility */
    onToggleNonRadial?: () => void;
  }>();

  // State
  let hasError = $state(false);
  let errorMessage = $state<string | null>(null);

  // Track cumulative rotation for beautiful animation (ephemeral UI state)
  // Initialize based on starting gridMode: box mode starts at 45°, diamond at 0°
  let cumulativeRotation = $state(gridMode === GridMode.BOX ? 45 : 0);
  let previousGridMode = $state(gridMode);

  // Get SVG preload service
  const svgPreloadService = resolve(
    TYPES.ISvgPreloadService
  ) as ISvgPreloadService;

  // Load diamond grid (we rotate it to create box appearance)
  async function loadGrid(): Promise<string> {
    try {
      const svgText = await svgPreloadService.getSvgContent(
        "grid",
        "diamond_grid"
      );
      onLoaded?.();
      return svgText;
    } catch (error) {
      hasError = true;
      errorMessage = "Failed to load grid";
      onError?.(errorMessage);
      throw error;
    }
  }

  // Increment cumulative rotation by 45° whenever gridMode changes
  $effect(() => {
    if (gridMode !== previousGridMode) {
      cumulativeRotation += 45;
      previousGridMode = gridMode;
    }
  });
</script>

<!-- Grid Container - Rotates cumulatively by 45° each time -->
<g
  class="grid-container"
  class:box-mode={gridMode === GridMode.BOX}
  class:show-non-radial={showNonRadialPoints}
  class:interactive-non-radial={onToggleNonRadial !== undefined}
  data-grid-mode={gridMode}
  style="transform: rotate({cumulativeRotation}deg)"
>
  {#if !hasError}
    {#await loadGrid() then gridSvgContent}
      <g class="grid-layer">
        {@html gridSvgContent}
      </g>

      <!-- Clickable overlay for non-radial points -->
      {#if onToggleNonRadial}
        <g
          class="non-radial-click-overlay"
          onclick={onToggleNonRadial}
          onkeydown={(e) =>
            e.key === "Enter" || e.key === " " ? onToggleNonRadial?.() : null}
          role="button"
          tabindex="0"
          aria-label="Toggle non-radial points visibility"
        >
          <!-- Invisible clickable areas over each non-radial point -->
          <circle cx="730" cy="220" r="30" fill="transparent" />
          <circle cx="730" cy="730" r="30" fill="transparent" />
          <circle cx="220" cy="730" r="30" fill="transparent" />
          <circle cx="220" cy="220" r="30" fill="transparent" />
        </g>
      {/if}
    {/await}
  {/if}
</g>

<style>
  .grid-container {
    transform-origin: 475px 475px;
    transition: transform 0.2s ease;
    z-index: 1;
  }

  /* Outer points - animate opacity for smooth morph */
  :global(#n_diamond_outer_point),
  :global(#e_diamond_outer_point),
  :global(#s_diamond_outer_point),
  :global(#w_diamond_outer_point) {
    fill: #000;
    stroke: #000;
    stroke-width: 13;
    stroke-miterlimit: 10;
    transition:
      fill-opacity 0.2s ease,
      stroke-opacity 0.2s ease;
  }

  /* Diamond mode - filled circles */
  :global(.grid-container:not(.box-mode) #n_diamond_outer_point),
  :global(.grid-container:not(.box-mode) #e_diamond_outer_point),
  :global(.grid-container:not(.box-mode) #s_diamond_outer_point),
  :global(.grid-container:not(.box-mode) #w_diamond_outer_point) {
    fill-opacity: 1;
    stroke-opacity: 0;
  }

  /* Box mode - outlined circles */
  :global(.grid-container.box-mode #n_diamond_outer_point),
  :global(.grid-container.box-mode #e_diamond_outer_point),
  :global(.grid-container.box-mode #s_diamond_outer_point),
  :global(.grid-container.box-mode #w_diamond_outer_point) {
    fill-opacity: 0;
    stroke-opacity: 1;
  }

  /* Non-radial points - layer 2 diagonal points */
  :global(#ne_diamond_layer2_point),
  :global(#se_diamond_layer2_point),
  :global(#sw_diamond_layer2_point),
  :global(#nw_diamond_layer2_point) {
    fill: #000;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  /* Show non-radial points when enabled */
  :global(.grid-container.show-non-radial #ne_diamond_layer2_point),
  :global(.grid-container.show-non-radial #se_diamond_layer2_point),
  :global(.grid-container.show-non-radial #sw_diamond_layer2_point),
  :global(.grid-container.show-non-radial #nw_diamond_layer2_point) {
    opacity: 1;
  }

  /* Interactive non-radial points - show cursor pointer */
  :global(.grid-container.interactive-non-radial #ne_diamond_layer2_point),
  :global(.grid-container.interactive-non-radial #se_diamond_layer2_point),
  :global(.grid-container.interactive-non-radial #sw_diamond_layer2_point),
  :global(.grid-container.interactive-non-radial #nw_diamond_layer2_point) {
    cursor: pointer;
  }

  /* Click overlay for non-radial points */
  .non-radial-click-overlay {
    cursor: pointer;
  }
</style>
