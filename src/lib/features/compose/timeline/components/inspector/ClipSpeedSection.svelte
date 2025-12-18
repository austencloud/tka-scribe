<script lang="ts">
  /**
   * ClipSpeedSection - Speed presets and custom speed control
   */

  interface Props {
    playbackRate: number;
    onUpdateSpeed: (value: number) => void;
  }

  let { playbackRate, onUpdateSpeed }: Props = $props();

  const SPEED_PRESETS = [
    { label: "0.25x", value: 0.25 },
    { label: "0.5x", value: 0.5 },
    { label: "0.75x", value: 0.75 },
    { label: "1x", value: 1 },
    { label: "1.5x", value: 1.5 },
    { label: "2x", value: 2 },
    { label: "4x", value: 4 },
  ];
</script>

<section class="section">
  <div class="section-header">
    <i class="fa-solid fa-gauge"></i>
    <span>Speed</span>
  </div>

  <div class="speed-presets">
    {#each SPEED_PRESETS as preset}
      <button
        class="preset-btn"
        class:active={playbackRate === preset.value}
        onclick={() => onUpdateSpeed(preset.value)}
      >
        {preset.label}
      </button>
    {/each}
  </div>

  <div class="field">
    <label class="field-label">Custom Speed</label>
    <div class="input-group">
      <input
        type="range"
        class="range-input"
        min="0.1"
        max="4"
        step="0.05"
        value={playbackRate}
        oninput={(e) => onUpdateSpeed(parseFloat((e.target as HTMLInputElement).value))}
      />
      <input
        type="number"
        class="number-input"
        min="0.1"
        max="4"
        step="0.05"
        value={playbackRate.toFixed(2)}
        onchange={(e) => onUpdateSpeed(parseFloat((e.target as HTMLInputElement).value))}
      />
    </div>
  </div>
</section>

<style>
  @import './inspector-styles.css';

  .speed-presets {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 12px;
  }

  .preset-btn {
    padding: 6px 10px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.1));
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .preset-btn.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
  }
</style>
