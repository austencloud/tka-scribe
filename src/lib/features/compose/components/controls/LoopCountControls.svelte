<!--
  LoopCountControls.svelte

  Loop count preset selector for circular/looping sequences.
  Shows preset buttons (1x, 2x, 4x, 8x) when sequence is circular,
  or a disabled state message when sequence doesn't loop.
-->
<script lang="ts">
  let {
    isCircular = false,
    loopCount = 1,
    onLoopCountChange = () => {},
  }: {
    isCircular?: boolean;
    loopCount?: number;
    onLoopCountChange?: (count: number) => void;
  } = $props();

  const loopPresets = [1, 2, 4, 8];
</script>

<section class="loop-count-section">
  {#if isCircular}
    <div class="section-header">
      <i class="fas fa-infinity section-icon"></i>
      <div class="section-info">
        <h4 class="section-title">Loop Count</h4>
        <p class="section-desc">This sequence loops seamlessly</p>
      </div>
    </div>
    <div class="loop-presets">
      {#each loopPresets as count}
        <button
          class="loop-preset-btn"
          class:active={loopCount === count}
          onclick={() => onLoopCountChange(count)}
          type="button"
          aria-label="Export {count} loop{count > 1 ? 's' : ''}"
        >
          {count}x
        </button>
      {/each}
    </div>
  {:else}
    <div class="section-header">
      <i class="fas fa-info-circle section-icon muted"></i>
      <div class="section-info">
        <h4 class="section-title muted">Loop Count</h4>
        <p class="section-desc">
          Not available - sequence doesn't loop seamlessly
        </p>
      </div>
    </div>
  {/if}
</section>

<style>
  .loop-count-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 4px;
  }

  .section-icon {
    font-size: 1rem;
    color: var(--theme-text, rgba(255, 255, 255, 0.7));
    margin-top: 2px;
  }

  .section-icon.muted {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .section-info {
    flex: 1;
  }

  .section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  .section-title.muted {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  .section-desc {
    font-size: 0.8rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    margin: 4px 0 0 0;
  }

  .loop-presets {
    display: flex;
    gap: 8px;
  }

  .loop-preset-btn {
    flex: 1;
    min-height: var(--min-touch-target);
    padding: 10px 8px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.7));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-variant-numeric: tabular-nums;
  }

  @media (hover: hover) and (pointer: fine) {
    .loop-preset-btn:hover {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
      color: var(--theme-text, rgba(255, 255, 255, 0.85));
      transform: translateY(-1px);
    }
  }

  .loop-preset-btn:active {
    transform: scale(0.97);
  }

  .loop-preset-btn.active {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.3) 0%,
      rgba(124, 58, 237, 0.25) 100%
    );
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(255, 255, 255, 1);
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.25),
      0 2px 8px rgba(139, 92, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
</style>
