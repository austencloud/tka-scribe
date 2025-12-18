<script lang="ts">
  /**
   * ClipTrimSection - In/out point trim controls with visual preview
   */

  interface Props {
    inPoint: number;
    outPoint: number;
    beatCount: number;
    onUpdateInPoint: (percent: number) => void;
    onUpdateOutPoint: (percent: number) => void;
    onResetTrim: () => void;
  }

  let { inPoint, outPoint, beatCount, onUpdateInPoint, onUpdateOutPoint, onResetTrim }: Props = $props();

  // Convert to percentages for display
  let inPointPercent = $derived(Math.round(inPoint * 100));
  let outPointPercent = $derived(Math.round(outPoint * 100));
</script>

<section class="section">
  <div class="section-header">
    <i class="fa-solid fa-scissors"></i>
    <span>Trim</span>
  </div>

  <div class="trim-range">
    <div
      class="trim-bar"
      style="left: {inPoint * 100}%; right: {100 - outPoint * 100}%"
    ></div>
    <div class="trim-markers">
      {#each { length: beatCount } as _, i}
        {@const percent = (i / (beatCount - 1 || 1)) * 100}
        <div class="beat-marker" style="left: {percent}%"></div>
      {/each}
    </div>
  </div>

  <div class="field-row">
    <div class="field">
      <label class="field-label">In Point</label>
      <div class="input-group">
        <input
          type="range"
          class="range-input"
          min="0"
          max="99"
          value={inPointPercent}
          oninput={(e) => onUpdateInPoint(parseInt((e.target as HTMLInputElement).value))}
        />
        <span class="value-label">{inPointPercent}%</span>
      </div>
    </div>

    <div class="field">
      <label class="field-label">Out Point</label>
      <div class="input-group">
        <input
          type="range"
          class="range-input"
          min="1"
          max="100"
          value={outPointPercent}
          oninput={(e) => onUpdateOutPoint(parseInt((e.target as HTMLInputElement).value))}
        />
        <span class="value-label">{outPointPercent}%</span>
      </div>
    </div>
  </div>

  <button class="action-btn" onclick={onResetTrim}>
    <i class="fa-solid fa-expand"></i>
    Reset Trim
  </button>
</section>

<style>
  @import './inspector-styles.css';

  .trim-range {
    position: relative;
    height: 32px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-radius: 4px;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .trim-bar {
    position: absolute;
    top: 4px;
    bottom: 4px;
    background: var(--theme-accent, #4a9eff);
    opacity: 0.3;
    border-radius: 2px;
  }

  .trim-markers {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
  }

  .beat-marker {
    position: absolute;
    width: 2px;
    height: 60%;
    background: var(--theme-text-muted, rgba(255, 255, 255, 0.3));
    border-radius: 1px;
    transform: translateX(-50%);
  }
</style>
