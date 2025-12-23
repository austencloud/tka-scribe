<script lang="ts">
  /**
   * Designations Panel
   *
   * Unified display for all designation types (whole, section, beat pair).
   * This is the "what you're building" panel - the single source of truth.
   */
  import type { CAPDesignation } from "../../domain/models/label-models";
  import type { SectionDesignation } from "../../domain/models/section-models";
  import type { BeatPairRelationship } from "../../domain/models/beatpair-models";
  import {
    formatDesignation,
    formatSectionBeats,
  } from "../../utils/formatting";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    wholeDesignations: CAPDesignation[];
    sectionDesignations: SectionDesignation[];
    beatPairDesignations: BeatPairRelationship[];
    isFreeform: boolean;
    needsVerification?: boolean;
    autoDetectedDesignations?: CAPDesignation[];
    onRemoveWholeDesignation: (index: number) => void;
    onRemoveSectionDesignation: (index: number) => void;
    onRemoveBeatPairDesignation: (index: number) => void;
    onSetFreeform: () => void;
    onMarkUnknown: () => void;
    onSaveAndNext: () => void;
    onConfirmAutoLabel?: () => void;
    canSave: boolean;
  }

  let {
    wholeDesignations,
    sectionDesignations,
    beatPairDesignations,
    isFreeform,
    needsVerification = false,
    autoDetectedDesignations = [],
    onRemoveWholeDesignation,
    onRemoveSectionDesignation,
    onRemoveBeatPairDesignation,
    onSetFreeform,
    onMarkUnknown,
    onSaveAndNext,
    onConfirmAutoLabel,
    canSave,
  }: Props = $props();

  // Format intervals for display
  function formatIntervals(d: CAPDesignation): string {
    if (!d.transformationIntervals) return "";
    const entries = Object.entries(d.transformationIntervals)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}: ${v === "halved" ? "½" : v === "quartered" ? "¼" : v}`);
    return entries.length > 0 ? `(${entries.join(", ")})` : "";
  }

  // Get display text for auto-detected designation
  function formatAutoDetected(d: CAPDesignation): string {
    const components = d.components?.join(" + ") || "None";
    const intervals = formatIntervals(d);
    return intervals ? `${components} ${intervals}` : components;
  }

  const totalCount = $derived(
    wholeDesignations.length +
      sectionDesignations.length +
      beatPairDesignations.length
  );

  function formatBeatPair(bp: BeatPairRelationship): string {
    const transformation = bp.confirmedTransformation || "Unknown";
    return `Beat ${bp.keyBeat} ↔ ${bp.correspondingBeat}: ${transformation}`;
  }

  function formatSection(s: SectionDesignation): string {
    const beats = formatSectionBeats(s.beats);
    const label = formatDesignation(s);
    return `${beats}: ${label}`;
  }
</script>

<div class="designations-panel">
  <h3 class="panel-title">Designations</h3>

  {#if needsVerification && autoDetectedDesignations.length > 0}
    <div class="auto-detected-banner">
      <div class="banner-content">
        <div class="banner-header">
          <FontAwesomeIcon icon="robot" size="1em" />
          <span>Auto-detected:</span>
        </div>
        {#each autoDetectedDesignations as d}
          <span class="detected-type">{formatAutoDetected(d)}</span>
        {/each}
      </div>
      {#if onConfirmAutoLabel}
        <button class="confirm-btn" onclick={onConfirmAutoLabel}>
          <FontAwesomeIcon icon="check" size="0.9em" />
          Confirm
        </button>
      {/if}
    </div>
  {/if}

  <div class="designations-list">
    {#if totalCount === 0 && !isFreeform}
      <div class="empty-state">
        <span class="empty-text">No designations yet</span>
        <span class="empty-hint">1. Select components below → 2. Click "+ Add to designations"</span>
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
          <span class="designation-label">Freeform (no recognizable pattern)</span>
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
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: var(--surface-glass);
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
  }

  .panel-title {
    margin: 0;
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted-foreground);
  }

  .designations-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 48px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--spacing-md);
    color: var(--muted);
  }

  .empty-text {
    font-size: var(--font-size-sm);
  }

  .empty-hint {
    font-size: var(--font-size-xs);
    margin-top: 2px;
  }

  /* Auto-detected banner */
  .auto-detected-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.08) 100%);
    border: 1px solid rgba(234, 179, 8, 0.3);
    border-radius: 8px;
    margin-bottom: var(--spacing-xs);
  }

  .banner-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .banner-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: #eab308;
    font-size: var(--font-size-sm);
  }

  .detected-type {
    font-weight: 600;
    color: var(--foreground);
    font-size: var(--font-size-sm);
    padding-left: 1.5em;
  }

  .confirm-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 6px;
    color: #22c55e;
    font-size: var(--font-size-xs);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .confirm-btn:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  .designation-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .designation-item.whole {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
    border-color: rgba(99, 102, 241, 0.25);
  }

  .designation-item.section {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%);
    border-color: rgba(59, 130, 246, 0.25);
  }

  .designation-item.beatpair {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%);
    border-color: rgba(168, 85, 247, 0.25);
  }

  .designation-item.freeform {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%);
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
    font-size: var(--font-size-sm);
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
    width: 24px;
    height: 24px;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: var(--transition-micro);
    flex-shrink: 0;
  }

  .remove-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  /* Action buttons */
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-xs);
  }

  .action-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: 8px;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
    min-height: var(--min-touch-target);
  }

  .action-btn.freeform {
    background: transparent;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    color: var(--muted-foreground);
    font-weight: 500;
  }

  .action-btn.freeform:hover {
    background: var(--surface-color);
    color: var(--foreground);
  }

  .action-btn.freeform.selected {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.4);
    color: #fca5a5;
  }

  .action-btn.unknown {
    background: transparent;
    border: 1px solid rgba(234, 179, 8, 0.25);
    color: var(--muted-foreground);
    font-weight: 500;
  }

  .action-btn.unknown:hover {
    background: rgba(234, 179, 8, 0.15);
    border-color: rgba(234, 179, 8, 0.4);
    color: #eab308;
  }

  .action-btn.save {
    flex: 2;
    background: var(--gradient-primary);
    border: none;
    color: var(--foreground);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
  }

  .action-btn.save:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.5);
  }

  .action-btn.save:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    box-shadow: none;
  }
</style>
