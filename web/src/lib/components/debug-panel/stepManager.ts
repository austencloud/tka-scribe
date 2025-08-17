/**
 * Debug Step Management
 *
 * Manages step-by-step debugging functionality and step status tracking.
 * Extracted from ArrowDebugInfoPanel.svelte.
 */

export type StepStatus = "completed" | "current" | "pending";

export interface StepInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
}

/**
 * Get the status of a debug step based on current progress
 */
export function getStepStatus(
  stepIndex: number,
  currentStep: number
): StepStatus {
  if (stepIndex < currentStep) return "completed";
  if (stepIndex === currentStep) return "current";
  return "pending";
}

/**
 * Check if a step should be visible based on step-by-step mode
 */
export function isStepVisible(
  stepIndex: number,
  currentStep: number,
  stepByStepMode: boolean
): boolean {
  if (!stepByStepMode) return true;
  return stepIndex <= currentStep;
}

/**
 * Get step icon based on status
 */
export function getStepIcon(status: StepStatus): string {
  switch (status) {
    case "completed":
      return "✅";
    case "current":
      return "🔄";
    case "pending":
      return "⏸️";
    default:
      return "❓";
  }
}

/**
 * Debug steps configuration
 */
export const DEBUG_STEPS: StepInfo[] = [
  {
    id: 0,
    name: "Calculation Status",
    description: "Overall calculation status and metadata",
    icon: "📊",
  },
  {
    id: 1,
    name: "Location Calculation",
    description: "Arrow location and positioning calculations",
    icon: "📍",
  },
  {
    id: 2,
    name: "Rotation Calculation",
    description: "Arrow rotation and orientation calculations",
    icon: "🔄",
  },
  {
    id: 3,
    name: "Final Results",
    description: "Final computed arrow properties",
    icon: "🎯",
  },
];
