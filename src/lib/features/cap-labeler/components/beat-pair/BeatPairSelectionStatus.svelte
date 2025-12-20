<script lang="ts">
  import FontAwesomeIcon from "$lib/shared/foundation/ui/FontAwesomeIcon.svelte";

  interface Props {
    firstBeat: number | null;
    secondBeat: number | null;
    onClear: () => void;
  }

  let { firstBeat, secondBeat, onClear }: Props = $props();
</script>

{#if firstBeat !== null || secondBeat !== null}
  <div class="beatpair-selection-status">
    <div class="beatpair-selection-info">
      {#if firstBeat !== null}
        <span class="beatpair-key">
          <span class="beatpair-indicator" style="background: rgba(34, 197, 94, 0.35); border: 2px solid rgba(34, 197, 94, 0.9);"></span>
          Key Beat: {firstBeat}
        </span>
      {/if}
      {#if secondBeat !== null}
        <span class="beatpair-arrow">→</span>
        <span class="beatpair-corresponding">
          <span class="beatpair-indicator" style="background: rgba(168, 85, 247, 0.35); border: 2px solid rgba(168, 85, 247, 0.9);"></span>
          Corresponding: {secondBeat}
        </span>
      {/if}
    </div>
    <button
      class="clear-selection-btn"
      onclick={onClear}
      title="Clear selection and start over"
    >
      <FontAwesomeIcon icon="times" size="1em" />
      Clear
    </button>
  </div>
{/if}

<style>
  .beatpair-selection-status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-md, 12px);
    padding: var(--space-md, 12px);
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md, 8px);
  }

  .beatpair-selection-info {
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
    flex: 1;
  }

  .beatpair-key,
  .beatpair-corresponding {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    font-weight: 600;
    color: var(--text-primary, #fff);
  }

  .beatpair-indicator {
    width: 16px;
    height: 16px;
    border-radius: var(--radius-xs, 4px);
  }

  .beatpair-arrow {
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    font-size: var(--text-lg, 14px);
  }

  .clear-selection-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: rgba(239, 68, 68, 0.15);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--radius-sm, 6px);
    color: #ef4444;
    font-size: var(--text-sm, 12px);
    font-weight: 500;
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
    white-space: nowrap;
  }

  .clear-selection-btn:hover {
    background: rgba(239, 68, 68, 0.25);
    border-color: rgba(239, 68, 68, 0.5);
  }
</style>
