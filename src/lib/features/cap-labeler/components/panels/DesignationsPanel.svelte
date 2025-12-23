<script lang="ts">
  import type { CAPDesignation } from "../../domain/models/label-models";
  import type { SectionDesignation } from "../../domain/models/section-models";
  import type { BeatPairRelationship } from "../../domain/models/beatpair-models";
  import {
    formatDesignation,
    formatSectionBeats,
  } from "../../utils/formatting";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    // Designations from all modes
    wholeDesignations: CAPDesignation[];
    sectionDesignations: SectionDesignation[];
    beatPairDesignations: BeatPairRelationship[];
    isFreeform: boolean;

    // Actions
    onRemoveWholeDesignation: (index: number) => void;
    onRemoveSectionDesignation: (index: number) => void;
    onRemoveBeatPairDesignation: (index: number) => void;
    onSetFreeform: () => void;
    onMarkUnknown: () => void;
    onSaveAndNext: () => void;
    canSave: boolean;
  }

  let {
    wholeDesignations,
    sectionDesignations,
    beatPairDesignations,
    isFreeform,
    onRemoveWholeDesignation,
    onRemoveSectionDesignation,
    onRemoveBeatPairDesignation,
    onSetFreeform,
    onMarkUnknown,
    onSaveAndNext,
    canSave,
  }: Props = $props();

  // Total designation count
  const totalCount = $derived(
    wholeDesignations.length +
      sectionDesignations.length +
      beatPairDesignations.length
  );

  // Format beat pair for display
  function formatBeatPair(bp: BeatPairRelationship): string {
    const transformation = bp.confirmedTransformation || "Unknown";
    return `Beat ${bp.keyBeat} ↔ ${bp.correspondingBeat}: ${transformation}`;
  }

  // Format section designation
  function formatSection(s: SectionDesignation): string {
    const beats = formatSectionBeats(s.beats);
    const label = formatDesignation(s);
    return `${beats}: ${label}`;
  }
</script>

<div class="designations-panel">
  <h3 class="panel-title">Designations</h3>

  <div class="designations-list">
    {#if totalCount === 0 && !isFreeform}
      <div class="empty-state">
        <span class="empty-text">No designations yet</span>
        <span class="empty-hint">Use the tools below to add designations</span>
      </div>
    {:else}
      <!-- Whole sequence designations -->
      {#each wholeDesignations as d, i}
        <div class="designation-item whole">
          <span class="designation-badge">W</span>
          <span class="designation-label">{formatDesignation(d)}</span>
          <button
            class="remove-btn"
            onclick={() => onRemoveWholeDesignation(i)}
            title="Remove"
          >
            <FontAwesomeIcon icon="xmark" size="0.85em" />
          </button>
        </div>
      {/each}

      <!-- Section designations -->
      {#each sectionDesignations as s, i}
        <div class="designation-item section">
          <span class="designation-badge">S</span>
          <span class="designation-label">{formatSection(s)}</span>
          <button
            class="remove-btn"
            onclick={() => onRemoveSectionDesignation(i)}
            title="Remove"
          >
            <FontAwesomeIcon icon="xmark" size="0.85em" />
          </button>
        </div>
      {/each}

      <!-- Beat pair designations -->
      {#each beatPairDesignations as bp, i}
        <div class="designation-item beatpair">
          <span class="designation-badge">P</span>
          <span class="designation-label">{formatBeatPair(bp)}</span>
          <button
            class="remove-btn"
            onclick={() => onRemoveBeatPairDesignation(i)}
            title="Remove"
          >
            <FontAwesomeIcon icon="xmark" size="0.85em" />
          </button>
        </div>
      {/each}

      <!-- Freeform indicator -->
      {#if isFreeform}
        <div class="designation-item freeform">
          <span class="designation-badge">F</span>
          <span class="designation-label"
            >Freeform (no recognizable pattern)</span
          >
        </div>
      {/if}
    {/if}
  </div>

  <!-- Action buttons -->
  <div class="action-buttons">
    <button
      class="action-btn freeform"
      class:selected={isFreeform}
      onclick={onSetFreeform}
    >
      Freeform
    </button>

    <button class="action-btn unknown" onclick={onMarkUnknown}>
      Unknown
    </button>

    <button class="action-btn save" onclick={onSaveAndNext} disabled={!canSave}>
      Save & Next
    </button>
  </div>
</div>

<style>
  .designations-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 12px);
    background: var(--surface-raised, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    border-radius: var(--radius-lg, 12px);
  }

  .panel-title {
    margin: 0;
    font-size: var(--text-sm, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
  }

  .designations-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    min-height: 40px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-md, 12px);
    color: var(--text-faint, rgba(255, 255, 255, 0.3));
  }

  .empty-text {
    font-size: var(--text-md, 13px);
  }

  .empty-hint {
    font-size: var(--text-xs, 11px);
    margin-top: 2px;
  }

  .designation-item {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    border-radius: var(--radius-md, 8px);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .designation-item.whole {
    background: linear-gradient(
      135deg,
      rgba(99, 102, 241, 0.12) 0%,
      rgba(139, 92, 246, 0.08) 100%
    );
    border-color: rgba(99, 102, 241, 0.25);
  }

  .designation-item.section {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.12) 0%,
      rgba(99, 102, 241, 0.08) 100%
    );
    border-color: rgba(59, 130, 246, 0.25);
  }

  .designation-item.beatpair {
    background: linear-gradient(
      135deg,
      rgba(168, 85, 247, 0.12) 0%,
      rgba(139, 92, 246, 0.08) 100%
    );
    border-color: rgba(168, 85, 247, 0.25);
  }

  .designation-item.freeform {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.12) 0%,
      rgba(220, 38, 38, 0.08) 100%
    );
    border-color: rgba(239, 68, 68, 0.25);
  }

  .designation-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .whole .designation-badge {
    background: rgba(99, 102, 241, 0.3);
    color: #a5b4fc;
  }

  .section .designation-badge {
    background: rgba(59, 130, 246, 0.3);
    color: #93c5fd;
  }

  .beatpair .designation-badge {
    background: rgba(168, 85, 247, 0.3);
    color: #c4b5fd;
  }

  .freeform .designation-badge {
    background: rgba(239, 68, 68, 0.3);
    color: #fca5a5;
  }

  .designation-label {
    flex: 1;
    font-size: var(--text-sm, 12px);
    font-weight: 500;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm, 6px);
    color: var(--text-muted, rgba(255, 255, 255, 0.4));
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: var(--accent-danger, #ef4444);
  }

  /* Action buttons */
  .action-buttons {
    display: flex;
    gap: var(--space-sm, 8px);
    margin-top: var(--space-xs, 4px);
  }

  .action-btn {
    flex: 1;
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    border-radius: var(--radius-md, 8px);
    font-size: var(--text-sm, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn.freeform {
    background: var(--surface-overlay, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.1));
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  }

  .action-btn.freeform:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .action-btn.freeform.selected {
    background: rgba(239, 68, 68, 0.2);
    border-color: var(--accent-danger, #ef4444);
    color: var(--text-primary, #fff);
  }

  .action-btn.unknown {
    background: rgba(234, 179, 8, 0.15);
    border: 1px solid rgba(234, 179, 8, 0.3);
    color: #eab308;
  }

  .action-btn.unknown:hover {
    background: rgba(234, 179, 8, 0.25);
  }

  .action-btn.save {
    flex: 2;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    color: var(--text-primary, #fff);
  }

  .action-btn.save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .action-btn.save:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
