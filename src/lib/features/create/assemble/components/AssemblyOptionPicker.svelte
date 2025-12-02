<!--
AssemblyOptionPicker.svelte - Display 6 motion options for Guided Construct

Shows the 6 valid options from current position:
- STATIC, DASH, Direction1+PRO, Direction1+ANTI, Direction2+PRO, Direction2+ANTI

Responsive grid layout adapts to container aspect ratio
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import AssemblyOptionGrid from "./AssemblyOptionGrid.svelte";
  import type { PictographData } from "../../../../shared/pictograph/shared/domain/models/PictographData";
  import type { MotionColor } from "../../../../shared/pictograph/shared/domain/enums/pictograph-enums";

  const {
    options,
    onOptionSelected,
    visibleHand,
    isTransitioning = false,
  } = $props<{
    options: PictographData[];
    onOptionSelected: (option: PictographData) => void;
    visibleHand: MotionColor;
    isTransitioning?: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Handle option selection
  function handleOptionSelect(option: PictographData) {
    if (isTransitioning) return;

    hapticService?.trigger("selection");
    onOptionSelected(option);
  }

  // Get descriptive label for each option type
  function getOptionLabel(option: PictographData, index: number): string {
    const motion = option.motions[visibleHand as keyof typeof option.motions];
    if (!motion) return `Option ${index + 1}`;

    const motionType = motion.motionType;
    const endLoc = motion.endLocation;

    if (motionType === "static") return "Stay";
    if (motionType === "dash") return "Dash";

    // For shifts, show direction + rotation
    const direction = endLoc.split("_")[0]; // e.g., "NORTH" from "NORTH"
    const rotation = motionType === "pro" ? "Pro" : "Anti";

    return `${direction} ${rotation}`;
  }
</script>

<div class="option-viewer" class:transitioning={isTransitioning}>
  <AssemblyOptionGrid
    {options}
    {visibleHand}
    isDisabled={isTransitioning}
    onOptionSelect={handleOptionSelect}
    {getOptionLabel}
  />
</div>

<style>
  .option-viewer {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    container-type: size;
    container-name: option-viewer;
    box-sizing: border-box;
  }

  .option-viewer.transitioning {
    pointer-events: none;
    opacity: 0.7;
  }
</style>
