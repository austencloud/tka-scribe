<!--
  BpmControl.svelte

  Unified BPM control - works in any layout context
  - Preset chips for quick selection (15, 30, 50, 90, 120, 150)
  - Inline +/- buttons for fine adjustment
  - Custom chip displays non-preset values
  - Adapts to horizontal or vertical layouts
-->
<script lang="ts">
  // Constants
  const BPM_PRESETS = [15, 30, 60, 90, 120, 150];

  // Props
  let {
    bpm = $bindable(60),
    min = 15,
    max = 180,
    step = 1,
    onBpmChange,
  }: {
    bpm: number;
    min?: number;
    max?: number;
    step?: number;
    onBpmChange?: (bpm: number) => void;
  } = $props();

  // Tap tempo state
  let tapTimes: number[] = $state([]);
  let tapTimeout: number | null = null;
  const TAP_TIMEOUT_MS = 2000; // Reset if no tap for 2 seconds
  const MAX_TAP_HISTORY = 8; // Keep last 8 taps for averaging

  // Handlers
  function selectPreset(presetBpm: number) {
    bpm = presetBpm;
    onBpmChange?.(presetBpm);
  }

  function decreaseBpm() {
    const newBpm = Math.max(min, bpm - step);
    bpm = newBpm;
    onBpmChange?.(newBpm);
  }

  function increaseBpm() {
    const newBpm = Math.min(max, bpm + step);
    bpm = newBpm;
    onBpmChange?.(newBpm);
  }

  // Tap tempo handler
  function handleTap() {
    const now = Date.now();

    // Clear existing timeout
    if (tapTimeout !== null) {
      clearTimeout(tapTimeout);
    }

    // Add current tap time
    tapTimes = [...tapTimes, now].slice(-MAX_TAP_HISTORY);

    // Calculate BPM if we have at least 2 taps
    if (tapTimes.length >= 2) {
      // Calculate intervals between consecutive taps
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.length; i++) {
        const current = tapTimes[i];
        const previous = tapTimes[i - 1];
        if (current !== undefined && previous !== undefined) {
          intervals.push(current - previous);
        }
      }

      // Average the intervals
      const avgInterval =
        intervals.reduce((sum, val) => sum + val, 0) / intervals.length;

      // Convert to BPM (60000ms per minute / avg interval in ms)
      const calculatedBpm = Math.round(60000 / avgInterval);

      // Clamp to valid range
      const newBpm = Math.max(min, Math.min(max, calculatedBpm));
      bpm = newBpm;
      onBpmChange?.(newBpm);
    }

    // Reset tap history after timeout
    tapTimeout = setTimeout(() => {
      tapTimes = [];
    }, TAP_TIMEOUT_MS) as unknown as number;
  }

  // Check if current BPM matches a preset
  let isPresetValue = $derived(BPM_PRESETS.includes(bpm));
</script>

<div class="bpm-control-container">
  <div class="bpm-control">
    <!-- Current BPM Display with +/- controls -->
    <div class="bpm-adjuster">
    <button
      class="adjust-btn decrease-btn"
      onclick={decreaseBpm}
      disabled={bpm <= min}
      aria-label="Decrease BPM"
      type="button"
    >
      <i class="fas fa-minus"></i>
    </button>

    <button
      class="current-bpm"
      onclick={handleTap}
      type="button"
      aria-label="Tap to set tempo"
      title="Tap repeatedly to set BPM"
    >
      <span class="bpm-value">{bpm}</span>
      <span class="bpm-label">{tapTimes.length > 0 ? "TAP" : "BPM"}</span>
    </button>

    <button
      class="adjust-btn increase-btn"
      onclick={increaseBpm}
      disabled={bpm >= max}
      aria-label="Increase BPM"
      type="button"
    >
      <i class="fas fa-plus"></i>
    </button>
  </div>

    <!-- Preset chips -->
    <div class="preset-chips">
      {#each BPM_PRESETS as presetBpm}
        <button
          class="preset-chip"
          class:active={bpm === presetBpm}
          onclick={() => selectPreset(presetBpm)}
          type="button"
          aria-label="Set BPM to {presetBpm}"
        >
          {presetBpm}
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  /* ===========================
     UNIFIED BPM CONTROL
     2026 Bento Box Design
     =========================== */

  .bpm-control-container {
    container-type: inline-size;
    container-name: bpm-control;
    width: 100%;
  }

  .bpm-control {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
  }

  /* Wide layout: Single row when container is wide enough
     Breakpoint calculation:
     - Adjuster: 52 + 12 + 80 + 12 + 52 = 208px
     - 6 chips @ 48px min = 288px
     - Gaps: 12px + 5×6px = 42px
     - Total: ~540px minimum */
  @container bpm-control (min-width: 540px) {
    .bpm-control {
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .bpm-adjuster {
      flex-shrink: 0;
    }

    .preset-chips {
      flex: 1;
      min-width: 0;
    }
  }

  /* BPM Adjuster - Current value with +/- buttons */
  .bpm-adjuster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .current-bpm {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px 20px;
    min-width: 80px;
    background: rgba(139, 92, 246, 0.15);
    border: 1.5px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .current-bpm:hover {
      background: rgba(139, 92, 246, 0.2);
      border-color: rgba(139, 92, 246, 0.4);
      transform: scale(1.02);
      box-shadow:
        0 0 24px rgba(139, 92, 246, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  .current-bpm:active {
    transform: scale(0.98);
    background: rgba(139, 92, 246, 0.25);
    border-color: rgba(139, 92, 246, 0.5);
    box-shadow:
      0 0 16px rgba(139, 92, 246, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .bpm-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-label {
    font-size: 0.6rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 2px;
  }

  /* Preset Chips Row */
  .preset-chips {
    display: flex;
    gap: 6px;
    width: 100%;
  }

  /* ===========================
     ADJUST BUTTONS (+/-)
     =========================== */

  .adjust-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  @media (hover: hover) and (pointer: fine) {
    .adjust-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.85);
      transform: scale(1.05);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .adjust-btn:active:not(:disabled) {
    transform: scale(0.97);
  }

  .adjust-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* ===========================
     PRESET CHIPS
     =========================== */

  .preset-chip {
    flex: 1;
    min-width: 48px;
    min-height: 52px;
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.75rem, 2.5vw, 0.85rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-variant-numeric: tabular-nums;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  @media (hover: hover) and (pointer: fine) {
    .preset-chip:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.85);
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .preset-chip:active:not(:disabled) {
    transform: scale(0.97);
  }

  .preset-chip.active {
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

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .adjust-btn {
      width: 44px;
      height: 44px;
      font-size: 0.7rem;
    }

    .preset-chip {
      min-height: 44px;
      padding: 8px 6px;
      font-size: 0.75rem;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  @media (prefers-reduced-motion: reduce) {
    .adjust-btn,
    .preset-chip {
      transition: none;
      animation: none;
    }

    .adjust-btn:hover,
    .adjust-btn:active,
    .preset-chip:hover,
    .preset-chip:active {
      transform: none;
    }
  }
</style>
