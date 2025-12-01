<!--
  GridCanvas.svelte

  2x2 grid canvas with cells for sequences.
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  type GridIndex = 0 | 1 | 2 | 3;

  let {
    gridSequences,
    gridRotationOffsets,
    onSelectCell,
    onRemoveCell,
  }: {
    gridSequences: (SequenceData | null)[];
    gridRotationOffsets: number[];
    onSelectCell: (index: GridIndex) => void;
    onRemoveCell: (index: GridIndex) => void;
  } = $props();

  const gridPositions = [
    { index: 0 as const, label: "Top-Left", shortLabel: "TL", rotation: 0, color: "#ec4899" },
    { index: 1 as const, label: "Top-Right", shortLabel: "TR", rotation: 90, color: "#8b5cf6" },
    { index: 2 as const, label: "Bottom-Left", shortLabel: "BL", rotation: 180, color: "#06b6d4" },
    { index: 3 as const, label: "Bottom-Right", shortLabel: "BR", rotation: 270, color: "#10b981" },
  ];
</script>

<div class="grid-canvas">
  {#each gridPositions as pos}
    {@const sequence = gridSequences[pos.index]}
    {@const rotation = gridRotationOffsets[pos.index]}

    <div
      class="grid-cell"
      class:filled={sequence}
      style="--cell-color: {pos.color}"
    >
      {#if sequence}
        <!-- Filled Cell -->
        <div class="cell-header">
          <div class="rotation-badge">
            <i class="fas fa-rotate"></i>
            {rotation}°
          </div>
          <button
            class="remove-btn"
            onclick={(e) => {
              e.stopPropagation();
              onRemoveCell(pos.index);
            }}
            aria-label="Remove sequence"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="cell-content">
          <div
            class="sequence-visual"
            style="transform: rotate({rotation}deg);"
          >
            <i class="fas fa-person-walking"></i>
          </div>
          <div class="sequence-name">{sequence.word || "Untitled"}</div>
          <div class="sequence-beats">{sequence.beats?.length ?? 0} beats</div>
        </div>

        <button
          class="change-cell-btn"
          onclick={() => onSelectCell(pos.index)}
        >
          <i class="fas fa-exchange-alt"></i>
          Change
        </button>
      {:else}
        <!-- Empty Cell -->
        <button
          class="empty-cell-btn"
          onclick={() => onSelectCell(pos.index)}
        >
          <div class="empty-icon">
            <i class="fas fa-plus"></i>
          </div>
          <div class="empty-label">{pos.label}</div>
          <div class="empty-rotation">{pos.rotation}° rotation</div>
        </button>
      {/if}
    </div>
  {/each}
</div>

<style>
  .grid-canvas {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 12px;
    padding: 1rem;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
    overflow: hidden;
  }

  .grid-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.3);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.2s ease;
  }

  .grid-cell:hover {
    border-color: var(--cell-color, rgba(255, 255, 255, 0.2));
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.05);
  }

  .grid-cell.filled {
    border-color: var(--cell-color, rgba(255, 255, 255, 0.2));
  }

  /* Filled Cell */
  .cell-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .rotation-badge {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.6rem;
    background: color-mix(in srgb, var(--cell-color) 25%, transparent);
    border: 1px solid var(--cell-color, rgba(139, 92, 246, 0.4));
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--cell-color);
  }

  .remove-btn {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 6px;
    color: #f87171;
    cursor: pointer;
    opacity: 0;
    transition: all 0.2s ease;
    position: relative;
  }

  .remove-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width: 48px;
    min-height: 48px;
  }

  .grid-cell:hover .remove-btn {
    opacity: 1;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.4);
    border-color: rgba(239, 68, 68, 0.6);
  }

  .cell-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
  }

  .sequence-visual {
    font-size: 3.5rem;
    opacity: 0.25;
    color: var(--cell-color);
    transition: transform 0.3s ease;
  }

  .sequence-name {
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }

  .sequence-beats {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  .change-cell-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.6rem;
    background: rgba(255, 255, 255, 0.05);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .change-cell-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  /* Empty Cell */
  .empty-cell-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    height: 100%;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .empty-cell-btn:hover {
    color: var(--cell-color, rgba(255, 255, 255, 0.8));
  }

  .empty-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-size: 1.5rem;
    transition: all 0.2s ease;
  }

  .empty-cell-btn:hover .empty-icon {
    background: color-mix(in srgb, var(--cell-color) 15%, transparent);
    border-color: var(--cell-color);
    border-style: solid;
    color: var(--cell-color);
  }

  .empty-label {
    font-size: 0.95rem;
    font-weight: 500;
  }

  .empty-rotation {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .sequence-visual {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    .grid-canvas {
      gap: 8px;
      padding: 0.75rem;
    }
  }
</style>
