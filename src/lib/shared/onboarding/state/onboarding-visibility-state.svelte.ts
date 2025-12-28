/**
 * Onboarding Visibility State
 *
 * Manages visibility of module onboarding flows across the app.
 * Extracted from navigation-state to maintain single responsibility.
 *
 * This tracks:
 * - Whether a module's onboarding is currently visible
 * - Whether the onboarding is on the "choice step" (tabs should animate in)
 * - Legacy Create tutorial state (preserved for backwards compatibility)
 */

export function createOnboardingVisibilityState() {
  // Track when user reaches the choice step of the Create tutorial
  // At this point, tabs should animate in to show they're available
  // Legacy: Create module has its own boolean for historical reasons
  let isCreateTutorialOnChoiceStep = $state<boolean>(false);

  // Generic module onboarding visibility tracking (for all modules except Create which has its own)
  // When true, the module's tabs are hidden in the sidebar
  let moduleOnboardingVisible = $state<Record<string, boolean>>({});

  // Track when a module's onboarding is on the choice step (tabs should animate in)
  let moduleOnboardingOnChoiceStep = $state<Record<string, boolean>>({});

  return {
    // ─────────────────────────────────────────────────────────────────────────
    // Create Tutorial (Legacy)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Whether the Create tutorial is on the choice step
     */
    get isCreateTutorialOnChoiceStep() {
      return isCreateTutorialOnChoiceStep;
    },

    /**
     * Set whether the Create tutorial is on the choice step
     */
    setCreateTutorialOnChoiceStep(onChoiceStep: boolean) {
      isCreateTutorialOnChoiceStep = onChoiceStep;
    },

    // ─────────────────────────────────────────────────────────────────────────
    // Generic Module Onboarding
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Check if a module's onboarding is currently visible
     * @param moduleId The module to check
     * @returns true if onboarding is visible, false otherwise
     */
    isModuleOnboardingVisible(moduleId: string): boolean {
      return moduleOnboardingVisible[moduleId] ?? false;
    },

    /**
     * Set whether a module's onboarding is visible
     * @param moduleId The module to set
     * @param visible Whether onboarding should be visible
     */
    setModuleOnboardingVisible(moduleId: string, visible: boolean) {
      moduleOnboardingVisible = {
        ...moduleOnboardingVisible,
        [moduleId]: visible,
      };
      // Reset choice step when hiding onboarding
      if (!visible) {
        moduleOnboardingOnChoiceStep = {
          ...moduleOnboardingOnChoiceStep,
          [moduleId]: false,
        };
      }
    },

    /**
     * Check if a module's onboarding is on the choice step
     * @param moduleId The module to check
     * @returns true if on choice step, false otherwise
     */
    isModuleOnboardingOnChoiceStep(moduleId: string): boolean {
      return moduleOnboardingOnChoiceStep[moduleId] ?? false;
    },

    /**
     * Set whether a module's onboarding is on the choice step
     * @param moduleId The module to set
     * @param onChoiceStep Whether on the choice step
     */
    setModuleOnboardingOnChoiceStep(moduleId: string, onChoiceStep: boolean) {
      moduleOnboardingOnChoiceStep = {
        ...moduleOnboardingOnChoiceStep,
        [moduleId]: onChoiceStep,
      };
    },
  };
}

/**
 * Type for OnboardingVisibilityState
 */
export type OnboardingVisibilityState = ReturnType<
  typeof createOnboardingVisibilityState
>;

// Global onboarding visibility state instance
export const onboardingVisibilityState = createOnboardingVisibilityState();
