/**
 * Composition Builder State
 *
 * Svelte 5 runes-based state management for the unified composition builder.
 * Manages layout, cells, playback, and UI state.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { TrailSettings } from "$lib/features/compose/shared/domain/types/TrailTypes";
import type {
  Composition,
  CellConfig,
  GridLayout,
  CellType,
} from "../domain/types";
import {
  generateCellId,
  createEmptyCells,
  getDefaultTrailSettings,
  isCellConfigured,
  isCompositionComplete,
} from "../domain/types";
import { createCellsFromTemplate, getTemplateById } from "../domain/templates";

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  COMPOSITION: "compose-current-composition",
  PREVIEW_MODE: "compose-preview-mode",
  PLAYBACK_BPM: "compose-playback-bpm",
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

function generateCompositionId(): string {
  return `comp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (err) {
    console.warn(`Failed to load ${key} from localStorage:`, err);
  }
  return defaultValue;
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (err) {
    console.warn(`Failed to save ${key} to localStorage:`, err);
  }
}

// ============================================================================
// Default Composition
// ============================================================================

function createDefaultComposition(): Composition {
  return {
    id: generateCompositionId(),
    name: "Untitled Composition",
    layout: { rows: 1, cols: 1 },
    cells: createEmptyCells({ rows: 1, cols: 1 }),
    createdAt: new Date(),
    updatedAt: new Date(),
    creator: "You",
    isFavorite: false,
  };
}

// ============================================================================
// State Factory
// ============================================================================

export type CompositionState = ReturnType<typeof createCompositionState>;

export function createCompositionState() {
  // =========================================================================
  // Core State
  // =========================================================================

  let composition = $state<Composition>(createDefaultComposition());

  // Playback state
  let isPlaying = $state(false);
  let isPreviewing = $state(loadFromStorage(STORAGE_KEYS.PREVIEW_MODE, false));
  let bpm = $state<number>(loadFromStorage(STORAGE_KEYS.PLAYBACK_BPM, 60));
  let shouldLoop = $state(true);
  let currentBeat = $state(0);

  // UI state
  let selectedCellId = $state<string | null>(null);
  let showOverlayControls = $state(true);
  let isTemplatesOpen = $state(false);
  let isCellConfigOpen = $state(false);
  let isSettingsOpen = $state(false);

  // =========================================================================
  // Derived State
  // =========================================================================

  const cellCount = $derived(composition.layout.rows * composition.layout.cols);

  const hasEmptyCells = $derived(
    composition.cells.some((cell) => !isCellConfigured(cell))
  );

  const canPlay = $derived(
    composition.cells.some((cell) => isCellConfigured(cell))
  );

  const isComplete = $derived(isCompositionComplete(composition));

  const selectedCell = $derived(
    selectedCellId
      ? composition.cells.find((c) => c.id === selectedCellId) ?? null
      : null
  );

  // =========================================================================
  // Layout Mutations
  // =========================================================================

  function setLayout(newLayout: GridLayout) {
    const oldCells = composition.cells;
    const newCells = createEmptyCells(newLayout);

    // Preserve existing cell configurations where positions match
    for (const newCell of newCells) {
      const oldCell = oldCells.find((c) => c.id === newCell.id);
      if (oldCell) {
        newCell.type = oldCell.type;
        newCell.sequences = oldCell.sequences;
        newCell.trailSettings = oldCell.trailSettings;
        newCell.rotationOffset = oldCell.rotationOffset;
        newCell.isMirrored = oldCell.isMirrored;
        newCell.mirrorSourceCellId = oldCell.mirrorSourceCellId;
      }
    }

    composition = {
      ...composition,
      layout: newLayout,
      cells: newCells,
      updatedAt: new Date(),
    };

    // Clear selection if selected cell no longer exists
    if (selectedCellId && !newCells.find((c) => c.id === selectedCellId)) {
      selectedCellId = null;
    }

    console.log("🎨 Composition: Layout changed to", newLayout);
  }

  function applyTemplate(templateId: string) {
    const template = getTemplateById(templateId);
    if (!template) {
      console.warn(`Template not found: ${templateId}`);
      return;
    }

    const newCells = createCellsFromTemplate(template);

    composition = {
      ...composition,
      layout: template.layout,
      cells: newCells,
      updatedAt: new Date(),
    };

    selectedCellId = null;
    closeAllSheets();

    console.log("🎨 Composition: Applied template", templateId);
  }

  // =========================================================================
  // Cell Mutations
  // =========================================================================

  function updateCell(cellId: string, updates: Partial<CellConfig>) {
    const cellIndex = composition.cells.findIndex((c) => c.id === cellId);
    if (cellIndex === -1) return;

    const existingCell = composition.cells[cellIndex];
    if (!existingCell) return;

    const updatedCells = [...composition.cells];
    updatedCells[cellIndex] = {
      ...existingCell,
      ...updates,
    };

    composition = {
      ...composition,
      cells: updatedCells,
      updatedAt: new Date(),
    };
  }

  function setCellType(cellId: string, type: CellType) {
    const cell = composition.cells.find((c) => c.id === cellId);
    if (!cell) return;

    // If switching from tunnel to single, keep only first sequence
    let sequences = cell.sequences;
    if (type === "single" && cell.sequences.length > 1) {
      const firstSequence = cell.sequences[0];
      sequences = firstSequence ? [firstSequence] : [];
    }

    updateCell(cellId, { type, sequences });
    console.log(`🎨 Composition: Cell ${cellId} type set to ${type}`);
  }

  function setCellSequences(cellId: string, sequences: SequenceData[]) {
    updateCell(cellId, { sequences });
    console.log(`🎨 Composition: Cell ${cellId} sequences updated`, sequences.map((s) => s.name));
  }

  function addSequenceToCell(cellId: string, sequence: SequenceData) {
    const cell = composition.cells.find((c) => c.id === cellId);
    if (!cell) return;

    const maxSequences = cell.type === "tunnel" ? 4 : 1;
    if (cell.sequences.length >= maxSequences) {
      // Replace last sequence if at max
      const newSequences = [...cell.sequences.slice(0, -1), sequence];
      setCellSequences(cellId, newSequences);
    } else {
      setCellSequences(cellId, [...cell.sequences, sequence]);
    }
  }

  function removeSequenceFromCell(cellId: string, sequenceIndex: number) {
    const cell = composition.cells.find((c) => c.id === cellId);
    if (!cell || sequenceIndex < 0 || sequenceIndex >= cell.sequences.length) return;

    const newSequences = cell.sequences.filter((_, i) => i !== sequenceIndex);
    setCellSequences(cellId, newSequences);
  }

  function setCellTrailSettings(cellId: string, settings: Partial<TrailSettings>) {
    const cell = composition.cells.find((c) => c.id === cellId);
    if (!cell) return;

    updateCell(cellId, {
      trailSettings: { ...cell.trailSettings, ...settings },
    });
  }

  function setCellRotation(cellId: string, rotation: number) {
    updateCell(cellId, { rotationOffset: rotation });
  }

  function clearCell(cellId: string) {
    updateCell(cellId, {
      sequences: [],
      type: "single",
      rotationOffset: 0,
      isMirrored: false,
      mirrorSourceCellId: undefined,
    });
    console.log(`🎨 Composition: Cell ${cellId} cleared`);
  }

  // =========================================================================
  // Playback Mutations
  // =========================================================================

  function play() {
    if (!canPlay) return;
    isPlaying = true;
    console.log("▶️ Composition: Playing");
  }

  function pause() {
    isPlaying = false;
    console.log("⏸️ Composition: Paused");
  }

  function stop() {
    isPlaying = false;
    currentBeat = 0;
    console.log("⏹️ Composition: Stopped");
  }

  function togglePlayPause() {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function togglePreview() {
    isPreviewing = !isPreviewing;
    saveToStorage(STORAGE_KEYS.PREVIEW_MODE, isPreviewing);
    console.log(`👁️ Composition: Preview mode ${isPreviewing ? "ON" : "OFF"}`);
  }

  function setBpm(newBpm: number) {
    bpm = Math.max(30, Math.min(180, newBpm));
    saveToStorage(STORAGE_KEYS.PLAYBACK_BPM, bpm);
    console.log(`⏩ Composition: BPM set to ${bpm}`);
  }

  function setLoop(loop: boolean) {
    shouldLoop = loop;
  }

  function setBeat(beat: number) {
    currentBeat = beat;
  }

  // =========================================================================
  // UI Mutations
  // =========================================================================

  function selectCell(cellId: string | null) {
    selectedCellId = cellId;
    if (cellId) {
      console.log(`🎯 Composition: Selected cell ${cellId}`);
    }
  }

  function openTemplates() {
    closeAllSheets();
    isTemplatesOpen = true;
  }

  function closeTemplates() {
    isTemplatesOpen = false;
  }

  function openCellConfig(cellId: string) {
    closeAllSheets();
    selectedCellId = cellId;
    isCellConfigOpen = true;
  }

  function closeCellConfig() {
    isCellConfigOpen = false;
  }

  function openSettings() {
    closeAllSheets();
    isSettingsOpen = true;
  }

  function closeSettings() {
    isSettingsOpen = false;
  }

  function closeAllSheets() {
    isTemplatesOpen = false;
    isCellConfigOpen = false;
    isSettingsOpen = false;
  }

  function setShowOverlayControls(show: boolean) {
    showOverlayControls = show;
  }

  // =========================================================================
  // Composition Management
  // =========================================================================

  function setName(name: string) {
    composition = {
      ...composition,
      name,
      updatedAt: new Date(),
    };
  }

  function toggleFavorite() {
    composition = {
      ...composition,
      isFavorite: !composition.isFavorite,
      updatedAt: new Date(),
    };
  }

  function reset() {
    composition = createDefaultComposition();
    selectedCellId = null;
    isPlaying = false;
    currentBeat = 0;
    closeAllSheets();
    console.log("🔄 Composition: Reset");
  }

  function loadComposition(comp: Composition) {
    composition = comp;
    selectedCellId = null;
    isPlaying = false;
    currentBeat = 0;
    closeAllSheets();
    console.log("📂 Composition: Loaded", comp.name);
  }

  // =========================================================================
  // Return State Object
  // =========================================================================

  return {
    // Core state getters
    get composition() { return composition; },
    get isPlaying() { return isPlaying; },
    get isPreviewing() { return isPreviewing; },
    get bpm() { return bpm; },
    get shouldLoop() { return shouldLoop; },
    get currentBeat() { return currentBeat; },

    // UI state getters
    get selectedCellId() { return selectedCellId; },
    get showOverlayControls() { return showOverlayControls; },
    get isTemplatesOpen() { return isTemplatesOpen; },
    get isCellConfigOpen() { return isCellConfigOpen; },
    get isSettingsOpen() { return isSettingsOpen; },

    // Derived getters
    get cellCount() { return cellCount; },
    get hasEmptyCells() { return hasEmptyCells; },
    get canPlay() { return canPlay; },
    get isComplete() { return isComplete; },
    get selectedCell() { return selectedCell; },

    // Layout mutations
    setLayout,
    applyTemplate,

    // Cell mutations
    setCellType,
    setCellSequences,
    addSequenceToCell,
    removeSequenceFromCell,
    setCellTrailSettings,
    setCellRotation,
    clearCell,

    // Playback mutations
    play,
    pause,
    stop,
    togglePlayPause,
    togglePreview,
    setBpm,
    setLoop,
    setBeat,

    // UI mutations
    selectCell,
    openTemplates,
    closeTemplates,
    openCellConfig,
    closeCellConfig,
    openSettings,
    closeSettings,
    closeAllSheets,
    setShowOverlayControls,

    // Composition management
    setName,
    toggleFavorite,
    reset,
    loadComposition,
  };
}

// ============================================================================
// Singleton Instance
// ============================================================================

let compositionStateInstance: CompositionState | null = null;

export function getCompositionState(): CompositionState {
  if (!compositionStateInstance) {
    compositionStateInstance = createCompositionState();
  }
  return compositionStateInstance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetCompositionState(): void {
  compositionStateInstance = null;
}
