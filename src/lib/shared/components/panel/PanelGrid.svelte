<script lang="ts">
  /**
   * PanelGrid - Auto-fill grid for cards
   *
   * Provides responsive grid layout for panel content.
   */

  import type { Snippet } from "svelte";

  interface Props {
    /** Content to render */
    children: Snippet;
    /** Minimum card width for auto-fill (default: 280px) */
    minCardWidth?: string;
    /** Gap between items (default: 16px) */
    gap?: string;
    /** Number of columns (overrides auto-fill if set) */
    columns?: number;
  }

  let {
    children,
    minCardWidth = "280px",
    gap = "16px",
    columns,
  }: Props = $props();

  const gridTemplateColumns = $derived(
    columns
      ? `repeat(${columns}, 1fr)`
      : `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`
  );
</script>

<div
  class="panel-grid"
  style:grid-template-columns={gridTemplateColumns}
  style:gap={gap}
>
  {@render children()}
</div>

<style>
  .panel-grid {
    display: grid;
    padding: 4px;
  }

  @media (max-width: 640px) {
    .panel-grid {
      grid-template-columns: 1fr !important;
      gap: 12px !important;
    }
  }
</style>
