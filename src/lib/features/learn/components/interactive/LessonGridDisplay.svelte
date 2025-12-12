<!--
LessonGridDisplay - Theme-aware grid visualization for lessons
Shows diamond or box grid respecting user's theme settings.
Uses the actual GridSvg component for consistency with the rest of the app.
-->
<script lang="ts">
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import GridSvg from "$lib/shared/pictograph/grid/components/GridSvg.svelte";

  type GridType = "diamond" | "box" | "merged";
  type SizeType = "small" | "medium" | "large";

  interface LabelPosition {
    x: number;
    y: number;
  }

  let {
    type = "diamond",
    showLabels = false,
    labels = null,
    size = "medium",
    pulsing = false,
  } = $props<{
    type?: GridType;
    showLabels?: boolean;
    labels?: Record<string, LabelPosition> | null;
    size?: SizeType;
    pulsing?: boolean;
  }>();

  const gridMode = $derived(type === "box" ? GridMode.BOX : GridMode.DIAMOND);
  const showMerged = $derived(type === "merged");

  // Label positions for diamond mode (N, E, S, W)
  const diamondLabels: Record<string, LabelPosition> = {
    N: { x: 475, y: 80 },
    E: { x: 870, y: 485 },
    S: { x: 475, y: 890 },
    W: { x: 80, y: 485 },
  };

  // Label positions for box mode (NE, SE, SW, NW)
  const boxLabels: Record<string, LabelPosition> = {
    NE: { x: 730, y: 200 },
    SE: { x: 750, y: 770 },
    SW: { x: 200, y: 770 },
    NW: { x: 200, y: 200 },
  };

  const effectiveLabels = $derived(
    labels ?? (type === "box" ? boxLabels : diamondLabels)
  );

  // Get size class based on size prop
  const sizeClass = $derived(
    size === "small"
      ? "grid-small"
      : size === "large"
        ? "grid-large"
        : "grid-medium"
  );
</script>

<div class="lesson-grid-display {sizeClass}" class:pulsing>
  <svg viewBox="0 0 950 950" class="grid-svg">
    <!-- White background like real pictographs -->
    <rect width="950" height="950" fill="white" rx="8" />

    {#if showMerged}
      <!-- Show both diamond and box grids overlaid for 8-point view -->
      <g class="merged-grids">
        <!-- Diamond grid (N, E, S, W points) -->
        <GridSvg gridMode={GridMode.DIAMOND} />
        <!-- Box grid (NE, SE, SW, NW points) - rendered on top -->
        <GridSvg gridMode={GridMode.BOX} />
      </g>
    {:else}
      <GridSvg {gridMode} />
    {/if}

    <!-- Direction labels -->
    {#if showLabels && effectiveLabels}
      <g class="direction-labels">
        {#each Object.entries(effectiveLabels) as [label, pos]}
          {@const position = pos as LabelPosition}
          <text
            x={position.x}
            y={position.y}
            text-anchor="middle"
            dominant-baseline="middle"
            class="direction-label"
          >
            {label}
          </text>
        {/each}
      </g>
    {/if}
  </svg>
</div>

<style>
  .lesson-grid-display {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .grid-svg {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  /* Size variants - applied to the container */
  .grid-small .grid-svg {
    max-width: 180px;
  }

  .grid-medium .grid-svg {
    max-width: 280px;
  }

  .grid-large .grid-svg {
    max-width: 380px;
  }

  /* Pulsing animation for emphasis */
  .pulsing .grid-svg {
    animation: gentle-pulse 2s ease-in-out infinite;
  }

  @keyframes gentle-pulse {
    0%,
    100% {
      transform: scale(1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    50% {
      transform: scale(1.02);
      box-shadow: 0 4px 16px color-mix(in srgb, var(--theme-accent) 20%, transparent);
    }
  }

  /* Direction labels */
  .direction-label {
    font-size: 50px;
    font-weight: 700;
    fill: #374151;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .grid-small .grid-svg {
      max-width: 140px;
    }

    .grid-medium .grid-svg {
      max-width: 220px;
    }

    .grid-large .grid-svg {
      max-width: 300px;
    }

    .direction-label {
      font-size: 36px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pulsing .grid-svg {
      animation: none;
    }
  }
</style>
