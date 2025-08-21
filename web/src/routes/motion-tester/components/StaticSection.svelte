<!--
StaticSection.svelte - Static pictograph with motion controls

Combines static pictograph display (no card wrapper) with motion designer controls
(blue/red prop panels) below. Grid toggle positioned as overlay on pictograph.
This is the left 2/3 section of the new layout.
-->
<script lang="ts">
  import type { MotionTesterState } from "../state/motion-tester-state.svelte";
  import Pictograph from "$lib/components/pictograph/Pictograph.svelte";
  import PropPanel from "./PropPanel.svelte";
  import SimpleGridToggle from "./SimpleGridToggle.svelte";
  import { resolve } from "$lib/services/bootstrap";
  import { IArrowPositioningOrchestratorInterface } from "$lib/services/di/interfaces/positioning-interfaces";
  import { ILetterQueryServiceInterface } from "$lib/services/di/interfaces/codex-interfaces";
  import type { PictographData } from "$lib/domain";
  import {
    createPictographData,
    createMotionData,
    createPropData,
    createGridData,
  } from "$lib/domain";
  import {
    MotionType,
    Orientation,
    GridMode,
    MotionColor,
    Location,
    RotationDirection,
  } from "$lib/domain/enums";

  interface Props {
    motionState: MotionTesterState;
  }

  let { motionState }: Props = $props();

  // Fixed size for consistent layout
  const PICTOGRAPH_SIZE = 320;

  // Resolve services
  const arrowPositioningService = resolve(
    IArrowPositioningOrchestratorInterface
  );

  // Use CSV lookup service to get real pictograph data
  let pictographData = $state<PictographData | null>(null);

  // Effect to update pictograph data when motion parameters change
  $effect(() => {
    // Access specific properties to establish reactive dependencies
    // These variables are intentionally unused - they exist only to track changes
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const blueStartLocation = motionState.blueMotionParams.startLocation;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const blueEndLocation = motionState.blueMotionParams.endLocation;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const blueMotionType = motionState.blueMotionParams.motionType;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const redStartLocation = motionState.redMotionParams.startLocation;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const redEndLocation = motionState.redMotionParams.endLocation;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const redMotionType = motionState.redMotionParams.motionType;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const gridMode = motionState.gridMode;

    // Immediately update pictograph data using CSV lookup
    updatePictographData();
  });

  async function updatePictographData() {
    try {
      console.log(
        "🔍 StaticSection: Creating dynamic pictograph from motion parameters..."
      );
      console.log("🔍 StaticSection: Current motion state values:", {
        blueEndLocation: motionState.blueMotionParams.endLocation,
        redEndLocation: motionState.redMotionParams.endLocation,
        blueStartLocation: motionState.blueMotionParams.startLocation,
        redStartLocation: motionState.redMotionParams.startLocation,
      });

      // Get the grid mode
      const gridMode =
        motionState.gridMode === GridMode.DIAMOND
          ? GridMode.DIAMOND
          : GridMode.BOX;

      // Create motion data from current motion parameters
      const blueMotion = createMotionData({
        startLocation: motionState.blueMotionParams.startLocation as Location,
        endLocation: motionState.blueMotionParams.endLocation as Location,
        startOrientation: motionState.blueMotionParams
          .startOrientation as Orientation,
        endOrientation: motionState.blueMotionParams
          .endOrientation as Orientation,
        motionType: motionState.blueMotionParams.motionType as MotionType,
        rotationDirection: motionState.blueMotionParams
          .rotationDirection as RotationDirection,
        turns: motionState.blueMotionParams.turns,
        isVisible: true,
        color: MotionColor.BLUE, // ✅ Explicitly set blue color
      });

      const redMotion = createMotionData({
        startLocation: motionState.redMotionParams.startLocation as Location,
        endLocation: motionState.redMotionParams.endLocation as Location,
        startOrientation: motionState.redMotionParams
          .startOrientation as Orientation,
        endOrientation: motionState.redMotionParams
          .endOrientation as Orientation,
        motionType: motionState.redMotionParams.motionType as MotionType,
        rotationDirection: motionState.redMotionParams
          .rotationDirection as RotationDirection,
        turns: motionState.redMotionParams.turns,
        isVisible: true,
        color: MotionColor.RED, // ✅ Explicitly set red color
      });

      // Create props based on motion end locations
      const blueProps = createPropData({
        orientation: motionState.blueMotionParams.endOrientation as Orientation,
        rotationDirection: motionState.blueMotionParams
          .rotationDirection as RotationDirection,
        isVisible: true,
      });

      const redProps = createPropData({
        orientation: motionState.redMotionParams.endOrientation as Orientation,
        rotationDirection: motionState.redMotionParams
          .rotationDirection as RotationDirection,
        isVisible: true,
      });

      // Simple approach: if both props end at the same location, try known beta-ending letters
      // This is much simpler than complex motion parameter matching
      let identifiedLetter = "";

      if (blueMotion.endLocation === redMotion.endLocation) {
        // Both props end at same location - try beta-ending letters
        const letterQueryService = resolve(ILetterQueryServiceInterface);

        // Try common beta-ending letters that have both props at same end location
        const betaLetters = ["G", "H", "I", "J", "K", "L"];

        for (const letter of betaLetters) {
          const pictograph = await letterQueryService.getPictographByLetter(
            letter,
            gridMode
          );
          if (
            pictograph &&
            pictograph.motions?.blue?.endLocation === blueMotion.endLocation &&
            pictograph.motions?.red?.endLocation === redMotion.endLocation
          ) {
            identifiedLetter = letter;
            console.log(
              `🔍 StaticSection: Found matching beta letter: ${letter}`
            );
            break;
          }
        }
      }

      console.log(
        "🔍 StaticSection: Using identified letter:",
        identifiedLetter
      );

      // Create the pictograph data
      const dynamicPictograph = createPictographData({
        id: `motion-tester-${Date.now()}`,
        gridData: createGridData({
          gridMode: gridMode,
          center_x: 0,
          center_y: 0,
          radius: 100,
        }),
        motions: {
          blue: blueMotion,
          red: redMotion,
        },
        props: {
          blue: blueProps,
          red: redProps,
        },
        letter: identifiedLetter, // ✅ Use the identified letter instead of empty string
        isBlank: false,
        isMirrored: false,
        metadata: {
          source: "motion_tester_dynamic",
          created: Date.now(),
        },
      });

      // Apply arrow positioning to get final positioned pictograph
      const positionedPictograph =
        await arrowPositioningService.calculateAllArrowPositions(
          dynamicPictograph
        );

      pictographData = positionedPictograph;
      console.log("✅ StaticSection: Dynamic pictograph created successfully!");
      console.log(
        "🔧 [DEBUG] pictographData is:",
        pictographData ? "NOT NULL" : "NULL"
      );
      console.log("🔧 [DEBUG] Pictograph data:", {
        id: pictographData?.id,
        letter: pictographData?.letter,
        blueProps: pictographData?.props?.blue,
        redProps: pictographData?.props?.red,
        blueMotions: pictographData?.motions?.blue,
        redMotions: pictographData?.motions?.red,
      });
    } catch (error) {
      console.error(
        "❌ StaticSection: Error creating dynamic pictograph:",
        error
      );
      pictographData = null;
    }
  }
</script>

<div class="static-section">
  <!-- Static Pictograph with Grid Toggle Overlay -->
  <div class="pictograph-area">
    <div class="grid-toggle-overlay">
      <SimpleGridToggle state={motionState} />
    </div>

    <div class="pictograph-container">
      {#if pictographData}
        {#key pictographData.id}
          <Pictograph {pictographData} />
        {/key}
      {:else}
        <div class="error-state">
          <span class="error-icon">⚠️</span>
          <p>Unable to display pictograph</p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Motion Designer Controls -->
  <div class="motion-controls">
    <!-- Blue Prop Section -->
    <div class="prop-section">
      <PropPanel
        propName="Blue"
        propColor="#60a5fa"
        startLocation={motionState.blueMotionParams.startLocation}
        endLocation={motionState.blueMotionParams.endLocation}
        startOrientation={motionState.blueMotionParams
          .startOrientation as Orientation}
        endOrientation={motionState.blueMotionParams
          .endOrientation as Orientation}
        turns={motionState.blueMotionParams.turns}
        motionType={motionState.blueMotionParams.motionType as MotionType}
        gridMode={motionState.gridMode}
        onStartLocationChange={(location) =>
          motionState.setBlueStartLocation(location)}
        onEndLocationChange={(location) =>
          motionState.setBlueEndLocation(location)}
        onStartOrientationChange={(orientation) =>
          motionState.updateBlueMotionParam("startOrientation", orientation)}
        onEndOrientationChange={(orientation) =>
          motionState.updateBlueMotionParam("endOrientation", orientation)}
        onTurnsChange={(turns) =>
          motionState.updateBlueMotionParam("turns", turns)}
        onMotionTypeChange={(motionType) =>
          motionState.updateBlueMotionParam("motionType", motionType)}
      />
    </div>

    <!-- Red Prop Section -->
    <div class="prop-section">
      <PropPanel
        propName="Red"
        propColor="#f87171"
        startLocation={motionState.redMotionParams.startLocation}
        endLocation={motionState.redMotionParams.endLocation}
        startOrientation={motionState.redMotionParams
          .startOrientation as Orientation}
        endOrientation={motionState.redMotionParams
          .endOrientation as Orientation}
        turns={motionState.redMotionParams.turns}
        motionType={motionState.redMotionParams.motionType as MotionType}
        gridMode={motionState.gridMode}
        onStartLocationChange={(location) =>
          motionState.setRedStartLocation(location)}
        onEndLocationChange={(location) =>
          motionState.setRedEndLocation(location)}
        onStartOrientationChange={(orientation) =>
          motionState.updateRedMotionParam("startOrientation", orientation)}
        onEndOrientationChange={(orientation) =>
          motionState.updateRedMotionParam("endOrientation", orientation)}
        onTurnsChange={(turns) =>
          motionState.updateRedMotionParam("turns", turns)}
        onMotionTypeChange={(motionType) =>
          motionState.updateRedMotionParam("motionType", motionType)}
      />
    </div>
  </div>
</div>

<style>
  .static-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: linear-gradient(
      135deg,
      rgba(16, 185, 129, 0.03),
      rgba(59, 130, 246, 0.03)
    );
    border-radius: 8px;
    overflow: hidden;
    container-type: size;
  }

  .pictograph-area {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .grid-toggle-overlay {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 10;
  }

  .pictograph-container {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.01);
    padding: 10px;
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #f87171;
    text-align: center;
    padding: 40px;
  }

  .error-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  .error-state p {
    margin: 0;
    font-size: 16px;
    color: #fca5a5;
  }

  .motion-controls {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1cqw;
    padding: 1.5cqw;
    min-height: 0;
    overflow: auto;
    container-type: size;
  }

  .prop-section {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  /* Container-based responsive layout */
  @container (max-width: 600px) {
    .motion-controls {
      grid-template-columns: 1fr;
      gap: 1.5cqw;
      padding: 2cqw;
    }
  }

  @container (max-width: 400px) {
    .motion-controls {
      gap: 2cqw;
      padding: 2.5cqw;
    }
  }

  /* Fallback media queries for older browsers */
  @media (max-width: 768px) {
    .pictograph-area {
      padding: 1.5vw;
    }

    .motion-controls {
      grid-template-columns: 1fr;
      padding: 2vw;
      gap: 1.5vw;
    }

    .grid-toggle-overlay {
      top: 1vw;
      right: 1vw;
    }
  }
</style>
