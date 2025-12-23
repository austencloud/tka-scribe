<script lang="ts">
  import type { SequenceEntry } from "../../domain/models/sequence-models";
  import type { LabeledSequence } from "../../domain/models/label-models";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import {
    formatSectionBeats,
    formatDesignation,
  } from "../../utils/formatting";

  interface Props {
    sequence: SequenceEntry | null;
    parsedBeats: BeatData[];
    startPosition: StartPositionData | null;
    currentLabel: LabeledSequence | null;
    showStartPosition: boolean;
    manualColumnCount: number | null;
    onShowStartPositionChange: (value: boolean) => void;
    onColumnCountChange: (value: number | null) => void;
    onBeatClick?: (beatNumber: number) => void;
    selectedBeats?: Set<number>;
    labelingMode: "whole" | "section" | "beatpair";
    highlightedBeats?: Map<number, { bg: string; border: string }>;
    selectedBeatNumber?: number | null;
    onCopyJson?: () => void;
    copiedToast?: boolean;
    onDeleteLabel?: () => void;
  }

  let {
    sequence,
    parsedBeats,
    startPosition,
    currentLabel,
    showStartPosition,
    manualColumnCount,
    onShowStartPositionChange,
    onColumnCountChange,
    onBeatClick,
    selectedBeats,
    labelingMode,
    highlightedBeats,
    selectedBeatNumber,
    onCopyJson,
    copiedToast = false,
    onDeleteLabel,
  }: Props = $props();

  // Get authoritative grid mode
  const authoritativeGridMode = $derived(
    sequence?.fullMetadata?.sequence?.[0]?.gridMode ||
      sequence?.gridMode ||
      "diamond"
  );

  // Available column options based on sequence length
  const availableColumnOptions = $derived(() => {
    if (!sequence) return [];
    const length = sequence.sequenceLength;
    const options = [2, 3, 4, 5, 6, 8, 10, 12];
    return options.filter((col) => col <= length);
  });

  // Smart default column count for CAP labeling:
  // - 16 beats (4-letter words) → 4 columns (shows 4 beats per row = 4 letters)
  // - 8 beats (2-letter words) → 4 columns (shows 4 beats per row = 2 letters)
  // - Otherwise use manual or null (auto)
  const smartDefaultColumns = $derived(() => {
    if (!sequence) return null;
    const length = sequence.sequenceLength;
    // For 16-beat sequences, always use 4 columns
    if (length === 16) return 4;
    // For 8-beat sequences, use 4 columns
    if (length === 8) return 4;
    return null; // Let BeatGrid auto-calculate
  });

  // Effective column count (use manual if set, otherwise smart default)
  const effectiveColumnCount = $derived(
    manualColumnCount ?? smartDefaultColumns()
  );
</script>

<div class="sequence-preview">
  <div class="sequence-header">
    <div class="sequence-info">
      <h2>{sequence?.word || "No sequence"}</h2>
      {#if sequence}
        <div class="meta">
          <span class="meta-id" title="Sequence ID">ID: {sequence.id}</span>
          <span>Length: {sequence.sequenceLength}</span>
          <span
            class="grid-mode-badge"
            class:box={authoritativeGridMode === GridMode.BOX}
          >
            {authoritativeGridMode === GridMode.BOX ? "◇ BOX" : "◆ DIAMOND"}
          </span>
          {#if sequence.fullMetadata?.sequence?.[0]?.gridMode && sequence.fullMetadata.sequence[0].gridMode !== sequence.gridMode}
            <span
              class="grid-mode-mismatch"
              title="Top-level gridMode differs from metadata"
            >
              ⚠️ Fix: top says "{sequence.gridMode}"
            </span>
          {/if}
          <span>CAP: {sequence.capType || "none"}</span>
        </div>
      {/if}
    </div>
    {#if onCopyJson}
      <button class="copy-json-btn" onclick={onCopyJson}>
        {copiedToast ? "✓ Copied!" : "Copy JSON"}
      </button>
    {/if}
  </div>

  <!-- BeatGrid with real Pictographs -->
  {#if parsedBeats.length > 0}
    <div class="beat-grid-section">
      <!-- Grid controls bar -->
      <div class="grid-controls-bar">
        <!-- Start position toggle + Column chips -->
        <div class="control-group">
          <button
            class="control-chip"
            class:active={showStartPosition}
            onclick={() => onShowStartPositionChange(!showStartPosition)}
          >
            Start
          </button>
          <span class="control-divider">|</span>
          <span class="control-label">Cols:</span>
          <div class="chip-group">
            <button
              class="control-chip"
              class:active={manualColumnCount === null}
              onclick={() => onColumnCountChange(null)}
            >
              Auto{manualColumnCount === null && effectiveColumnCount !== null
                ? ` (${effectiveColumnCount})`
                : ""}
            </button>
            {#each availableColumnOptions() as colCount}
              <button
                class="control-chip"
                class:active={manualColumnCount === colCount}
                onclick={() => onColumnCountChange(colCount)}
              >
                {colCount}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div
        class="beat-grid-wrapper"
        class:section-mode={labelingMode === "section"}
      >
        <BeatGrid
          beats={parsedBeats}
          startPosition={showStartPosition ? startPosition : null}
          {onBeatClick}
          selectedBeatNumber={labelingMode === "whole"
            ? selectedBeatNumber
            : null}
          manualColumnCount={effectiveColumnCount}
          {highlightedBeats}
          heightSizingRowThreshold={20}
        />
      </div>
    </div>
  {:else}
    <div class="no-thumbnail">No beat data available</div>
  {/if}

  {#if currentLabel}
    <div class="current-label">
      <div class="label-header">
        <strong>Labeled as:</strong>
        {#if onDeleteLabel}
          <button class="delete-label-btn" onclick={onDeleteLabel}>
            Delete Label
          </button>
        {/if}
      </div>
      {#if currentLabel.isFreeform}
        <span class="freeform-tag">Freeform</span>
      {:else if currentLabel.sections && currentLabel.sections.length > 0}
        <!-- Section-based labels -->
        <div class="label-sections">
          {#each currentLabel.sections as section}
            <div class="label-section-item">
              <span class="section-beats"
                >{formatSectionBeats(section.beats)}</span
              >
              <span class="section-components"
                >{formatDesignation(section)}</span
              >
            </div>
          {/each}
        </div>
      {:else if currentLabel.designations?.length > 0}
        <div class="label-designations">
          {#each currentLabel.designations as d, i}
            <span class="designation-tag">
              {formatDesignation(d)}
              <span class="designation-type">({d.capType})</span>
            </span>
            {#if i < currentLabel.designations.length - 1}
              <span class="designation-or">OR</span>
            {/if}
          {/each}
        </div>
      {:else}
        Freeform
      {/if}
      {#if currentLabel.notes}
        <div class="label-notes">Notes: {currentLabel.notes}</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .sequence-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--surface-raised, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-xl, 20px);
    overflow: hidden;
  }

  .sequence-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--space-lg, 16px);
    flex-shrink: 0;
  }

  .sequence-info h2 {
    margin: 0 0 var(--space-md, 12px);
    font-size: var(--text-4xl, 28px);
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-md, 12px);
    font-size: var(--text-md, 13px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
  }

  .meta-id {
    font-family: monospace;
    color: var(--text-faint, rgba(255, 255, 255, 0.4));
    font-size: var(--text-xs, 11px);
  }

  .grid-mode-badge {
    padding: 2px var(--space-sm, 8px);
    border-radius: var(--radius-xs, 4px);
    font-weight: 600;
    font-size: var(--text-xs, 11px);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.3));
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.5);
  }

  .grid-mode-badge.box {
    background: var(--accent-warning-soft, rgba(234, 179, 8, 0.2));
    color: #fde047;
    border-color: rgba(234, 179, 8, 0.5);
  }

  .grid-mode-mismatch {
    font-size: var(--text-xs, 11px);
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.15);
    padding: 2px var(--space-xs, 4px);
    border-radius: var(--radius-xs, 4px);
  }

  .copy-json-btn {
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-strong, rgba(255, 255, 255, 0.2));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-primary, #fff);
    cursor: pointer;
    font-size: var(--text-sm, 12px);
    transition: var(--transition-default, 0.15s ease);
    white-space: nowrap;
  }

  .copy-json-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .beat-grid-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .beat-grid-wrapper {
    width: 100%;
    height: 100%;
    background: var(--surface-inset, rgba(0, 0, 0, 0.3));
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-lg, 16px);
    box-sizing: border-box;
    overflow: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .beat-grid-wrapper.section-mode {
    border: 2px solid rgba(59, 130, 246, 0.4);
    cursor: pointer;
  }

  .no-thumbnail {
    width: 100%;
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-raised, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-md, 8px);
    color: var(--text-faint, rgba(255, 255, 255, 0.4));
  }

  .grid-controls-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-xl, 20px);
    margin-bottom: var(--space-sm, 8px);
    flex-shrink: 0;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
  }

  .control-label {
    font-size: var(--text-xs, 11px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .control-divider {
    color: var(--border-strong, rgba(255, 255, 255, 0.2));
    margin: 0 var(--space-xs, 4px);
  }

  .chip-group {
    display: flex;
    gap: var(--space-xs, 4px);
  }

  .control-chip {
    padding: 5px 10px;
    background: var(--surface-overlay, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--border-default, rgba(255, 255, 255, 0.15));
    border-radius: var(--radius-sm, 6px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: var(--text-sm, 12px);
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
  }

  .control-chip:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--text-primary, #fff);
  }

  .control-chip.active {
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.3));
    border-color: var(--accent-primary, #6366f1);
    color: var(--text-primary, #fff);
  }

  .current-label {
    margin-top: var(--space-lg, 16px);
    padding: var(--space-md, 12px);
    background: var(--accent-primary-soft, rgba(99, 102, 241, 0.3));
    border-radius: var(--radius-md, 8px);
    font-size: var(--text-lg, 14px);
    flex-shrink: 0;
    max-width: 100%;
  }

  .label-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm, 8px);
  }

  .delete-label-btn {
    padding: 4px var(--space-sm, 8px);
    background: var(--accent-danger-soft, rgba(239, 68, 68, 0.2));
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-xs, 4px);
    font-size: var(--text-xs, 11px);
    cursor: pointer;
    transition: var(--transition-default, 0.15s ease);
    white-space: nowrap;
  }

  .delete-label-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.5);
  }

  .label-notes {
    margin-top: var(--space-sm, 8px);
    font-size: var(--text-sm, 12px);
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
  }

  .label-designations {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-sm, 8px);
    margin-top: var(--space-sm, 8px);
  }

  .designation-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    padding: var(--space-xs, 4px) 10px;
    background: var(--accent-success-soft, rgba(34, 197, 94, 0.2));
    border-radius: var(--radius-sm, 6px);
    font-size: var(--text-md, 13px);
  }

  .designation-type {
    font-size: 10px;
    color: var(--text-faint, rgba(255, 255, 255, 0.4));
    font-family: monospace;
  }

  .designation-or {
    font-size: var(--text-xs, 11px);
    color: var(--text-faint, rgba(255, 255, 255, 0.4));
    font-weight: 600;
  }

  .freeform-tag {
    padding: var(--space-xs, 4px) 10px;
    background: var(--accent-danger-soft, rgba(239, 68, 68, 0.2));
    border-radius: var(--radius-sm, 6px);
    font-size: var(--text-md, 13px);
  }

  .label-sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    margin-top: var(--space-sm, 8px);
  }

  .label-section-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: var(--space-xs, 4px) 10px;
    background: rgba(59, 130, 246, 0.15);
    border-radius: var(--radius-sm, 6px);
    font-size: var(--text-md, 13px);
  }

  .label-section-item .section-beats {
    font-weight: 600;
    color: #60a5fa;
    min-width: 70px;
  }

  .label-section-item .section-components {
    color: rgba(255, 255, 255, 0.8);
  }
</style>
