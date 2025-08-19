/**
 * Option Data Service - Fixed implementation with proper CSV data loading
 *
 * Bridges legacy option loading logic with web's actual pictograph data from CSV files.
 * No more fake service resolution - loads real data from static files.
 */

import type { PictographData } from "$lib/domain/PictographData";
import type { BeatData } from "$lib/domain/BeatData";
import { createPictographData } from "$lib/domain/PictographData";
import type { GridMode } from "$lib/domain";
import {
  MotionType,
  Location,
  Orientation,
  RotationDirection,
  GridPosition,
} from "$lib/domain/enums";
import { createMotionData } from "$lib/domain/MotionData";

export interface OptionDataServiceInterface {
  initialize(): Promise<void>;
  getNextOptions(sequence: BeatData[]): Promise<PictographData[]>;
  getNextOptionsFromEndPosition(
    endPosition: string,
    gridMode: GridMode,
    options: Record<string, unknown>
  ): Promise<PictographData[]>;
  filterOptionsByLetterTypes(
    options: PictographData[],
    letterTypes: string[]
  ): PictographData[];
  filterOptionsByRotation(
    options: PictographData[],
    blueRotDir: string,
    redRotDir: string
  ): PictographData[];
}

export class OptionDataService implements OptionDataServiceInterface {
  private pictographCache: PictographData[] | null = null;
  private loadingPromise: Promise<PictographData[]> | null = null;

  /**
   * Initialize the service - loads CSV data
   */
  async initialize(): Promise<void> {
    try {
      if (!this.loadingPromise) {
        this.loadingPromise = this.loadPictographsFromCSV();
      }
      this.pictographCache = await this.loadingPromise;
    } catch (error) {
      console.error("❌ Failed to initialize OptionDataService:", error);
      throw error;
    }
  }

  /**
   * Get next options from end position - compatibility method with proper filtering
   */
  async getNextOptionsFromEndPosition(
    endPosition: string,
    _gridMode: GridMode,
    _options: Record<string, unknown>
  ): Promise<PictographData[]> {
    try {
      if (!this.pictographCache) {
        await this.initialize();
      }

      const filteredOptions = this.filterByStartPosition(
        this.pictographCache || [],
        endPosition
      );

      return filteredOptions;
    } catch (error) {
      console.error("❌ Failed to get options from end position:", error);
      this.handleCSVLoadingError(error);
    }
  }

  /**
   * Get next options - loads real pictograph data from CSV files and filters by position
   */
  async getNextOptions(sequence: BeatData[]): Promise<PictographData[]> {
    try {
      if (!this.pictographCache) {
        if (!this.loadingPromise) {
          this.loadingPromise = this.loadPictographsFromCSV();
        }
        this.pictographCache = await this.loadingPromise;
      }

      if (sequence.length > 0) {
        const lastBeat = sequence[sequence.length - 1];
        const endPosition = this.extractEndPosition(lastBeat);

        if (endPosition) {
          const filteredOptions = this.filterByStartPosition(
            this.pictographCache,
            endPosition
          );
          return filteredOptions;
        }
      }

      return this.pictographCache;
    } catch (error) {
      console.error("❌ Failed to load pictographs:", error);
      this.handleCSVLoadingError(error);
    }
  }

  /**
   * Load pictographs from CSV files (real data)
   */
  private async loadPictographsFromCSV(): Promise<PictographData[]> {
    try {
      const [diamondResponse, boxResponse] = await Promise.all([
        fetch("/DiamondPictographDataframe.csv"),
        fetch("/BoxPictographDataframe.csv"),
      ]);

      if (!diamondResponse.ok || !boxResponse.ok) {
        throw new Error("Failed to load CSV files");
      }

      const [diamondCSV, boxCSV] = await Promise.all([
        diamondResponse.text(),
        boxResponse.text(),
      ]);

      const diamondPictographs = this.parseCSVToPictographs(
        diamondCSV,
        "diamond"
      );
      const boxPictographs = this.parseCSVToPictographs(boxCSV, "box");

      const allPictographs = [...diamondPictographs, ...boxPictographs];

      return allPictographs;
    } catch (error) {
      console.error("❌ Failed to load CSV data:", error);
      throw error;
    }
  }

  /**
   * Parse CSV to PictographData objects
   */
  private parseCSVToPictographs(
    csvText: string,
    gridMode: string
  ): PictographData[] {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const pictographs: PictographData[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(",").map((v) => v.trim());
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        const pictograph = this.createPictographFromCSVRow(row, gridMode);
        if (pictograph) {
          pictographs.push(pictograph);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to parse CSV row ${i}:`, error);
      }
    }

    return pictographs;
  }

  /**
   * Create PictographData from CSV row
   */
  private createPictographFromCSVRow(
    row: Record<string, string>,
    gridMode: string
  ): PictographData | null {
    try {
      const letter = row.letter || row.Letter || null;
      if (!letter) {
        return null;
      }

      const blueMotion = createMotionData({
        motionType: this.mapMotionType(
          row.blueMotionType ||
            row.BlueMotionType ||
            row.blue_motion_type ||
            "static"
        ),
        rotationDirection: this.mapRotationDirection(
          row.blueRotationDirection ||
            row.BluePropRotDir ||
            row.blue_prop_rot_dir ||
            "no_rot"
        ),
        startLocation: this.mapLocation(
          row.blueStartLocation || row.BlueStartLoc || row.blue_start_loc || "n"
        ),
        endLocation: this.mapLocation(
          row.blueEndLocation || row.BlueEndLoc || row.blue_end_loc || "n"
        ),
        turns:
          (this.parseNumber(row.blue_turns || row.BlueTurns) as number) || 0,
        startOrientation: this.mapOrientation(
          row.blue_start_ori || row.BlueStartOri || "in"
        ),
        endOrientation: this.mapOrientation(
          row.blue_end_ori || row.BlueEndOri || "in"
        ),
        isVisible: true,
      });

      const redMotion = createMotionData({
        motionType: this.mapMotionType(
          row.redMotionType ||
            row.RedMotionType ||
            row.red_motion_type ||
            "static"
        ),
        rotationDirection: this.mapRotationDirection(
          row.redRotationDirection ||
            row.RedPropRotDir ||
            row.red_prop_rot_dir ||
            "no_rot"
        ),
        startLocation: this.mapLocation(
          row.redStartLoc || row.RedStartLoc || row.red_start_loc || "n"
        ),
        endLocation: this.mapLocation(
          row.redEndLoc || row.RedEndLoc || row.red_end_loc || "n"
        ),
        turns: (this.parseNumber(row.red_turns || row.RedTurns) as number) || 0,
        startOrientation: this.mapOrientation(
          row.red_start_ori || row.RedStartOri || "in"
        ),
        endOrientation: this.mapOrientation(
          row.red_end_ori || row.RedEndOri || "in"
        ),
        isVisible: true,
      });

      return createPictographData({
        letter,
        motions: {
          blue: blueMotion,
          red: redMotion,
        },
        startPosition: this.convertToGridPosition(
          row.startPosition || row.StartPosition
        ),
        endPosition: this.convertToGridPosition(
          row.endPosition || row.EndPosition
        ),
        gridMode: gridMode,
        isBlank: false,
        metadata: {
          source: "csv",
          gridMode,
          originalRow: row,
        },
      });
    } catch (error) {
      console.warn("⚠️ Failed to create pictograph from CSV row:", error);
      return null;
    }
  }

  /**
   * Parse number from string, handling "fl" and other special values
   */
  private parseNumber(value: string): number | string {
    if (!value) return 0;
    if (value === "fl") return "fl";
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Extract end position from beat data
   */
  private extractEndPosition(beat: BeatData): string | null {
    if (
      beat.metadata?.endPosition &&
      typeof beat.metadata.endPosition === "string"
    ) {
      return beat.metadata.endPosition;
    }

    if (
      beat.pictographData?.metadata?.endPosition &&
      typeof beat.pictographData.metadata.endPosition === "string"
    ) {
      return beat.pictographData.metadata.endPosition;
    }

    return null;
  }

  /**
   * Filter pictographs by start position - implements the core TKA algorithm:
   * if item.get("startPosition") == target_position: next_opts.append(item)
   */
  private filterByStartPosition(
    pictographs: PictographData[],
    targetPosition: string
  ): PictographData[] {
    const filtered = pictographs.filter((pictograph) => {
      const startPosition =
        pictograph.startPosition ||
        pictograph.startPosition ||
        pictograph.metadata?.startPosition ||
        pictograph.metadata?.start_pos;

      return startPosition === targetPosition;
    });

    return filtered;
  }

  /**
   * Handle CSV loading errors by throwing descriptive errors instead of creating fallbacks
   */
  private handleCSVLoadingError(error: unknown): never {
    console.error("❌ CSV loading failed:", error);

    if (error instanceof Error) {
      throw new Error(
        `Failed to load pictograph data: ${error.message}. Please check that CSV files are available and properly formatted.`
      );
    } else {
      throw new Error(
        "Failed to load pictograph data: Unknown error occurred. Please check that CSV files are available and properly formatted."
      );
    }
  }

  /**
   * Filter options by letter types - exact port from legacy _filter_options_by_letter_type()
   */
  filterOptionsByLetterTypes(
    options: PictographData[],
    letterTypes: string[]
  ): PictographData[] {
    if (!letterTypes || letterTypes.length === 0) {
      return options;
    }

    const letterTypeMap: { [key: string]: string[] } = {
      "Dual-Shift": [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
      ],
      Shift: ["W", "X", "Y", "Z", "Σ", "Δ", "θ", "Ω"],
      "Cross-Shift": ["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"],
      Dash: ["Φ", "Ψ", "Λ"],
      "Dual-Dash": ["Φ-", "Ψ-", "Λ-"],
      Static: ["α", "β", "Γ"],
    };

    const selectedLetters: string[] = [];
    for (const letterType of letterTypes) {
      const letters = letterTypeMap[letterType];
      if (letters) {
        selectedLetters.push(...letters);
      }
    }

    const filteredOptions = options.filter((option) =>
      selectedLetters.includes(option.letter || "")
    );

    return filteredOptions.length > 0 ? filteredOptions : options;
  }

  /**
   * Filter options by rotation - exact port from legacy filter_options_by_rotation()
   */
  filterOptionsByRotation(
    options: PictographData[],
    blueRotDir: string,
    redRotDir: string
  ): PictographData[] {
    const filtered = options.filter((option) => {
      const blueRot = option.motions?.blue?.rotationDirection || "no_rot";
      const redRot = option.motions?.red?.rotationDirection || "no_rot";

      const blueMatches = blueRot === blueRotDir || blueRot === "no_rot";
      const redMatches = redRot === redRotDir || redRot === "no_rot";

      return blueMatches && redMatches;
    });

    return filtered.length > 0 ? filtered : options;
  }

  /**
   * Get options summary for debugging
   */
  getOptionsSummary(options: PictographData[]): {
    total: number;
    byLetterType: Record<string, number>;
    byMotionType: Record<string, number>;
  } {
    const summary = {
      total: options.length,
      byLetterType: {} as Record<string, number>,
      byMotionType: {} as Record<string, number>,
    };

    options.forEach((option) => {
      const letterType = this.getLetterType(option.letter || "");
      summary.byLetterType[letterType] =
        (summary.byLetterType[letterType] || 0) + 1;

      const blueMotion = option.motions?.blue?.motionType || "unknown";
      const redMotion = option.motions?.red?.motionType || "unknown";
      summary.byMotionType[blueMotion] =
        (summary.byMotionType[blueMotion] || 0) + 1;
      summary.byMotionType[redMotion] =
        (summary.byMotionType[redMotion] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get letter type for a letter - exact mapping from legacy
   */
  private getLetterType(letter: string): string {
    const type1Letters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
    ];
    const type2Letters = ["W", "X", "Y", "Z", "Σ", "Δ", "θ", "Ω"];
    const type3Letters = ["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"];
    const type4Letters = ["Φ", "Ψ", "Λ"];
    const type5Letters = ["Φ-", "Ψ-", "Λ-"];
    const type6Letters = ["α", "β", "Γ"];

    if (type1Letters.includes(letter)) return "Dual-Shift";
    if (type2Letters.includes(letter)) return "Shift";
    if (type3Letters.includes(letter)) return "Cross-Shift";
    if (type4Letters.includes(letter)) return "Dash";
    if (type5Letters.includes(letter)) return "Dual-Dash";
    if (type6Letters.includes(letter)) return "Static";

    return "Unknown";
  }

  /**
   * Clear cache (for testing or reloading)
   */
  clearCache(): void {
    this.pictographCache = null;
    this.loadingPromise = null;
  }

  /**
   * Map string motion types to enum values
   */
  private mapMotionType(motionType: string): MotionType {
    switch (motionType.toLowerCase()) {
      case "pro":
        return MotionType.PRO;
      case "anti":
        return MotionType.ANTI;
      case "float":
        return MotionType.FLOAT;
      case "dash":
        return MotionType.DASH;
      case "static":
        return MotionType.STATIC;
      default:
        return MotionType.STATIC;
    }
  }

  /**
   * Map string rotation directions to enum values
   */
  private mapRotationDirection(rotDir: string): RotationDirection {
    switch (rotDir.toLowerCase()) {
      case "cw":
      case "clockwise":
        return RotationDirection.CLOCKWISE;
      case "ccw":
      case "counter_clockwise":
      case "counterclockwise":
        return RotationDirection.COUNTER_CLOCKWISE;
      case "no_rot":
      case "no_rotation":
        return RotationDirection.NO_ROTATION;
      default:
        return RotationDirection.NO_ROTATION;
    }
  }

  /**
   * Map string locations to enum values
   */
  private mapLocation(location: string): Location {
    switch (location.toLowerCase()) {
      case "n":
        return Location.NORTH;
      case "e":
        return Location.EAST;
      case "s":
        return Location.SOUTH;
      case "w":
        return Location.WEST;
      case "ne":
        return Location.NORTHEAST;
      case "se":
        return Location.SOUTHEAST;
      case "sw":
        return Location.SOUTHWEST;
      case "nw":
        return Location.NORTHWEST;
      default:
        return Location.NORTH;
    }
  }

  /**
   * Convert string position to GridPosition enum
   */
  private convertToGridPosition(
    positionString: string | null | undefined
  ): GridPosition | null {
    if (!positionString) return null;

    const lowerPosition = positionString.toLowerCase();
    const gridPositionValues = Object.values(GridPosition);

    for (const position of gridPositionValues) {
      if (position.toLowerCase() === lowerPosition) {
        return position as GridPosition;
      }
    }

    return null;
  }

  /**
   * Map string orientations to enum values
   */
  private mapOrientation(orientation: string): Orientation {
    switch (orientation.toLowerCase()) {
      case "in":
        return Orientation.IN;
      case "out":
        return Orientation.OUT;
      case "clock":
        return Orientation.CLOCK;
      case "counter":
        return Orientation.COUNTER;
      default:
        return Orientation.IN;
    }
  }

  /**
   * Convert CSV row to PictographData - public method for other services
   */
  convertCsvRowToPictographData(
    row: Record<string, string>,
    _index: number
  ): PictographData | null {
    return this.createPictographFromCSVRow(row, "diamond");
  }
}
