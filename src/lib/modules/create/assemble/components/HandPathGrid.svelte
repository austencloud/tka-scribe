<!--
HandPathGrid.svelte - 3x3 grid for hand path position selection

Displays a 3x3 grid of position buttons arranged as:
  NW  N  NE
  W   C   E
  SW  S  SE

Positions are enabled/disabled based on grid mode:
- Diamond mode: N, E, S, W enabled
- Box mode: NE, SE, SW, NW enabled
- Center (C) is always disabled for now (future feature)
-->
<script lang="ts">
  import {
    GridLocation,
    GridMode,
  } from "$shared/pictograph/grid/domain/enums/grid-enums";
  import GridPositionButton from "./GridPositionButton.svelte";

  const { gridMode, currentPosition, onPositionSelect } = $props<{
    gridMode: GridMode;
    currentPosition: GridLocation | null;
    onPositionSelect: (position: GridLocation) => void;
  }>();

  // 3x3 grid layout (row by row, left to right)
  const gridLayout: (GridLocation | null)[][] = [
    [GridLocation.NORTHWEST, GridLocation.NORTH, GridLocation.NORTHEAST],
    [GridLocation.WEST, null, GridLocation.EAST], // null = center (disabled for now)
    [GridLocation.SOUTHWEST, GridLocation.SOUTH, GridLocation.SOUTHEAST],
  ];

  /**
   * Check if a position is enabled based on grid mode
   */
  function isPositionEnabled(position: GridLocation | null): boolean {
    if (position === null) {
      return false; // Center is disabled for now
    }

    const cardinalPositions = [
      GridLocation.NORTH,
      GridLocation.EAST,
      GridLocation.SOUTH,
      GridLocation.WEST,
    ];

    const intercardinalPositions = [
      GridLocation.NORTHEAST,
      GridLocation.SOUTHEAST,
      GridLocation.SOUTHWEST,
      GridLocation.NORTHWEST,
    ];

    if (gridMode === GridMode.DIAMOND) {
      return cardinalPositions.includes(position);
    } else if (gridMode === GridMode.BOX) {
      return intercardinalPositions.includes(position);
    }

    return false;
  }

  // Measure container dimensions to create a square grid
  let containerWidth = $state(0);
  let containerHeight = $state(0);

  // Calculate the size for the square grid (smaller of width/height)
  let gridSize = $derived(
    containerWidth > 0 && containerHeight > 0
      ? Math.min(containerWidth, containerHeight)
      : 0
  );
</script>

<div
  class="hand-path-grid-container"
  bind:clientWidth={containerWidth}
  bind:clientHeight={containerHeight}
>
  {#if gridSize > 0}
    <div
      class="hand-path-grid"
      style:width="{gridSize}px"
      style:height="{gridSize}px"
    >
      {#each gridLayout as row}
        {#each row as position}
          {#if position !== null}
            <GridPositionButton
              {position}
              enabled={isPositionEnabled(position)}
              isCurrent={currentPosition === position}
              onSelect={onPositionSelect}
            />
          {:else}
            <!-- Center position (disabled) -->
            <div class="center-placeholder">
              <span class="center-label">○</span>
            </div>
          {/if}
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .hand-path-grid-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hand-path-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 12px;
    /* Width and height are set dynamically via inline styles */
  }

  .center-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.02);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.2);
    font-size: 24px;
    opacity: 0.3;
  }

  .center-label {
    user-select: none;
  }

  @media (max-width: 768px) {
    .hand-path-grid {
      gap: 8px;
    }
  }
</style>
