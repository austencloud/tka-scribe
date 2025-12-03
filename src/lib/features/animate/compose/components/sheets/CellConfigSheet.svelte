<script lang="ts">
  /**
   * CellConfigSheet - Drawer for configuring individual composition cells
   *
   * Allows users to:
   * - Choose cell type (single or tunnel)
   * - Select sequences for the cell
   * - Configure trail settings
   * - Set rotation offset
   */

  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import { getCompositionState } from "../../state/composition-state.svelte";
  import type { CellType } from "../../domain/types";

  interface Props {
    isOpen: boolean;
    cellId: string | null;
    onClose: () => void;
  }

  let { isOpen = $bindable(), cellId, onClose }: Props = $props();

  const compState = getCompositionState();

  // Get the cell being configured
  const cell = $derived(
    cellId ? compState.composition.cells.find((c) => c.id === cellId) : null
  );

  // Cell type options
  const cellTypes: { value: CellType; label: string; icon: string; description: string }[] = [
    {
      value: "single",
      label: "Single",
      icon: "fa-square",
      description: "One sequence fills the cell",
    },
    {
      value: "tunnel",
      label: "Tunnel",
      icon: "fa-layer-group",
      description: "2-4 sequences overlaid",
    },
  ];

  // Rotation options
  const rotationOptions = [0, 90, 180, 270];

  function handleTypeChange(type: CellType) {
    if (cellId) {
      compState.setCellType(cellId, type);
    }
  }

  function handleRotationChange(rotation: number) {
    if (cellId) {
      compState.setCellRotation(cellId, rotation);
    }
  }

  function handleClearCell() {
    if (cellId) {
      compState.clearCell(cellId);
      onClose();
    }
  }

  function handleBrowseSequences() {
    // TODO: Open sequence browser modal/sheet
    console.log("Browse sequences - coming soon");
  }
</script>

<Drawer bind:isOpen placement="right" ariaLabel="Configure cell">
  <div class="cell-config-sheet">
    {#if cell}
      <header class="sheet-header">
        <h2 class="sheet-title">Configure Cell</h2>
        <p class="sheet-subtitle">Cell {cellId}</p>
      </header>

      <!-- Cell Type Selection -->
      <section class="config-section">
        <h3 class="section-title">Cell Type</h3>
        <div class="type-options">
          {#each cellTypes as option}
            <button
              class="type-option"
              class:selected={cell.type === option.value}
              onclick={() => handleTypeChange(option.value)}
            >
              <i class="fas {option.icon}"></i>
              <div class="option-info">
                <span class="option-label">{option.label}</span>
                <span class="option-description">{option.description}</span>
              </div>
            </button>
          {/each}
        </div>
      </section>

      <!-- Sequences Section -->
      <section class="config-section">
        <h3 class="section-title">
          Sequences
          <span class="sequence-count">
            {cell.sequences.length}/{cell.type === "tunnel" ? 4 : 1}
          </span>
        </h3>

        {#if cell.sequences.length === 0}
          <div class="empty-sequences">
            <i class="fas fa-film"></i>
            <p>No sequences assigned</p>
            <button class="add-sequence-btn" onclick={handleBrowseSequences}>
              <i class="fas fa-plus"></i>
              Browse Sequences
            </button>
          </div>
        {:else}
          <div class="sequence-list">
            {#each cell.sequences as sequence, index}
              <div class="sequence-item">
                <div class="sequence-info">
                  <span class="sequence-name">{sequence.name}</span>
                  <span class="sequence-beats">{sequence.beats?.length ?? 0} beats</span>
                </div>
                <button
                  class="remove-btn"
                  onclick={() => cellId && compState.removeSequenceFromCell(cellId, index)}
                  title="Remove sequence"
                  aria-label="Remove sequence"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            {/each}

            {#if cell.sequences.length < (cell.type === "tunnel" ? 4 : 1)}
              <button class="add-more-btn" onclick={handleBrowseSequences}>
                <i class="fas fa-plus"></i>
                Add {cell.type === "tunnel" ? "Another" : ""} Sequence
              </button>
            {/if}
          </div>
        {/if}
      </section>

      <!-- Rotation Section (for single cells) -->
      {#if cell.type === "single"}
        <section class="config-section">
          <h3 class="section-title">Rotation</h3>
          <div class="rotation-options">
            {#each rotationOptions as rotation}
              <button
                class="rotation-btn"
                class:selected={cell.rotationOffset === rotation}
                onclick={() => handleRotationChange(rotation)}
              >
                <i
                  class="fas fa-arrow-up"
                  style:transform="rotate({rotation}deg)"
                ></i>
                <span>{rotation}°</span>
              </button>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Trail Settings Preview -->
      <section class="config-section">
        <h3 class="section-title">Trail Settings</h3>
        <div class="trail-preview">
          <p class="coming-soon">Trail customization coming soon</p>
          <div class="trail-summary">
            <span>Width: {cell.trailSettings.lineWidth}px</span>
            <span>Opacity: {(cell.trailSettings.maxOpacity * 100).toFixed(0)}%</span>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <div class="sheet-actions">
        <button class="action-btn clear-btn" onclick={handleClearCell}>
          <i class="fas fa-trash-alt"></i>
          Clear Cell
        </button>
        <button class="action-btn done-btn" onclick={onClose}>
          Done
        </button>
      </div>
    {:else}
      <div class="no-cell">
        <p>No cell selected</p>
      </div>
    {/if}
  </div>
</Drawer>

<style>
  .cell-config-sheet {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg, 24px);
    padding: var(--spacing-md, 16px);
    min-width: 280px;
    max-width: 360px;
    height: 100%;
    overflow-y: auto;
  }

  .sheet-header {
    text-align: center;
    padding-bottom: var(--spacing-md, 16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .sheet-title {
    font-size: clamp(1.1rem, 2.5vmin, 1.3rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 4px 0;
  }

  .sheet-subtitle {
    font-size: clamp(0.75rem, 1.8vmin, 0.9rem);
    color: rgba(255, 255, 255, 0.5);
    margin: 0;
    font-family: monospace;
  }

  /* Sections */
  .config-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm, 8px);
  }

  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: clamp(0.8rem, 2vmin, 0.95rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .sequence-count {
    font-size: 0.8em;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Type Options */
  .type-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
  }

  .type-option {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.15s ease;
    text-align: left;
  }

  .type-option:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .type-option.selected {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.6);
  }

  .type-option i {
    font-size: 1.2em;
    width: 24px;
    text-align: center;
  }

  .option-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .option-label {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .option-description {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Sequences */
  .empty-sequences {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm, 8px);
    padding: var(--spacing-lg, 24px);
    background: rgba(255, 255, 255, 0.03);
    border: 2px dashed rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
  }

  .empty-sequences i {
    font-size: 2rem;
    opacity: 0.5;
  }

  .empty-sequences p {
    margin: 0;
    font-size: 0.9rem;
  }

  .add-sequence-btn,
  .add-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: 6px;
    color: rgba(16, 185, 129, 1);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-sequence-btn:hover,
  .add-more-btn:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.6);
  }

  .sequence-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs, 4px);
  }

  .sequence-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm, 8px);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
  }

  .sequence-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sequence-name {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .sequence-beats {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .remove-btn {
    padding: 6px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .remove-btn:hover {
    color: rgba(239, 68, 68, 0.9);
  }

  /* Rotation Options */
  .rotation-options {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--spacing-xs, 4px);
  }

  .rotation-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: var(--spacing-sm, 8px);
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .rotation-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .rotation-btn.selected {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.6);
    color: rgba(255, 255, 255, 0.95);
  }

  .rotation-btn i {
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  .rotation-btn span {
    font-size: 0.75rem;
  }

  /* Trail Settings */
  .trail-preview {
    padding: var(--spacing-md, 16px);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .coming-soon {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.4);
    margin: 0 0 var(--spacing-sm, 8px) 0;
    font-style: italic;
  }

  .trail-summary {
    display: flex;
    gap: var(--spacing-md, 16px);
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Actions */
  .sheet-actions {
    display: flex;
    gap: var(--spacing-sm, 8px);
    margin-top: auto;
    padding-top: var(--spacing-md, 16px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-btn {
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: rgba(239, 68, 68, 0.9);
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .done-btn {
    background: rgba(59, 130, 246, 0.3);
    border: 1px solid rgba(59, 130, 246, 0.5);
    color: rgba(255, 255, 255, 0.95);
  }

  .done-btn:hover {
    background: rgba(59, 130, 246, 0.4);
    border-color: rgba(59, 130, 246, 0.7);
  }

  /* No Cell State */
  .no-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .type-option,
    .rotation-btn,
    .action-btn {
      transition: none;
    }
  }
</style>
