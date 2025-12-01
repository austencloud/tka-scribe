<!--
  AccountModule.svelte - Main Account Module Component

  A full-screen module for managing user account, library, preferences, and security.
  Tabs are navigated via the sidebar (same as other modules like Create, Learn, etc.)

  Tabs:
  - Overview: User info, stats, achievements summary
  - Library: My Sequences, Favorites, Collections, Acts
  - Preferences: App settings, prop types, theme
  - Security: Sign in/out, linked accounts, privacy
-->
<script lang="ts">
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { fade } from "svelte/transition";
  import OverviewTab from "./components/OverviewTab.svelte";
  import LibraryTab from "./components/LibraryTab.svelte";
  import PreferencesTab from "./components/PreferencesTab.svelte";
  import SecurityTab from "./components/SecurityTab.svelte";

  // Get active tab from navigation state (controlled by sidebar)
  const activeTab = $derived(navigationState.activeTab || "overview");
</script>

<div class="account-module">
  <!-- Tab Content -->
  <div class="tab-content">
    {#key activeTab}
      <div class="tab-panel" transition:fade={{ duration: 150 }}>
        {#if activeTab === "overview"}
          <OverviewTab />
        {:else if activeTab === "library"}
          <LibraryTab />
        {:else if activeTab === "preferences"}
          <PreferencesTab />
        {:else if activeTab === "security"}
          <SecurityTab />
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .account-module {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
  }

  /* Tab Content */
  .tab-content {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .tab-panel {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
