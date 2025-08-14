/**
 * Clean State Management Modules
 *
 * Re-exports for the refactored, modular state management system
 */

// Main orchestrator (use this in most cases)
export { createSectionState, type SectionState } from "./state/index.svelte";

// Individual state modules (for advanced use cases)
export {
  createDeviceState,
  type DeviceState,
} from "./state/deviceState.svelte";
export {
  createContainerState,
  type ContainerState,
} from "./state/containerState.svelte";
export {
  createLayoutState,
  type LayoutState,
} from "./state/layoutState.svelte";
export { createUIState, type UIState } from "./state/uiState.svelte";
