<!--
PictographWithVisibility.svelte - Enhanced Pictograph with Visibility Controls

Extends the basic Pictograph component with sophisticated visibility controls
matching the legacy desktop app's behavior.
-->
<script lang="ts">
  import type { PictographData } from "../domain/models/PictographData";
  import type { BeatData } from "../../../../modules/create/shared/domain/models/BeatData";
  import { onMount } from "svelte";
  import { getVisibilityStateManager } from "../state/visibility-state.svelte";
  import Pictograph from "./Pictograph.svelte";

  let {
    pictographData = null,
    beatData = null,
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

  // Compute visibility flags based on forceShowAll or global settings
  // When forceShowAll is true (preview mode), show everything
  // Otherwise, let Pictograph use global settings by passing undefined
  const showTKA = $derived.by(() => {
    visibilityUpdateCount; // Force reactivity
    return forceShowAll ? true : undefined;
  });

  const showVTG = $derived.by(() => {
    visibilityUpdateCount;
    return forceShowAll ? true : undefined;
  });

  const showElemental = $derived.by(() => {
    visibilityUpdateCount;
    return forceShowAll ? true : undefined;
  });

  const showPositions = $derived.by(() => {
    visibilityUpdateCount;
    return forceShowAll ? true : undefined;
  });

  const showReversals = $derived.by(() => {
    visibilityUpdateCount;
    return forceShowAll ? true : undefined;
  });

  const showNonRadialPoints = $derived.by(() => {
    visibilityUpdateCount;
    return forceShowAll ? true : undefined;
  });

  // Use original pictograph data without mutation
  // Visibility should only affect rendering, not data
  const effectivePictographData = $derived(
    pictographData || beatData?.pictographData
  );
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
    {...showTKA !== undefined && { showTKA }}
    {...showVTG !== undefined && { showVTG }}
    {...showElemental !== undefined && { showElemental }}
    {...showPositions !== undefined && { showPositions }}
    {...showReversals !== undefined && { showReversals }}
    {...showNonRadialPoints !== undefined && { showNonRadialPoints }}
    {...onToggleTKA && { onToggleTKA }}
    {...onToggleVTG && { onToggleVTG }}
    {...onToggleElemental && { onToggleElemental }}
    {...onTogglePositions && { onTogglePositions }}
    {...onToggleReversals && { onToggleReversals }}
    {...onToggleNonRadial && { onToggleNonRadial }}
  />
</div>

<style>
  .pictograph-with-visibility {
    position: relative;
    width: 100%;
    height: 100%;
  }
</style>
