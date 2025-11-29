<!--
  SequenceSelector.svelte

  Reusable sequence selector card for tunnel/mirror/grid modes.
  Shows selected sequence or empty state with selection prompt.
-->
<script lang="ts">
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  type ColorIndicator = { color: string; label: string };

  // Props
  let {
    sequence,
    title,
    icon = "fa-user",
    colors,
    selected = false,
    onclick,
  }: {
    sequence: SequenceData | null;
    title: string;
    icon?: string;
    colors: ColorIndicator[];
    selected?: boolean;
    onclick: () => void;
  } = $props();

  // Generate gradient from colors
  const gradientColors = $derived(colors.map((c) => c.color).join(", "));
</script>

<button class="sequence-selector" class:selected {onclick}>
  <div class="selector-header" style="background: linear-gradient(135deg, {gradientColors});">
    <i class="fas {icon}"></i>
    <span>{title}</span>
  </div>

  <div class="selector-content">
    {#if sequence}
      <div class="selected-sequence">
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        <div class="sequence-name">
          {sequence.word || "Untitled"}
        </div>
      </div>
    {:else}
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <span>Click to select sequence</span>
      </div>
    {/if}
  </div>

  <div class="color-indicators">
    {#each colors as colorInfo}
      <div
        class="color-dot"
        style="background: {colorInfo.color};"
        title={colorInfo.label}
      ></div>
    {/each}
  </div>
</button>

<style>
  .sequence-selector {
    /* Reset button styles */
    all: unset;
    box-sizing: border-box;

    /* Component styles */
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 200px;
  }

  .sequence-selector:hover {
    border-color: rgba(236, 72, 153, 0.5);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(236, 72, 153, 0.3);
  }

  .sequence-selector.selected {
    border-color: rgba(16, 185, 129, 0.5);
  }

  .selector-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    color: white;
    font-weight: 600;
  }

  .selector-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
  }

  .selected-sequence {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .selected-sequence i {
    font-size: 2rem;
  }

  .sequence-name {
    font-size: 1.125rem;
    font-weight: 600;
    text-align: center;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    opacity: 0.5;
  }

  .empty-state i {
    font-size: 2.5rem;
  }

  .color-indicators {
    display: flex;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
  }

  .color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid white;
  }
</style>
