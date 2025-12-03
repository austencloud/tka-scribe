<!--
  SettingsModule.svelte - Settings as a proper module

  Layout: Horizontal tab bar at top + scrollable content below
  This avoids double-sidebar effect on desktop (main nav + settings tabs)

  Tabs: Profile, Props, Background, Visibility, Misc
  Accessed via gear icon in sidebar footer (not in main module list)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import {
    getSettings,
    updateSettings,
  } from "$lib/shared/application/state/app-state.svelte";
  import { areServicesInitialized } from "$lib/shared/application/state/services.svelte";
  import { getSettingsModuleState, type SettingsTab } from "./state/settings-module-state.svelte";
  import SettingsTabContent from "$lib/shared/settings/components/SettingsTabContent.svelte";
  import IOSSkeletonLoader from "$lib/shared/settings/components/IOSSkeletonLoader.svelte";
  import Toast from "$lib/shared/settings/components/Toast.svelte";

  // Get module state (singleton)
  const settingsState = getSettingsModuleState();

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

  // Reactive settings - derives from getSettings() to maintain reactivity
  let settings = $derived(getSettings());

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("Settings saved");

  // Map new tab IDs to legacy tab IDs used by SettingsTabContent
  const TAB_ID_MAP: Record<SettingsTab, string> = {
    profile: "Profile",
    props: "PropType",
    background: "Background",
    visibility: "Visibility",
    misc: "Accessibility",
  };

  // Tab configuration
  const tabs = [
    { id: "profile", label: "Profile", icon: "fa-user" },
    { id: "props", label: "Props", icon: "fa-tags" },
    { id: "background", label: "Background", icon: "fa-image" },
    { id: "visibility", label: "Visibility", icon: "fa-eye" },
    { id: "misc", label: "Misc", icon: "fa-sliders-h" },
  ];

  // Sync with navigation state on mount and when activeTab changes externally
  $effect(() => {
    const navTab = navigationState.activeTab;
    // Only sync if it's a valid settings tab
    if (navTab && isValidSettingsTab(navTab) && navTab !== settingsState.currentTab) {
      settingsState.setCurrentTab(navTab as SettingsTab);
    }
  });

  // Check if settings are loaded AND services are initialized
  const isSettingsLoaded = $derived(
    settings &&
      typeof settings === "object" &&
      Object.keys(settings).length > 0 &&
      areServicesInitialized()
  );

  // Get the legacy tab ID for SettingsTabContent
  const legacyTabId = $derived(TAB_ID_MAP[settingsState.currentTab]);

  onMount(() => {
    // Resolve services
    (async () => {
      hapticService = await resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    })();

    // Ensure we have a valid tab set in navigation state
    if (!navigationState.activeTab || !isValidSettingsTab(navigationState.activeTab)) {
      navigationState.setActiveTab(settingsState.currentTab);
    }
  });

  function isValidSettingsTab(tab: string): boolean {
    return ["profile", "props", "background", "visibility", "misc"].includes(tab);
  }

  function handleTabSelect(tabId: string) {
    hapticService?.trigger("selection");
    settingsState.setCurrentTab(tabId as SettingsTab);
    navigationState.setActiveTab(tabId);
  }

  // Adapter for settings updates with instant save
  async function handleSettingUpdate(event: { key: string; value: unknown }) {
    // Create updated settings object with the change
    const updatedSettings = { ...settings, [event.key]: event.value };

    // Apply changes immediately - this will trigger reactivity
    await updateSettings(updatedSettings);

    // Show success toast
    showToast = true;
    toastMessage = "Settings saved";

    // Reset toast after it displays
    setTimeout(() => {
      showToast = false;
    }, 100);
  }
</script>

<div class="settings-module">
  <!-- Horizontal Tab Bar -->
  <nav class="settings-tabs">
    {#each tabs as tab}
      <button
        class="tab-button"
        class:active={settingsState.currentTab === tab.id}
        onclick={() => handleTabSelect(tab.id)}
        aria-label={tab.label}
      >
        <i class="fas {tab.icon}"></i>
        <span class="tab-label">{tab.label}</span>
      </button>
    {/each}
  </nav>

  <!-- Content Area -->
  <main class="settings-content">
    {#if !isSettingsLoaded}
      <div class="loading-state">
        <IOSSkeletonLoader variant="toggle" count={5} />
      </div>
    {:else}
      <div class="tab-content">
        <SettingsTabContent
          activeTab={legacyTabId}
          {settings}
          onSettingUpdate={handleSettingUpdate}
        />
      </div>
    {/if}
  </main>

  <!-- Toast Notification -->
  <Toast show={showToast} message={toastMessage} />
</div>

<style>
  .settings-module {
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
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Horizontal Tab Bar */
  .settings-tabs {
    display: flex;
    flex-shrink: 0;
    gap: 4px;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
    scrollbar-width: none;
  }

  .settings-tabs::-webkit-scrollbar {
    display: none;
  }

  .tab-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    min-height: 44px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
  }

  .tab-button.active {
    background: rgba(99, 102, 241, 0.25);
    border-color: rgba(99, 102, 241, 0.5);
    color: #ffffff;
  }

  .tab-button i {
    font-size: 16px;
  }

  .tab-label {
    font-weight: 500;
  }

  /* Content Area */
  .settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding: clamp(16px, 3vw, 32px);
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .settings-content::-webkit-scrollbar {
    display: none;
  }

  .tab-content {
    max-width: 800px;
    margin: 0 auto;
    animation: fade-in 0.2s ease-out;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .settings-tabs {
      padding: 8px 12px;
      gap: 6px;
    }

    .tab-button {
      flex: 1;
      flex-direction: column;
      gap: 4px;
      padding: 8px 10px;
      min-height: 56px;
      justify-content: center;
    }

    .tab-button i {
      font-size: 18px;
    }

    .tab-label {
      font-size: 11px;
    }

    .settings-content {
      padding: 16px;
    }
  }

  /* Small mobile */
  @media (max-width: 480px) {
    .settings-tabs {
      padding: 6px 8px;
      gap: 4px;
    }

    .tab-button {
      padding: 6px 8px;
      min-height: 52px;
    }

    .tab-button i {
      font-size: 16px;
    }

    .tab-label {
      font-size: 10px;
    }

    .settings-content {
      padding: 12px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .tab-content {
      animation: none;
    }
  }
</style>
