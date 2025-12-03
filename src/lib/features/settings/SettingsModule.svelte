<!--
  SettingsModule.svelte - Settings as a proper module

  Layout: Single scrollable page with section headers (iOS Settings style)
  No tabs - just one continuous page with clear sections

  Sections: Profile, Props, Appearance, Display, Advanced
  Accessed via gear icon in sidebar footer (not in main module list)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import {
    getSettings,
    updateSettings,
  } from "$lib/shared/application/state/app-state.svelte";
  import { areServicesInitialized } from "$lib/shared/application/state/services.svelte";
  import IOSSkeletonLoader from "$lib/shared/settings/components/IOSSkeletonLoader.svelte";
  import Toast from "$lib/shared/settings/components/Toast.svelte";

  // Import all tab components directly
  import ProfileTab from "$lib/shared/settings/components/tabs/ProfileTab.svelte";
  import PropTypeTab from "$lib/shared/settings/components/tabs/PropTypeTab.svelte";
  import BackgroundTab from "$lib/shared/settings/components/tabs/background/BackgroundTab.svelte";
  import VisibilityTab from "$lib/shared/settings/components/tabs/VisibilityTab.svelte";
  import AccessibilityTab from "$lib/shared/settings/components/tabs/AccessibilityTab.svelte";

  // Services
  let hapticService: IHapticFeedbackService | null = $state(null);

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

  onMount(() => {
    // Resolve services
    (async () => {
      hapticService = await resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    })();
  });

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

  // Section configuration
  const sections = [
    { id: "profile", label: "Profile", icon: "fa-user" },
    { id: "props", label: "Props", icon: "fa-tags" },
    { id: "appearance", label: "Appearance", icon: "fa-palette" },
    { id: "display", label: "Display", icon: "fa-eye" },
    { id: "advanced", label: "Advanced", icon: "fa-sliders-h" },
  ];
</script>

<div class="settings-module">
  {#if !isSettingsLoaded}
    <div class="loading-state">
      <IOSSkeletonLoader variant="toggle" count={8} />
    </div>
  {:else}
    <main class="settings-content">
      <!-- Profile Section -->
      <section class="settings-section" id="profile">
        <header class="section-header">
          <i class="fas fa-user"></i>
          <h2>Profile</h2>
        </header>
        <div class="section-content">
          <ProfileTab currentSettings={settings} onSettingUpdate={handleSettingUpdate} />
        </div>
      </section>

      <!-- Props Section -->
      <section class="settings-section" id="props">
        <header class="section-header">
          <i class="fas fa-tags"></i>
          <h2>Props</h2>
        </header>
        <div class="section-content">
          <PropTypeTab {settings} onUpdate={handleSettingUpdate} />
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section" id="appearance">
        <header class="section-header">
          <i class="fas fa-palette"></i>
          <h2>Appearance</h2>
        </header>
        <div class="section-content">
          <BackgroundTab {settings} onUpdate={handleSettingUpdate} />
        </div>
      </section>

      <!-- Display Section -->
      <section class="settings-section" id="display">
        <header class="section-header">
          <i class="fas fa-eye"></i>
          <h2>Display</h2>
        </header>
        <div class="section-content">
          <VisibilityTab currentSettings={settings} onSettingUpdate={handleSettingUpdate} />
        </div>
      </section>

      <!-- Advanced Section -->
      <section class="settings-section" id="advanced">
        <header class="section-header">
          <i class="fas fa-sliders-h"></i>
          <h2>Advanced</h2>
        </header>
        <div class="section-content">
          <AccessibilityTab currentSettings={settings} onSettingUpdate={handleSettingUpdate} />
        </div>
      </section>
    </main>
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
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 1) 0%,
      rgba(15, 20, 30, 1) 100%
    );
    color: var(--foreground, #ffffff);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Single scrollable content area */
  .settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    min-height: 0;
    padding: clamp(16px, 3vw, 32px);
    padding-bottom: calc(clamp(16px, 3vw, 32px) + 80px); /* Extra padding for bottom nav */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
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

  /* Section styling */
  .settings-section {
    max-width: 800px;
    margin: 0 auto 48px;
  }

  .settings-section:last-child {
    margin-bottom: 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    margin-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: sticky;
    top: 0;
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.98) 100%
    );
    backdrop-filter: blur(8px);
    z-index: 10;
  }

  .section-header i {
    font-size: 20px;
    color: rgba(99, 102, 241, 0.9);
    width: 28px;
    text-align: center;
  }

  .section-header h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
  }

  /* .section-content - tab components handle their own padding/spacing */

  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: clamp(16px, 3vw, 32px);
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  /* Mobile adjustments */
  @media (max-width: 768px) {
    .settings-content {
      padding: 16px;
      padding-bottom: calc(16px + 100px); /* More space for bottom nav on mobile */
    }

    .settings-section {
      margin-bottom: 32px;
    }

    .section-header {
      padding: 12px 0;
      margin-bottom: 12px;
    }

    .section-header i {
      font-size: 18px;
      width: 24px;
    }

    .section-header h2 {
      font-size: 16px;
    }
  }

  /* Small mobile */
  @media (max-width: 480px) {
    .settings-content {
      padding: 12px;
      padding-bottom: calc(12px + 100px);
    }

    .settings-section {
      margin-bottom: 24px;
    }

    .section-header {
      gap: 8px;
      padding: 10px 0;
      margin-bottom: 10px;
    }

    .section-header i {
      font-size: 16px;
      width: 20px;
    }

    .section-header h2 {
      font-size: 15px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .settings-content {
      scroll-behavior: auto;
    }
  }
</style>
