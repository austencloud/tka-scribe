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

// ============================================================================
// Workflow Phase Types
// ============================================================================

/** Workflow phases within the Arrange tab */
export type WorkflowPhase = "canvas" | "audio" | "export";

/** Beat marker for audio sync */
export interface BeatMarker {
  id: string;
  beat: number;
  time: number; // seconds
  isHalfBeat?: boolean;
  cellId?: string; // for per-cell custom timing
}

/** Tempo region for variable BPM support */
export interface TempoRegion {
  id: string;
  startTime: number; // seconds
  endTime: number; // seconds
  bpm: number;
  /** Optional: ramp from previous region's BPM */
  rampFromPrevious?: boolean;
}

/** Audio state for the composition */
export interface AudioState {
  file: File | null;
  url: string | null;
  fileName: string | null;
  duration: number; // seconds
  detectedBpm: number | null;
  manualBpm: number | null; // user override
  globalBeatMarkers: BeatMarker[];
  /** Tempo regions for variable BPM (empty = use detectedBpm/manualBpm) */
  tempoRegions: TempoRegion[];
  isAnalyzing: boolean;
  isLoaded: boolean;
}
import {
  generateCellId,
  createEmptyCells,
  getDefaultTrailSettings,
  isCellConfigured,
  isCompositionComplete,
} from "../domain/types";
import { createCellsFromTemplate, getTemplateById } from "../domain/templates";
import {
  saveAudioToCache,
  loadAudioFromCache,
  clearAudioCache,
  updateAudioCacheMetadata,
} from "../phases/audio/audio-persistence";

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  COMPOSITION: "compose-current-composition",
  PREVIEW_MODE: "compose-preview-mode",
  PLAYBACK_BPM: "compose-playback-bpm",
  WORKFLOW_PHASE: "compose-workflow-phase",
} as const;

// ============================================================================
// Default Audio State
// ============================================================================

function createDefaultAudioState(): AudioState {
  return {
    file: null,
    url: null,
    fileName: null,
    duration: 0,
    detectedBpm: null,
    manualBpm: null,
    globalBeatMarkers: [],
    tempoRegions: [],
    isAnalyzing: false,
    isLoaded: false,
  };
}

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
  let isTemplatesOpen = $state(false);
  let isCellConfigOpen = $state(false);
  let isSettingsOpen = $state(false);
  let isFullscreen = $state(false);

  // Workflow phase state (persisted)
  let currentPhase = $state<WorkflowPhase>(
    loadFromStorage(STORAGE_KEYS.WORKFLOW_PHASE, "canvas")
  );

  // Audio state (not persisted - audio files don't survive page reload)
  let audioState = $state<AudioState>(createDefaultAudioState());

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

  // Effective BPM: manual override > detected > default
  const effectiveBpm = $derived(
    audioState.manualBpm ?? audioState.detectedBpm ?? bpm
  );

  // Whether audio is configured
  const hasAudio = $derived(audioState.isLoaded && audioState.url !== null);

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

  function setCellMediaType(cellId: string, mediaType: "animation" | "video" | "beatGrid" | "image") {
    updateCell(cellId, { mediaType });
    console.log(`🎨 Composition: Cell ${cellId} media type set to ${mediaType}`);
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

  function enterFullscreen() {
    closeAllSheets();
    isFullscreen = true;
    console.log("⛶ Composition: Entered fullscreen");
  }

  function exitFullscreen() {
    isFullscreen = false;
    console.log("⛶ Composition: Exited fullscreen");
  }

  function toggleFullscreen() {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  // =========================================================================
  // Workflow Phase Mutations
  // =========================================================================

  function setCurrentPhase(phase: WorkflowPhase) {
    currentPhase = phase;
    saveToStorage(STORAGE_KEYS.WORKFLOW_PHASE, phase);
    console.log(`📍 Composition: Phase changed to ${phase}`);
  }

  function goToCanvas() {
    setCurrentPhase("canvas");
  }

  function goToAudio() {
    setCurrentPhase("audio");
  }

  function goToExport() {
    setCurrentPhase("export");
  }

  // =========================================================================
  // Audio State Mutations
  // =========================================================================

  function loadAudioFile(file: File, skipCache = false) {
    // Revoke previous URL if exists
    if (audioState.url) {
      URL.revokeObjectURL(audioState.url);
    }

    const url = URL.createObjectURL(file);
    audioState = {
      ...audioState,
      file,
      url,
      fileName: file.name,
      isLoaded: true,
      isAnalyzing: false,
    };
    console.log(`🎵 Composition: Audio loaded - ${file.name}`);

    // Save to IndexedDB cache (for persistence across refreshes)
    if (!skipCache) {
      saveAudioToCache(file, audioState.duration, audioState.detectedBpm, audioState.manualBpm);
    }
  }

  function setAudioDuration(duration: number) {
    audioState = {
      ...audioState,
      duration,
    };
    // Update cache with new duration
    if (audioState.isLoaded) {
      updateAudioCacheMetadata(duration, undefined, undefined);
    }
  }

  function setDetectedBpm(bpm: number) {
    audioState = {
      ...audioState,
      detectedBpm: bpm,
      isAnalyzing: false,
    };
    console.log(`🎵 Composition: BPM detected - ${bpm}`);
    // Update cache with detected BPM
    if (audioState.isLoaded) {
      updateAudioCacheMetadata(undefined, bpm, undefined);
    }
  }

  function setManualBpm(bpm: number | null) {
    audioState = {
      ...audioState,
      manualBpm: bpm,
    };
    if (bpm !== null) {
      console.log(`🎵 Composition: Manual BPM set - ${bpm}`);
    }
    // Update cache with manual BPM
    if (audioState.isLoaded) {
      updateAudioCacheMetadata(undefined, undefined, bpm);
    }
  }

  function setAnalyzing(analyzing: boolean) {
    audioState = {
      ...audioState,
      isAnalyzing: analyzing,
    };
  }

  function addBeatMarker(marker: BeatMarker) {
    audioState = {
      ...audioState,
      globalBeatMarkers: [...audioState.globalBeatMarkers, marker],
    };
  }

  function removeBeatMarker(markerId: string) {
    audioState = {
      ...audioState,
      globalBeatMarkers: audioState.globalBeatMarkers.filter(
        (m) => m.id !== markerId
      ),
    };
  }

  function updateBeatMarker(markerId: string, updates: Partial<BeatMarker>) {
    audioState = {
      ...audioState,
      globalBeatMarkers: audioState.globalBeatMarkers.map((m) =>
        m.id === markerId ? { ...m, ...updates } : m
      ),
    };
  }

  function setBeatMarkers(markers: BeatMarker[]) {
    audioState = {
      ...audioState,
      globalBeatMarkers: markers,
    };
  }

  function clearAudio() {
    // Revoke URL if exists
    if (audioState.url) {
      URL.revokeObjectURL(audioState.url);
    }
    audioState = createDefaultAudioState();
    // Clear the IndexedDB cache
    clearAudioCache();
    console.log("🎵 Composition: Audio cleared");
  }

  /**
   * Restore audio from IndexedDB cache (called on init)
   */
  async function restoreAudioFromCache(): Promise<boolean> {
    try {
      const cached = await loadAudioFromCache();
      if (cached) {
        // Load the file without re-caching it
        loadAudioFile(cached.file, true);

        // Restore metadata
        if (cached.duration > 0) {
          audioState = { ...audioState, duration: cached.duration };
        }
        if (cached.detectedBpm !== null) {
          audioState = { ...audioState, detectedBpm: cached.detectedBpm };
        }
        if (cached.manualBpm !== null) {
          audioState = { ...audioState, manualBpm: cached.manualBpm };
        }

        console.log("🎵 Composition: Audio restored from cache");
        return true;
      }
    } catch (err) {
      console.warn("Failed to restore audio from cache:", err);
    }
    return false;
  }

  // =========================================================================
  // Tempo Region Mutations (Dynamic BPM)
  // =========================================================================

  function addTempoRegion(region: TempoRegion) {
    // Insert in sorted order by startTime
    const regions = [...audioState.tempoRegions, region].sort(
      (a, b) => a.startTime - b.startTime
    );
    audioState = { ...audioState, tempoRegions: regions };
    console.log(`🎵 Composition: Added tempo region at ${region.startTime}s (${region.bpm} BPM)`);
  }

  function removeTempoRegion(regionId: string) {
    audioState = {
      ...audioState,
      tempoRegions: audioState.tempoRegions.filter((r) => r.id !== regionId),
    };
  }

  function updateTempoRegion(regionId: string, updates: Partial<TempoRegion>) {
    audioState = {
      ...audioState,
      tempoRegions: audioState.tempoRegions
        .map((r) => (r.id === regionId ? { ...r, ...updates } : r))
        .sort((a, b) => a.startTime - b.startTime),
    };
  }

  function setTempoRegions(regions: TempoRegion[]) {
    audioState = {
      ...audioState,
      tempoRegions: [...regions].sort((a, b) => a.startTime - b.startTime),
    };
  }

  function clearTempoRegions() {
    audioState = { ...audioState, tempoRegions: [] };
  }

  /**
   * Get the BPM at a specific time in the audio.
   * Returns the tempo region's BPM if within a region, otherwise falls back to detected/manual BPM.
   */
  function getBpmAtTime(time: number): number {
    // Check if time falls within any tempo region
    for (const region of audioState.tempoRegions) {
      if (time >= region.startTime && time < region.endTime) {
        return region.bpm;
      }
    }
    // Fallback to manual or detected BPM
    return audioState.manualBpm ?? audioState.detectedBpm ?? 120;
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
    currentPhase = "canvas";
    clearAudio();
    closeAllSheets();
    saveToStorage(STORAGE_KEYS.WORKFLOW_PHASE, "canvas");
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
    get isTemplatesOpen() { return isTemplatesOpen; },
    get isCellConfigOpen() { return isCellConfigOpen; },
    get isSettingsOpen() { return isSettingsOpen; },
    get isFullscreen() { return isFullscreen; },

    // Workflow phase getters
    get currentPhase() { return currentPhase; },
    get audioState() { return audioState; },

    // Derived getters
    get cellCount() { return cellCount; },
    get hasEmptyCells() { return hasEmptyCells; },
    get canPlay() { return canPlay; },
    get isComplete() { return isComplete; },
    get selectedCell() { return selectedCell; },
    get effectiveBpm() { return effectiveBpm; },
    get hasAudio() { return hasAudio; },

    // Layout mutations
    setLayout,
    applyTemplate,

    // Cell mutations
    setCellType,
    setCellMediaType,
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
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,

    // Workflow phase mutations
    setCurrentPhase,
    goToCanvas,
    goToAudio,
    goToExport,

    // Audio state mutations
    loadAudioFile,
    setAudioDuration,
    setDetectedBpm,
    setManualBpm,
    setAnalyzing,
    addBeatMarker,
    removeBeatMarker,
    updateBeatMarker,
    setBeatMarkers,
    clearAudio,
    restoreAudioFromCache,

    // Tempo region mutations (dynamic BPM)
    addTempoRegion,
    removeTempoRegion,
    updateTempoRegion,
    setTempoRegions,
    clearTempoRegions,
    getBpmAtTime,

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
