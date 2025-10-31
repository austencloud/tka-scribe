/**
 * Directional Tuple Pipeline Debugger
 *
 * Comprehensive diagnostic tool to trace arrow positioning for dash motions.
 * Validates that transformation matrices are being applied correctly.
 */

import { GridLocation, GridMode, MotionType, type MotionData, type PictographData } from "$shared";
import { TYPES } from "$shared/inversify/types";
import { resolve } from "$shared";
import { Point } from "fabric";
import type { IArrowAdjustmentCalculator } from "../contracts/IArrowAdjustmentCalculator";
import type { IDirectionalTupleCalculator } from "../contracts/IDirectionalTupleService";
import type { IArrowQuadrantCalculator } from "$shared/pictograph/arrow/orchestration/services/contracts/IArrowQuadrantCalculator";

export interface DiagnosticResult {
  step: string;
  status: "SUCCESS" | "ERROR" | "WARNING";
  data: Record<string, unknown>;
  timestamp: number;
}

export class DirectionalTupleDebugger {
  private diagnostics: DiagnosticResult[] = [];

  /**
   * Run comprehensive diagnostic on arrow positioning for a dash motion
   */
  async runDashPositioningDiagnostic(
    pictographData: PictographData,
    isBlueArrow: boolean
  ): Promise<void> {
    console.group("🔍 DASH POSITIONING DIAGNOSTIC");
    this.diagnostics = [];

    try {
      // Get the motion data
      const motion = isBlueArrow ? pictographData.motions?.blue : pictographData.motions?.red;
      if (!motion) {
        this.logError("Motion data not found", { isBlueArrow });
        return;
      }

      // STEP 1: Validate motion type detection
      await this.validateMotionTypeDetection(motion);

      // STEP 2: Validate rotation direction detection
      await this.validateRotationDirectionDetection(motion);

      // STEP 3: Validate grid mode detection
      await this.validateGridModeDetection(motion, pictographData);

      // STEP 4: Calculate arrow location
      const location = await this.validateArrowLocationCalculation(motion, pictographData, isBlueArrow);

      // STEP 5: Get base adjustment from JSON
      const baseAdjustment = await this.validateBaseAdjustmentRetrieval(
        pictographData,
        motion,
        pictographData.letter || "unknown",
        location,
        motion.color
      );

      // STEP 6: Validate directional tuple generation
      await this.validateDirectionalTupleGeneration(motion, baseAdjustment);

      // STEP 7: Validate quadrant index calculation
      await this.validateQuadrantIndexCalculation(motion, location);

      // STEP 8: Validate final adjustment application
      await this.validateFinalAdjustment(motion, location, baseAdjustment);

      // STEP 9: Summary
      this.printDiagnosticSummary();

    } catch (error) {
      this.logError("Diagnostic failed", { error: String(error) });
    } finally {
      console.groupEnd();
    }
  }

  private async validateMotionTypeDetection(motion: MotionData): Promise<void> {
    console.group("📋 STEP 1: Motion Type Detection");

    const motionType = motion.motionType;
    const isDash = motionType === MotionType.DASH || motionType?.toLowerCase() === "dash";

    this.log("Motion type detection", "SUCCESS", {
      rawMotionType: motionType,
      isDash,
      expectedType: "DASH"
    });

    if (!isDash) {
      console.warn("⚠️ WARNING: Motion is NOT detected as DASH!");
      console.warn(`   Current type: ${motionType}`);
    } else {
      console.log("✅ Motion correctly detected as DASH");
    }

    console.groupEnd();
  }

  private async validateRotationDirectionDetection(motion: MotionData): Promise<void> {
    console.group("🔄 STEP 2: Rotation Direction Detection");

    const rotationDirection = motion.rotationDirection;
    const turns = motion.turns;
    const isCW = rotationDirection?.toLowerCase() === "clockwise" || rotationDirection?.toLowerCase() === "cw";
    const isCCW = rotationDirection?.toLowerCase() === "counter_clockwise" || rotationDirection?.toLowerCase() === "ccw";
    const isNoRot = rotationDirection?.toLowerCase() === "norotation" || turns === 0;

    this.log("Rotation direction detection", "SUCCESS", {
      rawRotationDirection: rotationDirection,
      turns,
      isCW,
      isCCW,
      isNoRot
    });

    console.log(`   Raw rotation: "${rotationDirection}"`);
    console.log(`   Turns: ${turns}`);
    console.log(`   Detected as CW: ${isCW}`);
    console.log(`   Detected as CCW: ${isCCW}`);
    console.log(`   Detected as NoRotation: ${isNoRot}`);

    if (turns === 1 && !isCW) {
      console.warn("⚠️ WARNING: Motion has 1 turn but NOT detected as CW!");
    }

    console.groupEnd();
  }

  private async validateGridModeDetection(
    motion: MotionData,
    pictographData: PictographData
  ): Promise<void> {
    console.group("📐 STEP 3: Grid Mode Detection");

    // Check what grid mode is inferred from motion locations
    const cardinalSet = new Set([
      GridLocation.NORTH,
      GridLocation.EAST,
      GridLocation.SOUTH,
      GridLocation.WEST
    ]);
    const gridIsDiamond = cardinalSet.has(motion.startLocation) || cardinalSet.has(motion.endLocation);

    this.log("Grid mode detection", "SUCCESS", {
      startLocation: motion.startLocation,
      endLocation: motion.endLocation,
      inferredGridMode: gridIsDiamond ? GridMode.DIAMOND : GridMode.BOX,
      usesCardinalLocations: cardinalSet.has(motion.startLocation) || cardinalSet.has(motion.endLocation)
    });

    console.log(`   Start location: ${motion.startLocation}`);
    console.log(`   End location: ${motion.endLocation}`);
    console.log(`   Inferred grid mode: ${gridIsDiamond ? "DIAMOND" : "BOX"}`);

    console.groupEnd();
  }

  private async validateArrowLocationCalculation(
    motion: MotionData,
    pictographData: PictographData,
    isBlueArrow: boolean
  ): Promise<GridLocation> {
    console.group("📍 STEP 4: Arrow Location Calculation");

    try {
      // Use DashLocationCalculator to get the arrow location
      const { DashLocationCalculator } = await import("./DashLocationCalculator");
      const calculator = new DashLocationCalculator();
      const location = calculator.calculateDashLocationFromPictographData(pictographData, isBlueArrow);

      this.log("Arrow location calculation", "SUCCESS", {
        calculatedLocation: location,
        motionStartLocation: motion.startLocation,
        motionEndLocation: motion.endLocation
      });

      console.log(`   Calculated arrow location: ${location}`);

      console.groupEnd();
      return location;
    } catch (error) {
      this.logError("Arrow location calculation failed", { error: String(error) });
      console.groupEnd();
      return motion.startLocation; // Fallback
    }
  }

  private async validateBaseAdjustmentRetrieval(
    pictographData: PictographData,
    motion: MotionData,
    letter: string,
    location: GridLocation,
    arrowColor?: string
  ): Promise<Point> {
    console.group("📦 STEP 5: Base Adjustment Retrieval");

    try {
      const calculator = resolve<IArrowAdjustmentCalculator>(TYPES.IArrowAdjustmentCalculator);
      const adjustment = await calculator.calculateAdjustment(
        pictographData,
        motion,
        letter,
        location,
        arrowColor
      );

      this.log("Base adjustment retrieval", "SUCCESS", {
        x: adjustment.x,
        y: adjustment.y,
        location
      });

      console.log(`   Base adjustment from JSON: (${adjustment.x}, ${adjustment.y})`);

      console.groupEnd();
      return adjustment;
    } catch (error) {
      this.logError("Base adjustment retrieval failed", { error: String(error) });
      console.groupEnd();
      return new Point(0, 0);
    }
  }

  private async validateDirectionalTupleGeneration(
    motion: MotionData,
    baseAdjustment: Point
  ): Promise<void> {
    console.group("🔢 STEP 6: Directional Tuple Generation");

    try {
      const calculator = resolve<IDirectionalTupleCalculator>(TYPES.IDirectionalTupleCalculator);
      const tuples = calculator.generateDirectionalTuples(
        motion,
        baseAdjustment.x,
        baseAdjustment.y
      );

      this.log("Directional tuple generation", "SUCCESS", {
        baseX: baseAdjustment.x,
        baseY: baseAdjustment.y,
        tuples: tuples.map((t, i) => ({
          index: i,
          quadrant: ["NE", "SE", "SW", "NW"][i],
          x: t[0],
          y: t[1]
        }))
      });

      console.log(`   Base values: (${baseAdjustment.x}, ${baseAdjustment.y})`);
      console.log("   Generated tuples:");
      tuples.forEach((tuple, index) => {
        const quadrant = ["NE (index 0)", "SE (index 1)", "SW (index 2)", "NW (index 3)"][index];
        console.log(`      ${quadrant}: (${tuple[0]}, ${tuple[1]})`);
      });

      // Validate that tuples are different from base (transformation applied)
      const allSameAsBase = tuples.every(t => t[0] === baseAdjustment.x && t[1] === baseAdjustment.y);
      if (allSameAsBase) {
        console.warn("⚠️ WARNING: All tuples are identical to base adjustment!");
        console.warn("   This suggests transformation matrices are NOT being applied!");
      } else {
        console.log("✅ Tuples are transformed (different from base)");
      }

      console.groupEnd();
    } catch (error) {
      this.logError("Directional tuple generation failed", { error: String(error) });
      console.groupEnd();
    }
  }

  private async validateQuadrantIndexCalculation(
    motion: MotionData,
    location: GridLocation
  ): Promise<void> {
    console.group("🎯 STEP 7: Quadrant Index Calculation");

    try {
      const calculator = resolve<IArrowQuadrantCalculator>(TYPES.IArrowQuadrantCalculator);
      const quadrantIndex = calculator.calculateQuadrantIndex(motion, location);
      const gridMode = calculator.determineGridMode(motion, location);

      this.log("Quadrant index calculation", "SUCCESS", {
        location,
        gridMode,
        quadrantIndex,
        quadrantName: ["NE (0)", "SE (1)", "SW (2)", "NW (3)"][quadrantIndex]
      });

      console.log(`   Arrow location: ${location}`);
      console.log(`   Grid mode: ${gridMode}`);
      console.log(`   Quadrant index: ${quadrantIndex}`);
      console.log(`   Quadrant name: ${["NE (0)", "SE (1)", "SW (2)", "NW (3)"][quadrantIndex]}`);

      console.groupEnd();
    } catch (error) {
      this.logError("Quadrant index calculation failed", { error: String(error) });
      console.groupEnd();
    }
  }

  private async validateFinalAdjustment(
    motion: MotionData,
    location: GridLocation,
    baseAdjustment: Point
  ): Promise<void> {
    console.group("✨ STEP 8: Final Adjustment Application");

    try {
      // Manually reproduce the processDirectionalTuples logic
      const calculator = resolve<IDirectionalTupleCalculator>(TYPES.IDirectionalTupleCalculator);
      const quadrantCalculator = resolve<IArrowQuadrantCalculator>(TYPES.IArrowQuadrantCalculator);

      const tuples = calculator.generateDirectionalTuples(motion, baseAdjustment.x, baseAdjustment.y);
      const quadrantIndex = quadrantCalculator.calculateQuadrantIndex(motion, location);
      const selectedTuple = tuples[quadrantIndex] || [0, 0];

      this.log("Final adjustment application", "SUCCESS", {
        baseAdjustment: { x: baseAdjustment.x, y: baseAdjustment.y },
        selectedQuadrantIndex: quadrantIndex,
        selectedTuple: { x: selectedTuple[0], y: selectedTuple[1] },
        finalAdjustment: { x: selectedTuple[0], y: selectedTuple[1] }
      });

      console.log(`   Base adjustment: (${baseAdjustment.x}, ${baseAdjustment.y})`);
      console.log(`   Selected quadrant: ${quadrantIndex}`);
      console.log(`   Selected tuple: (${selectedTuple[0]}, ${selectedTuple[1]})`);
      console.log(`   Final adjustment: (${selectedTuple[0]}, ${selectedTuple[1]})`);

      if (selectedTuple[0] === baseAdjustment.x && selectedTuple[1] === baseAdjustment.y) {
        console.warn("⚠️ WARNING: Final adjustment is identical to base adjustment!");
        console.warn("   Transformation was NOT applied!");
      } else {
        console.log("✅ Transformation was applied");
      }

      console.groupEnd();
    } catch (error) {
      this.logError("Final adjustment application failed", { error: String(error) });
      console.groupEnd();
    }
  }

  private printDiagnosticSummary(): void {
    console.group("📊 DIAGNOSTIC SUMMARY");

    const errors = this.diagnostics.filter(d => d.status === "ERROR");
    const warnings = this.diagnostics.filter(d => d.status === "WARNING");
    const successes = this.diagnostics.filter(d => d.status === "SUCCESS");

    console.log(`   ✅ Successes: ${successes.length}`);
    console.log(`   ⚠️ Warnings: ${warnings.length}`);
    console.log(`   ❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n   Errors:");
      errors.forEach(e => console.log(`      - ${e.step}: ${JSON.stringify(e.data)}`));
    }

    if (warnings.length > 0) {
      console.log("\n   Warnings:");
      warnings.forEach(w => console.log(`      - ${w.step}: ${JSON.stringify(w.data)}`));
    }

    console.groupEnd();
  }

  private log(step: string, status: "SUCCESS" | "ERROR" | "WARNING", data: Record<string, unknown>): void {
    this.diagnostics.push({
      step,
      status,
      data,
      timestamp: Date.now()
    });
  }

  private logError(step: string, data: Record<string, unknown>): void {
    this.log(step, "ERROR", data);
    console.error(`❌ ${step}:`, data);
  }
}

/**
 * Convenience function to run diagnostic on a pictograph
 */
export async function debugDashArrowPositioning(
  pictographData: PictographData,
  isBlueArrow = true
): Promise<void> {
  const debugger = new DirectionalTupleDebugger();
  await debugger.runDashPositioningDiagnostic(pictographData, isBlueArrow);
}
