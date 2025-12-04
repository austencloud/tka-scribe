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

  // Calculate display value based on what's configured
  const displayValue = $derived.by(() => {
    const parts: string[] = [];

    if (currentOptions.startPosition) {
      // Use startPosition property (e.g., "Alpha1") or fall back to letter
      const posName = currentOptions.startPosition.startPosition || currentOptions.startPosition.letter || "?";
      parts.push(`Start: ${posName}`);
    }

    // Only show end position in freeform mode
    if (isFreeformMode && currentOptions.endPosition) {
      // Use startPosition property for end position too (it's the same field on PictographData)
      const posName = currentOptions.endPosition.startPosition || currentOptions.endPosition.letter || "?";
      parts.push(`End: ${posName}`);
    }

    const letterCount =
      currentOptions.mustContainLetters.length +
      currentOptions.mustNotContainLetters.length;

    if (letterCount > 0) {
      parts.push(`${letterCount} letters`);
    }

    if (parts.length === 0) {
      return "Tap to Configure";
    }

    return parts.join(" · ");
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
