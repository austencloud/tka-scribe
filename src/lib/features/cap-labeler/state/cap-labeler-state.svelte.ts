/**
 * CAP Labeler State Management
 *
 * Reactive state for the CAP Labeler tool using Svelte 5 runes.
 * Manages sequences, labels, filtering, and Firebase synchronization.
 */

import { tryResolve } from "$lib/shared/inversify/di";
import { CAPLabelerTypes } from "$lib/shared/inversify/types/cap-labeler.types";
import type { ISequenceLoadingService } from "../services/contracts/ISequenceLoadingService";
import type { ICAPLabelsFirebaseService } from "../services/contracts/ICAPLabelsFirebaseService";
import type { INavigationService } from "../services/contracts/INavigationService";
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
}

class CAPLabelerStateManager {
  private state = $state<CAPLabelerStateData>(this.getInitialState());
  private readonly STORAGE_KEY = "tka-cap-labeler-state";

  // ============================================================
  // PERSISTENCE
  // ============================================================

  private loadPersistedState(): Partial<CAPLabelerStateData> | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      return {
        filterMode: parsed.filterMode || "all",
        showStartPosition: parsed.showStartPosition ?? true,
        manualColumnCount: parsed.manualColumnCount ?? null,
      };
    } catch (error) {
      console.warn("[CAPLabelerState] Failed to load persisted state:", error);
      return null;
    }
  }

  private persistState(): void {
    try {
      const stateToPersist = {
        filterMode: this.state.filterMode,
        showStartPosition: this.state.showStartPosition,
        manualColumnCount: this.state.manualColumnCount,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToPersist));
    } catch (error) {
      console.warn("[CAPLabelerState] Failed to persist state:", error);
    }
  }

  // ============================================================
  // HMR SUPPORT
  // ============================================================

  private getInitialState(): CAPLabelerStateData {
    // Preserve state across HMR reloads
    if (import.meta.hot?.data.capLabelerState) {
      return import.meta.hot.data.capLabelerState;
    }

    // Load persisted state from localStorage
    const persisted = this.loadPersistedState();

    return {
      sequences: [],
      labels: new Map(),
      currentIndex: 0,
      loading: true,
      filterMode: persisted?.filterMode || "all",
      notes: "",
      syncStatus: "idle",
      labelingMode: "whole",
      showExport: false,
      showStartPosition: persisted?.showStartPosition ?? true,
      manualColumnCount: persisted?.manualColumnCount ?? null,
      unsubscribe: null,
    };
  }

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

  // Derived: current label
  get currentLabel(): LabeledSequence | null {
    if (!this.currentSequence) return null;
    return this.state.labels.get(this.currentSequence.word) ?? null;
  }

  // Derived: stats
  get stats() {
    const sequenceService = this.getSequenceService();
    if (!sequenceService) {
      return {
        total: this.circularSequences.length,
        labeled: this.state.labels.size,
        unlabeled: this.circularSequences.length - this.state.labels.size,
        unknown: 0,
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
      // Load sequences
      this.state.sequences = await sequenceService.loadSequences();

      // Subscribe to labels from Firebase
      this.state.unsubscribe = labelsService.subscribeToLabels((labels) => {
        this.state.labels = labels;
      });

      // Handle URL navigation if present
      const navigationService = this.getNavigationService();

      // Restore filter mode from URL first (takes priority over localStorage)
      const urlFilter = navigationService?.getFilterFromUrl();
      if (
        urlFilter &&
        ["all", "labeled", "unlabeled", "unknown"].includes(urlFilter)
      ) {
        this.state.filterMode = urlFilter as FilterMode;
      }

      // Then navigate to sequence if specified
      const urlSeqId = navigationService?.getSequenceFromUrl();
      if (urlSeqId && this.state.sequences.length > 0) {
        this.navigateToSequenceId(urlSeqId);
      }

      // Update URL with current state
      if (navigationService && this.currentSequence) {
        navigationService.updateUrlWithSequence(
          this.currentSequence.id,
          this.state.filterMode
        );
      }
    } catch (error) {
      console.error("[CAPLabelerState] Failed to initialize:", error);
    } finally {
      this.state.loading = false;
    }
  }

  dispose() {
    if (this.state.unsubscribe) {
      this.state.unsubscribe();
      this.state.unsubscribe = null;
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

    const isLabeled = this.state.labels.has(targetSeq.word);
    const label = this.state.labels.get(targetSeq.word);
    const isUnknown = label?.isUnknown === true;

    // Adjust filter mode if necessary to show the target sequence
    if (this.state.filterMode === "unlabeled" && isLabeled) {
      this.state.filterMode = "all";
    } else if (this.state.filterMode === "labeled" && !isLabeled) {
      this.state.filterMode = "all";
    } else if (this.state.filterMode === "unknown" && !isUnknown) {
      this.state.filterMode = "all";
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
    this.state.filterMode = mode;
    this.state.currentIndex = 0; // Reset to first in filtered list
    this.persistState();

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

  setLabelingMode(mode: LabelingMode) {
    this.state.labelingMode = mode;
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
    const service = tryResolve<ISequenceLoadingService>(
      CAPLabelerTypes.ISequenceLoadingService
    );
    if (!service) {
      console.warn("[CAPLabelerState] SequenceLoadingService not available");
    }
    return service;
  }

  private getLabelsService(): ICAPLabelsFirebaseService | null {
    const service = tryResolve<ICAPLabelsFirebaseService>(
      CAPLabelerTypes.ICAPLabelsFirebaseService
    );
    if (!service) {
      console.warn("[CAPLabelerState] CAPLabelsFirebaseService not available");
    }
    return service;
  }

  private getNavigationService(): INavigationService | null {
    const service = tryResolve<INavigationService>(
      CAPLabelerTypes.INavigationService
    );
    if (!service) {
      console.warn("[CAPLabelerState] NavigationService not available");
    }
    return service;
  }

  reset() {
    this.dispose();
    this.state = {
      sequences: [],
      labels: new Map(),
      currentIndex: 0,
      loading: false,
      filterMode: "all",
      notes: "",
      syncStatus: "idle",
      labelingMode: "whole",
      showExport: false,
      showStartPosition: true,
      manualColumnCount: null,
      unsubscribe: null,
    };
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
    };
  });
}
