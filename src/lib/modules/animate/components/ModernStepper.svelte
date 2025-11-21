<!--
  ModernStepper.svelte

  Modern 2026-style stepper component with increment/decrement buttons.
  Click-based interaction with premium visual feedback.
-->
<script lang="ts">
  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    label = "",
    unit = "",
    formatValue = (v: number) => v.toFixed(1),
    onInput = (_value) => {},
    compact = false,
  }: {
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    unit?: string;
    formatValue?: (value: number) => string;
    onInput?: (value: number) => void;
    compact?: boolean;
  } = $props();

  let canDecrement = $derived(value > min);
  let canIncrement = $derived(value < max);

  function increment() {
    if (!canIncrement) return;
    const newValue = Math.min(value + step, max);
    value = newValue;
    onInput(newValue);
  }

  function decrement() {
    if (!canDecrement) return;
    const newValue = Math.max(value - step, min);
    value = newValue;
    onInput(newValue);
  }

  function handleKeyDown(
    event: KeyboardEvent,
    action: "increment" | "decrement"
  ) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      if (action === "increment") increment();
      else decrement();
    }
  }
</script>

<div class="modern-stepper" class:compact>
  <!-- Label -->
  {#if label}
    <label class="stepper-label">{label}</label>
  {/if}

  <!-- Stepper controls -->
  <div class="stepper-controls">
    {#if !compact}
      <!-- Normal layout: minus, value, plus (horizontal) -->
      <!-- Decrement button -->
      <button
        class="stepper-btn"
        class:disabled={!canDecrement}
        onclick={decrement}
        onkeydown={(e) => handleKeyDown(e, "decrement")}
        disabled={!canDecrement}
        type="button"
        aria-label="Decrease {label}"
      >
        <i class="fas fa-minus"></i>
      </button>

      <!-- Value display -->
      <div class="stepper-value">
        <span class="value-number">{formatValue(value)}</span>
        {#if unit}
          <span class="value-unit">{unit}</span>
        {/if}
      </div>

      <!-- Increment button -->
      <button
        class="stepper-btn"
        class:disabled={!canIncrement}
        onclick={increment}
        onkeydown={(e) => handleKeyDown(e, "increment")}
        disabled={!canIncrement}
        type="button"
        aria-label="Increase {label}"
      >
        <i class="fas fa-plus"></i>
      </button>
    {:else}
      <!-- Compact layout: buttons on top, value below -->
      <div class="compact-buttons">
        <button
          class="stepper-btn"
          class:disabled={!canDecrement}
          onclick={decrement}
          onkeydown={(e) => handleKeyDown(e, "decrement")}
          disabled={!canDecrement}
          type="button"
          aria-label="Decrease {label}"
        >
          <i class="fas fa-minus"></i>
        </button>
        <button
          class="stepper-btn"
          class:disabled={!canIncrement}
          onclick={increment}
          onkeydown={(e) => handleKeyDown(e, "increment")}
          disabled={!canIncrement}
          type="button"
          aria-label="Increase {label}"
        >
          <i class="fas fa-plus"></i>
        </button>
      </div>

      <!-- Value display below -->
      <div class="stepper-value">
        <span class="value-number">{formatValue(value)}</span>
        {#if unit}
          <span class="value-unit">{unit}</span>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  /* ===========================
     MODERN STEPPER - 2026 Design
     Click-based value adjustment
     =========================== */

  .modern-stepper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 0.8vw, 6px);
  }

  /* ===========================
     LABEL
     =========================== */

  .stepper-label {
    font-size: clamp(10px, 2vw, 11px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ===========================
     STEPPER CONTROLS
     =========================== */

  .stepper-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 0.8vw, 6px);
  }

  /* Compact mode: vertical layout */
  .compact .stepper-controls {
    flex-direction: column;
    gap: clamp(6px, 1.2vw, 8px);
  }

  .compact-buttons {
    display: flex;
    gap: clamp(4px, 0.8vw, 6px);
  }

  /* ===========================
     STEPPER BUTTONS
     =========================== */

  .stepper-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(10px, 2vw, 14px);
    min-width: clamp(44px, 8.8vw, 52px); /* Better touch target */
    min-height: clamp(44px, 8.8vw, 52px);
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: clamp(10px, 2vw, 12px);
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(14px, 2.8vw, 16px);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .stepper-btn i {
    font-size: clamp(14px, 2.8vw, 16px);
  }

  @media (hover: hover) and (pointer: fine) {
    .stepper-btn:not(.disabled):hover {
      background: rgba(59, 130, 246, 0.25);
      border-color: rgba(59, 130, 246, 0.5);
      color: rgba(191, 219, 254, 1);
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
  }

  .stepper-btn:not(.disabled):active {
    transform: scale(0.95);
    background: rgba(59, 130, 246, 0.35);
  }

  .stepper-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* ===========================
     VALUE DISPLAY
     =========================== */

  .stepper-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    padding: clamp(4px, 0.8vw, 6px) clamp(6px, 1.2vw, 8px);
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: clamp(6px, 1.2vw, 8px);
    min-height: clamp(28px, 5vw, 32px);
  }

  .value-number {
    font-size: clamp(12px, 2.4vw, 14px);
    font-weight: 700;
    color: rgba(191, 219, 254, 1);
    font-variant-numeric: tabular-nums;
  }

  .value-unit {
    font-size: clamp(9px, 1.8vw, 10px);
    font-weight: 600;
    color: rgba(147, 197, 253, 0.8);
    text-transform: lowercase;
  }

  /* ===========================
     DESKTOP CONTAINER QUERY UNITS
     =========================== */

  @container (min-aspect-ratio: 5/4) {
    .modern-stepper {
      gap: 0.25cqh;
    }

    .stepper-label {
      font-size: 0.9cqh;
    }

    .stepper-controls {
      gap: 0.3cqw;
    }

    .stepper-btn {
      padding: 0.5cqh 0.3cqw;
      min-height: 2.8cqh;
      max-height: 3.2cqh;
    }

    .stepper-btn i {
      font-size: 1cqh;
    }

    .stepper-value {
      padding: 0.4cqh 0.4cqw;
      min-height: 2.8cqh;
    }

    .value-number {
      font-size: 1.1cqh;
    }

    .value-unit {
      font-size: 0.8cqh;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .stepper-btn {
      transition: none;
    }

    .stepper-btn:hover,
    .stepper-btn:active {
      transform: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .stepper-btn {
      border-width: 2px;
    }

    .stepper-label,
    .value-number {
      color: #ffffff;
    }
  }

  /* Focus visible for keyboard navigation */
  .stepper-btn:focus-visible {
    outline: 2px solid rgba(59, 130, 246, 0.8);
    outline-offset: 2px;
  }
</style>
