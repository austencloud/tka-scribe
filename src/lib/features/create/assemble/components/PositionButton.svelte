<!--
PositionButton.svelte - Individual position selection button

Displays a pictograph with a location label in a selectable button
-->
<script lang="ts">
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import {
    GridLocation,
    GridMode,
  } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
  import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";

  const { pictograph, location, handColor, gridMode, onSelect } = $props<{
    pictograph: PictographData;
    location: GridLocation;
    handColor: MotionColor;
    gridMode: GridMode;
    onSelect: (pictograph: PictographData, location: GridLocation) => void;
  }>();
</script>

<button
  class="position-button"
  onclick={() => onSelect(pictograph, location)}
  aria-label={`Select starting position ${location}`}
>
  <Pictograph pictographData={pictograph} visibleHand={handColor} {gridMode} />
</button>

<style>
  .position-button {
    /* Fill the entire grid cell */
    width: 100%;
    height: 100%;

    min-width: 0;
    min-height: 0;

    /* Clean transparent button */
    background: transparent;
    border: none;
    padding: 0;

    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

    /* Ensure pictograph scales to fit available space */
    container-type: size;
  }

  /* Hover effects */
  @media (hover: hover) {
    .position-button:hover {
      transform: scale(1.05);
    }
  }

  .position-button:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
</style>
