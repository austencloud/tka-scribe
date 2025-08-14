/**
 * OptionPickerSectionState.svelte.ts - REFACTORED to use modular state management
 *
 * This file now delegates to smaller, focused state modules for better maintainability.
 * Previously this was a 562-line monolithic state manager - now it's a thin orchestrator.
 */

// Re-export the new modular state management
export { createSectionState, type SectionState } from "./state/index.svelte";
