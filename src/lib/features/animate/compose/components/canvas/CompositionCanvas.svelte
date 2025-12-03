<script lang="ts">
  /**
   * CompositionCanvas - The main composition grid view
   *
   * Renders the composition cells in a CSS Grid layout.
   * This is both the build view and the playback view.
   */

  import type { Composition } from "../../domain/types";
  import CompositionCell from "./CompositionCell.svelte";

  interface Props {
    composition: Composition;
    isPlaying: boolean;
    isPreviewing: boolean;
    selectedCellId: string | null;
    onCellClick: (cellId: string) => void;
  }

  let {
    composition,
    isPlaying,
    isPreviewing,
    selectedCellId,
    onCellClick,
  }: Props = $props();

  // Grid template based on layout
  const gridTemplate = $derived(
    `repeat(${composition.layout.rows}, 1fr) / repeat(${composition.layout.cols}, 1fr)`
  );
</script>

<div
  class="composition-canvas"
  style:grid-template={gridTemplate}
  role="grid"
  aria-label="Composition grid with {composition.layout.rows} rows and {composition.layout.cols} columns"
>
  {#each composition.cells as cell (cell.id)}
    <CompositionCell
      {cell}
      {isPlaying}
      {isPreviewing}
      isSelected={selectedCellId === cell.id}
      onClick={() => onCellClick(cell.id)}
    />
  {/each}
</div>

<style>
  .composition-canvas {
    display: grid;
    gap: clamp(4px, 1vmin, 12px);
    width: 100%;
    height: 100%;
    max-width: min(95vw, 1200px);
    max-height: min(85vh, 900px);
    aspect-ratio: 16 / 10;
    padding: clamp(4px, 1vmin, 12px);
    background: rgba(0, 0, 0, 0.3);
    border-radius: clamp(8px, 2vmin, 16px);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .composition-canvas {
      aspect-ratio: 4 / 3;
      max-height: 70vh;
    }
  }

  @media (max-width: 480px) {
    .composition-canvas {
      aspect-ratio: 3 / 4;
      max-height: 60vh;
    }
  }

  /* Portrait orientation */
  @media (orientation: portrait) and (max-height: 700px) {
    .composition-canvas {
      aspect-ratio: 1 / 1;
    }
  }
</style>
