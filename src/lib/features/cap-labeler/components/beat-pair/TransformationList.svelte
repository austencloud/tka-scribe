<script lang="ts">
  interface Props {
    transformations: string[];
    selectedTransformation?: string;
    onConfirm: (transformation: string) => void;
  }

  let { transformations, selectedTransformation, onConfirm }: Props = $props();
</script>

{#if transformations.length > 0}
  <div class="detected-transformations">
    <span class="transformations-label">Detected Transformations:</span>
    <div class="transformations-list">
      {#each transformations as transformation}
        <button
          class="transformation-option"
          class:selected={selectedTransformation === transformation}
          onclick={() => onConfirm(transformation)}
        >
          {transformation}
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .detected-transformations {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
  }

  .transformations-label {
    font-size: var(--text-sm, 12px);
    font-weight: 600;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  }

  .transformations-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm, 8px);
  }

  .transformation-option {
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-sm, 6px);
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
    font-size: var(--text-sm, 12px);
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
  }

  .transformation-option:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .transformation-option.selected {
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    border-color: #8b5cf6;
    color: var(--text-primary, #fff);
    font-weight: 600;
  }
</style>
