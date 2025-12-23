<script lang="ts">
  import type { SectionDesignation } from "../../domain/models/section-models";
  import { SECTION_COLORS } from "../../domain/constants/section-colors";
  import {
    formatSectionBeats,
    formatDesignation,
  } from "../../utils/formatting";

  interface Props {
    sections: SectionDesignation[];
    onRemove: (index: number) => void;
  }

  let { sections, onRemove }: Props = $props();
</script>

{#if sections.length > 0}
  <div class="saved-sections">
    <span class="saved-label">Saved sections:</span>
    {#each sections as section, i}
      <div
        class="saved-section-tag"
        style="--section-color: {SECTION_COLORS[i % SECTION_COLORS.length]
          ?.border}"
      >
        <div class="section-info">
          <span class="section-beats">{formatSectionBeats(section.beats)}</span>
          <span class="section-components">{formatDesignation(section)}</span>
        </div>
        <button class="remove-btn" onclick={() => onRemove(i)}>×</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .saved-sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 12px);
    background: var(--surface-raised, rgba(255, 255, 255, 0.05));
    border-radius: var(--radius-md, 8px);
  }

  .saved-label {
    font-size: var(--text-sm, 12px);
    font-weight: 600;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    margin-bottom: var(--space-xs, 4px);
  }

  .saved-section-tag {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm, 6px);
    border-left: 4px solid var(--section-color, rgba(59, 130, 246, 0.8));
  }

  .section-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
  }

  .saved-section-tag .section-beats {
    font-weight: 600;
    font-size: var(--font-size-min, 14px);
    color: var(--text-primary, #fff);
  }

  .saved-section-tag .section-components {
    font-size: var(--font-size-compact, 12px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  }

  .saved-section-tag .remove-btn {
    padding: var(--space-xs, 4px);
    background: transparent;
    border: none;
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    font-size: var(--text-lg, 14px);
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
    line-height: 1;
  }

  .saved-section-tag .remove-btn:hover {
    color: var(--accent-danger, #ef4444);
  }
</style>
