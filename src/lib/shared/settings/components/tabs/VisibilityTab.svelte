<!--
  VisibilityTab.svelte - Pictograph Visibility Settings

  Allows users to control which elements are visible in pictographs:
  - Glyphs (TKA, VTG, Elemental, Positions, Reversals)
  - Grid elements (Non-radial points)

  Features:
  - Interactive preview pictograph
  - Click-to-toggle on preview elements
  - Toggle buttons for each element type
-->
<script lang="ts">
  import { getVisibilityStateManager } from "$lib/shared/pictograph/shared/state/visibility-state.svelte";

  import { onMount } from "svelte";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import {
    GridLocation,
    GridMode,
  } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { ElementVisibilityControls, PreviewSection } from "./visibility";
  import {
    createMotionData,
    MotionType,
    RotationDirection,
    Orientation,
    MotionColor,
  } from "../../../pictograph";

  interface Props {
    currentSettings: unknown;
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let {
    currentSettings: _currentSettings,
    onSettingUpdate: _onSettingUpdate,
  }: Props = $props();

  // Visibility state manager
  const visibilityManager = getVisibilityStateManager();

  // Local reactive state for UI
  let tkaVisible = $state(true);
  let vtgVisible = $state(false);
  let elementalVisible = $state(false);
  let positionsVisible = $state(false);
  let reversalsVisible = $state(true);
  let turnNumbersVisible = $state(true);
  let nonRadialVisible = $state(false);
  let blueMotionVisible = $state(true);
  let redMotionVisible = $state(true);

  // Preview visibility toggle for small screens
  let showPreview = $state(false);

  // Example pictograph data for preview - Letter A with turns and reversals
  // Each motion has 1 turn, starting IN and ending OUT
  // Both reversals enabled to demonstrate the reversal indicators
  const examplePictographData = {
    id: "visibility-preview",
    letter: Letter.A,
    startPosition: GridPosition.ALPHA1,
    endPosition: GridPosition.ALPHA3,
    gridMode: GridMode.DIAMOND,
    blueReversal: true, // Show blue reversal indicator
    redReversal: true, // Show red reversal indicator
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

  onMount(() => {
    // Load initial state from visibility manager
    tkaVisible = visibilityManager.getRawGlyphVisibility("TKA");
    vtgVisible = visibilityManager.getRawGlyphVisibility("VTG");
    elementalVisible = visibilityManager.getRawGlyphVisibility("Elemental");
    positionsVisible = visibilityManager.getRawGlyphVisibility("Positions");
    reversalsVisible = visibilityManager.getRawGlyphVisibility("Reversals");
    turnNumbersVisible = visibilityManager.getRawGlyphVisibility("TurnNumbers");
    nonRadialVisible = visibilityManager.getNonRadialVisibility();
    blueMotionVisible = visibilityManager.getMotionVisibility(MotionColor.BLUE);
    redMotionVisible = visibilityManager.getMotionVisibility(MotionColor.RED);

    // Register observer for external changes
    const observer = () => {
      tkaVisible = visibilityManager.getRawGlyphVisibility("TKA");
      vtgVisible = visibilityManager.getRawGlyphVisibility("VTG");
      elementalVisible = visibilityManager.getRawGlyphVisibility("Elemental");
      positionsVisible = visibilityManager.getRawGlyphVisibility("Positions");
      reversalsVisible = visibilityManager.getRawGlyphVisibility("Reversals");
      turnNumbersVisible =
        visibilityManager.getRawGlyphVisibility("TurnNumbers");
      nonRadialVisible = visibilityManager.getNonRadialVisibility();
      blueMotionVisible = visibilityManager.getMotionVisibility(
        MotionColor.BLUE
      );
      redMotionVisible = visibilityManager.getMotionVisibility(MotionColor.RED);
    };

    visibilityManager.registerObserver(observer, ["all"]);

    return () => {
      visibilityManager.unregisterObserver(observer);
    };
  });

  function toggleTKA() {
    tkaVisible = !tkaVisible;
    visibilityManager.setGlyphVisibility("TKA", tkaVisible);
  }

  function toggleVTG() {
    vtgVisible = !vtgVisible;
    visibilityManager.setGlyphVisibility("VTG", vtgVisible);
  }

  function toggleElemental() {
    elementalVisible = !elementalVisible;
    visibilityManager.setGlyphVisibility("Elemental", elementalVisible);
  }

  function togglePositions() {
    positionsVisible = !positionsVisible;
    visibilityManager.setGlyphVisibility("Positions", positionsVisible);
  }

  function toggleReversals() {
    reversalsVisible = !reversalsVisible;
    visibilityManager.setGlyphVisibility("Reversals", reversalsVisible);
  }

  function toggleNonRadial() {
    nonRadialVisible = !nonRadialVisible;
    visibilityManager.setNonRadialVisibility(nonRadialVisible);
  }

  function toggleTurnNumbers() {
    turnNumbersVisible = !turnNumbersVisible;
    visibilityManager.setGlyphVisibility("TurnNumbers", turnNumbersVisible);
  }

  function toggleBlueMotion() {
    blueMotionVisible = !blueMotionVisible;
    visibilityManager.setMotionVisibility(MotionColor.BLUE, blueMotionVisible);
  }

  function toggleRedMotion() {
    redMotionVisible = !redMotionVisible;
    visibilityManager.setMotionVisibility(MotionColor.RED, redMotionVisible);
  }
</script>

<div class="visibility-tab">
  <!-- Compact Header -->
  <div class="visibility-header">
    <h3 class="title">Visibility Settings</h3>
    <p class="description">Control which elements are visible in pictographs</p>

    <!-- Preview Toggle Button (only visible on small containers) -->
    <button
      class="preview-toggle-btn"
      onclick={() => (showPreview = !showPreview)}
      aria-expanded={showPreview}
      aria-controls="preview-section"
    >
      <span class="toggle-icon" class:expanded={showPreview}>▼</span>
      {showPreview ? "Hide" : "Show"} Preview
    </button>
  </div>

  <!-- Main Content Area -->
  <div class="visibility-content">
    <!-- Controls Section -->
    <div class="controls-section" class:hidden-mobile={showPreview}>
      <ElementVisibilityControls
        {tkaVisible}
        {vtgVisible}
        {elementalVisible}
        {positionsVisible}
        {reversalsVisible}
        {turnNumbersVisible}
        {nonRadialVisible}
        {blueMotionVisible}
        {redMotionVisible}
        onToggleTKA={toggleTKA}
        onToggleVTG={toggleVTG}
        onToggleElemental={toggleElemental}
        onTogglePositions={togglePositions}
        onToggleReversals={toggleReversals}
        onToggleTurnNumbers={toggleTurnNumbers}
        onToggleNonRadial={toggleNonRadial}
        onToggleBlueMotion={toggleBlueMotion}
        onToggleRedMotion={toggleRedMotion}
      />
    </div>

    <!-- Right Side: Interactive Preview (only shown on small screens when toggled) -->
    <div
      id="preview-section"
      class="preview-wrapper"
      class:visible-mobile={showPreview}
    >
      <PreviewSection
        pictographData={examplePictographData}
        onToggleTKA={toggleTKA}
        onToggleVTG={toggleVTG}
        onToggleElemental={toggleElemental}
        onTogglePositions={togglePositions}
        onToggleReversals={toggleReversals}
        onToggleNonRadial={toggleNonRadial}
      />
    </div>
  </div>
</div>

<style>
  .visibility-tab {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    height: 100%;
    min-height: 0; /* Critical for flex containment */
    overflow: hidden; /* Ensure nothing escapes */
    padding: 8px 12px;
    container-type: size; /* Enable both width AND height queries */
    container-name: visibility-tab;
  }

  /* Compact layout when parent container height is limited */
  @container visibility-tab (max-height: 550px) {
    .visibility-tab {
      gap: 8px;
      padding: 4px 8px;
    }
  }

  /* Header - Compact */
  .visibility-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
    flex-shrink: 0;
  }

  .title {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.45px;
    line-height: 1.2;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  }

  .description {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: -0.08px;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  @container visibility-tab (max-height: 550px) {
    .title {
      font-size: 16px;
    }
    .description {
      font-size: 12px;
    }
  }

  /* Main Content Area - Default: Vertical Stack */
  .visibility-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0; /* Critical for flex containment */
    overflow: hidden; /* Contain children */
    background: rgba(255, 255, 255, 0.04);
    border: 0.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 12px;
    gap: 12px;
  }

  @container visibility-tab (max-height: 550px) {
    .visibility-content {
      padding: 8px;
      border-radius: 10px;
      gap: 8px;
    }
  }

  /* Controls Section */
  .controls-section {
    display: flex;
    flex-direction: column;
    flex-shrink: 0; /* Don't shrink controls in vertical mode */
    min-height: 0;
    overflow: hidden;
  }

  .controls-section.hidden-mobile {
    display: none;
  }

  /* Preview Toggle Button - shown in vertical layout by default */
  .preview-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    max-width: 280px;
    margin: 4px auto 0;
    padding: 10px 16px;
    background: #007aff;
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 40px;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  @container visibility-tab (max-height: 550px) {
    .preview-toggle-btn {
      padding: 8px 12px;
      min-height: 36px;
      font-size: 13px;
    }
  }

  .preview-toggle-btn:hover {
    background: #0051d5;
  }

  .preview-toggle-btn:active {
    transform: scale(0.98);
  }

  .preview-toggle-btn:focus-visible {
    outline: 2px solid #007aff;
    outline-offset: 2px;
  }

  .toggle-icon {
    display: inline-block;
    transition: transform 0.2s ease;
    font-size: 0.75em;
  }

  .toggle-icon.expanded {
    transform: rotate(180deg);
  }

  /* Preview Wrapper - hidden by default in vertical mode */
  .preview-wrapper {
    display: none;
    flex: 1;
    min-height: 0;
  }

  .preview-wrapper.visible-mobile {
    display: flex;
    flex-direction: column;
  }

  /* ===== CONTENT-AWARE LAYOUT USING CONTAINER QUERIES ===== */

  /* 
   * Side-by-side layout when:
   * - Container is wide enough (min-width: 500px) AND
   * - Container has enough height to show both sections comfortably (min-height: 350px)
   * 
   * This ensures the preview has enough vertical space to be useful
   */
  @container visibility-tab (min-width: 500px) and (min-height: 350px) {
    .visibility-content {
      display: grid;
      grid-template-columns: minmax(180px, 1fr) minmax(200px, 1.5fr);
      gap: 16px;
    }

    .preview-toggle-btn {
      display: none;
    }

    .controls-section,
    .controls-section.hidden-mobile {
      display: flex;
      flex: 1;
    }

    .preview-wrapper,
    .preview-wrapper.visible-mobile {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }

  /* 
   * Wide but short container: Stack vertically with preview below
   * This handles wide-but-short scenarios (like landscape mobile)
   */
  @container visibility-tab (min-width: 500px) and (max-height: 349px) {
    .visibility-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .controls-section {
      flex-shrink: 0;
    }

    /* In short+wide mode, show preview below controls (no toggle needed) */
    .preview-toggle-btn {
      display: none;
    }

    .preview-wrapper,
    .preview-wrapper.visible-mobile {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 150px;
    }

    .controls-section.hidden-mobile {
      display: flex;
    }
  }

  /* 
   * Narrow container (< 500px): Always stack vertically with toggle
   * This handles narrow sidebars, mobile portrait, etc.
   */
  @container visibility-tab (max-width: 499px) {
    .visibility-content {
      display: flex;
      flex-direction: column;
    }

    .preview-toggle-btn {
      display: flex;
    }

    .controls-section.hidden-mobile {
      display: none;
    }

    .preview-wrapper {
      display: none;
    }

    .preview-wrapper.visible-mobile {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
  }

  /* 
   * Extra-wide container: Better proportions for large screens
   */
  @container visibility-tab (min-width: 700px) and (min-height: 400px) {
    .visibility-content {
      grid-template-columns: minmax(220px, 1fr) minmax(280px, 2fr);
      gap: 20px;
    }
  }

  /* 
   * Very wide container: Cap proportions to keep controls readable
   */
  @container visibility-tab (min-width: 900px) and (min-height: 450px) {
    .visibility-content {
      grid-template-columns: minmax(250px, 350px) minmax(350px, 1fr);
      gap: 24px;
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .preview-toggle-btn,
    .toggle-icon {
      transition: none;
    }
  }

  @media (prefers-contrast: high) {
    .visibility-content {
      border-width: 2px;
    }
  }
</style>
