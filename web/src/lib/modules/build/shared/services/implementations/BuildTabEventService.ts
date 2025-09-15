/**
 * ConstructTab Event Service
 *
 * Centralized event handling for the ConstructTab component.
 * This service handles all the event coordination between different child components
 * that was previously scattered throughout the massive ConstructTab component.
 */

import { createBeatData, type BeatData } from "$build/workbench";
import { resolve, TYPES, type IOrientationCalculationService, type PictographData, type SequenceData } from "$shared";
import { injectable } from "inversify";
import type { IBuildTabEventService, IConstructSubTabCoordinationService, ISequenceStateService } from "../contracts";


@injectable()
export class BuildTabEventService implements IBuildTabEventService {
  private constructCoordinator: IConstructSubTabCoordinationService | null = null;
  private sequenceStateService: ISequenceStateService | null = null;
  private orientationCalculationService: IOrientationCalculationService | null = null;
  private initialized = false;

  // Callback to access current sequence from component state
  private getCurrentSequenceCallback: (() => SequenceData | null) | null = null;
  private updateSequenceCallback: ((sequence: SequenceData) => void) | null = null;

  constructor() {
    // Don't initialize services in constructor - wait for lazy initialization
  }

  private initializeServices() {
    if (this.initialized) {
      return; // Already initialized
    }

    try {
      this.constructCoordinator = resolve<IConstructSubTabCoordinationService>(TYPES.IConstructTabCoordinator);
      this.sequenceStateService = resolve<ISequenceStateService>(TYPES.ISequenceStateService);
      this.orientationCalculationService = resolve<IOrientationCalculationService>(TYPES.IOrientationCalculationService);
      this.initialized = true;
    } catch (error) {
      // This is expected during SSR - services will be resolved once client-side DI container is ready
      // Services will remain null and methods will handle gracefully
    }
  }

  /**
   * Set callbacks to access sequence state from component
   */
  setSequenceStateCallbacks(
    getCurrentSequence: () => SequenceData | null,
    updateSequence: (sequence: SequenceData) => void
  ): void {
    this.getCurrentSequenceCallback = getCurrentSequence;
    this.updateSequenceCallback = updateSequence;
  }

  private ensureInitialized() {
    if (!this.initialized) {
      this.initializeServices();
    }
  }


  /**
   * Handle option selection in the Build tab
   */
  async handleOptionSelected(option: PictographData): Promise<void> {
    try {
      this.ensureInitialized();

      // Get current sequence from component state
      const currentSequence = this.getCurrentSequenceCallback?.();
      if (!currentSequence) {
        throw new Error("No current sequence available");
      }

      if (!this.sequenceStateService) {
        throw new Error("Sequence state service not available");
      }

      // Calculate correct beat number based on current sequence length
      const nextBeatNumber = currentSequence.beats.length + 1;

      // Create beat data from option with correct beat number
      let beatData = createBeatData({
        beatNumber: nextBeatNumber,
        pictographData: option,
        isBlank: false, // This is a real beat with pictograph data
      });

      console.log(`🎯 BuildTabEventService: Adding beat ${nextBeatNumber} with option:`, option.letter);

      // Apply orientation calculations if there's a previous beat (like legacy system)
      if (currentSequence.beats.length > 0 && this.orientationCalculationService) {
        const lastBeat = currentSequence.beats[currentSequence.beats.length - 1];

        // Only apply orientation calculations if both beats have pictograph data
        if (lastBeat.pictographData && beatData.pictographData) {
          try {
            // Update start orientations from the last beat's end orientations
            beatData = this.orientationCalculationService.updateStartOrientations(beatData, lastBeat);

            // Update end orientations based on the motion calculations
            beatData = this.orientationCalculationService.updateEndOrientations(beatData);

            console.log(`🧭 BuildTabEventService: Updated orientations for beat ${nextBeatNumber}`);
          } catch (orientationError) {
            console.warn(`⚠️ BuildTabEventService: Failed to update orientations for beat ${nextBeatNumber}:`, orientationError);
            // Continue without orientation updates rather than failing completely
          }
        }
      }

      // Add beat to sequence using sequence state service
      const updatedSequence = this.sequenceStateService.addBeat(currentSequence, beatData);

      // Update sequence state through component callback
      this.updateSequenceCallback?.(updatedSequence);

      // Also notify coordination service for any other components that need to know
      if (this.constructCoordinator) {
        await this.constructCoordinator.handleBeatAdded(beatData);
      }

      console.log(`✅ BuildTabEventService: Successfully added beat to sequence`);
    } catch (error) {
      console.error("❌ Error handling option selection:", error);
      throw error;
    }
  }

  /**
   * Handle beat modification from the Graph Editor
   */
  handleBeatModified(_beatIndex: number, _beatData: BeatData): void {
    // Handle beat modifications from graph editor
    // Note: The coordination service doesn't have handleBeatModified,
    // so we'll handle this locally or extend the interface if needed
  }

  /**
   * Handle arrow selection from the Graph Editor
   */
  handleArrowSelected(_arrowData: unknown): void {
    // Handle arrow selection events from graph editor
    // This could be used for highlighting or additional UI feedback
  }

  /**
   * Handle graph editor visibility changes
   */
  handleGraphEditorVisibilityChanged(_isVisible: boolean): void {
    // Handle graph editor visibility changes if needed
  }

  /**
   * Handle export setting changes from the Export Panel
   */
  handleExportSettingChanged(_event: CustomEvent): void {
    // Handle export setting changes - could save to settings service
  }

  /**
   * Handle preview update requests from the Export Panel
   */
  handlePreviewUpdateRequested(_event: CustomEvent): void {
    // Handle preview update requests
  }

  /**
   * Handle export requests from the Export Panel
   */
  handleExportRequested(event: CustomEvent): void {
    const { type, config } = event.detail;

    // Handle export requests
    if (type === "current") {
      // TODO: Implement actual export service call
      alert(
        `Exporting sequence "${config.sequence?.name || "Untitled"}" with ${config.sequence?.beats?.length || 0} beats`
      );
    } else if (type === "all") {
      // TODO: Implement actual export all service call
      alert("Exporting all sequences in library");
    }
  }

  /**
   * Setup component coordination
   */
  setupComponentCoordination(): void {
    // Ensure services are initialized
    this.ensureInitialized();

    // Register this service with the coordination service
    if (this.constructCoordinator) {
      this.constructCoordinator.setupComponentCoordination({
        constructTab: {
          handleEvent: (eventType: string, _data: unknown) => {
            switch (eventType) {
              case "ui_transition":
                // Handle legacy transition events if needed
                break;
              default:
                // Handle other events if needed
                break;
            }
          },
        },
      });
    }
  }

  // ============================================================================
  // INTERFACE IMPLEMENTATION
  // ============================================================================

  /**
   * Handle tab switch events
   */
  handleTabSwitch(tabId: string): void {
    console.log(`🔄 BuildTabEventService: Handling tab switch to ${tabId}`);
    // Implementation for tab switching logic
  }

  /**
   * Handle workbench update events
   */
  handleWorkbenchUpdate(data: any): void {
    console.log("🔄 BuildTabEventService: Handling workbench update", data);
    // Implementation for workbench update logic
  }

  /**
   * Handle option selection events
   */
  handleOptionSelection(option: any): void {
    console.log("🔄 BuildTabEventService: Handling option selection", option);
    // Implementation for option selection logic
  }
}

// Lazy singleton instance
let _buildTabEventService: BuildTabEventService | null = null;

/**
 * Get the singleton instance of ConstructTabEventService
 * Creates the instance only when first accessed, ensuring DI container is ready
 */
export function getBuildTabEventService(): BuildTabEventService {
  if (!_buildTabEventService) {
    _buildTabEventService = new BuildTabEventService();
  }
  return _buildTabEventService;
}

// Export the getter function directly for backward compatibility
export const constructTabEventService = getBuildTabEventService;
