<script lang="ts">
  import ElementalGlyph from "./ElementalGlyph.svelte";
  import PositionGlyph from "./PositionGlyph.svelte";
  import VTGGlyph from "./VTGGlyph.svelte";
  import { calculateVTGFromPictograph } from "../domain/utils/vtg-calculator";
  import { onMount, onDestroy } from "svelte";
  import { resolve, tryResolve, TYPES } from "../../../inversify/di";
  import { getVisibilityStateManager } from "../state/visibility-state.svelte";
  import { getAnimationVisibilityManager } from "../../../animation-engine/state/animation-visibility-state.svelte";
  import { getSettings } from "../../../application/state/app-state.svelte";
  import ArrowSvg from "../../arrow/rendering/components/ArrowSvg.svelte";
  import GridSvg from "../../grid/components/GridSvg.svelte";
  import type { IGridModeDeriver } from "../../grid/services/contracts/IGridModeDeriver";
  import PropSvg from "../../prop/components/PropSvg.svelte";
  import TKAGlyph from "../../tka-glyph/components/TKAGlyph.svelte";
  import TurnsColumn from "../../tka-glyph/components/TurnsColumn.svelte";
  import { createPictographState } from "../state/pictograph-state.svelte";
  import BeatNumber from "./BeatNumber.svelte";
  import ReversalIndicators from "./ReversalIndicators.svelte";
  import EmptyStateIndicator from "./EmptyStateIndicator.svelte";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { IAnimator } from "../../../application/services/contracts/IAnimator";
  import type { ITurnsTupleGenerator } from "../../arrow/positioning/placement/services/contracts/ITurnsTupleGenerator";
  import { GridMode } from "../../grid/domain/enums/grid-enums";
  import type { PictographData } from "../domain/models/PictographData";

  // Simplified Props interface - accepts either BeatData (with beat context) or PictographData (without)
  let {
    pictographData = null,
    disableContentTransitions = false,
    arrowsClickable = false,
    visibleHand = null,
    gridMode: overrideGridMode = null,
    shouldOrbitAroundCenter = false,
    previewMode = false,
    showTKA = undefined,
    showVTG = undefined,
    showElemental = undefined,
    showPositions = undefined,
    showReversals = undefined,
    showNonRadialPoints = undefined,
    showTurnNumbers = undefined,
    onToggleTKA = undefined,
    onToggleVTG = undefined,
    onToggleElemental = undefined,
    onTogglePositions = undefined,
    onToggleReversals = undefined,
    onToggleNonRadial = undefined,
    onToggleTurnNumbers = undefined,
    ledMode = undefined,
  } = $props<{
    pictographData?: (BeatData | PictographData) | null;
    disableContentTransitions?: boolean;
    arrowsClickable?: boolean; // Enable arrow selection for adjustment
    visibleHand?: "blue" | "red" | null; // Show only one hand's prop/arrow (for Guided Construct mode)
    gridMode?: GridMode | null; // Override grid mode (useful for single-motion start positions)
    shouldOrbitAroundCenter?: boolean; // Enable arc-based rotation for sequence transform animations
    previewMode?: boolean; // Preview mode: show "off" elements at 50% opacity instead of hidden
    // Visibility controls (if undefined, will use global visibility settings)
    showTKA?: boolean;
    showVTG?: boolean;
    showElemental?: boolean;
    showPositions?: boolean;
    showReversals?: boolean;
    showNonRadialPoints?: boolean;
    showTurnNumbers?: boolean;
    // Toggle callbacks for interactive visibility
    onToggleTKA?: () => void;
    onToggleVTG?: () => void;
    onToggleElemental?: () => void;
    onTogglePositions?: () => void;
    onToggleReversals?: () => void;
    onToggleNonRadial?: () => void;
    onToggleTurnNumbers?: () => void;
    /** LED mode - dark background with glow effects. If undefined, uses global animation visibility state */
    ledMode?: boolean;
  }>();

  // Extract beat context from pictographData (if it's BeatData)
  const beatNumber = $derived((pictographData as any)?.beatNumber ?? null);
  const isStartPosition = $derived(beatNumber === 0);
  const isSelected = $derived((pictographData as any)?.isSelected ?? false);
  const blueReversal = $derived((pictographData as any)?.blueReversal ?? false);
  const redReversal = $derived((pictographData as any)?.redReversal ?? false);
  const showBeatNumber = $derived(beatNumber !== null && !isStartPosition); // Show beat number when in beat context and not start position

  // =============================================================================
  // GLOBAL VISIBILITY SETTINGS
  // =============================================================================

  // Subscribe to global visibility state manager
  const visibilityManager = getVisibilityStateManager();
  const animationVisibilityManager = getAnimationVisibilityManager();
  let visibilityUpdateCount = $state(0);

  // Force re-render when visibility changes
  function handleVisibilityChange() {
    visibilityUpdateCount++;
  }

  onMount(() => {
    // Subscribe to pictograph visibility changes
    visibilityManager.registerObserver(handleVisibilityChange);
    // Subscribe to animation visibility changes (for LED mode)
    animationVisibilityManager.registerObserver(handleVisibilityChange);
    return () => {
      visibilityManager.unregisterObserver(handleVisibilityChange);
      animationVisibilityManager.unregisterObserver(handleVisibilityChange);
    };
  });

  // Use global visibility settings when props are undefined
  // This allows pictographs to automatically respect user preferences
  const effectiveShowTKA = $derived.by(() => {
    visibilityUpdateCount; // Force reactivity
    return showTKA !== undefined
      ? showTKA
      : visibilityManager.getGlyphVisibility("tkaGlyph");
  });

  const effectiveShowVTG = $derived.by(() => {
    visibilityUpdateCount;
    const result = showVTG !== undefined
      ? showVTG
      : visibilityManager.getGlyphVisibility("vtgGlyph");



    return result;
  });

  const effectiveShowElemental = $derived.by(() => {
    visibilityUpdateCount;
    return showElemental !== undefined
      ? showElemental
      : visibilityManager.getGlyphVisibility("elementalGlyph");
  });

  const effectiveShowPositions = $derived.by(() => {
    visibilityUpdateCount;
    return showPositions !== undefined
      ? showPositions
      : visibilityManager.getGlyphVisibility("positionsGlyph");
  });

  const effectiveShowReversals = $derived.by(() => {
    visibilityUpdateCount;
    return showReversals !== undefined
      ? showReversals
      : visibilityManager.getGlyphVisibility("reversalIndicators");
  });

  const effectiveShowNonRadialPoints = $derived.by(() => {
    visibilityUpdateCount;
    return showNonRadialPoints !== undefined
      ? showNonRadialPoints
      : visibilityManager.getNonRadialVisibility();
  });

  const effectiveShowTurnNumbers = $derived.by(() => {
    visibilityUpdateCount;
    if (showTurnNumbers !== undefined) return showTurnNumbers;
    // Turn numbers are now independent of TKA - they use their own visibility setting.
    // When TKA is off but turn numbers are on, they render in standalone mode (shifted left).
    // This applies to both preview mode and normal pictograph rendering.
    return visibilityManager.getRawGlyphVisibility("turnNumbers");
  });

  // LED mode - reads from global animation visibility state when not explicitly set
  // Now renamed to "Lights Off" mode - controls dark background, inverted grid, white text
  const effectiveLedMode = $derived.by(() => {
    visibilityUpdateCount; // Force reactivity when animation visibility changes
    if (ledMode !== undefined) return ledMode;
    // Read directly from animation visibility manager
    return animationVisibilityManager.isLightsOff();
  });

  // Static pictographs never have prop glow - glow is only for animations
  // (Removed effectivePropGlow - animation handles its own glow)

  // Background color based on LED/Lights Off mode
  const backgroundColor = $derived(effectiveLedMode ? "#0a0a0f" : "white");

  // =============================================================================
  // STATE MANAGEMENT (using pictograph-state.svelte.ts)
  // =============================================================================

  // Lazy-resolved services (resolved on first access to avoid initialization race)
  let animationService: IAnimator | null = null;
  let turnsTupleGenerator: ITurnsTupleGenerator | null = null;

  // Lazy service resolver - resolves on first access
  function getAnimator(): IAnimator | null {
    if (!animationService) {
      animationService = tryResolve<IAnimator>(TYPES.IAnimator);
    }
    return animationService;
  }

  function getTurnsTupleGenerator(): ITurnsTupleGenerator | null {
    if (!turnsTupleGenerator) {
      turnsTupleGenerator = tryResolve<ITurnsTupleGenerator>(
        TYPES.ITurnsTupleGenerator
      );
    }
    return turnsTupleGenerator;
  }

  // Synchronized fade-in for pictograph elements (props, arrows, glyph)
  const pictographFadeIn = (_node: Element) => {
    const service = getAnimator();
    if (!service) {
      return { duration: 0 };
    }

    return service.createFadeTransition({
      duration: 350, // Smooth fade-in duration
      delay: 0, // No delay for synchronized appearance
    });
  };

  // Synchronized fade-out for pictograph elements
  const pictographFadeOut = (_node: Element) => {
    const service = getAnimator();
    if (!service) {
      return { duration: 0 };
    }

    return service.createFadeOutTransition();
  };

  // Create pictograph state with null - $effect below handles initial data and updates
  const pictographState = createPictographState(null);

  // Track if component is mounted (services are ready)
  let isMounted = $state(false);

  // Update pictograph state when props change (handles both initial and subsequent updates)
  $effect(() => {
    pictographState.updatePictographData(pictographData);
  });

  // Recalculate prop and arrow positions when pictograph data OR settings change
  // Only after component is mounted and services are initialized
  $effect(() => {
    // Watch for settings changes that affect prop rendering
    const settings = getSettings();
    settings.bluePropType;
    settings.redPropType;

    if (pictographData && isMounted) {
      pictographState.calculatePropPositions();
      pictographState.calculateArrowPositions();
    }
  });

  // Generate turns tuple from pictograph data for TKA glyph
  const turnsTuple = $derived.by(() => {
    if (
      !pictographData ||
      !pictographData.motions?.blue ||
      !pictographData.motions?.red
    ) {
      return "(s, 0, 0)"; // Default fallback
    }
    const generator = getTurnsTupleGenerator();
    if (!generator) {
      return "(s, 0, 0)"; // Fallback if service not available yet
    }
    return generator.generateTurnsTuple(pictographData);
  });

  // Calculate VTG mode and elemental type from pictograph data
  const vtgInfo = $derived.by(() => {
    if (!pictographData) {
      return { vtgMode: null, elementalType: null };
    }
    // Use the derived grid mode for VTG calculation
    return calculateVTGFromPictograph(pictographData, gridMode);
  });

  // Create a content key that changes when pictograph content changes
  // This triggers transitions when turn values, motions, or letter changes
  // IMPORTANT: Use pictographData directly (reactive prop) not pictographState
  // NOTE: Reversal state is NOT included here - it updates mid-fade via delayed state below
  const pictographContentKey = $derived.by(() => {
    if (!pictographData) return "empty";

    // Serialize the actual pictograph data to detect any changes
    return JSON.stringify({
      id: pictographData.id,
      letter: pictographData.letter,
      blueMotion: pictographData.motions.blue,
      redMotion: pictographData.motions.red,
    });
  });

  // Delayed reversal state - updates halfway through fade-out (125ms delay)
  // This creates the effect of reversals swapping at 50% opacity during transitions
  let delayedBlueReversal = $state(false);
  let delayedRedReversal = $state(false);
  let reversalUpdateTimeout: ReturnType<typeof setTimeout> | null = null;

  $effect(() => {
    // Track current reversal values
    const currentBlue = blueReversal;
    const currentRed = redReversal;

    // Clear any pending timeout
    if (reversalUpdateTimeout) {
      clearTimeout(reversalUpdateTimeout);
    }

    // Schedule reversal update for halfway through fade-out (125ms of 250ms)
    reversalUpdateTimeout = setTimeout(() => {
      delayedBlueReversal = currentBlue;
      delayedRedReversal = currentRed;
    }, 125);

    // Cleanup on component unmount
    return () => {
      if (reversalUpdateTimeout) {
        clearTimeout(reversalUpdateTimeout);
      }
    };
  });

  // =============================================================================
  // SVG RENDERING STATE (previously in PictographSvg)
  // =============================================================================

  // Loading coordination state
  let loadedComponents = $state(new Set<string>());

  // Track if all components are loaded for coordinated display
  const allComponentsLoaded = $derived.by(() => {
    if (!pictographState.hasValidData) return false;

    // Required components: grid, plus props and arrows must be ready
    const gridLoaded = loadedComponents.has("grid");

    // Check if props and arrows are ready (have positions calculated)
    const propsReady =
      pictographState.showProps &&
      Object.keys(pictographState.propPositions).length > 0;
    const arrowsReady =
      pictographState.showArrows &&
      Object.keys(pictographState.arrowPositions).length > 0;

    return gridLoaded && propsReady && arrowsReady;
  });

  // Derive grid mode from pictograph data using Svelte 5 runes
  // Use override gridMode if provided (for single-motion start positions in Guided mode)
  const gridMode = $derived(
    (() => {
      // Use override if provided
      if (overrideGridMode !== null) {
        return overrideGridMode;
      }

      if (
        !pictographState.effectivePictographData ||
        !pictographState.effectivePictographData.motions?.blue ||
        !pictographState.effectivePictographData.motions?.red
      ) {
        return GridMode.DIAMOND; // Default fallback
      }

      try {
        const gridModeService = resolve<IGridModeDeriver>(
          TYPES.IGridModeDeriver
        );
        return gridModeService.deriveGridMode(
          pictographState.effectivePictographData.motions.blue,
          pictographState.effectivePictographData.motions.red
        );
      } catch (error) {
        console.error("Failed to derive grid mode:", error);
        return GridMode.DIAMOND; // Fallback to default on error
      }
    })()
  );

  // Standard pictograph viewBox
  const viewBox = "0 0 950 950";

  // Filter motions based on visibleHand prop (for Guided Construct mode) and global visibility
  const filteredMotionsToRender = $derived.by(() => {
    // Force reactivity to global visibility changes
    visibilityUpdateCount;

    // Force reactivity to prop type settings changes (triggers motionsToRender re-computation)
    // Access motionsToRender which internally watches settingsUpdateCounter
    let motions = pictographState.motionsToRender;

    // Filter by visibleHand prop if specified (for Guided Construct mode)
    if (visibleHand) {
      motions = motions.filter(({ color }) => color === visibleHand);
    }

    // Also filter by global motion visibility (for Animation Viewer toggles)
    motions = motions.filter(({ color }) =>
      visibilityManager.getMotionVisibility(color)
    );

    return motions;
  });

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  // Enhanced component loading handler
  function handleComponentLoaded(componentName: string) {
    loadedComponents.add(componentName);
    loadedComponents = new Set(loadedComponents); // Trigger reactivity
    pictographState.handleComponentLoaded(componentName);
  }

  function handleComponentError(componentName: string, error: string) {
    pictographState.handleComponentError(componentName, error);
  }

  // =============================================================================
  // LIFECYCLE & EFFECTS
  // =============================================================================

  // Handle rotation override changes
  function handleRotationOverrideChanged(event: CustomEvent) {
    // Recalculate arrow positions when rotation override changes
    pictographState.calculateArrowPositions();
  }

  // Calculate arrow and prop positions when component mounts
  onMount(async () => {
    // Wait for services to initialize and calculate initial positions
    await pictographState.calculateArrowPositions();
    await pictographState.calculatePropPositions();

    // Mark as mounted - now $effect can handle reactive updates
    isMounted = true;

    // Listen for rotation override changes
    window.addEventListener(
      "rotation-override-changed",
      handleRotationOverrideChanged as EventListener
    );
  });

  onDestroy(() => {
    // Clean up event listener
    window.removeEventListener(
      "rotation-override-changed",
      handleRotationOverrideChanged as EventListener
    );
  });
</script>

{#snippet loadingPlaceholder()}
  <g class="loading-placeholder" opacity="0.3">
    <rect width="950" height="950" fill="#f3f4f6" />
    <text
      x="475"
      y="475"
      text-anchor="middle"
      dominant-baseline="middle"
      font-family="Arial, sans-serif"
      font-size="24"
      fill="#6b7280"
    >
      Loading...
    </text>
  </g>
{/snippet}

<!-- =============================================================================
     MAIN CONTAINER
     ============================================================================= -->
<div
  class="pictograph"
  class:loading={pictographState.isLoading}
  class:loaded={pictographState.isLoaded}
  class:has-error={pictographState.errorMessage}
  class:selected={isSelected}
  class:led-mode={effectiveLedMode}
  data-led-mode={effectiveLedMode}
>
  <svg
    width="100%"
    height="100%"
    {viewBox}
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label={pictographState.hasValidData
      ? "Pictograph"
      : "Empty Pictograph"}
  >
    <!-- Background - dark for LED mode, white otherwise -->
    <rect width="950" height="950" fill={backgroundColor} />

    {#if pictographState.hasValidData}
      <!-- Show loading placeholder until all components are loaded -->
      {#if !allComponentsLoaded}
        {@render loadingPlaceholder()}
      {/if}

      <!-- Grid (static - no fade transitions) -->
      <GridSvg
        {gridMode}
        showNonRadialPoints={effectiveShowNonRadialPoints}
        ledMode={effectiveLedMode}
        onLoaded={() => handleComponentLoaded("grid")}
        onError={(error) => handleComponentError("grid", error)}
        {onToggleNonRadial}
      />

      <!-- Wrapper group for synchronized fade-in/out of dynamic elements -->
      {#if disableContentTransitions}
        <!-- No transitions - render content directly -->
        <g class="pictograph-elements">
          <!-- Props (rendered first so arrows appear on top) -->
          {#each filteredMotionsToRender as { color, motionData } (color)}
            {#if pictographState.effectivePictographData && pictographState.propAssets[color] && pictographState.propPositions[color]}
              <PropSvg
                {motionData}
                propAssets={pictographState.propAssets[color]}
                propPosition={pictographState.propPositions[color]}
                showProp={pictographState.showProps}
              />
            {/if}
          {/each}

          <!-- Arrows (rendered after props) -->
          {#each filteredMotionsToRender as { color, motionData } (color)}
            {#if pictographState.effectivePictographData && pictographState.arrowAssets[color] && pictographState.arrowPositions[color]}
              <ArrowSvg
                {motionData}
                {color}
                pictographData={pictographState.effectivePictographData}
                arrowAssets={pictographState.arrowAssets[color]}
                arrowPosition={pictographState.arrowPositions[color]}
                shouldMirror={pictographState.arrowMirroring[color] || false}
                showArrow={pictographState.showArrows}
                isClickable={arrowsClickable}
                ledMode={effectiveLedMode}
              />
            {/if}
          {/each}

          <!-- Letter/Glyph overlay -->
          {#if pictographState.displayLetter || pictographData?.letter}
            <TKAGlyph
              letter={pictographState.displayLetter || pictographData?.letter}
              pictographData={pictographState.effectivePictographData}
              visible={effectiveShowTKA}
              {previewMode}
              onToggle={onToggleTKA}
              ledMode={effectiveLedMode}
            />
          {/if}

          <!-- Turn numbers (independent of TKA glyph) -->
          <TurnsColumn
            {turnsTuple}
            letter={pictographState.displayLetter || pictographData?.letter}
            pictographData={pictographState.effectivePictographData}
            visible={effectiveShowTurnNumbers}
            {previewMode}
            standalone={!effectiveShowTKA && !previewMode}
            onToggle={onToggleTurnNumbers}
            ledMode={effectiveLedMode}
          />

          <!-- Beat number overlay -->
          <BeatNumber
            {beatNumber}
            {showBeatNumber}
            {isStartPosition}
            hasValidData={pictographState.hasValidData}
            ledMode={effectiveLedMode}
          />

          <!-- Reversal indicators -->
          <ReversalIndicators
            blueReversal={delayedBlueReversal}
            redReversal={delayedRedReversal}
            hasValidData={pictographState.hasValidData}
            visible={effectiveShowReversals}
            {previewMode}
            onToggle={onToggleReversals}
            ledMode={effectiveLedMode}
          />

          <!-- Elemental glyph -->
          <ElementalGlyph
            elementalType={vtgInfo.elementalType}
            letter={pictographData?.letter}
            hasValidData={pictographState.hasValidData}
            visible={effectiveShowElemental}
            {previewMode}
            onToggle={onToggleElemental}
          />

          <!-- VTG glyph -->
          <VTGGlyph
            vtgMode={vtgInfo.vtgMode}
            letter={pictographData?.letter}
            hasValidData={pictographState.hasValidData}
            visible={effectiveShowVTG}
            {previewMode}
            onToggle={onToggleVTG}
          />

          <!-- Position glyph -->
          <PositionGlyph
            startPosition={pictographData?.startPosition}
            endPosition={pictographData?.endPosition}
            letter={pictographData?.letter}
            hasValidData={pictographState.hasValidData}
            visible={effectiveShowPositions}
            {previewMode}
            onToggle={onTogglePositions}
            ledMode={effectiveLedMode}
          />
        </g>
      {:else}
        <!-- With transitions - use key block for fade in/out -->
        {#key pictographContentKey}
          <g
            class="pictograph-elements"
            in:pictographFadeIn
            out:pictographFadeOut
          >
            <!-- Props (rendered first so arrows appear on top) -->
            {#each filteredMotionsToRender as { color, motionData } (color)}
              {#if pictographState.effectivePictographData && pictographState.propAssets[color] && pictographState.propPositions[color]}
                <PropSvg
                  {motionData}
                  propAssets={pictographState.propAssets[color]}
                  propPosition={pictographState.propPositions[color]}
                  showProp={pictographState.showProps}
                />
              {/if}
            {/each}

            <!-- Arrows (rendered after props) -->
            {#each filteredMotionsToRender as { color, motionData } (color)}
              {#if pictographState.effectivePictographData && pictographState.arrowAssets[color] && pictographState.arrowPositions[color]}
                <ArrowSvg
                  {motionData}
                  {color}
                  pictographData={pictographState.effectivePictographData}
                  arrowAssets={pictographState.arrowAssets[color]}
                  arrowPosition={pictographState.arrowPositions[color]}
                  shouldMirror={pictographState.arrowMirroring[color] || false}
                  showArrow={pictographState.showArrows}
                  isClickable={arrowsClickable}
                  ledMode={effectiveLedMode}
                />
              {/if}
            {/each}

            <!-- Letter/Glyph overlay -->
            {#if pictographState.displayLetter || pictographData?.letter}
              <TKAGlyph
                letter={pictographState.displayLetter || pictographData?.letter}
                pictographData={pictographState.effectivePictographData}
                visible={effectiveShowTKA}
                {previewMode}
                onToggle={onToggleTKA}
                ledMode={effectiveLedMode}
              />
            {/if}

            <!-- Turn numbers (independent of TKA glyph) -->
            <TurnsColumn
              {turnsTuple}
              letter={pictographState.displayLetter || pictographData?.letter}
              pictographData={pictographState.effectivePictographData}
              visible={effectiveShowTurnNumbers}
              {previewMode}
              standalone={!effectiveShowTKA && !previewMode}
              onToggle={onToggleTurnNumbers}
              ledMode={effectiveLedMode}
            />

            <!-- Beat number overlay -->
            <BeatNumber
              {beatNumber}
              {showBeatNumber}
              {isStartPosition}
              hasValidData={pictographState.hasValidData}
              ledMode={effectiveLedMode}
            />

            <!-- Reversal indicators -->
            <ReversalIndicators
              blueReversal={delayedBlueReversal}
              redReversal={delayedRedReversal}
              hasValidData={pictographState.hasValidData}
              visible={effectiveShowReversals}
              {previewMode}
              onToggle={onToggleReversals}
              ledMode={effectiveLedMode}
            />

            <!-- Elemental glyph -->
            <ElementalGlyph
              elementalType={vtgInfo.elementalType}
              letter={pictographData?.letter}
              hasValidData={pictographState.hasValidData}
              visible={effectiveShowElemental}
              {previewMode}
              onToggle={onToggleElemental}
            />

            <!-- VTG glyph -->
            <VTGGlyph
              vtgMode={vtgInfo.vtgMode}
              letter={pictographData?.letter}
              hasValidData={pictographState.hasValidData}
              visible={effectiveShowVTG}
              {previewMode}
              onToggle={onToggleVTG}
            />

            <!-- Position glyph -->
            <PositionGlyph
              startPosition={pictographData?.startPosition}
              endPosition={pictographData?.endPosition}
              letter={pictographData?.letter}
              hasValidData={pictographState.hasValidData}
              visible={effectiveShowPositions}
              {previewMode}
              onToggle={onTogglePositions}
              ledMode={effectiveLedMode}
            />
          </g>
        {/key}
      {/if}
    {:else}
      <!-- Empty state -->
      <EmptyStateIndicator
        {beatNumber}
        hasValidData={pictographState.hasValidData}
      />
    {/if}
  </svg>
</div>

<!-- =============================================================================
     STYLES (unified container and SVG styles)
     ============================================================================= -->
<style>
  .pictograph {
    position: relative;
    border-radius: 0; /* Remove border radius so pictographs touch */
    transition: all 0.2s ease;
    border: none; /* REMOVE BORDER - testing if this causes white line */
    width: 100%;
    height: 100%;
    max-width: 100%; /* Prevent overflow beyond parent */
    max-height: 100%; /* Prevent overflow beyond parent */
    display: block;
    margin: 0; /* Remove any margin */
    padding: 0; /* Remove any padding */
    box-sizing: border-box; /* Include border in width/height calculations */
    background: transparent; /* Transparent - SVG has white background */
  }

  /* Selected state - rounded corners to match selection border */
  .pictograph.selected {
    border-radius: 9px; /* 12px outer - 3px border = 9px inner radius */
    border-color: transparent; /* Hide gray border when selected */
    overflow: hidden; /* Ensure SVG content respects rounded corners */
  }

  .pictograph.loading {
    opacity: 1;
  }

  .pictograph.has-error {
    border-color: var(--semantic-error);
  }

  /* SVG styles (from PictographSvg) */
  svg {
    display: block;
    box-sizing: border-box;
  }

  /* SVG inherits border-radius when selected */
  .pictograph.selected svg {
    border-radius: 9px;
  }

  :global(.component-loading) {
    opacity: 0.5;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 0.5;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      opacity: 0.5;
    }
  }
</style>
