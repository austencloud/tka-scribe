<!--
  FirstRunWizard - First-time user onboarding wizard

  Orchestrates the first-run experience:
  1. Welcome screen
  2. Display name input
  3. Favorite prop selection
  4. Pictograph mode preference

  Collects user preferences and applies them to settings.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import { BackgroundType } from "$lib/shared/background/shared/domain/enums/background-enums";
  import { settingsService } from "$lib/shared/settings/state/SettingsState.svelte";
  import { getAnimationVisibilityManager } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import type { FirstRunStep } from "../../domain/first-run-types";

  import WelcomeStep from "./steps/WelcomeStep.svelte";
  import DisplayNameStep from "./steps/DisplayNameStep.svelte";
  import ThemePickerStep from "./steps/ThemePickerStep.svelte";
  import PropPickerStep from "./steps/PropPickerStep.svelte";
  import PictographModeStep from "./steps/PictographModeStep.svelte";

  interface Props {
    onComplete: () => void;
    onSkip: () => void;
  }

  const { onComplete, onSkip }: Props = $props();

  // Wizard state
  let currentStep = $state<FirstRunStep>("welcome");
  let animateIn = $state(false);

  // Collected data
  let displayName = $state("");
  let selectedTheme = $state<BackgroundType>(BackgroundType.SNOWFALL);
  let favoriteProp = $state<PropType>(PropType.STAFF);
  let pictographMode = $state<"light" | "dark">("light");

  // Services
  let hapticService: IHapticFeedback | null = null;

  const STEPS: FirstRunStep[] = [
    "welcome",
    "displayName",
    "theme",
    "favoriteProp",
    "pictographMode",
  ];

  // Icons for each step
  const STEP_ICONS: Record<FirstRunStep, string> = {
    welcome: "fa-infinity",
    displayName: "fa-user",
    theme: "fa-moon",
    favoriteProp: "fa-fire",
    pictographMode: "fa-lightbulb",
  };

  const currentStepIndex = $derived(STEPS.indexOf(currentStep));
  const progress = $derived(((currentStepIndex + 1) / STEPS.length) * 100);

  onMount(() => {
    try {
      hapticService = resolve<IHapticFeedback>(TYPES.IHapticFeedback);
    } catch {
      // Haptics optional
    }

    // Trigger entrance animation
    requestAnimationFrame(() => {
      animateIn = true;
    });
  });

  function transitionTo(step: FirstRunStep) {
    hapticService?.trigger("selection");
    animateIn = false;

    requestAnimationFrame(() => {
      currentStep = step;
      requestAnimationFrame(() => {
        animateIn = true;
      });
    });
  }

  function handleNext(step: FirstRunStep) {
    transitionTo(step);
  }

  function handleBack() {
    const prevIndex = currentStepIndex - 1;
    const prevStep = STEPS[prevIndex];
    if (prevIndex >= 0 && prevStep) {
      transitionTo(prevStep);
    }
  }

  function handleDisplayNameComplete(name: string) {
    displayName = name;
    handleNext("theme");
  }

  function handleDisplayNameSkip() {
    // Keep empty display name, move on
    handleNext("theme");
  }

  function handleThemeComplete(theme: BackgroundType) {
    selectedTheme = theme;
    handleNext("favoriteProp");
  }

  function handleThemeSkip() {
    // Keep default theme (Snowfall)
    handleNext("favoriteProp");
  }

  // Live preview - applies theme immediately when user clicks a card
  async function handleThemePreview(theme: BackgroundType) {
    hapticService?.trigger("selection");
    selectedTheme = theme;
    // Apply theme immediately for live preview
    try {
      await settingsService.updateSetting("backgroundType", theme);
      // Also update theme colors
      const { applyThemeForBackground } = await import(
        "$lib/shared/settings/utils/background-theme-calculator"
      );
      applyThemeForBackground(theme);
    } catch (error) {
      console.error("Failed to preview theme:", error);
    }
  }

  function handlePropComplete(prop: PropType) {
    favoriteProp = prop;
    handleNext("pictographMode");
  }

  function handlePropSkip() {
    // Keep default prop (Staff)
    handleNext("pictographMode");
  }

  function handleModeComplete(mode: "light" | "dark") {
    pictographMode = mode;
    applySettingsAndComplete();
  }

  function handleModeSkip() {
    // Keep default mode (light)
    applySettingsAndComplete();
  }

  async function applySettingsAndComplete() {
    hapticService?.trigger("success");

    // Apply collected preferences to settings
    try {
      // Update display name if provided
      if (displayName.trim()) {
        await settingsService.updateSetting("userName", displayName.trim());
      }

      // Update prop type for both hands
      await settingsService.updateSettings({
        bluePropType: favoriteProp,
        redPropType: favoriteProp,
      });

      // Update pictograph mode (lightsOff)
      const visibilityManager = getAnimationVisibilityManager();
      visibilityManager.setLightsOff(pictographMode === "dark");
    } catch (error) {
      console.error("Failed to apply first-run settings:", error);
    }

    // Complete onboarding
    onComplete();
  }

  function handleSkipAll() {
    hapticService?.trigger("selection");
    onSkip();
  }

  async function handleQuickStart() {
    // Apply sensible defaults and complete immediately
    hapticService?.trigger("success");

    try {
      // Apply default settings (staff prop, light mode, current theme)
      await settingsService.updateSettings({
        bluePropType: PropType.STAFF,
        redPropType: PropType.STAFF,
      });

      // Default to lights on (light mode)
      const visibilityManager = getAnimationVisibilityManager();
      visibilityManager.setLightsOff(false);
    } catch (error) {
      console.error("Failed to apply default settings:", error);
    }

    onComplete();
  }
</script>

<div class="first-run-wizard" class:animate-in={animateIn}>
  <!-- Progress bar -->
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>

  <!-- Skip button -->
  <button class="skip-button" onclick={handleSkipAll}>Skip all</button>

  <!-- Step content -->
  <div class="step-container">
    {#if currentStep === "welcome"}
      <WelcomeStep
        onNext={() => handleNext("displayName")}
        onQuickStart={handleQuickStart}
      />
    {:else if currentStep === "displayName"}
      <DisplayNameStep
        initialValue={displayName}
        onNext={handleDisplayNameComplete}
        onBack={handleBack}
        onSkip={handleDisplayNameSkip}
      />
    {:else if currentStep === "theme"}
      <ThemePickerStep
        initialValue={selectedTheme}
        onNext={handleThemeComplete}
        onBack={handleBack}
        onSkip={handleThemeSkip}
        onPreview={handleThemePreview}
      />
    {:else if currentStep === "favoriteProp"}
      <PropPickerStep
        initialValue={favoriteProp}
        onNext={handlePropComplete}
        onBack={handleBack}
        onSkip={handlePropSkip}
      />
    {:else if currentStep === "pictographMode"}
      <PictographModeStep
        initialValue={pictographMode}
        onComplete={handleModeComplete}
        onBack={handleBack}
        onSkip={handleModeSkip}
      />
    {/if}
  </div>

  <!-- Step indicator dots with icons -->
  <div class="step-dots">
    {#each STEPS as step, i}
      <button
        class="dot"
        class:active={i === currentStepIndex}
        class:completed={i < currentStepIndex}
        onclick={() => {
          if (i < currentStepIndex) {
            transitionTo(step);
          }
        }}
        disabled={i > currentStepIndex}
        aria-label="Step {i + 1}: {step}"
      >
        <i class="fas {STEP_ICONS[step]}" aria-hidden="true"></i>
      </button>
    {/each}
  </div>
</div>

<style>
  .first-run-wizard {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    z-index: 10000;
    overflow-y: auto;
  }

  /* Progress bar */
  .progress-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  .progress-fill {
    height: 100%;
    background: var(--theme-accent-strong, #8b5cf6);
    transition: width 0.3s ease;
  }

  /* Skip button */
  .skip-button {
    position: fixed;
    top: 16px;
    right: 16px;
    padding: 8px 16px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .skip-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    border-color: rgba(255, 255, 255, 0.3);
  }

  /* Step container */
  .step-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 600px;
    padding: 0 16px;
  }

  /* Animation */
  .first-run-wizard :global(.welcome-step),
  .first-run-wizard :global(.display-name-step),
  .first-run-wizard :global(.theme-picker-step),
  .first-run-wizard :global(.prop-picker-step),
  .first-run-wizard :global(.pictograph-mode-step) {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.4s ease,
      transform 0.4s ease;
  }

  .first-run-wizard.animate-in :global(.welcome-step),
  .first-run-wizard.animate-in :global(.display-name-step),
  .first-run-wizard.animate-in :global(.theme-picker-step),
  .first-run-wizard.animate-in :global(.prop-picker-step),
  .first-run-wizard.animate-in :global(.pictograph-mode-step) {
    opacity: 1;
    transform: translateY(0);
  }

  /* Step dots with icons */
  .step-dots {
    position: fixed;
    bottom: 32px;
    display: flex;
    gap: 12px;
  }

  .dot {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 0;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9rem;
  }

  .dot:disabled {
    cursor: default;
  }

  .dot:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.7);
  }

  .dot.active {
    background: color-mix(in srgb, var(--theme-accent-strong, #8b5cf6) 30%, transparent);
    border-color: var(--theme-accent-strong, #8b5cf6);
    color: var(--theme-accent-strong, #8b5cf6);
    transform: scale(1.1);
  }

  .dot.completed {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
    color: rgba(255, 255, 255, 0.7);
  }

  /* Mobile */
  @media (max-width: 480px) {
    .skip-button {
      top: 12px;
      right: 12px;
      padding: 6px 12px;
      font-size: 0.8125rem;
    }

    .step-dots {
      bottom: 24px;
      gap: 10px;
    }

    .dot {
      width: 36px;
      height: 36px;
      font-size: 0.8rem;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .progress-fill {
      transition: none;
    }

    .first-run-wizard :global(.welcome-step),
    .first-run-wizard :global(.display-name-step),
    .first-run-wizard :global(.theme-picker-step),
    .first-run-wizard :global(.prop-picker-step),
    .first-run-wizard :global(.pictograph-mode-step) {
      transition: none;
      opacity: 1;
      transform: none;
    }

    .dot,
    .skip-button {
      transition: none;
    }
  }
</style>
