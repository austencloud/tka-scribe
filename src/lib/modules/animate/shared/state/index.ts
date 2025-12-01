/**
 * Animate Module Shared State Exports
 *
 * Core module state (tab selection, browser panel)
 */

export {
  createAnimateModuleState,
  getAnimateModuleState,
  type AnimateModuleState,
  type AnimateMode,
  type BrowserTargetMode,
} from "./animate-module-state.svelte";

// Re-export tab-specific types for convenience
// These are also available from their respective tab state modules
export type { MirrorAxis } from "../../tabs/mirror/state";
export type { TunnelColors } from "../../tabs/tunnel/state";
export type { GridSize } from "../../tabs/grid/state";
