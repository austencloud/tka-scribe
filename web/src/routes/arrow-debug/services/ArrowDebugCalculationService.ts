/**
 * Arrow Debug Calculation Service
 *
 * Handles the core positioning calculation logic for debugging
 * Extracted from arrow-debug-state.svelte.ts
 */

import type { ArrowData, MotionData, PictographData } from "$lib/domain";
import { MotionType, MotionColor, GridMode } from "$lib/domain/enums";
import { resolve } from "$lib/services/bootstrap";
import type {
  IArrowCoordinateSystemService,
  IArrowLocationCalculator,
  IArrowRotationCalculator,
  IArrowAdjustmentCalculator,
} from "$lib/services/positioning";
import type { ArrowPositioningDebugData } from "../types/ArrowDebugTypes";

export class ArrowDebugCalculationService {
  private coordinateSystemService: IArrowCoordinateSystemService | null = null;
  private locationCalculator: IArrowLocationCalculator | null = null;
  private rotationCalculator: IArrowRotationCalculator | null = null;
  private adjustmentCalculator: IArrowAdjustmentCalculator | null = null;

  /**
   * Ensure all positioning services are initialized
   */
  private ensureServicesInitialized(): boolean {
    if (
      !this.coordinateSystemService ||
      !this.locationCalculator ||
      !this.rotationCalculator ||
      !this.adjustmentCalculator
    ) {
      try {
        this.coordinateSystemService = resolve("IArrowCoordinateSystemService");
        this.locationCalculator = resolve("IArrowLocationCalculator");
        this.rotationCalculator = resolve("IArrowRotationCalculator");
        this.adjustmentCalculator = resolve("IArrowAdjustmentCalculator");
        return true;
      } catch (error) {
        console.error("Services still not available:", error);
        return false;
      }
    }
    return true;
  }

  /**
   * Calculate full positioning with comprehensive debug tracking
   */
  async calculateFullPositioning(
    pictographData: PictographData,
    motionData: MotionData,
    arrowData: ArrowData,
    selectedArrowColor: MotionColor
  ): Promise<ArrowPositioningDebugData> {
    if (!this.ensureServicesInitialized()) {
      throw new Error("Cannot calculate positioning: services not available");
    }

    const startTime = performance.now();
    const debugData = this.createEmptyDebugData();

    debugData.pictographData = pictographData;
    debugData.motionData = motionData;
    debugData.arrowData = arrowData;

    // Step 1: Calculate location
    await this.calculateLocationStep(debugData, motionData, pictographData);

    // Step 2: Get initial position
    await this.calculateInitialPositionStep(debugData, motionData);

    // Step 3: Calculate rotation
    await this.calculateRotationStep(debugData, motionData);

    // Step 4: Calculate adjustment
    await this.calculateAdjustmentStep(
      debugData,
      pictographData,
      motionData,
      selectedArrowColor
    );

    // Step 5: Calculate final position
    this.calculateFinalPosition(debugData);

    debugData.timing = debugData.timing || {
      totalDuration: 0,
      stepDurations: {},
    };
    debugData.timing.totalDuration = performance.now() - startTime;
    return debugData;
  }

  private async calculateLocationStep(
    debugData: ArrowPositioningDebugData,
    motionData: MotionData,
    pictographData: PictographData
  ): Promise<void> {
    const locationStart = performance.now();

    try {
      if (this.locationCalculator) {
        debugData.calculatedLocation =
          this.locationCalculator.calculateLocation(motionData, pictographData);

        debugData.locationDebugInfo = {
          motionType: motionData.motionType || "",
          startOrientation: motionData.startOrientation || "",
          endOrientation: motionData.endOrientation || "",
          calculationMethod: this.getLocationCalculationMethod(motionData),
        };
      }
    } catch (error) {
      debugData.errors.push({
        step: "location_calculation",
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
    }

    debugData.timing = {
      totalDuration: 0,
      stepDurations: { location: performance.now() - locationStart },
    };
  }

  private async calculateInitialPositionStep(
    debugData: ArrowPositioningDebugData,
    motionData: MotionData
  ): Promise<void> {
    const positionStart = performance.now();

    try {
      if (debugData.calculatedLocation && this.coordinateSystemService) {
        debugData.initialPosition =
          this.coordinateSystemService.getInitialPosition(
            motionData,
            debugData.calculatedLocation
          );

        debugData.coordinateSystemDebugInfo = {
          sceneCenter: this.coordinateSystemService.getSceneCenter(),
          sceneDimensions: this.coordinateSystemService.getSceneDimensions(),
          handPoints: this.coordinateSystemService.getAllHandPoints(),
          layer2Points: this.coordinateSystemService.getAllLayer2Points(),
          usedCoordinateSet: this.getUsedCoordinateSet(motionData),
          coordinateSystemType: this.getCoordinateSystemType(motionData),
        };
      }
    } catch (error) {
      debugData.errors.push({
        step: "initial_position",
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
    }

    if (debugData.timing) {
      debugData.timing.stepDurations.initial_position =
        performance.now() - positionStart;
    }
  }

  private async calculateRotationStep(
    debugData: ArrowPositioningDebugData,
    motionData: MotionData
  ): Promise<void> {
    const rotationStart = performance.now();

    try {
      if (debugData.calculatedLocation && this.rotationCalculator) {
        debugData.finalRotation = this.rotationCalculator.calculateRotation(
          motionData,
          debugData.calculatedLocation
        );
      }
    } catch (error) {
      debugData.errors.push({
        step: "rotation_calculation",
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
    }

    if (debugData.timing) {
      debugData.timing.stepDurations.rotation =
        performance.now() - rotationStart;
    }
  }

  private async calculateAdjustmentStep(
    debugData: ArrowPositioningDebugData,
    pictographData: PictographData,
    motionData: MotionData,
    selectedArrowColor: MotionColor
  ): Promise<void> {
    const adjustmentStart = performance.now();

    try {
      if (debugData.calculatedLocation && this.adjustmentCalculator) {
        const fullAdjustment =
          await this.adjustmentCalculator.calculateAdjustment(
            pictographData,
            motionData,
            pictographData.letter || "",
            debugData.calculatedLocation,
            selectedArrowColor
          );

        // Get individual components for debugging
        await this.calculateIndividualAdjustments(
          debugData,
          pictographData,
          motionData,
          selectedArrowColor
        );

        debugData.tupleProcessedAdjustment = fullAdjustment;
      }
    } catch (error) {
      debugData.errors.push({
        step: "adjustment_calculation",
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      });
    }

    if (debugData.timing) {
      debugData.timing.stepDurations.adjustment =
        performance.now() - adjustmentStart;
    }
  }

  private calculateFinalPosition(debugData: ArrowPositioningDebugData): void {
    if (debugData.initialPosition && debugData.tupleProcessedAdjustment) {
      debugData.finalPosition = {
        x: debugData.initialPosition.x + debugData.tupleProcessedAdjustment.x,
        y: debugData.initialPosition.y + debugData.tupleProcessedAdjustment.y,
      };
    }
  }

  private async calculateIndividualAdjustments(
    debugData: ArrowPositioningDebugData,
    pictograph: PictographData,
    motion: MotionData,
    selectedArrowColor: MotionColor
  ): Promise<void> {
    // Provide debug info for individual adjustment components
    debugData.defaultAdjustmentDebugInfo = {
      placementKey: "placeholder",
      turns: motion.turns || 0,
      motionType: motion.motionType || "",
      gridMode: pictograph.gridMode || GridMode.DIAMOND,
      adjustmentSource: "default_placement",
      rawPlacementData: {},
    };

    debugData.specialAdjustmentDebugInfo = {
      letter: pictograph.letter || "",
      oriKey: "placeholder",
      turnsTuple: "placeholder",
      arrowColor: selectedArrowColor,
      specialPlacementFound: false,
      specialPlacementData: {},
      adjustmentSource: "none",
    };
  }

  private getLocationCalculationMethod(motion: MotionData): string {
    const motionType = motion.motionType;
    if ([MotionType.STATIC, MotionType.DASH].includes(motionType)) {
      return "static_calculator";
    } else if (
      [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT].includes(motionType)
    ) {
      return "shift_calculator";
    }
    return "unknown";
  }

  private getUsedCoordinateSet(
    motion: MotionData
  ): "hand_points" | "layer2_points" | "center" {
    const motionType = motion.motionType;
    if (
      [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT].includes(motionType)
    ) {
      return "layer2_points";
    } else if ([MotionType.STATIC, MotionType.DASH].includes(motionType)) {
      return "hand_points";
    }
    return "center";
  }

  private getCoordinateSystemType(motion: MotionData): string {
    const motionType = motion.motionType;
    if (
      [MotionType.PRO, MotionType.ANTI, MotionType.FLOAT].includes(motionType)
    ) {
      return "shift_arrow_layer2";
    } else if ([MotionType.STATIC, MotionType.DASH].includes(motionType)) {
      return "static_arrow_hand";
    }
    return "unknown";
  }

  private createEmptyDebugData(): ArrowPositioningDebugData {
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
}
