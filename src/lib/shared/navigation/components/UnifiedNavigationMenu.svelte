<!--
  Unified Navigation Menu - Single Menu Button Approach

  Displays a single floating menu button that opens a modern modal
  containing ALL navigation options:
  - Current module's tabs
  - All available modules
  - Settings

  This replaces persistent navigation bars across all device types.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import type { IHapticFeedbackService } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { toggleSettingsDialog } from "../../application/state/app-state.svelte";
  import type { ModuleDefinition, ModuleId, ModeOption } from "../domain/types";

  let {
    // Current state
    currentModule,
    currentModuleName,
    currentSubMode,

    // Available options
    modules = [],
    subModeTabs = [],

    // Callbacks
    onModuleChange,
    onSubModeChange,
  } = $props<{
    currentModule: ModuleId;
    currentModuleName: string;
    currentSubMode: string;
    modules: ModuleDefinition[];
    subModeTabs: ModeOption[];
    onModuleChange?: (moduleId: ModuleId) => void;
    onSubModeChange?: (subModeId: string) => void;
  }>();

  let hapticService: IHapticFeedbackService;
  let showMenu = $state(false);

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Filter to main modules only
  const mainModules = $derived(modules.filter((m) => m.isMain));

  function toggleMenu() {
    hapticService?.trigger("navigation");
    showMenu = !showMenu;
  }

  function closeMenu() {
    showMenu = false;
  }

  function handleBackdropClick() {
    closeMenu();
  }

  function handleSubModeSelect(subModeId: string) {
    hapticService?.trigger("navigation");
    onSubModeChange?.(subModeId);
    closeMenu();
  }

  function handleModuleSelect(moduleId: ModuleId) {
    hapticService?.trigger("navigation");
    onModuleChange?.(moduleId);
    closeMenu();
  }

  function handleSettingsTap() {
    hapticService?.trigger("navigation");
    toggleSettingsDialog();
    closeMenu();
  }

  // Handle escape key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && showMenu) {
      closeMenu();
    }
  }

  $effect(() => {
    if (showMenu) {
      document.addEventListener("keydown", handleKeydown);
      return () => document.removeEventListener("keydown", handleKeydown);
    }
  });
</script>

<!-- Floating Menu Button -->
<button
  class="floating-menu-button glass-surface"
  onclick={toggleMenu}
  aria-label="Open navigation menu"
  aria-expanded={showMenu}
>
  <i class="fas fa-bars"></i>
</button>

<!-- Full-Screen Navigation Modal -->
{#if showMenu}
  <!-- Backdrop -->
  <div
    class="menu-backdrop"
    onclick={handleBackdropClick}
    transition:fade={{ duration: 200 }}
    role="presentation"
  ></div>

  <!-- Menu Content -->
  <div
    class="menu-content glass-surface"
    transition:fly={{ y: -20, duration: 300 }}
    role="dialog"
    aria-label="Navigation menu"
  >
    <!-- Close button -->
    <button class="close-button" onclick={closeMenu} aria-label="Close menu">
      <i class="fas fa-times"></i>
    </button>

    <!-- Header -->
    <div class="menu-header">
      <h2>Navigation</h2>
      <div class="current-location">
        <span class="module-name">{currentModuleName}</span>
        {#if currentSubMode}
          <span class="separator">›</span>
          <span class="tab-name">
            {subModeTabs.find((t) => t.id === currentSubMode)?.label || currentSubMode}
          </span>
        {/if}
      </div>
    </div>

    <div class="menu-scroll">
      <!-- Current Module Tabs Section -->
      {#if subModeTabs.length > 0}
        <section class="menu-section">
          <h3 class="section-title">{currentModuleName} Tabs</h3>
          <div class="menu-items">
            {#each subModeTabs as tab}
              <button
                class="menu-item"
                class:active={currentSubMode === tab.id}
                class:disabled={tab.disabled}
                onclick={() => !tab.disabled && handleSubModeSelect(tab.id)}
                disabled={tab.disabled}
              >
                <span class="item-icon">{@html tab.icon}</span>
                <div class="item-info">
                  <span class="item-label">{tab.label}</span>
                  {#if tab.description}
                    <span class="item-description">{tab.description}</span>
                  {/if}
                </div>
                {#if currentSubMode === tab.id}
                  <span class="active-indicator"><i class="fas fa-check"></i></span>
                {/if}
              </button>
            {/each}
          </div>
        </section>
      {/if}

      <!-- All Modules Section -->
      <section class="menu-section">
        <h3 class="section-title">Switch Module</h3>
        <div class="menu-items">
          {#each mainModules as module}
            <button
              class="menu-item"
              class:active={currentModule === module.id}
              onclick={() => handleModuleSelect(module.id)}
            >
              <span class="item-icon">{@html module.icon}</span>
              <div class="item-info">
                <span class="item-label">{module.label}</span>
                {#if module.description}
                  <span class="item-description">{module.description}</span>
                {/if}
              </div>
              {#if currentModule === module.id}
                <span class="active-indicator"><i class="fas fa-check"></i></span>
              {/if}
            </button>
          {/each}
        </div>
      </section>

      <!-- Settings Section -->
      <section class="menu-section">
        <div class="menu-items">
          <button class="menu-item" onclick={handleSettingsTap}>
            <span class="item-icon"><i class="fas fa-cog"></i></span>
            <div class="item-info">
              <span class="item-label">Settings</span>
              <span class="item-description">App preferences and configuration</span>
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>
{/if}

<style>
  /* ============================================================================
     FLOATING MENU BUTTON
     ============================================================================ */
  .floating-menu-button {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 200;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: var(--glass-backdrop-strong);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .floating-menu-button:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .floating-menu-button:active {
    transform: scale(0.95);
  }

  /* Account for safe areas on mobile */
  @supports (top: env(safe-area-inset-top)) {
    .floating-menu-button {
      top: max(16px, env(safe-area-inset-top));
      left: max(16px, env(safe-area-inset-left));
    }
  }

  /* ============================================================================
     MENU MODAL
     ============================================================================ */
  .menu-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 250;
  }

  .menu-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 480px;
    max-height: 80vh;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: var(--glass-backdrop-strong);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 24px;
    z-index: 251;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  }

  /* Close button */
  .close-button {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: all 0.2s ease;
    z-index: 1;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 1);
  }

  /* Header */
  .menu-header {
    padding: 24px 24px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .menu-header h2 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
  }

  .current-location {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .module-name {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .separator {
    color: rgba(255, 255, 255, 0.4);
  }

  .tab-name {
    color: rgba(255, 255, 255, 0.6);
  }

  /* Scrollable content */
  .menu-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  /* Menu sections */
  .menu-section {
    margin-bottom: 24px;
  }

  .menu-section:last-child {
    margin-bottom: 0;
  }

  .section-title {
    margin: 0 0 12px 0;
    padding: 0 8px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: rgba(255, 255, 255, 0.5);
  }

  .menu-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* Menu items */
  .menu-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    min-height: 56px;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(4px);
  }

  .menu-item:active {
    transform: translateX(4px) scale(0.98);
  }

  .menu-item.active {
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
  }

  .menu-item.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  .item-icon {
    font-size: 24px;
    width: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .item-label {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .item-description {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.3;
  }

  .active-indicator {
    color: rgba(99, 102, 241, 1);
    font-size: 16px;
    flex-shrink: 0;
  }

  /* ============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================ */
  @media (max-width: 500px) {
    .menu-content {
      width: 95%;
      max-height: 85vh;
      border-radius: 20px;
    }

    .menu-header {
      padding: 20px 20px 12px;
    }

    .menu-header h2 {
      font-size: 20px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .floating-menu-button,
    .menu-item {
      transition: none;
    }

    .floating-menu-button:hover,
    .floating-menu-button:active,
    .menu-item:hover,
    .menu-item:active {
      transform: none;
    }
  }

  @media (prefers-contrast: high) {
    .floating-menu-button {
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid white;
    }

    .menu-content {
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid white;
    }

    .menu-item {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .menu-item.active {
      background: rgba(255, 255, 255, 0.3);
      border-color: white;
    }
  }
</style>
