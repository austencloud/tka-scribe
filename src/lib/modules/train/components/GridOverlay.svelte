<script lang="ts">
  import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import GridSvg from "$lib/shared/pictograph/grid/components/GridSvg.svelte";
  import type { DetectedPosition } from "../domain/models";

  interface Props {
    bluePosition: DetectedPosition | null;
    redPosition: DetectedPosition | null;
    expectedBlue: GridLocation | null;
    expectedRed: GridLocation | null;
    showExpected?: boolean;
  }

  let {
    bluePosition = null,
    redPosition = null,
    expectedBlue = null,
    expectedRed = null,
    showExpected = true,
  }: Props = $props();

  // Grid coordinate system (950x950 centered at 475,475)
  const GRID_SIZE = 950;
  const GRID_CENTER = 475;
  const GRID_RADIUS = 360; // Radius to outer points

  // Map GridLocation to SVG coordinates (matching the "normal" hand points in diamond_grid.svg)
  // These are the non-strict hand point positions on the 950x950 grid
  const locationCoords: Record<GridLocation, { x: number; y: number }> = {
    [GridLocation.NORTH]: { x: 475, y: 331.9 },      // n_diamond_hand_point
    [GridLocation.NORTHEAST]: { x: 618.1, y: 331.9 }, // ne_diamond_layer2_point
    [GridLocation.EAST]: { x: 618.1, y: 475 },       // e_diamond_hand_point
    [GridLocation.SOUTHEAST]: { x: 618.1, y: 618.1 }, // se_diamond_layer2_point
    [GridLocation.SOUTH]: { x: 475, y: 618.1 },      // s_diamond_hand_point
    [GridLocation.SOUTHWEST]: { x: 331.9, y: 618.1 }, // sw_diamond_layer2_point
    [GridLocation.WEST]: { x: 331.9, y: 475 },       // w_diamond_hand_point
    [GridLocation.NORTHWEST]: { x: 331.9, y: 331.9 }, // nw_diamond_layer2_point
  };

  // Convert normalized coordinates (0-1) to grid SVG coordinates
  function normalizedToGrid(x: number, y: number): { x: number; y: number } {
    return {
      x: x * GRID_SIZE,
      y: y * GRID_SIZE,
    };
  }

  // Check if detected matches expected
  function isCorrect(detected: GridLocation | undefined, expected: GridLocation | null): boolean {
    if (!detected || !expected) return false;
    return detected === expected;
  }

  // Get status color based on correctness
  function getStatusColor(detected: DetectedPosition | null, expected: GridLocation | null): string {
    if (!detected) return "transparent";
    if (!expected || !showExpected) return "white"; // No expectation, just show detected
    return isCorrect(detected.quadrant, expected) ? "#22c55e" : "#ef4444"; // green or red
  }

  // Derived correctness states
  const blueCorrect = $derived(
    bluePosition && expectedBlue ? isCorrect(bluePosition.quadrant, expectedBlue) : null
  );
  const redCorrect = $derived(
    redPosition && expectedRed ? isCorrect(redPosition.quadrant, expectedRed) : null
  );
</script>

<div class="grid-overlay-container">
  <!-- Debug overlay - matches camera coordinates exactly (0-100%) -->
  <svg
    class="debug-overlay"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
  >
    <!-- Detected blue hand (left hand) debug landmarks -->
    {#if bluePosition?.debug}
      {@const wrist = bluePosition.debug.wrist}
      {@const finger = bluePosition.debug.middleFingerTip}
      {@const palm = bluePosition.debug.palmCenter}

      <!-- Line connecting wrist to finger base -->
      <line x1={wrist.x * 100} y1={wrist.y * 100} x2={finger.x * 100} y2={finger.y * 100} stroke="#3b82f6" stroke-width="0.3" stroke-dasharray="1,1" opacity="0.7" />

      <!-- Wrist - Yellow circle -->
      <circle cx={wrist.x * 100} cy={wrist.y * 100} r="1.5" fill="#fbbf24" stroke="#000" stroke-width="0.3" />
      <text x={wrist.x * 100} y={wrist.y * 100 - 3} text-anchor="middle" fill="#fbbf24" font-size="2.5" font-weight="bold">W</text>

      <!-- Middle finger base - Green circle -->
      <circle cx={finger.x * 100} cy={finger.y * 100} r="1.5" fill="#22c55e" stroke="#000" stroke-width="0.3" />
      <text x={finger.x * 100} y={finger.y * 100 - 3} text-anchor="middle" fill="#22c55e" font-size="2.5" font-weight="bold">F</text>

      <!-- Palm center (calculated) - Blue circle -->
      <circle cx={palm.x * 100} cy={palm.y * 100} r="2.5" fill="#3b82f6" stroke="white" stroke-width="0.4" />
      <text x={palm.x * 100} y={palm.y * 100 - 4} text-anchor="middle" fill="#3b82f6" font-size="2.5" font-weight="bold">P</text>
    {/if}

    <!-- Detected red hand (right hand) debug landmarks -->
    {#if redPosition?.debug}
      {@const wrist = redPosition.debug.wrist}
      {@const finger = redPosition.debug.middleFingerTip}
      {@const palm = redPosition.debug.palmCenter}

      <!-- Line connecting wrist to finger base -->
      <line x1={wrist.x * 100} y1={wrist.y * 100} x2={finger.x * 100} y2={finger.y * 100} stroke="#ef4444" stroke-width="0.3" stroke-dasharray="1,1" opacity="0.7" />

      <!-- Wrist - Yellow circle -->
      <circle cx={wrist.x * 100} cy={wrist.y * 100} r="1.5" fill="#fbbf24" stroke="#000" stroke-width="0.3" />
      <text x={wrist.x * 100} y={wrist.y * 100 - 3} text-anchor="middle" fill="#fbbf24" font-size="2.5" font-weight="bold">W</text>

      <!-- Middle finger base - Green circle -->
      <circle cx={finger.x * 100} cy={finger.y * 100} r="1.5" fill="#22c55e" stroke="#000" stroke-width="0.3" />
      <text x={finger.x * 100} y={finger.y * 100 - 3} text-anchor="middle" fill="#22c55e" font-size="2.5" font-weight="bold">F</text>

      <!-- Palm center (calculated) - Red circle -->
      <circle cx={palm.x * 100} cy={palm.y * 100} r="2.5" fill="#ef4444" stroke="white" stroke-width="0.4" />
      <text x={palm.x * 100} y={palm.y * 100 - 4} text-anchor="middle" fill="#ef4444" font-size="2.5" font-weight="bold">P</text>
    {/if}
  </svg>

  <!-- Grid overlay - 1:1 aspect ratio centered -->
  <svg
    class="grid-overlay"
    viewBox="0 0 950 950"
    preserveAspectRatio="xMidYMid slice"
  >
    <!-- Use the existing GridSvg component (no background overlay) -->
    <GridSvg gridMode={GridMode.DIAMOND} showNonRadialPoints={true} />

    <!-- Expected position indicators (dashed circles) -->
    {#if showExpected}
      {#if expectedBlue}
        {@const pos = locationCoords[expectedBlue]}
        {@const strokeColor = blueCorrect === true ? "#22c55e" : blueCorrect === false ? "#ef4444" : "#3b82f6"}
        {@const fillColor = blueCorrect === true ? "rgba(34, 197, 94, 0.2)" : "none"}
        <circle
          cx={pos.x}
          cy={pos.y}
          r="40"
          fill={fillColor}
          stroke={strokeColor}
          stroke-width="4"
          stroke-dasharray={blueCorrect === true ? "0" : "20,10"}
          opacity={blueCorrect === true ? "1.0" : "0.7"}
          class="expected-indicator"
        />
      {/if}
      {#if expectedRed}
        {@const pos = locationCoords[expectedRed]}
        {@const strokeColor = redCorrect === true ? "#22c55e" : redCorrect === false ? "#ef4444" : "#ef4444"}
        {@const fillColor = redCorrect === true ? "rgba(34, 197, 94, 0.2)" : "none"}
        <circle
          cx={pos.x}
          cy={pos.y}
          r="40"
          fill={fillColor}
          stroke={strokeColor}
          stroke-width="4"
          stroke-dasharray={redCorrect === true ? "0" : "20,10"}
          opacity={redCorrect === true ? "1.0" : "0.7"}
          class="expected-indicator"
        />
      {/if}
    {/if}

    <!-- Detected blue hand - Quadrant indicator at the hand point -->
    {#if bluePosition}
      {@const quadrantPos = locationCoords[bluePosition.quadrant]}
      <circle
        cx={quadrantPos.x}
        cy={quadrantPos.y}
        r="35"
        fill="#3b82f6"
        stroke="white"
        stroke-width="4"
      />
      <text
        x={quadrantPos.x}
        y={quadrantPos.y + 8}
        text-anchor="middle"
        dominant-baseline="middle"
        fill="white"
        font-size="32"
        font-weight="bold"
      >
        L
      </text>
    {/if}

    <!-- Detected red hand - Quadrant indicator at the hand point -->
    {#if redPosition}
      {@const quadrantPos = locationCoords[redPosition.quadrant]}
      <circle
        cx={quadrantPos.x}
        cy={quadrantPos.y}
        r="35"
        fill="#ef4444"
        stroke="white"
        stroke-width="4"
      />
      <text
        x={quadrantPos.x}
        y={quadrantPos.y + 8}
        text-anchor="middle"
        dominant-baseline="middle"
        fill="white"
        font-size="32"
        font-weight="bold"
      >
        R
      </text>
    {/if}
  </svg>
</div>

<style>
  .grid-overlay-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  /* Debug overlay - stretches to fill entire container to match camera feed */
  .debug-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
  }

  /* Grid overlay - centered 1:1 aspect ratio */
  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 15;
  }

  /* Show the outer points (big circles at edges) */
  .grid-overlay :global(#n_diamond_outer_point),
  .grid-overlay :global(#e_diamond_outer_point),
  .grid-overlay :global(#s_diamond_outer_point),
  .grid-overlay :global(#w_diamond_outer_point) {
    fill: #000 !important;
    opacity: 0.9;
  }

  /* Make ALL grid points black and visible */
  .grid-overlay :global(.normal-hand-point) {
    fill: #000 !important;
    opacity: 0.9;
  }

  .grid-overlay :global(.normal-layer2-point) {
    fill: #000 !important;
    opacity: 0.9;
  }

  .grid-overlay :global(#center_point) {
    fill: #000 !important;
    opacity: 0.9;
  }

  /* Hide strict points */
  .grid-overlay :global(.strict-hand-point),
  .grid-overlay :global(.strict-layer2-point) {
    display: none;
  }

  /* Animation for correct position indicator */
  @keyframes pulse-success {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.1);
    }
  }

  .expected-indicator {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
