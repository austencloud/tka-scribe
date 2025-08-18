<!--
PictographWithVisibility.svelte - Enhanced Pictograph with Visibility Controls

Extends the basic Pictograph component with sophisticated visibility controls
matching the legacy desktop app's behavior.
-->
<script lang="ts">
  import type { BeatData, PictographData } from "$lib/domain";
  import { MotionColor } from "$lib/domain/enums";
  import { getVisibilityStateManager } from "$lib/services/implementations/VisibilityStateManager";
  import { onMount } from "svelte";
  import Pictograph from "./Pictograph.svelte";

  interface Props {
    /** Pictograph data to render */
    pictographData?: PictographData | null;
    /** Beat data (alternative to pictographData) */
    beatData?: BeatData | null;
    /** Click handler */
    onClick?: () => void;
    /** Debug mode */
    debug?: boolean;
    /** Animation duration for transitions */
    animationDuration?: number;
    /** Show loading indicator */
    showLoadingIndicator?: boolean;
    /** Beat number for display */
    beatNumber?: number | null;
    /** Is this a start position? */
    isStartPosition?: boolean;
    /** SVG dimensions */
    width?: number;
    height?: number;
    /** Enable visibility controls (default: true) */
    enableVisibility?: boolean;
    /** Force show all elements (for visibility preview) */
    forceShowAll?: boolean;
  }

  let {
    pictographData = null,
    beatData = null,
    onClick,
    debug = false,
    beatNumber = null,
    isStartPosition = false,
    width = undefined,
    height = undefined,
    enableVisibility = true,
    forceShowAll = false,
  }: Props = $props();

  // Visibility state manager
  let visibilityManager = getVisibilityStateManager();
  let visibilityUpdateCount = $state(0);

  // Force re-render when visibility changes
  function handleVisibilityChange() {
    visibilityUpdateCount++;
  }

  onMount(() => {
    if (enableVisibility) {
      visibilityManager.registerObserver(handleVisibilityChange);

      return () => {
        visibilityManager.unregisterObserver(handleVisibilityChange);
      };
    }
  });

  // Derived state - get effective pictograph data with visibility applied
  const effectivePictographData = $derived(() => {
    // Force reactivity by accessing visibilityUpdateCount
    visibilityUpdateCount;

    const originalData = pictographData || beatData?.pictograph_data;
    if (!originalData || !enableVisibility || forceShowAll) {
      return originalData;
    }

    // Apply visibility filters
    const filteredData = { ...originalData };

    // Filter arrows based on motion visibility
    if (filteredData.arrows) {
      const newArrows: Record<string, any> = {};

      Object.entries(filteredData.arrows).forEach(([color, arrowData]) => {
        if (
          arrowData &&
          visibilityManager.getMotionVisibility(color as MotionColor)
        ) {
          newArrows[color] = arrowData;
        }
      });

      filteredData.arrows = newArrows;
    }

    // Filter props based on motion visibility
    if (filteredData.props) {
      const newProps: Record<string, any> = {};

      Object.entries(filteredData.props).forEach(([color, propData]) => {
        if (
          propData &&
          visibilityManager.getMotionVisibility(color as MotionColor)
        ) {
          newProps[color] = propData;
        }
      });

      filteredData.props = newProps;
    }

    // Filter letter based on TKA visibility
    if (!visibilityManager.getGlyphVisibility("TKA")) {
      filteredData.letter = null;
    }

    return filteredData;
  });

  // Derived state - should show reversal indicators
  const showReversals = $derived(() => {
    if (!enableVisibility || forceShowAll) return true;
    return visibilityManager.getGlyphVisibility("Reversals");
  });

  // Derived state - should show positions
  const showPositions = $derived(() => {
    if (!enableVisibility || forceShowAll) return true;
    return visibilityManager.getGlyphVisibility("Positions");
  });

  // Derived state - should show VTG notation
  const showVTG = $derived(() => {
    if (!enableVisibility || forceShowAll) return true;
    return visibilityManager.getGlyphVisibility("VTG");
  });

  // Derived state - should show elemental notation
  const showElemental = $derived(() => {
    if (!enableVisibility || forceShowAll) return true;
    return visibilityManager.getGlyphVisibility("Elemental");
  });

  // Derived state - should show non-radial points
  const showNonRadialPoints = $derived(() => {
    if (!enableVisibility || forceShowAll) return true;
    return visibilityManager.getNonRadialVisibility();
  });
</script>

<!-- Enhanced Pictograph with Visibility Controls -->
<div
  class="pictograph-with-visibility"
  class:debug-mode={debug}
  class:visibility-enabled={enableVisibility}
  class:force-show-all={forceShowAll}
>
  <!-- Base Pictograph Component -->
  <Pictograph
    pictographData={effectivePictographData()}
    {beatData}
    {onClick}
    {debug}
    {beatNumber}
    {isStartPosition}
    {width}
    {height}
  />

  <!-- Visibility Indicators Overlay (for debugging) -->
  {#if debug && enableVisibility}
    <div class="visibility-debug-overlay">
      <div class="debug-info">
        <div class="debug-title">Visibility State</div>

        <div class="debug-section">
          <div class="debug-label">Motions:</div>
          <div class="debug-value">
            Red: {visibilityManager.getMotionVisibility(MotionColor.RED)
              ? "✓"
              : "✗"}
            Blue: {visibilityManager.getMotionVisibility(MotionColor.BLUE)
              ? "✓"
              : "✗"}
          </div>
        </div>

        <div class="debug-section">
          <div class="debug-label">Glyphs:</div>
          <div class="debug-value">
            TKA: {visibilityManager.getGlyphVisibility("TKA") ? "✓" : "✗"}
            Rev: {visibilityManager.getGlyphVisibility("Reversals") ? "✓" : "✗"}
          </div>
        </div>

        <div class="debug-section">
          <div class="debug-label">Dependent:</div>
          <div class="debug-value">
            Available: {visibilityManager.areAllMotionsVisible() ? "YES" : "NO"}
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .pictograph-with-visibility {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .visibility-debug-overlay {
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 10px;
    min-width: 150px;
    z-index: 1000;
  }

  .debug-title {
    font-weight: bold;
    margin-bottom: 6px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding-bottom: 2px;
  }

  .debug-section {
    margin-bottom: 4px;
  }

  .debug-label {
    font-size: 9px;
    opacity: 0.8;
    margin-bottom: 1px;
  }

  .debug-value {
    font-size: 10px;
    margin-left: 8px;
  }

  /* Only show debug overlay in debug mode */
  .pictograph-with-visibility:not(.debug-mode) .visibility-debug-overlay {
    display: none;
  }
</style>
