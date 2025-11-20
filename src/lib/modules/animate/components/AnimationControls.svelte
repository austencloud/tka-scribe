<!--
  AnimationControls.svelte

  Reusable animation controls component with speed controls.
-->
<script lang="ts">
  // Constants - All in BPM (beats per minute)
  const DEFAULT_BPM = 60; // Base tempo
  const MIN_BPM = 15; // Minimum speed
  const MAX_BPM = 150; // Maximum speed
  const BPM_INCREMENT = 1; // Increment/decrement by 1 BPM per button click

  // Internal conversion factors (system uses multipliers internally)
  const MIN_SPEED = MIN_BPM / DEFAULT_BPM; // 0.25
  const MAX_SPEED = MAX_BPM / DEFAULT_BPM; // 2.5
  const SPEED_INCREMENT = BPM_INCREMENT / DEFAULT_BPM; // ~0.0167

  // Long press detection
  const LONG_PRESS_DURATION = 500; // 500ms for long press

  // Props
  let {
    speed = 1,
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
  }: {
    speed?: number;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
  } = $props();

  // State for editing
  let isEditing = $state(false);
  let editValue = $state("");

  // State for BPM tapping
  let tapTimestamps = $state<number[]>([]);
  let isTapping = $state(false);
  let tapTimeout: ReturnType<typeof setTimeout> | null = null;
  const TAP_TIMEOUT_MS = 1500; // 1.5 seconds after last tap
  const MIN_TAPS = 2; // Minimum taps to calculate BPM
  const MAX_TAPS = 8; // Keep only the last 8 taps for calculation

  // State for long press detection
  let longPressTimer: ReturnType<typeof setTimeout> | null = null;
  let pressStartTime = $state(0);

  // Derived: Convert speed multiplier to BPM
  let bpm = $derived(Math.round(speed * DEFAULT_BPM));

  // Handlers
  function decreaseSpeed() {
    const newSpeed = Math.max(MIN_SPEED, speed - SPEED_INCREMENT);
    onSpeedChange(newSpeed);
  }

  function increaseSpeed() {
    const newSpeed = Math.min(MAX_SPEED, speed + SPEED_INCREMENT);
    onSpeedChange(newSpeed);
  }

  // BPM Button Handlers - Combined tap tempo + long press for edit
  function handleBpmPress(event: MouseEvent | TouchEvent) {
    // Prevent duplicate events on touch devices
    if (event.type === "touchstart") {
      event.preventDefault();
    }

    pressStartTime = Date.now();

    // Start long press timer
    longPressTimer = setTimeout(() => {
      // Long press detected - cancel tapping and open manual input
      cancelTapping();
      startEditing();
      longPressTimer = null;
    }, LONG_PRESS_DURATION);
  }

  function handleBpmRelease(event: MouseEvent | TouchEvent) {
    // Prevent duplicate events on touch devices
    if (event.type === "touchend") {
      event.preventDefault();
    }

    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Check if it was a long press (already handled) or a tap
    const pressDuration = Date.now() - pressStartTime;
    if (pressDuration < LONG_PRESS_DURATION) {
      // Short tap - trigger tap tempo
      handleTap();
    }
  }

  function handleBpmCancel(event: MouseEvent | TouchEvent) {
    // Prevent duplicate events on touch devices
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
      // Convert BPM to speed multiplier
      const newSpeed = newBpm / DEFAULT_BPM;
      // Clamp to min/max range
      const clampedSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
      onSpeedChange(clampedSpeed);
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

    // Prevent duplicate taps from double-firing events (debounce)
    // Ignore taps that are less than 100ms apart (impossibly fast)
    if (tapTimestamps.length > 0) {
      const lastTap = tapTimestamps[tapTimestamps.length - 1]!;
      if (now - lastTap < 100) {
        console.log("🚫 Ignoring duplicate tap (too fast)");
        return; // Ignore this tap
      }
    }

    // Add current tap timestamp
    tapTimestamps.push(now);

    // Keep only the last MAX_TAPS
    if (tapTimestamps.length > MAX_TAPS) {
      tapTimestamps = tapTimestamps.slice(-MAX_TAPS);
    }

    // Set tapping state
    isTapping = true;

    // Clear previous timeout
    if (tapTimeout) {
      clearTimeout(tapTimeout);
    }

    // Calculate and update BPM if we have enough taps
    if (tapTimestamps.length >= MIN_TAPS) {
      const calculatedBpm = calculateBpmFromTaps();
      console.log(
        `🎵 Calculated BPM: ${calculatedBpm} from ${tapTimestamps.length} taps`
      );
      if (calculatedBpm) {
        const newSpeed = calculatedBpm / DEFAULT_BPM;
        const clampedSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, newSpeed));
        onSpeedChange(clampedSpeed);
      }
    }

    // Set timeout to finalize tapping
    tapTimeout = setTimeout(() => {
      finalizeTapping();
    }, TAP_TIMEOUT_MS);
  }

  function calculateBpmFromTaps(): number | null {
    if (tapTimestamps.length < MIN_TAPS) return null;

    // Calculate intervals between consecutive taps
    const intervals: number[] = [];
    for (let i = 1; i < tapTimestamps.length; i++) {
      intervals.push(tapTimestamps[i]! - tapTimestamps[i - 1]!);
    }

    // Calculate average interval in milliseconds
    const avgInterval =
      intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;

    // Convert to BPM (beats per minute)
    // avgInterval is in ms, so: BPM = (60000 ms/min) / avgInterval
    const bpm = 60000 / avgInterval;

    return Math.round(bpm);
  }

  function finalizeTapping() {
    if (tapTimestamps.length >= MIN_TAPS) {
      // Auto-start playback after tapping is complete
      onPlaybackStart();
    }

    // Reset tapping state
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

<div class="controls-container">
  <!-- Speed Control -->
  <div class="speed-control">
    <div class="speed-buttons">
      <button
        class="speed-btn decrease"
        onclick={decreaseSpeed}
        disabled={speed <= MIN_SPEED}
        aria-label="Decrease speed"
        type="button"
      >
        <i class="fas fa-minus"></i>
      </button>

      {#if isEditing}
        <input
          type="number"
          class="speed-input"
          value={editValue}
          oninput={handleInput}
          onkeydown={handleKeyDown}
          onblur={handleBlur}
          min={Math.round(MIN_SPEED * DEFAULT_BPM)}
          max={Math.round(MAX_SPEED * DEFAULT_BPM)}
          step={BPM_INCREMENT}
          aria-label="Enter BPM"
        />
      {:else}
        <button
          class="speed-value"
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
          <span class="bpm-unit"
            >{isTapping && tapTimestamps.length >= MIN_TAPS
              ? "TAPPING"
              : "BPM"}</span
          >
        </button>
      {/if}

      <button
        class="speed-btn increase"
        onclick={increaseSpeed}
        disabled={speed >= MAX_SPEED}
        aria-label="Increase speed"
        type="button"
      >
        <i class="fas fa-plus"></i>
      </button>
    </div>
  </div>
</div>

<style>
  /* ===========================
     ANIMATION CONTROLS
     2026 Design System
     =========================== */

  .controls-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.2vw, 12px);
    flex-shrink: 0;
  }

  /* ===========================
     SPEED CONTROL
     =========================== */

  .speed-control {
    width: 100%;
  }

  .speed-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 1.2vw, 12px);
    width: 100%;
  }

  .speed-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(30px, 6vw, 42px);
    height: clamp(30px, 6vw, 42px);
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.4) 0%,
      rgba(37, 99, 235, 0.4) 100%
    );
    border: 2px solid rgba(59, 130, 246, 0.5);
    border-radius: 50%;
    color: rgba(191, 219, 254, 1);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    -webkit-tap-highlight-color: transparent;
    font-size: clamp(10px, 2vw, 14px);
  }

  .speed-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.3);
    box-shadow: none;
  }

  @media (hover: hover) and (pointer: fine) {
    .speed-btn:not(:disabled):hover {
      transform: scale(1.08);
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.5) 0%,
        rgba(37, 99, 235, 0.5) 100%
      );
      border-color: rgba(59, 130, 246, 0.8);
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
    }
  }

  .speed-btn:not(:disabled):active {
    transform: scale(0.95);
  }

  .speed-value {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: clamp(6px, 1.2vw, 10px) clamp(12px, 2.4vw, 18px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: clamp(6px, 1.2vw, 10px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    /* Intrinsic sizing - don't stretch */
  }

  .bpm-number {
    font-size: clamp(16px, 3.2vw, 22px);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-unit {
    font-size: clamp(8px, 1.6vw, 10px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.2;
  }

  @media (hover: hover) and (pointer: fine) {
    .speed-value:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
      transform: scale(1.02);
    }
  }

  .speed-value:active {
    transform: scale(0.98);
    background: rgba(255, 255, 255, 0.06);
  }

  /* Tapping state */
  .speed-value.tapping {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(124, 58, 237, 0.25) 100%
    );
    border-color: rgba(139, 92, 246, 0.6);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.35);
    animation: pulse 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes pulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .speed-value.tapping:hover {
      background: linear-gradient(
        135deg,
        rgba(139, 92, 246, 0.35) 0%,
        rgba(124, 58, 237, 0.35) 100%
      );
      border-color: rgba(139, 92, 246, 0.8);
      box-shadow: 0 0 24px rgba(139, 92, 246, 0.45);
    }
  }

  /* ===========================
     SPEED INPUT
     =========================== */

  .speed-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(6px, 1.5vw, 8px) clamp(10px, 2vw, 14px);
    font-size: clamp(18px, 3.6vw, 22px);
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    text-align: center;
    font-variant-numeric: tabular-nums;
    background: rgba(59, 130, 246, 0.15);
    border: 2px solid rgba(59, 130, 246, 0.6);
    border-radius: clamp(8px, 1.5vw, 10px);
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: clamp(70px, 15vw, 90px);
  }

  .speed-input:focus {
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.8);
    background: rgba(59, 130, 246, 0.2);
  }

  /* Hide number input spinners */
  .speed-input::-webkit-outer-spin-button,
  .speed-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .speed-input[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  /* ===========================
     DESKTOP OPTIMIZATIONS
     Use container query units for perfect fit
     =========================== */

  @container (min-aspect-ratio: 5/4) {
    .controls-container {
      gap: 0;
    }

    .speed-buttons {
      gap: 0.5cqw;
    }

    .speed-btn {
      width: 2.5cqh;
      height: 2.5cqh;
      font-size: 1cqh;
      flex-shrink: 0;
    }

    .speed-value {
      padding: 0.25cqh 0.6cqw;
      min-width: 0;
      flex: 1;
    }

    .bpm-number {
      font-size: 1.6cqh;
    }

    .bpm-unit {
      font-size: 0.7cqh;
    }

    .speed-input {
      padding: 0.25cqh 0.6cqw;
      font-size: 1.6cqh;
      min-width: 0;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .speed-btn,
    .speed-value,
    .speed-value.tapping,
    .speed-input {
      transition: none;
      animation: none;
    }

    .speed-btn:hover,
    .speed-btn:active,
    .speed-value:hover,
    .speed-value:active {
      transform: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .speed-btn,
    .speed-value {
      border-width: 2px;
    }

    .bpm-number,
    .bpm-unit {
      color: #ffffff;
    }
  }

  /* ===========================
     MOBILE OPTIMIZATIONS
     =========================== */

  @media (max-width: 360px) {
    .speed-btn {
      width: 32px;
      height: 32px;
      font-size: 11px;
    }

    .bpm-number {
      font-size: 16px;
    }
  }

  /* Landscape mobile */
  @media (max-height: 500px) and (orientation: landscape) {
    .speed-btn {
      width: 34px;
      height: 34px;
    }
  }
</style>
