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
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="empty-state" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="region" aria-label="Empty timeline state">
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
        onclick={(e) => {
          e.stopPropagation();
          onBrowseLibrary();
        }}
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
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .empty-icon i {
    font-size: 24px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
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
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    max-width: 280px;
    line-height: 1.5;
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
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid var(--theme-accent, #4a9eff);
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  .action-btn.primary {
    background: var(--theme-accent, #4a9eff);
    color: white;
  }

  .action-btn.primary:hover {
    background: var(--theme-accent-strong, #3a7ed0);
    border-color: var(--theme-accent-strong, #3a7ed0);
    transform: translateY(-2px);
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.2),
      0 0 16px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .action-btn.primary:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  }

  .empty-hints {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .hint i {
    font-size: 10px;
    opacity: 0.7;
  }

  .hint kbd {
    padding: 3px 7px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.1));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 4px;
    font-family: monospace;
    font-size: 10px;
    font-weight: 600;
  }
</style>
