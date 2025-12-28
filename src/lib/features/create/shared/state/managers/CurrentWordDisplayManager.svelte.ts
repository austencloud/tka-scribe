/**
 * Current Word Display Manager
 *
 * Manages the effect that determines what text to display in the top bar
 * based on the current creation state.
 *
 * Handles contextual messaging for:
 * - Guided mode header text
 * - Gestural mode (hand path) state messages
 * - Construct mode instructions
 * - Default sequence word display
 *
 * Extracted from CreateModule to reduce component complexity.
 *
 * Domain: Create module - Current word display management
 */

import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import type { createCreateModuleState as CreateModuleStateType } from "../create-module-state.svelte";
import type { createConstructTabState as ConstructTabStateType } from "../construct-tab-state.svelte";

type CreateModuleState = ReturnType<typeof CreateModuleStateType>;
type ConstructTabState = ReturnType<typeof ConstructTabStateType>;

export interface CurrentWordDisplayConfig {
  CreateModuleState: CreateModuleState;
  constructTabState: ConstructTabState;
  onCurrentWordChange?: (word: string) => void;
}

/**
 * Creates the current word display effect
 * @returns Cleanup function
 */
export function createCurrentWordDisplayEffect(
  config: CurrentWordDisplayConfig
): () => void {
  const { CreateModuleState, constructTabState, onCurrentWordChange } = config;

  if (!onCurrentWordChange) {
    // No callback provided, return no-op cleanup
    return () => {};
  }

  // Effect: Notify parent of current word changes (or contextual message for hand path)
  const cleanup = $effect.root(() => {
    $effect(() => {
      if (!CreateModuleState) return;

      // CRITICAL: Access the current sequence to ensure effect tracks changes
      // Variables are used for side effects (dependency tracking)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _currentSequence = CreateModuleState.sequenceState.currentSequence;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _beatCount = CreateModuleState.getCurrentBeatCount();

      let displayText = "";

      // In guided mode, show the header text from Guided Builder
      if (CreateModuleState.activeSection === "guided") {
        displayText =
          CreateModuleState.guidedModeHeaderText || "Guided Builder";
      }
      // In gestural (hand path) mode, show contextual message instead of word
      else if (
        navigationState.activeTab === "gestural" &&
        CreateModuleState.handPathCoordinator
      ) {
        const coordinator = CreateModuleState.handPathCoordinator;

        if (!coordinator.isStarted) {
          displayText = "Configure Your Settings";
        } else if (coordinator.pathState.isSessionComplete) {
          displayText = "Sequence Complete!";
        } else if (coordinator.pathState.currentHand === "blue") {
          displayText = "Drawing Blue Hand Path";
        } else if (coordinator.pathState.currentHand === "red") {
          displayText = "Drawing Red Hand Path";
        } else {
          displayText = "Draw Hand Path";
        }
      } else if (navigationState.activeTab === "constructor") {
        // Show contextual instruction based on sequence state
        if (constructTabState.shouldShowStartPositionPicker()) {
          // On start position picker: Show instruction
          displayText = "Choose your start position!";
        } else {
          // Has beats: Show the actual sequence word
          displayText = CreateModuleState.sequenceState.sequenceWord() ?? "";
        }
      } else {
        // Default: Show current word
        displayText = CreateModuleState.sequenceState.sequenceWord() ?? "";
      }

      onCurrentWordChange(displayText);
    });
  });

  return cleanup;
}
