<!--
  TappableBpmControl.svelte

  BPM control with tap tempo functionality.
  - Tap the BPM display repeatedly to set tempo from your taps
  - Long press to manually edit the BPM value
  - +/- buttons for increment/decrement
-->
<script lang="ts">
  // Constants
  const DEFAULT_BPM = 60;
  const MIN_BPM = 15;
  const MAX_BPM = 180;
  const BPM_INCREMENT = 5;
  const LONG_PRESS_DURATION = 500;

  // Props
  let {
    bpm = $bindable(60),
    min = MIN_BPM,
    max = MAX_BPM,
    step = BPM_INCREMENT,
    onBpmChange,
    onPlaybackStart,
  }: {
    bpm: number;
    min?: number;
    max?: number;
    step?: number;
    onBpmChange?: (bpm: number) => void;
    onPlaybackStart?: () => void;
  } = $props();

  // State for editing
  let isEditing = $state(false);
  let editValue = $state("");

  // State for BPM tapping
  let tapTimestamps = $state<number[]>([]);
  let isTapping = $state(false);
  let tapTimeout: ReturnType<typeof setTimeout> | null = null;
  const TAP_TIMEOUT_MS = 1500;
  const MIN_TAPS = 2;
  const MAX_TAPS = 8;

  // State for long press detection
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let pressStartTime = $state(0);

  // Handlers
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

  // BPM Button Handlers - Combined tap tempo + long press for edit
  function handleBpmPress(event: MouseEvent | TouchEvent) {
    if (event.type === "touchstart") {
      event.preventDefault();
    }

    pressStartTime = Date.now();

    longPressTimer = setTimeout(() => {
      cancelTapping();
      startEditing();
      longPressTimer = null;
    }, LONG_PRESS_DURATION);
  }

  function handleBpmRelease(event: MouseEvent | TouchEvent) {
    if (event.type === "touchend") {
      event.preventDefault();
    }

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    const pressDuration = Date.now() - pressStartTime;
    if (pressDuration < LONG_PRESS_DURATION) {
      handleTap();
    }
  }

  function handleBpmCancel(event: MouseEvent | TouchEvent) {
    if (event.type === "touchcancel") {
      event.preventDefault();
    }

    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function startEditing() {
    isEditing = true;
    editValue = bpm.toString();
  }

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    editValue = target.value;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      submitEdit();
    } else if (event.key === "Escape") {
      cancelEdit();
    }
  }

  function submitEdit() {
    const newBpm = parseInt(editValue, 10);
    if (!isNaN(newBpm)) {
      const clampedBpm = Math.max(min, Math.min(max, newBpm));
      bpm = clampedBpm;
      onBpmChange?.(clampedBpm);
    }
    isEditing = false;
  }

  function cancelEdit() {
    isEditing = false;
    editValue = "";
  }

  function handleBlur() {
    submitEdit();
  }

  // BPM Tap handlers
  function handleTap() {
    const now = Date.now();

    // Debounce - ignore taps less than 100ms apart
    if (tapTimestamps.length > 0) {
      const lastTap = tapTimestamps[tapTimestamps.length - 1]!;
      if (now - lastTap < 100) {
        return;
      }
    }

    tapTimestamps.push(now);

    if (tapTimestamps.length > MAX_TAPS) {
      tapTimestamps = tapTimestamps.slice(-MAX_TAPS);
    }

    isTapping = true;

    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }

    if (tapTimestamps.length >= MIN_TAPS) {
      const calculatedBpm = calculateBpmFromTaps();
      if (calculatedBpm) {
        const clampedBpm = Math.max(min, Math.min(max, calculatedBpm));
        bpm = clampedBpm;
        onBpmChange?.(clampedBpm);
      }
    }

    tapTimeout = setTimeout(() => {
      finalizeTapping();
    }, TAP_TIMEOUT_MS);
  }

  function calculateBpmFromTaps(): number | null {
    if (tapTimestamps.length < MIN_TAPS) return null;

    const intervals: number[] = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
      intervals.push(tapTimestamps[i]! - tapTimestamps[i - 1]!);
    }

    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    return Math.round(60000 / avgInterval);
  }

  function finalizeTapping() {
    if (tapTimestamps.length >= MIN_TAPS) {
      onPlaybackStart?.();
    }

    isTapping = false;
    tapTimestamps = [];
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      tapTimeout = null;
    }
  }

  function cancelTapping() {
    isTapping = false;
    tapTimestamps = [];
    if (tapTimeout) {
      clearTimeout(tapTimeout);
      tapTimeout = null;
    }
  }
</script>

<div class="tappable-bpm-control">
  <button
    class="bpm-btn decrement"
    onclick={decreaseBpm}
    disabled={bpm <= min}
    aria-label="Decrease BPM"
    type="button"
  >
    <i class="fas fa-minus"></i>
  </button>

  {#if isEditing}
    <input
      type="number"
      class="bpm-input"
      value={editValue}
      oninput={handleInput}
      onkeydown={handleKeyDown}
      onblur={handleBlur}
      min={min}
      max={max}
      step={step}
      aria-label="Enter BPM"
    />
  {:else}
    <button
      class="bpm-display"
      class:tapping={isTapping}
      onmousedown={handleBpmPress}
      onmouseup={handleBpmRelease}
      onmouseleave={handleBpmCancel}
      ontouchstart={handleBpmPress}
      ontouchend={handleBpmRelease}
      ontouchcancel={handleBpmCancel}
      aria-label={isTapping
        ? "Tap to set tempo"
        : "Tap for tempo, hold to edit"}
      type="button"
    >
      <span class="bpm-number">{bpm}</span>
      <span class="bpm-unit">
        {isTapping && tapTimestamps.length >= MIN_TAPS ? "TAP" : "BPM"}
      </span>
    </button>
  {/if}

  <button
    class="bpm-btn increment"
    onclick={increaseBpm}
    disabled={bpm >= max}
    aria-label="Increase BPM"
    type="button"
  >
    <i class="fas fa-plus"></i>
  </button>
</div>

<style>
  .tappable-bpm-control {
    display: flex;
    align-items: center;
    gap: clamp(4px, 1cqi, 8px);
  }

  .bpm-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    width: clamp(44px, 10cqi, 48px);
    height: clamp(44px, 10cqi, 48px);
    background: rgba(255, 255, 255, 0.08);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    font-size: clamp(0.75rem, 3cqi, 0.875rem);
  }

  .bpm-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    color: white;
  }

  .bpm-btn:active:not(:disabled) {
    transform: scale(0.92);
    background: rgba(139, 92, 246, 0.3);
    border-color: rgba(139, 92, 246, 0.5);
  }

  .bpm-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .bpm-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: clamp(6px, 2cqi, 10px) clamp(10px, 3cqi, 16px);
    min-height: 44px;
    min-width: clamp(50px, 12cqi, 70px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: clamp(8px, 2cqi, 12px);
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .bpm-display:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .bpm-display:active {
    transform: scale(0.97);
  }

  /* Tapping state */
  .bpm-display.tapping {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(124, 58, 237, 0.25) 100%
    );
    border-color: rgba(139, 92, 246, 0.6);
    box-shadow: 0 0 16px rgba(139, 92, 246, 0.35);
    animation: pulse 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.04);
    }
  }

  .bpm-number {
    font-size: clamp(1rem, 4cqi, 1.25rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-unit {
    font-size: clamp(0.5rem, 2cqi, 0.65rem);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.2;
  }

  .bpm-input {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(6px, 2cqi, 10px) clamp(8px, 2cqi, 12px);
    min-height: 44px;
    min-width: clamp(50px, 12cqi, 70px);
    font-size: clamp(1rem, 4cqi, 1.25rem);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    text-align: center;
    font-variant-numeric: tabular-nums;
    background: rgba(59, 130, 246, 0.15);
    border: 2px solid rgba(59, 130, 246, 0.6);
    border-radius: clamp(8px, 2cqi, 12px);
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    transition: all 0.15s ease;
  }

  .bpm-input:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.8);
  }

  /* Hide number input spinners */
  .bpm-input::-webkit-outer-spin-button,
  .bpm-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .bpm-input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .bpm-btn,
    .bpm-display,
    .bpm-display.tapping,
    .bpm-input {
      transition: none;
      animation: none;
    }
  }
</style>
