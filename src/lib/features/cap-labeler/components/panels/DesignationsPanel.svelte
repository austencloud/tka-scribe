<script lang="ts">
  /**
   * Designations Panel
   *
   * Unified display for all designation types (whole, section, beat pair).
   * This is the "what you're building" panel - the single source of truth.
   * Supports multiple candidate designations with individual confirm/deny.
   */
  import type {
    CAPDesignation,
    CandidateDesignation,
    BeatPairGroups,
  } from "../../domain/models/label-models";
  import type { SectionDesignation } from "../../domain/models/section-models";
  import type { BeatPairRelationship } from "../../domain/models/beatpair-models";
  import {
    formatDesignation,
    formatSectionBeats,
  } from "../../utils/formatting";
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";
  import BeatPairAnalysisDisplay from "../shared/BeatPairAnalysisDisplay.svelte";

  interface Props {
    wholeDesignations: CAPDesignation[];
    sectionDesignations: SectionDesignation[];
    beatPairDesignations: BeatPairRelationship[];
    isFreeform: boolean;
    needsVerification?: boolean;
    autoDetectedDesignations?: CAPDesignation[];
    candidateDesignations?: CandidateDesignation[];
    autoDetectedBeatPairs?: BeatPairRelationship[];
    autoDetectedBeatPairGroups?: BeatPairGroups;
    onRemoveWholeDesignation: (index: number) => void;
    onRemoveSectionDesignation: (index: number) => void;
    onRemoveBeatPairDesignation: (index: number) => void;
    onSetFreeform: () => void;
    onMarkUnknown: () => void;
    onSaveAndNext: () => void;
    onConfirmAutoLabel?: () => void;
    onConfirmCandidate?: (index: number) => void;
    onDenyCandidate?: (index: number) => void;
    onConfirmAllCandidates?: () => void;
    canSave: boolean;
  }

  let {
    wholeDesignations,
    sectionDesignations,
    beatPairDesignations,
    isFreeform,
    needsVerification = false,
    autoDetectedDesignations = [],
    candidateDesignations = [],
    autoDetectedBeatPairs = [],
    autoDetectedBeatPairGroups = {},
    onRemoveWholeDesignation,
    onRemoveSectionDesignation,
    onRemoveBeatPairDesignation,
    onSetFreeform,
    onMarkUnknown,
    onSaveAndNext,
    onConfirmAutoLabel,
    onConfirmCandidate,
    onDenyCandidate,
    onConfirmAllCandidates,
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

  // Check if there are multiple unconfirmed candidates
  const hasMultipleCandidates = $derived(candidateDesignations.length > 1);

  // Filter to show only pending candidates (not yet confirmed or denied)
  const pendingCandidates = $derived(
    candidateDesignations.filter((c) => !c.confirmed && !c.denied)
  );

  // Debug logging
  $effect(() => {
    console.log("[DesignationsPanel] Props update:", {
      needsVerification,
      candidateCount: candidateDesignations.length,
      pendingCount: pendingCandidates.length,
      candidates: candidateDesignations.map(c => c.label),
    });
  });

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

  <!-- Multiple Candidate Designations -->
  {#if needsVerification && pendingCandidates.length > 0}
    <div class="candidates-section">
      <div class="candidates-header">
        <FontAwesomeIcon icon="robot" size="1em" />
        <span>
          {#if hasMultipleCandidates}
            {pendingCandidates.length} equally valid designations detected
          {:else}
            Auto-detected designation
          {/if}
        </span>
      </div>

      <div class="candidates-list">
        {#each candidateDesignations as candidate, i}
          {#if !candidate.confirmed && !candidate.denied}
            <div class="candidate-card">
              <div class="candidate-content">
                <span class="candidate-description">{candidate.description}</span>
                <span class="candidate-label">{candidate.label}</span>
              </div>
              <div class="candidate-actions">
                {#if onConfirmCandidate}
                  <button
                    class="candidate-btn confirm"
                    onclick={() => onConfirmCandidate(i)}
                    title="Confirm this designation"
                  >
                    <FontAwesomeIcon icon="check" size="0.85em" />
                  </button>
                {/if}
                {#if onDenyCandidate}
                  <button
                    class="candidate-btn deny"
                    onclick={() => onDenyCandidate(i)}
                    title="Deny this designation"
                  >
                    <FontAwesomeIcon icon="xmark" size="0.85em" />
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- Confirm button(s) at bottom -->
      {#if pendingCandidates.length > 0}
        {#if hasMultipleCandidates && onConfirmAllCandidates}
          <button class="confirm-all-btn" onclick={onConfirmAllCandidates}>
            <FontAwesomeIcon icon="check-double" size="0.9em" />
            Confirm All ({pendingCandidates.length})
          </button>
        {:else if onConfirmAutoLabel}
          <button class="confirm-all-btn" onclick={onConfirmAutoLabel}>
            <FontAwesomeIcon icon="check" size="0.9em" />
            Confirm
          </button>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Legacy: Single auto-detected designation (fallback) -->
  {#if needsVerification && autoDetectedDesignations.length > 0 && candidateDesignations.length === 0}
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

  <!-- Auto-detected beat-pair analysis -->
  {#if autoDetectedBeatPairs.length > 0}
    <BeatPairAnalysisDisplay
      beatPairs={autoDetectedBeatPairs}
      beatPairGroups={autoDetectedBeatPairGroups}
      collapsed={false}
    />
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

  /* Candidate Designations Section */
  .candidates-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(234, 179, 8, 0.06) 100%);
    border: 1px solid rgba(234, 179, 8, 0.25);
    border-radius: 10px;
    margin-bottom: var(--spacing-xs);
  }

  .candidates-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: #eab308;
    font-size: var(--font-size-sm);
    font-weight: 500;
  }

  .candidates-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .candidate-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    transition: var(--transition-micro);
  }

  .candidate-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .candidate-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .candidate-description {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--foreground);
  }

  .candidate-label {
    font-size: var(--font-size-xs);
    color: var(--muted-foreground);
    font-family: var(--font-mono, monospace);
  }

  .candidate-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .candidate-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: var(--transition-micro);
  }

  .candidate-btn.confirm {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .candidate-btn.confirm:hover {
    background: rgba(34, 197, 94, 0.35);
    transform: scale(1.05);
  }

  .candidate-btn.deny {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .candidate-btn.deny:hover {
    background: rgba(239, 68, 68, 0.3);
    transform: scale(1.05);
  }

  .confirm-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(34, 197, 94, 0.2);
    border: 1px solid rgba(34, 197, 94, 0.4);
    border-radius: 8px;
    color: #22c55e;
    font-size: var(--font-size-sm);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .confirm-all-btn:hover {
    background: rgba(34, 197, 94, 0.3);
    border-color: rgba(34, 197, 94, 0.6);
  }

  /* Auto-detected banner (legacy fallback) */
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
