<!--
  ModuleSwitcher - Module Navigation Drawer

  A standardized drawer component for switching between app modules.
  Uses the shared Drawer component (vaul-svelte based) for consistent UX.
-->
<script lang="ts">

import { resolve } from "$lib/shared/inversify";
import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { ModuleDefinition, ModuleId } from "../domain/types";
  import ModuleList from "./ModuleList.svelte";
  import InstallPromptButton from "./InstallPromptButton.svelte";
  import type { IMobileFullscreenService } from "../../mobile/services/contracts/IMobileFullscreenService";
  import type { IHapticFeedbackService } from "../../application/services/contracts/IHapticFeedbackService";
  import Drawer from "../../foundation/ui/Drawer.svelte";

  let {
    // Current state
    currentModule,
    currentModuleName,

    // Available options
    modules = [],

    // Callbacks
    onModuleChange,
  } = $props<{
    currentModule: ModuleId;
    currentModuleName: string;
    modules: ModuleDefinition[];
    onModuleChange?: (moduleId: ModuleId) => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let fullscreenService: IMobileFullscreenService;
  let isOpen = $state(false);

  // PWA install state
  let showInstallOption = $state(false);
  let canUseNativeInstall = $state(false);

  function closeDrawer() {
    hapticService?.trigger("selection");
    isOpen = false;
  }

  function openDrawer() {
    hapticService?.trigger("selection");
    isOpen = true;
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
    fullscreenService = resolve<IMobileFullscreenService>(
      TYPES.IMobileFullscreenService
    );

    // Check if PWA install should be shown
    try {
      const isPWA = fullscreenService?.isPWA?.() ?? false;

      // Only show install option if not already installed as PWA
      if (!isPWA) {
        showInstallOption = true;
        canUseNativeInstall = fullscreenService?.canInstallPWA?.() ?? false;

        // Listen for install prompt availability
        const unsubscribe = fullscreenService?.onInstallPromptAvailable?.(
          (available: boolean) => {
            canUseNativeInstall = available;
          }
        );

        // Listen for app installation
        const handleAppInstalled = () => {
          showInstallOption = false;
        };
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
          unsubscribe?.();
          window.removeEventListener("appinstalled", handleAppInstalled);
        };
      }
    } catch (error) {
      console.warn("Failed to check PWA install status:", error);
    }

    return undefined;
  });

  function handleModuleSelect(moduleId: ModuleId) {
    onModuleChange?.(moduleId);
    closeDrawer();
  }

  function handleInstallClose() {
    closeDrawer();
  }

  // Listen for custom event from primary navigation
  onMount(() => {
    const handleToggleEvent = () => {
      if (isOpen) {
        closeDrawer();
      } else {
        openDrawer();
      }
    };
    window.addEventListener("module-switcher-toggle", handleToggleEvent);

    return () => {
      window.removeEventListener("module-switcher-toggle", handleToggleEvent);
    };
  });
</script>

<!-- Drawer Component -->
<Drawer
  bind:isOpen
  ariaLabel="Module navigation menu"
  class="module-switcher-drawer"
  backdropClass="module-switcher-backdrop"
  showHandle={true}
  closeOnBackdrop={true}
>
  <div class="module-switcher-container">
    <!-- Header -->
    <div class="module-switcher-header">
      <div class="header-content">
        <h2>Navigation</h2>
        <div class="current-location">
          <span class="module-name">{currentModuleName}</span>
        </div>
      </div>
      <button
        class="close-button"
        onclick={closeDrawer}
        aria-label="Close menu"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Content -->
    <div class="module-switcher-content">
      <!-- Module Selection -->
      <ModuleList
        {currentModule}
        {modules}
        onModuleSelect={handleModuleSelect}
      />

      <!-- App Actions Section -->
      <section class="menu-section">
        <div class="menu-items">
          {#if showInstallOption}
            <InstallPromptButton
              {canUseNativeInstall}
              onInstall={handleInstallClose}
            />
          {/if}
        </div>
      </section>
    </div>
  </div>
</Drawer>

<style>
  /* ============================================================================
     DRAWER STYLING - Refined Minimal Design
     ============================================================================ */
  :global(.module-switcher-drawer) {
    /* Full viewport height - positioned from top to bottom */
    top: 0 !important;
    bottom: 0 !important;
    height: 100vh !important;
    max-height: 100vh !important;
    --sheet-bg: rgba(12, 12, 18, 0.96);
    --sheet-filter: blur(24px) saturate(140%);
    --sheet-border: 1px solid rgba(255, 255, 255, 0.08);
    --sheet-radius-large: 20px;
    box-sizing: border-box !important;
  }

  :global(.module-switcher-backdrop) {
    --sheet-backdrop-bg: rgba(0, 0, 0, 0.4);
    --sheet-backdrop-filter: blur(3px);
  }

  /* Sheet content - ensure proper z-index */
  :global(.drawer-content.module-switcher-drawer) {
    z-index: 1100 !important;
  }

  /* Drawer inner fills available height */
  :global(.drawer-content.module-switcher-drawer .drawer-inner) {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* ============================================================================
     CONTAINER - Fills drawer height
     ============================================================================ */
  .module-switcher-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 1;
    min-height: 0;
  }

  /* ============================================================================
     HEADER - Refined Minimal
     ============================================================================ */
  .module-switcher-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
    gap: 12px;
    position: relative;
  }

  /* Subtle gradient accent at top of header */
  .module-switcher-header::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(99, 102, 241, 0.3),
      rgba(139, 92, 246, 0.3),
      transparent
    );
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  .module-switcher-header h2 {
    margin: 0 0 2px 0;
    font-size: 17px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.9);
    letter-spacing: -0.01em;
  }

  .current-location {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.45);
  }

  .module-name {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.65);
  }

  /* Close button - refined */
  .close-button {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.85);
  }

  .close-button:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.08);
  }

  /* ============================================================================
     CONTENT - Fill available space with generous padding
     ============================================================================ */
  .module-switcher-content {
    padding: 16px 18px 40px; /* Extra bottom padding for intentional spacing */
    overflow-y: auto;
    overflow-x: hidden;
    flex: 1;
    display: flex;
    flex-direction: column;

    /* Smooth scrolling */
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;

    /* Thin scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  .module-switcher-content::-webkit-scrollbar {
    width: 4px;
  }

  .module-switcher-content::-webkit-scrollbar-track {
    background: transparent;
  }

  .module-switcher-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 2px;
  }

  /* Menu sections - install button at bottom */
  .menu-section {
    margin-top: auto; /* Push to bottom of flex container */
    padding-top: 20px;
  }

  .menu-section:first-child {
    margin-top: auto;
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* ============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================ */
  @media (max-width: 500px) {
    .module-switcher-header {
      padding: 12px 14px 8px;
    }

    .module-switcher-header h2 {
      font-size: 16px;
    }

    .module-switcher-content {
      padding: 12px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .close-button {
      transition: none;
    }

    .close-button:active {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    :global(.module-switcher-drawer) {
      --sheet-bg: rgba(0, 0, 0, 0.98);
      --sheet-border: 2px solid white;
    }

    .close-button {
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid white;
      color: black;
    }
  }
</style>
