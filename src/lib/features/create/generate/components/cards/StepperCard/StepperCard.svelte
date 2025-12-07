<!--
StepperCard.svelte - Re-exports from shared for backwards compatibility
The actual implementation is now in $lib/shared/components/stepper-card
-->
<script lang="ts">
  // Re-export all props to maintain the same interface
  import { StepperCard as SharedStepperCard } from "$lib/shared/components/stepper-card";

  let {
    title,
    currentValue,
    minValue,
    maxValue,
    onIncrement,
    onDecrement,
    formatValue = (val: number) => val.toString(),
    subtitle = "",
    description = "",
    color = "#3b82f6",
    shadowColor = "0deg 0% 0%",
    textColor = "white",
    gridColumnSpan = 2,
    cardIndex = 0,
    headerFontSize = "9px",
  } = $props<{
    title: string;
    currentValue: number;
    minValue: number;
    maxValue: number;
    onIncrement: () => void;
    onDecrement: () => void;
    formatValue?: (value: number) => string;
    subtitle?: string;
    description?: string;
    color?: string;
    shadowColor?: string;
    textColor?: string;
    gridColumnSpan?: number;
    cardIndex?: number;
    headerFontSize?: string;
  }>();
</script>

<SharedStepperCard
  {title}
  {currentValue}
  {minValue}
  {maxValue}
  {onIncrement}
  {onDecrement}
  {formatValue}
  {subtitle}
  {description}
  {color}
  {shadowColor}
  {textColor}
  {gridColumnSpan}
  {cardIndex}
  {headerFontSize}
/>
