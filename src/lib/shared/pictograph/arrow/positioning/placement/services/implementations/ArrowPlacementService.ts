/**
 * Arrow Placement Data Service
 *
 * Loads and manages arrow placement JSON data for positioning calculations.
 * Ports the exact functionality from desktop DefaultPlacementService.
 */

import { MotionType } from "../../../../../shared/domain/enums/pictograph-enums";
import { GridMode } from "../../../../../grid/domain/enums/grid-enums";
import { injectable } from "inversify";
import { jsonCache } from "$shared/pictograph/shared/services/implementations/SimpleJsonCache";
import type { AllPlacementData, JsonPlacementData } from "../../domain";
import type { IArrowPlacementService } from "../contracts";

@injectable()
export class ArrowPlacementService implements IArrowPlacementService {
  private allPlacements: AllPlacementData = {
    [GridMode.DIAMOND]: {},
    [GridMode.BOX]: {},
  };

  // Track which grid modes have been loaded (lazy loading by grid mode)
  private loadedGridModes = new Set<GridMode>();

  // File mapping for placement data
  private readonly placementFiles: Record<string, Record<string, string>> = {
    [GridMode.DIAMOND]: {
      pro: "/data/arrow_placement/diamond/default/default_diamond_pro_placements.json",
      anti: "/data/arrow_placement/diamond/default/default_diamond_anti_placements.json",
      float:
        "/data/arrow_placement/diamond/default/default_diamond_float_placements.json",
      dash: "/data/arrow_placement/diamond/default/default_diamond_dash_placements.json",
      static:
        "/data/arrow_placement/diamond/default/default_diamond_static_placements.json",
    },
    [GridMode.BOX]: {
      pro: "/data/arrow_placement/box/default/default_box_pro_placements.json",
      anti: "/data/arrow_placement/box/default/default_box_anti_placements.json",
      float:
        "/data/arrow_placement/box/default/default_box_float_placements.json",
      dash: "/data/arrow_placement/box/default/default_box_dash_placements.json",
      static:
        "/data/arrow_placement/box/default/default_box_static_placements.json",
    },
    // SKEWED mode doesn't have separate files - it uses both diamond and box
  };

  /**
   * Load all placement data from JSON files
   * @deprecated Use ensureGridModeLoaded() for lazy loading by grid mode
   */
  async loadPlacementData(): Promise<void> {
    // Load both grid modes for backwards compatibility
    await this.ensureGridModeLoaded(GridMode.DIAMOND);
    await this.ensureGridModeLoaded(GridMode.BOX);
  }

  /**
   * Ensure placement data is loaded for a specific grid mode (lazy loading)
   * Only loads 5 files for the requested grid mode instead of all 10
   */
  async ensureGridModeLoaded(gridMode: GridMode): Promise<void> {
    // For SKEWED mode, use diamond files
    const actualGridMode =
      gridMode === GridMode.SKEWED ? GridMode.DIAMOND : gridMode;

    // Skip if already loaded
    if (this.loadedGridModes.has(actualGridMode)) {
      return;
    }

    try {
      await this.loadGridPlacements(actualGridMode);
      this.loadedGridModes.add(actualGridMode);

      // Also mark SKEWED as loaded if we loaded DIAMOND
      if (actualGridMode === GridMode.DIAMOND) {
        this.loadedGridModes.add(GridMode.SKEWED);
      }
    } catch (error) {
      console.error(
        `❌ Failed to load ${actualGridMode} placement data:`,
        error
      );
      throw new Error(
        `Placement data loading failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Load placements for a specific grid mode
   */
  private async loadGridPlacements(gridMode: GridMode): Promise<void> {
    // For SKEWED mode, default to diamond files
    const actualGridMode =
      gridMode === GridMode.SKEWED ? GridMode.DIAMOND : gridMode;
    const files = this.placementFiles[actualGridMode];
    this.allPlacements[gridMode] = {};

    for (const [motionType, filePath] of Object.entries(files ?? {})) {
      try {
        const placementData = await this.loadJsonFile(filePath);
        // Filter out null values to match GridPlacementData type
        const filteredData: {
          [placementKey: string]: { [turns: string]: [number, number] };
        } = {};
        for (const [placementKey, turnsData] of Object.entries(
          placementData ?? {}
        )) {
          filteredData[placementKey] = {};
          for (const [turns, coords] of Object.entries(turnsData ?? {})) {
            if (
              coords !== null &&
              Array.isArray(coords) &&
              coords.length === 2 &&
              typeof coords[0] === "number" &&
              typeof coords[1] === "number"
            ) {
              filteredData[placementKey][turns] = coords as unknown as [
                number,
                number,
              ];
            }
          }
        }
        this.allPlacements[gridMode][motionType] = filteredData;
      } catch (error) {
        console.warn(
          `Could not load ${motionType} placements for ${gridMode}: ${error}`
        );
        this.allPlacements[gridMode][motionType] = {};
      }
    }
  }

  /**
   * Load JSON file with caching
   */
  private async loadJsonFile(path: string): Promise<JsonPlacementData> {
    try {
      const data = await jsonCache.get(path);
      return data as JsonPlacementData;
    } catch (error) {
      console.warn(`Failed to load placement data from ${path}:`, error);
      return {};
    }
  }

  /**
   * Get default adjustment using placement key and turns
   */
  async getDefaultAdjustment(
    motionType: MotionType,
    placementKey: string,
    turns: number | string,
    gridMode: GridMode = GridMode.DIAMOND
  ): Promise<{ x: number; y: number }> {
    await this.ensureDataLoaded(gridMode);

    const gridPlacements = this.allPlacements[gridMode];
    if (!gridPlacements) {
      return { x: 0, y: 0 };
    }

    const motionPlacements = gridPlacements[motionType];
    if (!motionPlacements) {
      return { x: 0, y: 0 };
    }

    const placementData = motionPlacements[placementKey];
    if (!placementData) {
      return { x: 0, y: 0 };
    }

    // Convert turns to string format used in JSON
    const turnsStr = this.formatTurnsForLookup(turns);
    const adjustment = placementData[turnsStr];

    if (!adjustment) {
      return { x: 0, y: 0 };
    }

    const [x, y] = adjustment;
    return { x, y };
  }

  /**
   * Get available placement keys for a motion type
   */
  async getAvailablePlacementKeys(
    motionType: MotionType,
    gridMode: GridMode = GridMode.DIAMOND
  ): Promise<string[]> {
    await this.ensureDataLoaded(gridMode);

    const motionPlacements = this.allPlacements[gridMode]?.[motionType];
    if (!motionPlacements) {
      return [];
    }

    return Object.keys(motionPlacements);
  }

  /**
   * Check if data is loaded for a grid mode (or any grid mode if not specified)
   */
  isLoaded(gridMode?: GridMode): boolean {
    if (gridMode) {
      const actualMode =
        gridMode === GridMode.SKEWED ? GridMode.DIAMOND : gridMode;
      return this.loadedGridModes.has(actualMode);
    }
    // For backwards compatibility, check if at least diamond is loaded
    return this.loadedGridModes.has(GridMode.DIAMOND);
  }

  /**
   * Ensure data is loaded for a specific grid mode (lazy loading)
   */
  private async ensureDataLoaded(
    gridMode: GridMode = GridMode.DIAMOND
  ): Promise<void> {
    await this.ensureGridModeLoaded(gridMode);
  }

  /**
   * Format turns value for JSON lookup
   * Converts: 1.0 → "1", 0.5 → "0.5", etc.
   */
  private formatTurnsForLookup(turns: number | string): string {
    if (typeof turns === "string") {
      return turns; // Already formatted (e.g., "fl" for float)
    }

    // Convert numbers: remove .0 for whole numbers
    if (turns === Math.floor(turns)) {
      return Math.floor(turns).toString();
    }

    return turns.toString();
  }

  /**
   * Debug method to log available keys
   */
  async debugAvailableKeys(
    motionType: MotionType,
    gridMode: GridMode = GridMode.DIAMOND
  ): Promise<void> {
    const keys = await this.getAvailablePlacementKeys(motionType, gridMode);
    console.log(
      `Available placement keys for ${motionType} (${gridMode}):`,
      keys
    );
  }

  /**
   * Get raw placement data for debugging
   */
  async getPlacementData(
    motionType: MotionType,
    placementKey: string,
    gridMode: GridMode = GridMode.DIAMOND
  ): Promise<{ [turns: string]: [number, number] }> {
    await this.ensureDataLoaded(gridMode);

    const motionPlacements = this.allPlacements[gridMode]?.[motionType];
    return motionPlacements?.[placementKey] || {};
  }
}
