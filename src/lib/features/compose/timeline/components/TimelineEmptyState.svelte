<script lang="ts">
  /**
   * TimelineEmptyState - Guidance when timeline has no clips
   *
   * Shows clear instructions for how to add sequences to the timeline.
   * Small, focused component (~60 lines).
   */

  interface Props {
    onBrowseLibrary?: () => void;
  }

  let { onBrowseLibrary }: Props = $props();
</script>

<!-- Stop propagation to prevent clicks triggering playhead movement -->
<div class="empty-state" onclick={(e) => e.stopPropagation()}>
  <div class="empty-icon">
    <i class="fa-solid fa-film"></i>
  </div>

  <h3 class="empty-title">No sequences on timeline</h3>

  <p class="empty-description">
    Add sequences from your library to start composing your animation.
  </p>

  <div class="empty-actions">
    {#if onBrowseLibrary}
      <button
        class="action-btn primary"
        onclick={(e) => { e.stopPropagation(); onBrowseLibrary(); }}
      >
        <i class="fa-solid fa-folder-open"></i>
        Browse Library
      </button>
    {/if}
  </div>

  <div class="empty-hints">
    <div class="hint">
      <i class="fa-solid fa-lightbulb"></i>
      <span>Drag sequences from the Library to add them here</span>
    </div>
    <div class="hint">
      <i class="fa-solid fa-keyboard"></i>
      <span>Press <kbd>Space</kbd> to play/pause</span>
    </div>
  </div>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    min-height: 200px;
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .empty-icon i {
    font-size: 24px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.4));
  }

  .empty-title {
    margin: 0 0 8px 0;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .empty-description {
    margin: 0 0 20px 0;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    max-width: 280px;
  }

  .empty-actions {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: 6px;
    border: none;
    font-size: var(--font-size-compact, 12px);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-btn.primary {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  .action-btn.primary:hover {
    background: var(--theme-accent-hover, #3a8eef);
    transform: translateY(-1px);
  }

  .empty-hints {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.5));
  }

  .hint i {
    font-size: 10px;
    opacity: 0.7;
  }

  .hint kbd {
    padding: 2px 6px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border-radius: 3px;
    font-family: monospace;
    font-size: 10px;
  }
</style>
