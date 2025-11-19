<!--
  SettingsSheet.svelte - Modern settings panel

  Desktop: Side panel from left with swipe-to-dismiss
  Mobile: Bottom sheet with swipe-to-dismiss
  Maintains all existing settings logic and tab navigation.
  Panel starts after navigation sidebar and never covers it.
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import {
    getSettings,
    hideSettingsDialog,
    updateSettings,
  } from "../../application/state/app-state.svelte";
  import SidePanel from "../../foundation/ui/SidePanel.svelte";
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

  // Service resolution
  let hapticService: IHapticFeedbackService | null = null;

  // Device detection for panel mode
  let mode = $state<"mobile" | "desktop">("desktop");

  function updateMode() {
    mode = window.innerWidth < 769 ? "mobile" : "desktop";
  }

  // Create a local editable copy of settings
  let settings = $state({ ...getSettings() });

  // Initialize activeTab from localStorage or default to "PropType"
  let activeTab = $state(loadActiveTab(VALID_TAB_IDS, "PropType"));

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("All changes saved");

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Validate and potentially update the active tab
    activeTab = validateTab(activeTab, tabs, "PropType");

    // Initialize mode and add resize listener
    updateMode();
    window.addEventListener("resize", updateMode);

    return () => {
      window.removeEventListener("resize", updateMode);
    };
  });

  // Check if settings are loaded
  const isSettingsLoaded = $derived(
    () =>
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
    console.log("🔧 SettingsSheet handlePropUpdate called:", event);
    settings[event.key as keyof typeof settings] = event.value as never;

    // Instant save - apply changes immediately
    const settingsToApply = $state.snapshot(settings);
    console.log(
      "💾 Auto-saving settings:",
      JSON.stringify(settingsToApply, null, 2)
    );

    await updateSettings(settingsToApply);

    // Show success toast
    showToast = true;

    // Reset toast after it displays
    setTimeout(() => {
      showToast = false;
    }, 100);
  }

  // Handle close (no unsaved changes warning needed with instant save)
  function handleClose() {
    // iOS uses light impact for button taps (using "selection" pattern)
    hapticService?.trigger("selection");
    console.log("✅ Settings closed (all changes auto-saved)");
    hideSettingsDialog();

    // Close via route if route-based
    import("../../navigation/utils/sheet-router").then(({ closeSheet }) => {
      closeSheet();
    });
  }
</script>

<SidePanel {isOpen} onClose={handleClose} {mode} side="left" title="Settings" showPinButton={false}>
  <div class="settings-sheet__container">
    <!-- Main content area -->
    <div class="settings-sheet__body">
      <!-- Desktop Sidebar Navigation (left side) -->
      <aside class="settings-sheet__sidebar settings-sheet__sidebar--desktop">
        <SettingsSidebar {tabs} {activeTab} onTabSelect={switchTab} />
      </aside>

      <!-- Content Area -->
      <main class="settings-sheet__content">
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
    <div class="settings-sheet__bottom-tabs">
      <IOSTabBar {tabs} {activeTab} onTabSelect={switchTab} />
    </div>
  </div>

  <!-- Toast Notification -->
  <Toast show={showToast} message={toastMessage} />
</SidePanel>

<style>
  /* Override SidePanel positioning for settings */
  :global(.side-panel.desktop.left) {
    /* Start after the navigation sidebar (220px expanded, 64px collapsed) */
    left: 220px !important;
    width: 50vw !important;
    min-width: 480px !important;
    max-width: none !important;
  }

  /* Ensure animation works - don't override transition */
  :global(.side-panel.desktop.left:not(.pinned)) {
    transition:
      transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
      left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      width 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  /* When navigation is collapsed, adjust left position */
  :global(body:has(.desktop-navigation-sidebar.collapsed) .side-panel.desktop.left) {
    left: 64px !important;
  }

  /* Backdrop should also start after navigation on desktop only */
  @media (min-width: 769px) {
    :global(.backdrop:not(.mobile)) {
      /* Start after the navigation sidebar */
      left: 220px !important;
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    /* When navigation is collapsed, adjust backdrop */
    :global(body:has(.desktop-navigation-sidebar.collapsed) .backdrop:not(.mobile)) {
      left: 64px !important;
    }
  }

  /* On smaller desktops, still respect minimum */
  @media (max-width: 1200px) {
    :global(.side-panel.desktop.left) {
      width: 60vw !important;
      min-width: 400px !important;
    }
  }

  /* Container */
  .settings-sheet__container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    /* iOS system font */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  /* Body - sidebar + content */
  .settings-sheet__body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  /* Desktop Sidebar (hidden on mobile) */
  .settings-sheet__sidebar--desktop {
    flex-shrink: 0;
    width: clamp(180px, 12vw, 200px); /* Responsive width with reasonable max */
    max-width: 200px; /* Never exceed 200px */
    border-right: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    overflow-y: auto;
  }

  /* Mobile Bottom Tab Bar (hidden on desktop) */
  .settings-sheet__bottom-tabs {
    display: none; /* Hidden on desktop */
  }

  .settings-sheet__content {
    flex: 1;
    overflow-y: auto; /* Allow scrolling when needed */
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
  .settings-sheet__content::-webkit-scrollbar {
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
    .settings-sheet__content > :global(*) {
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
    .settings-sheet__body {
      flex-direction: column;
    }

    /* Hide desktop sidebar on mobile */
    .settings-sheet__sidebar--desktop {
      display: none;
    }

    /* Show iOS-native bottom tab bar on mobile */
    .settings-sheet__bottom-tabs {
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

    .settings-sheet__content {
      padding: 16px;
    }
  }

  @media (max-width: 480px) {
    .settings-sheet__content {
      padding: 12px 16px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .settings-sheet__content {
      animation: none;
    }
  }
</style>
