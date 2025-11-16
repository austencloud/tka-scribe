<!-- Desktop Navigation Sidebar -->
<!-- Modern 2026-style sidebar navigation for desktop in side-by-side layout -->
<script lang="ts">
  import { resolve, TYPES, type IHapticFeedbackService } from "$shared";
  import { onMount } from "svelte";
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
  import { toggleInfo } from "../../info/state/info-state.svelte";
  import {
    SidebarHeader,
    SidebarFooter,
    ModuleGroup,
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

    // If sidebar is collapsed, expand it and show the clicked module's sections
    if (isCollapsed) {
      // Expand the sidebar
      setDesktopSidebarCollapsed(false);
      saveDesktopSidebarCollapsedState(false);

      // Set transition flag to prevent section slide animation during width expansion
      isTransitioningFromCollapsed = true;

      // Delay expanding the module until after the sidebar width transition completes (300ms)
      setTimeout(() => {
        expandedModules = new Set([moduleId]);
        isTransitioningFromCollapsed = false;
      }, 300);
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
    toggleInfo();
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

  <!-- Modules List -->
  <div class="modules-container">
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
