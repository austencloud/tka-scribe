<!--
GenerationModeCard.svelte - Card for toggling generation mode
Shows BOTH Freeform and Circular options vertically with clear active/inactive states
-->
<script lang="ts">
  import { GenerationMode } from "$lib/features/create/generate/shared/domain/models/generate-models";
  import ToggleCard from "./ToggleCard.svelte";

  let {
    currentMode,
    onModeChange,
    // 🎨 EXTREME: Super vibrant purple gradient with HUGE contrast
    color = "radial-gradient(ellipse at top left, #ede9fe 0%, #ddd6fe 20%, #c4b5fd 40%, #a78bfa 60%, var(--theme-accent-strong) 80%, #6d28d9 100%)",
    shadowColor = "270deg 70% 55%", // Purple-matched shadow
    gridColumnSpan = 2,
    cardIndex = 0,
    headerFontSize = "9px",
  } = $props<{
    currentMode: GenerationMode;
    onModeChange: (mode: GenerationMode) => void;
    color?: string;
    shadowColor?: string;
    gridColumnSpan?: number;
    cardIndex?: number;
    headerFontSize?: string;
  }>();
</script>

<ToggleCard
  title="Mode"
  option1={{
    value: GenerationMode.CIRCULAR,
    label: "LOOP",
    icon: "arrows-rotate",
  }}
  option2={{
    value: GenerationMode.FREEFORM,
    label: "Freeform",
    icon: "bullseye",
  }}
  activeOption={currentMode}
  onToggle={onModeChange}
  {color}
  {shadowColor}
  {gridColumnSpan}
  {cardIndex}
  {headerFontSize}
/>
