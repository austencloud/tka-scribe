<!--
TKAGlyph.svelte - Modern Rune-Based TKA Glyph Component

Renders letters, turn indicators, and other TKA notation elements.
Uses pure runes instead of stores for reactivity.
-->
<script lang="ts" module>
  // Module-level cache shared across ALL TKAGlyph instances
  // This prevents redundant fetches when multiple glyphs render the same letter
  const globalDimensionsCache = new Map<string, { width: number; height: number }>();
  const globalLoadingPromises = new Map<string, Promise<{ width: number; height: number }>>();
</script>

<script lang="ts">
import type { PictographData } from "../../shared/domain/models/PictographData";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import { getLetterImagePath } from "../utils";
  import TurnsColumn from "./TurnsColumn.svelte";
  import { getVisibilityStateManager } from "$lib/shared/pictograph/shared/state/visibility-state.svelte";
  import { onMount } from "svelte";

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

  // Load letter dimensions using SVG viewBox like legacy version
  // Uses global cache to prevent duplicate fetches across all TKAGlyph instances
  async function loadLetterDimensions(currentLetter: Letter) {
    if (!currentLetter) return;

    const cacheKey = currentLetter;

    // Check global cache first (fastest path)
    if (globalDimensionsCache.has(cacheKey)) {
      letterDimensions = globalDimensionsCache.get(cacheKey)!;
      return;
    }

    // Check if already loading (prevents duplicate concurrent fetches)
    if (globalLoadingPromises.has(cacheKey)) {
      letterDimensions = await globalLoadingPromises.get(cacheKey)!;
      return;
    }

    // Create loading promise for deduplication
    const loadPromise = (async () => {
      try {
        const svgPath = getLetterImagePath(currentLetter as Letter);
        const response = await fetch(svgPath);
        if (!response.ok)
          throw new Error(`Failed to fetch ${svgPath}: ${response.status}`);

        const svgText = await response.text();
        const viewBoxMatch = svgText.match(
          /viewBox\s*=\s*"[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)"/i
        );

        let dims: { width: number; height: number };
        if (!viewBoxMatch) {
          dims = { width: 100, height: 100 };
        } else {
          dims = {
            width: parseFloat(viewBoxMatch[1] || "100"),
            height: parseFloat(viewBoxMatch[2] || "100"),
          };
        }

        globalDimensionsCache.set(cacheKey, dims);
        return dims;
      } catch (error) {
        console.error(
          `Failed to load letter dimensions for ${currentLetter}:`,
          error
        );
        return { width: 50, height: 50 };
      } finally {
        globalLoadingPromises.delete(cacheKey);
      }
    })();

    globalLoadingPromises.set(cacheKey, loadPromise);
    letterDimensions = await loadPromise;
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

  // Get visibility state manager to check turn numbers visibility
  const visibilityManager = getVisibilityStateManager();

  // Check if turn numbers should be visible
  let turnNumbersVisible = $state(
    visibilityManager.getGlyphVisibility("TurnNumbers")
  );

  // Register observer to update turn numbers visibility when it changes
  onMount(() => {
    const observer = () => {
      turnNumbersVisible = visibilityManager.getGlyphVisibility("TurnNumbers");
    };

    visibilityManager.registerObserver(observer, ["glyph"]);

    return () => {
      visibilityManager.unregisterObserver(observer);
    };
  });
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
    {...onToggle
      ? {
          role: "button",
          tabindex: 0,
          "aria-label": "Toggle TKA letter visibility",
        }
      : {}}
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
      <TurnsColumn
        {turnsTuple}
        {letter}
        {letterDimensions}
        {pictographData}
        visible={turnNumbersVisible}
      />
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
