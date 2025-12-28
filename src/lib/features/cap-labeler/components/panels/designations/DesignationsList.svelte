<script lang="ts">
  /**
   * Designations List
   *
   * Displays the list of confirmed designations (whole, section, beat pair)
   * and special type indicators (freeform, modular, axis-alternating).
   */
  import type { CAPDesignation } from "../../../domain/models/label-models";
  import type { SectionDesignation } from "../../../domain/models/section-models";
  import type { BeatPairRelationship } from "../../../domain/models/beatpair-models";
  import type { AxisAlternatingPattern } from "../../../services/contracts/ICAPDetector";
  import {
    formatDesignation,
    formatSectionBeats,
  } from "../../../utils/formatting";
  import DesignationItem from "./DesignationItem.svelte";

  interface Props {
    wholeDesignations: CAPDesignation[];
    sectionDesignations: SectionDesignation[];
    beatPairDesignations: BeatPairRelationship[];
    isFreeform: boolean;
    isModular: boolean;
    isAxisAlternating: boolean;
    axisAlternatingPattern: AxisAlternatingPattern | null;
    onRemoveWholeDesignation: (index: number) => void;
    onRemoveSectionDesignation: (index: number) => void;
    onRemoveBeatPairDesignation: (index: number) => void;
  }

  let {
    wholeDesignations,
    sectionDesignations,
    beatPairDesignations,
    isFreeform,
    isModular,
    isAxisAlternating,
    axisAlternatingPattern,
    onRemoveWholeDesignation,
    onRemoveSectionDesignation,
    onRemoveBeatPairDesignation,
  }: Props = $props();

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

<div class="designations-list">
  {#if totalCount === 0 && !isFreeform}
    <div class="empty-state">
      <span class="empty-text">No designations yet</span>
      <span class="empty-hint">1. Select components below → 2. Click "+ Add to designations"</span>
    </div>
  {:else}
    <!-- Whole sequence designations -->
    {#each wholeDesignations as d, i}
      <DesignationItem
        type="whole"
        badge="W"
        label={formatDesignation(d)}
        onRemove={() => onRemoveWholeDesignation(i)}
      />
    {/each}

    <!-- Section designations -->
    {#each sectionDesignations as s, i}
      <DesignationItem
        type="section"
        badge="S"
        label={formatSection(s)}
        onRemove={() => onRemoveSectionDesignation(i)}
      />
    {/each}

    <!-- Beat pair designations -->
    {#each beatPairDesignations as bp, i}
      <DesignationItem
        type="beatpair"
        badge="P"
        label={formatBeatPair(bp)}
        onRemove={() => onRemoveBeatPairDesignation(i)}
      />
    {/each}

    <!-- Axis-Alternating indicator (structured multi-axis pattern) -->
    {#if isAxisAlternating && axisAlternatingPattern}
      <DesignationItem
        type="axis-alternating"
        badge="A"
        label={axisAlternatingPattern.description}
      />
    <!-- Modular indicator (multiple recognizable patterns) -->
    {:else if isModular}
      <DesignationItem
        type="modular"
        badge="M"
        label="Modular (multiple patterns)"
      />
    <!-- Freeform indicator (no recognizable patterns) -->
    {:else if isFreeform}
      <DesignationItem
        type="freeform"
        badge="F"
        label="Freeform (no recognizable pattern)"
      />
    {/if}
  {/if}
</div>

<style>
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
</style>
