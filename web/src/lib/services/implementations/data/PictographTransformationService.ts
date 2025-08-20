/**
 * PictographTransformationService - Centralized pictograph data transformation
 *
 * Handles conversion from CSV rows to PictographData objects using shared utilities.
 * Eliminates duplication of transformation logic across services.
 */

import type { PictographData } from "$lib/domain/PictographData";
import { createPictographData } from "$lib/domain/PictographData";
import { createMotionData } from "$lib/domain/MotionData";
import { createPropData } from "$lib/domain/PropData";
import { createPropPlacementData } from "$lib/domain/PropPlacementData";
import type { IEnumMappingService } from "../../interfaces/application-interfaces";
import { pictographDataDebugger } from "../../debug/PictographDataDebugger";
import { MotionColor } from "$lib/domain/enums";
import type { MotionData, PropData } from "$lib/domain";

export interface IPictographTransformationService {
  convertCsvRowToPictographData(
    row: Record<string, string>,
    gridMode: string,
    index?: number
  ): PictographData | null;

  createPictographFromCSVRow(
    row: Record<string, string>,
    gridMode: string
  ): PictographData | null;

  validateCSVRow(row: Record<string, string>): {
    isValid: boolean;
    errors: string[];
  };
}

export class PictographTransformationService
  implements IPictographTransformationService
{
  constructor(private enumMappingService: IEnumMappingService) {}

  /**
   * Convert CSV row to PictographData - main public interface
   */
  convertCsvRowToPictographData(
    row: Record<string, string>,
    gridMode: string,
    index?: number
  ): PictographData | null {
    try {
      // Start debugging trace
      const identifier = `${row.letter || "unknown"}_${index || Date.now()}`;
      pictographDataDebugger.startTrace(identifier);
      pictographDataDebugger.addTraceStep(identifier, "CSV_INPUT", row);

      const result = this.createPictographFromCSVRow(row, gridMode);

      if (result) {
        pictographDataDebugger.addTraceStep(
          identifier,
          "PICTOGRAPH_CREATED",
          result
        );

        // Get comprehensive debug info - but don't modify the result
        pictographDataDebugger.getPictographDebugInfo(result, row);
      } else {
        pictographDataDebugger.addTraceStep(
          identifier,
          "CONVERSION_FAILED",
          null,
          ["Failed to create pictograph"]
        );
      }

      return result;
    } catch (error) {
      console.warn(
        `⚠️ Failed to convert CSV row ${index || "unknown"} to pictograph:`,
        error
      );
      return null;
    }
  }

  /**
   * Create PictographData from CSV row with comprehensive error handling
   */
  createPictographFromCSVRow(
    row: Record<string, string>,
    gridMode: string
  ): PictographData | null {
    try {
      // Validate required fields
      const validation = this.validateCSVRow(row);
      if (!validation.isValid) {
        console.warn("⚠️ CSV row validation failed:", validation.errors);
        return null;
      }

      const letter = row.letter;
      if (!letter) {
        console.warn("⚠️ Missing letter in CSV row");
        return null;
      }

      // DEBUG: Log CSV row data for G pictographs
      if (letter === "G" || letter === "g") {
        console.log(`🔧 [G DEBUG] CSV row data:`, {
          letter: row.letter,
          blueStartLocation: row.blueStartLocation || row.blueStartLoc,
          blueEndLocation: row.blueEndLocation || row.blueendLocation,
          redStartLocation: row.redStartLocation || row.redStartLoc,
          redEndLocation: row.redEndLocation || row.redendLocation,
          fullRow: row,
        });
      }

      // Create blue motion data
      const blueMotion = createMotionData({
        motionType: this.enumMappingService.mapMotionType(row.blueMotionType),
        rotationDirection: this.enumMappingService.mapRotationDirection(
          row.blueRotationDirection
        ),
        startLocation: this.enumMappingService.mapLocation(
          row.blueStartLocation || row.blueStartLoc
        ),
        endLocation: this.enumMappingService.mapLocation(
          row.blueEndLocation || row.blueendLocation
        ),
        turns: 0,
        isVisible: true,
      });

      // Create red motion data
      const redMotion = createMotionData({
        motionType: this.enumMappingService.mapMotionType(row.redMotionType),
        rotationDirection: this.enumMappingService.mapRotationDirection(
          row.redRotationDirection
        ),
        startLocation: this.enumMappingService.mapLocation(
          row.redStartLocation || row.redStartLoc
        ),
        endLocation: this.enumMappingService.mapLocation(
          row.redEndLocation || row.redendLocation
        ),
        turns: 0,
        isVisible: true,
      });

      // Create props based on motion data
      const blueProps = this.createPropFromMotion(blueMotion, MotionColor.BLUE);
      const redProps = this.createPropFromMotion(redMotion, MotionColor.RED);

      // Create pictograph data
      return createPictographData({
        letter,
        motions: {
          blue: blueMotion,
          red: redMotion,
        },
        props: {
          blue: blueProps,
          red: redProps,
        },
        startPosition: this.enumMappingService.convertToGridPosition(
          row.startPosition
        ),
        endPosition: this.enumMappingService.convertToGridPosition(
          row.endPosition
        ),
        gridMode: gridMode,
        isBlank: false,
        metadata: {
          source: "csv_transformation_service",
          gridMode,
          originalRow: row,
          letterType: this.enumMappingService.getLetterType(letter),
        },
      });
    } catch (error) {
      console.warn("⚠️ Failed to create pictograph from CSV row:", error);
      return null;
    }
  }

  /**
   * Create PropData from MotionData
   * This ensures props have the correct location and orientation from motion data
   */
  private createPropFromMotion(
    motion: MotionData,
    color: MotionColor
  ): PropData {
    console.log(`🔧 [DEBUG] Creating prop from motion for ${color}:`, {
      motionData: {
        startLocation: motion.startLocation,
        endLocation: motion.endLocation,
        endOrientation: motion.endOrientation,
        rotationDirection: motion.rotationDirection,
      },
      willCreatePropWith: {
        location: motion.endLocation,
        orientation: motion.endOrientation,
        rotationDirection: motion.rotationDirection,
      },
    });

    const propData = createPropData({
      orientation: motion.endOrientation,
      rotationDirection: motion.rotationDirection,
      placementData: createPropPlacementData(),
      isVisible: motion.isVisible,
    });

    console.log(`🔧 [DEBUG] Created prop result:`, {
      color: motion.color, // Get color from motion (source of truth)
      location: motion.endLocation, // Get location from motion.endLocation
      orientation: propData.orientation,
      rotationDirection: propData.rotationDirection,
    });

    return propData;
  }

  /**
   * Validate CSV row has required fields
   */
  validateCSVRow(row: Record<string, string>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const requiredFields = [
      "letter",
      "startPosition",
      "endPosition",
      "blueMotionType",
      "redMotionType",
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (!row[field] || row[field].trim() === "") {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Check location fields (with fallbacks)
    const blueStartLoc = row.blueStartLocation || row.blueStartLoc;
    const blueEndLoc = row.blueEndLocation || row.blueendLocation;
    const redStartLoc = row.redStartLocation || row.redStartLoc;
    const redEndLoc = row.redEndLocation || row.redendLocation;

    if (!blueStartLoc) errors.push("Missing blue start location");
    if (!blueEndLoc) errors.push("Missing blue end location");
    if (!redStartLoc) errors.push("Missing red start location");
    if (!redEndLoc) errors.push("Missing red end location");

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Batch convert multiple CSV rows to PictographData
   */
  convertMultipleRows(
    rows: Record<string, string>[],
    gridMode: string
  ): {
    successful: PictographData[];
    failed: Array<{
      index: number;
      row: Record<string, string>;
      error: string;
    }>;
  } {
    const successful: PictographData[] = [];
    const failed: Array<{
      index: number;
      row: Record<string, string>;
      error: string;
    }> = [];

    rows.forEach((row, index) => {
      try {
        const pictograph = this.convertCsvRowToPictographData(
          row,
          gridMode,
          index
        );
        if (pictograph) {
          successful.push(pictograph);
        } else {
          failed.push({
            index,
            row,
            error: "Conversion returned null",
          });
        }
      } catch (error) {
        failed.push({
          index,
          row,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    return { successful, failed };
  }

  /**
   * Get transformation statistics for debugging
   */
  getTransformationStats(
    rows: Record<string, string>[],
    _gridMode: string
  ): {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    validationErrors: Array<{ index: number; errors: string[] }>;
  } {
    const stats = {
      totalRows: rows.length,
      validRows: 0,
      invalidRows: 0,
      validationErrors: [] as Array<{ index: number; errors: string[] }>,
    };

    rows.forEach((row, index) => {
      const validation = this.validateCSVRow(row);
      if (validation.isValid) {
        stats.validRows++;
      } else {
        stats.invalidRows++;
        stats.validationErrors.push({
          index,
          errors: validation.errors,
        });
      }
    });

    return stats;
  }

  /**
   * Create pictograph with custom metadata
   */
  createPictographWithMetadata(
    row: Record<string, string>,
    gridMode: string,
    additionalMetadata: Record<string, unknown> = {}
  ): PictographData | null {
    const pictograph = this.createPictographFromCSVRow(row, gridMode);

    if (!pictograph) return null;

    return {
      ...pictograph,
      metadata: {
        ...pictograph.metadata,
        ...additionalMetadata,
      },
    };
  }
}
