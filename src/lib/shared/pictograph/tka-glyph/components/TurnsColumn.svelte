<!--
TurnsColumn.svelte - Turn Numbers Display Component

A thin presentation wrapper that displays top and bottom turn numbers
to the right of a TKA letter. All logic is delegated to services/utilities.

Props:
- turnsTuple: The turns tuple string (e.g., "(s, 1, 2)")
- letter: The TKA letter (for color interpretation)
- letterDimensions: Width and height of the letter
- pictographData: Full pictograph data (for color interpretation)
-->
<script lang="ts">
  import type { PictographData } from "$shared";
  import type { Dimensions } from "../utils/turn-position-calculator";
  import {
    parseTurnsTuple,
    shouldDisplayTurn,
    getTurnNumberImagePath,
    getTurnNumberWidth,
  } from "../utils/turn-tuple-parser";
  import { calculateTurnPositions } from "../utils/turn-position-calculator";
  import { TurnColorInterpreter } from "../services/implementations/TurnColorInterpreter";

  let {
    turnsTuple = "(s, 0, 0)",
    letter = null,
    letterDimensions,
    pictographData = undefined,
    visible = true,
  } = $props<{
    turnsTuple: string,
    letter: string | null | undefined,
    letterDimensions: Dimensions,
    pictographData?: PictographData | null,
    visible?: boolean
  }>();

  // Service instance for color interpretation
  const colorInterpreter = new TurnColorInterpreter();

  // Parse the turns tuple
  const parsedTurns = $derived(() => parseTurnsTuple(turnsTuple));

  // Determine colors based on letter type and motion data
  const turnColors = $derived(() =>
    colorInterpreter.interpretTurnColors(letter, pictographData)
  );

  // Number height is constant across all turn numbers
  const numberHeight = 45;

  // Calculate the maximum width needed for the turn column
  // This ensures consistent alignment when top and bottom numbers have different widths
  const columnWidth = $derived(() => {
    const topWidth = getTurnNumberWidth(parsedTurns().top);
    const bottomWidth = getTurnNumberWidth(parsedTurns().bottom);
    return Math.max(topWidth, bottomWidth);
  });

  // Calculate positions for the numbers (with proper bottom number height)
  const positions = $derived(() =>
    calculateTurnPositions(letterDimensions, numberHeight)
  );

  // Check visibility
  const showTop = $derived(() => shouldDisplayTurn(parsedTurns().top));
  const showBottom = $derived(() => shouldDisplayTurn(parsedTurns().bottom));

  // Get image paths
  const topImagePath = $derived(() =>
    getTurnNumberImagePath(parsedTurns().top)
  );
  const bottomImagePath = $derived(() =>
    getTurnNumberImagePath(parsedTurns().bottom)
  );
</script>

<!-- Turns Column Group -->
<g class="turns-column" class:visible data-letter={letter}>
  <!-- SVG Recoloring Filter Definitions -->
  <defs>
    <!-- Blue color filter - matches arrow color #2E3192 -->
    <filter id="turn-color-blue" color-interpolation-filters="sRGB">
      <!-- Extract alpha channel -->
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
        result="alpha-only"
      />
      <!-- Fill with target blue color #2E3192 -->
      <feFlood flood-color="#2E3192" result="blue-flood" />
      <!-- Composite the color with the alpha mask -->
      <feComposite in="blue-flood" in2="alpha-only" operator="in" />
    </filter>
    <!-- Red color filter - matches arrow color #ED1C24 -->
    <filter id="turn-color-red" color-interpolation-filters="sRGB">
      <!-- Extract alpha channel -->
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0"
        result="alpha-only"
      />
      <!-- Fill with target red color #ED1C24 -->
      <feFlood flood-color="#ED1C24" result="red-flood" />
      <!-- Composite the color with the alpha mask -->
      <feComposite in="red-flood" in2="alpha-only" operator="in" />
    </filter>
  </defs>

  <!-- Top Number -->
  {#if showTop()}
    <g
      class="turn-number top"
      transform="translate({positions().top.x}, {positions().top.y})"
    >
      <image
        href={topImagePath()}
        width={columnWidth()}
        height={numberHeight}
        filter="url(#{turnColors().top === '#ED1C24'
          ? 'turn-color-red'
          : 'turn-color-blue'})"
        preserveAspectRatio="xMidYMin meet"
      />
    </g>
  {/if}

  <!-- Bottom Number -->
  {#if showBottom()}
    <g
      class="turn-number bottom"
      transform="translate({positions().bottom.x}, {positions().bottom.y})"
    >
      <image
        href={bottomImagePath()}
        width={columnWidth()}
        height={numberHeight}
        filter="url(#{turnColors().bottom === '#ED1C24'
          ? 'turn-color-red'
          : 'turn-color-blue'})"
        preserveAspectRatio="xMidYMin meet"
      />
    </g>
  {/if}
</g>

<style>
  .turns-column {
    /* Turns column renders at same layer as letter */
    pointer-events: none;
    /* Beautiful fade in/out effect matching TKA glyph */
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .turns-column.visible {
    opacity: 1;
  }

  .turn-number image {
    /* Smooth rendering for number SVGs */
    image-rendering: optimizeQuality;
  }
</style>
