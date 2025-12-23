<!--
  PictographElementIndicator.svelte - Pictograph with element highlighting

  Used in the help modal to visually indicate which element is being explained.
  Highlights one element while dimming others for educational focus.

  Supported elements:
  - tka: TKA Glyph (the letter in the center)
  - vtg: VTG Glyph (motion type indicator)
  - elemental: Elemental Glyph
  - positions: Positions Glyph
  - reversals: Reversal Indicators
  - turnNumbers: Turn Numbers
  - arrows: Motion Arrows
  - props: Props (hands/objects)
  - grid: Background Grid
  - nonRadial: Non-radial point markers
-->
<script lang="ts">
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import {
    GridLocation,
    GridMode,
    GridPosition,
  } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import PictographWithVisibility from "$lib/shared/pictograph/shared/components/PictographWithVisibility.svelte";
  import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import {
    MotionType,
    RotationDirection,
    Orientation,
    MotionColor,
  } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  type IndicatedElement =
    | "tka"
    | "vtg"
    | "elemental"
    | "positions"
    | "reversals"
    | "turnNumbers"
    | "arrows"
    | "props"
    | "grid"
    | "nonRadial"
    | null;

  interface Props {
    /** Which element to highlight (null = show all equally) */
    indicatedElement?: IndicatedElement;
    /** Show pulsing animation on indicated element */
    animate?: boolean;
  }

  let { indicatedElement = null, animate = true }: Props = $props();

  // Example pictograph data that shows all elements
  const pictographData = {
    id: "help-indicator-preview",
    letter: Letter.A,
    startPosition: GridPosition.ALPHA1,
    endPosition: GridPosition.ALPHA3,
    gridMode: GridMode.DIAMOND,
    blueReversal: true,
    redReversal: true,
    motions: {
      blue: createMotionData({
        motionType: MotionType.PRO,
        rotationDirection: RotationDirection.CLOCKWISE,
        startLocation: GridLocation.SOUTH,
        endLocation: GridLocation.WEST,
        turns: 1,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.OUT,
        color: MotionColor.BLUE,
        isVisible: true,
        arrowLocation: GridLocation.WEST,
        gridMode: GridMode.DIAMOND,
      }),
      red: createMotionData({
        motionType: MotionType.PRO,
        rotationDirection: RotationDirection.CLOCKWISE,
        startLocation: GridLocation.NORTH,
        endLocation: GridLocation.EAST,
        turns: 1,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.OUT,
        color: MotionColor.RED,
        isVisible: true,
        arrowLocation: GridLocation.EAST,
        gridMode: GridMode.DIAMOND,
      }),
    },
  };

  // CSS class based on which element is indicated
  const indicatorClass = $derived(
    indicatedElement ? `indicate-${indicatedElement}` : ""
  );
</script>

<div
  class="element-indicator"
  class:animating={animate && indicatedElement}
  class:indicate-tka={indicatedElement === "tka"}
  class:indicate-vtg={indicatedElement === "vtg"}
  class:indicate-elemental={indicatedElement === "elemental"}
  class:indicate-positions={indicatedElement === "positions"}
  class:indicate-reversals={indicatedElement === "reversals"}
  class:indicate-turnNumbers={indicatedElement === "turnNumbers"}
  class:indicate-arrows={indicatedElement === "arrows"}
  class:indicate-props={indicatedElement === "props"}
  class:indicate-grid={indicatedElement === "grid"}
  class:indicate-nonRadial={indicatedElement === "nonRadial"}
>
  <div class="pictograph-wrapper">
    <PictographWithVisibility
      {pictographData}
      forceShowAll={true}
      previewMode={false}
    />
  </div>
</div>

<style>
  .element-indicator {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border-radius: 16px;
    overflow: hidden;
    /* Dark glass background */
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .pictograph-wrapper {
    width: 100%;
    height: 100%;
    transition: filter 300ms ease;
  }

  /* Scale pictograph to fill container */
  .pictograph-wrapper :global(.pictograph-with-visibility),
  .pictograph-wrapper :global(.pictograph),
  .pictograph-wrapper :global(svg.pictograph) {
    width: 100% !important;
    height: 100% !important;
  }

  /* ========================================
     ELEMENT INDICATION STYLES

     These use CSS to highlight specific SVG elements
     by targeting their class names within the pictograph
     ======================================== */

  /* When indicating, dim everything first */
  .element-indicator[class*="indicate-"] .pictograph-wrapper :global(svg) {
    --dim-opacity: 0.25;
  }

  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.tka-glyph),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.vtg-glyph),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.elemental-glyph),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.position-glyph),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.reversal-indicators),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.turns-column),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.arrow-svg),
  .element-indicator[class*="indicate-"] .pictograph-wrapper :global(.prop-svg),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global(.grid-container),
  .element-indicator[class*="indicate-"]
    .pictograph-wrapper
    :global([id*="layer2_point"]) {
    opacity: var(--dim-opacity, 0.25);
    transition:
      opacity 300ms ease,
      filter 300ms ease;
  }

  /* Highlight TKA Glyph */
  .indicate-tka .pictograph-wrapper :global(.tka-glyph) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(129, 140, 248, 0.8));
  }

  /* Highlight VTG Glyph */
  .indicate-vtg .pictograph-wrapper :global(.vtg-glyph) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(129, 140, 248, 0.8));
  }

  /* Highlight Elemental Glyph */
  .indicate-elemental .pictograph-wrapper :global(.elemental-glyph) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.8));
  }

  /* Highlight Positions Glyph */
  .indicate-positions .pictograph-wrapper :global(.position-glyph) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.8));
  }

  /* Highlight Reversal Indicators */
  .indicate-reversals .pictograph-wrapper :global(.reversal-indicators) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(244, 114, 182, 0.8));
  }

  /* Highlight Turn Numbers (part of TKA glyph) */
  .indicate-turnNumbers .pictograph-wrapper :global(.turns-column) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.8));
  }

  /* Highlight Arrows */
  .indicate-arrows .pictograph-wrapper :global(.arrow-svg) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.6));
  }

  /* Highlight Props */
  .indicate-props .pictograph-wrapper :global(.prop-svg) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 12px rgba(167, 139, 250, 0.8));
  }

  /* Highlight Grid */
  .indicate-grid .pictograph-wrapper :global(.grid-container) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.4));
  }

  /* Highlight Non-radial Points (layer2 points in grid) */
  .indicate-nonRadial .pictograph-wrapper :global([id*="layer2_point"]) {
    opacity: 1 !important;
    filter: drop-shadow(0 0 10px rgba(249, 115, 22, 0.8));
  }

  /* ========================================
     PULSING ANIMATION
     ======================================== */
  .animating .pictograph-wrapper :global([style*="opacity: 1"]),
  .animating.indicate-tka .pictograph-wrapper :global(.tka-glyph),
  .animating.indicate-vtg .pictograph-wrapper :global(.vtg-glyph),
  .animating.indicate-elemental .pictograph-wrapper :global(.elemental-glyph),
  .animating.indicate-positions .pictograph-wrapper :global(.position-glyph),
  .animating.indicate-reversals
    .pictograph-wrapper
    :global(.reversal-indicators),
  .animating.indicate-turnNumbers .pictograph-wrapper :global(.turns-column),
  .animating.indicate-arrows .pictograph-wrapper :global(.arrow-svg),
  .animating.indicate-props .pictograph-wrapper :global(.prop-svg),
  .animating.indicate-grid .pictograph-wrapper :global(.grid-container),
  .animating.indicate-nonRadial
    .pictograph-wrapper
    :global([id*="layer2_point"]) {
    animation: pulse-glow 2s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%,
    100% {
      filter: drop-shadow(0 0 8px currentColor);
    }
    50% {
      filter: drop-shadow(0 0 20px currentColor);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .animating .pictograph-wrapper :global(*) {
      animation: none !important;
    }

    .pictograph-wrapper :global(*) {
      transition: none !important;
    }
  }
</style>
