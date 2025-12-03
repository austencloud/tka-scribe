<script lang="ts">
  /**
   * CompositionCell - Individual cell in the composition grid
   *
   * Displays either:
   * - Empty state (prompt to add sequence)
   * - Placeholder with sequence info (static mode)
   * - Live animation preview (preview mode)
   * - Full playback (playing mode)
   */

  import type { CellConfig } from "../../domain/types";
  import { isCellConfigured } from "../../domain/types";
  import CellOverlay from "./CellOverlay.svelte";
  import CellRenderer from "./CellRenderer.svelte";
  import { getCompositionState } from "../../state/composition-state.svelte";

  interface Props {
    cell: CellConfig;
    isPlaying: boolean;
    isPreviewing: boolean;
    isSelected: boolean;
    onClick: () => void;
  }

  let { cell, isPlaying, isPreviewing, isSelected, onClick }: Props = $props();

  const compState = getCompositionState();
  const speed = $derived(compState.speed);

  const isConfigured = $derived(isCellConfigured(cell));
  const shouldRenderAnimation = $derived(isConfigured && (isPlaying || isPreviewing));
  const sequenceCount = $derived(cell.sequences.length);
  const primarySequence = $derived(cell.sequences[0] ?? null);

  // Cell type indicator
  const typeLabel = $derived(cell.type === "tunnel" ? "Tunnel" : "Single");
  const typeIcon = $derived(cell.type === "tunnel" ? "fa-layer-group" : "fa-square");

  // Rotation indicator
  const hasRotation = $derived((cell.rotationOffset ?? 0) !== 0);
  const rotationLabel = $derived(`${cell.rotationOffset ?? 0}°`);
</script>

<button
  class="composition-cell"
  class:configured={isConfigured}
  class:selected={isSelected}
  class:playing={isPlaying}
  class:tunnel={cell.type === "tunnel"}
  onclick={onClick}
  role="gridcell"
  aria-label={isConfigured
    ? `Cell with ${primarySequence?.name || "sequence"}, ${typeLabel} mode`
    : "Empty cell, click to configure"}
  aria-selected={isSelected}
>
  {#if isConfigured}
    <!-- Configured cell content -->
    <div class="cell-content">
      {#if shouldRenderAnimation}
        <!-- Live animation rendering -->
        <CellRenderer
          {cell}
          {isPlaying}
          {isPreviewing}
          {speed}
        />
      {:else}
        <!-- Static preview -->
        <div class="static-preview">
          <div class="sequence-info">
            <span class="sequence-name">{primarySequence?.name || "Sequence"}</span>
            {#if cell.type === "tunnel" && sequenceCount > 1}
              <span class="sequence-count">+{sequenceCount - 1} more</span>
            {/if}
          </div>

          <!-- Cell type badge -->
          <div class="type-badge">
            <i class="fas {typeIcon}"></i>
            <span>{typeLabel}</span>
          </div>

          <!-- Rotation badge (if rotated) -->
          {#if hasRotation}
            <div class="rotation-badge">
              <i class="fas fa-sync-alt"></i>
              <span>{rotationLabel}</span>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Hover overlay with actions -->
    <CellOverlay {cell} {isSelected} />
  {:else}
    <!-- Empty cell -->
    <div class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-plus"></i>
      </div>
      <span class="empty-label">Add Sequence</span>
    </div>
  {/if}

  <!-- Selection indicator -->
  {#if isSelected}
    <div class="selection-ring"></div>
  {/if}
</button>

<style>
  /* CompositionCell - 48px minimum touch target */
  .composition-cell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    min-height: 48px;
    background: rgba(30, 30, 45, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(6px, 1.5vmin, 12px);
    cursor: pointer;
    transition: all 0.2s ease;
    overflow: hidden;
    padding: 0;
    color: white;
    text-align: center;
  }

  .composition-cell:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(40, 40, 60, 0.9);
  }

  .composition-cell:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .composition-cell.selected {
    border-color: rgba(59, 130, 246, 0.8);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
  }

  .composition-cell.configured {
    background: linear-gradient(
      135deg,
      rgba(40, 40, 60, 0.95) 0%,
      rgba(30, 30, 50, 0.95) 100%
    );
  }

  .composition-cell.tunnel {
    background: linear-gradient(
      135deg,
      rgba(60, 40, 80, 0.95) 0%,
      rgba(40, 30, 60, 0.95) 100%
    );
  }

  .composition-cell.playing {
    border-color: rgba(16, 185, 129, 0.4);
  }

  /* Cell content */
  .cell-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(8px, 2vmin, 16px);
  }

  /* Static preview */
  .static-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1vmin, 8px);
    width: 100%;
  }

  .sequence-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .sequence-name {
    font-size: clamp(0.75rem, 2vmin, 1rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .sequence-count {
    font-size: clamp(0.625rem, 1.5vmin, 0.8rem);
    color: rgba(255, 255, 255, 0.5);
  }

  .type-badge,
  .rotation-badge {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: clamp(0.625rem, 1.5vmin, 0.75rem);
    color: rgba(255, 255, 255, 0.7);
  }

  .type-badge i,
  .rotation-badge i {
    font-size: 0.8em;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1vmin, 8px);
    color: rgba(255, 255, 255, 0.4);
    transition: color 0.2s ease;
  }

  .composition-cell:hover .empty-state {
    color: rgba(255, 255, 255, 0.7);
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(32px, 8vmin, 48px);
    height: clamp(32px, 8vmin, 48px);
    border: 2px dashed currentColor;
    border-radius: 50%;
    font-size: clamp(1rem, 3vmin, 1.5rem);
  }

  .empty-label {
    font-size: clamp(0.75rem, 2vmin, 0.9rem);
    font-weight: 500;
  }

  /* Selection ring */
  .selection-ring {
    position: absolute;
    inset: -2px;
    border: 2px solid rgba(59, 130, 246, 0.8);
    border-radius: inherit;
    pointer-events: none;
    animation: pulse-ring 1.5s ease-in-out infinite;
  }

  @keyframes pulse-ring {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .composition-cell {
      transition: none;
    }

    .selection-ring {
      animation: none;
    }
  }
</style>
