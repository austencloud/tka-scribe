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
  import { BetaPositioningService } from "$lib/services/implementations/positioning/BetaPositioningService";

  import Arrow from "./Arrow.svelte";
  import Grid from "./Grid.svelte";
  import Prop from "./Prop.svelte";
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

  // Calculate beta offsets once for all props
  const betaPositioningService = new BetaPositioningService();
  const betaOffsets = pictographData
    ? betaPositioningService.calculateBetaOffsets(pictographData)
    : { blue: { x: 0, y: 0 }, red: { x: 0, y: 0 } };
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
      gridMode={pictographData?.gridData?.gridMode || "diamond"}
      onLoaded={() => onComponentLoaded("grid")}
      onError={(error) => onComponentError("grid", error)}
    />

    <!-- Props (rendered first so arrows appear on top) -->
    {#each propsToRender as { color, propData } (color)}
      {@const motionData = pictographData?.motions?.[color]}
      {@const propBetaOffset =
        color === "blue" ? betaOffsets.blue : betaOffsets.red}
      <Prop
        {propData}
        {...motionData && { motionData }}
        gridMode={pictographData?.gridData?.gridMode || GridMode.DIAMOND}
        betaOffset={propBetaOffset}
        {color}
      />
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
