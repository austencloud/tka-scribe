/**
 * Start Position Module - Clean exports for the refactored start position picker
 */

// Main component
export { default as StartPositionPicker } from "./StartPositionPicker.svelte";

// Sub-components
export { default as StartPositionGrid } from "./components/StartPositionGrid.svelte";

// Services
export {
  createStartPositionLoader,
  StartPositionLoader,
} from "./services/StartPositionLoader";
export {
  createStartPositionServiceResolver,
  StartPositionServiceResolver,
} from "./services/StartPositionServiceResolver";

// Utilities
export {
  createStartPositionBeat,
  createStartPositionData,
  extractEndPosition,
  mapLocationToPosition,
  storePreloadedOptions,
  storeStartPositionData,
} from "./utils/StartPositionUtils";
