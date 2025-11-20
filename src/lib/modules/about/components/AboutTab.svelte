<script lang="ts">
  import { navigationState } from "$shared";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import OverviewTab from "./tabs/OverviewTab.svelte";
  import HistorianTab from "./tabs/HistorianTab.svelte";
  import SupportTab from "./tabs/SupportTab.svelte";

  // Valid tab IDs for the About module
  type AboutTabId = "overview" | "historian" | "support";

  // Current active tab (synced with navigation state)
  let currentTab = $state<AboutTabId>("overview");

  // Sync current tab with navigation state
  $effect(() => {
    const section = navigationState.activeTab;
    if (
      section === "overview" ||
      section === "historian" ||
      section === "support"
    ) {
      currentTab = section as AboutTabId;
    }
  });

  // Initialize on mount
  onMount(() => {
    console.log("✅ AboutTab: Mounted");

    // Set default tab if none persisted or invalid
    const section = navigationState.activeTab;
    if (
      !section ||
      (section !== "overview" &&
        section !== "historian" &&
        section !== "support")
    ) {
      navigationState.setActiveTab("overview");
    }
  });

  // Check if tab is active
  function isTabActive(tabId: AboutTabId): boolean {
    return currentTab === tabId;
  }
</script>

<div class="about-tab">
  <!-- Tab-specific content with smooth transitions -->
  <div class="content-container">
    {#key currentTab}
      <div class="tab-panel" transition:fade={{ duration: 200 }}>
        {#if isTabActive("overview")}
          <OverviewTab />
        {:else if isTabActive("historian")}
          <HistorianTab />
        {:else if isTabActive("support")}
          <SupportTab />
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .about-tab {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: var(--cosmic-gradient);
    color: var(--text-color);
  }

  /* Content container */
  .content-container {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }

  .tab-panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
