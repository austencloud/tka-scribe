<script lang="ts">
  /**
   * SequenceInfoBadge - Display loaded sequence name with clear button
   */

  interface Props {
    /** Sequence name to display */
    name: string;
    /** Callback to clear sequence */
    onClear: () => void;
  }

  let { name, onClear }: Props = $props();
</script>

<div class="sequence-badge">
  <span class="name">{name}</span>
  <button class="clear-btn" onclick={onClear} aria-label="Clear sequence">
    <i class="fas fa-times"></i>
  </button>
</div>

<style>
  .sequence-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.7));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    padding: 4px 4px 4px 12px;
    backdrop-filter: blur(8px);
  }

  .name {
    font-size: var(--font-size-sm, 0.875rem);
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .clear-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: none;
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }

  .clear-btn:hover {
    background: var(--semantic-error, #ef4444);
    color: white;
  }
</style>
