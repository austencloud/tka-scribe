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
  import {
    MotionColor,
    MotionType,
    RotationDirection,
    GridLocation,
    Orientation,
    createMotionData,
  } from "$shared";
  import { onMount } from "svelte";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import { ElementVisibilityControls, PreviewSection } from "./visibility";

  interface Props {
    currentSettings: Record<string, unknown>;
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let { currentSettings, onSettingUpdate }: Props = $props();

  // Visibility state manager
  const visibilityManager = getVisibilityStateManager();

  // Local reactive state for UI
  let tkaVisible = $state(true);
  let vtgVisible = $state(false);
  let elementalVisible = $state(false);
  let positionsVisible = $state(false);
  let reversalsVisible = $state(true);
  let nonRadialVisible = $state(false);

  // Preview visibility toggle for small screens
  let showPreview = $state(false);

  // Example pictograph data for preview - Letter A with proper MotionData
  // Use createMotionData to ensure all required fields including propPlacementData
  const examplePictographData = {
    id: "visibility-preview",
    letter: Letter.A,
    startPosition: GridPosition.ALPHA1,
    endPosition: GridPosition.ALPHA3,
    gridMode: GridMode.DIAMOND,
    motions: {
      blue: createMotionData({
        motionType: MotionType.PRO,
        rotationDirection: RotationDirection.CLOCKWISE,
        startLocation: GridLocation.SOUTH,
        endLocation: GridLocation.WEST,
        turns: 0,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.IN,
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
        turns: 0,
        startOrientation: Orientation.IN,
        endOrientation: Orientation.IN,
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
    nonRadialVisible = visibilityManager.getNonRadialVisibility();

    // Register observer for external changes
    const observer = () => {
      tkaVisible = visibilityManager.getRawGlyphVisibility("TKA");
      vtgVisible = visibilityManager.getRawGlyphVisibility("VTG");
      elementalVisible = visibilityManager.getRawGlyphVisibility("Elemental");
      positionsVisible = visibilityManager.getRawGlyphVisibility("Positions");
      reversalsVisible = visibilityManager.getRawGlyphVisibility("Reversals");
      nonRadialVisible = visibilityManager.getNonRadialVisibility();
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
</script>

<div class="visibility-tab">
  <!-- Title and Description -->
  <div class="header">
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

  <!-- Main Content - 50/50 Split -->
  <div class="content">
    <!-- Left Side: Controls (hidden on small screens when preview is shown) -->
    <div class="controls-section" class:hidden-mobile={showPreview}>
      <ElementVisibilityControls
        {tkaVisible}
        {vtgVisible}
        {elementalVisible}
        {positionsVisible}
        {reversalsVisible}
        {nonRadialVisible}
        onToggleTKA={toggleTKA}
        onToggleVTG={toggleVTG}
        onToggleElemental={toggleElemental}
        onTogglePositions={togglePositions}
        onToggleReversals={toggleReversals}
        onToggleNonRadial={toggleNonRadial}
      />
    </div>

    <!-- Right Side: Interactive Preview (only shown on small screens when toggled) -->
    <div
      id="preview-section"
      class="preview-wrapper"
      class:visible-mobile={showPreview}
    >
      <PreviewSection pictographData={examplePictographData} />
    </div>
  </div>
</div>

<style>
  .visibility-tab {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.5cqi, 12px); /* Tighter gap to maximize content area */
    max-width: 100%;
    height: 100%; /* Use full height of parent */
    flex: 1; /* Fill available height using flex */
    min-height: 0; /* Allow proper flex shrinking */
    padding: 0 clamp(8px, 2cqi, 16px);
    container-type: inline-size;
  }

  /* Header - iOS Typography */
  .header {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 1cqi, 8px); /* Tighter spacing to maximize content area */
    text-align: center;
    flex-shrink: 0; /* Prevent header from shrinking */
  }

  .title {
    font-size: clamp(20px, 4cqi, 24px); /* iOS title3 */
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.45px; /* iOS title3 tracking */
    line-height: 1.25; /* iOS title3 ratio */
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    /* iOS uses SF Pro Display for text ≥20px */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
      system-ui, sans-serif;
  }

  .description {
    font-size: clamp(13px, 2.5cqi, 15px); /* iOS footnote to body */
    font-weight: 400;
    letter-spacing: -0.08px; /* iOS footnote tracking */
    line-height: 1.38; /* iOS footnote ratio */
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Main Content - iOS Glass Morphism */
  .content {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(12px, 3cqi, 32px);
    background: rgba(255, 255, 255, 0.04);
    border: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline border */
    border-radius: 12px; /* iOS medium corner radius */
    padding: clamp(6px, 1.5cqi, 16px); /* Minimal padding to maximize preview space */
    align-items: stretch; /* Allow items to stretch */
    flex: 1; /* Fill remaining space */
    min-height: 0; /* Allow flex shrinking */
    height: 100%; /* Ensure content takes full available height */
    box-shadow:
      0 3px 12px rgba(0, 0, 0, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.08);
  }

  /* Controls Section */
  .controls-section {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1; /* Grow to fill available space but allow shrinking */
    min-height: 0; /* Allow flex shrinking to prevent overflow */
  }

  /* Hide controls on small screens when preview is active */
  .controls-section.hidden-mobile {
    display: none;
  }

  /* Preview Toggle Button - iOS System Blue */
  .preview-toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px; /* Reduced from 8px to 6px */
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
    padding: clamp(
      8px,
      2cqi,
      14px
    ); /* Reduced from 10px to 8px for compact fit */
    background: #007aff; /* iOS system blue - exact hex */
    color: white;
    border: none;
    border-radius: 12px; /* iOS medium corner radius */
    font-size: clamp(13px, 2.5cqi, 15px);
    font-weight: 600; /* iOS semibold */
    letter-spacing: -0.08px; /* iOS footnote tracking */
    line-height: 1.38;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1); /* iOS spring */
    box-shadow:
      0 3px 12px rgba(0, 122, 255, 0.3),
      0 1px 3px rgba(0, 122, 255, 0.2);
    min-height: 44px; /* iOS minimum touch target */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .preview-toggle-btn:hover {
    background: #0051d5; /* iOS system blue hover - darker */
    box-shadow:
      0 6px 18px rgba(0, 122, 255, 0.4),
      0 2px 4px rgba(0, 122, 255, 0.25);
    transform: translateY(-1px);
  }

  .preview-toggle-btn:active {
    transform: scale(0.98);
    transition-duration: 0.1s; /* iOS immediate feedback */
  }

  .preview-toggle-btn:focus-visible {
    outline: 3px solid #007aff; /* iOS 15+ thicker focus ring */
    outline-offset: 2px;
    box-shadow:
      0 6px 18px rgba(0, 122, 255, 0.4),
      0 2px 4px rgba(0, 122, 255, 0.25),
      0 0 0 4px rgba(0, 122, 255, 0.2); /* iOS glow effect */
  }

  .toggle-icon {
    display: inline-block;
    transition: transform 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    font-size: 0.75em;
  }

  .toggle-icon.expanded {
    transform: rotate(180deg);
  }

  /* Preview Wrapper - Hidden by default on small screens, shows when toggled */
  .preview-wrapper {
    display: none;
    flex: 1; /* Fill available height using flex */
    min-height: 0; /* Allow flex shrinking */
  }

  .preview-wrapper.visible-mobile {
    display: flex;
    flex-direction: column;
  }

  /* Container Query - Two Column Layout for Wider Containers (iPad portrait) */
  @container (min-width: 768px) {
    .content {
      grid-template-columns: minmax(min(100%, 20rem), 1fr) minmax(
          min(100%, 25rem),
          2fr
        );
      gap: clamp(24px, 4cqi, 40px);
    }

    /* Hide toggle button on larger containers */
    .preview-toggle-btn {
      display: none;
    }

    /* Always show both sections on larger containers */
    .controls-section,
    .controls-section.hidden-mobile {
      display: flex;
    }

    .preview-wrapper,
    .preview-wrapper.visible-mobile {
      display: flex;
      flex-direction: column;
      overflow: visible;
    }
  }

  /* Container Query - Balanced Layout for Very Wide Containers */
  @container (min-width: 1000px) {
    .content {
      grid-template-columns: minmax(22rem, 1fr) minmax(30rem, 2.5fr);
    }
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .preview-toggle-btn,
    .toggle-icon,
    .preview-wrapper {
      transition: none;
    }

    .preview-toggle-btn:hover {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .content {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .preview-toggle-btn {
      border: 2px solid #007aff;
    }
  }
</style>
