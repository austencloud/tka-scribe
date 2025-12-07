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
  import { resolve } from "../../inversify/di";
  import { TYPES } from "../../inversify/types";
  import type { ISheetRouterService } from "$lib/shared/navigation/services/contracts/ISheetRouterService";
  import { onMount } from "svelte";
  import {
    getSettings,
    updateSettings,
  } from "../../application/state/app-state.svelte";
  import { hideSettingsDialog } from "../../application/state/ui/ui-state.svelte";
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
  import { areServicesInitialized } from "../../application/state/services.svelte";

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
        sheetRouterService = await resolve<ISheetRouterService>(
          TYPES.ISheetRouterService
        );
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

    // Cleanup function (synchronous)
    return () => {
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

  // Check if settings are loaded AND services are initialized
  const isSettingsLoaded = $derived(
    settings &&
      typeof settings === "object" &&
      Object.keys(settings).length > 0 &&
      areServicesInitialized()
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
  // Accept any event type (CustomEvent from Drawer, MouseEvent from button)
  function handleClose() {
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
  backdropClass="settings-backdrop"
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
    <!-- Close button - always visible -->
    <button
      class="settings-panel__close"
      onclick={handleClose}
      aria-label="Close settings"
    >
      <i class="fas fa-times"></i>
    </button>

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
              <h2>
                {tabs.find((t) => t.id === activeTab)?.label || "Settings"}
              </h2>
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
  /* Close button - positioned top right */
  .settings-panel__close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 18px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .settings-panel__close:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }

  .settings-panel__close:active {
    transform: scale(0.95);
    transition-duration: 50ms;
  }

  .settings-panel__close:focus-visible {
    outline: 2px solid var(--settings-primary-indigo, #6366f1);
    outline-offset: 2px;
  }

  /* Drawer positioning for settings panel - responsive */
  :global(.settings-drawer[data-placement="left"]) {
    width: clamp(280px, 25vw, 400px);
    container-type: inline-size;
    container-name: settings-panel;
  }

  /* Mobile bottom drawer - fit content */
  :global(.settings-drawer[data-placement="bottom"]) {
    height: auto;
    max-height: 85vh;
    container-type: size;
    container-name: settings-panel;
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

  /* Detail View Header - Clear navigation bar */
  .detail-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .detail-header__back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.95);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
    flex-shrink: 0;
  }

  .detail-header__back:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateX(-2px);
  }

  .detail-header__back:active {
    transform: translateX(-1px) scale(0.95);
  }

  .detail-header__back:focus-visible {
    outline: 2px solid var(--settings-primary-indigo, #6366f1);
    outline-offset: 2px;
  }

  .detail-header__back i {
    font-size: 16px;
  }

  .detail-header__title {
    flex: 1;
    text-align: center;
  }

  .detail-header__title h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.01em;
    font-family:
      -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif;
  }

  .detail-header__spacer {
    width: 52px; /* Match back button width for centered title */
    flex-shrink: 0;
  }

  .settings-panel__content {
    flex: 1;
    overflow-y: auto; /* Allow scrolling when needed */
    overflow-x: hidden; /* Prevent horizontal scroll */
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
    min-height: 0;
  }

  /* Galaxy content - remove padding, ensure full height for container queries */
  .settings-panel__content--galaxy {
    padding: 0;
    background: transparent;
    overflow: hidden;
  }

  /* Detail content wrapper - contains the scrollable content */
  .settings-panel__content--detail {
    padding: 0;
  }

  .detail-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: clamp(16px, 2vw, 24px);
    /* Hide scrollbar */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .detail-content::-webkit-scrollbar {
    display: none;
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

    /* Mobile header adjustments */
    .detail-header {
      padding: 14px 16px;
    }

    .detail-header__back {
      width: 52px;
      height: 52px;
      min-width: 52px;
      min-height: 52px;
    }

    .detail-header__spacer {
      width: 52px;
    }

    .detail-header__title h2 {
      font-size: 17px;
    }

    /* Detail content on mobile */
    .detail-content {
      padding: 16px;
    }

    /* Galaxy content on mobile */
    .settings-panel__content--galaxy {
      padding: 0;
    }
  }

  @media (max-width: 480px) {
    .detail-header {
      padding: 12px 14px;
    }

    .detail-header__back {
      width: 52px;
      height: 52px;
      min-width: 52px;
      min-height: 52px;
    }

    .detail-header__back i {
      font-size: 15px;
    }

    .detail-header__spacer {
      width: 52px;
    }

    .detail-header__title h2 {
      font-size: 16px;
    }

    .detail-content {
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
