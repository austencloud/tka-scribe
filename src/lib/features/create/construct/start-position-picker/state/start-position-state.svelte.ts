/**
 * Simplified Start Position State
 *
 * Based on the working legacy implementation - simple and effective.
 * No over-engineering, just the core functionality needed.
 */

import { resolve } from "../../../../../shared/inversify/di";
import { TYPES } from "../../../../../shared/inversify/types";
import { GridMode } from "../../../../../shared/pictograph/grid/domain/enums/grid-enums";
import type { PictographData } from "../../../../../shared/pictograph/shared/domain/models/PictographData";
import type { ISettingsState } from "../../../../../shared/settings/services/contracts/ISettingsState";
import type { IStartPositionService } from "../services/contracts/IStartPositionService";



export function createSimplifiedStartPositionState() {
  // Lazy service resolution to avoid effect_orphan error
  let startPositionService: IStartPositionService | null = null;
  let settingsService: ISettingsState | null = null;

  function getService(): IStartPositionService {
    if (!startPositionService) {
      startPositionService = resolve(TYPES.IStartPositionService)!;
    }
    return startPositionService;
  }

  function getSettingsService(): ISettingsState {
    if (!settingsService) {
      settingsService = resolve(TYPES.ISettingsState)!;
    }
    return settingsService;
  }

  // Load grid mode from settings (defaults to DIAMOND if not set)
  function getInitialGridMode(): GridMode {
    try {
      const settings = getSettingsService();
      return settings.currentSettings.gridMode || GridMode.DIAMOND;
    } catch (error) {
      console.warn(
        "Failed to load grid mode from settings, defaulting to DIAMOND",
        error
      );
      return GridMode.DIAMOND;
    }
  }

  // Simple reactive state - just what we need
  let positions = $state<PictographData[]>([]);
  let allVariations = $state<PictographData[]>([]);
  let selectedPosition = $state<PictographData | null>(null);
  let currentGridMode = $state<GridMode>(getInitialGridMode());
  const selectionListeners = new Set<
    (position: PictographData | null, source: "user" | "sync") => void
  >();

  function notifySelectionChange(
    position: PictographData | null,
    source: "user" | "sync" = "user"
  ) {
    selectionListeners.forEach((listener) => {
      try {
        listener(position, source);
      } catch (error) {
        console.error("? start-position-state: listener error", error);
      }
    });
  }

  // Load positions on initialization - always succeeds with hardcoded positions
  async function loadPositions(gridMode: GridMode = currentGridMode) {
    currentGridMode = gridMode;
    positions = await getService().getStartPositions(gridMode);

    // Persist grid mode to settings when it changes
    try {
      await getSettingsService().updateSetting("gridMode", gridMode);
    } catch (error) {
      console.warn("Failed to persist grid mode to settings", error);
    }
  }

  // Set grid mode directly without loading positions
  // Useful when importing a sequence where we just need the mode to match
  function setGridMode(gridMode: GridMode) {
    if (currentGridMode !== gridMode) {
      console.log(`🔄 StartPositionState: Setting grid mode directly - ${currentGridMode} → ${gridMode}`);
      currentGridMode = gridMode;
    }
  }

  // Load all 16 start position variations for the current grid mode
  async function loadAllVariations(gridMode: GridMode = currentGridMode) {
    currentGridMode = gridMode;
    allVariations = await getService().getAllStartPositionVariations(gridMode);

    // Persist grid mode to settings when it changes
    try {
      await getSettingsService().updateSetting("gridMode", gridMode);
    } catch (error) {
      console.warn("Failed to persist grid mode to settings", error);
    }
  }

  // Select a position
  async function selectPosition(position: PictographData) {
    await getService().selectStartPosition(position);
    selectedPosition = position;
    notifySelectionChange(position, "user");
  }

  function setSelectedPosition(position: PictographData | null) {
    selectedPosition = position;
    notifySelectionChange(position, "sync");
  }

  function clearSelectedPosition() {
    setSelectedPosition(null);
  }

  function onSelectedPositionChange(
    listener: (position: PictographData | null, source: "user" | "sync") => void
  ) {
    selectionListeners.add(listener);
    return () => {
      selectionListeners.delete(listener);
    };
  }

  // Initialize on creation
  void loadPositions();

  return {
    // State
    get positions() {
      return positions;
    },
    get allVariations() {
      return allVariations;
    },
    get selectedPosition() {
      return selectedPosition;
    },
    get currentGridMode() {
      return currentGridMode;
    },

    // Actions
    selectPosition,
    setSelectedPosition,
    clearSelectedPosition,
    loadPositions,
    loadAllVariations,
    setGridMode,
    onSelectedPositionChange,
  };
}

export type SimplifiedStartPositionState = ReturnType<
  typeof createSimplifiedStartPositionState
>;
