/**
 * Register CREATE Module Shortcuts
 *
 * Registers keyboard shortcuts specific to the CREATE module.
 *
 * Domain: Keyboard Shortcuts - CREATE Module
 */

import type { IKeyboardShortcutManager } from "../services/contracts/IKeyboardShortcutManager";
import type { createKeyboardShortcutState } from "../state/keyboard-shortcut-state.svelte";
import { getCreateModuleRef } from "$lib/features/create/shared/state/create-module-state-ref.svelte";
import { executeClearSequenceWorkflow } from "$lib/features/create/shared/utils/clearSequenceWorkflow";
import { createComponentLogger } from "$lib/shared/utils/debug-logger";

const debug = createComponentLogger("CreateShortcuts");

export function registerCreateShortcuts(
  service: IKeyboardShortcutManager,
  state: ReturnType<typeof createKeyboardShortcutState>
) {
  // ==================== Animation Control ====================

  // Space - Play/Pause animation
  // NOTE: This requires animation service to support pause functionality
  service.register({
    id: "create.toggle-playback",
    label: "Play/Pause Animation",
    description: "Toggle animation playback",
    key: " ", // Space key
    modifiers: [],
    context: "create",
    scope: "animation",
    priority: "high",
    condition: () => {
      // Only enable if settings allow single-key shortcuts
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      // TODO: Integrate with animation service when pause is implemented
      debug.log("Space pressed - Play/Pause (not yet implemented)");
      // This will need to call something like:
      // const animService = getAnimator();
      // animService.togglePlayback();
    },
  });

  // ==================== Beat Grid Navigation ====================

  // Arrow Up - Move focus up in beat grid
  service.register({
    id: "create.grid-nav-up",
    label: "Navigate Grid Up",
    description: "Move focus up in the beat grid",
    key: "ArrowUp",
    modifiers: [],
    context: "create",
    scope: "workspace",
    priority: "medium",
    condition: () => {
      // Only when edit panel is NOT open
      return state.settings.enableSingleKeyShortcuts;
      // TODO: Add check for edit panel state
      // && !isEditPanelOpen();
    },
    action: () => {
      debug.log("Arrow Up - Grid navigation (not yet implemented)");
      // TODO: Integrate with beat grid navigation
    },
  });

  // Arrow Down - Move focus down in beat grid
  service.register({
    id: "create.grid-nav-down",
    label: "Navigate Grid Down",
    description: "Move focus down in the beat grid",
    key: "ArrowDown",
    modifiers: [],
    context: "create",
    scope: "workspace",
    priority: "medium",
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
      // TODO: Add check for edit panel state
    },
    action: () => {
      debug.log("Arrow Down - Grid navigation (not yet implemented)");
      // TODO: Integrate with beat grid navigation
    },
  });

  // Arrow Left - Move focus left in beat grid
  service.register({
    id: "create.grid-nav-left",
    label: "Navigate Grid Left",
    description: "Move focus left in the beat grid",
    key: "ArrowLeft",
    modifiers: [],
    context: "create",
    scope: "workspace",
    priority: "medium",
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      debug.log("Arrow Left - Grid navigation (not yet implemented)");
      // TODO: Integrate with beat grid navigation
    },
  });

  // Arrow Right - Move focus right in beat grid
  service.register({
    id: "create.grid-nav-right",
    label: "Navigate Grid Right",
    description: "Move focus right in the beat grid",
    key: "ArrowRight",
    modifiers: [],
    context: "create",
    scope: "workspace",
    priority: "medium",
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      debug.log("Arrow Right - Grid navigation (not yet implemented)");
      // TODO: Integrate with beat grid navigation
    },
  });

  // ==================== Edit Panel Navigation ====================

  // Arrow Left - Navigate to previous beat (when edit panel is open)
  service.register({
    id: "create.edit-nav-left",
    label: "Previous Beat",
    description: "Navigate to previous beat in edit panel",
    key: "ArrowLeft",
    modifiers: [],
    context: ["create", "edit-panel"],
    scope: "editing",
    priority: "high", // Higher priority than grid navigation
    condition: () => {
      // Only when edit panel IS open
      return state.settings.enableSingleKeyShortcuts;
      // TODO: Add check: && isEditPanelOpen();
    },
    action: () => {
      debug.log("Arrow Left - Previous beat (not yet implemented)");
      // TODO: Integrate with edit panel navigation
      // navigateToPreviousBeat();
    },
  });

  // Arrow Right - Navigate to next beat (when edit panel is open)
  service.register({
    id: "create.edit-nav-right",
    label: "Next Beat",
    description: "Navigate to next beat in edit panel",
    key: "ArrowRight",
    modifiers: [],
    context: ["create", "edit-panel"],
    scope: "editing",
    priority: "high", // Higher priority than grid navigation
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
      // TODO: Add check: && isEditPanelOpen();
    },
    action: () => {
      debug.log("Arrow Right - Next beat (not yet implemented)");
      // TODO: Integrate with edit panel navigation
      // navigateToNextBeat();
    },
  });

  // Enter - Accept changes and close edit panel
  service.register({
    id: "create.edit-accept",
    label: "Accept Changes",
    description: "Accept changes and close edit panel",
    key: "Enter",
    modifiers: [],
    context: ["create", "edit-panel"],
    scope: "editing",
    priority: "high",
    action: () => {
      debug.log("Enter - Accept changes (not yet implemented)");
      // TODO: Integrate with edit panel
      // acceptChangesAndClose();
    },
  });

  // ==================== Sequence Management ====================

  // Ctrl+S - Save sequence
  service.register({
    id: "create.save-sequence",
    label: "Save Sequence",
    description: "Save the current sequence",
    key: "s",
    modifiers: ["ctrl"],
    context: "create",
    scope: "sequence-management",
    priority: "high",
    action: () => {
      debug.log("Ctrl+S - Save sequence (not yet implemented)");
      // TODO: Integrate with sequence save functionality
      // saveCurrentSequence();
    },
  });

  // + (Plus) - Add beat
  // Note: This adds to the sequence, but we need to figure out which prop color
  service.register({
    id: "create.add-beat",
    label: "Add Beat",
    description: "Add a beat to the sequence",
    key: "+",
    modifiers: [],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      debug.log("Plus - Add beat (not yet implemented)");
      // TODO: Determine logic for which prop color to add
      // User mentioned needing to figure out non-confusing pattern
    },
  });

  // Ctrl+Z - Undo last action
  service.register({
    id: "create.undo",
    label: "Undo",
    description: "Undo the last action in the current tab",
    key: "z",
    modifiers: ["ctrl"],
    context: "create",
    scope: "sequence-management",
    priority: "high",
    action: () => {
      const ref = getCreateModuleRef();
      if (!ref) {
        debug.log("Undo - Create module reference not available");
        return;
      }

      const { CreateModuleState } = ref;
      const success = CreateModuleState.undo();

      if (success) {
        console.log("⌨️ Ctrl+Z - Undo successful");
      } else {
        debug.log("Ctrl+Z - Nothing to undo");
      }
    },
  });

  // Ctrl+Shift+Z - Redo last undone action
  service.register({
    id: "create.redo",
    label: "Redo",
    description: "Redo the last undone action in the current tab",
    key: "z",
    modifiers: ["ctrl", "shift"],
    context: "create",
    scope: "sequence-management",
    priority: "high",
    action: () => {
      const ref = getCreateModuleRef();
      if (!ref) {
        debug.log("Redo - Create module reference not available");
        return;
      }

      const { CreateModuleState } = ref;
      const success = CreateModuleState.redo();

      if (success) {
        console.log("⌨️ Ctrl+Shift+Z - Redo successful");
      } else {
        debug.log("Ctrl+Shift+Z - Nothing to redo");
      }
    },
  });

  // Backspace - Delete selected beat
  service.register({
    id: "create.delete-beat",
    label: "Delete Beat",
    description: "Delete the currently selected beat",
    key: "Backspace",
    modifiers: [],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    action: async () => {
      debug.log("Backspace key pressed!");

      const ref = getCreateModuleRef();
      debug.log("Create module ref:", ref ? "Available" : "Not available");

      if (!ref) {
        debug.log("Create module reference not available");
        return;
      }

      const { CreateModuleState, constructTabState, panelState } = ref;
      const sequenceState = CreateModuleState.sequenceState;

      // Check if start position (beat 0) is selected
      const selectedBeatData = sequenceState.selectedBeatData;

      if (selectedBeatData && selectedBeatData.beatNumber === 0) {
        // Start position is selected - clear entire sequence using the same workflow as clear button
        console.log(
          "⌨️ Backspace - Clearing entire sequence (start position selected)"
        );

        try {
          await executeClearSequenceWorkflow({
            CreateModuleState,
            constructTabState,
            panelState,
            resetCreationMethodSelection: () => {
              // Keep creation method selected when clearing via keyboard
            },
            shouldResetCreationMethod: false, // Keep creation mode selected, just reset to start position picker
          });

          // Close edit panel if it's open
          if (panelState.isEditPanelOpen) {
            panelState.closeEditPanel();
          }

          console.log("✅ Sequence cleared successfully");
        } catch (err) {
          console.error("❌ Failed to clear sequence:", err);
        }
        return;
      }

      const selectedBeatIndex = sequenceState.getSelectedBeatIndex();

      if (selectedBeatIndex === null) {
        debug.log("Backspace - No beat selected");
        return;
      }

      console.log(
        `⌨️ Backspace - Deleting beat ${selectedBeatIndex} and all subsequent beats`
      );

      // Remove the beat and all subsequent beats with animation (same as trash can button)
      sequenceState.removeBeatAndSubsequentWithAnimation(
        selectedBeatIndex,
        () => {
          // After animation completes, select appropriate beat
          if (selectedBeatIndex > 0) {
            sequenceState.selectBeat(selectedBeatIndex);
          } else {
            sequenceState.selectStartPositionForEditing();
          }
        }
      );
    },
  });

  // ==================== Sequence Transforms ====================
  // Global hotkeys for sequence transforms - available anytime in CREATE module

  // m - Mirror sequence (flip left/right)
  service.register({
    id: "create.transform-mirror",
    label: "Mirror Sequence",
    description: "Mirror the sequence (flip left and right)",
    key: "m",
    modifiers: [],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    condition: () => {
      if (!state.settings.enableSingleKeyShortcuts) return false;
      const ref = getCreateModuleRef();
      if (!ref) return false;
      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      return sequenceState?.hasSequence() ?? false;
    },
    action: async () => {
      const ref = getCreateModuleRef();
      if (!ref) return;

      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      if (!sequenceState?.hasSequence()) return;

      console.log("⌨️ M - Mirror sequence");
      await sequenceState.mirrorSequence();
    },
  });

  // h - Swap hands (swap colors)
  service.register({
    id: "create.transform-swap-hands",
    label: "Swap Hands",
    description: "Swap hand movements (left becomes right, right becomes left)",
    key: "h",
    modifiers: [],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    condition: () => {
      if (!state.settings.enableSingleKeyShortcuts) return false;
      const ref = getCreateModuleRef();
      if (!ref) return false;
      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      return sequenceState?.hasSequence() ?? false;
    },
    action: async () => {
      const ref = getCreateModuleRef();
      if (!ref) return;

      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      if (!sequenceState?.hasSequence()) return;

      console.log("⌨️ H - Swap hands");
      await sequenceState.swapColors();
    },
  });

  // r - Rotate sequence clockwise (45°)
  service.register({
    id: "create.transform-rotate-cw",
    label: "Rotate Clockwise",
    description: "Rotate the sequence 45° clockwise",
    key: "r",
    modifiers: [],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    condition: () => {
      if (!state.settings.enableSingleKeyShortcuts) return false;
      const ref = getCreateModuleRef();
      if (!ref) return false;
      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      return sequenceState?.hasSequence() ?? false;
    },
    action: async () => {
      const ref = getCreateModuleRef();
      if (!ref) return;

      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      if (!sequenceState?.hasSequence()) return;

      console.log("⌨️ R - Rotate clockwise");
      await sequenceState.rotateSequence("clockwise");
    },
  });

  // Shift+R - Rotate sequence counter-clockwise (45°)
  service.register({
    id: "create.transform-rotate-ccw",
    label: "Rotate Counter-Clockwise",
    description: "Rotate the sequence 45° counter-clockwise",
    key: "R",
    modifiers: ["shift"],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    condition: () => {
      const ref = getCreateModuleRef();
      if (!ref) return false;
      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      return sequenceState?.hasSequence() ?? false;
    },
    action: async () => {
      const ref = getCreateModuleRef();
      if (!ref) return;

      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      if (!sequenceState?.hasSequence()) return;

      console.log("⌨️ Shift+R - Rotate counter-clockwise");
      await sequenceState.rotateSequence("counterclockwise");
    },
  });

  // w - Rewind/Reverse sequence
  service.register({
    id: "create.transform-rewind",
    label: "Rewind Sequence",
    description: "Reverse the sequence to return to start position",
    key: "w",
    modifiers: [],
    context: "create",
    scope: "sequence-management",
    priority: "medium",
    condition: () => {
      if (!state.settings.enableSingleKeyShortcuts) return false;
      const ref = getCreateModuleRef();
      if (!ref) return false;
      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      return sequenceState?.hasSequence() ?? false;
    },
    action: async () => {
      const ref = getCreateModuleRef();
      if (!ref) return;

      const sequenceState = ref.CreateModuleState.getActiveTabSequenceState();
      if (!sequenceState?.hasSequence()) return;

      console.log("⌨️ W - Rewind sequence");
      await sequenceState.rewindSequence();
    },
  });

  // ==================== Edit Panel Adjustments ====================

  // [ - Decrease rotation/adjustment value
  service.register({
    id: "create.edit-decrease",
    label: "Decrease Value",
    description: "Decrease rotation or adjustment value in edit panel",
    key: "[",
    modifiers: [],
    context: ["create", "edit-panel"],
    scope: "editing",
    priority: "low",
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      debug.log("[ - Decrease value (not yet implemented)");
      // TODO: Integrate with edit panel controls
      // decreaseCurrentValue();
    },
  });

  // ] - Increase rotation/adjustment value
  service.register({
    id: "create.edit-increase",
    label: "Increase Value",
    description: "Increase rotation or adjustment value in edit panel",
    key: "]",
    modifiers: [],
    context: ["create", "edit-panel"],
    scope: "editing",
    priority: "low",
    condition: () => {
      return state.settings.enableSingleKeyShortcuts;
    },
    action: () => {
      debug.log("] - Increase value (not yet implemented)");
      // TODO: Integrate with edit panel controls
      // increaseCurrentValue();
    },
  });
}
