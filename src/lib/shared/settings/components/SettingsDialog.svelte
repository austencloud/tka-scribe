<!-- SettingsDialog.svelte - Simplified main settings dialog -->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, scale } from "svelte/transition";
  import {
    getSettings,
    hideSettingsDialog,
    updateSettings,
  } from "../../application/state/app-state.svelte";
  import SettingsSidebar from "./SettingsSidebar.svelte";
  import AccessibilityTab from "./tabs/AccessibilityTab.svelte";
  import BackgroundTab from "./tabs/background/BackgroundTab.svelte";
  import PropTypeTab from "./tabs/PropTypeTab.svelte";

  // Constants
  const SETTINGS_TAB_STORAGE_KEY = "tka_settings_active_tab";

  // Valid tab IDs for validation
  const VALID_TAB_IDS = ["PropType", "Background", "Accessibility"];

  // Service resolution
  let hapticService: IHapticFeedbackService | null = null;

  // Current settings state with null safety
  // Create a local editable copy of settings
  let settings = $state({ ...getSettings() });

  // Initialize activeTab from localStorage or default to "PropType"
  let activeTab = $state(loadActiveTabSync());

  // Track if settings have been modified
  let hasUnsavedChanges = $state(false);
  let dialogElement: HTMLElement | null = $state(null);
  let firstFocusableElement: HTMLElement | null = null;
  let lastFocusableElement: HTMLElement | null = null;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Validate and potentially update the active tab
    validateActiveTab();

    // Set up focus trap
    setupFocusTrap();

    // Add keyboard event listeners
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  /**
   * Set up focus trap for accessibility
   */
  function setupFocusTrap() {
    if (!dialogElement) return;

    const focusableElements = dialogElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length > 0) {
      firstFocusableElement = focusableElements[0] as HTMLElement;
      lastFocusableElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      // Focus first element
      firstFocusableElement?.focus();
    }
  }

  /**
   * Handle keyboard events for accessibility
   */
  function handleKeyDown(event: KeyboardEvent) {
    // Escape key closes dialog
    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
      return;
    }

    // Tab key for focus trap
    if (event.key === "Tab") {
      if (event.shiftKey) {
        // Shift+Tab - moving backwards
        if (document.activeElement === firstFocusableElement) {
          event.preventDefault();
          lastFocusableElement?.focus();
        }
      } else {
        // Tab - moving forwards
        if (document.activeElement === lastFocusableElement) {
          event.preventDefault();
          firstFocusableElement?.focus();
        }
      }
    }
  }

  /**
   * Load the last active tab from localStorage (synchronous for initialization)
   */
  function loadActiveTabSync(): string {
    if (typeof localStorage === "undefined") return "PropType";

    try {
      const savedTab = localStorage.getItem(SETTINGS_TAB_STORAGE_KEY);
      // Simple validation against known tab IDs
      if (savedTab && VALID_TAB_IDS.includes(savedTab)) {
        console.log("📂 Loaded saved settings tab:", savedTab);
        return savedTab;
      }
    } catch (error) {
      console.warn("Failed to load settings tab from localStorage:", error);
    }

    return "PropType"; // Default fallback
  }

  /**
   * Validate the active tab (called in onMount after tabs array is available)
   */
  function validateActiveTab() {
    try {
      const savedTab = localStorage.getItem(SETTINGS_TAB_STORAGE_KEY);
      if (savedTab && tabs.some((tab) => tab.id === savedTab)) {
        if (activeTab !== savedTab) {
          console.log("📂 Restored settings tab from localStorage:", savedTab);
          activeTab = savedTab;
        }
      } else if (activeTab && !tabs.some((tab) => tab.id === activeTab)) {
        // Current activeTab is invalid, reset to default
        console.log("⚠️ Invalid tab detected, resetting to default");
        activeTab = "PropType";
        saveActiveTab("PropType");
      }
    } catch (error) {
      console.warn("Failed to validate settings tab:", error);
    }
  }

  /**
   * Save the active tab to localStorage
   */
  function saveActiveTab(tabId: string) {
    try {
      localStorage.setItem(SETTINGS_TAB_STORAGE_KEY, tabId);
      console.log("💾 Saved settings tab to localStorage:", tabId);
    } catch (error) {
      console.warn("Failed to save settings tab to localStorage:", error);
    }
  }

  // Check if settings are loaded
  const isSettingsLoaded = $derived(
    () =>
      settings &&
      typeof settings === "object" &&
      Object.keys(settings).length > 0
  );

  // Simplified tab configuration
  const tabs = [
    { id: "PropType", label: "Prop Type", icon: '<i class="fas fa-tag"></i>' },
    {
      id: "Background",
      label: "Background",
      icon: '<i class="fas fa-star"></i>',
    },
    {
      id: "Accessibility",
      label: "Experience",
      icon: '<i class="fas fa-universal-access"></i>',
    },
  ];

  // Handle tab switching
  function switchTab(tabId: string) {
    hapticService?.trigger("navigation");
    activeTab = tabId;
    // Persist the active tab choice
    saveActiveTab(tabId);
  }

  // Adapter for modern prop-based updates
  function handlePropUpdate(event: { key: string; value: unknown }) {
    console.log("🔧 SettingsDialog handlePropUpdate called:", event);
    console.log("🔧 Previous value:", settings[event.key as keyof typeof settings]);

    // Update settings reactively by assigning the changed property
    settings[event.key as keyof typeof settings] = event.value as never;

    console.log("🔧 New value:", settings[event.key as keyof typeof settings]);
    console.log("🔧 Full settings now:", JSON.stringify(settings, null, 2));

    // Mark as having unsaved changes
    hasUnsavedChanges = true;
  }

  // Handle apply/save
  async function handleApply() {
    hapticService?.trigger("success");
    console.log("✅ Apply button clicked");

    // CRITICAL FIX: Use $state.snapshot() to get actual current values from the Svelte 5 proxy
    // Without this, the proxy returns stale values causing wrong backgrounds to be applied!
    const settingsToApply = $state.snapshot(settings);

    console.log("✅ Settings snapshot to be applied:", JSON.stringify(settingsToApply, null, 2));
    console.log("✅ Background type in snapshot:", settingsToApply.backgroundType);

    // Explicitly update settings via the settings service to ensure all side effects run
    await updateSettings(settingsToApply);

    hasUnsavedChanges = false;
    hideSettingsDialog();
  }

  // Handle close/cancel with unsaved changes warning
  function handleClose() {
    if (hasUnsavedChanges) {
      const confirmClose = confirm(
        "You have unsaved changes. Are you sure you want to close without saving?"
      );
      if (!confirmClose) {
        return;
      }
    }

    hapticService?.trigger("selection");
    console.log("❌ Settings cancelled");
    hasUnsavedChanges = false;
    hideSettingsDialog();
  }

  // Handle outside click to close
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  // Handle keyboard events for backdrop
  function handleBackdropKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      handleClose();
    }
  }
</script>

<!-- Settings Dialog Overlay -->
<div
  class="settings-overlay"
  onclick={handleBackdropClick}
  onkeydown={handleBackdropKeyDown}
  role="dialog"
  aria-modal="true"
  aria-labelledby="settings-title"
  tabindex="-1"
  in:fade={{ duration: 200, easing: quintOut }}
  out:fade={{ duration: 200, easing: quintOut }}
>
  <div
    class="settings-dialog"
    bind:this={dialogElement}
    in:scale={{
      duration: 250,
      start: 0.95,
      opacity: 0,
      easing: quintOut,
    }}
    out:scale={{
      duration: 200,
      start: 0.95,
      opacity: 0,
      easing: quintOut,
    }}
  >
    <!-- Dialog Header -->
    <div
      class="dialog-header"
      in:fade={{ duration: 200, delay: 100, easing: quintOut }}
      out:fade={{ duration: 150, easing: quintOut }}
    >
      <h2 id="settings-title">Settings</h2>
      <button
        class="close-button"
        onclick={handleClose}
        aria-label="Close settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M18 6L6 18M6 6l12 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>

    <!-- Dialog Content -->
    <div
      class="dialog-content"
      in:fade={{ duration: 200, delay: 150, easing: quintOut }}
      out:fade={{ duration: 150, easing: quintOut }}
    >
      <!-- Sidebar Navigation -->
      <div
        in:fade={{ duration: 200, delay: 200, easing: quintOut }}
        out:fade={{ duration: 150, easing: quintOut }}
      >
        <SettingsSidebar {tabs} {activeTab} onTabSelect={switchTab} />
      </div>

      <!-- Content Area -->
      <main
        class="settings-content"
        in:fade={{ duration: 200, delay: 250, easing: quintOut }}
        out:fade={{ duration: 150, easing: quintOut }}
      >
        {#if !isSettingsLoaded}
          <div class="loading-state">
            <p>Loading settings...</p>
          </div>
        {:else if activeTab === "PropType"}
          <PropTypeTab {settings} onUpdate={handlePropUpdate} />
        {:else if activeTab === "Background"}
          <BackgroundTab {settings} onUpdate={handlePropUpdate} />
        {:else if activeTab === "Accessibility"}
          <AccessibilityTab
            currentSettings={settings}
            onSettingUpdate={handlePropUpdate}
          />
        {/if}
      </main>
    </div>

    <!-- Dialog Footer -->
    <div
      class="dialog-footer"
      in:fade={{ duration: 200, delay: 300, easing: quintOut }}
      out:fade={{ duration: 150, easing: quintOut }}
    >
      <button class="cancel-button" onclick={handleClose}>Cancel</button>
      <button
        class="apply-button"
        class:has-changes={hasUnsavedChanges}
        onclick={handleApply}
      >
        {#if hasUnsavedChanges}
          <span class="changes-indicator">●</span>
        {/if}
        Apply Settings
      </button>
    </div>
  </div>
</div>

<style>
  .settings-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-lg);

    /* Enhanced glassmorphism effect */
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.85) 100%
    );
  }

  .settings-dialog {
    /* Dynamic viewport sizing with mobile-first approach */
    width: min(var(--dialog-width, 90vw), var(--dialog-max-width, 1400px));
    height: min(var(--dialog-height, 90vh), var(--dialog-max-height, 900px));

    /* Mobile-specific height calculation to account for browser chrome */
    min-height: var(--dialog-min-height, 300px);
    max-height: calc(100vh - var(--viewport-offset, 40px));

    background: rgba(20, 25, 35, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--dialog-radius, 24px);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    box-shadow:
      0 32px 64px rgba(0, 0, 0, 0.4),
      0 16px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    container-type: inline-size;

    /* Enhanced glassmorphism */
    background: linear-gradient(
      135deg,
      rgba(20, 25, 35, 0.98) 0%,
      rgba(15, 20, 30, 0.95) 100%
    );

    /* Subtle glow effect */
    position: relative;
  }

  .settings-dialog::before {
    content: "";
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.1) 100%
    );
    border-radius: 26px;
    z-index: -1;
    opacity: 0.6;
  }

  .settings-dialog {
    /* CSS Custom Properties for responsive sizing */
    --dialog-width: min(
      95vw,
      1400px
    ); /* Increased from 90vw to 95vw for better space utilization on small screens */
    --dialog-height: min(90vh, 900px);
    --sidebar-width: clamp(
      180px,
      15vw,
      250px
    ); /* Increased min from 150px to 180px to match sidebar */
    --content-width: calc(var(--dialog-width) - var(--sidebar-width));
    --content-padding: clamp(
      20px,
      2.5vw,
      36px
    ); /* Adjusted for better balance: 20-36px instead of 16-32px */
    --responsive-columns: 1;
    --max-content-width: none;
  }

  /* Dialog Header */
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: clamp(16px, 2vw, 32px);
    border-bottom: var(--glass-border);
    background: rgba(255, 255, 255, 0.03);
  }

  .dialog-header h2 {
    margin: 0;
    font-size: clamp(
      20px,
      2.5vw,
      28px
    ); /* Increased from 16-24px to 20-28px for better hierarchy */
    font-weight: 700; /* Increased from 600 to 700 for more prominence */
    color: #ffffff;
    letter-spacing: -0.02em; /* Tighter letter spacing for larger text */
  }

  .close-button {
    background: transparent;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: clamp(8px, 1vw, 12px);
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-fast);
    min-width: clamp(32px, 4vw, 44px);
    min-height: clamp(32px, 4vw, 44px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  /* Dialog Content Layout */
  .dialog-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  /* Content Area */
  .settings-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--content-padding);
    background: rgba(255, 255, 255, 0.01);
    container-type: inline-size;
  }

  /* Container Queries for Responsive Layout */
  @container (min-width: 400px) {
    .settings-dialog {
      --responsive-columns: 1;
      --max-content-width: 100%;
    }
  }

  @container (min-width: 600px) {
    .settings-dialog {
      --responsive-columns: 1;
      --max-content-width: 90%;
    }
  }

  @container (min-width: 800px) {
    .settings-dialog {
      --responsive-columns: 2;
      --max-content-width: 85%;
    }
  }

  @container (min-width: 1000px) {
    .settings-dialog {
      --responsive-columns: 2;
      --max-content-width: 80%;
      --content-padding: clamp(24px, 3vw, 48px);
    }
  }

  @container (min-width: 1200px) {
    .settings-dialog {
      --responsive-columns: 3;
      --max-content-width: 75%;
      --content-padding: clamp(32px, 4vw, 64px);
    }
  }

  /* Dialog Footer */
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: clamp(12px, 1.5vw, 24px);
    padding: clamp(16px, 2vw, 32px);
    border-top: var(--glass-border);
    background: rgba(255, 255, 255, 0.03);
    flex-wrap: wrap;
  }

  .cancel-button,
  .apply-button {
    padding: clamp(8px, 1vw, 12px) clamp(16px, 2vw, 32px);
    border-radius: 6px;
    font-size: clamp(12px, 1.2vw, 16px);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    min-width: clamp(80px, 10vw, 120px);
  }

  .cancel-button {
    background: transparent;
    border: var(--glass-border);
    color: var(--text-secondary);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.06);
    color: white;
  }

  .apply-button {
    background: var(--primary-color);
    border: 1px solid var(--primary-color);
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
  }

  .apply-button:hover {
    background: var(--primary-light);
    border-color: var(--primary-light);
  }

  /* Unsaved changes indicator */
  .apply-button.has-changes {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    border-color: #f59e0b;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    animation: pulse-warning 2s ease-in-out infinite;
  }

  .apply-button.has-changes:hover {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    box-shadow: 0 6px 16px rgba(245, 158, 11, 0.5);
  }

  .changes-indicator {
    font-size: 12px;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes pulse-warning {
    0%,
    100% {
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
    }
    50% {
      box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6);
    }
  }

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  /* Responsive Design with intelligent mobile detection */

  /* Large tablets and small desktops */
  @media (max-width: 1024px) {
    .settings-dialog {
      --sidebar-width: clamp(120px, 12vw, 180px);
      --dialog-width: 95vw;
      --dialog-height: 92vh;
    }
  }

  /* Medium screens and tablets - Full takeover approach */
  @media (max-width: 768px) {
    .settings-overlay {
      padding: 0; /* No padding - use full viewport */
      align-items: stretch;
      justify-content: stretch;
      height: 100dvh; /* Use dynamic viewport to account for browser chrome */
      height: 100svh; /* Fallback to small viewport for better support */
    }

    .settings-dialog {
      --dialog-width: 100vw;
      --dialog-height: 100dvh; /* Use dynamic viewport height for mobile */
      --dialog-height: 100svh; /* Fallback to small viewport height */
      --dialog-max-height: 100dvh;
      --dialog-max-height: 100svh;
      --dialog-radius: 0;
      --sidebar-width: 100%;
      --content-padding: 20px; /* Generous padding for mobile */
      --viewport-offset: 0px;
      width: 100vw;
      height: 100dvh;
      height: 100svh; /* Small viewport height accounts for browser chrome */
      max-height: 100dvh;
      max-height: 100svh;
      max-width: none;
      border-radius: 0;
      margin: 0;
    }

    .dialog-content {
      flex-direction: column;
      /* Ensure content doesn't overflow */
      min-height: 0;
    }

    .dialog-header {
      padding: 16px 20px;
      flex-shrink: 0;
    }

    .dialog-footer {
      padding: 16px 20px;
      flex-shrink: 0;
    }

    .settings-content {
      /* Make sure content area scrolls properly on mobile */
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
  }

  /* Mobile portrait - optimize for touch and maximize space */
  @media (max-width: 480px) {
    .settings-overlay {
      padding: 0;
      height: 100svh; /* Small viewport height for maximum compatibility */
    }

    .settings-dialog {
      --content-padding: 16px; /* Balanced padding */
      --dialog-min-height: 100svh;
      --dialog-height: 100svh; /* Ensure consistent small viewport usage */
      --viewport-offset: 0;
      height: 100svh;
      max-height: 100svh;
    }

    .settings-content {
      /* More generous scrolling area on mobile */
      padding: 20px 16px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .dialog-header {
      padding: 14px 16px;
      min-height: 56px; /* Standard mobile header height */
    }

    .dialog-header h2 {
      font-size: 18px;
    }

    .dialog-footer {
      padding: 16px;
      gap: 12px;
      min-height: 68px; /* Comfortable footer with proper touch targets */
    }

    .cancel-button,
    .apply-button {
      flex: 1; /* Equal width buttons on mobile */
      min-height: 44px; /* Apple HIG minimum touch target */
      font-size: 15px;
    }
  }

  /* Ultra-narrow screens - maintain usability */
  @media (max-width: 390px) {
    .settings-overlay {
      height: 100svh;
    }

    .settings-dialog {
      --content-padding: 12px;
      height: 100svh;
      max-height: 100svh;
    }

    .settings-content {
      padding: 16px 12px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .dialog-header {
      padding: 12px;
    }

    .dialog-header h2 {
      font-size: 17px;
    }

    .dialog-footer {
      padding: 12px;
    }
  }

  /* Height-constrained devices (landscape phones, browser chrome) */
  @media (max-height: 600px) {
    .settings-overlay {
      height: 100svh;
    }

    .settings-dialog {
      --dialog-height: 100svh;
      --dialog-min-height: 200px;
      --viewport-offset: 10px;
      max-height: 100svh;
    }

    .dialog-header,
    .dialog-footer {
      padding: clamp(8px, 1.5vw, 12px);
      flex-shrink: 0;
    }

    .settings-content {
      padding: clamp(8px, 1.5vw, 16px);
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
  }

  /* Very height-constrained (landscape with browser chrome) */
  @media (max-height: 450px) {
    .settings-overlay {
      padding: 0;
      height: 100svh;
    }

    .settings-dialog {
      --dialog-height: 100svh;
      --dialog-min-height: 300px;
      --viewport-offset: 0px;
      height: 100svh;
      max-height: 100svh;
      border-radius: 0;
    }

    .settings-content {
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
  }

  /* High DPI / Retina Display Support */
  @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .settings-dialog {
      border-width: 0.5px;
    }
  }
</style>
