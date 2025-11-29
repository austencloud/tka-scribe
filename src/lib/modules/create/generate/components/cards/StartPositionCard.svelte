<!--
StartPositionCard.svelte - Card for selecting start position
Always opens selector panel when clicked
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount, getContext } from "svelte";
  import type { PanelCoordinationState } from "$create/shared/state/panel-coordination-state.svelte";
  import BaseCard from "./BaseCard.svelte";

  let {
    currentPosition,
    onPositionChange,
    color = "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", // Cyan/teal gradient
    shadowColor = "190deg 75% 45%", // Cyan-matched shadow
    gridColumnSpan = 2,
    cardIndex = 0,
    headerFontSize = "9px",
  } = $props<{
    currentPosition?: PictographData | null;
    onPositionChange: (position: PictographData) => void;
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

  // Open start position panel via coordinator (renders at CreateModule level)
  function openExpanded() {
    hapticService?.trigger("selection");

    // Open the start position panel via coordinator - this renders at CreateModule level
    // so the backdrop will properly cover the workspace
    panelState?.openStartPositionPanel?.(
      currentPosition || null,
      onPositionChange
    );
  }

  // Format display value
  const displayValue = $derived(currentPosition?.letter || "Select Position");
</script>

<BaseCard
  title="Start Position"
  currentValue={displayValue}
  {color}
  {shadowColor}
  {gridColumnSpan}
  {cardIndex}
  {headerFontSize}
  onClick={openExpanded}
/>
