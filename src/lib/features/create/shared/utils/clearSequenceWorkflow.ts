/**
 * Clear Sequence Workflow Utility
 *
 * Orchestrates the complex workflow for clearing a sequence with smooth animations.
 * Extracted from CreateModule to reduce complexity and improve testability.
 *
 * Workflow:
 * 1. Push undo snapshot
 * 2. Trigger layout transition (optionally reset creation method selection)
 * 3. Wait for fade/layout animations (300ms)
 * 4. Clear ONLY the active tab's sequence data and UI state
 * 5. Close related panels
 *
 * Behavior modes:
 * - shouldResetCreationMethod = true: Returns to creation method selector (initial state)
 * - shouldResetCreationMethod = false: Keeps creation mode selected, returns to start position picker (Construct only)
 *
 * IMPORTANT: This workflow is TAB-AWARE and only clears the currently active tab's state.
 * Each tab (Construct, Generate, Assembler) maintains independent state.
 *
 * Domain: Create module - Sequence management
 */

import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import type { createCreateModuleState as CreateModuleStateType } from "../state/create-module-state.svelte";
import type { createConstructTabState as ConstructTabStateType } from "../state/construct-tab-state.svelte";
import type { createPanelCoordinationState as PanelCoordinationStateType } from "../state/panel-coordination-state.svelte";

type CreateModuleState = ReturnType<typeof CreateModuleStateType>;
type ConstructTabState = ReturnType<typeof ConstructTabStateType>;
type PanelCoordinationState = ReturnType<typeof PanelCoordinationStateType>;

export interface ClearSequenceConfig {
  CreateModuleState: CreateModuleState;
  constructTabState: ConstructTabState | null; // Made nullable since we might not need it for other tabs
  panelState: PanelCoordinationState;
  resetCreationMethodSelection: () => void;
  shouldResetCreationMethod?: boolean; // Optional flag to control whether to reset creation method (default: true for backward compatibility)
}

/**
 * Executes the clear sequence workflow
 * @throws Error if the workflow fails
 */
export async function executeClearSequenceWorkflow(
  config: ClearSequenceConfig
): Promise<void> {
  const {
    CreateModuleState,
    constructTabState,
    panelState,
    resetCreationMethodSelection,
    shouldResetCreationMethod = true, // Default to true for backward compatibility
  } = config;

  try {
    // Determine which tab is currently active
    const activeTab = navigationState.activeTab;

    // 🐛 CRITICAL FIX: Capture a reference to the active tab's sequence state BEFORE the delay
    // CreateModuleState.sequenceState is a reactive getter that returns the CURRENT active tab's state
    // If the user switches tabs during the 300ms animation delay, we could clear the wrong tab!
    // By capturing the reference here, we ensure we always clear the correct tab's sequence
    const activeTabSequenceState = CreateModuleState.sequenceState;

    // 1. Push undo snapshot
    CreateModuleState.pushUndoSnapshot("CLEAR_SEQUENCE", {
      description: "Clear sequence",
    });

    // 🐛 FIX: Clear persistence FIRST, before any animations
    // This prevents auto-save from firing during the animation delay
    // IMPORTANT: This clears the ACTIVE tab's sequence state only
    if (activeTabSequenceState) {
      await activeTabSequenceState.clearPersistedState();
    }

    // 2. Manually trigger layout transition - bypass the effect system
    // This ensures immediate fade starts regardless of workspace state
    // Only reset creation method selection if explicitly requested
    if (shouldResetCreationMethod) {
      resetCreationMethodSelection();
      navigationState.setCreationMethodSelectorVisible(true);
    }

    // 3. Wait for fade and layout transition to complete (300ms)
    // Everything fades together - beats, workspace, button panel, layout
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 4. After animations complete, clear ONLY the active tab's data and reset UI
    // This happens after components have faded out, so no popping
    // CRITICAL FIX: Only clear the active tab's state, not all tabs!

    // Clear Construct tab state ONLY if we're in the Constructor tab
    if (activeTab === "constructor" && constructTabState) {
      constructTabState.setShowStartPositionPicker(true);
      constructTabState.setSelectedStartPosition(null);
      constructTabState.startPositionStateService.clearSelectedPosition();
      constructTabState.clearError();
    }

    // Clear the active tab's sequence state (works for all tabs: Construct, Generate, Assembler)
    // Use the captured reference (activeTabSequenceState) instead of the reactive getter
    // to avoid race conditions if the user switches tabs during the animation delay
    if (activeTabSequenceState) {
      // Clear sequence state - note we already cleared persistence above
      activeTabSequenceState.setCurrentSequence(null);
      activeTabSequenceState.clearSelection();
      activeTabSequenceState.clearError();
    }

    // 5. Close related panels
    panelState.closeAnimationPanel();
    panelState.closeSharePanel();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to clear sequence";
    throw new Error(errorMessage);
  }
}
