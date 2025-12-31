<!--
PictographRenderer.svelte - Dumb pictograph renderer

SINGLE SOURCE OF TRUTH for pictograph SVG rendering.
This is a PRIMITIVE - it renders prepared data as an SVG.
No visibility subscriptions, no effects, no async work.

Props:
- pictograph: Pre-calculated pictograph data with positions
- blueReversal/redReversal: Reversal indicator states
- ledMode: Dark mode state (controls background, grid, and glyph inversion)
- All visibility controls (explicit, not from global state)

Usage:
- For batch rendering (option picker): Pass pre-prepared data
- For single pictographs: Use PictographContainer which prepares + renders
-->

<script lang="ts">
  import type { PreparedPictographData } from "../domain/models/PreparedPictographData";
  import GridSvg from "../../grid/components/GridSvg.svelte";
  import PropSvg from "../../prop/components/PropSvg.svelte";
  import ArrowSvg from "../../arrow/rendering/components/ArrowSvg.svelte";
  import TKAGlyph from "../../tka-glyph/components/TKAGlyph.svelte";
  import TurnsColumn from "../../tka-glyph/components/TurnsColumn.svelte";
  import ReversalIndicators from "./ReversalIndicators.svelte";
  import VTGGlyph from "./VTGGlyph.svelte";
  import ElementalGlyph from "./ElementalGlyph.svelte";
  import PositionGlyph from "./PositionGlyph.svelte";
  import BeatNumber from "./BeatNumber.svelte";
  import { resolve, tryResolve, TYPES } from "../../../inversify/di";
  import type { IGridModeDeriver } from "../../grid/services/contracts/IGridModeDeriver";
  import type { ITurnsTupleGenerator } from "../../arrow/positioning/placement/services/contracts/ITurnsTupleGenerator";
  import { GridMode } from "../../grid/domain/enums/grid-enums";
  import { calculateVTGFromPictograph } from "../domain/utils/vtg-calculator";

  // Props - all explicit, no global state dependencies
  let {
    pictograph,
    blueReversal = false,
    redReversal = false,
    ledMode = false,
    // Core visibility controls
    showTKA = true,
    showReversals = true,
    showNonRadialPoints = false,
    // Extended glyph visibility controls
    showVTG = false,
    showElemental = false,
    showPositions = false,
    // Beat number display
    beatNumber = null,
    showBeatNumber = false,
    previewMode = false,
    // Grid mode override (if provided, takes precedence over calculated mode)
    gridModeOverride = null,
    // Show only one hand's prop/arrow (null = show both)
    visibleHand = null,
    // Enable arrow selection for adjustment (admin feature)
    arrowsClickable = false,
    // Toggle callbacks (for interactive visibility controls)
    onToggleTKA = undefined,
    onToggleVTG = undefined,
    onToggleElemental = undefined,
    onTogglePositions = undefined,
    onToggleReversals = undefined,
    onToggleNonRadial = undefined,
  } = $props<{
    pictograph: PreparedPictographData;
    blueReversal?: boolean;
    redReversal?: boolean;
    ledMode?: boolean;
    showTKA?: boolean;
    showReversals?: boolean;
    showNonRadialPoints?: boolean;
    showVTG?: boolean;
    showElemental?: boolean;
    showPositions?: boolean;
    beatNumber?: number | null;
    showBeatNumber?: boolean;
    previewMode?: boolean;
    gridModeOverride?: GridMode | null;
    visibleHand?: "blue" | "red" | null;
    arrowsClickable?: boolean;
    onToggleTKA?: () => void;
    onToggleVTG?: () => void;
    onToggleElemental?: () => void;
    onTogglePositions?: () => void;
    onToggleReversals?: () => void;
    onToggleNonRadial?: () => void;
  }>();

  // Derived beat context
  const isStartPosition = $derived(beatNumber === 0);
  const shouldShowBeatNumber = $derived(showBeatNumber && beatNumber !== null && !isStartPosition);

  // Derive grid mode from override, pre-calculated, or motions
  const gridMode = $derived(
    (() => {
      // Use override if provided
      if (gridModeOverride !== null) {
        return gridModeOverride;
      }
      if (pictograph._prepared?.gridMode) {
        return pictograph._prepared.gridMode;
      }
      if (!pictograph.motions?.blue || !pictograph.motions?.red) {
        return GridMode.DIAMOND;
      }
      try {
        const service = resolve<IGridModeDeriver>(TYPES.IGridModeDeriver);
        return service.deriveGridMode(
          pictograph.motions.blue,
          pictograph.motions.red
        );
      } catch {
        return GridMode.DIAMOND;
      }
    })()
  );

  // Pre-calculated positions (from _prepared data)
  const arrowPositions = $derived(pictograph._prepared?.arrowPositions || {});
  const arrowAssets = $derived(pictograph._prepared?.arrowAssets || {});
  const arrowMirroring = $derived(pictograph._prepared?.arrowMirroring || {});
  const propPositions = $derived(pictograph._prepared?.propPositions || {});
  const propAssets = $derived(pictograph._prepared?.propAssets || {});

  // Motions to render (filtered by visibleHand if specified)
  const motions = $derived.by(() => {
    if (!pictograph.motions) return [];
    return Object.entries(pictograph.motions)
      .filter((entry): entry is [string, any] => entry[1] !== undefined)
      .filter(([color]) => visibleHand === null || color === visibleHand)
      .map(([color, data]) => ({ color: color as "blue" | "red", data }));
  });

  // VTG and Elemental calculation
  const vtgInfo = $derived.by(() => {
    if (!pictograph) {
      return { vtgMode: null, elementalType: null };
    }
    return calculateVTGFromPictograph(pictograph, gridMode);
  });

  // Turns tuple generation (lazy resolve to avoid init race)
  const turnsTuple = $derived.by(() => {
    if (!pictograph?.motions?.blue || !pictograph?.motions?.red) {
      return "(s, 0, 0)";
    }
    try {
      const generator = tryResolve<ITurnsTupleGenerator>(TYPES.ITurnsTupleGenerator);
      if (!generator) return "(s, 0, 0)";
      return generator.generateTurnsTuple(pictograph);
    } catch {
      return "(s, 0, 0)";
    }
  });

  // Check if we have valid data for glyphs
  const hasValidData = $derived(!!pictograph?.motions?.blue || !!pictograph?.motions?.red);
</script>

<div class="pictograph-renderer" class:led-mode={ledMode}>
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 950 950"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Pictograph"
  >
    <!-- Background -->
    <rect width="950" height="950" fill={ledMode ? "#0a0a0f" : "white"} />

    <!-- Grid -->
    <GridSvg
      {gridMode}
      {showNonRadialPoints}
      {ledMode}
      {previewMode}
      onLoaded={() => {}}
      onError={() => {}}
      onToggleNonRadial={onToggleNonRadial}
    />

    <!-- Props -->
    {#each motions as { color, data } (color)}
      {#if propAssets[color] && propPositions[color]}
        <PropSvg
          motionData={data}
          propAssets={propAssets[color]}
          propPosition={propPositions[color]}
          showProp={true}
        />
      {/if}
    {/each}

    <!-- Arrows -->
    {#each motions as { color, data } (color)}
      {#if arrowAssets[color] && arrowPositions[color]}
        <ArrowSvg
          motionData={data}
          {color}
          pictographData={pictograph}
          arrowAssets={arrowAssets[color]}
          arrowPosition={arrowPositions[color]}
          shouldMirror={arrowMirroring[color] || false}
          showArrow={true}
          isClickable={arrowsClickable}
          {ledMode}
        />
      {/if}
    {/each}

    <!-- TKA Glyph -->
    {#if pictograph.letter}
      <TKAGlyph
        letter={pictograph.letter}
        pictographData={pictograph}
        visible={showTKA}
        {previewMode}
        onToggle={onToggleTKA}
        {ledMode}
      />
    {/if}

    <!-- Turns Column (part of TKA) -->
    <TurnsColumn
      {turnsTuple}
      letter={pictograph.letter}
      pictographData={pictograph}
      visible={showTKA}
      {previewMode}
      standalone={false}
      onToggle={onToggleTKA}
      {ledMode}
    />

    <!-- Beat number overlay -->
    <BeatNumber
      {beatNumber}
      showBeatNumber={shouldShowBeatNumber}
      {isStartPosition}
      {hasValidData}
      {ledMode}
    />

    <!-- Reversal indicators -->
    <ReversalIndicators
      {blueReversal}
      {redReversal}
      {hasValidData}
      visible={showReversals}
      {previewMode}
      onToggle={onToggleReversals}
      {ledMode}
    />

    <!-- Elemental glyph -->
    <ElementalGlyph
      elementalType={vtgInfo.elementalType}
      letter={pictograph.letter}
      {hasValidData}
      visible={showElemental}
      {previewMode}
      onToggle={onToggleElemental}
    />

    <!-- VTG glyph -->
    <VTGGlyph
      vtgMode={vtgInfo.vtgMode}
      letter={pictograph.letter}
      {hasValidData}
      visible={showVTG}
      {previewMode}
      onToggle={onToggleVTG}
    />

    <!-- Position glyph -->
    <PositionGlyph
      startPosition={pictograph.startPosition}
      endPosition={pictograph.endPosition}
      letter={pictograph.letter}
      {hasValidData}
      visible={showPositions}
      {previewMode}
      onToggle={onTogglePositions}
      {ledMode}
    />
  </svg>
</div>

<style>
  .pictograph-renderer {
    width: 100%;
    height: 100%;
    display: block;
    box-sizing: border-box;
  }

  /* Subtle white outline in dark mode to distinguish boundaries */
  .pictograph-renderer.led-mode {
    border: 1px solid rgba(255, 255, 255, 0.12);
  }

  svg {
    display: block;
  }
</style>
