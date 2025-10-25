<!--
Turn Intensity Selector - Svelte Version
Simple increment/decrement control for turn intensity values.
Dynamically adjusts available values based on difficulty level.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import IncrementAdjusterButton from "./IncrementAdjusterButton.svelte";

  let { initialValue = 1.0, allowedValues, onvalueChanged } = $props<{
    initialValue?: number;
    allowedValues?: number[];
    onvalueChanged?: (value: number) => void;
  }>();

  // State - use provided allowedValues or default to all values
  let currentValue = $state(initialValue);
  let values = $derived(allowedValues ?? [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]);
  let hapticService: IHapticFeedbackService;

  // Notify parent of value change
  const notifyChange = (value: number) => {
    // Call parent callback if provided
    onvalueChanged?.(value);

    // Also dispatch custom event for backwards compatibility
    const event = new CustomEvent("valueChanged", {
      detail: { value },
    });
    if (typeof document !== 'undefined') {
      document.dispatchEvent(event);
    }
  };

  // When allowed values change, ensure current value is valid
  $effect(() => {
    if (!values.includes(currentValue)) {
      // Find closest valid value
      const closest = values.reduce((prev: number, curr: number) =>
        Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev
      );
      currentValue = closest;
      notifyChange(currentValue);
    }
  });

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  // Methods
  function adjustIntensity(change: number) {
    try {
      const currentIndex = values.indexOf(currentValue);
      const newIndex = currentIndex + change;

      if (newIndex >= 0 && newIndex < values.length) {
        const newValue = values[newIndex];
        if (newValue !== undefined) {
          hapticService?.trigger("selection");
          currentValue = newValue;
          notifyChange(currentValue);
        }
      }
    } catch {
      // Find closest value if current value isn't in array
      const closest = values.reduce((prev: number, curr: number) =>
        Math.abs(curr - currentValue) < Math.abs(prev - currentValue)
          ? curr
          : prev
      );
      const closestIndex = values.indexOf(closest);
      const newIndex = closestIndex + change;

      if (newIndex >= 0 && newIndex < values.length) {
        const newValue = values[newIndex];
        if (newValue !== undefined) {
          hapticService?.trigger("selection");
          currentValue = newValue;
          notifyChange(currentValue);
        }
      }
    }
  }

  function increaseIntensity() {
    adjustIntensity(1);
  }

  function decreaseIntensity() {
    adjustIntensity(-1);
  }

  // Public methods
  export function setValue(value: number) {
    if (values.includes(value)) {
      currentValue = value;
    } else {
      // Find closest value
      const closest = values.reduce((prev: number, curr: number) =>
        Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
      );
      currentValue = closest;
    }
  }

  export function getValue() {
    return currentValue;
  }

  // Computed properties
  let canIncrease = $derived(values.indexOf(currentValue) < values.length - 1);
  let canDecrease = $derived(values.indexOf(currentValue) > 0);
</script>

<div class="turn-intensity-selector">
  <div class="selector-label" id="turn-intensity-label">Turn Intensity:</div>

  <IncrementAdjusterButton
    symbol="-"
    disabled={!canDecrease}
    onclick={decreaseIntensity}
  />

  <div
    class="value-display"
    role="status"
    aria-labelledby="turn-intensity-label"
  >
    {currentValue}
  </div>

  <IncrementAdjusterButton
    symbol="+"
    disabled={!canIncrease}
    onclick={increaseIntensity}
  />
</div>

<style>
  .turn-intensity-selector {
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
