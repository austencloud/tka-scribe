<!--
  AnimateModule.svelte - Advanced Animation Visualization Module

  Tabs:
  - Setup: Bento-style mode selection and sequence configuration
  - Playback: Unified animation view with per-canvas controls
  - Browse: Saved animations gallery

  Modes (selected in Setup, rendered in Playback):
  - Single: Animate one sequence (full-screen canvas)
  - Tunnel: Overlay two sequences with different colors
  - Mirror: Side-by-side view with one mirrored
  - Grid: 2×2 grid with rotation offsets
  - Side-by-Side: Compare two sequences
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import { getAnimateModuleState } from "./shared/state/animate-module-state.svelte.ts";
  import type { AnimateTab } from "./shared/state/animate-module-state.svelte.ts";
  import type { IURLSyncService } from "$lib/shared/navigation/services/contracts/IURLSyncService";
  import type { IDeepLinkService } from "$lib/shared/navigation/services/contracts/IDeepLinkService";

  // Import new tab components
  import SetupTab from "./tabs/setup/SetupTab.svelte";
  import PlaybackTab from "./tabs/playback/PlaybackTab.svelte";
  import BrowseTab from "./tabs/browse/BrowseTab.svelte";

  // Get module state (singleton)
  const animateState = getAnimateModuleState();

  // Services
  let urlSyncService: IURLSyncService | null = $state(null);
  let deepLinkService: IDeepLinkService | null = $state(null);

  // Track if deep link has been processed
  let deepLinkProcessed = $state(false);

  // Sync current tab with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (section === "setup" || section === "playback" || section === "browse") {
      animateState.setCurrentTab(section as AnimateTab);
    }
  });

  // Sync tab to URL for sharing
  $effect(() => {
    if (!urlSyncService) return;
    const currentModule = navigationState.currentModule;
    if (currentModule !== "animate") return;

    // TODO: Sync animation ID to URL when viewing saved animations
  });

  // Initialize on mount
  onMount(() => {
    // Resolve services
    try {
      urlSyncService = resolve<IURLSyncService>(TYPES.IURLSyncService);
      deepLinkService = resolve<IDeepLinkService>(TYPES.IDeepLinkService);
    } catch (error) {
      console.warn("Failed to resolve navigation services:", error);
    }

    // Set default tab if none persisted
    const section = navigationState.activeTab;
    if (
      !section ||
      (section !== "setup" && section !== "playback" && section !== "browse")
    ) {
      navigationState.setActiveTab("setup");
    }

    // Check for deep link (e.g., shared animation URL)
    const deepLinkData = deepLinkService?.consumeData("animate");
    if (deepLinkData) {
      try {
        console.log("🔗 Loading animation from deep link");
        // TODO: Load animation by ID and navigate to playback
        // For now, just navigate to the specified tab
        if (deepLinkData.tabId) {
          navigationState.setActiveTab(deepLinkData.tabId);
          animateState.setCurrentTab(deepLinkData.tabId as AnimateTab);
        }
      } catch (err) {
        console.error("❌ Failed to load deep link animation:", err);
      }
    }

    // Mark deep link as processed
    deepLinkProcessed = true;
  });

  // Check if tab is active
  function isTabActive(tab: AnimateTab): boolean {
    return animateState.currentTab === tab;
  }
</script>

<div class="animate-module">
  <div class="content-container">
    {#key animateState.currentTab}
      <div class="tab-panel">
        {#if isTabActive("setup")}
          <SetupTab />
        {:else if isTabActive("playback")}
          <PlaybackTab />
        {:else if isTabActive("browse")}
          <BrowseTab />
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .animate-module {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 1) 0%,
      rgba(15, 20, 30, 1) 100%
    );
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
</style>
