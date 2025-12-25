<!--
  VisibilityTab.svelte - Visibility Settings Orchestrator

  Desktop: Side-by-side panels for Pictograph, Animation, and Image settings
  Mobile: Segmented control to switch between modes

  This component coordinates three visibility domains:
  - Pictograph: Glyphs, reversals, turn numbers
  - Animation: Grid mode, trails, overlays
  - Image Export: Elements included in exported images
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

  import MobileSegmentControl from "./visibility/MobileSegmentControl.svelte";
  import type { VisibilityMode } from "./visibility/visibility-types";
  import PictographPanel from "./visibility/PictographPanel.svelte";
  import AnimationPanel from "./visibility/AnimationPanel.svelte";
  import ImagePanel from "./visibility/ImagePanel.svelte";
  import VisibilityHelpModal from "./visibility/VisibilityHelpModal.svelte";

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

  // UI state
  let mobileMode = $state<VisibilityMode>("pictograph");
  let isVisible = $state(false);

  // Help modal state
  let helpModalPanel = $state<"pictograph" | "animation" | "image" | null>(null);
  let isHelpModalOpen = $state(false);

  // Pictograph visibility state
  let tkaGlyphVisible = $state(true);
  let vtgGlyphVisible = $state(false);
  let elementalGlyphVisible = $state(false);
  let positionsGlyphVisible = $state(false);
  let reversalIndicatorsVisible = $state(true);
  let turnNumbersVisible = $state(true);
  let nonRadialVisible = $state(false);

  // Animation visibility state
  let animGridMode = $state<AnimGridMode>("diamond");
  let animBeatNumbersVisible = $state(true);
  let animTrailStyle = $state<TrailStyle>("subtle");
  let animTkaGlyphVisible = $state(true);
  let animReversalIndicatorsVisible = $state(false);
  let animTurnNumbersVisible = $state(true);

  // Image composition state
  let imgAddWord = $state(true);
  let imgAddBeatNumbers = $state(true);
  let imgAddDifficultyLevel = $state(false);
  let imgIncludeStartPosition = $state(true);
  let imgAddUserInfo = $state(false);

  // Haptics
  let hapticService: IHapticFeedbackService | null = null;
  const triggerHaptic = () => hapticService?.trigger("selection");

  // Help modal handlers
  function openHelpModal(panel: "pictograph" | "animation" | "image") {
    triggerHaptic();
    helpModalPanel = panel;
    isHelpModalOpen = true;
  }

  function closeHelpModal() {
    isHelpModalOpen = false;
    setTimeout(() => (helpModalPanel = null), 300);
  }

  // Mobile mode handler
  function handleModeChange(mode: VisibilityMode) {
    triggerHaptic();
    mobileMode = mode;
  }

  // Pictograph toggle handler
  function handlePictographToggle(key: string) {
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
        visibilityManager.setGlyphVisibility("elementalGlyph", elementalGlyphVisible);
        break;
      case "positions":
        positionsGlyphVisible = !positionsGlyphVisible;
        visibilityManager.setGlyphVisibility("positionsGlyph", positionsGlyphVisible);
        break;
      case "reversals":
        reversalIndicatorsVisible = !reversalIndicatorsVisible;
        visibilityManager.setGlyphVisibility("reversalIndicators", reversalIndicatorsVisible);
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

  // Animation toggle handler
  function handleAnimationToggle(key: string) {
    triggerHaptic();
    switch (key) {
      case "beatNumbers":
        animBeatNumbersVisible = !animBeatNumbersVisible;
        animationVisibilityManager.setVisibility("beatNumbers", animBeatNumbersVisible);
        break;
      case "tka":
        animTkaGlyphVisible = !animTkaGlyphVisible;
        animationVisibilityManager.setVisibility("tkaGlyph", animTkaGlyphVisible);
        break;
      case "reversals":
        animReversalIndicatorsVisible = !animReversalIndicatorsVisible;
        animationVisibilityManager.setVisibility("reversalIndicators", animReversalIndicatorsVisible);
        break;
      case "turnNumbers":
        animTurnNumbersVisible = !animTurnNumbersVisible;
        animationVisibilityManager.setVisibility("turnNumbers", animTurnNumbersVisible);
        break;
    }
  }

  // Animation cycling handlers
  function handleGridModeChange(newMode: string) {
    triggerHaptic();
    animationVisibilityManager.setGridMode(newMode as AnimGridMode);
  }

  function handleTrailStyleChange(newStyle: string) {
    triggerHaptic();
    animationVisibilityManager.setTrailStyle(newStyle as TrailStyle);
  }

  // Image toggle handler
  function handleImageToggle(key: string) {
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
        imageCompositionManager.setIncludeStartPosition(imgIncludeStartPosition);
        break;
      case "userInfo":
        imgAddUserInfo = !imgAddUserInfo;
        imageCompositionManager.setAddUserInfo(imgAddUserInfo);
        break;
    }
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);

    // Load initial pictograph visibility
    tkaGlyphVisible = visibilityManager.getRawGlyphVisibility("tkaGlyph");
    vtgGlyphVisible = visibilityManager.getRawGlyphVisibility("vtgGlyph");
    elementalGlyphVisible = visibilityManager.getRawGlyphVisibility("elementalGlyph");
    positionsGlyphVisible = visibilityManager.getRawGlyphVisibility("positionsGlyph");
    reversalIndicatorsVisible = visibilityManager.getRawGlyphVisibility("reversalIndicators");
    turnNumbersVisible = visibilityManager.getRawGlyphVisibility("turnNumbers");
    nonRadialVisible = visibilityManager.getNonRadialVisibility();

    // Load initial animation visibility
    animGridMode = animationVisibilityManager.getGridMode();
    animBeatNumbersVisible = animationVisibilityManager.getVisibility("beatNumbers");
    animTrailStyle = animationVisibilityManager.getTrailStyle();
    animTkaGlyphVisible = animationVisibilityManager.getVisibility("tkaGlyph");
    animReversalIndicatorsVisible = animationVisibilityManager.getVisibility("reversalIndicators");
    animTurnNumbersVisible = animationVisibilityManager.getVisibility("turnNumbers");

    // Load initial image composition
    imgAddWord = imageCompositionManager.addWord;
    imgAddBeatNumbers = imageCompositionManager.addBeatNumbers;
    imgAddDifficultyLevel = imageCompositionManager.addDifficultyLevel;
    imgIncludeStartPosition = imageCompositionManager.includeStartPosition;
    imgAddUserInfo = imageCompositionManager.addUserInfo;

    // Observers for external changes
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
      animGridMode = animationVisibilityManager.getGridMode();
      animBeatNumbersVisible = animationVisibilityManager.getVisibility("beatNumbers");
      animTrailStyle = animationVisibilityManager.getTrailStyle();
      animTkaGlyphVisible = animationVisibilityManager.getVisibility("tkaGlyph");
      animReversalIndicatorsVisible = animationVisibilityManager.getVisibility("reversalIndicators");
      animTurnNumbersVisible = animationVisibilityManager.getVisibility("turnNumbers");
    };

    const imageObserver = () => {
      imgAddWord = imageCompositionManager.addWord;
      imgAddBeatNumbers = imageCompositionManager.addBeatNumbers;
      imgAddDifficultyLevel = imageCompositionManager.addDifficultyLevel;
      imgIncludeStartPosition = imageCompositionManager.includeStartPosition;
      imgAddUserInfo = imageCompositionManager.addUserInfo;
    };

    visibilityManager.registerObserver(pictographObserver, ["all"]);
    animationVisibilityManager.registerObserver(animationObserver);
    imageCompositionManager.registerObserver(imageObserver);

    // Entry animation
    setTimeout(() => (isVisible = true), 30);

    return () => {
      visibilityManager.unregisterObserver(pictographObserver);
      animationVisibilityManager.unregisterObserver(animationObserver);
      imageCompositionManager.unregisterObserver(imageObserver);
    };
  });
</script>

<div class="visibility-tab" class:visible={isVisible}>
  <!-- Mobile: Segmented Control (hidden on desktop via container query) -->
  <div class="mobile-only">
    <MobileSegmentControl currentMode={mobileMode} onModeChange={handleModeChange} />
  </div>

  <!-- Panels Container -->
  <div class="visibility-panels-container">
    <PictographPanel
      {tkaGlyphVisible}
      {vtgGlyphVisible}
      {elementalGlyphVisible}
      {positionsGlyphVisible}
      {reversalIndicatorsVisible}
      {turnNumbersVisible}
      {nonRadialVisible}
      onToggle={handlePictographToggle}
      onOpenHelp={() => openHelpModal("pictograph")}
      isMobileHidden={mobileMode !== "pictograph"}
    />

    <AnimationPanel
      gridMode={animGridMode}
      beatNumbersVisible={animBeatNumbersVisible}
      trailStyle={animTrailStyle}
      tkaGlyphVisible={animTkaGlyphVisible}
      reversalIndicatorsVisible={animReversalIndicatorsVisible}
      turnNumbersVisible={animTurnNumbersVisible}
      onToggle={handleAnimationToggle}
      onGridModeChange={handleGridModeChange}
      onTrailStyleChange={handleTrailStyleChange}
      onOpenHelp={() => openHelpModal("animation")}
      isMobileHidden={mobileMode !== "animation"}
    />

    <ImagePanel
      addWord={imgAddWord}
      addBeatNumbers={imgAddBeatNumbers}
      addDifficultyLevel={imgAddDifficultyLevel}
      includeStartPosition={imgIncludeStartPosition}
      addUserInfo={imgAddUserInfo}
      onToggle={handleImageToggle}
      onOpenHelp={() => openHelpModal("image")}
      isMobileHidden={mobileMode !== "image"}
    />
  </div>

  <!-- Help Modal -->
  <VisibilityHelpModal
    bind:isOpen={isHelpModalOpen}
    panel={helpModalPanel}
    onClose={closeHelpModal}
  />
</div>

<style>
  .visibility-tab {
    container-type: inline-size;
    container-name: visibility-tab;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    gap: 16px;
    opacity: 0;
    transition: opacity 200ms ease;
  }

  .visibility-tab.visible {
    opacity: 1;
  }

  .mobile-only {
    width: 100%;
  }

  /* Hide mobile segment control on desktop */
  @container visibility-tab (min-width: 700px) {
    .mobile-only {
      display: none;
    }
  }

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

    /* Show all panels on desktop regardless of mobile mode */
    .visibility-panels-container :global(.mobile-hidden) {
      display: flex !important;
    }
  }

  /* Scrollbar styling */
  .visibility-tab::-webkit-scrollbar {
    width: 6px;
  }

  .visibility-tab::-webkit-scrollbar-track {
    background: transparent;
  }

  .visibility-tab::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--theme-accent, #6366f1) 20%, transparent);
    border-radius: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .visibility-tab {
      transition: none;
    }
  }
</style>
