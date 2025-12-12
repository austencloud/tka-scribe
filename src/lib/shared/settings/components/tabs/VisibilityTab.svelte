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
  import { getAnimationVisibilityManager } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";
  import { getImageCompositionManager } from "$lib/shared/share/state/image-composition-state.svelte";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { Letter } from "$lib/shared/foundation/domain/models/Letter";
  import { GridLocation, GridMode, GridPosition } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
  import PictographWithVisibility from "$lib/shared/pictograph/shared/components/PictographWithVisibility.svelte";
  import { createMotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";
  import { MotionType, RotationDirection, Orientation, MotionColor } from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";

  interface Props {
    currentSettings: unknown;
    onSettingUpdate: (event: { key: string; value: unknown }) => void;
  }

  let { currentSettings: _currentSettings, onSettingUpdate: _onSettingUpdate }: Props = $props();

  // State managers
  const visibilityManager = getVisibilityStateManager();
  const animationVisibilityManager = getAnimationVisibilityManager();
  const imageCompositionManager = getImageCompositionManager();

  // Mobile mode selection (only used on small screens)
  let mobileMode = $state<'pictograph' | 'animation' | 'image'>('pictograph');
  let isVisible = $state(false);

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
  let animGridVisible = $state(true);
  let animBeatNumbersVisible = $state(true);
  let animTrailsVisible = $state(true);
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

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Load pictograph visibility
    tkaGlyphVisible = visibilityManager.getRawGlyphVisibility("tkaGlyph");
    vtgGlyphVisible = visibilityManager.getRawGlyphVisibility("vtgGlyph");
    elementalGlyphVisible = visibilityManager.getRawGlyphVisibility("elementalGlyph");
    positionsGlyphVisible = visibilityManager.getRawGlyphVisibility("positionsGlyph");
    reversalIndicatorsVisible = visibilityManager.getRawGlyphVisibility("reversalIndicators");
    turnNumbersVisible = visibilityManager.getRawGlyphVisibility("turnNumbers");
    nonRadialVisible = visibilityManager.getNonRadialVisibility();

    // Load animation visibility
    animGridVisible = animationVisibilityManager.getVisibility("grid");
    animBeatNumbersVisible = animationVisibilityManager.getVisibility("beatNumbers");
    animTrailsVisible = animationVisibilityManager.getVisibility("trails");
    animTkaGlyphVisible = animationVisibilityManager.getVisibility("tkaGlyph");
    animReversalIndicatorsVisible = animationVisibilityManager.getVisibility("reversalIndicators");
    animTurnNumbersVisible = animationVisibilityManager.getVisibility("turnNumbers");

    // Load image composition settings
    imgAddWord = imageCompositionManager.addWord;
    imgAddBeatNumbers = imageCompositionManager.addBeatNumbers;
    imgAddDifficultyLevel = imageCompositionManager.addDifficultyLevel;
    imgIncludeStartPosition = imageCompositionManager.includeStartPosition;
    imgAddUserInfo = imageCompositionManager.addUserInfo;

    const pictographObserver = () => {
      tkaGlyphVisible = visibilityManager.getRawGlyphVisibility("tkaGlyph");
      vtgGlyphVisible = visibilityManager.getRawGlyphVisibility("vtgGlyph");
      elementalGlyphVisible = visibilityManager.getRawGlyphVisibility("elementalGlyph");
      positionsGlyphVisible = visibilityManager.getRawGlyphVisibility("positionsGlyph");
      reversalIndicatorsVisible = visibilityManager.getRawGlyphVisibility("reversalIndicators");
      turnNumbersVisible = visibilityManager.getRawGlyphVisibility("turnNumbers");
      nonRadialVisible = visibilityManager.getNonRadialVisibility();
    };

    const animationObserver = () => {
      animGridVisible = animationVisibilityManager.getVisibility("grid");
      animBeatNumbersVisible = animationVisibilityManager.getVisibility("beatNumbers");
      animTrailsVisible = animationVisibilityManager.getVisibility("trails");
      animTkaGlyphVisible = animationVisibilityManager.getVisibility("tkaGlyph");
      animReversalIndicatorsVisible = animationVisibilityManager.getVisibility("reversalIndicators");
      animTurnNumbersVisible = animationVisibilityManager.getVisibility("turnNumbers");
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
    setTimeout(() => isVisible = true, 30);

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
      case 'tka': tkaGlyphVisible = !tkaGlyphVisible; visibilityManager.setGlyphVisibility("tkaGlyph", tkaGlyphVisible); break;
      case 'vtg': vtgGlyphVisible = !vtgGlyphVisible; visibilityManager.setGlyphVisibility("vtgGlyph", vtgGlyphVisible); break;
      case 'elemental': elementalGlyphVisible = !elementalGlyphVisible; visibilityManager.setGlyphVisibility("elementalGlyph", elementalGlyphVisible); break;
      case 'positions': positionsGlyphVisible = !positionsGlyphVisible; visibilityManager.setGlyphVisibility("positionsGlyph", positionsGlyphVisible); break;
      case 'reversals': reversalIndicatorsVisible = !reversalIndicatorsVisible; visibilityManager.setGlyphVisibility("reversalIndicators", reversalIndicatorsVisible); break;
      case 'turnNumbers': turnNumbersVisible = !turnNumbersVisible; visibilityManager.setGlyphVisibility("turnNumbers", turnNumbersVisible); break;
      case 'nonRadial': nonRadialVisible = !nonRadialVisible; visibilityManager.setNonRadialVisibility(nonRadialVisible); break;
    }
  }

  // Toggle functions - Animation
  function toggleAnim(key: string) {
    triggerHaptic();
    switch (key) {
      case 'grid': animGridVisible = !animGridVisible; animationVisibilityManager.setVisibility("grid", animGridVisible); break;
      case 'beatNumbers': animBeatNumbersVisible = !animBeatNumbersVisible; animationVisibilityManager.setVisibility("beatNumbers", animBeatNumbersVisible); break;
      case 'trails': animTrailsVisible = !animTrailsVisible; animationVisibilityManager.setVisibility("trails", animTrailsVisible); break;
      case 'tka': animTkaGlyphVisible = !animTkaGlyphVisible; animationVisibilityManager.setVisibility("tkaGlyph", animTkaGlyphVisible); break;
      case 'reversals': animReversalIndicatorsVisible = !animReversalIndicatorsVisible; animationVisibilityManager.setVisibility("reversalIndicators", animReversalIndicatorsVisible); break;
      case 'turnNumbers': animTurnNumbersVisible = !animTurnNumbersVisible; animationVisibilityManager.setVisibility("turnNumbers", animTurnNumbersVisible); break;
    }
  }

  // Toggle functions - Image Composition
  function toggleImage(key: string) {
    triggerHaptic();
    switch (key) {
      case 'word': imgAddWord = !imgAddWord; imageCompositionManager.setAddWord(imgAddWord); break;
      case 'beatNumbers': imgAddBeatNumbers = !imgAddBeatNumbers; imageCompositionManager.setAddBeatNumbers(imgAddBeatNumbers); break;
      case 'difficulty': imgAddDifficultyLevel = !imgAddDifficultyLevel; imageCompositionManager.setAddDifficultyLevel(imgAddDifficultyLevel); break;
      case 'startPosition': imgIncludeStartPosition = !imgIncludeStartPosition; imageCompositionManager.setIncludeStartPosition(imgIncludeStartPosition); break;
      case 'userInfo': imgAddUserInfo = !imgAddUserInfo; imageCompositionManager.setAddUserInfo(imgAddUserInfo); break;
    }
  }

  function setMobileMode(mode: 'pictograph' | 'animation' | 'image') {
    triggerHaptic();
    mobileMode = mode;
  }
</script>

<div class="visibility-tab" class:visible={isVisible}>
  <!-- Mobile: Segmented Control (hidden on desktop) -->
  <div class="mobile-segment-control">
    <button
      class="segment-btn"
      class:active={mobileMode === 'pictograph'}
      onclick={() => setMobileMode('pictograph')}
    >
      <i class="fas fa-image"></i>
      <span>Pictograph</span>
    </button>
    <button
      class="segment-btn"
      class:active={mobileMode === 'animation'}
      onclick={() => setMobileMode('animation')}
    >
      <i class="fas fa-film"></i>
      <span>Animation</span>
    </button>
    <button
      class="segment-btn"
      class:active={mobileMode === 'image'}
      onclick={() => setMobileMode('image')}
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
      class:mobile-hidden={mobileMode !== 'pictograph'}
    >
      <header class="panel-header">
        <span class="panel-icon pictograph-icon"><i class="fas fa-image"></i></span>
        <h3 class="panel-title">Pictograph</h3>
      </header>

      <!-- Pictograph Preview - Interactive: click elements to toggle -->
      <div class="preview-frame">
        <PictographWithVisibility
          pictographData={examplePictographData}
          forceShowAll={true}
          previewMode={true}
          onToggleTKA={() => togglePicto('tka')}
          onToggleVTG={() => togglePicto('vtg')}
          onToggleElemental={() => togglePicto('elemental')}
          onTogglePositions={() => togglePicto('positions')}
          onToggleReversals={() => togglePicto('reversals')}
          onToggleNonRadial={() => togglePicto('nonRadial')}
        />
      </div>

      <div class="panel-controls">
        <div class="control-group">
          <span class="group-label">Glyphs</span>
          <div class="toggle-grid">
            <button class="toggle-btn" class:active={tkaGlyphVisible} onclick={() => togglePicto('tka')}>TKA</button>
            <button class="toggle-btn" class:active={vtgGlyphVisible} onclick={() => togglePicto('vtg')}>VTG</button>
            <button class="toggle-btn" class:active={elementalGlyphVisible} onclick={() => togglePicto('elemental')}>Elemental</button>
            <button class="toggle-btn" class:active={positionsGlyphVisible} onclick={() => togglePicto('positions')}>Positions</button>
          </div>
        </div>

        <div class="control-group">
          <span class="group-label">Details</span>
          <div class="toggle-grid">
            <button class="toggle-btn" class:active={reversalIndicatorsVisible} onclick={() => togglePicto('reversals')}>Reversals</button>
            <button class="toggle-btn" class:active={turnNumbersVisible} onclick={() => togglePicto('turnNumbers')}>Turn #s</button>
            <button class="toggle-btn" class:active={nonRadialVisible} onclick={() => togglePicto('nonRadial')}>Non-Radial</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Animation Panel -->
    <section
      class="settings-panel animation-panel"
      class:mobile-hidden={mobileMode !== 'animation'}
    >
      <header class="panel-header">
        <span class="panel-icon animation-icon"><i class="fas fa-film"></i></span>
        <h3 class="panel-title">Animation</h3>
      </header>

      <!-- Animation Preview -->
      <div class="preview-frame animation-preview">
        <div class="animation-placeholder">
          <i class="fas fa-play-circle"></i>
          <span>Animation Preview</span>
        </div>
      </div>

      <div class="panel-controls">
        <div class="control-group">
          <span class="group-label">Canvas</span>
          <div class="toggle-grid">
            <button class="toggle-btn" class:active={animGridVisible} onclick={() => toggleAnim('grid')}>Grid</button>
            <button class="toggle-btn" class:active={animBeatNumbersVisible} onclick={() => toggleAnim('beatNumbers')}>Beat #s</button>
            <button class="toggle-btn" class:active={animTrailsVisible} onclick={() => toggleAnim('trails')}>Trails</button>
          </div>
        </div>

        <div class="control-group">
          <span class="group-label">Overlays</span>
          <div class="toggle-grid">
            <button class="toggle-btn" class:active={animTkaGlyphVisible} onclick={() => toggleAnim('tka')}>TKA Glyph</button>
            <button class="toggle-btn" class:active={animReversalIndicatorsVisible} onclick={() => toggleAnim('reversals')}>Reversals</button>
            <button class="toggle-btn" class:active={animTurnNumbersVisible} onclick={() => toggleAnim('turnNumbers')}>Turn #s</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Image Export Panel -->
    <section
      class="settings-panel image-panel"
      class:mobile-hidden={mobileMode !== 'image'}
    >
      <header class="panel-header">
        <span class="panel-icon image-icon"><i class="fas fa-download"></i></span>
        <h3 class="panel-title">Image Export</h3>
      </header>

      <!-- Export Preview -->
      <div class="preview-frame image-preview">
        <div class="image-placeholder">
          <i class="fas fa-file-image"></i>
          <span>Export Preview</span>
        </div>
      </div>

      <div class="panel-controls">
        <div class="control-group">
          <span class="group-label">Include in Image</span>
          <div class="toggle-grid">
            <button class="toggle-btn" class:active={imgAddWord} onclick={() => toggleImage('word')}>Word</button>
            <button class="toggle-btn" class:active={imgAddBeatNumbers} onclick={() => toggleImage('beatNumbers')}>Beat #s</button>
            <button class="toggle-btn" class:active={imgIncludeStartPosition} onclick={() => toggleImage('startPosition')}>Start Pos</button>
            <button class="toggle-btn" class:active={imgAddDifficultyLevel} onclick={() => toggleImage('difficulty')}>Difficulty</button>
            <button class="toggle-btn" class:active={imgAddUserInfo} onclick={() => toggleImage('userInfo')}>User Info</button>
          </div>
        </div>
      </div>
    </section>
  </div>
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
    padding: 4px;
    background: var(--theme-card-bg, rgba(20, 22, 35, 0.8));
    border-radius: 14px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    width: 100%;
    margin-bottom: 12px;
  }

  .segment-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 52px;
    padding: 12px 14px;
    background: transparent;
    border: none;
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 14px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .segment-btn i {
    font-size: 15px;
  }

  .segment-btn:hover {
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .segment-btn.active {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 30%, transparent);
    color: var(--theme-text, #e0e7ff);
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
    max-height: 100%;
  }
  
  /* Desktop: Side by side with wider constraint */
  @container visibility-tab (min-width: 700px) {
    .visibility-panels-container {
      flex-direction: row;
      max-width: 1200px;
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
     SETTINGS PANEL - Centered content
     ======================================== */
  .settings-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: clamp(12px, 2cqi, 20px);
    background: var(--theme-card-bg, rgba(25, 28, 40, 0.6));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    backdrop-filter: blur(8px);
    flex: 1;
    min-width: 0;
  }

  /* ========================================
     PANEL HEADER
     ======================================== */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    align-self: flex-start;
  }

  .panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 8px;
    font-size: 13px;
    flex-shrink: 0;
  }

  .panel-icon.pictograph-icon {
    background: rgba(99, 102, 241, 0.2);
    color: #818cf8;
  }

  .panel-icon.animation-icon {
    background: rgba(236, 72, 153, 0.2);
    color: #f472b6;
  }

  .panel-icon.image-icon {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    margin: 0;
    white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* ========================================
     PREVIEW FRAME - Square, centered
     ======================================== */
  .preview-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    overflow: hidden;
    /* Square aspect ratio, scales with container width */
    width: 100%;
    aspect-ratio: 1;
    flex-shrink: 0;
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
    gap: 8px;
    color: rgba(255, 255, 255, 0.4);
  }

  .animation-placeholder i {
    font-size: 32px;
    color: rgba(236, 72, 153, 0.5);
  }

  .animation-placeholder span {
    font-size: 12px;
    font-weight: 500;
  }

  /* Image export placeholder */
  .image-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.4);
  }

  .image-placeholder i {
    font-size: 32px;
    color: rgba(16, 185, 129, 0.5);
  }

  .image-placeholder span {
    font-size: 12px;
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
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* ========================================
     TOGGLE GRID & BUTTONS
     ======================================== */
  .toggle-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
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
    min-height: 52px;
    padding: 12px 10px;
    background: var(--theme-card-bg, rgba(30, 32, 45, 0.85));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: 12px;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    cursor: pointer;
    transition: all 150ms ease;
    -webkit-tap-highlight-color: transparent;
  }

  .toggle-btn:hover {
    background: var(--theme-card-hover-bg, rgba(45, 48, 65, 0.9));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .toggle-btn:active {
    transform: scale(0.97);
    transition-duration: 50ms;
  }

  /* Active state - theme accent (uses pictograph panel's indigo as default) */
  .toggle-btn.active {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 35%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 50%, transparent);
    color: var(--theme-text, #e0e7ff);
  }

  .toggle-btn.active:hover {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 45%, transparent);
    border-color: color-mix(in srgb, var(--theme-accent, #6366f1) 60%, transparent);
    color: #fff;
  }

  /* Animation panel uses pink accent */
  .animation-panel .toggle-btn.active {
    background: rgba(236, 72, 153, 0.3);
    border-color: rgba(236, 72, 153, 0.5);
    color: #fbcfe8;
  }

  .animation-panel .toggle-btn.active:hover {
    background: rgba(236, 72, 153, 0.4);
    border-color: rgba(236, 72, 153, 0.6);
    color: #fff;
  }

  /* Image panel uses green/emerald accent */
  .image-panel .toggle-btn.active {
    background: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.5);
    color: #a7f3d0;
  }

  .image-panel .toggle-btn.active:hover {
    background: rgba(16, 185, 129, 0.4);
    border-color: rgba(16, 185, 129, 0.6);
    color: #fff;
  }

  /* ========================================
     SCROLLBAR
     ======================================== */
  .visibility-tab::-webkit-scrollbar {
    width: 4px;
  }

  .visibility-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .visibility-tab::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 2px;
  }

  /* ========================================
     FOCUS STATES
     ======================================== */
  .toggle-btn:focus-visible,
  .segment-btn:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.6);
    outline-offset: 2px;
  }

  /* ========================================
     REDUCED MOTION
     ======================================== */
  @media (prefers-reduced-motion: reduce) {
    .visibility-tab,
    .toggle-btn,
    .segment-btn {
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
      border-color: #6366f1;
    }
  }
</style>
