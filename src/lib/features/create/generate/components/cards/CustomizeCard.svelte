<!--
CustomizeCard.svelte - Card for opening customize generation options
Opens sheet with start/end position and letter constraint options
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { CustomizeOptions } from "$lib/features/create/shared/state/panel-coordination-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount, getContext } from "svelte";
  import type { PanelCoordinationState } from "$lib/features/create/shared/state/panel-coordination-state.svelte";
  import BaseCard from "./BaseCard.svelte";

  let {
    currentOptions,
    onOptionsChange,
    isFreeformMode = true,
    color = "linear-gradient(135deg, #64748b 0%, #475569 100%)", // Slate gray - classy
    shadowColor = "215deg 20% 40%", // Slate shadow
    gridColumnSpan = 2,
    cardIndex = 0,
    headerFontSize = "9px",
  } = $props<{
    currentOptions: CustomizeOptions;
    onOptionsChange: (options: CustomizeOptions) => void;
    isFreeformMode?: boolean;
    color?: string;
    shadowColor?: string;
    gridColumnSpan?: number;
    cardIndex?: number;
    headerFontSize?: string;
  }>();

  let hapticService: IHapticFeedbackService;

  // Get panel coordination state from context (provided by CreateModule)
  const panelState = getContext<PanelCoordinationState>("panelState");

  onMount(async () => {
    hapticService = await resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Open customize panel via coordinator (renders at CreateModule level)
  function openExpanded() {
    hapticService?.trigger("selection");

    panelState?.openCustomizePanel?.(
      currentOptions,
      onOptionsChange,
      isFreeformMode
    );
  }

  // Calculate display value - compact indicator only
  const displayValue = $derived.by(() => {
    // Count how many options are configured
    let configuredCount = 0;

    if (currentOptions.startPosition) {
      configuredCount++;
    }

    if (isFreeformMode && currentOptions.endPosition) {
      configuredCount++;
    }

    const letterCount =
      currentOptions.mustContainLetters.length +
      currentOptions.mustNotContainLetters.length;

    if (letterCount > 0) {
      configuredCount++;
    }

    // Show simple indicator
    if (configuredCount === 0) {
      return "None";
    }

    // Show count of configured options (with proper plural)
    return configuredCount === 1 ? "1 setting" : `${configuredCount} settings`;
  });
</script>

<BaseCard
  title="Customize"
  currentValue={displayValue}
  {color}
  {shadowColor}
  {gridColumnSpan}
  {cardIndex}
  {headerFontSize}
  onClick={openExpanded}
/>
