<!--
  LibraryModule.svelte - Personal Content Library

  Three tabs:
  - Sequences: User's saved sequences
  - Collections: Folders for organizing content
  - Compositions: Saved compositions from Compose module
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { onMount, untrack } from "svelte";
  import SequencesView from "./components/SequencesView.svelte";
  import CollectionsView from "./components/CollectionsView.svelte";
  import CompositionsView from "./components/CompositionsView.svelte";
  import ModuleOnboarding from "$lib/shared/onboarding/components/ModuleOnboarding.svelte";
  import { LIBRARY_ONBOARDING } from "$lib/shared/onboarding/config/module-onboarding-content";
  import {
    hasCompletedModuleOnboarding,
    markModuleOnboardingComplete,
  } from "$lib/shared/onboarding/config/storage-keys";

  type LibraryTab = "sequences" | "collections" | "compositions";

  // ============================================================================
  // ONBOARDING STATE
  // ============================================================================
  let showOnboarding = $state(false);

  $effect(() => {
    if (typeof window !== "undefined") {
      showOnboarding = !hasCompletedModuleOnboarding("library");
    }
  });

  // Sync onboarding visibility with navigation state (for desktop sidebar tab hiding)
  $effect(() => {
    const visible = showOnboarding;
    untrack(() => {
      navigationState.setModuleOnboardingVisible("library", visible);
    });
  });

  function handleOnboardingChoiceStepReached() {
    navigationState.setModuleOnboardingOnChoiceStep("library", true);
  }

  function handleOnboardingTabSelected(tabId: string) {
    markModuleOnboardingComplete("library");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("library", false);
    navigationState.setActiveTab(tabId as LibraryTab);
  }

  function handleOnboardingSkip() {
    markModuleOnboardingComplete("library");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("library", false);
  }

  // Active tab synced with navigation state
  let activeTab = $state<LibraryTab>("sequences");

  // Track previous section to detect actual changes
  let prevSection: string | undefined;

  // Sync with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (
      section !== prevSection &&
      (section === "sequences" ||
        section === "collections" ||
        section === "compositions")
    ) {
      prevSection = section;
      activeTab = section;
    }
  });

  // Initialize on mount
  onMount(() => {
    const section = navigationState.activeTab;
    prevSection = section;
    // Set default tab if none set or invalid
    if (
      !section ||
      (section !== "sequences" &&
        section !== "collections" &&
        section !== "compositions")
    ) {
      navigationState.setActiveTab("sequences");
    }
  });

  function isTabActive(tab: LibraryTab): boolean {
    return activeTab === tab;
  }
</script>

{#if showOnboarding}
  <div class="onboarding-wrapper">
    <ModuleOnboarding
      moduleId={LIBRARY_ONBOARDING.moduleId}
      moduleName={LIBRARY_ONBOARDING.moduleName}
      moduleIcon={LIBRARY_ONBOARDING.moduleIcon}
      moduleColor={LIBRARY_ONBOARDING.moduleColor}
      welcomeTitle={LIBRARY_ONBOARDING.welcomeTitle}
      welcomeSubtitle={LIBRARY_ONBOARDING.welcomeSubtitle}
      welcomeDescription={LIBRARY_ONBOARDING.welcomeDescription}
      tabs={LIBRARY_ONBOARDING.tabs}
      onTabSelected={handleOnboardingTabSelected}
      onSkip={handleOnboardingSkip}
      onChoiceStepReached={handleOnboardingChoiceStepReached}
    />
  </div>
{:else}
  <div class="library-module">
    <div class="content-container">
      <!-- Sequences Tab -->
      <div class="tab-panel" class:active={isTabActive("sequences")}>
        <SequencesView />
      </div>

      <!-- Collections Tab -->
      <div class="tab-panel" class:active={isTabActive("collections")}>
        <CollectionsView />
      </div>

      <!-- Compositions Tab -->
      <div class="tab-panel" class:active={isTabActive("compositions")}>
        <CompositionsView />
      </div>
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
    background: var(--theme-panel-bg);
  }

  .library-module {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
    container-type: size;
    container-name: library-module;
  }

  .content-container {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .tab-panel {
    position: absolute;
    inset: 0;
    display: none;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .tab-panel.active {
    display: flex;
    flex-direction: column;
  }
</style>
