<!--
Learn Tab - Master learning interface

Three learning destinations:
- Concepts: Progressive concept mastery path
- Play: Fun games to test your pictograph skills
- Codex: Browse all letters and pictographs

Navigation via bottom tabs (mobile-first UX pattern)
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount, untrack } from "svelte";
  import ConceptPathView from "./components/ConceptPathView.svelte";
  import ConceptDetailView from "./components/ConceptDetailView.svelte";
  import CodexTab from "./codex/components/CodexTab.svelte";
  import QuizTab from "./quiz/components/QuizTab.svelte";
  import type { LearnConcept } from "./domain/types";
  import ModuleOnboarding from "$lib/shared/onboarding/components/ModuleOnboarding.svelte";
  import { LEARN_ONBOARDING } from "$lib/shared/onboarding/config/module-onboarding-content";
  import {
    hasCompletedModuleOnboarding,
    markModuleOnboardingComplete,
  } from "$lib/shared/onboarding/config/storage-keys";

  type LearnMode = "concepts" | "play" | "codex";

  // ============================================================================
  // ONBOARDING STATE
  // ============================================================================
  let showOnboarding = $state(false);

  $effect(() => {
    if (typeof window !== "undefined") {
      showOnboarding = !hasCompletedModuleOnboarding("learn");
    }
  });

  // Sync onboarding visibility with navigation state (for desktop sidebar tab hiding)
  $effect(() => {
    const visible = showOnboarding;
    untrack(() => {
      navigationState.setModuleOnboardingVisible("learn", visible);
    });
  });

  function handleOnboardingChoiceStepReached() {
    navigationState.setModuleOnboardingOnChoiceStep("learn", true);
  }

  function handleOnboardingTabSelected(tabId: string) {
    markModuleOnboardingComplete("learn");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("learn", false);
    // Navigate to the selected tab
    navigationState.setLearnMode(tabId as LearnMode);
  }

  function handleOnboardingSkip() {
    markModuleOnboardingComplete("learn");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("learn", false);
  }

  // Props
  let {
    onHeaderChange,
  }: {
    onHeaderChange?: (header: string) => void;
  } = $props();

  const hapticService = resolve<IHapticFeedbackService>(
    TYPES.IHapticFeedbackService
  );

  // Active mode synced with navigation state
  let activeMode = $state<LearnMode>("concepts");

  // Concept detail view state
  let selectedConcept = $state<LearnConcept | null>(null);
  let conceptOpenCount = $state(0); // Increments each open to force remount

  // Sync with navigation state (bottom nav controls this)
  $effect(() => {
    const navMode = navigationState.currentLearnMode;

    // Map navigation modes to active mode
    if (navMode === "concepts") {
      activeMode = "concepts";
    } else if (
      navMode === "quiz" ||
      navMode === "drills" ||
      navMode === "play"
    ) {
      activeMode = "play";
    } else if (navMode === "codex") {
      activeMode = "codex";
    }
  });

  // Reset states when switching modes
  let prevMode: LearnMode | undefined;
  $effect(() => {
    const mode = activeMode;
    // Only reset when mode actually changes
    if (mode !== prevMode) {
      prevMode = mode;
      untrack(() => {
        selectedConcept = null;
      });
    }
  });

  // Effect: Update header when mode or selected concept changes
  $effect(() => {
    if (!onHeaderChange) return;

    let header = "";

    if (activeMode === "concepts") {
      if (selectedConcept) {
        header = selectedConcept.name || "Concept Details";
      } else {
        header = "Learning Path";
      }
    } else if (activeMode === "play") {
      header = "Play";
    } else if (activeMode === "codex") {
      header = "Letters";
    }

    onHeaderChange(header);
  });

  // Initialize on mount
  onMount(async () => {
    // Set default mode if none persisted
    const navMode = navigationState.currentLearnMode;
    if (!navMode) {
      navigationState.setLearnMode("concepts");
    }
  });

  // Handle concept selection
  function handleConceptClick(concept: LearnConcept) {
    conceptOpenCount++; // Increment to force fresh mount
    selectedConcept = concept;
  }

  // Handle back from detail view
  function handleBackToPath() {
    selectedConcept = null;
  }

  // Check if mode is active
  function isModeActive(mode: LearnMode): boolean {
    return activeMode === mode;
  }
</script>

{#if showOnboarding}
  <div class="onboarding-wrapper">
    <ModuleOnboarding
      moduleId={LEARN_ONBOARDING.moduleId}
      moduleName={LEARN_ONBOARDING.moduleName}
      moduleIcon={LEARN_ONBOARDING.moduleIcon}
      moduleColor={LEARN_ONBOARDING.moduleColor}
      welcomeTitle={LEARN_ONBOARDING.welcomeTitle}
      welcomeSubtitle={LEARN_ONBOARDING.welcomeSubtitle}
      welcomeDescription={LEARN_ONBOARDING.welcomeDescription}
      tabs={LEARN_ONBOARDING.tabs}
      onTabSelected={handleOnboardingTabSelected}
      onSkip={handleOnboardingSkip}
      onChoiceStepReached={handleOnboardingChoiceStepReached}
    />
  </div>
{:else}
  <div class="learn-tab">
    <!-- Content area - instant tab switching -->
    <div class="content-container">
      {#key activeMode}
        <div class="mode-panel">
          {#if isModeActive("concepts")}
            {#if selectedConcept}
              <!-- Key by openCount to force remount on each open -->
              {#key conceptOpenCount}
                <ConceptDetailView
                  concept={selectedConcept}
                  onClose={handleBackToPath}
                />
              {/key}
            {:else}
              <ConceptPathView onConceptClick={handleConceptClick} />
            {/if}
          {:else if isModeActive("play")}
            <QuizTab />
          {:else if isModeActive("codex")}
            <CodexTab />
          {/if}
        </div>
      {/key}
    </div>
  </div>
{/if}

<style>
  .onboarding-wrapper {
    position: absolute;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.95));
  }

  .learn-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
    container-type: size;
    container-name: learn-tab;
  }

  /* Content container */
  .content-container {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Mode panels */
  .mode-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
