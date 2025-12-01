/**
 * Animator Module
 *
 * Complete animator module with all components, domain models, services, and state
 * for sequence animation functionality.
 * 
 * Components should be imported directly from their files:
 * - import AnimationCanvas from "$lib/features/animate/components/canvas/AnimationCanvas.svelte"
 */

// Re-export everything from all layers
export * from "./services";
export * from "./state";
export * from "./shared/domain";
