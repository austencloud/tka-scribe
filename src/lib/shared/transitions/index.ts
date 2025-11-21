/**
 * Modern View Transitions Module
 * Exports for smooth, coordinated transitions between modules/tabs
 */

export {
  createViewTransitionManager,
  type TransitionDirection,
  type TransitionPhase,
  viewTransitionManager,
} from "./view-transition-state.svelte";
export { default as ViewTransitionCoordinator } from "./ViewTransitionCoordinator.svelte";
