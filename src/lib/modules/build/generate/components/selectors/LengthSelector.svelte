<!--
Length Selector Component - Svelte Version
Simple increment/decrement control for sequence length.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import IncrementAdjusterButton from "./IncrementAdjusterButton.svelte";

  let {
    initialValue = 16,
    minValue = 4,
    maxValue = 64,
    adjustmentAmount = 2,
    onvalueChanged,
  } = $props<{
    initialValue?: number;
    minValue?: number;
    maxValue?: number;
    adjustmentAmount?: number;
    onvalueChanged?: (value: number) => void;
  }>();

  // State
  let currentValue = $state(initialValue);
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  // Notify parent of value change
  const notifyChange = (value: number) => {
    // Call parent callback if provided
    onvalueChanged?.(value);

    // Also dispatch custom event for backwards compatibility
    const event = new CustomEvent("valueChanged", {
      detail: { value },
    });
    document.dispatchEvent(event);
  };

  // Methods
  function increaseLength() {
    if (currentValue < maxValue) {
      hapticService?.trigger("selection");
      currentValue += adjustmentAmount;
      notifyChange(currentValue);
    }
  }

  function decreaseLength() {
    if (currentValue > minValue) {
      hapticService?.trigger("selection");
      currentValue -= adjustmentAmount;
      notifyChange(currentValue);
    }
  }

  // Public methods for parent component
  export function setValue(value: number) {
    if (minValue <= value && value <= maxValue) {
      currentValue = value;
    }
  }

  export function getValue() {
    return currentValue;
  }

  // Computed properties
  let canIncrease = $derived(currentValue < maxValue);
  let canDecrease = $derived(currentValue > minValue);
</script>

<div class="length-selector">
  <label class="selector-label" for="length-value">Length:</label>

  <IncrementAdjusterButton
    symbol="-"
    disabled={!canDecrease}
    onclick={decreaseLength}
    aria-label="Decrease sequence length"
  />

  <div
    class="value-display"
    id="length-value"
    role="spinbutton"
    aria-valuenow={currentValue}
    aria-valuemin={minValue}
    aria-valuemax={maxValue}
    aria-label="Sequence length"
  >
    {currentValue}
  </div>

  <IncrementAdjusterButton
    symbol="+"
    disabled={!canIncrease}
    onclick={increaseLength}
    aria-label="Increase sequence length"
  />
</div>

<style>
  .length-selector {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--control-gap, 12px);
    padding: var(--control-padding, 8px 0);
  }

  .selector-label {
    color: var(--label-color, rgba(255, 255, 255, 0.9));
    font-size: var(--label-size, 14px);
    font-weight: var(--label-weight, 500);
    margin: 0;
  }

  .value-display {
    color: var(--value-color, white);
    background: var(--value-bg, rgba(255, 255, 255, 0.1));
    border: var(--value-border, 1px solid rgba(255, 255, 255, 0.2));
    border-radius: var(--value-border-radius, 6px);
    padding: var(--value-padding, 6px 12px);
    min-width: var(--value-min-width, 30px);
    text-align: center;
    font-family: Georgia, serif;
    font-size: var(--value-size, 14px);
    font-weight: var(--value-weight, bold);
  }
</style>
