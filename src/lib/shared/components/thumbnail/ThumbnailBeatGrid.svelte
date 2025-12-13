<!--
  ThumbnailBeatGrid - Grid Layout for Sequence Beats

  Renders a sequence as a grid of real Pictograph components.
  Layout: Start position in first cell, then beats in reading order.
-->
<script lang="ts">
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { ThumbnailRenderConfig } from "./thumbnail-types";
  import ThumbnailBeatCell from "./ThumbnailBeatCell.svelte";
  import { calculateThumbnailGridLayout } from "./thumbnail-grid-utils";

  let {
    beats = [],
    startPosition = null,
    renderConfig,
    containerWidth = 200,
    containerHeight = 150,
    maxColumns = 4,
  } = $props<{
    beats: readonly BeatData[];
    startPosition?: StartPositionData | BeatData | null;
    renderConfig: ThumbnailRenderConfig;
    containerWidth?: number;
    containerHeight?: number;
    maxColumns?: number;
  }>();

  // Calculate grid layout based on beat count and container size
  const layout = $derived(
    calculateThumbnailGridLayout(
      beats.length,
      containerWidth,
      containerHeight,
      maxColumns
    )
  );

  // All cells to render (start position + beats)
  const allCells = $derived.by(() => {
    const cells: Array<{
      type: "start" | "beat";
      data: BeatData | StartPositionData;
      index: number;
    }> = [];

    // Add start position as first cell
    if (startPosition) {
      cells.push({
        type: "start",
        data: startPosition,
        index: 0,
      });
    }

    // Add beats
    beats.forEach((beat: BeatData, i: number) => {
      cells.push({
        type: "beat",
        data: beat,
        index: startPosition ? i + 1 : i,
      });
    });

    return cells;
  });
</script>

<div
  class="thumbnail-beat-grid"
  style="
    --columns: {layout.columns};
    --cell-size: {layout.cellSize}px;
    --gap: {layout.gap}px;
  "
>
  {#each allCells as cell (cell.index)}
    <ThumbnailBeatCell
      beatData={cell.data}
      isStartPosition={cell.type === "start"}
      {renderConfig}
      cellSize={layout.cellSize}
    />
  {/each}
</div>

<style>
  .thumbnail-beat-grid {
    display: grid;
    grid-template-columns: repeat(var(--columns), var(--cell-size));
    gap: var(--gap);
    justify-content: center;
    align-content: center;
    width: 100%;
    height: 100%;
  }
</style>
