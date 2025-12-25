/**
 * CAP Labeler State Management
 *
 * Reactive state for the CAP Labeler tool using Svelte 5 runes.
 * Manages sequences, labels, filtering, and Firebase synchronization.
 */

import { tryResolve, loadFeatureModule, ensureContainerInitialized } from "$lib/shared/inversify/di";
import { CAPLabelerTypes } from "$lib/shared/inversify/types/cap-labeler.types";
import type { ISequenceLoadingService } from "../services/contracts/ISequenceLoadingService";
import type { ICAPLabelsFirebaseService } from "../services/contracts/ICAPLabelsFirebaseService";
import type { INavigationService } from "../services/contracts/INavigationService";
import type { ICAPDetectionService, CAPDetectionResult } from "../services/contracts/ICAPDetectionService";
import type { SequenceEntry } from "../domain/models/sequence-models";
import type {
  LabeledSequence,
  FilterMode,
} from "../domain/models/label-models";

export type LabelingMode = "whole" | "section" | "beatpair";
export type SyncStatus = "idle" | "syncing" | "synced" | "error";

interface CAPLabelerStateData {
  // Data
  sequences: SequenceEntry[];
  labels: Map<string, LabeledSequence>;

  // Navigation
  currentIndex: number;

  // UI State
  loading: boolean;
  filterMode: FilterMode;
  notes: string;
  syncStatus: SyncStatus;
  labelingMode: LabelingMode;
  showExport: boolean;
  showStartPosition: boolean;
  manualColumnCount: number | null;

  // Subscription cleanup
  unsubscribe: (() => void) | null;
  popstateHandler: ((event: PopStateEvent) => void) | null;
}

class CAPLabelerStateManager {
  private state = $state<CAPLabelerStateData>(this.getInitialState());
  private readonly STORAGE_KEY = "tka-cap-labeler-state";

  // ============================================================
  // PERSISTENCE
  // ============================================================

  private loadPersistedState(): Partial<CAPLabelerStateData> & { lastSequenceId?: string } | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        filterMode: parsed.filterMode || "needsVerification",
        showStartPosition: parsed.showStartPosition ?? true,
        manualColumnCount: parsed.manualColumnCount ?? null,
        labelingMode: parsed.labelingMode || "whole",
        lastSequenceId: parsed.lastSequenceId || null,
      };
    } catch (error) {
      console.warn("[CAPLabelerState] Failed to load persisted state:", error);
      return null;
    }
  }

  /**
   * Persist general state (sequence, display settings) - called during navigation.
   * Does NOT persist filterMode to avoid saving auto-adjusted filters.
   */
  private persistState(): void {
    try {
      const currentSeqId = this.currentSequence?.id || null;
      const existing = this.loadPersistedState();

      const stateToPersist = {
        filterMode: existing?.filterMode || this.state.filterMode,
        showStartPosition: this.state.showStartPosition,
        manualColumnCount: this.state.manualColumnCount,
        labelingMode: this.state.labelingMode,
        lastSequenceId: currentSeqId,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn("[CAPLabelerState] Failed to persist state:", error);
    }
  }

  /**
   * Persist filterMode - only called when user explicitly changes the filter.
   */
  private persistFilterMode(): void {
    try {
      const existing = this.loadPersistedState();
      const stateToPersist = {
        ...existing,
        filterMode: this.state.filterMode,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn("[CAPLabelerState] Failed to persist filterMode:", error);
    }
  }

  // ============================================================
  // HMR SUPPORT
  // ============================================================

  /**
   * Check if state has data (from HMR or previous load)
   * Used to skip re-initialization when data is already available
   */
  get hasData(): boolean {
    return this.state.sequences.length > 0;
  }

  /**
   * Check if state was restored from HMR data
   */
  private wasRestoredFromHMR = false;

  get isHMRRestored(): boolean {
    return this.wasRestoredFromHMR;
  }

  private getInitialState(): CAPLabelerStateData {
    // Preserve state across HMR reloads
    if (import.meta.hot?.data.capLabelerState) {
      console.log("[CAPLabelerState] Restoring from HMR data");
      this.wasRestoredFromHMR = true;
      return import.meta.hot.data.capLabelerState;
    }

    // Load persisted state from localStorage
    const persisted = this.loadPersistedState();

    return {
      sequences: [],
      labels: new Map(),
      currentIndex: 0,
      loading: true,
      filterMode: persisted?.filterMode || "needsVerification",
      notes: "",
      syncStatus: "idle",
      labelingMode: (persisted?.labelingMode as LabelingMode) || "whole",
      showExport: false,
      showStartPosition: persisted?.showStartPosition ?? true,
      manualColumnCount: persisted?.manualColumnCount ?? null,
      unsubscribe: null,
      popstateHandler: null,
    };
  }

  // Store the last sequence ID to restore after initialization
  private lastSequenceIdToRestore: string | null = null;

  // ============================================================
  // GETTERS
  // ============================================================

  get sequences() {
    return this.state.sequences;
  }

  get labels() {
    return this.state.labels;
  }

  get currentIndex() {
    return this.state.currentIndex;
  }

  get loading() {
    return this.state.loading;
  }

  get filterMode() {
    return this.state.filterMode;
  }

  get notes() {
    return this.state.notes;
  }

  get syncStatus() {
    return this.state.syncStatus;
  }

  get labelingMode() {
    return this.state.labelingMode;
  }

  get showExport() {
    return this.state.showExport;
  }

  get showStartPosition() {
    return this.state.showStartPosition;
  }

  get manualColumnCount() {
    return this.state.manualColumnCount;
  }

  // Derived: circular sequences only
  get circularSequences(): SequenceEntry[] {
    return this.state.sequences.filter((s) => s.isCircular);
  }

  // Derived: filtered sequences based on filter mode
  get filteredSequences(): SequenceEntry[] {
    const circular = this.circularSequences;
    const sequenceService = this.getSequenceService();

    if (!sequenceService) {
      return circular;
    }

    return sequenceService.filterSequences(
      circular,
      this.state.labels,
      this.state.filterMode
    );
  }

  // Derived: current sequence
  get currentSequence(): SequenceEntry | null {
    return this.filteredSequences[this.state.currentIndex] ?? null;
  }

  // Derived: current label (from Firebase - just metadata now)
  get currentLabel(): LabeledSequence | null {
    if (!this.currentSequence) return null;
    return this.state.labels.get(this.currentSequence.word) ?? null;
  }

  // Cache for computed detections (keyed by sequence id)
  private detectionCache = new Map<string, CAPDetectionResult>();

  /**
   * Get computed CAP detection for the current sequence
   * Designations are computed on-the-fly, not stored in Firebase
   */
  get currentComputedDetection(): CAPDetectionResult | null {
    if (!this.currentSequence) {
      return null;
    }

    const cacheKey = this.currentSequence.id;

    // Check cache first
    if (this.detectionCache.has(cacheKey)) {
      return this.detectionCache.get(cacheKey)!;
    }

    // Compute detection
    const detectionService = this.getDetectionService();
    if (!detectionService) {
      return null;
    }

    const detection = detectionService.detectCAP(this.currentSequence);
    this.detectionCache.set(cacheKey, detection);

    return detection;
  }

  /**
   * Clear detection cache (call when detection algorithm changes)
   */
  clearDetectionCache() {
    this.detectionCache.clear();
  }

  // Derived: stats
  get stats() {
    const sequenceService = this.getSequenceService();
    if (!sequenceService) {
      return {
        total: this.circularSequences.length,
        needsVerification: 0,
        verified: 0,
      };
    }

    return sequenceService.calculateStats(
      this.circularSequences,
      this.state.labels
    );
  }

  // ============================================================
  // INITIALIZATION
  // ============================================================

  async initialize() {
    const sequenceService = this.getSequenceService();
    const labelsService = this.getLabelsService();

    if (!sequenceService || !labelsService) {
      console.error("[CAPLabelerState] Required services not available");
      this.state.loading = false;
      return;
    }

    try {
      // Load persisted state to get last sequence ID
      const persisted = this.loadPersistedState();
      const lastSequenceId = persisted?.lastSequenceId;
      const navigationService = this.getNavigationService();
      const urlSeqId = navigationService?.getSequenceFromUrl();

      // Store for deferred restoration after labels load
      this.lastSequenceIdToRestore = urlSeqId || lastSequenceId || null;

      // Load sequences
      this.state.sequences = await sequenceService.loadSequences();

      // localStorage is the source of truth for filterMode (already loaded in getInitialState)
      // Only use URL filter if localStorage didn't have one
      if (!persisted?.filterMode) {
        const urlFilter = navigationService?.getFilterFromUrl();
        if (
          urlFilter &&
          ["all", "labeled", "unlabeled", "unknown", "needsVerification", "verified"].includes(urlFilter)
        ) {
          this.state.filterMode = urlFilter as FilterMode;
        }
      }

      // Subscribe to labels from Firebase - sequence restoration happens in callback
      // because filteredSequences depends on labels being loaded
      let isInitialLoad = true;
      // Only treat as "from URL" if URL has a DIFFERENT sequence than localStorage
      // (meaning someone shared a link, not just our own persisted URL)
      const isExternalUrl = urlSeqId !== null && urlSeqId !== lastSequenceId;
      this.state.unsubscribe = labelsService.subscribeToLabels((labels) => {
        this.state.labels = labels;
        console.log(`[CAPLabelerState] Labels loaded: ${labels.size} labels`);

        // Only restore sequence position on initial load, not on subsequent updates
        if (isInitialLoad) {
          isInitialLoad = false;
          this.restoreSequencePosition(this.lastSequenceIdToRestore, isExternalUrl);
        }
      });

      // Set up popstate listener for browser back/forward navigation
      this.setupPopstateListener();
    } catch (error) {
      console.error("[CAPLabelerState] Failed to initialize:", error);
      this.state.loading = false;
    }
  }

  /**
   * Restore sequence position after labels are loaded
   * Called from the labels subscription callback
   */
  private restoreSequencePosition(sequenceId: string | null, isFromUrl: boolean) {
    const navigationService = this.getNavigationService();

    if (sequenceId && this.state.sequences.length > 0) {
      const targetSeq = this.circularSequences.find((s) => s.id === sequenceId);

      if (targetSeq) {
        const label = this.state.labels.get(targetSeq.word);
        const needsVerification = label?.needsVerification === true;
        const isVerified = label && !label.needsVerification;

        // If from URL, adjust filter to show the sequence
        // If from localStorage, only restore if sequence is in current filter
        if (isFromUrl) {
          // URL takes priority - adjust filter if needed
          if (this.state.filterMode === "needsVerification" && !needsVerification) {
            this.state.filterMode = "verified";
          } else if (this.state.filterMode === "verified" && !isVerified) {
            this.state.filterMode = "needsVerification";
          }
        }

        const targetIndex = this.filteredSequences.findIndex((s) => s.id === sequenceId);
        if (targetIndex >= 0) {
          this.state.currentIndex = targetIndex;
          console.log(`[CAPLabelerState] Restored sequence: ${sequenceId} (index ${targetIndex})`);
        } else if (!isFromUrl) {
          // localStorage sequence not in current filter - stay on first item
          console.log(`[CAPLabelerState] Last sequence ${sequenceId} not in current filter (${this.state.filterMode}), staying on first item`);
        }
      }
    }

    // Update URL to match current state (don't add to history on initial load)
    if (navigationService) {
      navigationService.updateUrlWithSequence(
        this.currentSequence?.id ?? null,
        this.state.filterMode,
        false // Don't add initial state to history
      );
      console.log(`[CAPLabelerState] Synced URL to filter: ${this.state.filterMode}, seq: ${this.currentSequence?.id}`);
    }

    // Clear the restore target
    this.lastSequenceIdToRestore = null;

    // Done loading
    this.state.loading = false;
  }

  private setupPopstateListener() {
    if (typeof window === "undefined") return;

    // Remove existing listener if any
    if (this.state.popstateHandler) {
      window.removeEventListener("popstate", this.state.popstateHandler);
    }

    // Create new popstate handler
    const handler = (event: PopStateEvent) => {
      const state = event.state as { sequenceId?: string; filterMode?: string } | null;

      if (state?.sequenceId) {
        // Navigate to the sequence from history state
        this.navigateToSequenceIdWithoutHistory(state.sequenceId);
      } else {
        // Fallback: try to get from URL
        const navigationService = this.getNavigationService();
        const urlSeqId = navigationService?.getSequenceFromUrl();
        if (urlSeqId) {
          this.navigateToSequenceIdWithoutHistory(urlSeqId);
        }
      }
    };

    this.state.popstateHandler = handler;
    window.addEventListener("popstate", handler);
  }

  /**
   * Navigate to a sequence without adding to browser history
   * (used when handling popstate events)
   */
  private navigateToSequenceIdWithoutHistory(sequenceId: string) {
    const targetSeq = this.circularSequences.find((s) => s.id === sequenceId);
    if (!targetSeq) {
      console.warn(`[Popstate] Sequence "${sequenceId}" not found`);
      return;
    }

    const label = this.state.labels.get(targetSeq.word);
    const needsVerification = label?.needsVerification === true;
    const isVerified = label && !label.needsVerification;

    // Adjust filter mode if necessary to show the target sequence
    if (this.state.filterMode === "needsVerification" && !needsVerification) {
      // Switching to verified filter to show the target
      this.state.filterMode = "verified";
    } else if (this.state.filterMode === "verified" && !isVerified) {
      // Switching to needsVerification filter to show the target
      this.state.filterMode = "needsVerification";
    }

    // Find the index in the filtered list
    const targetIndex = this.filteredSequences.findIndex(
      (s) => s.id === sequenceId
    );

    if (targetIndex >= 0) {
      this.state.currentIndex = targetIndex;
      console.log(
        `[Popstate] Navigated to sequence "${sequenceId}" (index ${targetIndex})`
      );
    }
  }

  dispose() {
    if (this.state.unsubscribe) {
      this.state.unsubscribe();
      this.state.unsubscribe = null;
    }

    // Clean up popstate listener
    if (this.state.popstateHandler && typeof window !== "undefined") {
      window.removeEventListener("popstate", this.state.popstateHandler);
      this.state.popstateHandler = null;
    }
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  nextSequence() {
    const navigationService = this.getNavigationService();
    if (!navigationService) return;

    this.state.currentIndex = navigationService.getNextIndex(
      this.state.currentIndex,
      this.filteredSequences.length
    );

    if (this.currentSequence) {
      navigationService.updateUrlWithSequence(
        this.currentSequence.id,
        this.state.filterMode
      );
      this.persistState(); // Persist current sequence
    }
  }

  previousSequence() {
    const navigationService = this.getNavigationService();
    if (!navigationService) return;

    this.state.currentIndex = navigationService.getPreviousIndex(
      this.state.currentIndex
    );

    if (this.currentSequence) {
      navigationService.updateUrlWithSequence(
        this.currentSequence.id,
        this.state.filterMode
      );
      this.persistState(); // Persist current sequence
    }
  }

  skipSequence() {
    this.nextSequence();
  }

  private navigateToSequenceId(sequenceId: string) {
    const targetSeq = this.circularSequences.find((s) => s.id === sequenceId);
    if (!targetSeq) {
      console.warn(`Sequence "${sequenceId}" not found`);
      return;
    }

    const label = this.state.labels.get(targetSeq.word);
    const needsVerification = label?.needsVerification === true;
    const isVerified = label && !label.needsVerification;

    // Adjust filter mode if necessary to show the target sequence
    if (this.state.filterMode === "needsVerification" && !needsVerification) {
      // Switching to verified filter to show the target
      this.state.filterMode = "verified";
    } else if (this.state.filterMode === "verified" && !isVerified) {
      // Switching to needsVerification filter to show the target
      this.state.filterMode = "needsVerification";
    }

    // Find the index in the filtered list
    const targetIndex = this.filteredSequences.findIndex(
      (s) => s.id === sequenceId
    );

    if (targetIndex >= 0) {
      this.state.currentIndex = targetIndex;
      // Update URL
      const navigationService = this.getNavigationService();
      if (navigationService) {
        navigationService.updateUrlWithSequence(
          sequenceId,
          this.state.filterMode
        );
      }
      // Persist state with new sequence
      this.persistState();
      console.log(
        `Navigated to sequence "${sequenceId}" (index ${targetIndex}, filter: ${this.state.filterMode})`
      );
    }
  }

  /**
   * Public method to jump to a specific sequence by ID
   */
  jumpToSequence(sequenceId: string) {
    this.navigateToSequenceId(sequenceId);
  }

  // ============================================================
  // FILTERS & UI STATE
  // ============================================================

  setFilterMode(mode: FilterMode) {
    console.log(`[CAPLabelerState] setFilterMode called with: ${mode}`);
    this.state.filterMode = mode;
    this.state.currentIndex = 0; // Reset to first in filtered list
    // Use persistFilterMode since user explicitly changed filter
    this.persistFilterMode();

    // Update URL with new filter and first sequence in filtered list
    const navigationService = this.getNavigationService();
    if (navigationService) {
      const firstSeq = this.filteredSequences[0];
      navigationService.updateUrlWithSequence(firstSeq?.id ?? null, mode);
    }
  }

  setNotes(notes: string) {
    this.state.notes = notes;
  }

  setLoading(loading: boolean) {
    this.state.loading = loading;
  }

  setLabelingMode(mode: LabelingMode) {
    this.state.labelingMode = mode;
    this.persistState();
  }

  setShowExport(show: boolean) {
    this.state.showExport = show;
  }

  setShowStartPosition(show: boolean) {
    this.state.showStartPosition = show;
    this.persistState();
  }

  setManualColumnCount(count: number | null) {
    this.state.manualColumnCount = count;
    this.persistState();
  }

  // ============================================================
  // LABELS MANAGEMENT
  // ============================================================

  async saveLabel(label: LabeledSequence) {
    const labelsService = this.getLabelsService();
    if (!labelsService) return;

    this.state.labels.set(label.word, label);
    this.state.labels = new Map(this.state.labels); // Trigger reactivity

    // Save to localStorage as backup
    labelsService.saveToLocalStorage(this.state.labels);

    // Save to Firebase
    this.state.syncStatus = "syncing";
    try {
      await labelsService.saveLabelToFirebase(label.word, label);
      this.state.syncStatus = "synced";
    } catch (error) {
      console.error("[CAPLabelerState] Failed to save label:", error);
      this.state.syncStatus = "error";
    }
  }

  async removeLabel(word: string) {
    const labelsService = this.getLabelsService();
    if (!labelsService) return;

    this.state.labels.delete(word);
    this.state.labels = new Map(this.state.labels); // Trigger reactivity

    // Save to localStorage as backup
    labelsService.saveToLocalStorage(this.state.labels);

    // Delete from Firebase
    this.state.syncStatus = "syncing";
    try {
      await labelsService.deleteLabelFromFirebase(word);
      this.state.syncStatus = "synced";
    } catch (error) {
      console.error("[CAPLabelerState] Failed to delete label:", error);
      this.state.syncStatus = "error";
    }
  }

  // ============================================================
  // EXPORT / IMPORT
  // ============================================================

  exportLabels() {
    const navigationService = this.getNavigationService();
    if (!navigationService) return;

    navigationService.exportLabelsAsJson(this.state.labels);
  }

  async importLabels(file: File) {
    const navigationService = this.getNavigationService();
    const labelsService = this.getLabelsService();
    if (!navigationService || !labelsService) return;

    try {
      const importedLabels = await navigationService.importLabelsFromJson(file);
      this.state.labels = importedLabels;
      labelsService.saveToLocalStorage(this.state.labels);
      console.log(`Imported ${importedLabels.size} labels`);
    } catch (error) {
      console.error("[CAPLabelerState] Failed to import labels:", error);
    }
  }

  async syncLocalStorageToFirebase() {
    const labelsService = this.getLabelsService();
    if (!labelsService) return;

    this.state.syncStatus = "syncing";
    try {
      await labelsService.syncLocalStorageToFirebase(this.state.labels);
      this.state.syncStatus = "synced";
    } catch (error) {
      console.error("[CAPLabelerState] Failed to sync to Firebase:", error);
      this.state.syncStatus = "error";
    }
  }

  async deleteLabel(word: string) {
    const labelsService = this.getLabelsService();
    if (!labelsService) return;

    try {
      // Update local state first
      this.state.labels.delete(word);
      this.state.labels = new Map(this.state.labels); // Trigger reactivity

      // Save to localStorage as backup
      labelsService.saveToLocalStorage(this.state.labels);

      // Delete from Firebase
      this.state.syncStatus = "syncing";
      await labelsService.deleteLabelFromFirebase(word);
      this.state.syncStatus = "synced";
      console.log(`Deleted label for "${word}"`);
    } catch (error) {
      console.error("[CAPLabelerState] Failed to delete label:", error);
      this.state.syncStatus = "error";
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private getSequenceService(): ISequenceLoadingService | null {
    if (this.cachedSequenceService) {
      return this.cachedSequenceService;
    }

    const service = tryResolve<ISequenceLoadingService>(
      CAPLabelerTypes.ISequenceLoadingService
    );
    if (service) {
      this.cachedSequenceService = service;
    }
    return service;
  }

  // Cache service instances to survive container issues
  private cachedLabelsService: ICAPLabelsFirebaseService | null = null;
  private cachedSequenceService: ISequenceLoadingService | null = null;
  private cachedNavigationService: INavigationService | null = null;
  private cachedDetectionService: ICAPDetectionService | null = null;

  private getLabelsService(): ICAPLabelsFirebaseService | null {
    if (this.cachedLabelsService) {
      return this.cachedLabelsService;
    }

    try {
      const service = tryResolve<ICAPLabelsFirebaseService>(
        CAPLabelerTypes.ICAPLabelsFirebaseService
      );
      if (service) {
        this.cachedLabelsService = service;
      }
      return service;
    } catch (err) {
      return null;
    }
  }

  private getNavigationService(): INavigationService | null {
    if (this.cachedNavigationService) {
      return this.cachedNavigationService;
    }

    const service = tryResolve<INavigationService>(
      CAPLabelerTypes.INavigationService
    );
    if (service) {
      this.cachedNavigationService = service;
    }
    return service;
  }

  private getDetectionService(): ICAPDetectionService | null {
    if (this.cachedDetectionService) {
      return this.cachedDetectionService;
    }

    const service = tryResolve<ICAPDetectionService>(
      CAPLabelerTypes.ICAPLabelerDetectionService
    );
    if (service) {
      this.cachedDetectionService = service;
    }
    return service;
  }

  reset() {
    this.dispose();
    // Clear cached services
    this.cachedLabelsService = null;
    this.cachedSequenceService = null;
    this.cachedNavigationService = null;
    this.cachedDetectionService = null;
    this.state = {
      sequences: [],
      labels: new Map(),
      currentIndex: 0,
      loading: false,
      filterMode: "needsVerification",
      notes: "",
      syncStatus: "idle",
      labelingMode: "whole",
      showExport: false,
      showStartPosition: true,
      manualColumnCount: null,
      unsubscribe: null,
      popstateHandler: null,
    };
  }

  /**
   * Pre-cache all services (call after DI module is loaded)
   */
  cacheServices() {
    this.getSequenceService();
    this.getLabelsService();
    this.getNavigationService();
    this.getDetectionService();
  }
}

// Export singleton instance
export const capLabelerState = new CAPLabelerStateManager();

// HMR: Save state before hot reload
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    import.meta.hot!.data.capLabelerState = {
      sequences: capLabelerState.sequences,
      labels: capLabelerState.labels,
      currentIndex: capLabelerState.currentIndex,
      loading: capLabelerState.loading,
      filterMode: capLabelerState.filterMode,
      notes: capLabelerState.notes,
      syncStatus: capLabelerState.syncStatus,
      labelingMode: capLabelerState.labelingMode,
      showExport: capLabelerState.showExport,
      showStartPosition: capLabelerState.showStartPosition,
      manualColumnCount: capLabelerState.manualColumnCount,
      unsubscribe: capLabelerState["state"].unsubscribe,
      popstateHandler: null, // Don't preserve event handlers across HMR
    };
  });
}
