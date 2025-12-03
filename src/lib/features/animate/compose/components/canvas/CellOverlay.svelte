<script lang="ts">
  /**
   * CellOverlay - Hover controls for composition cells
   *
   * Appears on hover/tap over configured cells.
   * Provides quick actions: configure, clear, duplicate settings.
   */

  import type { CellConfig } from "../../domain/types";
  import { isCellConfigured } from "../../domain/types";
  import { getCompositionState } from "../../state/composition-state.svelte";

  interface Props {
    cell: CellConfig;
    isSelected: boolean;
  }

  let { cell, isSelected }: Props = $props();

  const state = getCompositionState();
  const isConfigured = $derived(isCellConfigured(cell));

  function handleConfigure(e: MouseEvent) {
    e.stopPropagation();
    state.openCellConfig(cell.id);
  }

  function handleClear(e: MouseEvent) {
    e.stopPropagation();
    state.clearCell(cell.id);
  }

  function handleToggleType(e: MouseEvent) {
    e.stopPropagation();
    const newType = cell.type === "single" ? "tunnel" : "single";
    state.setCellType(cell.id, newType);
  }
</script>

<div class="cell-overlay" class:visible={isSelected}>
  {#if isConfigured}
    <!-- Actions for configured cells -->
    <div class="overlay-actions">
      <button
        class="overlay-btn configure"
        onclick={handleConfigure}
        title="Configure cell"
        aria-label="Configure cell"
      >
        <i class="fas fa-cog"></i>
      </button>

      <button
        class="overlay-btn type-toggle"
        onclick={handleToggleType}
        title="Toggle {cell.type === 'single' ? 'tunnel' : 'single'} mode"
        aria-label="Toggle cell type"
      >
        <i class="fas {cell.type === 'tunnel' ? 'fa-square' : 'fa-layer-group'}"></i>
      </button>

      <button
        class="overlay-btn clear"
        onclick={handleClear}
        title="Clear cell"
        aria-label="Clear cell"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  {:else}
    <!-- Prompt for empty cells -->
    <div class="overlay-prompt">
      <button
        class="overlay-btn add"
        onclick={handleConfigure}
        title="Add sequence"
        aria-label="Add sequence to cell"
      >
        <i class="fas fa-plus"></i>
        <span>Configure</span>
      </button>
    </div>
  {/if}
</div>

<style>
  .cell-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(2px);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    border-radius: inherit;
  }

  /* Show on hover (parent handles this via :hover) */
  :global(.composition-cell:hover) .cell-overlay,
  :global(.composition-cell:focus-within) .cell-overlay,
  .cell-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  /* Overlay actions row */
  .overlay-actions {
    display: flex;
    gap: clamp(4px, 1vmin, 8px);
  }

  /* Overlay prompt for empty cells */
  .overlay-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  /* Overlay buttons */
  .overlay-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: clamp(6px, 1.5vmin, 10px);
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: clamp(4px, 1vmin, 8px);
    color: rgba(255, 255, 255, 0.9);
    font-size: clamp(0.75rem, 2vmin, 1rem);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .overlay-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.05);
  }

  .overlay-btn:active {
    transform: scale(0.95);
  }

  .overlay-btn i {
    font-size: 1em;
  }

  /* Button variants */
  .overlay-btn.configure:hover {
    background: rgba(59, 130, 246, 0.4);
    border-color: rgba(59, 130, 246, 0.6);
  }

  .overlay-btn.type-toggle:hover {
    background: rgba(139, 92, 246, 0.4);
    border-color: rgba(139, 92, 246, 0.6);
  }

  .overlay-btn.clear:hover {
    background: rgba(239, 68, 68, 0.4);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .overlay-btn.add {
    padding: clamp(8px, 2vmin, 12px) clamp(12px, 3vmin, 20px);
  }

  .overlay-btn.add:hover {
    background: rgba(16, 185, 129, 0.4);
    border-color: rgba(16, 185, 129, 0.6);
  }

  .overlay-btn.add span {
    font-weight: 500;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .cell-overlay {
      transition: none;
    }

    .overlay-btn {
      transition: none;
    }

    .overlay-btn:hover {
      transform: none;
    }

    .overlay-btn:active {
      transform: none;
    }
  }
</style>
