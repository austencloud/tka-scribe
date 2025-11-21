<!--
ReversalIndicators.svelte - Reversal Indicator Component

Renders blue and red reversal indicators as large "R" letters stacked vertically.
Based on the desktop app's ReversalGlyph implementation which shows a column of 2 R's
colored according to the motion that is reversing between pictographs.
-->
<script lang="ts">
  import { getVisibilityStateManager } from "../state/visibility-state.svelte";
  import { MotionColor } from "$shared";
  import { onMount } from "svelte";

  let {
    blueReversal = false,
    redReversal = false,
    hasValidData = true,
    visible = true,
    onToggle = undefined,
  } = $props<{
    /** Whether to show blue reversal indicator */
    blueReversal?: boolean,
    /** Whether to show red reversal indicator */
    redReversal?: boolean,
    /** Whether the pictograph has valid data */
    hasValidData?: boolean,
    /** Visibility control for fade effect */
    visible?: boolean,
    /** Callback when glyph is clicked to toggle visibility */
    onToggle?: () => void
  }>();

  // Get global visibility manager to respect motion visibility settings
  const visibilityManager = getVisibilityStateManager();

  // Reactivity counter for visibility changes
  let visibilityUpdateCount = $state(0);

  // Force re-render when visibility changes
  function handleVisibilityChange() {
    visibilityUpdateCount++;
  }

  onMount(() => {
    visibilityManager.registerObserver(handleVisibilityChange, ["motion"]);
    return () => {
      visibilityManager.unregisterObserver(handleVisibilityChange);
    };
  });

  // Filter reversals based on global motion visibility
  const effectiveBlueReversal = $derived.by(() => {
    visibilityUpdateCount; // Force reactivity
    return (
      blueReversal && visibilityManager.getMotionVisibility(MotionColor.BLUE)
    );
  });

  const effectiveRedReversal = $derived.by(() => {
    visibilityUpdateCount; // Force reactivity
    return (
      redReversal && visibilityManager.getMotionVisibility(MotionColor.RED)
    );
  });

  // Only render if we have valid data and at least one reversal (after visibility filtering)
  const shouldRender = $derived(() => {
    const render =
      hasValidData && (effectiveBlueReversal || effectiveRedReversal);
    return render;
  });

  // Match arrow and prop colors for consistency
  const BLUE_COLOR = "#2E3192"; // Matches ArrowSvgColorTransformer and PropSvgLoader
  const RED_COLOR = "#ED1C24"; // Matches ArrowSvgColorTransformer and PropSvgLoader

  // Relative positioning - scales with pictograph size
  // Using percentages of the standard 1000px pictograph dimensions
  const X_POSITION_PERCENT = 5.5; // 5.5% from left edge
  const CENTER_Y_PERCENT = 50; // 50% from top (center)
  const FONT_SIZE_PERCENT = 7; // Slightly larger than before (was 6%)
  const R_SPACING_PERCENT = 7; // Fixed spacing between R's as percentage

  // Calculate actual positions based on pictograph dimensions
  // Assuming standard SVG viewBox of 1000x1000
  const X_POSITION = X_POSITION_PERCENT * 10; // Convert to 1000px scale
  const CENTER_Y = CENTER_Y_PERCENT * 9.7; // Convert to 1000px scale
  const FONT_SIZE = FONT_SIZE_PERCENT * 10; // Convert to 1000px scale
  const R_SPACING = R_SPACING_PERCENT * 10; // Convert to 1000px scale

  // Calculate vertical positions when both R's are present (after visibility filtering)
  const redRY = $derived.by(() => {
    if (effectiveBlueReversal && effectiveRedReversal) {
      // Both present: stack vertically with fixed spacing around center
      return CENTER_Y - R_SPACING / 2;
    } else if (effectiveRedReversal) {
      // Only red: center it properly (accounting for visual centering)
      return CENTER_Y;
    }
    return CENTER_Y;
  });

  const blueRY = $derived.by(() => {
    if (effectiveBlueReversal && effectiveRedReversal) {
      // Both present: blue below red with fixed spacing
      return CENTER_Y + R_SPACING / 2;
    } else if (effectiveBlueReversal) {
      // Only blue: center it properly (accounting for visual centering)
      return CENTER_Y;
    }
    return CENTER_Y;
  });
</script>

{#if shouldRender()}
  <g
    class="reversal-indicators"
    class:visible
    class:interactive={onToggle !== undefined}
    onclick={onToggle}
    {...onToggle
      ? {
          role: "button",
          tabindex: 0,
          "aria-label": "Toggle Reversal indicators visibility",
        }
      : {}}
  >
    {#if effectiveRedReversal}
      <text
        x={X_POSITION}
        y={redRY}
        font-family="Georgia, serif"
        font-size={FONT_SIZE}
        font-weight="bold"
        fill={RED_COLOR}
        dominant-baseline="middle"
        text-anchor="start"
      >
        R
      </text>
    {/if}
    {#if effectiveBlueReversal}
      <text
        x={X_POSITION}
        y={blueRY}
        font-family="Georgia, serif"
        font-size={FONT_SIZE}
        font-weight="bold"
        fill={BLUE_COLOR}
        dominant-baseline="middle"
        text-anchor="start"
      >
        R
      </text>
    {/if}
  </g>
{/if}

<style>
  .reversal-indicators {
    /* Beautiful fade in/out effect */
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .reversal-indicators.visible {
    opacity: 1;
  }

  .reversal-indicators.interactive {
    cursor: pointer;
  }

  .reversal-indicators.interactive:hover {
    opacity: 0.7;
  }
</style>
