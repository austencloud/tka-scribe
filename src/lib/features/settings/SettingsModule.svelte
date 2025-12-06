<!--
  SettingsModule.svelte - Settings as a proper module

  Uses standard bottom navigation (tabs provided via SETTINGS_TABS)
  Content renders based on navigationState.activeTab

  Tabs: Profile, Props, Background, Visibility, Misc
  Accessed via gear icon in sidebar footer (not in main module list)

  Mobile: Swipe left from left edge to exit (matches portal animation direction)
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    getSettings,
    updateSettings,
  } from "$lib/shared/application/state/app-state.svelte";
  import { areServicesInitialized } from "$lib/shared/application/state/services.svelte";
  import IOSSkeletonLoader from "$lib/shared/settings/components/IOSSkeletonLoader.svelte";
  import Toast from "$lib/shared/settings/components/Toast.svelte";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import type { ModuleId } from "$lib/shared/navigation/domain/types";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import type { ResponsiveSettings } from "$lib/shared/device/domain/models/device-models";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  // Navigation state - use global activeTab
  import {
    navigationState,
    SETTINGS_TABS,
  } from "$lib/shared/navigation/state/navigation-state.svelte";

  // Import all tab components directly
  import ProfileTab from "$lib/shared/settings/components/tabs/ProfileTab.svelte";
  import WhatsNewTab from "$lib/shared/settings/components/tabs/WhatsNewTab.svelte";
  import NotificationsTab from "$lib/shared/settings/components/tabs/NotificationsTab.svelte";
  import PropTypeTab from "$lib/shared/settings/components/tabs/PropTypeTab.svelte";
  import BackgroundTab from "$lib/shared/settings/components/tabs/background/BackgroundTab.svelte";
  import VisibilityTab from "$lib/shared/settings/components/tabs/VisibilityTab.svelte";

  // Reactive settings - derives from getSettings() to maintain reactivity
  let settings = $derived(getSettings());

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("Settings saved");

  // Device detection for layout awareness
  let deviceDetector: IDeviceDetector | null = null;
  let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // Haptic feedback service
  let hapticService: IHapticFeedbackService | null = null;

  // Show back header when using bottom navigation (not landscape mobile)
  let useBottomNavigation = $derived(!responsiveSettings?.isLandscapeMobile);

  onMount(() => {
    let deviceCleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      responsiveSettings = deviceDetector.getResponsiveSettings();
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );

      deviceCleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (error) {
      console.warn("SettingsModule: Failed to resolve DeviceDetector", error);
    }

    return () => {
      deviceCleanup?.();
    };
  });

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

  // Swipe-to-exit gesture state
  let swipeStartX = 0;
  let swipeStartY = 0;
  let isSwiping = $state(false);
  let swipeProgress = $state(0); // 0 to 1, for visual feedback
  const SWIPE_EDGE_ZONE = 50; // px from left edge to start swipe
  const SWIPE_THRESHOLD = 100; // px to trigger exit
  const SWIPE_ANGLE_THRESHOLD = 30; // degrees - must be mostly horizontal

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    if (!touch) return;

    // Only track swipes starting from left edge
    if (touch.clientX <= SWIPE_EDGE_ZONE) {
      swipeStartX = touch.clientX;
      swipeStartY = touch.clientY;
      isSwiping = true;
      swipeProgress = 0;
    }
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isSwiping) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - swipeStartX;
    const deltaY = touch.clientY - swipeStartY;

    // Check angle - must be mostly horizontal (swipe right to exit)
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * (180 / Math.PI));
    if (angle > SWIPE_ANGLE_THRESHOLD && angle < 180 - SWIPE_ANGLE_THRESHOLD) {
      // Too vertical, cancel swipe
      isSwiping = false;
      swipeProgress = 0;
      return;
    }

    // Only track rightward swipes (positive deltaX)
    if (deltaX > 0) {
      swipeProgress = Math.min(deltaX / SWIPE_THRESHOLD, 1);
    }
  }

  async function handleTouchEnd() {
    if (!isSwiping) return;

    if (swipeProgress >= 1) {
      // Swipe completed - exit settings
      const previousModule = navigationState.previousModule || "dashboard";
      await handleModuleChange(previousModule as ModuleId);
    }

    // Reset state
    isSwiping = false;
    swipeProgress = 0;
  }

  function handleTouchCancel() {
    isSwiping = false;
    swipeProgress = 0;
  }

  // Handle back button tap - return to previous module
  async function handleBackToModule() {
    hapticService?.trigger("selection");
    const previousModuleId = navigationState.previousModule || "dashboard";
    await handleModuleChange(previousModuleId as ModuleId);
  }
</script>

<!-- Swipe zone wrapper for edge-swipe to exit -->
<div
  class="settings-module settings-swipe-zone"
  ontouchstart={handleTouchStart}
  ontouchmove={handleTouchMove}
  ontouchend={handleTouchEnd}
  ontouchcancel={handleTouchCancel}
>
  <!-- Back header - shown when using bottom navigation (no sidebar back button) -->
  {#if useBottomNavigation}
    <header class="back-header">
      <button
        type="button"
        class="back-header-button"
        onclick={handleBackToModule}
        aria-label="Go back"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="back-header-title">Settings</span>
    </header>
  {/if}

  <!-- Swipe indicator on left edge -->
  <div
    class="swipe-indicator"
    class:active={isSwiping}
    style="--swipe-progress: {swipeProgress}"
  >
    <div class="swipe-arrow">
      <i class="fas fa-chevron-right"></i>
    </div>
  </div>

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
        {:else if activeTab === "whats-new"}
          <WhatsNewTab />
        {:else if activeTab === "notifications"}
          <NotificationsTab />
        {:else if activeTab === "props"}
          <PropTypeTab {settings} onUpdate={handleSettingUpdate} />
        {:else if activeTab === "background"}
          <BackgroundTab {settings} onUpdate={handleSettingUpdate} />
        {:else if activeTab === "visibility"}
          <VisibilityTab
            currentSettings={settings}
            onSettingUpdate={handleSettingUpdate}
          />
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

  /* ============================================================================
     BACK HEADER - Shown when using bottom navigation layout
     ============================================================================ */
  .back-header {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(12, 14, 24, 0.9);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .back-header-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
    padding: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: all 0.15s ease;
  }

  .back-header-button:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .back-header-button:active {
    transform: scale(0.95);
  }

  .back-header-button i {
    font-size: 14px;
  }

  .back-header-title {
    font-size: 17px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .settings-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(8px, 2vw, 16px);
    min-height: 0;
    /* Container queries for responsive children */
    container-type: size;
    container-name: settings-content;
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

  /* ============================================================================
     SWIPE INDICATOR - Visual feedback for edge-swipe gesture
     ============================================================================ */
  .swipe-indicator {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    z-index: 10;
    opacity: 0;
    transform: translateX(-100%);
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .swipe-indicator.active {
    opacity: calc(var(--swipe-progress, 0) * 0.8 + 0.2);
    transform: translateX(calc(var(--swipe-progress, 0) * 100% - 100%));
  }

  .swipe-arrow {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .swipe-arrow i {
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    transform: translateX(calc(var(--swipe-progress, 0) * 2px));
    transition: transform 0.1s ease;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }

    .swipe-indicator,
    .swipe-arrow i {
      transition: none !important;
    }
  }
</style>
