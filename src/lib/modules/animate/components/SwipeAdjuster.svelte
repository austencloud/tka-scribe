<!--
  SwipeAdjuster.svelte

  2026-style swipe-based value adjustment component
  - Swipe left/right on label to adjust value
  - Shows live feedback during adjustment
  - Haptic feedback on value changes
  - +/- buttons available for precision
  - Smooth animations and micro-interactions
-->
<script lang="ts">
  import { resolve, TYPES } from "$shared";
  import type { IHapticFeedbackService } from "$shared/application/services/contracts";

  let {
    value = $bindable(),
    min = 0,
    max = 100,
    step = 1,
    label = "",
    unit = "",
    onInput,
    compact = false,
  }: {
    value: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
    onInput?: (newValue: number) => void;
    compact?: boolean;
  } = $props();

  // Services
  let hapticService: IHapticFeedbackService | null = null;

  // Touch state
  let touchStartX = 0;
  let touchStartValue = 0;
  let isSwiping = false;
  let swipeContainer: HTMLDivElement | null = null;

  // Visual feedback
  let showFeedback = $state(false);
  let feedbackValue = $state(value);

  // Resolve haptic service
  $effect(() => {
    try {
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.warn("Haptic service not available:", error);
    }
  });

  // Swipe sensitivity - pixels per step
  const SWIPE_SENSITIVITY = 3;

  function handleTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0]?.clientX ?? 0;
    touchStartValue = value;
    isSwiping = true;
    showFeedback = true;
    feedbackValue = value;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isSwiping) return;

    const currentX = e.touches[0]?.clientX ?? 0;
    const deltaX = currentX - touchStartX;

    // Calculate new value based on swipe distance
    const steps = Math.round(deltaX / SWIPE_SENSITIVITY);
    const newValue = Math.max(min, Math.min(max, touchStartValue + steps * step));

    // Only update if value changed
    if (newValue !== value) {
      value = parseFloat(newValue.toFixed(2));
      feedbackValue = value;
      hapticService?.trigger("selection");
      onInput?.(value);
    }
  }

  function handleTouchEnd() {
    isSwiping = false;
    setTimeout(() => {
      showFeedback = false;
    }, 300);
  }

  function increment() {
    const newValue = Math.min(max, value + step);
    if (newValue !== value) {
      value = parseFloat(newValue.toFixed(2));
      hapticService?.trigger("selection");
      onInput?.(value);
    }
  }

  function decrement() {
    const newValue = Math.max(min, value - step);
    if (newValue !== value) {
      value = parseFloat(newValue.toFixed(2));
      hapticService?.trigger("selection");
      onInput?.(value);
    }
  }

  // Format value for display
  function formatValue(val: number): string {
    // Remove trailing zeros and unnecessary decimal point
    return val.toString().replace(/\.0+$/, "");
  }
</script>

<div
  class="swipe-adjuster"
  class:compact
  class:swiping={isSwiping}
  bind:this={swipeContainer}
>
  <!-- Swipeable Label Area -->
  <div
    class="swipe-area"
    role="slider"
    aria-label={`${label}: ${value}${unit}`}
    aria-valuemin={min}
    aria-valuemax={max}
    aria-valuenow={value}
    tabindex="0"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    ontouchcancel={handleTouchEnd}
  >
    <div class="label-section">
      <span class="label">{label}</span>
      <span class="swipe-hint">
        <i class="fas fa-arrows-left-right"></i>
        swipe
      </span>
    </div>

    <!-- Live Value Display -->
    <div class="value-display" class:highlight={showFeedback}>
      <span class="value">{formatValue(feedbackValue)}</span>
      {#if unit}
        <span class="unit">{unit}</span>
      {/if}
    </div>
  </div>

  <!-- Precision Buttons -->
  <div class="button-controls">
    <button
      class="adjust-btn"
      onclick={decrement}
      disabled={value <= min}
      type="button"
      aria-label="Decrease {label}"
    >
      <i class="fas fa-minus"></i>
    </button>
    <button
      class="adjust-btn"
      onclick={increment}
      disabled={value >= max}
      type="button"
      aria-label="Increase {label}"
    >
      <i class="fas fa-plus"></i>
    </button>
  </div>

  <!-- Swipe Feedback Indicator -->
  {#if showFeedback}
    <div class="feedback-indicator"></div>
  {/if}
</div>

<style>
  .swipe-adjuster {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .swipe-adjuster.compact {
    padding: 6px 10px;
    gap: 6px;
  }

  .swipe-adjuster.swiping {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.3);
    transform: scale(1.02);
  }

  /* Swipeable Area */
  .swipe-area {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 8px;
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y; /* Allow vertical scrolling but capture horizontal */
    position: relative;
  }

  .swipe-area:active {
    cursor: grabbing;
  }

  .label-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .swipe-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.4);
    font-style: italic;
  }

  .swipe-hint i {
    font-size: 10px;
  }

  /* Value Display */
  .value-display {
    display: flex;
    align-items: baseline;
    gap: 4px;
    padding: 4px 12px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .value-display.highlight {
    background: rgba(59, 130, 246, 0.3);
    transform: scale(1.1);
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.4);
  }

  .value {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    font-variant-numeric: tabular-nums;
  }

  .unit {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    font-weight: 500;
  }

  /* Precision Buttons */
  .button-controls {
    display: flex;
    gap: 4px;
  }

  .adjust-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .compact .adjust-btn {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .adjust-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.95);
    transform: scale(1.05);
  }

  .adjust-btn:active {
    transform: scale(0.95);
  }

  .adjust-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    transform: none;
  }

  .adjust-btn:disabled:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
  }

  /* Feedback Indicator - Animated Glow */
  .feedback-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(59, 130, 246, 0.2) 50%,
      transparent 100%
    );
    animation: swipeGlow 0.6s ease-in-out infinite;
  }

  @keyframes swipeGlow {
    0%,
    100% {
      opacity: 0.3;
      transform: translateX(-100%);
    }
    50% {
      opacity: 0.8;
      transform: translateX(0);
    }
  }

  /* Accessibility */
  .swipe-area:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.6);
    outline-offset: 2px;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .swipe-adjuster,
    .value-display,
    .adjust-btn {
      transition: none;
      animation: none;
    }

    .feedback-indicator {
      display: none;
    }

    .swipe-adjuster.swiping {
      transform: none;
    }
  }
</style>
