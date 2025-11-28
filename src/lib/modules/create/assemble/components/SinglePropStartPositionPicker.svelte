<!--
SinglePropStartPositionPicker.svelte - Start position picker for Guided Construct

Shows 4 cardinal positions (N, E, S, W) or 4 corner positions (NE, SE, SW, NW)
With grid mode toggle to switch between Diamond and Box mode
-->
<script lang="ts">
  import type { PictographData } from "$shared/pictograph/shared/domain/models/PictographData";
  import type { IHapticFeedbackService } from "$shared/application/services/contracts/IHapticFeedbackService";
  import { GridMode } from "$shared/pictograph/grid/domain/enums/grid-enums";
  import {
    GridLocation,
    GridMode as GridModeEnum,
  } from "$shared/pictograph/grid/domain/enums/grid-enums";
  import { resolve } from "$shared/inversify";
  import { TYPES } from "$shared/inversify/types";
  import { createPictographData } from "$shared/pictograph/shared/domain/factories";
  import { createMotionData } from "$shared/pictograph/shared/domain/models";
  import { MotionColor, MotionType, RotationDirection } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
  import { Orientation } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
  import { PropType } from "$shared/pictograph/prop/domain/enums/PropType";
  import { onMount } from "svelte";
  import GridModeToggle from "../../construct/shared/components/GridModeToggle.svelte";
  import PositionGrid from "./PositionGrid.svelte";

  const {
    onPositionSelected,
    onGridModeChange,
    currentGridMode = GridModeEnum.DIAMOND,
    handColor = MotionColor.BLUE,
    showInlineGridToggle = true,
  } = $props<{
    onPositionSelected: (
      position: PictographData,
      location: GridLocation
    ) => void;
    onGridModeChange?: (gridMode: GridMode) => void;
    currentGridMode?: GridMode;
    handColor?: MotionColor;
    showInlineGridToggle?: boolean;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Generate locations based on grid mode
  const locations = $derived.by(() =>
    currentGridMode === GridModeEnum.DIAMOND
      ? [
          GridLocation.NORTH,
          GridLocation.EAST,
          GridLocation.SOUTH,
          GridLocation.WEST,
        ]
      : [
          GridLocation.NORTHEAST,
          GridLocation.SOUTHEAST,
          GridLocation.SOUTHWEST,
          GridLocation.NORTHWEST,
        ]
  );

  // Generate 4 starting position options based on grid mode
  const startPositions = $derived.by(() =>
    locations.map((location) =>
      createStartPositionPictograph(location, handColor, currentGridMode)
    )
  );

  // Create a single-prop starting position pictograph
  function createStartPositionPictograph(
    location: GridLocation,
    color: MotionColor,
    gridMode: GridMode
  ): PictographData {
    const motion = createMotionData({
      color,
      startLocation: location,
      endLocation: location,
      motionType: MotionType.STATIC,
      rotationDirection: RotationDirection.NO_ROTATION,
      gridMode,
      propType: PropType.HAND,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN,
      turns: 0,
      arrowLocation: location,
      isVisible: true,
    });

    return createPictographData({
      motions: {
        [color]: motion,
      },
    });
  }

  // Handle position selection
  function handlePositionSelect(
    pictograph: PictographData,
    location: GridLocation
  ) {
    hapticService?.trigger("selection");
    onPositionSelected(pictograph, location);
  }

  // Handle grid mode change
  function handleGridModeChange(newGridMode: GridMode) {
    onGridModeChange?.(newGridMode);
  }
</script>

<div class="start-position-picker">
  <!-- Header with title and grid mode toggle -->
  {#if showInlineGridToggle}
    <div class="picker-header">
      <div class="header-spacer"></div>
      <div class="grid-toggle-container">
        <GridModeToggle
          {currentGridMode}
          onGridModeChange={handleGridModeChange}
        />
      </div>
    </div>
  {/if}

  <!-- 4 Position Grid -->
  <PositionGrid
    positions={startPositions}
    {locations}
    {handColor}
    gridMode={currentGridMode}
    onPositionSelect={handlePositionSelect}
  />
</div>

<style>
  .start-position-picker {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: min(2cqmin, 1.5rem);
    gap: min(2cqmin, 1rem);
    container-type: size;
    container-name: start-picker;
    box-sizing: border-box;
  }

  .picker-header {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: min(2cqmin, 1rem);
    padding: min(1cqmin, 0.5rem);
    flex-shrink: 0;
  }

  .grid-toggle-container {
    display: flex;
    justify-content: flex-end;
  }
</style>
