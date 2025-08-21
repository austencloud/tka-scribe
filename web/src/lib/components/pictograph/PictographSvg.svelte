<!--
PictographSvg.svelte - SVG Rendering Component

Handles the actual SVG rendering of the pictograph content.
This component is focused solely on rendering the SVG elements
and leaves state management to the parent component.
-->
<script lang="ts">
  import type {
    PictographData,
    ArrowData,
    PropData,
    MotionColor,
  } from "$lib/domain";
  import { GridMode } from "$lib/domain/enums";
  import { BetaOffsetCalculator } from "$lib/services/implementations/positioning/BetaOffsetCalculator";
  import { BetaPropDirectionCalculator } from "$lib/services/implementations/positioning/BetaPropDirectionCalculator";
  import { endsWithBeta } from "$lib/utils/betaDetection";

  import Arrow from "./ArrowSvg.svelte";
  import Grid from "./GridSvg.svelte";
  import PropSVG from "./PropSvg.svelte";
  import TKAGlyph from "./TKAGlyph.svelte";

  interface Props {
    /** Pictograph data to render */
    pictographData: PictographData | null;
    /** Whether we have valid data to render */
    hasValidData: boolean;
    /** Display letter for glyph */
    displayLetter: string | null;
    /** Arrows to render */
    arrowsToRender: Array<{ color: MotionColor; arrowData: ArrowData }>;
    /** Props to render */
    propsToRender: Array<{ color: MotionColor; propData: PropData }>;
    /** SVG dimensions */
    width: number | string;
    height: number | string;
    /** SVG viewBox */
    viewBox: string;
    /** Arrow positioning state */
    arrowPositions: Record<string, { x: number; y: number; rotation: number }>;
    arrowMirroring: Record<string, boolean>;
    showArrows: boolean;
    /** Event handlers */
    onComponentLoaded: (componentName: string) => void;
    onComponentError: (componentName: string, error: string) => void;
    /** Accessibility */
    ariaLabel: string;
  }

  let {
    pictographData,
    hasValidData,
    displayLetter,
    arrowsToRender,
    propsToRender,
    width,
    height,
    viewBox,
    arrowPositions,
    arrowMirroring,
    showArrows,
    onComponentLoaded,
    onComponentError,
    ariaLabel,
  }: Props = $props();

  // Calculate beta offsets once for all props using existing services
  const calculateBetaOffsets = (pictographData: PictographData | null) => {
    if (!pictographData) {
      console.log("🔍 Beta offset calculation - no pictograph data");
      return { blue: { x: 0, y: 0 }, red: { x: 0, y: 0 } };
    }

    console.log(
      "🔍 Beta offset calculation - pictograph letter:",
      pictographData.letter
    );
    console.log(
      "🔍 Beta offset calculation - ends with beta:",
      endsWithBeta(pictographData)
    );

    // Use proper letter-based beta detection
    if (!endsWithBeta(pictographData)) {
      console.log(
        "🔍 Beta offset calculation - letter does not end with beta, no beta positioning needed"
      );
      return { blue: { x: 0, y: 0 }, red: { x: 0, y: 0 } };
    }

    console.log(
      "🔍 Beta offset calculation - letter ends with beta, applying beta positioning"
    );

    // Additional check: both props should end at the same location for beta positioning
    const blueMotion = pictographData.motions?.blue;
    const redMotion = pictographData.motions?.red;

    console.log(
      "🔍 Beta offset calculation - blue end location:",
      blueMotion?.endLocation
    );
    console.log(
      "🔍 Beta offset calculation - red end location:",
      redMotion?.endLocation
    );

    const propsAtSameLocation =
      blueMotion?.endLocation === redMotion?.endLocation;
    console.log(
      "🔍 Beta offset calculation - props at same location:",
      propsAtSameLocation
    );

    if (!propsAtSameLocation) {
      console.log(
        "🔍 Beta offset calculation - props end at different locations, no beta positioning needed"
      );
      return { blue: { x: 0, y: 0 }, red: { x: 0, y: 0 } };
    }

    const allProps = Object.values(pictographData.props || {});
    const allMotions = pictographData.motions || {};

    // Need at least 2 props for beta positioning
    if (allProps.length < 2) {
      return { blue: { x: 0, y: 0 }, red: { x: 0, y: 0 } };
    }

    try {
      // Get motion data
      const redMotion = allMotions.red;
      const blueMotion = allMotions.blue;

      if (!redMotion || !blueMotion) {
        return { blue: { x: -25, y: 0 }, red: { x: 25, y: 0 } };
      }

      // Create separate direction calculators for each color to avoid confusion
      const redDirectionCalculator = new BetaPropDirectionCalculator({
        red: redMotion,
        blue: blueMotion,
      });

      const blueDirectionCalculator = new BetaPropDirectionCalculator({
        red: redMotion,
        blue: blueMotion,
      });

      // Calculate directions based on motion data directly
      // Use the direction calculator's internal logic but with specific motion data
      const redDirection =
        redDirectionCalculator.getDirectionForMotionData(redMotion);
      const blueDirection =
        blueDirectionCalculator.getDirectionForMotionData(blueMotion);

      // Use existing offset calculator
      const offsetCalculator = new BetaOffsetCalculator();
      const offsets = offsetCalculator.calculateBetaSeparationOffsets(
        blueDirection,
        redDirection
      );

      return offsets;
    } catch (error) {
      // Fallback to simple separation
      return { blue: { x: -25, y: 0 }, red: { x: 25, y: 0 } };
    }
  };

  const betaOffsets = calculateBetaOffsets(pictographData);
</script>

<svg
  {width}
  {height}
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  role="img"
  aria-label={ariaLabel}
>
  <!-- Background -->
  <rect width="950" height="950" fill="white" />

  {#if hasValidData}
    <!-- Grid (always rendered first) -->
    <Grid
      gridMode={pictographData?.gridData?.gridMode || GridMode.DIAMOND}
      onLoaded={() => onComponentLoaded("grid")}
      onError={(error) => onComponentError("grid", error)}
    />

    <!-- Props (rendered first so arrows appear on top) -->
    {#each propsToRender as { color, propData } (color)}
      {@const motionData = pictographData?.motions?.[color]}
      {#if motionData}
        {@const propBetaOffset =
          motionData.color === "blue" ? betaOffsets.blue : betaOffsets.red}
        <PropSVG
          {propData}
          {motionData}
          gridMode={pictographData?.gridData?.gridMode || GridMode.DIAMOND}
          betaOffset={propBetaOffset}
        />
      {/if}
    {/each}

    <!-- Arrows (rendered after props) -->
    {#each arrowsToRender as { color, arrowData } (color)}
      {@const motionData = pictographData?.motions?.[color]}
      <Arrow
        {arrowData}
        {...motionData && { motionData }}
        preCalculatedPosition={arrowPositions[color]}
        preCalculatedMirroring={arrowMirroring[color]}
        showArrow={showArrows}
        onLoaded={() => onComponentLoaded(`${color}-arrow`)}
        onError={(error) => onComponentError(`${color}-arrow`, error)}
      />
    {/each}

    <!-- Letter/Glyph overlay -->
    {#if displayLetter}
      <TKAGlyph letter={displayLetter} turnsTuple="(s, 0, 0)" />
    {/if}
  {:else}
    <!-- Empty state -->
    <g class="empty-state">
      <circle
        cx="475"
        cy="475"
        r="100"
        fill="#f3f4f6"
        stroke="#e5e7eb"
        stroke-width="2"
      />
      <text
        x="475"
        y="475"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="16"
        fill="#6b7280"
      >
        Empty
      </text>
    </g>
  {/if}
</svg>

<style>
  svg {
    display: block;
    box-sizing: border-box;
  }
</style>
