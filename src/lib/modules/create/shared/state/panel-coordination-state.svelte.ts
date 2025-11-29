/**
 * Create Module Panel Coordination State Factory
 *
 * Manages panel state for CreateModule's construction interface using Svelte 5 runes pattern.
 * Coordinates Edit Panel, Animation Panel, and Tool Panel interactions.
 *
 * **PANEL MUTUAL EXCLUSIVITY RULES:**
 * - Only ONE modal/slide panel can be open at a time
 * - Opening any panel automatically closes all other panels
 * - Panels: Edit, Animation, Share, Filter, CAP, CreationMethod
 *
 * Domain: Create module - Panel State Management for Sequence Construction
 * Extracted from CreateModule.svelte monolith to follow runes state management pattern.
 */

import type { BeatData } from "../domain/models/BeatData";
import type { CAPType } from "../../generate/circular/domain/models/circular-models";
import type { CAPComponent } from "../../generate/shared/domain/models";
import type { PictographData } from "../../../../shared/pictograph/shared/domain/models/PictographData";

export interface PanelCoordinationState {
  // Edit Panel State
  get isEditPanelOpen(): boolean;
  get editPanelBeatIndex(): number | null;
  get editPanelBeatData(): BeatData | null;
  get editPanelBeatsData(): BeatData[];

  openEditPanel(beatIndex: number, beatData: BeatData): void;
  openBatchEditPanel(beatsData: BeatData[]): void;
  closeEditPanel(): void;

  // Animation Panel State
  get isAnimationPanelOpen(): boolean;
  set isAnimationPanelOpen(value: boolean);
  get isAnimating(): boolean;

  openAnimationPanel(): void;
  closeAnimationPanel(): void;
  setAnimating(animating: boolean): void;

  // Sequence Transform Animation State
  get shouldOrbitAroundCenter(): boolean;

  triggerOrbitAnimation(): void;

  // Share Panel State
  get isSharePanelOpen(): boolean;

  openSharePanel(): void;
  closeSharePanel(): void;

  // Filter Panel State
  get isFilterPanelOpen(): boolean;

  openFilterPanel(): void;
  closeFilterPanel(): void;

  // Sequence Actions Panel State
  get isSequenceActionsPanelOpen(): boolean;

  openSequenceActionsPanel(): void;
  closeSequenceActionsPanel(): void;

  // Tool Panel Dimensions (for sizing other panels)
  get toolPanelHeight(): number;
  setToolPanelHeight(height: number): void;

  get toolPanelWidth(): number;
  setToolPanelWidth(width: number): void;

  // Button Panel Height (for accurate slide panel positioning)
  get buttonPanelHeight(): number;
  setButtonPanelHeight(height: number): void;

  // Navigation bar height (responsive to bottom nav safe areas)
  get navigationBarHeight(): number;
  setNavigationBarHeight(height: number): void;

  // Combined height for slide panels (tool + button)
  get combinedPanelHeight(): number;

  // Practice Mode
  get practiceBeatIndex(): number | null;
  setPracticeBeatIndex(index: number | null): void;

  // CAP Panel State
  get isCAPPanelOpen(): boolean;
  get capSelectedComponents(): Set<CAPComponent> | null;
  get capCurrentType(): CAPType | null;
  get capOnChange(): ((capType: CAPType) => void) | null;

  openCAPPanel(
    currentType: CAPType,
    selectedComponents: Set<CAPComponent>,
    onChange: (capType: CAPType) => void
  ): void;
  closeCAPPanel(): void;

  // Creation Method Panel State
  get isCreationMethodPanelOpen(): boolean;

  openCreationMethodPanel(): void;
  closeCreationMethodPanel(): void;

  // Start Position Panel State
  get isStartPositionPanelOpen(): boolean;
  get startPositionCurrentPosition(): PictographData | null;
  get startPositionOnChange(): ((position: PictographData) => void) | null;

  openStartPositionPanel(
    currentPosition: PictographData | null,
    onChange: (position: PictographData) => void
  ): void;
  closeStartPositionPanel(): void;

  // Derived: Any Panel Open (for UI hiding coordination)
  get isAnyPanelOpen(): boolean;
}

export function createPanelCoordinationState(): PanelCoordinationState {
  // Edit panel state
  let isEditPanelOpen = $state(false);
  let editPanelBeatIndex = $state<number | null>(null);
  let editPanelBeatData = $state<BeatData | null>(null);
  let editPanelBeatsData = $state<BeatData[]>([]);

  // Animation panel state
  let isAnimationPanelOpen = $state(false);
  let isAnimating = $state(false);

  // Sequence transform animation state
  let shouldOrbitAroundCenter = $state(false);
  let orbitAnimationTimeout: ReturnType<typeof setTimeout> | null = null;

  // Share panel state
  let isSharePanelOpen = $state(false);

  // Filter panel state
  let isFilterPanelOpen = $state(false);

  // Sequence Actions panel state
  let isSequenceActionsPanelOpen = $state(false);

  // Tool panel dimensions tracking
  let toolPanelHeight = $state(0);
  let toolPanelWidth = $state(0);

  // Button panel height tracking
  let buttonPanelHeight = $state(0);

  // Navigation bar height tracking (default to 64px)
  let navigationBarHeight = $state(64);

  // Practice mode
  let practiceBeatIndex = $state<number | null>(null);

  // CAP panel state
  let isCAPPanelOpen = $state(false);
  let capSelectedComponents = $state<Set<CAPComponent> | null>(null);
  let capCurrentType = $state<CAPType | null>(null);
  let capOnChange = $state<((capType: CAPType) => void) | null>(null);

  // Creation method panel state
  let isCreationMethodPanelOpen = $state(false);

  // Start position panel state
  let isStartPositionPanelOpen = $state(false);
  let startPositionCurrentPosition = $state<PictographData | null>(null);
  let startPositionOnChange = $state<((position: PictographData) => void) | null>(null);

  /**
   * CRITICAL: Close all panels to enforce mutual exclusivity
   * This ensures only ONE panel is open at a time, preventing state conflicts
   */
  function closeAllPanels() {
    // Close all modal/slide panels
    isEditPanelOpen = false;
    editPanelBeatIndex = null;
    editPanelBeatData = null;
    editPanelBeatsData = [];

    isAnimationPanelOpen = false;
    isAnimating = false;

    isSharePanelOpen = false;
    isFilterPanelOpen = false;
    isSequenceActionsPanelOpen = false;

    isCAPPanelOpen = false;
    capSelectedComponents = null;
    capCurrentType = null;
    capOnChange = null;

    isCreationMethodPanelOpen = false;

    isStartPositionPanelOpen = false;
    startPositionCurrentPosition = null;
    startPositionOnChange = null;
  }

  return {
    // Edit Panel Getters
    get isEditPanelOpen() {
      return isEditPanelOpen;
    },
    get editPanelBeatIndex() {
      return editPanelBeatIndex;
    },
    get editPanelBeatData() {
      return editPanelBeatData;
    },
    get editPanelBeatsData() {
      return editPanelBeatsData;
    },

    openEditPanel(beatIndex: number, beatData: BeatData) {
      closeAllPanels();
      editPanelBeatIndex = beatIndex;
      editPanelBeatData = beatData;
      editPanelBeatsData = [];
      isEditPanelOpen = true;
    },

    openBatchEditPanel(beatsData: BeatData[]) {
      closeAllPanels();
      editPanelBeatsData = beatsData;
      editPanelBeatIndex = null;
      editPanelBeatData = null;
      isEditPanelOpen = true;
    },

    closeEditPanel() {
      isEditPanelOpen = false;
      editPanelBeatIndex = null;
      editPanelBeatData = null;
      editPanelBeatsData = [];
    },

    // Animation Panel Getters
    get isAnimationPanelOpen() {
      return isAnimationPanelOpen;
    },
    set isAnimationPanelOpen(value: boolean) {
      isAnimationPanelOpen = value;
    },
    get isAnimating() {
      return isAnimating;
    },

    openAnimationPanel() {
      closeAllPanels();
      isAnimationPanelOpen = true;
    },

    closeAnimationPanel() {
      isAnimationPanelOpen = false;
    },

    setAnimating(animating: boolean) {
      isAnimating = animating;
    },

    // Sequence Transform Animation Getters
    get shouldOrbitAroundCenter() {
      return shouldOrbitAroundCenter;
    },

    triggerOrbitAnimation() {
      // Clear any existing timeout
      if (orbitAnimationTimeout) {
        clearTimeout(orbitAnimationTimeout);
      }

      // Set flag to true to enable arc-based prop animation
      shouldOrbitAroundCenter = true;

      // Auto-reset after animation completes (200ms to match grid rotation)
      orbitAnimationTimeout = setTimeout(() => {
        shouldOrbitAroundCenter = false;
      }, 200);
    },

    // Share Panel Getters
    get isSharePanelOpen() {
      return isSharePanelOpen;
    },

    openSharePanel() {
      closeAllPanels();
      isSharePanelOpen = true;
    },

    closeSharePanel() {
      isSharePanelOpen = false;
    },

    // Filter Panel Getters
    get isFilterPanelOpen() {
      return isFilterPanelOpen;
    },

    openFilterPanel() {
      closeAllPanels();
      isFilterPanelOpen = true;
    },

    closeFilterPanel() {
      isFilterPanelOpen = false;
    },

    // Sequence Actions Panel Getters
    get isSequenceActionsPanelOpen() {
      return isSequenceActionsPanelOpen;
    },

    openSequenceActionsPanel() {
      closeAllPanels();
      isSequenceActionsPanelOpen = true;
    },

    closeSequenceActionsPanel() {
      isSequenceActionsPanelOpen = false;
    },

    // Tool Panel Dimensions
    get toolPanelHeight() {
      return toolPanelHeight;
    },

    setToolPanelHeight(height: number) {
      toolPanelHeight = height;
    },

    get toolPanelWidth() {
      return toolPanelWidth;
    },

    setToolPanelWidth(width: number) {
      toolPanelWidth = width;
    },

    // Button Panel Height
    get buttonPanelHeight() {
      return buttonPanelHeight;
    },

    setButtonPanelHeight(height: number) {
      buttonPanelHeight = height;
    },

    // Navigation Bar Height
    get navigationBarHeight() {
      return navigationBarHeight;
    },

    setNavigationBarHeight(height: number) {
      navigationBarHeight = height > 0 ? height : 64;
    },

    // Combined Height (navigation bar + tool + button panels)
    // Navigation bar is 64px (min-height from PrimaryNavigation.svelte)
    get combinedPanelHeight() {
      return navigationBarHeight + toolPanelHeight + buttonPanelHeight;
    },

    // Practice Mode
    get practiceBeatIndex() {
      return practiceBeatIndex;
    },

    setPracticeBeatIndex(index: number | null) {
      practiceBeatIndex = index;
    },

    // CAP Panel Getters
    get isCAPPanelOpen() {
      return isCAPPanelOpen;
    },
    get capSelectedComponents() {
      return capSelectedComponents;
    },
    get capCurrentType() {
      return capCurrentType;
    },
    get capOnChange() {
      return capOnChange;
    },

    openCAPPanel(
      currentType: CAPType,
      selectedComponents: Set<CAPComponent>,
      onChange: (capType: CAPType) => void
    ) {
      closeAllPanels();
      capCurrentType = currentType;
      capSelectedComponents = selectedComponents;
      capOnChange = onChange;
      isCAPPanelOpen = true;
    },

    closeCAPPanel() {
      isCAPPanelOpen = false;
      capCurrentType = null;
      capSelectedComponents = null;
      capOnChange = null;
    },

    // Creation Method Panel Getters
    get isCreationMethodPanelOpen() {
      return isCreationMethodPanelOpen;
    },

    openCreationMethodPanel() {
      closeAllPanels();
      isCreationMethodPanelOpen = true;
    },

    closeCreationMethodPanel() {
      isCreationMethodPanelOpen = false;
    },

    // Start Position Panel Getters
    get isStartPositionPanelOpen() {
      return isStartPositionPanelOpen;
    },
    get startPositionCurrentPosition() {
      return startPositionCurrentPosition;
    },
    get startPositionOnChange() {
      return startPositionOnChange;
    },

    openStartPositionPanel(
      currentPosition: PictographData | null,
      onChange: (position: PictographData) => void
    ) {
      closeAllPanels();
      startPositionCurrentPosition = currentPosition;
      startPositionOnChange = onChange;
      isStartPositionPanelOpen = true;
    },

    closeStartPositionPanel() {
      isStartPositionPanelOpen = false;
      startPositionCurrentPosition = null;
      startPositionOnChange = null;
    },

    // Derived: Check if any modal/slide panel is open
    // NOTE: Creation Method Panel is NOT included here because it should not hide navigation tabs
    get isAnyPanelOpen() {
      return (
        isEditPanelOpen ||
        isAnimationPanelOpen ||
        isSharePanelOpen ||
        isFilterPanelOpen ||
        isSequenceActionsPanelOpen ||
        isCAPPanelOpen ||
        isStartPositionPanelOpen
      );
    },
  };
}
