/**
 * DiscoverEventHandlerService - Handles all discover module events and actions
 *
 * Coordinates sequence actions, detail panel interactions, and navigation
 * following the service-based architecture pattern.
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { injectable, inject, optional } from "inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type {
  IDiscoverEventHandlerService,
  ExploreEventHandlerParams,
} from "../contracts/IDiscoverEventHandlerService";
import { openSpotlightViewer } from "../../../../../shared/application/state/ui/ui-state.svelte";
import type { IDiscoverThumbnailService } from "../../../gallery/display/services/contracts/IDiscoverThumbnailService";
import type { IDiscoverLoader } from "../../../gallery/display/services/contracts/IDiscoverLoader";
import { galleryPanelManager } from "../../state/gallery-panel-state.svelte";
import type { ISheetRouterService } from "../../../../../shared/navigation/services/contracts/ISheetRouterService";
import { handleModuleChange } from "../../../../../shared/navigation-coordinator/navigation-coordinator.svelte";
@injectable()
export class DiscoverEventHandlerService implements IDiscoverEventHandlerService {
  private params: ExploreEventHandlerParams | null = null;

  constructor(
    @inject(TYPES.IDiscoverThumbnailService)
    private thumbnailService: IDiscoverThumbnailService,

    @inject(TYPES.ISheetRouterService)
    @optional()
    private sheetRouterService: ISheetRouterService | null,

    @inject(TYPES.IDiscoverLoader)
    @optional()
    private loaderService: IDiscoverLoader | null
  ) {}

  /**
   * Initialize the service with required parameters
   * Called by DiscoverModule on mount
   */
  initialize(params: ExploreEventHandlerParams): void {
    this.params = params;
  }

  private ensureInitialized(): void {
    if (!this.params) {
      throw new Error("DiscoverEventHandlerService not initialized");
    }
  }

  handleSequenceSelect(sequence: SequenceData): void {
    this.ensureInitialized();
    this.params!.setSelectedSequence(sequence);
    this.params!.galleryState.selectSequence(sequence);
  }

  async handleSequenceAction(
    action: string,
    sequence: SequenceData
  ): Promise<void> {
    this.ensureInitialized();

    try {
      switch (action) {
        case "select":
          this.handleSequenceSelect(sequence);
          break;
        case "view-detail":
          this.handleViewDetail(sequence);
          break;
        case "delete":
          this.handleSequenceDelete(sequence);
          break;
        case "favorite":
          await this.params!.galleryState.toggleFavorite(sequence.id);
          break;
        case "fullscreen":
          this.handleSpotlightView(sequence);
          break;
        case "animate":
          this.params!.galleryState.openAnimationModal(sequence);
          break;
        default:
          console.warn("⚠️ Unknown action:", action);
      }
    } catch (err) {
      console.error("❌ Action failed:", err);
      this.params!.setError(
        err instanceof Error ? err.message : `Failed to ${action} sequence`
      );
    }
  }

  handleViewDetail(sequence: SequenceData): void {
    galleryPanelManager.openDetail(sequence);
  }

  handleCloseDetailPanel(): void {
    galleryPanelManager.close();
  }

  async handleEditSequence(sequence: SequenceData): Promise<void> {
    this.ensureInitialized();

    try {
      // Gallery sequences have empty beats - need to load full sequence data
      let fullSequence = sequence;
      if (!sequence.beats || sequence.beats.length === 0) {
        if (this.loaderService) {
          const sequenceName = sequence.word || sequence.id;
          const loaded = await this.loaderService.loadFullSequenceData(sequenceName);
          if (loaded) {
            fullSequence = loaded;
          }
        }
      }

      // Store the full sequence data in localStorage for the Create module to pick up
      localStorage.setItem(
        "tka-pending-edit-sequence",
        JSON.stringify(fullSequence)
      );

      // Close the detail panel if open
      this.handleCloseDetailPanel();

      // Navigate to Create module's constructor tab using coordinator
      // (handleModuleChange does both state update AND module switch)
      void handleModuleChange("create", "constructor");
    } catch (err) {
      console.error("Failed to initiate edit:", err);
      this.params!.setError(
        err instanceof Error
          ? err.message
          : "Failed to open sequence for editing"
      );
    }
  }

  async handleDetailPanelAction(
    action: string,
    sequence: SequenceData
  ): Promise<void> {
    this.ensureInitialized();

    // Handle actions from the detail panel
    switch (action) {
      case "play":
      case "animate":
        this.params!.galleryState.openAnimationModal(sequence);
        break;
      case "fullscreen":
        this.handleSpotlightView(sequence);
        break;
      case "favorite":
        await this.params!.galleryState.toggleFavorite(sequence.id);
        break;
      case "edit":
        this.handleEditSequence(sequence);
        break;
      case "delete":
        this.handleSequenceDelete(sequence);
        this.handleCloseDetailPanel(); // Close panel before showing delete dialog
        break;
      default:
        console.warn("⚠️ Unknown detail panel action:", action);
    }
  }

  handleSequenceDelete(sequence: SequenceData): void {
    this.ensureInitialized();
    this.params!.setDeleteConfirmationData({
      sequence: sequence,
      relatedSequences: [],
      totalCount: 1,
    });
  }

  handleSpotlightView(sequence: SequenceData): void {
    openSpotlightViewer(sequence, this.thumbnailService);

    // Also update URL for sharing/bookmarking
    this.sheetRouterService?.openSpotlight(sequence.id);
  }

  async handleDeleteConfirm(deleteConfirmationData: Record<string, unknown> | null): Promise<void> {
    this.ensureInitialized();

    if (!deleteConfirmationData?.sequence) return;

    try {
      // TODO: Implement actual delete logic
      const sequence = deleteConfirmationData.sequence as Record<string, unknown>;
      console.log("🗑️ Deleting sequence:", sequence.id);
      this.params!.setDeleteConfirmationData(null);
      // Refresh the sequence list
      await this.params!.galleryState.loadAllSequences();
    } catch (err: unknown) {
      console.error("❌ Delete failed:", err);
      this.params!.setError(
        err instanceof Error ? err.message : "Failed to delete sequence"
      );
    }
  }

  handleDeleteCancel(): void {
    this.ensureInitialized();
    this.params!.setDeleteConfirmationData(null);
  }

  handleErrorDismiss(): void {
    this.ensureInitialized();
    this.params!.setError(null);
  }

  handleRetry(): void {
    this.ensureInitialized();
    this.params!.setError(null);
    void this.params!.galleryState.loadAllSequences();
  }
}
