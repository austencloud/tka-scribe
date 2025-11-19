<!--
TKAGlyph.svelte - Modern Rune-Based TKA Glyph Component

Renders letters, turn indicators, and other TKA notation elements.
Uses pure runes instead of stores for reactivity.
-->
<script lang="ts">
  import { Letter, type PictographData } from "$shared";
  import { getLetterImagePath } from "../utils";
  import TurnsColumn from "./TurnsColumn.svelte";

  let {
    letter,
    x = 50, // Match legacy positioning exactly
    y = 800, // Match legacy positioning exactly
    turnsTuple = "(s, 0, 0)",
    pictographData = undefined,
    scale = 1, // Match legacy default scale
    visible = true,
    onToggle = undefined,
  } = $props<{
    /** The letter to display */
    letter: string | null | undefined;
    /** Position X coordinate */
    x?: number;
    /** Position Y coordinate */
    y?: number;
    /** Turns tuple in format "(s, 0, 0)" */
    turnsTuple?: string;
    /** Full pictograph data for turn color interpretation */
    pictographData?: PictographData | null;
    /** Scale factor - match legacy behavior */
    scale?: number;
    /** Visibility control for fade effect */
    visible?: boolean;
    /** Callback when glyph is clicked to toggle visibility */
    onToggle?: () => void;
  }>();

  // Letter dimensions state - match legacy behavior
  let letterDimensions = $state({ width: 0, height: 0 });

  // Cache for SVG dimensions (simple in-memory cache)
  const dimensionsCache = new Map<string, { width: number; height: number }>();

  // Load letter dimensions using SVG viewBox like legacy version
  async function loadLetterDimensions(currentLetter: Letter) {
    if (!currentLetter) return;

    // Check cache first
    const cacheKey = currentLetter;
    if (dimensionsCache.has(cacheKey)) {
      letterDimensions = dimensionsCache.get(cacheKey)!;
      return;
    }

    try {
      // Use correct path based on letter type and safe filename
      const svgPath = getLetterImagePath(currentLetter as Letter);
      const response = await fetch(svgPath);
      if (!response.ok)
        throw new Error(`Failed to fetch ${svgPath}: ${response.status}`);

      const svgText = await response.text();
      const viewBoxMatch = svgText.match(
        /viewBox\s*=\s*"[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)"/i
      );

      if (!viewBoxMatch) {
        console.warn(`SVG at ${svgPath} has no valid viewBox, using defaults`);
        letterDimensions = { width: 100, height: 100 };
      } else {
        letterDimensions = {
          width: parseFloat(viewBoxMatch[1] || "100"),
          height: parseFloat(viewBoxMatch[2] || "100"),
        };
      }

      dimensionsCache.set(cacheKey, letterDimensions);
    } catch (error) {
      console.error(
        `Failed to load letter dimensions for ${currentLetter}:`,
        error
      );
      // Fallback dimensions
      letterDimensions = { width: 50, height: 50 };
    }
  }

  // Load dimensions when letter changes
  $effect(() => {
    if (letter) {
      loadLetterDimensions(letter as Letter);
    }
  });

  // Derived state - check if we have a valid letter
  const hasLetter = $derived.by(() => {
    return letter != null && letter.trim() !== "";
  });

  // Check if letter dimensions are loaded (for TurnsColumn)
  const dimensionsLoaded = $derived.by(
    () => letterDimensions.width > 0 && letterDimensions.height > 0
  );
</script>

<!-- TKA Glyph Group -->
{#if hasLetter}
  <g
    class="tka-glyph"
    class:visible
    class:interactive={onToggle !== undefined}
    data-letter={letter}
    data-turns={turnsTuple}
    transform="translate({x}, {y}) scale({scale})"
    onclick={onToggle}
    role={onToggle ? "button" : undefined}
    tabindex={onToggle ? 0 : undefined}
    aria-label={onToggle ? "Toggle TKA letter visibility" : undefined}
  >
    <!-- Main letter with exact legacy dimensions -->
    <image
      x="0"
      y="0"
      href={letter ? getLetterImagePath(letter as Letter) : ""}
      width={letterDimensions.width}
      height={letterDimensions.height}
      preserveAspectRatio="xMinYMin meet"
      class="letter-image"
    />

    <!-- Turns Column - displays turn numbers to the right of the letter -->
    {#if dimensionsLoaded}
      <TurnsColumn {turnsTuple} {letter} {letterDimensions} {pictographData} />
    {/if}
  </g>
{/if}

<style>
  .tka-glyph {
    /* Glyphs are rendered on top layer above arrows */
    z-index: 4;
    /* Beautiful fade in/out effect */
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .tka-glyph.visible {
    opacity: 1;
  }

  .tka-glyph.interactive {
    cursor: pointer;
  }

  .tka-glyph.interactive:hover {
    opacity: 0.7;
  }

  .letter-image {
    /* Smooth image rendering */
    image-rendering: optimizeQuality;
  }
</style>
