<script lang="ts">
  import type { SectionDesignation } from "../../domain/models/section-models";
  import type { ComponentId } from "../../domain/constants/cap-components";
  import SavedSectionsList from "../shared/SavedSectionsList.svelte";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";
  import { formatDesignation } from "../../utils/formatting";
  import { BASE_COMPONENTS } from "../../domain/constants/cap-components";
  import { BASE_WORDS } from "../../domain/constants/base-words";

  interface Props {
    selectedBeats: Set<number>;
    selectedComponents: Set<ComponentId>;
    savedSections: SectionDesignation[];
    selectedBaseWord: string | null;
    onBaseWordChange: (baseWord: string | null) => void;
    onAddSection: () => void;
    onRemoveSection: (index: number) => void;
    onMarkUnknown: () => void;
    onNext: () => void;
    canProceed: boolean; // false if there's unsaved work
  }

  let {
    selectedBeats,
    selectedComponents,
    savedSections,
    selectedBaseWord,
    onBaseWordChange,
    onAddSection,
    onRemoveSection,
    onMarkUnknown,
    onNext,
    canProceed,
  }: Props = $props();

  // Compute selection label
  const selectionLabel = $derived(() => {
    if (selectedComponents.size === 0) return "None";
    return Array.from(selectedComponents)
      .map((c) => BASE_COMPONENTS.find((b) => b.id === c)?.label ?? c)
      .join(" + ");
  });
</script>

<div class="section-mode-panel">
  <div class="section-mode-hint">
    Click start beat, then end beat to select range. Pick components or base
    word, then "Add Section".
  </div>

  <!-- Current selection status -->
  {#if selectedBeats.size > 0}
    <div class="current-selection-status">
      <span class="selection-count">{selectedBeats.size} beats selected</span>
      {#if selectedComponents.size > 0}
        <span class="selection-arrow">→</span>
        <span class="selection-components">{selectionLabel()}</span>
      {/if}
    </div>
  {/if}

  <!-- Base Word selector (optional) -->
  <div class="base-word-selector">
    <div class="base-word-header">
      <span class="base-word-label">Base Word (optional):</span>
      {#if selectedBaseWord}
        <button class="clear-base-word" onclick={() => onBaseWordChange(null)}>
          Clear
        </button>
      {/if}
    </div>
    <div class="base-word-chips">
      {#each BASE_WORDS as baseWord}
        <button
          class="base-word-chip"
          class:selected={selectedBaseWord === baseWord.id}
          onclick={() =>
            onBaseWordChange(
              selectedBaseWord === baseWord.id ? null : baseWord.id
            )}
        >
          {baseWord.name}
        </button>
      {/each}
    </div>
  </div>

  <!-- Add Section button -->
  <!-- Can add section if: beats selected AND (components selected OR base word selected) -->
  <button
    class="add-section-btn"
    onclick={onAddSection}
    disabled={selectedBeats.size === 0 ||
      (selectedComponents.size === 0 && !selectedBaseWord)}
  >
    <FontAwesomeIcon icon="plus" size="1em" />
    Add Section
  </button>

  <!-- Unknown button (for sequences that need review) -->
  <button class="unknown-btn" onclick={onMarkUnknown}>
    Unknown - Review Later
  </button>

  <!-- Saved sections -->
  <SavedSectionsList sections={savedSections} onRemove={onRemoveSection} />

  <!-- Next button (disabled if there's unsaved work) -->
  {#if savedSections.length > 0}
    <button
      class="next-btn"
      onclick={onNext}
      disabled={!canProceed}
      title={!canProceed
        ? "Save or clear your current selection first"
        : "Go to next sequence"}
    >
      Next →
    </button>
  {/if}
</div>

<style>
  .section-mode-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 12px);
  }

  .section-mode-hint {
    font-size: var(--text-sm, 12px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--surface-raised, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-sm, 6px);
    border-left: 3px solid var(--accent-primary, #6366f1);
  }

  .current-selection-status {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 12px);
    background: rgba(251, 191, 36, 0.15);
    border: 1px solid rgba(251, 191, 36, 0.5);
    border-radius: var(--radius-md, 8px);
  }

  .selection-count {
    font-weight: 600;
    color: #fbbf24;
  }

  .selection-arrow {
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
  }

  .selection-components {
    color: var(--text-primary, #fff);
  }

  .add-section-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 12px) var(--space-xl, 20px);
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    border-radius: var(--radius-md, 8px);
    color: var(--text-primary, #fff);
    font-size: var(--text-lg, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth, 0.2s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }

  .add-section-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
  }

  .add-section-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .unknown-btn {
    flex: 1;
    padding: var(--space-md, 12px) var(--space-lg, 16px);
    background: rgba(234, 179, 8, 0.15);
    border: 1px solid rgba(234, 179, 8, 0.4);
    border-radius: var(--radius-md, 8px);
    color: #eab308;
    cursor: pointer;
    font-size: var(--text-md, 13px);
    font-weight: 500;
    transition: var(--transition-default, 0.15s ease);
  }

  .unknown-btn:hover {
    background: rgba(234, 179, 8, 0.25);
    border-color: rgba(234, 179, 8, 0.6);
  }

  .base-word-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
  }

  .base-word-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .base-word-label {
    font-size: var(--font-size-compact, 12px);
    font-weight: 500;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  }

  .clear-base-word {
    padding: 2px var(--space-sm, 8px);
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-xs, 4px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    font-size: var(--font-size-xs, 11px);
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
  }

  .clear-base-word:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary, #fff);
  }

  .base-word-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs, 4px);
  }

  .base-word-chip {
    padding: 4px 8px;
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: var(--font-size-compact, 12px);
    font-family: monospace;
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
  }

  .base-word-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--text-primary, #fff);
  }

  .base-word-chip.selected {
    background: rgba(34, 197, 94, 0.25);
    border-color: rgba(34, 197, 94, 0.6);
    color: #4ade80;
  }

  .next-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 12px) var(--space-xl, 20px);
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    border: none;
    border-radius: var(--radius-md, 8px);
    color: var(--text-primary, #fff);
    font-size: var(--text-lg, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-smooth, 0.2s cubic-bezier(0.4, 0, 0.2, 1));
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  }

  .next-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
  }

  .next-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 2px 6px rgba(34, 197, 94, 0.2);
  }
</style>
