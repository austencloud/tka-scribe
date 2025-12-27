<!--
  ComposeModule.svelte - Choreography & Arrangement Module

  Tabs:
  - Arrange (Compose): Unified composition builder with inline playback
  - Browse: Saved compositions gallery

  Architecture:
  - CompositionBuilder replaces old ArrangeTab with layout-first approach
  - Each cell in the grid can be single or tunnel (multiple overlaid sequences)
  - Playback happens inline - no separate overlay needed for new compositions
  - PlaybackOverlay still used for Browse tab (legacy saved compositions)
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount, untrack } from "svelte";
  import { getComposeModuleState } from "./shared/state/compose-module-state.svelte.ts";
  import type { ComposeTab } from "./shared/state/compose-module-state.svelte.ts";
  import type { IURLSyncer } from "$lib/shared/navigation/services/contracts/IURLSyncer";
  import type { IDeepLinker } from "$lib/shared/navigation/services/contracts/IDeepLinker";
  import ModuleOnboarding from "$lib/shared/onboarding/components/ModuleOnboarding.svelte";
  import { COMPOSE_ONBOARDING } from "$lib/shared/onboarding/config/module-onboarding-content";
  import {
    hasCompletedModuleOnboarding,
    markModuleOnboardingComplete,
  } from "$lib/shared/onboarding/config/storage-keys";

  // ============================================================================
  // ONBOARDING STATE
  // ============================================================================
  let showOnboarding = $state(false);

  $effect(() => {
    if (typeof window !== "undefined") {
      showOnboarding = !hasCompletedModuleOnboarding("compose");
    }
  });

  // Sync onboarding visibility with navigation state (for desktop sidebar tab hiding)
  $effect(() => {
    const visible = showOnboarding;
    untrack(() => {
      navigationState.setModuleOnboardingVisible("compose", visible);
    });
  });

  function handleOnboardingChoiceStepReached() {
    navigationState.setModuleOnboardingOnChoiceStep("compose", true);
  }

  function handleOnboardingTabSelected(tabId: string) {
    markModuleOnboardingComplete("compose");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("compose", false);
    navigationState.setActiveTab(tabId as ComposeTab);
  }

  function handleOnboardingSkip() {
    markModuleOnboardingComplete("compose");
    showOnboarding = false;
    navigationState.setModuleOnboardingVisible("compose", false);
  }

  // Import tab components
  // CompositionBuilder replaces old ArrangeTab with unified layout-first composition builder
  import CompositionBuilder from "./compose/CompositionBuilder.svelte";
  import BrowseTab from "./tabs/browse/BrowseTab.svelte";
  import TimelinePanel from "./timeline/components/TimelinePanel.svelte";

  // Import playback overlay (for Browse tab - legacy saved compositions)
  import PlaybackOverlay from "./tabs/playback/PlaybackTab.svelte";

  // Get module state (singleton)
  const composeState = getComposeModuleState();

  // Services
  let urlSyncService: IURLSyncer | null = $state(null);
  let deepLinkService: IDeepLinker | null = $state(null);

  // Track if deep link has been processed
  let deepLinkProcessed = $state(false);

  // Sync current tab with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (
      section === "arrange" ||
      section === "browse" ||
      section === "timeline"
    ) {
      composeState.setCurrentTab(section as ComposeTab);
    }
  });

  // Sync tab to URL for sharing
  $effect(() => {
    if (!urlSyncService) return;
    const currentModule = navigationState.currentModule;
    if (currentModule !== "compose") return;

    // TODO: Sync composition ID to URL when viewing saved compositions
  });

  // Initialize on mount
  onMount(() => {
    // Resolve services
    try {
      urlSyncService = resolve<IURLSyncer>(TYPES.IURLSyncer);
      deepLinkService = resolve<IDeepLinker>(TYPES.IDeepLinker);
    } catch (error) {
      console.warn("Failed to resolve navigation services:", error);
    }

    // Set default tab if none persisted or invalid
    const section = navigationState.activeTab;
    if (
      !section ||
      (section !== "arrange" && section !== "browse" && section !== "timeline")
    ) {
      navigationState.setActiveTab("arrange");
    }

    // Check for deep link (e.g., shared composition URL)
    const deepLinkData = deepLinkService?.consumeData("compose");
    if (deepLinkData) {
      try {
        console.log("🔗 Loading composition from deep link");
        // TODO: Load composition by ID and open playback overlay
        // For now, just navigate to the specified tab
        if (
          deepLinkData.tabId &&
          (deepLinkData.tabId === "arrange" ||
            deepLinkData.tabId === "browse" ||
            deepLinkData.tabId === "timeline")
        ) {
          navigationState.setActiveTab(deepLinkData.tabId);
          composeState.setCurrentTab(deepLinkData.tabId as ComposeTab);
        }
      } catch (err) {
        console.error("❌ Failed to load deep link composition:", err);
      }
    }

    // Mark deep link as processed
    deepLinkProcessed = true;
  });

  // Check if tab is active
  function isTabActive(tab: ComposeTab): boolean {
    return composeState.currentTab === tab;
  }
</script>

{#if showOnboarding}
  <div class="onboarding-wrapper">
    <ModuleOnboarding
      moduleId={COMPOSE_ONBOARDING.moduleId}
      moduleName={COMPOSE_ONBOARDING.moduleName}
      moduleIcon={COMPOSE_ONBOARDING.moduleIcon}
      moduleColor={COMPOSE_ONBOARDING.moduleColor}
      welcomeTitle={COMPOSE_ONBOARDING.welcomeTitle}
      welcomeSubtitle={COMPOSE_ONBOARDING.welcomeSubtitle}
      welcomeDescription={COMPOSE_ONBOARDING.welcomeDescription}
      tabs={COMPOSE_ONBOARDING.tabs}
      onTabSelected={handleOnboardingTabSelected}
      onSkip={handleOnboardingSkip}
      onChoiceStepReached={handleOnboardingChoiceStepReached}
    />
  </div>
{:else}
  <div class="compose-module">
    <div class="content-container">
      {#key composeState.currentTab}
        <div class="tab-panel">
          {#if isTabActive("arrange")}
            <CompositionBuilder />
          {:else if isTabActive("browse")}
            <BrowseTab />
          {:else if isTabActive("timeline")}
            <TimelinePanel />
          {/if}
        </div>
      {/key}
    </div>

    <!-- Playback Overlay - renders fullscreen over tabs when open -->
    {#if composeState.isPlaybackOpen}
      <div class="playback-overlay">
        <PlaybackOverlay />
      </div>
    {/if}
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

  .compose-module {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
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
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Playback overlay - fullscreen over tabs */
  .playback-overlay {
    position: absolute;
    inset: 0;
    z-index: 100;
    background: transparent;
  }
</style>
