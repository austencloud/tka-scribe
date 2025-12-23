<script lang="ts">
  import type { BeatPairRelationship } from "../../domain/models/beatpair-models";

  interface Props {
    beatPairs: BeatPairRelationship[];
    onRemove: (index: number) => void;
  }

  let { beatPairs, onRemove }: Props = $props();
</script>

{#if beatPairs.length > 0}
  <div class="saved-beatpairs">
    <span class="saved-label">Saved Beat Pairs:</span>
    {#each beatPairs as pair, i}
      <div class="saved-beatpair-tag">
        <span class="beatpair-beats"
          >{pair.keyBeat} ↔ {pair.correspondingBeat}</span
        >
        <span class="beatpair-transformation"
          >{pair.confirmedTransformation ||
            pair.detectedTransformations[0]}</span
        >
        <button class="remove-btn" onclick={() => onRemove(i)}>×</button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .saved-beatpairs {
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

  .saved-beatpair-tag {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-sm, 6px);
    border-left: 4px solid rgba(139, 92, 246, 0.8);
  }

  .saved-beatpair-tag .beatpair-beats {
    font-weight: 600;
    color: var(--text-primary, #fff);
    min-width: 60px;
  }

  .saved-beatpair-tag .beatpair-transformation {
    flex: 1;
    color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  }

  .saved-beatpair-tag .remove-btn {
    padding: var(--space-xs, 4px);
    background: transparent;
    border: none;
    color: var(--text-muted, rgba(255, 255, 255, 0.5));
    font-size: var(--text-lg, 14px);
    cursor: pointer;
    transition: var(--transition-fast, 0.1s ease);
    line-height: 1;
  }

  .saved-beatpair-tag .remove-btn:hover {
    color: var(--accent-danger, #ef4444);
  }
</style>
