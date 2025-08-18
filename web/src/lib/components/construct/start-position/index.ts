/**
 * Start Position Module - Clean exports for the refactored start position picker
 */

// Main component
export { default as ModernStartPositionPicker } from "./ModernStartPositionPicker.svelte";

// Sub-components
export { default as StartPositionGrid } from "./components/StartPositionGrid.svelte";

// Services
export {
  StartPositionServiceResolver,
  createStartPositionServiceResolver,
} from "./services/StartPositionServiceResolver";
export {
  StartPositionLoader,
  createStartPositionLoader,
} from "./services/StartPositionLoader";

// Utilities
export {
  extractEndPosition,
  mapLocationToPosition,
  createStartPositionData,
  createStartPositionBeat,
  storeStartPositionData,
  storePreloadedOptions,
} from "./utils/StartPositionUtils";
