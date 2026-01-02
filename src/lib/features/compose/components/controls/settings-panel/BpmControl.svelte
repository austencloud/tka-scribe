<!--
  BpmControl.svelte

  BPM adjustment control with:
  - Plus/minus buttons
  - Tappable center display for tap tempo
  - Preset chips (30, 60, 90, 120, 150)
-->
<script lang="ts">
  const BPM_PRESETS = [30, 60, 90, 120, 150];
  const BPM_MIN = 15;
  const BPM_MAX = 180;
  const BPM_STEP = 5;
  const TAP_RESET_MS = 2000;

  let {
    bpm = $bindable(60),
    onBpmChange = () => {},
  }: {
    bpm: number;
    onBpmChange?: (bpm: number) => void;
  } = $props();

  // Tap tempo state
  let tapTimes: number[] = $state([]);
  let tapTimeout: number | null = null;

  function adjustBpm(delta: number) {
    const newBpm = Math.max(BPM_MIN, Math.min(BPM_MAX, bpm + delta));
    bpm = newBpm;
    onBpmChange(newBpm);
  }

  function selectPreset(preset: number) {
    bpm = preset;
    onBpmChange(preset);
  }

  function handleTap() {
    const now = Date.now();
    if (tapTimeout !== null) clearTimeout(tapTimeout);
    tapTimes = [...tapTimes, now].slice(-8);

    if (tapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push((tapTimes[i] ?? 0) - (tapTimes[i - 1] ?? 0));
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      const newBpm = Math.max(BPM_MIN, Math.min(BPM_MAX, calculatedBpm));
      bpm = newBpm;
      onBpmChange(newBpm);
    }

    tapTimeout = setTimeout(() => {
      tapTimes = [];
    }, TAP_RESET_MS) as unknown as number;
  }

  const isTapping = $derived(tapTimes.length > 0);
</script>

<div class="bpm-control">
  <div class="bpm-adjuster">
    <button
      class="bpm-btn"
      onclick={() => adjustBpm(-BPM_STEP)}
      disabled={bpm <= BPM_MIN}
      type="button"
      aria-label="Decrease BPM"
    >
      <i class="fas fa-minus" aria-hidden="true"></i>
    </button>

    <button
      class="bpm-display"
      onclick={handleTap}
      type="button"
      aria-label="Tap to set tempo"
      title="Tap repeatedly to set BPM"
    >
      <span class="bpm-value">{bpm}</span>
      <span class="bpm-unit">{isTapping ? "TAP" : "BPM"}</span>
    </button>

    <button
      class="bpm-btn"
      onclick={() => adjustBpm(BPM_STEP)}
      disabled={bpm >= BPM_MAX}
      type="button"
      aria-label="Increase BPM"
    >
      <i class="fas fa-plus" aria-hidden="true"></i>
    </button>
  </div>

  <div class="bpm-presets">
    {#each BPM_PRESETS as preset}
      <button
        class="preset-chip"
        class:active={bpm === preset}
        onclick={() => selectPreset(preset)}
        type="button"
      >
        {preset}
      </button>
    {/each}
  </div>
</div>

<style>
  .bpm-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .bpm-adjuster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .bpm-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-stroke);
    border-radius: 50%;
    color: var(--theme-text-dim);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .bpm-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    color: var(--theme-text);
    transform: scale(1.05);
  }

  .bpm-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .bpm-display {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 80px;
    min-height: var(--min-touch-target);
    padding: 0 16px;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-accent, rgba(139, 92, 246, 0.4));
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 6px var(--theme-shadow);
  }

  .bpm-display:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-accent, rgba(139, 92, 246, 0.5));
  }

  .bpm-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--theme-text);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-unit {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--theme-text-dim);
  }

  .bpm-presets {
    display: flex;
    gap: 6px;
  }

  .preset-chip {
    flex: 1;
    min-height: 40px;
    padding: 8px 6px;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-stroke);
    border-radius: 10px;
    color: var(--theme-text-dim);
    font-size: 0.8rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preset-chip.active {
    background: var(--theme-accent);
    border-color: var(--theme-accent);
    color: white;
    box-shadow: 0 2px 6px var(--theme-shadow);
  }

  @media (hover: hover) and (pointer: fine) {
    .preset-chip:hover:not(.active) {
      background: var(--theme-card-hover-bg);
      border-color: var(--theme-stroke-strong);
      color: var(--theme-text);
    }
  }
</style>
