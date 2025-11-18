/**
 * Assemble Module - Barrel Export
 *
 * Exports components, services, and state for assembly modes:
 * - Simplified Hand Path Assembly (new tap-based approach)
 * - Guided Construct (legacy option-based approach)
 * - Handpath Builder (gesture-based approach)
 */

// NEW: Simplified Hand Path Assembly Components
export { default as HandPathOrchestrator } from "./components/HandPathOrchestrator.svelte";
export { default as AssemblerTab } from "./components/AssemblerTab.svelte";
export { default as HandPathGrid } from "./components/HandPathGrid.svelte";
export { default as GridPositionButton } from "./components/GridPositionButton.svelte";
export { default as HandPathButtonPanel } from "./components/HandPathButtonPanel.svelte";
export { default as RotationSelector } from "./components/RotationSelector.svelte";

// NEW: Simplified Hand Path Assembly Services
export { HandPathMotionCalculator } from "./services/HandPathMotionCalculator";
export { HandPathSequenceConverter } from "./services/HandPathSequenceConverter";

// NEW: Simplified Hand Path Assembly State
export { createHandPathAssembleState } from "./state/handpath-assemble-state.svelte";
export type {
  HandPathAssembleState,
  HandPathAssembleConfig,
  HandPathPhase,
} from "./state/handpath-assemble-state.svelte";

// LEGACY: Guided Construct Components (kept for reference)
export { default as AssemblerOrchestrator } from "./components/AssemblerOrchestrator.svelte";
export { default as SinglePropStartPositionPicker } from "./components/SinglePropStartPositionPicker.svelte";
export { default as GuidedOptionViewer } from "./components/AssemblyOptionPicker.svelte";

// LEGACY: Guided Construct Services
export { GuidedOptionGenerator } from "./services/GuidedOptionGenerator";
export type { IGuidedOptionGenerator } from "./services/GuidedOptionGenerator";

// LEGACY: Guided Construct State
export { createGuidedConstructState } from "./state/guided-construct-state.svelte";
export type {
  GuidedConstructState,
  GuidedConstructConfig,
} from "./state/guided-construct-state.svelte";

// Handpath Builder Module (gesture-based)
export * from "./handpath-builder";
