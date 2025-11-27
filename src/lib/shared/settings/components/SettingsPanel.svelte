<!--
  SettingsPanel.svelte - Modern settings panel

  Desktop: Side panel from left edge that covers navigation (focused modal experience)
  Mobile: Bottom panel with swipe-to-dismiss
  Maintains all existing settings logic and tab navigation.
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService, type IDeviceDetector, Drawer } from "$shared";
  import type { ISheetRouterService } from "$lib/shared/navigation/services/contracts";
  import { onMount } from "svelte";
  import {
    getSettings,
    hideSettingsDialog,
    updateSettings,
  } from "../../application/state/app-state.svelte";
  import SettingsSidebar from "./SettingsSidebar.svelte";
  import IOSTabBar from "./IOSTabBar.svelte";
  import IOSSkeletonLoader from "./IOSSkeletonLoader.svelte";
  import AccessibilityTab from "./tabs/AccessibilityTab.svelte";
  import BackgroundTab from "./tabs/background/BackgroundTab.svelte";
  import PropTypeTab from "./tabs/PropTypeTab.svelte";
  import VisibilityTab from "./tabs/VisibilityTab.svelte";
  import ProfileTab from "./tabs/ProfileTab.svelte";
  import Toast from "./Toast.svelte";
  import {
    loadActiveTab,
    validateActiveTab as validateTab,
    saveActiveTab,
  } from "../utils/tab-persistence.svelte";

  // Valid tab IDs for validation
  const VALID_TAB_IDS = [
    "Profile",
    "PropType",
    "Background",
    "Visibility",
    "Accessibility",
  ];

  // Props
  let { isOpen = false } = $props<{ isOpen?: boolean }>();

  // Debug: Watch isOpen changes
  $effect(() => {
    console.log("[SettingsPanel] isOpen changed:", isOpen);
  });

  // Service resolution
  let hapticService: IHapticFeedbackService | null = null;
  let deviceDetector: IDeviceDetector | null = null;
  let sheetRouterService: ISheetRouterService | null = null;

  // Dynamic placement detection based on navigation layout
  let placement: "bottom" | "left" = $state("left");

  // Reactive settings - derives from getSettings() to maintain reactivity
  let settings = $derived(getSettings());

  // Initialize activeTab from localStorage or default to "PropType"
  let activeTab = $state(loadActiveTab(VALID_TAB_IDS, "PropType"));

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("All changes saved");

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
    try {
      sheetRouterService = resolve<ISheetRouterService>(TYPES.ISheetRouterService);
    } catch {
      // Service not available
    }

    // Validate and potentially update the active tab
    activeTab = validateTab(activeTab, tabs, "PropType");

    // Initialize placement based on device
    if (deviceDetector) {
      updatePlacement();

      // Listen for device changes (e.g., rotation, resize)
      return deviceDetector.onCapabilitiesChanged(() => {
        updatePlacement();
      });
    }

    return undefined;
  });

  function updatePlacement() {
    if (!deviceDetector) return;

    const navigationLayout = deviceDetector.getNavigationLayoutImmediate();
    // Bottom navigation = bottom drawer
    // Top/Left navigation = left drawer
    placement = navigationLayout === "bottom" ? "bottom" : "left";
  }

  // Check if settings are loaded
  const isSettingsLoaded = $derived(
    settings &&
    typeof settings === "object" &&
    Object.keys(settings).length > 0
  );

  // Simplified tab configuration
  const tabs = [
    { id: "Profile", label: "Profile", icon: '<i class="fas fa-user"></i>' },
    { id: "PropType", label: "Prop Type", icon: '<i class="fas fa-tag"></i>' },
    {
      id: "Background",
      label: "Background",
      icon: '<i class="fas fa-star"></i>',
    },
    {
      id: "Visibility",
      label: "Visibility",
      icon: '<i class="fas fa-eye"></i>',
    },
    {
      id: "Accessibility",
      label: "Miscellaneous",
      icon: '<i class="fas fa-cog"></i>',
    },
  ];

  // Handle tab switching
  function switchTab(tabId: string) {
    // iOS uses light impact for tab changes (using "selection" pattern)
    hapticService?.trigger("selection");
    activeTab = tabId;
    saveActiveTab(tabId);
  }

  // Adapter for modern prop-based updates with instant save
  async function handlePropUpdate(event: { key: string; value: unknown }) {
    console.log("🔧 SettingsPanel handlePropUpdate called:", event);

    // Create updated settings object with the change
    const updatedSettings = { ...settings, [event.key]: event.value };
    console.log(
      "💾 Auto-saving settings:",
      JSON.stringify(updatedSettings, null, 2)
    );

    // Apply changes immediately - this will trigger reactivity
    await updateSettings(updatedSettings);

    // Show success toast
    showToast = true;

    // Reset toast after it displays
    setTimeout(() => {
      showToast = false;
    }, 100);
  }

  // Handle close (no unsaved changes warning needed with instant save)
  function handleClose(event?: CustomEvent<{ reason: "backdrop" | "escape" | "programmatic" }>) {
    // iOS uses light impact for button taps (using "selection" pattern)
    hapticService?.trigger("selection");
    console.log("✅ [SettingsPanel] handleClose called", event?.detail?.reason);

    hideSettingsDialog();
    console.log("✅ [SettingsPanel] hideSettingsDialog() called");

    // Close via route if route-based
    sheetRouterService?.closeSheet();
    console.log("✅ [SettingsPanel] closeSheet() called");
  }
</script>

<Drawer
  {isOpen}
  {placement}
  closeOnBackdrop={true}
  closeOnEscape={true}
  dismissible={true}
  showHandle={true}
  ariaLabel="Settings"
  role="dialog"
  class="settings-drawer"
  onOpenChange={(open) => {
    if (!open) {
      handleClose();
    }
  }}
>
  <div class="settings-panel__container">
    <!-- Main content area -->
    <div class="settings-panel__body">
      <!-- Desktop Sidebar Navigation (left side) -->
      <aside class="settings-panel__sidebar settings-panel__sidebar--desktop">
        <SettingsSidebar {tabs} {activeTab} onTabSelect={switchTab} />
      </aside>

      <!-- Content Area -->
      <main class="settings-panel__content">
        {#if !isSettingsLoaded}
          <div class="loading-state">
            <IOSSkeletonLoader variant="toggle" count={5} />
          </div>
        {:else if activeTab === "Profile"}
          <ProfileTab
            currentSettings={settings}
            onSettingUpdate={handlePropUpdate}
          />
        {:else if activeTab === "PropType"}
          <PropTypeTab {settings} onUpdate={handlePropUpdate} />
        {:else if activeTab === "Background"}
          <BackgroundTab {settings} onUpdate={handlePropUpdate} />
        {:else if activeTab === "Visibility"}
          <VisibilityTab
            currentSettings={settings}
            onSettingUpdate={handlePropUpdate}
          />
        {:else if activeTab === "Accessibility"}
          <AccessibilityTab
            currentSettings={settings}
            onSettingUpdate={handlePropUpdate}
          />
        {/if}
      </main>
    </div>

    <!-- Mobile Bottom Tab Bar (iOS Native) -->
    <div class="settings-panel__bottom-tabs">
      <IOSTabBar {tabs} {activeTab} onTabSelect={switchTab} />
    </div>
  </div>

  <!-- Toast Notification -->
  <Toast show={showToast} message={toastMessage} />
</Drawer>

<style>
  /* Drawer positioning for settings panel */
  :global(.settings-drawer[data-placement="left"]) {
    /* Cover navigation from the left edge */
    width: 90vw;
    min-width: 40vw;
    max-width: none;
  }

  /* On smaller desktops, adjust drawer width */
  @media (max-width: 1200px) {
    :global(.settings-drawer[data-placement="left"]) {
      width: 60vw;
      min-width: 400px;
    }
  }

  /* Mobile bottom drawer */
  :global(.settings-drawer[data-placement="bottom"]) {
    max-height: 90vh;
  }

  /* Container */
  .settings-panel__container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    /* iOS system font */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Body - sidebar + content */
  .settings-panel__body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  /* Desktop Sidebar (hidden on mobile) */
  .settings-panel__sidebar--desktop {
    flex-shrink: 0;
    width: clamp(180px, 12vw, 200px); /* Responsive width with reasonable max */
    max-width: 200px; /* Never exceed 200px */
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Mobile Bottom Tab Bar (hidden on desktop) */
  .settings-panel__bottom-tabs {
    display: none; /* Hidden on desktop */
  }

  .settings-panel__content {
    flex: 1;
    overflow-y: auto; /* Allow scrolling when needed */
    overflow-x: hidden; /* Prevent horizontal scroll */
    padding: clamp(16px, 2vw, 24px); /* Less aggressive padding */
    background: rgba(0, 0, 0, 0.03);
    /* iOS spring animation - exact curve */
    animation: ios-spring-in 0.5s cubic-bezier(0.36, 0.66, 0.04, 1);
    /* Hide scrollbar completely - only show when actually scrolling */
    scrollbar-width: none;
    -ms-overflow-style: none;
    /* Display as flex for child layout */
    display: flex;
    flex-direction: column;
  }

  /* Hide scrollbar on WebKit browsers */
  .settings-panel__content::-webkit-scrollbar {
    display: none;
    width: 0;
  }

  /* iOS Spring Animation */
  @keyframes ios-spring-in {
    0% {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    50% {
      opacity: 0.8;
      transform: translateY(-2px) scale(1.01);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Loading state */
  .loading-state {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
    animation: ios-fade-in 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
    width: 100%;
    max-width: 1200px; /* Constrain width on large screens */
  }

  /* Desktop: Let content use available space, constrain only on huge screens */
  @media (min-width: 1800px) {
    .settings-panel__content > :global(*) {
      width: 100%;
      max-width: 1400px; /* Only constrain on very wide screens */
    }
  }

  @keyframes ios-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Mobile Responsive - iOS Bottom Tab Bar Pattern */
  @media (max-width: 768px) {
    .settings-panel__body {
      flex-direction: column;
    }

    /* Hide desktop sidebar on mobile */
    .settings-panel__sidebar--desktop {
      display: none;
    }

    /* Show iOS-native bottom tab bar on mobile */
    .settings-panel__bottom-tabs {
      display: block;
      position: sticky;
      bottom: 0;
      left: 0;
      right: 0;
      /* iOS safe area padding for home indicator */
      padding-bottom: env(safe-area-inset-bottom, 0px);
      flex-shrink: 0;
      z-index: 10;
    }

    .settings-panel__content {
      padding: 16px;
    }
  }

  @media (max-width: 480px) {
    .settings-panel__content {
      padding: 12px 16px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .settings-panel__content {
      animation: none;
    }
  }
</style>
