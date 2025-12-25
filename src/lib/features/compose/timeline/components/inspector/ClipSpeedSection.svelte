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
    <label class="field-label" for="custom-speed-range">Custom Speed</label>
    <div class="input-group">
      <input
        id="custom-speed-range"
        type="range"
        class="range-input"
        min="0.1"
        max="4"
        step="0.05"
        value={playbackRate}
        oninput={(e) =>
          onUpdateSpeed(parseFloat((e.target as HTMLInputElement).value))}
      />
      <input
        type="number"
        class="number-input"
        min="0.1"
        max="4"
        step="0.05"
        value={playbackRate.toFixed(2)}
        aria-label="Custom speed value"
        onchange={(e) =>
          onUpdateSpeed(parseFloat((e.target as HTMLInputElement).value))}
      />
    </div>
  </div>
</section>

<style>
  .section {
    margin-bottom: 20px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
    margin-bottom: 12px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    font-size: var(--font-size-compact, 12px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.85));
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-header i {
    font-size: 12px;
    opacity: 0.6;
  }

  .field {
    margin-bottom: 12px;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .number-input {
    width: 60px;
    padding: 6px 8px;
    background: var(--theme-input-bg, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    font-size: 11px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    text-align: center;
  }

  .range-input {
    flex: 1;
    height: 4px;
    appearance: none;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.15));
    border-radius: 2px;
  }

  .range-input::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    background: var(--theme-accent, #4a9eff);
    border-radius: 50%;
    cursor: pointer;
  }

  .field-label {
    display: block;
    margin-bottom: 6px;
    font-size: 11px;
    color: var(--theme-text-muted, rgba(255, 255, 255, 0.6));
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

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
