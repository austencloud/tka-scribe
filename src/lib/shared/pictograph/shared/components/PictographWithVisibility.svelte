<!--
PictographWithVisibility.svelte - Enhanced Pictograph with Visibility Controls

Extends the basic Pictograph component with sophisticated visibility controls
matching the legacy desktop app's behavior.
-->
<script lang="ts">
  import type { BeatData, PictographData } from "$shared";
  import { onMount } from "svelte";
  import { getVisibilityStateManager } from "../state/visibility-state.svelte";
  import Pictograph from "./Pictograph.svelte";

  let {
    pictographData = null,
    beatData = null,
    onClick,
    enableVisibility = true,
    forceShowAll = false,
    onToggleTKA = undefined,
    onToggleVTG = undefined,
    onToggleElemental = undefined,
    onTogglePositions = undefined,
    onToggleReversals = undefined,
    onToggleNonRadial = undefined,
  } = $props<{
    /** Pictograph data to render */
    pictographData?: PictographData | null;
    /** Beat data (alternative to pictographData) */
    beatData?: BeatData | null;
    /** Click handler */
    onClick?: () => void;
    /** Animation duration for transitions */
    animationDuration?: number;
    /** Show loading indicator */
    showLoadingIndicator?: boolean;
    /** Beat number for display */
    beatNumber?: number | null;
    /** Is this a start position? */
    isStartPosition?: boolean;
    /** Enable visibility controls (default: true) */
    enableVisibility?: boolean;
    /** Force show all elements (for visibility preview) */
    forceShowAll?: boolean;
    /** Toggle callbacks for interactive visibility */
    onToggleTKA?: () => void;
    onToggleVTG?: () => void;
    onToggleElemental?: () => void;
    onTogglePositions?: () => void;
    onToggleReversals?: () => void;
    onToggleNonRadial?: () => void;
  }>();

  // Visibility state manager
  let visibilityManager = getVisibilityStateManager();
  let visibilityUpdateCount = $state(0);

  // Force re-render when visibility changes
  function handleVisibilityChange() {
    visibilityUpdateCount++;
  }

  onMount(() => {
    if (enableVisibility) {
      visibilityManager.registerObserver(handleVisibilityChange);

      return () => {
        visibilityManager.unregisterObserver(handleVisibilityChange);
      };
    }

    return undefined;
  });

  // State values for effective pictograph data and visibility flags
  let effectivePictographData = $state<PictographData | null>(null);
  let showTKA = $state(true);
  let showVTG = $state(true);
  let showElemental = $state(true);
  let showPositions = $state(true);
  let showReversals = $state(true);
  let showNonRadialPoints = $state(true);

  // Update effective pictograph data when visibility or data changes
  $effect(() => {
    // Force reactivity by accessing visibilityUpdateCount
    visibilityUpdateCount;

    const originalData = pictographData || beatData?.pictographData;
    if (!originalData || !enableVisibility || forceShowAll) {
      effectivePictographData = originalData;
    } else {
      // Apply visibility filters
      const filteredData = { ...originalData };

      // Filter letter based on TKA visibility
      if (!visibilityManager.getGlyphVisibility("TKA")) {
        filteredData.letter = null;
      }

      effectivePictographData = filteredData;
    }
  });

  // Update visibility flags when visibility settings change
  $effect(() => {
    const count = visibilityUpdateCount; // Force reactivity by reading the value

    console.log("🔄 [PictographWithVisibility] Updating visibility flags, count:", count);

    showTKA = forceShowAll || !enableVisibility || visibilityManager.getGlyphVisibility("TKA");
    showVTG = forceShowAll || !enableVisibility || visibilityManager.getGlyphVisibility("VTG");
    showElemental = forceShowAll || !enableVisibility || visibilityManager.getGlyphVisibility("Elemental");
    showPositions = forceShowAll || !enableVisibility || visibilityManager.getGlyphVisibility("Positions");
    showReversals = forceShowAll || !enableVisibility || visibilityManager.getGlyphVisibility("Reversals");
    showNonRadialPoints = forceShowAll || !enableVisibility || visibilityManager.getNonRadialVisibility();

    console.log("✅ [PictographWithVisibility] Visibility flags updated:", {
      showTKA,
      showVTG,
      showElemental,
      showPositions,
      showReversals,
      showNonRadialPoints,
    });
  });
</script>

<!-- Enhanced Pictograph with Visibility Controls -->
<div
  class="pictograph-with-visibility"
  class:visibility-enabled={enableVisibility}
  class:force-show-all={forceShowAll}
>
  <!-- Base Pictograph Component with Visibility Props -->
  <Pictograph
    pictographData={effectivePictographData}
    {showTKA}
    {showVTG}
    {showElemental}
    {showPositions}
    {showReversals}
    {showNonRadialPoints}
    {onToggleTKA}
    {onToggleVTG}
    {onToggleElemental}
    {onTogglePositions}
    {onToggleReversals}
    {onToggleNonRadial}
  />
</div>

<style>
  .pictograph-with-visibility {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
