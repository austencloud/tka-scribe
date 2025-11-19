<!--
  SettingsSheet.svelte - Modern slide-up settings panel

  Replaces the full-screen settings dialog with a modern bottom sheet.
  Maintains all existing settings logic and tab navigation.
-->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService, Drawer } from "$shared";
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

  // Service resolution
  let hapticService: IHapticFeedbackService | null = null;

  // Create a local editable copy of settings
  let settings = $state({ ...getSettings() });

  // Initialize activeTab from localStorage or default to "PropType"
  let activeTab = $state(loadActiveTab(VALID_TAB_IDS, "PropType"));

  // Track if a save is in progress (for visual feedback)
  let isSaving = $state(false);

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("All changes saved");

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Validate and potentially update the active tab
    activeTab = validateTab(activeTab, tabs, "PropType");
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
    isSaving = true;
    const settingsToApply = $state.snapshot(settings);
    console.log(
      "💾 Auto-saving settings:",
      JSON.stringify(settingsToApply, null, 2)
    );

    await updateSettings(settingsToApply);

    // Show success toast
    isSaving = false;
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

<Drawer
  {isOpen}
  labelledBy="settings-sheet-title"
  onclose={handleClose}
  class="settings-sheet"
  backdropClass="settings-sheet__backdrop"
  showHandle={true}
  closeOnBackdrop={true}
>
  <div class="settings-sheet__container">
    <!-- Header - iOS Style -->
    <header class="settings-sheet__header">
      <div class="header-spacer"></div>
      <h2 id="settings-sheet-title">Settings</h2>
      <button
        class="settings-sheet__done-btn"
        onclick={handleClose}
        aria-label="Done"
      >
        Done
      </button>
    </header>

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
</Drawer>

<style>
  /* Make the bottom sheet fill full viewport height */
  :global(.settings-sheet) {
    /* Subtract 1px to prevent sub-pixel rounding overflow */
    --sheet-max-height: calc(100vh - 1px) !important;
    max-height: calc(100vh - 1px) !important;
    height: calc(100vh - 1px) !important;
    box-sizing: border-box !important;
  }

  /* Desktop: Constrain width and center the panel */
  @media (min-width: 769px) {
    :global(.settings-sheet) {
      max-width: 800px !important;
      width: 100% !important;
      margin: 0 auto !important;
      height: calc(100vh - 80px) !important;
      max-height: calc(100vh - 80px) !important;
      border-radius: 12px !important;
      top: 40px !important;
    }
  }

  /* Backdrop styling - MUST be behind content */
  :global(.settings-sheet__backdrop) {
    z-index: 1099 !important;
    background: rgba(0, 0, 0, 0.6) !important;
    backdrop-filter: blur(8px) !important;
  }

  /* Sheet content - in front of backdrop */
  :global(.drawer-content.settings-sheet) {
    z-index: 1100 !important;
  }

  /* Disable overflow on drawer-inner to allow swipe-to-dismiss */
  :global(.drawer-content.settings-sheet .drawer-inner) {
    overflow-y: visible !important;
  }

  /* Container - Glass morphism design with high translucency */
  .settings-sheet__container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-height: 100%;
    /* Highly translucent glass morphism background */
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.45) 0%,
      rgba(10, 15, 25, 0.35) 100%
    );
    backdrop-filter: blur(32px) saturate(200%);
    -webkit-backdrop-filter: blur(32px) saturate(200%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-bottom: none; /* Bottom sheet doesn't need bottom border */
    box-shadow:
      0 -8px 32px rgba(0, 0, 0, 0.5),
      0 -2px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    /* iOS system font */
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    /* NO overflow: hidden here - let child elements handle scrolling */
  }

  /* Desktop: Add border-radius and adjust borders */
  @media (min-width: 769px) {
    .settings-sheet__container {
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      overflow: hidden; /* Clip content to rounded corners */
    }

    /* Hide drag handle on desktop */
    :global(.settings-sheet .drawer-handle) {
      display: none !important;
    }
  }

  /* Header - iOS Style - Pixel Perfect */
  .settings-sheet__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px; /* iOS exact navigation bar padding */
    border-bottom: 0.33px solid rgba(255, 255, 255, 0.16); /* iOS hairline */
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px) saturate(180%); /* iOS systemMaterial */
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    flex-shrink: 0;
  }

  /* Desktop: Rounded top corners for header */
  @media (min-width: 769px) {
    .settings-sheet__header {
      border-radius: 12px 12px 0 0;
    }
  }

  /* Header spacer for balance (matches Done button width) */
  .header-spacer {
    width: 44px;
  }

  .settings-sheet__header h2 {
    font-size: 17px; /* iOS standard modal title size */
    font-weight: 600; /* iOS semibold */
    line-height: 22px; /* iOS line-height: 1.29411 ratio */
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    letter-spacing: -0.41px; /* iOS tight tracking - exact spec */
    flex: 1;
    text-align: center;
    /* iOS vibrancy effect for text on translucent material */
    mix-blend-mode: plus-lighter;
    text-shadow:
      0 0 1px rgba(255, 255, 255, 0.15),
      0 1px 2px rgba(0, 0, 0, 0.1);
  }

  /* Done Button - iOS Style - Pixel Perfect */
  .settings-sheet__done-btn {
    padding: 0;
    border: none;
    background: transparent;
    color: #007aff; /* iOS system blue - exact hex */
    font-size: 17px; /* iOS body text size */
    font-weight: 600; /* iOS semibold */
    line-height: 22px; /* iOS line-height: 1.29411 ratio */
    letter-spacing: -0.41px; /* iOS tight tracking - exact spec */
    cursor: pointer;
    transition: opacity 0.2s ease;
    min-width: 44px; /* iOS minimum touch target */
    min-height: 44px; /* iOS minimum touch target */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .settings-sheet__done-btn:hover {
    opacity: 0.7;
  }

  .settings-sheet__done-btn:active {
    opacity: 0.4;
  }

  .settings-sheet__done-btn:focus-visible {
    outline: 3px solid #007aff; /* iOS 15+ thicker focus ring */
    outline-offset: 2px;
    border-radius: 6px;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.2); /* iOS glow effect */
    animation: ios-focus-pulse 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
  }

  @keyframes ios-focus-pulse {
    0% {
      opacity: 0;
      transform: scale(0.98);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
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
    .settings-sheet__container {
      height: 100%;
      max-height: 100%;
      /* iOS safe areas for notch/home indicator/keyboard */
      padding-bottom: max(
        env(safe-area-inset-bottom, 0px),
        env(keyboard-inset-height, 0px)
      );
    }

    .settings-sheet__body {
      flex-direction: column;
      /* Account for bottom tab bar height (49px) */
      padding-bottom: 0;
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
      /* Prevent content from hiding under tab bar */
      padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    }

    .settings-sheet__header {
      padding: 14px 16px;
      /* iOS safe area for notch/Dynamic Island */
      padding-top: calc(14px + env(safe-area-inset-top, 0px));
    }

    .settings-sheet__header h2 {
      font-size: 17px; /* Maintain iOS modal title size */
    }
  }

  @media (max-width: 480px) {
    .settings-sheet__container {
      height: 100%;
      max-height: 100%;
    }

    .settings-sheet__header {
      padding: 12px 16px;
      padding-top: calc(12px + env(safe-area-inset-top, 0px));
    }

    .settings-sheet__header h2 {
      font-size: 17px; /* iOS consistency */
    }

    .settings-sheet__content {
      padding: 12px 16px;
      padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
    }
  }

  /* Landscape orientation - Dynamic Island clearance */
  @media (orientation: landscape) and (max-width: 896px) {
    .settings-sheet__header {
      padding-left: max(16px, env(safe-area-inset-left, 0px));
      padding-right: max(16px, env(safe-area-inset-right, 0px));
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .settings-sheet__done-btn {
      transition: none;
    }

    .settings-sheet__content {
      animation: none;
    }
  }

  /* Light mode - iOS automatically handles via color-scheme */
  @media (prefers-color-scheme: light) {
    .settings-sheet__done-btn {
      color: #007aff; /* iOS system blue works in both modes */
    }
  }

  /* High contrast - Reduced blur for clarity while maintaining material feel */
  @media (prefers-contrast: high) {
    .settings-sheet__container {
      background: rgba(0, 0, 0, 0.96);
      /* iOS still uses reduced blur in high contrast, not none */
      backdrop-filter: blur(10px) saturate(150%);
      -webkit-backdrop-filter: blur(10px) saturate(150%);
      border: 2px solid rgba(255, 255, 255, 0.4);
    }

    .settings-sheet__header,
    .settings-sheet__sidebar--desktop,
    .settings-sheet__bottom-tabs {
      border-color: rgba(255, 255, 255, 0.3);
      /* Reduced blur for high contrast */
      backdrop-filter: blur(8px) saturate(150%);
      -webkit-backdrop-filter: blur(8px) saturate(150%);
      background: rgba(0, 0, 0, 0.6);
    }

    .settings-sheet__done-btn {
      color: #0a84ff; /* Higher contrast blue */
    }
  }
</style>
