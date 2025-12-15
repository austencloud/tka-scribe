<script lang="ts">
  /**
   * CellConfigPanel - Slide-out panel for cell configuration
   *
   * Opens when clicking a cell in the composition canvas.
   * Responsive behavior:
   * - Slides from right on desktop (≥768px)
   * - Slides from bottom on mobile (<768px)
   *
   * Panel Contents:
   * - Sequence preview (current cell content)
   * - Media type toggle (animation, video, beat grid, image)
   * - Cell type (single/tunnel)
   * - Sequence list with add/remove
   * - Rotation controls
   * - "Browse Sequences" button (opens stacked panel)
   */

  import { onMount } from "svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import SequenceBrowserPanel from "$lib/shared/animation-engine/components/SequenceBrowserPanel.svelte";
  import { getCompositionState } from "../../state/composition-state.svelte";
  import type { CellType, MediaDisplayType } from "../../domain/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  const compState = getCompositionState();

  // Responsive placement detection
  let isDesktop = $state(false);
  const placement = $derived<"right" | "bottom">(isDesktop ? "right" : "bottom");

  function updateDesktopState() {
    isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  }

  onMount(() => {
    updateDesktopState();
    window.addEventListener("resize", updateDesktopState);
    return () => window.removeEventListener("resize", updateDesktopState);
  });

  // Reactive bindings
  const isOpen = $derived(compState.isCellConfigOpen);
  const selectedCellId = $derived(compState.selectedCellId);
  const cell = $derived(
    selectedCellId
      ? compState.composition.cells.find((c) => c.id === selectedCellId)
      : null
  );

  // Sequence browser state (stacked on top of this panel)
  let showSequenceBrowser = $state(false);

  // Cell type options
  const cellTypes: { value: CellType; label: string; icon: string }[] = [
    { value: "single", label: "Single", icon: "fa-square" },
    { value: "tunnel", label: "Tunnel", icon: "fa-layer-group" },
  ];

  // Media display type options
  const mediaTypes: { value: MediaDisplayType; label: string; icon: string }[] = [
    { value: "animation", label: "Animation", icon: "fa-play-circle" },
    { value: "video", label: "Video", icon: "fa-video" },
    { value: "beatGrid", label: "Beat Grid", icon: "fa-th" },
    { value: "image", label: "Image", icon: "fa-image" },
  ];

  // Rotation options
  const rotationOptions = [0, 90, 180, 270];

  // Handlers
  function handleClose() {
    compState.closeCellConfig();
  }

  function handleTypeChange(type: CellType) {
    if (selectedCellId) {
      compState.setCellType(selectedCellId, type);
    }
  }

  function handleMediaTypeChange(mediaType: MediaDisplayType) {
    if (selectedCellId) {
      compState.setCellMediaType(selectedCellId, mediaType);
    }
  }

  function handleRotationChange(rotation: number) {
    if (selectedCellId) {
      compState.setCellRotation(selectedCellId, rotation);
    }
  }

  function handleClearCell() {
    if (selectedCellId) {
      compState.clearCell(selectedCellId);
    }
  }

  function handleBrowseSequences() {
    showSequenceBrowser = true;
  }

  function handleSequenceSelect(sequence: SequenceData) {
    if (selectedCellId) {
      compState.addSequenceToCell(selectedCellId, sequence);
    }
    showSequenceBrowser = false;
  }

  function handleSequenceBrowserClose() {
    showSequenceBrowser = false;
  }

  function handleRemoveSequence(index: number) {
    if (selectedCellId) {
      compState.removeSequenceFromCell(selectedCellId, index);
    }
  }

  // Get current media type or default
  const currentMediaType = $derived(cell?.mediaType ?? "animation");
  const maxSequences = $derived(cell?.type === "tunnel" ? 4 : 1);
  const canAddMore = $derived((cell?.sequences.length ?? 0) < maxSequences);
</script>

<Drawer
  isOpen={isOpen}
  {placement}
  ariaLabel="Configure cell"
  class="cell-config-panel"
  showHandle={true}
  onclose={handleClose}
>
  <div class="panel-content">
    {#if cell}
      <!-- Header -->
      <header class="panel-header">
        <h3 class="panel-title">Cell Config</h3>
        <button
          class="close-btn"
          onclick={handleClose}
          title="Close"
          aria-label="Close panel"
        >
          <i class="fas fa-times"></i>
        </button>
      </header>

      <!-- Sequence Preview (placeholder for now) -->
      <section class="panel-section preview-section">
        <div class="preview-container">
          {#if cell.sequences.length > 0}
            <div class="preview-placeholder">
              <i class="fas fa-film"></i>
              <span>{cell.sequences[0]?.name}</span>
            </div>
          {:else}
            <div class="preview-empty">
              <i class="fas fa-plus-circle"></i>
              <span>No sequence</span>
            </div>
          {/if}
        </div>
      </section>

      <!-- Media Type Toggle -->
      <section class="panel-section">
        <span class="section-label">Display As</span>
        <div class="media-type-grid">
          {#each mediaTypes as option}
            <button
              class="type-chip"
              class:selected={currentMediaType === option.value}
              onclick={() => handleMediaTypeChange(option.value)}
              title={option.label}
              aria-label={option.label}
            >
              <i class="fas {option.icon}"></i>
              <span>{option.label}</span>
            </button>
          {/each}
        </div>
      </section>

      <!-- Cell Type -->
      <section class="panel-section">
        <span class="section-label">Cell Type</span>
        <div class="cell-type-toggle">
          {#each cellTypes as option}
            <button
              class="type-btn"
              class:selected={cell.type === option.value}
              onclick={() => handleTypeChange(option.value)}
              title={option.label}
              aria-label={option.label}
            >
              <i class="fas {option.icon}"></i>
              <span>{option.label}</span>
            </button>
          {/each}
        </div>
      </section>

      <!-- Sequences -->
      <section class="panel-section">
        <span class="section-label">
          Sequences
          <span class="count">{cell.sequences.length}/{maxSequences}</span>
        </span>

        {#if cell.sequences.length === 0}
          <button class="add-sequence-btn" onclick={handleBrowseSequences}>
            <i class="fas fa-plus"></i>
            <span>Add Sequence</span>
          </button>
        {:else}
          <div class="sequence-list">
            {#each cell.sequences as sequence, index}
              <div class="sequence-chip">
                <span class="chip-name">{sequence.name}</span>
                <button
                  class="chip-remove"
                  onclick={() => handleRemoveSequence(index)}
                  title="Remove"
                  aria-label="Remove {sequence.name}"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            {/each}

            {#if canAddMore}
              <button class="add-more-btn" onclick={handleBrowseSequences}>
                <i class="fas fa-plus"></i>
                <span>Add Another</span>
              </button>
            {/if}
          </div>
        {/if}
      </section>

      <!-- Rotation (single mode only) -->
      {#if cell.type === "single"}
        <section class="panel-section">
          <span class="section-label">Rotation</span>
          <div class="rotation-grid">
            {#each rotationOptions as rotation}
              <button
                class="rotation-btn"
                class:selected={cell.rotationOffset === rotation}
                onclick={() => handleRotationChange(rotation)}
                title="{rotation}°"
                aria-label="Rotate {rotation} degrees"
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

      <!-- Actions -->
      <div class="panel-actions">
        {#if cell.sequences.length > 0}
          <button class="action-btn clear-btn" onclick={handleClearCell}>
            <i class="fas fa-trash-alt"></i>
            Clear
          </button>
        {/if}
        <button class="action-btn swap-btn" onclick={handleBrowseSequences}>
          <i class="fas fa-exchange-alt"></i>
          Swap
        </button>
      </div>
    {:else}
      <div class="no-selection">
        <i class="fas fa-mouse-pointer"></i>
        <p>Select a cell to configure</p>
      </div>
    {/if}
  </div>
</Drawer>

<!-- Sequence Browser Panel (stacked on top) -->
<SequenceBrowserPanel
  mode="primary"
  show={showSequenceBrowser}
  onSelect={handleSequenceSelect}
  onClose={handleSequenceBrowserClose}
/>

<style>
  /* Override drawer dimensions for this panel */
  /* Right placement (desktop): constrain width */
  :global(.cell-config-panel[data-placement="right"]) {
    width: clamp(280px, 22vw, 360px) !important;
    max-width: 90vw !important;
    height: 100% !important;
  }

  /* Bottom placement (mobile): constrain height */
  :global(.cell-config-panel[data-placement="bottom"]) {
    width: 100% !important;
    max-height: 85vh !important;
  }

  .panel-content {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 3cqi, 20px);
    padding: clamp(12px, 3cqi, 20px);
    height: 100%;
    overflow-y: auto;
    container-type: inline-size;
    container-name: cellpanel;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: clamp(8px, 2cqi, 14px);
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .panel-title {
    margin: 0;
    font-size: clamp(0.9rem, 3.5cqi, 1.1rem);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    border-radius: clamp(4px, 1.5cqi, 8px);
    transition: all 0.15s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Sections */
  .panel-section {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 2cqi, 10px);
  }

  .section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: clamp(0.7rem, 2.5cqi, 0.8rem);
    font-weight: 600;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .count {
    font-weight: 400;
    color: rgba(255, 255, 255, 0.4);
  }

  /* Preview Section */
  .preview-section {
    margin-bottom: clamp(4px, 1cqi, 8px);
  }

  .preview-container {
    aspect-ratio: 1;
    max-height: clamp(120px, 30cqi, 180px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(6px, 2cqi, 12px);
    overflow: hidden;
  }

  .preview-placeholder,
  .preview-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 2cqi, 10px);
    height: 100%;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    text-align: center;
    padding: clamp(8px, 2cqi, 16px);
  }

  .preview-placeholder i,
  .preview-empty i {
    font-size: clamp(1.5rem, 8cqi, 2.5rem);
    opacity: 0.6;
  }

  .preview-placeholder span,
  .preview-empty span {
    font-size: clamp(0.75rem, 2.5cqi, 0.9rem);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Media Type Grid */
  .media-type-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(4px, 1.5cqi, 8px);
  }

  .type-chip {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1.5cqi, 8px);
    min-height: 52px;
    padding: clamp(8px, 2cqi, 12px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(4px, 1.5cqi, 8px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: clamp(0.7rem, 2.5cqi, 0.85rem);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .type-chip:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .type-chip.selected {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    color: var(--theme-accent, #6366f1);
  }

  .type-chip i {
    font-size: 1em;
  }

  /* Cell Type Toggle */
  .cell-type-toggle {
    display: flex;
    gap: clamp(4px, 1.5cqi, 8px);
  }

  .type-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 1.5cqi, 8px);
    min-height: 52px;
    padding: clamp(8px, 2cqi, 12px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(4px, 1.5cqi, 8px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: clamp(0.75rem, 2.5cqi, 0.9rem);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .type-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .type-btn.selected {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    color: var(--theme-accent, #6366f1);
  }

  /* Sequence List */
  .sequence-list {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1.5cqi, 8px);
  }

  .sequence-chip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    padding: clamp(8px, 2cqi, 12px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(4px, 1.5cqi, 8px);
  }

  .chip-name {
    font-size: clamp(0.8rem, 2.8cqi, 0.95rem);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: color 0.15s ease;
    flex-shrink: 0;
  }

  .chip-remove:hover {
    color: rgba(239, 68, 68, 0.9);
  }

  /* Add Sequence Buttons */
  .add-sequence-btn,
  .add-more-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 2cqi, 10px);
    min-height: 52px;
    padding: clamp(10px, 2.5cqi, 14px);
    background: rgba(16, 185, 129, 0.15);
    border: 1px dashed rgba(16, 185, 129, 0.4);
    border-radius: clamp(6px, 2cqi, 10px);
    color: rgba(16, 185, 129, 0.9);
    font-size: clamp(0.8rem, 2.8cqi, 0.95rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .add-sequence-btn:hover,
  .add-more-btn:hover {
    background: rgba(16, 185, 129, 0.25);
    border-color: rgba(16, 185, 129, 0.6);
  }

  /* Rotation Grid */
  .rotation-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: clamp(4px, 1.5cqi, 8px);
  }

  .rotation-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(2px, 1cqi, 4px);
    min-height: 52px;
    padding: clamp(6px, 2cqi, 10px);
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: clamp(4px, 1.5cqi, 8px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .rotation-btn:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .rotation-btn.selected {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    color: var(--theme-accent, #6366f1);
  }

  .rotation-btn i {
    font-size: clamp(0.9rem, 3cqi, 1.1rem);
    transition: transform 0.2s ease;
  }

  .rotation-btn span {
    font-size: clamp(0.65rem, 2cqi, 0.75rem);
  }

  /* Actions */
  .panel-actions {
    display: flex;
    gap: clamp(6px, 2cqi, 10px);
    margin-top: auto;
    padding-top: clamp(12px, 3cqi, 18px);
    border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 2cqi, 10px);
    min-height: 52px;
    padding: clamp(10px, 2.5cqi, 14px);
    border-radius: clamp(6px, 2cqi, 10px);
    font-size: clamp(0.8rem, 2.8cqi, 0.95rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .clear-btn {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: rgba(239, 68, 68, 0.8);
  }

  .clear-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.4);
  }

  .swap-btn {
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.4);
    color: rgba(59, 130, 246, 0.95);
  }

  .swap-btn:hover {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.6);
  }

  /* No Selection State */
  .no-selection {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: clamp(8px, 3cqi, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
    text-align: center;
    padding: clamp(20px, 6cqi, 36px);
  }

  .no-selection i {
    font-size: clamp(1.5rem, 6cqi, 2.2rem);
    opacity: 0.5;
  }

  .no-selection p {
    margin: 0;
    font-size: clamp(0.8rem, 3cqi, 0.95rem);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .type-chip,
    .type-btn,
    .rotation-btn,
    .action-btn,
    .add-sequence-btn {
      transition: none;
    }
  }
</style>
