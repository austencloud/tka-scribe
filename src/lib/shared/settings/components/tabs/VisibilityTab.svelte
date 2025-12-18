<!--
  VisibilityTab.svelte - Visibility Settings

  Desktop: Side-by-side panels for Pictograph, Animation, and Image settings
  Mobile: Segmented control to switch between modes

  Uses PictographWithVisibility for interactive preview where clicking
  elements toggles their visibility, and disabled elements show at 50% opacity.

  Note: Blue/Red motion toggles removed - those are contextual controls
  that belong in Sequence Viewers, Animation Player, and Export dialogs.
-->
<script lang="ts">
  import { getVisibilityStateManager } from "$lib/shared/pictograph/shared/state/visibility-state.svelte";
  import {
    getAnimationVisibilityManager,
    type TrailStyle,
    type GridMode as AnimGridMode,
  } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";
  import { getImageCompositionManager } from "$lib/shared/share/state/image-composition-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
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
  import VisibilityHelpModal from "./visibility/VisibilityHelpModal.svelte";
  import CyclingButton from "./visibility/CyclingButton.svelte";
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import ImageExportPreview from "./visibility/ImageExportPreview.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  interface Props {
    currentSettings: unknown;
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let {
    currentSettings: _currentSettings,
    onSettingUpdate: _onSettingUpdate,
  }: Props = $props();

  // State managers
  const visibilityManager = getVisibilityStateManager();
  const animationVisibilityManager = getAnimationVisibilityManager();
  const imageCompositionManager = getImageCompositionManager();

  // Mobile mode selection (only used on small screens)
  let mobileMode = $state<"pictograph" | "animation" | "image">("pictograph");
  let isVisible = $state(false);

  // Help modal state
  let helpModalPanel = $state<"pictograph" | "animation" | "image" | null>(
    null
  );
  let isHelpModalOpen = $state(false);

  function openHelpModal(panel: "pictograph" | "animation" | "image") {
    triggerHaptic();
    helpModalPanel = panel;
    isHelpModalOpen = true;
  }

  function closeHelpModal() {
    isHelpModalOpen = false;
    // Delay clearing panel so animation completes
    setTimeout(() => {
      helpModalPanel = null;
    }, 300);
  }

  // Image composition visibility
  let imgAddWord = $state(true);
  let imgAddBeatNumbers = $state(true);
  let imgAddDifficultyLevel = $state(false);
  let imgIncludeStartPosition = $state(true);
  let imgAddUserInfo = $state(false);

  // Pictograph visibility
  let tkaGlyphVisible = $state(true);
  let vtgGlyphVisible = $state(false);
  let elementalGlyphVisible = $state(false);
  let positionsGlyphVisible = $state(false);
  let reversalIndicatorsVisible = $state(true);
  let turnNumbersVisible = $state(true);
  let nonRadialVisible = $state(false);

  // Animation visibility
  let animGridMode = $state<AnimGridMode>("diamond");
  let animBeatNumbersVisible = $state(true);
  let animTrailStyle = $state<TrailStyle>("subtle");
  let animTkaGlyphVisible = $state(true);
  let animReversalIndicatorsVisible = $state(false);
  let animTurnNumbersVisible = $state(true);

  let hapticService: IHapticFeedbackService | null = null;
  const triggerHaptic = () => hapticService?.trigger("selection");

  // Example pictograph data for preview
  const examplePictographData = {
    id: "visibility-preview",
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

  // Example sequence data for animation preview (matches pictograph)
  const exampleSequenceData: SequenceData = {
    id: "visibility-preview-seq",
    name: "Preview",
    word: "A",
    beats: [
      {
        ...examplePictographData,
        beatNumber: 1,
      },
    ],
  };

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Load pictograph visibility
    tkaGlyphVisible = visibilityManager.getRawGlyphVisibility("tkaGlyph");
    vtgGlyphVisible = visibilityManager.getRawGlyphVisibility("vtgGlyph");
    elementalGlyphVisible =
      visibilityManager.getRawGlyphVisibility("elementalGlyph");
    positionsGlyphVisible =
      visibilityManager.getRawGlyphVisibility("positionsGlyph");
    reversalIndicatorsVisible =
      visibilityManager.getRawGlyphVisibility("reversalIndicators");
    turnNumbersVisible = visibilityManager.getRawGlyphVisibility("turnNumbers");
    nonRadialVisible = visibilityManager.getNonRadialVisibility();

    // Load animation visibility
    animGridMode = animationVisibilityManager.getGridMode();
    animBeatNumbersVisible =
      animationVisibilityManager.getVisibility("beatNumbers");
    animTrailStyle = animationVisibilityManager.getTrailStyle();
    animTkaGlyphVisible = animationVisibilityManager.getVisibility("tkaGlyph");
    animReversalIndicatorsVisible =
      animationVisibilityManager.getVisibility("reversalIndicators");
    animTurnNumbersVisible =
      animationVisibilityManager.getVisibility("turnNumbers");

    // Load image composition settings
    imgAddWord = imageCompositionManager.addWord;
    imgAddBeatNumbers = imageCompositionManager.addBeatNumbers;
    imgAddDifficultyLevel = imageCompositionManager.addDifficultyLevel;
    imgIncludeStartPosition = imageCompositionManager.includeStartPosition;
    imgAddUserInfo = imageCompositionManager.addUserInfo;

    const pictographObserver = () => {
      tkaGlyphVisible = visibilityManager.getRawGlyphVisibility("tkaGlyph");
      vtgGlyphVisible = visibilityManager.getRawGlyphVisibility("vtgGlyph");
      elementalGlyphVisible =
        visibilityManager.getRawGlyphVisibility("elementalGlyph");
      positionsGlyphVisible =
        visibilityManager.getRawGlyphVisibility("positionsGlyph");
      reversalIndicatorsVisible =
        visibilityManager.getRawGlyphVisibility("reversalIndicators");
      turnNumbersVisible =
        visibilityManager.getRawGlyphVisibility("turnNumbers");
      nonRadialVisible = visibilityManager.getNonRadialVisibility();
    };

    const animationObserver = () => {
      animGridMode = animationVisibilityManager.getGridMode();
      animBeatNumbersVisible =
        animationVisibilityManager.getVisibility("beatNumbers");
      animTrailStyle = animationVisibilityManager.getTrailStyle();
      animTkaGlyphVisible =
        animationVisibilityManager.getVisibility("tkaGlyph");
      animReversalIndicatorsVisible =
        animationVisibilityManager.getVisibility("reversalIndicators");
      animTurnNumbersVisible =
        animationVisibilityManager.getVisibility("turnNumbers");
    };

    const imageCompositionObserver = () => {
      imgAddWord = imageCompositionManager.addWord;
      imgAddBeatNumbers = imageCompositionManager.addBeatNumbers;
      imgAddDifficultyLevel = imageCompositionManager.addDifficultyLevel;
      imgIncludeStartPosition = imageCompositionManager.includeStartPosition;
      imgAddUserInfo = imageCompositionManager.addUserInfo;
    };

    visibilityManager.registerObserver(pictographObserver, ["all"]);
    animationVisibilityManager.registerObserver(animationObserver);
    imageCompositionManager.registerObserver(imageCompositionObserver);

    // Entry animation
    setTimeout(() => (isVisible = true), 30);

    return () => {
      visibilityManager.unregisterObserver(pictographObserver);
      animationVisibilityManager.unregisterObserver(animationObserver);
      imageCompositionManager.unregisterObserver(imageCompositionObserver);
    };
  });

  // Toggle functions - Pictograph
  function togglePicto(key: string) {
    triggerHaptic();
    switch (key) {
      case "tka":
        tkaGlyphVisible = !tkaGlyphVisible;
        visibilityManager.setGlyphVisibility("tkaGlyph", tkaGlyphVisible);
        break;
      case "vtg":
        vtgGlyphVisible = !vtgGlyphVisible;
        visibilityManager.setGlyphVisibility("vtgGlyph", vtgGlyphVisible);
        break;
      case "elemental":
        elementalGlyphVisible = !elementalGlyphVisible;
        visibilityManager.setGlyphVisibility(
          "elementalGlyph",
          elementalGlyphVisible
        );
        break;
      case "positions":
        positionsGlyphVisible = !positionsGlyphVisible;
        visibilityManager.setGlyphVisibility(
          "positionsGlyph",
          positionsGlyphVisible
        );
        break;
      case "reversals":
        reversalIndicatorsVisible = !reversalIndicatorsVisible;
        visibilityManager.setGlyphVisibility(
          "reversalIndicators",
          reversalIndicatorsVisible
        );
        break;
      case "turnNumbers":
        turnNumbersVisible = !turnNumbersVisible;
        visibilityManager.setGlyphVisibility("turnNumbers", turnNumbersVisible);
        break;
      case "nonRadial":
        nonRadialVisible = !nonRadialVisible;
        visibilityManager.setNonRadialVisibility(nonRadialVisible);
        break;
    }
  }

  // Toggle functions - Animation
  function toggleAnim(key: string) {
    triggerHaptic();
    switch (key) {
      case "beatNumbers":
        animBeatNumbersVisible = !animBeatNumbersVisible;
        animationVisibilityManager.setVisibility(
          "beatNumbers",
          animBeatNumbersVisible
        );
        break;
      case "tka":
        animTkaGlyphVisible = !animTkaGlyphVisible;
        animationVisibilityManager.setVisibility(
          "tkaGlyph",
          animTkaGlyphVisible
        );
        break;
      case "reversals":
        animReversalIndicatorsVisible = !animReversalIndicatorsVisible;
        animationVisibilityManager.setVisibility(
          "reversalIndicators",
          animReversalIndicatorsVisible
        );
        break;
      case "turnNumbers":
        animTurnNumbersVisible = !animTurnNumbersVisible;
        animationVisibilityManager.setVisibility(
          "turnNumbers",
          animTurnNumbersVisible
        );
        break;
    }
  }

  // Handlers for 3-state cycling buttons
  function handleGridModeChange(newMode: string) {
    triggerHaptic();
    animationVisibilityManager.setGridMode(newMode as AnimGridMode);
  }

  function handleTrailStyleChange(newStyle: string) {
    triggerHaptic();
    animationVisibilityManager.setTrailStyle(newStyle as TrailStyle);
  }

  // Toggle functions - Image Composition
  function toggleImage(key: string) {
    triggerHaptic();
    switch (key) {
      case "word":
        imgAddWord = !imgAddWord;
        imageCompositionManager.setAddWord(imgAddWord);
        break;
      case "beatNumbers":
        imgAddBeatNumbers = !imgAddBeatNumbers;
        imageCompositionManager.setAddBeatNumbers(imgAddBeatNumbers);
        break;
      case "difficulty":
        imgAddDifficultyLevel = !imgAddDifficultyLevel;
        imageCompositionManager.setAddDifficultyLevel(imgAddDifficultyLevel);
        break;
      case "startPosition":
        imgIncludeStartPosition = !imgIncludeStartPosition;
        imageCompositionManager.setIncludeStartPosition(
          imgIncludeStartPosition
        );
        break;
      case "userInfo":
        imgAddUserInfo = !imgAddUserInfo;
        imageCompositionManager.setAddUserInfo(imgAddUserInfo);
        break;
    }
  }

  function setMobileMode(mode: "pictograph" | "animation" | "image") {
    triggerHaptic();
    mobileMode = mode;
  }
</script>

<div class="visibility-tab" class:visible={isVisible}>
  <!-- Mobile: Segmented Control (hidden on desktop) -->
  <div class="mobile-segment-control">
    <button
      class="segment-btn"
      class:active={mobileMode === "pictograph"}
      onclick={() => setMobileMode("pictograph")}
    >
      <i class="fas fa-image"></i>
      <span>Pictograph</span>
    </button>
    <button
      class="segment-btn"
      class:active={mobileMode === "animation"}
      onclick={() => setMobileMode("animation")}
    >
      <i class="fas fa-film"></i>
      <span>Animation</span>
    </button>
    <button
      class="segment-btn"
      class:active={mobileMode === "image"}
      onclick={() => setMobileMode("image")}
    >
      <i class="fas fa-download"></i>
      <span>Image</span>
    </button>
  </div>

  <!-- Desktop: Side-by-side panels / Mobile: Single panel based on segment -->
  <div class="visibility-panels-container">
    <!-- Pictograph Panel -->
    <section
      class="settings-panel pictograph-panel"
      class:mobile-hidden={mobileMode !== "pictograph"}
    >
      <header class="panel-header">
        <span class="panel-icon pictograph-icon"
          ><i class="fas fa-image"></i></span
        >
        <h3 class="panel-title">Pictograph</h3>
        <button
          class="help-btn"
          onclick={() => openHelpModal("pictograph")}
          aria-label="Learn about pictograph options"
          type="button"
        >
          <i class="fas fa-info-circle"></i>
        </button>
      </header>

      <!-- Pictograph Preview - Interactive: click elements to toggle -->
      <div class="preview-frame">
        <PictographWithVisibility
          pictographData={examplePictographData}
          forceShowAll={true}
          previewMode={true}
          onToggleTKA={() => togglePicto("tka")}
          onToggleVTG={() => togglePicto("vtg")}
          onToggleElemental={() => togglePicto("elemental")}
          onTogglePositions={() => togglePicto("positions")}
          onToggleReversals={() => togglePicto("reversals")}
          onToggleNonRadial={() => togglePicto("nonRadial")}
          onToggleTurnNumbers={() => togglePicto("turnNumbers")}
        />
      </div>

      <div class="panel-controls">
        <div class="control-group">
          <span class="group-label">Glyphs</span>
          <div class="toggle-grid">
            <button
              class="toggle-btn"
              class:active={tkaGlyphVisible}
              onclick={() => togglePicto("tka")}>TKA</button
            >
            <button
              class="toggle-btn"
              class:active={vtgGlyphVisible}
              onclick={() => togglePicto("vtg")}>VTG</button
            >
            <button
              class="toggle-btn"
              class:active={elementalGlyphVisible}
              onclick={() => togglePicto("elemental")}>Elemental</button
            >
            <button
              class="toggle-btn"
              class:active={positionsGlyphVisible}
              onclick={() => togglePicto("positions")}>Positions</button
            >
          </div>
        </div>

        <div class="control-group">
          <span class="group-label">Details</span>
          <div class="toggle-grid">
            <button
              class="toggle-btn"
              class:active={reversalIndicatorsVisible}
              onclick={() => togglePicto("reversals")}>Reversals</button
            >
            <button
              class="toggle-btn"
              class:active={turnNumbersVisible}
              onclick={() => togglePicto("turnNumbers")}>Turn #s</button
            >
            <button
              class="toggle-btn"
              class:active={nonRadialVisible}
              onclick={() => togglePicto("nonRadial")}>Non-Radial</button
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Animation Panel -->
    <section
      class="settings-panel animation-panel"
      class:mobile-hidden={mobileMode !== "animation"}
    >
      <header class="panel-header">
        <span class="panel-icon animation-icon"
          ><i class="fas fa-film"></i></span
        >
        <h3 class="panel-title">Animation</h3>
        <button
          class="help-btn"
          onclick={() => openHelpModal("animation")}
          aria-label="Learn about animation options"
          type="button"
        >
          <i class="fas fa-info-circle"></i>
        </button>
      </header>

      <!-- Animation Preview -->
      <div class="preview-frame animation-preview">
        <AnimatorCanvas
          sequenceData={exampleSequenceData}
          autoPlay={true}
          loop={true}
          showControls={false}
          visibilityManager={animationVisibilityManager}
        />
      </div>

      <div class="panel-controls">
        <div class="control-group">
          <span class="group-label">Canvas</span>
          <div class="toggle-grid">
            <CyclingButton
              value={animGridMode}
              options={["none", "diamond", "box"]}
              onValueChange={handleGridModeChange}
              ariaLabel="Grid mode"
            />
            <button
              class="toggle-btn"
              class:active={animBeatNumbersVisible}
              onclick={() => toggleAnim("beatNumbers")}>Beat #s</button
            >
            <CyclingButton
              value={animTrailStyle}
              options={["off", "subtle", "vivid"]}
              onValueChange={handleTrailStyleChange}
              ariaLabel="Trail style"
            />
          </div>
        </div>

        <div class="control-group">
          <span class="group-label">Overlays</span>
          <div class="toggle-grid">
            <button
              class="toggle-btn"
              class:active={animTkaGlyphVisible}
              onclick={() => toggleAnim("tka")}>TKA Glyph</button
            >
            <button
              class="toggle-btn"
              class:active={animReversalIndicatorsVisible}
              onclick={() => toggleAnim("reversals")}>Reversals</button
            >
            <button
              class="toggle-btn"
              class:active={animTurnNumbersVisible}
              onclick={() => toggleAnim("turnNumbers")}>Turn #s</button
            >
          </div>
        </div>
      </div>
    </section>

    <!-- Image Export Panel -->
    <section
      class="settings-panel image-panel"
      class:mobile-hidden={mobileMode !== "image"}
    >
      <header class="panel-header">
        <span class="panel-icon image-icon"
          ><i class="fas fa-download"></i></span
        >
        <h3 class="panel-title">Image Export</h3>
        <button
          class="help-btn"
          onclick={() => openHelpModal("image")}
          aria-label="Learn about image export options"
          type="button"
        >
          <i class="fas fa-info-circle"></i>
        </button>
      </header>

      <!-- Export Preview -->
      <div class="preview-frame image-preview">
        <ImageExportPreview beatData={examplePictographData} />
      </div>

      <div class="panel-controls">
        <div class="control-group">
          <span class="group-label">Include in Image</span>
          <div class="toggle-grid">
            <button
              class="toggle-btn"
              class:active={imgAddWord}
              onclick={() => toggleImage("word")}>Word</button
            >
            <button
              class="toggle-btn"
              class:active={imgAddBeatNumbers}
              onclick={() => toggleImage("beatNumbers")}>Beat #s</button
            >
            <button
              class="toggle-btn"
              class:active={imgIncludeStartPosition}
              onclick={() => toggleImage("startPosition")}>Start Pos</button
            >
            <button
              class="toggle-btn"
              class:active={imgAddDifficultyLevel}
              onclick={() => toggleImage("difficulty")}>Difficulty</button
            >
            <button
              class="toggle-btn"
              class:active={imgAddUserInfo}
              onclick={() => toggleImage("userInfo")}>User Info</button
            >
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- Educational Help Modal -->
  <VisibilityHelpModal
    bind:isOpen={isHelpModalOpen}
    panel={helpModalPanel}
    onClose={closeHelpModal}
  />
</div>

<style>
  /* ═══════════════════════════════════════════════════════════════════════════
     CONTAINER-QUERY BASED FLUID LAYOUT
     Centers content vertically & horizontally for intentional appearance
     ═══════════════════════════════════════════════════════════════════════════ */
  .visibility-tab {
    /* Establish as container for width queries only (inline-size avoids height collapse) */
    container-type: inline-size;
    container-name: visibility-tab;

    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 16px;
    /* Fluid padding */
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .visibility-tab.visible {
    opacity: 1;
  }

  /* ========================================
     MOBILE SEGMENTED CONTROL
     ======================================== */
  .mobile-segment-control {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    padding: 6px;
    background: var(--theme-card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 16px;
    border: 1px solid var(--theme-stroke);
    width: 100%;
    margin-bottom: 12px;
  }

  .segment-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--min-touch-target);
    padding: 12px 14px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 12px;
    color: var(--theme-text-dim);
    font-size: 14px;
    font-weight: 600;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .segment-btn i {
    font-size: 15px;
    transition: all 150ms ease;
  }

  .segment-btn:hover {
    background: color-mix(in srgb, var(--theme-card-hover-bg) 50%, transparent);
    border-color: var(--theme-stroke);
    color: var(--theme-text);
  }

  .segment-btn.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 25%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 40%,
      transparent
    );
    color: white;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent),
      0 4px 16px
        color-mix(in srgb, var(--theme-accent, #6366f1) 30%, transparent);
  }

  .segment-btn.active i {
    filter: drop-shadow(0 0 6px var(--theme-accent, #6366f1));
  }

  /* Hide segment control on desktop (>=700px container width) */
  @container visibility-tab (min-width: 700px) {
    .mobile-segment-control {
      display: none;
    }
  }

  /* ========================================
     PANELS CONTAINER - Centered, constrained width
     ======================================== */
  .visibility-panels-container {
    display: flex;
    flex-direction: column;
    gap: clamp(12px, 2cqi, 20px);
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    max-height: 100%;
  }

  /* Desktop: Side by side */
  @container visibility-tab (min-width: 700px) {
    .visibility-panels-container {
      flex-direction: row;
      align-items: stretch;
    }
  }

  /* Mobile: Hide inactive panel */
  .settings-panel.mobile-hidden {
    display: none;
  }

  @container visibility-tab (min-width: 700px) {
    .settings-panel.mobile-hidden {
      display: flex;
    }
  }

  /* ========================================
     SETTINGS PANEL - Theme-aware
     ======================================== */
  .settings-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: clamp(14px, 2.5cqi, 20px);
    background: var(--theme-card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--theme-stroke);
    border-radius: 20px;
    flex: 1;
    min-width: 0;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  .settings-panel:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-1px);
  }

  /* ========================================
     PANEL HEADER
     ======================================== */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    width: 100%;
  }

  .panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    font-size: 14px;
    flex-shrink: 0;
    transition: all 0.15s ease;
  }

  .panel-icon.pictograph-icon {
    --icon-color: #818cf8;
    background: color-mix(in srgb, var(--icon-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--icon-color) 35%, transparent);
    color: var(--icon-color);
    box-shadow: 0 0 8px color-mix(in srgb, var(--icon-color) 15%, transparent);
  }

  .panel-icon.animation-icon {
    --icon-color: #f472b6;
    background: color-mix(in srgb, var(--icon-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--icon-color) 35%, transparent);
    color: var(--icon-color);
    box-shadow: 0 0 8px color-mix(in srgb, var(--icon-color) 15%, transparent);
  }

  .panel-icon.image-icon {
    --icon-color: #34d399;
    background: color-mix(in srgb, var(--icon-color) 20%, transparent);
    border: 1px solid color-mix(in srgb, var(--icon-color) 35%, transparent);
    color: var(--icon-color);
    box-shadow: 0 0 8px color-mix(in srgb, var(--icon-color) 15%, transparent);
  }

  .settings-panel:hover .panel-icon {
    box-shadow: 0 0 12px color-mix(in srgb, var(--icon-color) 25%, transparent);
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
    white-space: nowrap;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    flex: 1;
  }

  /* Help Button - Opens educational modal */
  .help-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    margin-left: auto;
    background: color-mix(
      in srgb,
      var(--icon-color, var(--theme-accent)) 15%,
      transparent
    );
    border: 1px solid
      color-mix(
        in srgb,
        var(--icon-color, var(--theme-accent)) 30%,
        transparent
      );
    border-radius: 50%;
    color: var(--icon-color, var(--theme-accent, #6366f1));
    font-size: 20px;
    cursor: pointer;
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .help-btn:hover {
    background: color-mix(
      in srgb,
      var(--icon-color, var(--theme-accent)) 25%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--icon-color, var(--theme-accent)) 45%,
      transparent
    );
    box-shadow: 0 0 12px
      color-mix(
        in srgb,
        var(--icon-color, var(--theme-accent)) 25%,
        transparent
      );
  }

  .help-btn:active {
    transform: scale(0.92);
  }

  /* Inherit panel icon color */
  .pictograph-panel .help-btn {
    --icon-color: #818cf8;
  }
  .animation-panel .help-btn {
    --icon-color: #f472b6;
  }
  .image-panel .help-btn {
    --icon-color: #34d399;
  }

  /* ========================================
     PREVIEW FRAME - Square, centered
     ======================================== */
  .preview-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--theme-panel-bg) 80%, transparent);
    border-radius: 14px;
    border: 1px solid var(--theme-stroke);
    overflow: hidden;
    width: 100%;
    aspect-ratio: 1;
    flex-shrink: 0;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* Scale pictograph SVG to fill the preview */
  .preview-frame :global(.pictograph-with-visibility),
  .preview-frame :global(.pictograph) {
    width: 100% !important;
    height: 100% !important;
  }

  .preview-frame :global(svg.pictograph) {
    width: 100% !important;
    height: 100% !important;
  }

  /* Animation placeholder */
  .animation-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .animation-placeholder i {
    font-size: 36px;
    color: #f472b6;
    opacity: 0.6;
    filter: drop-shadow(0 0 8px rgba(244, 114, 182, 0.3));
  }

  .animation-placeholder span {
    font-size: 13px;
    font-weight: 500;
  }

  /* Image export placeholder */
  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .image-placeholder i {
    font-size: 36px;
    color: #34d399;
    opacity: 0.6;
    filter: drop-shadow(0 0 8px rgba(52, 211, 153, 0.3));
  }

  .image-placeholder span {
    font-size: 13px;
    font-weight: 500;
  }

  /* ========================================
     PANEL CONTROLS - Full width within panel
     ======================================== */
  .panel-controls {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
    width: 100%;
  }

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .group-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    padding-left: 2px;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* ========================================
     TOGGLE GRID & BUTTONS
     ======================================== */
  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  /* 3 columns when panel is wide enough */
  @container visibility-tab (min-width: 900px) {
    .toggle-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: var(--min-touch-target);
    padding: 12px 10px;
    background: color-mix(in srgb, var(--theme-card-bg) 70%, transparent);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    color: var(--theme-text-dim);
    font-size: 13px;
    font-weight: 600;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-btn:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    color: var(--theme-text);
    transform: translateY(-1px);
  }

  .toggle-btn:active {
    transform: translateY(0) scale(0.97);
    transition-duration: 50ms;
  }

  /* Active state - theme accent with glow */
  .toggle-btn.active {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 25%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 45%,
      transparent
    );
    color: white;
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #6366f1) 15%, transparent),
      0 4px 12px
        color-mix(in srgb, var(--theme-accent, #6366f1) 25%, transparent);
  }

  .toggle-btn.active:hover {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 35%,
      transparent
    );
    border-color: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 55%,
      transparent
    );
    box-shadow:
      0 0 0 1px
        color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent),
      0 4px 16px
        color-mix(in srgb, var(--theme-accent, #6366f1) 35%, transparent);
  }

  /* ========================================
     SCROLLBAR
     ======================================== */
  .visibility-tab::-webkit-scrollbar {
    width: 6px;
  }

  .visibility-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .visibility-tab::-webkit-scrollbar-thumb {
    background: color-mix(
      in srgb,
      var(--theme-accent, #6366f1) 20%,
      transparent
    );
    border-radius: 3px;
  }

  /* ========================================
     FOCUS STATES
     ======================================== */
  .toggle-btn:focus-visible,
  .segment-btn:focus-visible,
  .help-btn:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    outline-offset: 2px;
  }

  /* ========================================
     REDUCED MOTION
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .visibility-tab,
    .toggle-btn,
    .segment-btn,
    .help-btn {
      transition: none;
    }
  }

  /* ========================================
     HIGH CONTRAST
     ======================================== */
  @media (prefers-contrast: high) {
    .toggle-btn,
    .segment-btn,
    .settings-panel {
      border-width: 2px;
    }

    .toggle-btn.active {
      border-color: var(--theme-accent, #6366f1);
    }

    .segment-btn.active {
      border-color: var(--theme-accent, #6366f1);
    }

    .toggle-btn:focus-visible,
    .segment-btn:focus-visible {
      outline-width: 3px;
    }
  }
</style>
