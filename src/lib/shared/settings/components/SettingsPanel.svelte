<!--
  SettingsPanel.svelte - Modern settings panel

  Desktop: Side panel from left edge that covers navigation (focused modal experience)
  Mobile: Bottom panel with swipe-to-dismiss
  Maintains all existing settings logic and tab navigation.
-->
<script lang="ts">
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import type { IDeviceDetector } from "../../device/services/contracts/IDeviceDetector";
  import Drawer from "../../foundation/ui/Drawer.svelte";
  import { resolve } from "../../inversify";
  import { TYPES } from "../../inversify/types";
  import type { ISheetRouterService } from "$lib/shared/navigation/services/contracts";
  import { onMount } from "svelte";
  import {
    getSettings,
    hideSettingsDialog,
    updateSettings,
  } from "../../application/state/app-state.svelte";
  import SettingsSidebar from "./SettingsSidebar.svelte";
  import IOSSkeletonLoader from "./IOSSkeletonLoader.svelte";
  import SettingsTabContent from "./SettingsTabContent.svelte";
  import Toast from "./Toast.svelte";
  import SettingsGalaxyView from "./galaxy/SettingsGalaxyView.svelte";
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
  let deviceDetector: IDeviceDetector | null = null;
  let sheetRouterService: ISheetRouterService | null = null;

  // Dynamic placement detection based on navigation layout
  let placement: "bottom" | "left" = $state("left");

  // Reactive settings - derives from getSettings() to maintain reactivity
  let settings = $derived(getSettings());

  // Galaxy navigation state - always start with galaxy view
  let showGalaxy = $state(true);
  let activeDetailView = $state<string | null>(null);

  // Initialize activeTab from localStorage or default to "PropType"
  // This is only used when in detail view
  let activeTab = $state(loadActiveTab(VALID_TAB_IDS, "PropType"));

  // Toast notification state
  let showToast = $state(false);
  let toastMessage = $state("All changes saved");

  // Store cleanup function for device detector listener
  let deviceDetectorCleanup: (() => void) | null = null;

  onMount(() => {
    // Async initialization
    (async () => {
      hapticService = await resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
      deviceDetector = await resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      try {
        sheetRouterService = await resolve<ISheetRouterService>(TYPES.ISheetRouterService);
      } catch {
        // Service not available
      }

      // Validate and potentially update the active tab
      activeTab = validateTab(activeTab, tabs, "PropType");

      // Initialize placement based on device and listen for changes
      if (deviceDetector) {
        updatePlacement();
        // Subscribe to capability changes for reactive placement updates
        deviceDetectorCleanup = deviceDetector.onCapabilitiesChanged(() => {
          updatePlacement();
        });
      }
    })();

    // Add global keyboard listener for Escape key
    window.addEventListener("keydown", handleKeydown);

    // Cleanup function (synchronous)
    return () => {
      window.removeEventListener("keydown", handleKeydown);
      // Cleanup device detector listener
      if (deviceDetectorCleanup) {
        deviceDetectorCleanup();
      }
    };
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

  // Tab configuration - icons match galaxy view for consistency
  const tabs = [
    { id: "Profile", label: "Profile", icon: '<i class="fas fa-user"></i>' },
    { id: "PropType", label: "Prop Type", icon: '<i class="fas fa-tags"></i>' },
    {
      id: "Background",
      label: "Background",
      icon: '<i class="fas fa-image"></i>',
    },
    {
      id: "Visibility",
      label: "Visibility",
      icon: '<i class="fas fa-eye"></i>',
    },
    {
      id: "Accessibility",
      label: "Miscellaneous",
      icon: '<i class="fas fa-sliders-h"></i>',
    },
  ];

  // Handle category selection from galaxy view
  function handleCategorySelect(categoryId: string) {
    hapticService?.trigger("selection");
    activeTab = categoryId;
    activeDetailView = categoryId;
    showGalaxy = false;
    // Don't save to localStorage yet - only save when user actively switches tabs in detail view
  }

  // Handle tab switching within detail view
  function switchTab(tabId: string) {
    // iOS uses light impact for tab changes (using "selection" pattern)
    hapticService?.trigger("selection");
    activeTab = tabId;
    activeDetailView = tabId;
    // Only save when user switches tabs within detail view
    saveActiveTab(tabId);
  }

  // Handle back to galaxy
  function handleBackToGalaxy() {
    hapticService?.trigger("selection");
    showGalaxy = true;
    activeDetailView = null;
    // Don't clear activeTab - preserve it in case user returns to same category
  }

  // Handle keyboard navigation
  function handleKeydown(event: KeyboardEvent) {
    // Only handle if settings panel is open
    if (!isOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      if (!showGalaxy) {
        // In detail view: go back to galaxy
        handleBackToGalaxy();
      } else {
        // In galaxy view: close the entire settings panel
        handleClose();
      }
    }
  }

  // Adapter for modern prop-based updates with instant save
  async function handlePropUpdate(event: { key: string; value: unknown }) {
    // Create updated settings object with the change
    const updatedSettings = { ...settings, [event.key]: event.value };

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

    hideSettingsDialog();

    // Close via route if route-based
    sheetRouterService?.closeSheet();
  }
</script>

<Drawer
  {isOpen}
  {placement}
  closeOnBackdrop={true}
  closeOnEscape={false}
  dismissible={true}
  showHandle={true}
  ariaLabel="Settings"
  role="dialog"
  class="settings-drawer"
  onOpenChange={(open: boolean) => {
    if (!open) {
      handleClose();
    } else {
      // Reset to galaxy view when opening
      showGalaxy = true;
      activeDetailView = null;
    }
  }}
>
  <div class="settings-panel__container">
    <!-- Main content area -->
    <div class="settings-panel__body">
      {#if showGalaxy}
        <!-- Galaxy View: Card-based navigation -->
        <main class="settings-panel__content settings-panel__content--galaxy">
          {#if !isSettingsLoaded}
            <div class="loading-state">
              <IOSSkeletonLoader variant="toggle" count={5} />
            </div>
          {:else}
            <SettingsGalaxyView
              {settings}
              onCategorySelect={handleCategorySelect}
            />
          {/if}
        </main>
      {:else}
        <!-- Detail View: Tab content with sidebar navigation -->

        <!-- Desktop Layout: Sidebar + Content -->
        <aside class="settings-panel__sidebar settings-panel__sidebar--desktop">
          <SettingsSidebar {tabs} {activeTab} onTabSelect={switchTab} />
        </aside>

        <!-- Content Area (with header for both mobile and desktop) -->
        <main class="settings-panel__content settings-panel__content--detail">
          <!-- Detail View Header -->
          <header class="detail-header">
            <button
              class="detail-header__back"
              onclick={handleBackToGalaxy}
              aria-label="Back to settings overview"
            >
              <i class="fas fa-arrow-left"></i>
            </button>
            <div class="detail-header__title">
              <h2>{tabs.find((t) => t.id === activeTab)?.label || "Settings"}</h2>
            </div>
            <div class="detail-header__spacer"></div>
          </header>

          <!-- Tab Content -->
          <div class="detail-content">
            {#if !isSettingsLoaded}
              <div class="loading-state">
                <IOSSkeletonLoader variant="toggle" count={5} />
              </div>
            {:else}
              <SettingsTabContent
                {activeTab}
                {settings}
                onSettingUpdate={handlePropUpdate}
              />
            {/if}
          </div>
        </main>
      {/if}
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

  /* Mobile bottom drawer - full viewport height */
  :global(.settings-drawer[data-placement="bottom"]) {
    height: 100vh;
    max-height: 100vh;
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

  /* Back to Galaxy Button (Desktop Sidebar) */
  .back-to-galaxy-button {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 12px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .back-to-galaxy-button:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .back-to-galaxy-button:focus-visible {
    outline: 2px solid var(--settings-primary-indigo, #6366f1);
    outline-offset: 2px;
  }

  .back-to-galaxy-button i {
    font-size: 14px;
  }

  /* Mobile Back Button */
  .settings-panel__mobile-back {
    display: none; /* Hidden on desktop */
  }

  .mobile-back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 14px 20px;
    background: rgba(255, 255, 255, 0.08);
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.95);
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .mobile-back-button:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .mobile-back-button:focus-visible {
    outline: 2px solid var(--settings-primary-indigo, #6366f1);
    outline-offset: -2px;
  }

  .mobile-back-button i {
    font-size: 16px;
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
    /* Container queries - allow children to query available width AND height */
    container-type: size;
    container-name: settings-content;
  }

  /* Galaxy content - remove padding, ensure full height for container queries */
  .settings-panel__content--galaxy {
    padding: 0;
    background: transparent;
    /* Ensure children can use full height */
    min-height: 0;
    overflow: hidden;
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
      /* Ensure proper order: back button, content */
    }

    /* Hide desktop sidebar on mobile */
    .settings-panel__sidebar--desktop {
      display: none;
    }

    /* Show mobile back button on mobile when in detail view */
    .settings-panel__mobile-back {
      display: block;
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      flex-shrink: 0;
      z-index: 10;
      order: -1; /* Force to top of flex container */
    }

    /* Content comes after back button */
    .settings-panel__content {
      padding: 16px;
      order: 0;
    }

    /* Galaxy content on mobile */
    .settings-panel__content--galaxy {
      padding: 0;
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
