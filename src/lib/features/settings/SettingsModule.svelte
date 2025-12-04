<!--
  SettingsModule.svelte - Settings as a proper module

  Uses standard bottom navigation (tabs provided via SETTINGS_TABS)
  Content renders based on navigationState.activeTab

  Tabs: Profile, Props, Background, Visibility, Misc
  Accessed via gear icon in sidebar footer (not in main module list)
-->
<script lang="ts">
  import {
    getSettings,
    updateSettings,
  } from "$lib/shared/application/state/app-state.svelte";
  import { areServicesInitialized } from "$lib/shared/application/state/services.svelte";
  import IOSSkeletonLoader from "$lib/shared/settings/components/IOSSkeletonLoader.svelte";
  import Toast from "$lib/shared/settings/components/Toast.svelte";

  // Navigation state - use global activeTab
  import { navigationState, SETTINGS_TABS } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Import all tab components directly
  import ProfileTab from "$lib/shared/settings/components/tabs/ProfileTab.svelte";
  import PropTypeTab from "$lib/shared/settings/components/tabs/PropTypeTab.svelte";
  import BackgroundTab from "$lib/shared/settings/components/tabs/background/BackgroundTab.svelte";
  import VisibilityTab from "$lib/shared/settings/components/tabs/VisibilityTab.svelte";
  import AccessibilityTab from "$lib/shared/settings/components/tabs/AccessibilityTab.svelte";
  import AISettingsTab from "$lib/shared/settings/components/tabs/AISettingsTab.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

  // Reactive settings - derives from getSettings() to maintain reactivity
  let settings = $derived(getSettings());

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("Settings saved");

  // Check if settings are loaded AND services are initialized
  const isSettingsLoaded = $derived(
    settings &&
      typeof settings === "object" &&
      Object.keys(settings).length > 0 &&
      areServicesInitialized()
  );

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

  // Use navigation state's active tab
  const activeTab = $derived(navigationState.activeTab);

  // Check if admin-only AI tab should be shown
  const showAITab = $derived(authStore.isAdmin && activeTab === "ai-analysis");
</script>

<div class="settings-module">
  {#if !isSettingsLoaded}
    <div class="loading-state">
      <IOSSkeletonLoader variant="toggle" count={8} />
    </div>
  {:else}
    <div class="settings-content">
      <section class="panel">
        {#if activeTab === "profile"}
          <ProfileTab
            currentSettings={settings}
            onSettingUpdate={handleSettingUpdate}
          />
        {:else if activeTab === "props"}
          <PropTypeTab {settings} onUpdate={handleSettingUpdate} />
        {:else if activeTab === "background"}
          <BackgroundTab {settings} onUpdate={handleSettingUpdate} />
        {:else if activeTab === "visibility"}
          <VisibilityTab
            currentSettings={settings}
            onSettingUpdate={handleSettingUpdate}
          />
        {:else if activeTab === "misc"}
          <AccessibilityTab
            currentSettings={settings}
            onSettingUpdate={handleSettingUpdate}
          />
        {:else if showAITab}
          <AISettingsTab onSettingUpdate={handleSettingUpdate} />
        {:else}
          <!-- Fallback to profile if unknown tab -->
          <ProfileTab
            currentSettings={settings}
            onSettingUpdate={handleSettingUpdate}
          />
        {/if}
      </section>
    </div>
  {/if}

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
    background: transparent;
    color: var(--foreground, #ffffff);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(8px, 2vw, 16px);
    min-height: 0;
  }

  .settings-content::-webkit-scrollbar {
    width: 6px;
  }

  .settings-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .settings-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  /* Panel - content card */
  .panel {
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    background: rgba(12, 14, 24, 0.94);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    padding: clamp(12px, 2vw, 20px);
    min-width: 0;
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(16px, 3vw, 32px);
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }
</style>
