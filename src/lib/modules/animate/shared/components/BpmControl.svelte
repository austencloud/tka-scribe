<!--
  BpmControl.svelte

  Speed control with +/- buttons and long-press repeat.
  Shows BPM value with increment/decrement controls.
-->
<script lang="ts">
  let {
    bpm = $bindable(60),
    min = 30,
    max = 180,
    step = 5,
    onBpmChange,
  }: {
    bpm: number;
    min?: number;
    max?: number;
    step?: number;
    onBpmChange?: (bpm: number) => void;
  } = $props();

  // Long-press repeat state
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const INITIAL_DELAY = 400; // ms before repeat starts
  const REPEAT_INTERVAL = 80; // ms between repeats

  function increment() {
    const newBpm = Math.min(max, bpm + step);
    bpm = newBpm;
    onBpmChange?.(newBpm);
  }

  function decrement() {
    const newBpm = Math.max(min, bpm - step);
    bpm = newBpm;
    onBpmChange?.(newBpm);
  }

  function startRepeat(action: () => void) {
    action(); // Immediate first action
    timeoutId = setTimeout(() => {
      intervalId = setInterval(action, REPEAT_INTERVAL);
    }, INITIAL_DELAY);
  }

  function stopRepeat() {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function handleDecrementDown() {
    startRepeat(decrement);
  }

  function handleIncrementDown() {
    startRepeat(increment);
  }
</script>

<svelte:window on:mouseup={stopRepeat} on:touchend={stopRepeat} />

<div class="bpm-control">
  <button
    class="bpm-btn decrement"
    onmousedown={handleDecrementDown}
    ontouchstart={handleDecrementDown}
    disabled={bpm <= min}
    aria-label="Decrease BPM"
  >
    <i class="fas fa-minus"></i>
  </button>

  <div class="bpm-display">
    <span class="bpm-value">{bpm}</span>
    <span class="bpm-label">BPM</span>
  </div>

  <button
    class="bpm-btn increment"
    onmousedown={handleIncrementDown}
    ontouchstart={handleIncrementDown}
    disabled={bpm >= max}
    aria-label="Increase BPM"
  >
    <i class="fas fa-plus"></i>
  </button>
</div>

<style>
  .bpm-control {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bpm-btn {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .bpm-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 1);
  }

  .bpm-btn:active:not(:disabled) {
    transform: scale(0.9);
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
    min-width: 50px;
    padding: 4px 8px;
  }

  .bpm-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
  }

  .bpm-label {
    font-size: 0.65rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Responsive: Smaller screens */
  @media (max-width: 480px) {
    .bpm-control {
      gap: 6px;
    }

    .bpm-btn {
      width: 48px;
      height: 48px;
      font-size: 0.8rem;
    }

    .bpm-display {
      min-width: 48px;
      padding: 2px 6px;
    }

    .bpm-value {
      font-size: 1.1rem;
    }

    .bpm-label {
      font-size: 0.55rem;
    }
  }

  /* Very small screens */
  @media (max-width: 360px) {
    .bpm-control {
      gap: 4px;
    }

    /* Keep 48px minimum for accessibility */
    .bpm-btn {
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      font-size: 0.75rem;
    }

    .bpm-display {
      min-width: 48px;
      padding: 1px 4px;
    }

    .bpm-value {
      font-size: 1rem;
    }

    .bpm-label {
      font-size: 0.5rem;
    }
  }
</style>
