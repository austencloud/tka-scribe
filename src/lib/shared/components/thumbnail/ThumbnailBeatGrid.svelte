<!--
  ThumbnailBeatGrid - Grid Layout for Sequence Beats

  Renders a sequence as a grid of beat pictographs.
  Uses computed positions passed from parent to avoid per-beat service resolution.

  Layout: Start position in first cell, then beats in reading order.
-->
<script lang="ts">
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { ThumbnailRenderConfig } from "./thumbnail-types";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
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
    beats.forEach((beat, i) => {
      cells.push({
        type: "beat",
        data: beat,
        index: startPosition ? i + 1 : i,
      });
    });

    return cells;
  });

  // Derive grid mode from first beat's motions
  const gridMode = $derived.by(() => {
    if (beats.length === 0) return GridMode.DIAMOND;
    const firstBeat = beats[0];
    // Simple heuristic: if both motions exist and have positions ending in 's' or 'n',
    // it's likely box mode. Default to diamond for safety.
    return GridMode.DIAMOND;
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
      {gridMode}
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
