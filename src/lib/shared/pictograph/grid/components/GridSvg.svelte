<!--
GridSvg.svelte - Grid Component with Beautiful Rotation Animation

Loads diamond grid and rotates it 45° with cumulative rotation.
Pure reactive approach - grid mode determines styling, rotation provides animation.
-->
<script lang="ts">
  import { GridMode } from "../domain/enums/grid-enums";
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
  let baseGridSvg = $state<string>("");

  // Track cumulative rotation for beautiful animation (ephemeral UI state)
  // Initialize based on starting gridMode: box mode starts at 45°, diamond at 0°
  let cumulativeRotation = $state(gridMode === GridMode.BOX ? 45 : 0);
  let previousGridMode = $state(gridMode);

  // Get SVG preload service
  const svgPreloadService = resolve(
    TYPES.ISvgPreloadService
  ) as ISvgPreloadService;

  // Load diamond grid (we rotate it to create box appearance)
  async function loadGrid(): Promise<void> {
    try {
      const svgText = await svgPreloadService.getSvgContent(
        "grid",
        "diamond_grid"
      );
      baseGridSvg = svgText;
      onLoaded?.();
    } catch (error) {
      hasError = true;
      errorMessage = "Failed to load grid";
      onError?.(errorMessage);
      throw error;
    }
  }

  // Styled grid content - reactively updates when gridMode or showNonRadialPoints changes
  const styledGridSvg = $derived.by(() => {
    if (!baseGridSvg) return "";
    return applyGridModeStyles(baseGridSvg, gridMode, showNonRadialPoints);
  });

  // Load grid on mount
  loadGrid();

  // Apply grid mode styling directly to SVG elements as inline attributes
  // This ensures the styling works in exported images (where CSS doesn't apply)
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

    // Set fill-opacity and stroke-opacity based on grid mode for outer points
    const fillOpacity = mode === GridMode.BOX ? "0" : "1";
    const strokeOpacity = mode === GridMode.BOX ? "1" : "0";

    for (const id of outerPointIds) {
      // Use regex to find each outer point circle and add/update all necessary attributes
      const circlePattern = new RegExp(
        `(<circle[^>]*id="${id}"[^>]*)(/>)`,
        "g"
      );

      modifiedSvg = modifiedSvg.replace(
        circlePattern,
        (match, opening, closing) => {
          // Remove any existing style attributes to ensure inline attributes take precedence
          let cleaned = opening.replace(/\s*fill-opacity="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*stroke-opacity="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*fill="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*stroke="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*stroke-width="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*stroke-miterlimit="[^"]*"/g, "");

          // Add all necessary attributes for proper rendering (matching CSS values)
          return `${cleaned} fill="#000" stroke="#000" stroke-width="13" stroke-miterlimit="10" fill-opacity="${fillOpacity}" stroke-opacity="${strokeOpacity}"${closing}`;
        }
      );
    }

    // Set opacity for non-radial points based on visibility setting
    const nonRadialOpacity = showNonRadial ? "1" : "0";

    for (const id of nonRadialPointIds) {
      const circlePattern = new RegExp(
        `(<circle[^>]*id="${id}"[^>]*)(/>)`,
        "g"
      );

      modifiedSvg = modifiedSvg.replace(
        circlePattern,
        (match, opening, closing) => {
          // Remove any existing opacity and fill attributes
          let cleaned = opening.replace(/\s*opacity="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*fill="[^"]*"/g, "");

          // Add the correct fill and opacity attributes (matching CSS values)
          return `${cleaned} fill="#000" opacity="${nonRadialOpacity}"${closing}`;
        }
      );
    }

    // Set fill color for hand points (they use currentColor in CSS which defaults to black)
    // Also remove the class to prevent CSS from overriding the inline fill
    for (const id of handPointIds) {
      const circlePattern = new RegExp(
        `(<circle[^>]*id="${id}"[^>]*)(/>)`,
        "g"
      );

      modifiedSvg = modifiedSvg.replace(
        circlePattern,
        (match, opening, closing) => {
          let cleaned = opening.replace(/\s*fill="[^"]*"/g, "");
          cleaned = cleaned.replace(/\s*class="[^"]*"/g, ""); // Remove class to prevent CSS override
          return `${cleaned} fill="#000"${closing}`;
        }
      );
    }

    // Set fill color for center point
    const centerPattern = new RegExp(
      `(<circle[^>]*id="${centerPointId}"[^>]*)(/>)`,
      "g"
    );
    modifiedSvg = modifiedSvg.replace(
      centerPattern,
      (match, opening, closing) => {
        let cleaned = opening.replace(/\s*fill="[^"]*"/g, "");
        return `${cleaned} fill="#000"${closing}`;
      }
    );

    return modifiedSvg;
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
  transform="rotate({cumulativeRotation}, 475, 475)"
>
  {#if !hasError && styledGridSvg}
    <g class="grid-layer">
      {@html styledGridSvg}
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
  {/if}
</g>

<style>
  .grid-container {
    z-index: 1;
  }

  /* Note: CSS transitions don't work with SVG transform attributes.
     To add smooth rotation animations in the future, we would need to use:
     - SMIL animations (<animateTransform>)
     - JavaScript-based animations
     - Web Animations API
     For now, grid rotation changes are instant (which is fine for export). */

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
