<!--
  TrainModule.svelte - Root Train Module Component

  Manages tab navigation between Practice, Challenges, and Progress tabs.
  Syncs with global navigation state and provides smooth transitions.
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { untrack } from "svelte";
  import type { Section } from "$lib/shared/navigation/domain/types";
  import ModuleOnboarding from "$lib/shared/onboarding/components/ModuleOnboarding.svelte";
  import { TRAIN_ONBOARDING } from "$lib/shared/onboarding/config/module-onboarding-content";
  import {
    hasCompletedModuleOnboarding,
    markModuleOnboardingComplete,
  } from "$lib/shared/onboarding/config/storage-keys";

  import PracticePanel from "./practice/PracticePanel.svelte";
  import ProgressPanel from "./progress/ProgressPanel.svelte";
  import ChallengesPanel from "./challenges/ChallengesPanel.svelte";

  type TrainSection = "practice" | "challenges" | "progress";
  let activeSection = $state<TrainSection>("practice");

  // ============================================================================
  // ONBOARDING STATE
  // ============================================================================
  let showOnboarding = $state(false);

  $effect(() => {
    if (typeof window !== "undefined") {
      showOnboarding = !hasCompletedModuleOnboarding("train");
    }
  });

  // Sync onboarding visibility with navigation state (for desktop sidebar tab hiding)
  $effect(() => {
    const visible = showOnboarding;
    untrack(() => {
      navigationState.setModuleOnboardingVisible("train", visible);
    });
  });

  function handleOnboardingChoiceStepReached() {
    navigationState.setModuleOnboardingOnChoiceStep("train", true);
  }

  function handleOnboardingTabSelected(tabId: string) {
    markModuleOnboardingComplete("train");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("train", false);
    navigationState.setActiveTab(tabId as TrainSection);
  }

  function handleOnboardingSkip() {
    markModuleOnboardingComplete("train");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("train", false);
  }

  // Sync with navigation state (View Transitions handled by navigation-coordinator)
  $effect(() => {
    const navTab = navigationState.activeTab;
    if (navTab && ["practice", "challenges", "progress"].includes(navTab)) {
      activeSection = navTab as TrainSection;
    }
  });
</script>

{#if showOnboarding}
  <div class="onboarding-wrapper">
    <ModuleOnboarding
      moduleId={TRAIN_ONBOARDING.moduleId}
      moduleName={TRAIN_ONBOARDING.moduleName}
      moduleIcon={TRAIN_ONBOARDING.moduleIcon}
      moduleColor={TRAIN_ONBOARDING.moduleColor}
      welcomeTitle={TRAIN_ONBOARDING.welcomeTitle}
      welcomeSubtitle={TRAIN_ONBOARDING.welcomeSubtitle}
      welcomeDescription={TRAIN_ONBOARDING.welcomeDescription}
      tabs={TRAIN_ONBOARDING.tabs}
      onTabSelected={handleOnboardingTabSelected}
      onSkip={handleOnboardingSkip}
      onChoiceStepReached={handleOnboardingChoiceStepReached}
    />
  </div>
{:else}
  <div class="train-module">
    {#key activeSection}
      <div class="section-panel">
        {#if activeSection === "practice"}
          <PracticePanel />
        {:else if activeSection === "challenges"}
          <ChallengesPanel />
        {:else if activeSection === "progress"}
          <ProgressPanel />
        {/if}
      </div>
    {/key}
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

  .train-module {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: transparent;
  }

  .section-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
</style>
