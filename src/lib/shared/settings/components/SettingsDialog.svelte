<!-- SettingsDialog.svelte - Refactored main settings dialog -->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import { quintOut } from "svelte/easing";
  import { scale } from "svelte/transition";
  import {
    getSettings,
    hideSettingsDialog,
    updateSettings,
  } from "../../application/state/app-state.svelte";
  import SettingsSidebar from "./SettingsSidebar.svelte";
  import AccessibilityTab from "./tabs/AccessibilityTab.svelte";
  import BackgroundTab from "./tabs/background/BackgroundTab.svelte";
  import PropTypeTab from "./tabs/PropTypeTab.svelte";
  import SettingsDialogHeader from "./SettingsDialogHeader.svelte";
  import SettingsDialogFooter from "./SettingsDialogFooter.svelte";
  import SettingsDialogOverlay from "./SettingsDialogOverlay.svelte";
  import { createFocusTrap } from "../utils/focus-trap.svelte";
  import {
    loadActiveTab,
    validateActiveTab as validateTab,
    saveActiveTab,
  } from "../utils/tab-persistence.svelte";

  // Valid tab IDs for validation
  const VALID_TAB_IDS = ["PropType", "Background", "Accessibility"];

  // Service resolution
  let hapticService: IHapticFeedbackService | null = null;

  // Current settings state with null safety
  // Create a local editable copy of settings
  let settings = $state({ ...getSettings() });

  // Initialize activeTab from localStorage or default to "PropType"
  let activeTab = $state(loadActiveTab(VALID_TAB_IDS, "PropType"));

  // Track if settings have been modified
  let hasUnsavedChanges = $state(false);
  let dialogElement: HTMLElement | null = $state(null);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Validate and potentially update the active tab
    activeTab = validateTab(activeTab, tabs, "PropType");

    // Set up focus trap
    if (dialogElement) {
      const focusTrap = createFocusTrap({
        container: dialogElement,
        onEscape: handleClose,
        autoFocus: true,
      });

      return focusTrap.cleanup;
    }
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
</script>

<!-- Settings Dialog with Overlay -->
<SettingsDialogOverlay onClose={handleClose}>
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
    <SettingsDialogHeader onClose={handleClose} />

    <!-- Dialog Content -->
    <div class="dialog-content">
      <!-- Sidebar Navigation -->
      <div>
        <SettingsSidebar {tabs} {activeTab} onTabSelect={switchTab} />
      </div>

      <!-- Content Area -->
      <main class="settings-content">
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

    <SettingsDialogFooter
      {hasUnsavedChanges}
      onCancel={handleClose}
      onApply={handleApply}
    />
  </div>
</SettingsDialogOverlay>

<style>
  /* Main dialog container styles */

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
    .settings-dialog {
      --dialog-width: 100vw;
      --dialog-height: 100dvh;
      --dialog-height: 100svh;
      --dialog-max-height: 100dvh;
      --dialog-max-height: 100svh;
      --dialog-radius: 0;
      --sidebar-width: 100%;
      --content-padding: 20px;
      --viewport-offset: 0px;
      width: 100vw;
      height: 100dvh;
      height: 100svh;
      max-height: 100dvh;
      max-height: 100svh;
      max-width: none;
      border-radius: 0;
      margin: 0;
    }

    .dialog-content {
      flex-direction: column;
      min-height: 0;
    }

    .settings-content {
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
  }

  /* Mobile portrait - optimize for touch and maximize space */
  @media (max-width: 480px) {
    .settings-dialog {
      --content-padding: 16px;
      --dialog-min-height: 100svh;
      --dialog-height: 100svh;
      --viewport-offset: 0;
      height: 100svh;
      max-height: 100svh;
    }

    .settings-content {
      padding: 20px 16px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }
  }

  /* Ultra-narrow screens - maintain usability */
  @media (max-width: 390px) {
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
  }

  /* Height-constrained devices (landscape phones, browser chrome) */
  @media (max-height: 600px) {
    .settings-dialog {
      --dialog-height: 100svh;
      --dialog-min-height: 200px;
      --viewport-offset: 10px;
      max-height: 100svh;
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
