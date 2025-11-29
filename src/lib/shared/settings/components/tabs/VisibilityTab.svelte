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
  import { GridLocation, GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { ElementVisibilityControls, PreviewSection } from "./visibility";
  import { createMotionData, MotionType, RotationDirection, Orientation, MotionColor } from "../../../pictograph";

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
    blueReversal: true,  // Show blue reversal indicator
    redReversal: true,   // Show red reversal indicator
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
  }

  /* Compact layout when parent container height is limited */
  @container settings-content (max-height: 550px) {
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
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
  }

  .description {
    font-size: 13px;
    font-weight: 400;
    letter-spacing: -0.08px;
    line-height: 1.3;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  @container settings-content (max-height: 550px) {
    .title {
      font-size: 16px;
    }
    .description {
      font-size: 12px;
    }
  }

  /* Main Content Area */
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
  }

  @container settings-content (max-height: 550px) {
    .visibility-content {
      padding: 8px;
      border-radius: 10px;
    }
  }

  /* Controls Section */
  .controls-section {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .controls-section.hidden-mobile {
    display: none;
  }

  /* Preview Toggle Button */
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
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  @container settings-content (max-height: 550px) {
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

  /* Preview Wrapper */
  .preview-wrapper {
    display: none;
    flex: 1;
    min-height: 0;
  }

  .preview-wrapper.visible-mobile {
    display: flex;
    flex-direction: column;
  }

  /* Desktop: Show both sections side by side */
  @media (min-width: 768px) {
    .visibility-content {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 16px;
    }

    .preview-toggle-btn {
      display: none;
    }

    .controls-section,
    .controls-section.hidden-mobile {
      display: flex;
    }

    .preview-wrapper,
    .preview-wrapper.visible-mobile {
      display: flex;
      flex-direction: column;
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
