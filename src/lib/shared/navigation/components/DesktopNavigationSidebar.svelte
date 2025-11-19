<!-- Desktop Navigation Sidebar -->
<!-- Modern 2026-style sidebar navigation for desktop in side-by-side layout -->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
  import { slide, fade } from "svelte/transition";
  import {
    getShowSettings,
    toggleSettingsDialog,
  } from "../../application/state/app-state.svelte";
  import type { ModuleDefinition, Section, ModuleId } from "../domain/types";
  import {
    desktopSidebarState,
    toggleDesktopSidebarCollapsed,
    setDesktopSidebarCollapsed,
    initializeDesktopSidebarCollapsedState,
    saveDesktopSidebarCollapsedState,
  } from "../../layout/desktop-sidebar-state.svelte";
  import {
    SidebarHeader,
    SidebarFooter,
    ModuleGroup,
    CollapsedTabButton,
    CollapsedModuleButton,
  } from "./desktop-sidebar";

  let {
    currentModule,
    currentSection,
    modules = [],
    onModuleChange,
    onSectionChange,
    onHeightChange,
  } = $props<{
    currentModule: string;
    currentSection: string;
    modules: ModuleDefinition[];
    onModuleChange?: (moduleId: ModuleId) => void | Promise<void>;
    onSectionChange?: (sectionId: string) => void;
    onHeightChange?: (height: number) => void;
  }>();

  // Services
  let hapticService: IHapticFeedbackService;

  // Ref to sidebar element
  let sidebarElement = $state<HTMLElement | null>(null);

  // Track which modules are expanded
  let expandedModules = $state<Set<string>>(new Set([currentModule]));

  // Get collapsed state reactively
  const isCollapsed = $derived(desktopSidebarState.isCollapsed);

  // Track when we're transitioning from collapsed to expanded
  // This prevents sections from sliding in while the sidebar is still narrow
  let isTransitioningFromCollapsed = $state(false);

  function toggleModuleExpansion(moduleId: string) {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    expandedModules = newExpanded;
  }

  function handleModuleTap(moduleId: string, isDisabled: boolean = false) {
    // Don't trigger haptic or allow interaction for disabled modules
    if (isDisabled) {
      return;
    }

    hapticService?.trigger("selection");

    // If sidebar is collapsed, switch to the module (VS Code activity bar behavior)
    if (isCollapsed) {
      // Switch to the clicked module
      onModuleChange?.(moduleId as ModuleId);
    } else {
      // When expanded, module buttons toggle expansion
      toggleModuleExpansion(moduleId);
    }
  }

  function handleSectionTap(moduleId: string, section: Section) {
    if (!section.disabled) {
      hapticService?.trigger("selection");

      // Switch to the section's module if we're not already on it
      if (moduleId !== currentModule) {
        onModuleChange?.(moduleId as ModuleId);
      }

      // Then switch to the section
      onSectionChange?.(section.id);

      // Ensure the module is expanded after navigation
      expandedModules = new Set([...expandedModules, moduleId]);
    }
  }

  function handleSettingsTap() {
    hapticService?.trigger("selection");
    toggleSettingsDialog();
  }

  function handleToggleCollapse() {
    hapticService?.trigger("selection");
    toggleDesktopSidebarCollapsed();
    saveDesktopSidebarCollapsedState(desktopSidebarState.isCollapsed);
  }

  function handleLogoTap() {
    hapticService?.trigger("selection");
    onModuleChange?.("about");
  }

  // Module color mapping for dynamic theming
  function getModuleColor(moduleId: string): string {
    const colorMap: Record<string, string> = {
      create: "#f59e0b", // Amber
      explore: "#a855f7", // Purple
      community: "#06b6d4", // Cyan
      learn: "#3b82f6", // Blue
      collect: "#10b981", // Green
      animate: "#ec4899", // Pink
      about: "#38bdf8", // Sky blue
      admin: "#ffd700", // Gold
    };
    return colorMap[moduleId] || "#a855f7"; // Default to purple
  }

  onMount(() => {
    // Initialize collapsed state from localStorage
    initializeDesktopSidebarCollapsedState();

    // Initialize services
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Set up ResizeObserver to measure and report sidebar height
    let resizeObserver: ResizeObserver | null = null;
    if (sidebarElement) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height =
            entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
          onHeightChange?.(height);
        }
      });
      resizeObserver.observe(sidebarElement);

      // Report initial height
      const initialHeight = sidebarElement.getBoundingClientRect().height;
      if (initialHeight > 0) {
        onHeightChange?.(initialHeight);
      }
    }

    // Return cleanup function
    return () => {
      resizeObserver?.disconnect();
    };
  });
</script>

<nav
  class="desktop-navigation-sidebar"
  class:collapsed={isCollapsed}
  bind:this={sidebarElement}
>
  <!-- Sidebar Header/Branding -->
  <SidebarHeader
    {isCollapsed}
    onLogoClick={handleLogoTap}
    onToggleCollapse={handleToggleCollapse}
  />

  <!-- Modules List (expanded) or Activity Bar (collapsed) -->
  <div class="modules-container" class:tabs-mode={isCollapsed}>
    {#if isCollapsed}
      <!-- VS Code-style Activity Bar: Modules with nested tabs -->
      <div class="activity-bar">
        {#each modules.filter((m: ModuleDefinition) => m.isMain) as module}
          {@const isModuleActive = currentModule === module.id}
          {@const moduleColor = getModuleColor(module.id)}

          <!-- Module Button -->
          <CollapsedModuleButton
            {module}
            isActive={isModuleActive}
            onClick={() => handleModuleTap(module.id, module.disabled ?? false)}
            {moduleColor}
          />

          <!-- Nested Tabs (shown only for active module) -->
          {#if isModuleActive && module.sections.length > 0}
            {@const moduleColor = getModuleColor(module.id)}
            <div
              class="nested-tabs"
              style="--module-color: {moduleColor};"
              in:slide={{ duration: 220, axis: 'y' }}
              out:slide={{ duration: 180, axis: 'y' }}
            >
              {#each module.sections as section, index}
                {@const isSectionActive = currentSection === section.id}

                <div
                  in:fade={{ duration: 200, delay: index * 40 }}
                  out:fade={{ duration: 150 }}
                >
                  <CollapsedTabButton
                    {section}
                    isActive={isSectionActive}
                    onClick={() => handleSectionTap(module.id, section)}
                  />
                </div>
              {/each}
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <!-- Show modules with expandable sections when expanded -->
      {#each modules.filter((m: ModuleDefinition) => m.isMain) as module}
        {@const isExpanded = expandedModules.has(module.id)}

        <ModuleGroup
          {module}
          {currentModule}
          {currentSection}
          {isExpanded}
          {isCollapsed}
          {isTransitioningFromCollapsed}
          onModuleClick={handleModuleTap}
          onSectionClick={handleSectionTap}
        />
      {/each}
    {/if}
  </div>

  <!-- Sidebar Footer -->
  <SidebarFooter
    {isCollapsed}
    isSettingsActive={getShowSettings()}
    onSettingsClick={handleSettingsTap}
  />
</nav>

<style>
  /* ============================================================================
     DESKTOP NAVIGATION SIDEBAR - 2026 MODERN DESIGN
     ============================================================================ */
  .desktop-navigation-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 220px;
    display: flex;
    flex-direction: column;
    background: rgba(10, 10, 15, 0.85);
    backdrop-filter: blur(40px) saturate(180%);
    -webkit-backdrop-filter: blur(40px) saturate(180%);
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    z-index: 150;
    overflow: hidden;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    /* Safe area support */
    padding-left: env(safe-area-inset-left);
  }

  .desktop-navigation-sidebar.collapsed {
    width: 64px;
  }

  /* ============================================================================
     MODULES CONTAINER
     ============================================================================ */
  .modules-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 12px;

    /* Custom scrollbar */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
  }

  /* Tabs mode - VS Code activity bar layout when sidebar is collapsed */
  .modules-container.tabs-mode {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
  }

  /* ============================================================================
     ACTIVITY BAR (Collapsed Sidebar Mode)
     ============================================================================ */
  .activity-bar {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
  }

  /* Nested Tabs - shown under active module */
  .nested-tabs {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 0;
    margin-bottom: 12px;
    margin-left: 18px; /* Stronger indent for clear hierarchy */
    position: relative;
  }

  /* Dynamic module-colored border with glow - 2026 style */
  .nested-tabs::before {
    content: "";
    position: absolute;
    left: -10px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--module-color);
    border-radius: 2px;
    box-shadow:
      0 0 8px var(--module-color),
      0 0 4px var(--module-color);
    opacity: 0.4;
  }

  /* Ambient background glow with module color - contextual theming */
  .nested-tabs::after {
    content: "";
    position: absolute;
    left: -6px;
    right: -6px;
    top: 0;
    bottom: 0;
    background: radial-gradient(
      ellipse at left,
      color-mix(in srgb, var(--module-color) 15%, transparent) 0%,
      color-mix(in srgb, var(--module-color) 8%, transparent) 50%,
      transparent 100%
    );
    border-radius: 8px;
    z-index: -1;
    backdrop-filter: blur(8px);
  }

  .modules-container::-webkit-scrollbar {
    width: 6px;
  }

  .modules-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .modules-container::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  .modules-container::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* ============================================================================
     ANIMATIONS & TRANSITIONS
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .desktop-navigation-sidebar * {
      transition: none !important;
      animation: none !important;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .desktop-navigation-sidebar {
      background: rgba(0, 0, 0, 0.95);
      border-right: 2px solid white;
    }
  }
</style>
