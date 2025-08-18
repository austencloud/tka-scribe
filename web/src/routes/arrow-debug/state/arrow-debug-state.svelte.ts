/**
 * Arrow Debug State (Refactored)
 *
 * Clean, modular state management using extracted services
 * Reduced from 653 lines to ~150 lines by extracting business logic
 */

import type { PictographData } from "$lib/domain";
import { MotionColor } from "$lib/domain";
import type {
  ArrowDebugState,
  ArrowPositioningDebugData,
} from "../types/ArrowDebugTypes";
import { ArrowDebugCalculationService } from "../services/ArrowDebugCalculationService";
import { ArrowDebugDataService } from "../services/ArrowDebugDataService";

export function createArrowDebugState(): ArrowDebugState {
  // Initialize reactive state
  let selectedPictograph = $state<PictographData | null>(null);
  let selectedArrowColor = $state<MotionColor>(MotionColor.BLUE);
  let availablePictographs = $state<PictographData[]>([]);

  let stepByStepMode = $state(true);
  let currentStep = $state(0);
  const maxSteps = $state(5);

  let showCoordinateGrid = $state(true);
  let showHandPoints = $state(true);
  let showLayer2Points = $state(true);
  let showAdjustmentVectors = $state(true);

  let currentDebugData = $state<ArrowPositioningDebugData>(
    createEmptyDebugData()
  );
  let isCalculating = $state(false);
  let autoUpdate = $state(true);
  let expandedSections = $state(
    new Set(["coordinate_system", "positioning_steps"])
  );

  // Service instances
  const calculationService = new ArrowDebugCalculationService();
  const dataService = new ArrowDebugDataService();

  // Computed values
  const currentMotionData = $derived(
    selectedPictograph?.motions?.[selectedArrowColor] || null
  );

  const currentArrowData = $derived(
    selectedPictograph?.arrows?.[selectedArrowColor] || null
  );

  // Auto-update positioning when inputs change
  $effect(() => {
    if (
      autoUpdate &&
      selectedPictograph &&
      currentMotionData &&
      currentArrowData
    ) {
      calculateFullPositioning();
    }
  });

  /**
   * Calculate full positioning with debug tracking
   */
  async function calculateFullPositioning(): Promise<void> {
    if (!selectedPictograph || !currentMotionData || !currentArrowData) {
      return;
    }

    isCalculating = true;

    try {
      currentDebugData = await calculationService.calculateFullPositioning(
        selectedPictograph,
        currentMotionData,
        currentArrowData,
        selectedArrowColor
      );
    } catch (error) {
      currentDebugData.errors.push({
        step: "full_calculation",
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
    } finally {
      isCalculating = false;
    }
  }

  /**
   * Load sample pictographs for testing
   */
  async function loadSamplePictographs(): Promise<void> {
    try {
      availablePictographs = await dataService.loadSamplePictographs();
      if (availablePictographs.length > 0) {
        selectedPictograph = availablePictographs[0];
      }
    } catch (error) {
      console.error("Failed to load sample pictographs:", error);
    }
  }

  /**
   * Toggle debug section expansion
   */
  function toggleSection(section: string): void {
    if (expandedSections.has(section)) {
      expandedSections.delete(section);
    } else {
      expandedSections.add(section);
    }
    // Trigger reactivity
    expandedSections = new Set(expandedSections);
  }

  function createEmptyDebugData(): ArrowPositioningDebugData {
    return {
      pictographData: null,
      motionData: null,
      arrowData: null,
      calculatedLocation: null,
      locationDebugInfo: null,
      initialPosition: null,
      coordinateSystemDebugInfo: null,
      defaultAdjustment: null,
      defaultAdjustmentDebugInfo: null,
      specialAdjustment: null,
      specialAdjustmentDebugInfo: null,
      tupleProcessedAdjustment: null,
      tupleProcessingDebugInfo: null,
      finalPosition: null,
      finalRotation: 0,
      errors: [],
      timing: null,
    };
  }

  // Initialize with sample data
  loadSamplePictographs();

  return {
    // Reactive state getters/setters
    get selectedPictograph() {
      return selectedPictograph;
    },
    set selectedPictograph(value) {
      selectedPictograph = value;
    },

    get selectedArrowColor() {
      return selectedArrowColor;
    },
    set selectedArrowColor(value) {
      selectedArrowColor = value;
    },

    get availablePictographs() {
      return availablePictographs;
    },

    get stepByStepMode() {
      return stepByStepMode;
    },
    set stepByStepMode(value) {
      stepByStepMode = value;
    },

    get currentStep() {
      return currentStep;
    },
    set currentStep(value) {
      currentStep = value;
    },

    get maxSteps() {
      return maxSteps;
    },

    get showCoordinateGrid() {
      return showCoordinateGrid;
    },
    set showCoordinateGrid(value) {
      showCoordinateGrid = value;
    },

    get showHandPoints() {
      return showHandPoints;
    },
    set showHandPoints(value) {
      showHandPoints = value;
    },

    get showLayer2Points() {
      return showLayer2Points;
    },
    set showLayer2Points(value) {
      showLayer2Points = value;
    },

    get showAdjustmentVectors() {
      return showAdjustmentVectors;
    },
    set showAdjustmentVectors(value) {
      showAdjustmentVectors = value;
    },

    get currentDebugData() {
      return currentDebugData;
    },

    get isCalculating() {
      return isCalculating;
    },

    get autoUpdate() {
      return autoUpdate;
    },
    set autoUpdate(value) {
      autoUpdate = value;
    },

    get expandedSections() {
      return expandedSections;
    },

    get currentMotionData() {
      return currentMotionData;
    },
    get currentArrowData() {
      return currentArrowData;
    },

    // Methods
    calculateFullPositioning,
    loadSamplePictographs,
    toggleSection,
  };
}
