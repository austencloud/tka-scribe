<!--
  ThumbnailBeatCell - Single Cell in Thumbnail Beat Grid

  Renders a real Pictograph component with proper props and arrows.
  Uses disableContentTransitions for static rendering.
-->
<script lang="ts">
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { ThumbnailRenderConfig } from "./thumbnail-types";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";

  let {
    beatData,
    isStartPosition = false,
    renderConfig,
    cellSize = 60,
  } = $props<{
    beatData: BeatData | StartPositionData;
    isStartPosition?: boolean;
    renderConfig: ThumbnailRenderConfig;
    cellSize?: number;
  }>();

  // Get beat number for display
  const beatNumber = $derived((beatData as BeatData)?.beatNumber ?? null);
</script>

<div
  class="thumbnail-beat-cell"
  class:start-position={isStartPosition}
  style="width: {cellSize}px; height: {cellSize}px;"
>
  <Pictograph
    pictographData={beatData}
    disableContentTransitions={true}
    showTKA={renderConfig.showTKA}
    showVTG={renderConfig.showVTG}
    showElemental={renderConfig.showElemental}
    showPositions={renderConfig.showPositions}
    showReversals={renderConfig.showReversals}
    showNonRadialPoints={renderConfig.showNonRadialPoints}
  />
</div>

<style>
  .thumbnail-beat-cell {
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    background: white;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .thumbnail-beat-cell.start-position {
    border: 2px solid var(--theme-accent, #3b82f6);
  }
</style>
