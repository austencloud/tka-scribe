<!--
W- Dash Arrow Comparison: Legacy vs Modern
Testing W- with red going East→South, blue going South→North (dash arrows at West)
-->
<script lang="ts">
  import type { IOrientationCalculationService } from "$lib/shared/pictograph/prop/services/contracts/IOrientationCalculationService";
  import type { PictographData } from "$shared";
  import {
    createMotionData,
    createPictographData,
    GridLocation,
    GridPosition,
    Letter,
    MotionColor,
    MotionType,
    Orientation,
    Pictograph,
    resolve,
    RotationDirection,
    TYPES,
  } from "$shared";
  import { onMount } from "svelte";

  // Try to import legacy Pictograph component
  let LegacyPictograph = $state<any>(null);
  let legacyImportError = $state<string | null>(null);

  let testPictograph = $state<PictographData | null>(null);
  let legacyPictographData = $state<any>(null);

  onMount(async () => {
    // Get the orientation calculation service
    const orientationService = resolve(
      TYPES.IOrientationCalculationService
    ) as IOrientationCalculationService;

    // Create motion data for W- letter (dash motions) - tests dash arrow placement
    // Red motion: East → South (dash)
    const redMotionData = createMotionData({
      motionType: MotionType.PRO,
      rotationDirection: RotationDirection.CLOCKWISE,
      startLocation: GridLocation.EAST,
      endLocation: GridLocation.SOUTH,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.IN, // Will be calculated
      turns: 0,
      color: MotionColor.RED,
    });

    // Blue motion: South → North (dash)
    const blueMotionData = createMotionData({
      motionType: MotionType.DASH,
      rotationDirection: RotationDirection.NO_ROTATION,
      startLocation: GridLocation.SOUTH,
      endLocation: GridLocation.NORTH,
      startOrientation: Orientation.IN,
      endOrientation: Orientation.OUT, // Will be calculated
      turns: 0,
      color: MotionColor.BLUE,
    });

    // Calculate the correct end orientations
    const redEndOrientation = orientationService.calculateEndOrientation(
      redMotionData,
      MotionColor.RED
    );
    const blueEndOrientation = orientationService.calculateEndOrientation(
      blueMotionData,
      MotionColor.BLUE
    );

    console.log(
      `🧮 W- Dash Arrow Test: Red DASH E→S ${redEndOrientation}, Blue DASH S→N ${blueEndOrientation}`
    );

    // Update motion data with calculated end orientations
    const redMotionFinal = {
      ...redMotionData,
      endOrientation: redEndOrientation,
    };
    const blueMotionFinal = {
      ...blueMotionData,
      endOrientation: blueEndOrientation,
    };

    // Create the W- pictograph (both DASH motions) - should show dash arrows at West
    const modernPictograph = createPictographData({
      letter: Letter.W_DASH,
      startPosition: GridPosition.ALPHA1,
      endPosition: GridPosition.BETA3,
      motions: {
        red: redMotionFinal,
        blue: blueMotionFinal,
      },
    });

    // Use modern format for modern pictograph
    testPictograph = modernPictograph;

    // Convert to legacy format for legacy pictograph
    legacyPictographData = {
      // TKA
      letter: modernPictograph.letter,
      startPos: modernPictograph.startPosition,
      endPos: modernPictograph.endPosition,

      // VTG
      timing: null,
      direction: null,

      // Grid
      gridMode: "diamond",
      gridData: null,

      // Motion - convert from modern motions object to legacy individual properties
      blueMotionData: modernPictograph.motions?.blue
        ? {
            id: "blue-motion",
            color: "blue",
            motionType: modernPictograph.motions.blue.motionType,
            startLoc: modernPictograph.motions.blue.startLocation,
            endLoc: modernPictograph.motions.blue.endLocation,
            startOri: modernPictograph.motions.blue.startOrientation,
            endOri: modernPictograph.motions.blue.endOrientation,
            turns: modernPictograph.motions.blue.turns,
            propRotDir:
              modernPictograph.motions.blue.rotationDirection === "cw"
                ? "cw"
                : "ccw",
            leadState: null,
            handRotDir: null,
            prefloatMotionType: null,
            prefloatPropRotDir: null,
          }
        : null,
      redMotionData: modernPictograph.motions?.red
        ? {
            id: "red-motion",
            color: "red",
            motionType: modernPictograph.motions.red.motionType,
            startLoc: modernPictograph.motions.red.startLocation,
            endLoc: modernPictograph.motions.red.endLocation,
            startOri: modernPictograph.motions.red.startOrientation,
            endOri: modernPictograph.motions.red.endOrientation,
            turns: modernPictograph.motions.red.turns,
            propRotDir:
              modernPictograph.motions.red.rotationDirection === "cw"
                ? "cw"
                : "ccw",
            leadState: null,
            handRotDir: null,
            prefloatMotionType: null,
            prefloatPropRotDir: null,
          }
        : null,

      motions: undefined,
      redMotion: null,
      blueMotion: null,

      // Props
      redPropData: null,
      bluePropData: null,
      props: undefined,

      // Arrows
      redArrowData: null,
      blueArrowData: null,

      grid: "diamond",

      // Special flag
      isStartPosition: false,
    };

    // Try to import legacy Pictograph
    try {
      // Temporarily disabled for build compatibility
      // const legacyModule = await import(
      //   "../../../legacy_web_app/src/lib/components/Pictograph/Pictograph.svelte"
      // );
      // LegacyPictograph = legacyModule.default;
      legacyImportError = "Legacy import temporarily disabled for build compatibility";
    } catch (error) {
      legacyImportError =
        error instanceof Error ? error.message : String(error);
      console.error("Failed to import legacy Pictograph:", error);
    }
  });
</script>

<div class="comparison">
  <div class="side">
    <h2>Modern W- (Testing Dash Arrows)</h2>
    {#if testPictograph}
      <Pictograph pictographData={testPictograph} />
    {/if}
  </div>

  <div class="side">
    <h2>Legacy W- (Reference)</h2>
    {#if legacyImportError}
      <div class="error-display">
        <h3>Legacy Import Error:</h3>
        <pre>{legacyImportError}</pre>
        <p>
          Need to fix legacy app imports before we can load the legacy
          Pictograph component.
        </p>
      </div>
    {:else if LegacyPictograph && legacyPictographData}
      <LegacyPictograph pictographData={legacyPictographData} />
    {:else}
      <div class="loading">Loading legacy component...</div>
    {/if}
  </div>
</div>

<style>
  .comparison {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    font-family: system-ui, sans-serif;
    justify-content: center;
  }

  .side {
    text-align: center;
    flex: 1;
    max-width: 500px;
  }

  .side h2 {
    margin-bottom: 1rem;
    color: #374151;
  }

  .error-display {
    border: 2px solid #dc2626;
    border-radius: 8px;
    padding: 1rem;
    background: #fef2f2;
    color: #dc2626;
  }

  .error-display pre {
    background: #fff;
    padding: 0.5rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.8rem;
    margin: 0.5rem 0;
  }

  .loading {
    padding: 2rem;
    text-align: center;
    color: #666;
  }
</style>
