/**
 * Debug Step Utilities
 *
 * Utilities for managing debug step states and visibility
 */

import type { ArrowDebugState } from "../state/arrow-debug-state.svelte";

/**
 * Get the status of a debug step
 */
export function getStepStatus(
  stepIndex: number,
  currentStep: number
): "completed" | "current" | "pending" {
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "current";
  return "pending";
}

/**
 * Check if a step should be visible based on step-by-step mode
 */
export function isStepVisible(
  stepIndex: number,
  state: ArrowDebugState
): boolean {
  if (!state.stepByStepMode) return true;
  return stepIndex <= state.currentStep;
}
