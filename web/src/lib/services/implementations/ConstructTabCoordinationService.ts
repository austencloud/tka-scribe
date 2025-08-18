/**
 * Construct Tab Coordination Service - Implementation
 *
 * Coordinates between construct tab components (start position picker, option picker, workbench).
 * Based on desktop ConstructTabCoordinationService but simplified for web with runes.
 *
 * FIXED: Added proper state synchronization to resolve start position selection getting stuck
 */

import { GridMode } from "$lib/domain/enums";
import type { BeatData, SequenceData } from "../interfaces/domain-types";
import type {
  IConstructTabCoordinationService,
  IStartPositionService,
} from "../interfaces/application-interfaces";
import type { ISequenceService } from "../interfaces/sequence-interfaces";

// Import the singleton sequence state service for proper synchronization
import { sequenceStateService } from "../SequenceStateService.svelte";

interface ComponentWithEventHandler {
  handleEvent?: (eventType: string, data: unknown) => void;
}

export class ConstructTabCoordinationService
  implements IConstructTabCoordinationService
{
  private components: Record<string, ComponentWithEventHandler> = {};
  private isHandlingSequenceModification = false;
  private eventListenersSetup = false;
  private boundEventHandlers: {
    startPositionSelected: (event: CustomEvent) => void;
    optionSelected: (event: CustomEvent) => void;
    sequenceModified: (event: CustomEvent) => void;
  } | null = null;

  constructor(
    private sequenceService: ISequenceService,
    private startPositionService: IStartPositionService
  ) {
    console.log("🎭 ConstructTabCoordinationService initialized");
  }

  /**
   * Clean up resources when service is destroyed
   */
  destroy(): void {
    this.disconnectComponentSignals();
    this.components = {};
  }

  setupComponentCoordination(
    components: Record<string, ComponentWithEventHandler>
  ): void {
    console.log(
      "🎭 Setting up component coordination:",
      Object.keys(components)
    );
    this.components = components;

    // Set up any cross-component communication here (only once)
    if (!this.eventListenersSetup) {
      this.connectComponentSignals();
      this.eventListenersSetup = true;
    }
  }

  async handleSequenceModified(sequence: SequenceData): Promise<void> {
    if (this.isHandlingSequenceModification) {
      return;
    }

    console.log("🎭 Handling sequence modification:", sequence.id);

    try {
      this.isHandlingSequenceModification = true;

      // **CRITICAL: Update singleton state to keep UI in sync**
      sequenceStateService.setCurrentSequence(sequence);

      // Update UI based on sequence state
      await this.updateUIBasedOnSequence(sequence);

      // Notify components about sequence change
      this.notifyComponents("sequence_modified", { sequence });
    } catch (error) {
      console.error("❌ Error handling sequence modification:", error);
    } finally {
      this.isHandlingSequenceModification = false;
    }
  }

  async handleStartPositionSet(startPosition: BeatData): Promise<void> {
    console.log(
      "🎭 Handling start position set:",
      startPosition.pictograph_data?.id
    );

    try {
      // Set loading state to show user something is happening
      sequenceStateService.setLoading(true);
      sequenceStateService.clearError();

      // Set the start position using the service
      await this.startPositionService.setStartPosition(startPosition);

      // **CRITICAL: Create a sequence with the start position stored separately**
      console.log(
        "🎭 Creating sequence with start position stored separately from beats"
      );

      // Create a new sequence with NO beats initially (progressive creation)
      const newSequence = await this.sequenceService.createSequence({
        name: `Sequence ${new Date().toLocaleTimeString()}`,
        length: 0, // Start with 0 beats - beats will be added progressively
        gridMode: GridMode.DIAMOND, // Default grid mode
        propType: "staff", // Default prop type
      });

      // **CRITICAL: Set the start position in the sequence's startPosition field, NOT as beat 0**
      console.log("🎭 Setting start position in sequence.startPosition field");
      await this.sequenceService.setSequenceStartPosition(
        newSequence.id,
        startPosition
      );

      // **CRITICAL: Reload the sequence to get the updated start position**
      const updatedSequence = await this.sequenceService.getSequence(
        newSequence.id
      );

      if (updatedSequence) {
        // **CRITICAL FIX: Update the singleton state that UI components watch**
        console.log("🔄 Updating singleton sequence state with new sequence");
        sequenceStateService.setCurrentSequence(updatedSequence);

        // Also clear loading state
        sequenceStateService.setLoading(false);

        // Service completed successfully - let components handle additional state updates
        this.notifyComponents("sequenceCreated", {
          sequence: updatedSequence,
          startPosition: startPosition,
        });

        console.log(
          "🎯 Set updated sequence as current sequence:",
          updatedSequence.id,
          "beats:",
          updatedSequence.beats.length,
          "startPosition:",
          updatedSequence.startPosition?.pictograph_data?.id
        );
        console.log(
          "✅ Updated sequence state - UI should now transition to option picker"
        );
      } else {
        console.error("❌ Failed to reload updated sequence");
        sequenceStateService.setLoading(false);
        sequenceStateService.setError(
          "Failed to create sequence with start position"
        );
        return;
      }

      console.log("✅ Sequence created with start position stored separately");

      // Notify components
      this.notifyComponents("start_position_set", { startPosition });

      // **CRITICAL: Notify components to update UI state**
      // The shouldShowStartPositionPicker logic should now automatically return false
      // because we've set a current sequence with a startPosition
      this.notifyComponents("ui_state_update_requested", {
        action: "hide_start_position_picker",
      });
      console.log("🎭 UI state should now automatically show option picker");

      // Transition to option picker
      await this.handleUITransitionRequest("option_picker");
    } catch (error) {
      console.error("❌ Error handling start position set:", error);
      sequenceStateService.setLoading(false);
      sequenceStateService.setError(
        `Failed to set start position: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async handleBeatAdded(beatData: BeatData): Promise<void> {
    console.log("🎭 Handling beat added:", beatData.beat_number);

    try {
      // Get current sequence from singleton state
      const currentSequence = sequenceStateService.currentSequence;

      if (!currentSequence) {
        console.error("❌ No current sequence available for adding beat");
        return;
      }

      console.log(`🎭 Adding beat to sequence: ${currentSequence.id}`);

      // **CRITICAL: Use the service to add the beat**
      if (
        "addBeat" in this.sequenceService &&
        typeof this.sequenceService.addBeat === "function"
      ) {
        await this.sequenceService.addBeat(currentSequence.id, beatData);

        // Reload the updated sequence
        const updatedSequence = await this.sequenceService.getSequence(
          currentSequence.id
        );
        if (updatedSequence) {
          // **CRITICAL: Update singleton state**
          sequenceStateService.setCurrentSequence(updatedSequence);
          console.log("✅ Beat added and sequence state updated");
        }
      } else {
        // Fallback: add beat directly to state
        sequenceStateService.addBeat(beatData);
        console.log("✅ Beat added directly to state");
      }

      // Notify components
      this.notifyComponents("beat_added", { beatData });
    } catch (error) {
      console.error("❌ Error handling beat added:", error);
      sequenceStateService.setError(
        `Failed to add beat: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async handleGenerationRequest(
    config: Record<string, unknown>
  ): Promise<void> {
    console.log("🎭 Handling generation request:", config);

    try {
      // TODO: Implement sequence generation
      // For now, just notify components
      this.notifyComponents("generation_requested", { config });

      // Simulate generation completion
      setTimeout(() => {
        this.notifyComponents("generation_completed", {
          success: true,
          message: "Generation completed",
        });
      }, 1000);
    } catch (error) {
      console.error("❌ Error handling generation request:", error);
    }
  }

  async handleUITransitionRequest(targetPanel: string): Promise<void> {
    console.log("🎭 Handling UI transition request to:", targetPanel);

    try {
      // Emit custom events for UI transitions (similar to legacy implementation)
      const transitionEvent = new CustomEvent("construct-tab-transition", {
        detail: { targetPanel },
        bubbles: true,
      });

      if (typeof window !== "undefined") {
        document.dispatchEvent(transitionEvent);
      }

      // Notify components about the transition
      this.notifyComponents("ui_transition", { targetPanel });
    } catch (error) {
      console.error("❌ Error handling UI transition:", error);
    }
  }

  private connectComponentSignals(): void {
    // Set up event listeners for component coordination
    if (typeof window !== "undefined") {
      // Create bound event handlers to allow proper cleanup
      this.boundEventHandlers = {
        startPositionSelected: ((event: CustomEvent) => {
          this.handleStartPositionSet(event.detail.startPosition);
        }) as (event: CustomEvent) => void,

        optionSelected: ((event: CustomEvent) => {
          this.handleBeatAdded(event.detail.beatData);
        }) as (event: CustomEvent) => void,

        sequenceModified: ((event: CustomEvent) => {
          this.handleSequenceModified(event.detail.sequence);
        }) as (event: CustomEvent) => void,
      };

      // Add event listeners
      document.addEventListener(
        "start-position-selected",
        this.boundEventHandlers.startPositionSelected as EventListener
      );
      document.addEventListener(
        "option-selected",
        this.boundEventHandlers.optionSelected as EventListener
      );
      document.addEventListener(
        "sequence-modified",
        this.boundEventHandlers.sequenceModified as EventListener
      );
    }
  }

  /**
   * Clean up event listeners to prevent memory leaks and duplicate handlers
   */
  private disconnectComponentSignals(): void {
    if (typeof window !== "undefined" && this.boundEventHandlers) {
      document.removeEventListener(
        "start-position-selected",
        this.boundEventHandlers.startPositionSelected as EventListener
      );
      document.removeEventListener(
        "option-selected",
        this.boundEventHandlers.optionSelected as EventListener
      );
      document.removeEventListener(
        "sequence-modified",
        this.boundEventHandlers.sequenceModified as EventListener
      );
      this.boundEventHandlers = null;
      this.eventListenersSetup = false;
    }
  }

  private async updateUIBasedOnSequence(sequence: SequenceData): Promise<void> {
    console.log("🎭 Updating UI based on sequence state");

    try {
      // Determine which panel to show based on sequence state
      const hasStartPosition = sequence?.startPosition != null;
      const hasBeats = sequence && sequence.beats && sequence.beats.length > 0;

      let targetPanel: string;

      if (hasStartPosition || hasBeats) {
        targetPanel = "option_picker";
        console.log(
          "🎯 UI should show option picker (has start position or beats)"
        );
      } else {
        targetPanel = "start_position_picker";
        console.log(
          "🎯 UI should show start position picker (no start position or beats)"
        );
      }

      // Transition to appropriate panel
      await this.handleUITransitionRequest(targetPanel);
    } catch (error) {
      console.error("❌ Error updating UI based on sequence:", error);
    }
  }

  private hasStartPosition(sequence: SequenceData): boolean {
    // **FIXED: Check the startPosition field instead of checking beats[0]**
    // This aligns with the modern architecture where start position is separate
    return sequence?.startPosition != null;
  }

  private notifyComponents(eventType: string, data: unknown): void {
    console.log(`🎭 Notifying components of ${eventType}:`, data);

    // Notify individual components if they have handlers
    Object.entries(this.components).forEach(([name, component]) => {
      if (component && typeof component.handleEvent === "function") {
        try {
          component.handleEvent(eventType, data);
        } catch (error) {
          console.error(`❌ Error notifying component ${name}:`, error);
        }
      }
    });

    // Emit global event for any listeners
    if (typeof window !== "undefined") {
      const event = new CustomEvent(`construct-coordination-${eventType}`, {
        detail: data,
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
  }
}
