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
    /** Debug mode */
    debug: boolean;
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
    onSvgClick: () => void;
    onKeyDown: (event: KeyboardEvent) => void;
    onComponentLoaded: (componentName: string) => void;
    onComponentError: (componentName: string, error: string) => void;
    /** Accessibility */
    onClick?: () => void;
    ariaLabel: string;
  }

  let {
    pictographData,
    hasValidData,
    displayLetter,
    arrowsToRender,
    propsToRender,
    debug,
    width,
    height,
    viewBox,
    arrowPositions,
    arrowMirroring,
    showArrows,
    onSvgClick,
    onKeyDown,
    onComponentLoaded,
    onComponentError,
    onClick,
  }: Props = $props();
</script>

<svg
  {width}
  {height}
  {viewBox}
  xmlns="http://www.w3.org/2000/svg"
  onclick={onSvgClick}
  onkeydown={onKeyDown}
  role={onClick ? "button" : "img"}
  {...onClick ? { tabindex: 0 } : {}}
>
  <!-- Background -->
  <rect width="950" height="950" fill="white" />

  {#if hasValidData}
    <!-- Grid (always rendered first) -->
    <Grid
      gridMode={pictographData?.gridData?.gridMode || "diamond"}
      onLoaded={() => onComponentLoaded("grid")}
      onError={(error) => onComponentError("grid", error)}
      {debug}
    />

    <!-- Props (rendered first so arrows appear on top) -->
    {#each propsToRender as { color, propData } (color)}
      {@const motionData = pictographData?.motions?.[color]}
      <Prop
        {propData}
        {...motionData && { motionData }}
        gridMode={pictographData?.gridData?.gridMode || "diamond"}
        allProps={Object.values(pictographData?.props || {})}
        onLoaded={() => onComponentLoaded(`${color}-prop`)}
        onError={(error) => onComponentError(`${color}-prop`, error)}
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
