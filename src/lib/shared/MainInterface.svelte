<script lang="ts">
  /**
   * MainInterface
   * Domain: Application Layout Shell
   *
   * Pure layout orchestration component.
   * Delegates all business logic to specialized managers.
   */
  import { onMount } from "svelte";
  import { getActiveTab } from "./application/state/app-state.svelte";
  // import { handleHMRInit } from "./hmr-helper"; // No longer needed
  import {
    layoutState,
    moduleHasPrimaryNav,
    setCurrentWord,
    setLearnHeader,
    setPrimaryNavHeight,
    setPrimaryNavLandscape,
    setTabAccessibility,
  } from "./layout/layout-state.svelte";
  import {
    currentModule,
    currentModuleName,
    currentSection,
    handleModuleChange,
    handleSectionChange,
    getModuleDefinitions,
    moduleSections,
    navigationCoordinator,
  } from "./navigation-coordinator/navigation-coordinator.svelte";

  // Get module definitions reactively
  const moduleDefinitions = $derived(getModuleDefinitions());

  // Layout components
  import PrimaryNavigation from "./navigation/components/PrimaryNavigation.svelte";
  import ModuleSwitcher from "./navigation/components/ModuleSwitcher.svelte";
  import DesktopNavigationSidebar from "./navigation/components/DesktopNavigationSidebar.svelte";
  // Domain managers
  import ModuleRenderer from "./modules/ModuleRenderer.svelte";
  import PWAInstallationManager from "./pwa/PWAInstallationManager.svelte";
  import SpotlightRouter from "./spotlight/SpotlightRouter.svelte";
  import { desktopSidebarState } from "./layout/desktop-sidebar-state.svelte";
  // Keyboard shortcuts
  import {
    KeyboardShortcutCoordinator,
    CommandPalette,
    ShortcutsHelp,
  } from "./keyboard/components";
  import {
    resolve,
    TYPES,
    type IDeviceDetector,
    type IViewportService,
  } from "$shared";
  import { useDesktopSidebarVisibility } from "./navigation/services/desktop-sidebar-visibility.svelte";
  import { explorerScrollState } from "../modules/explore/shared/state/ExplorerScrollState.svelte";
  import { initializeDeepLinks } from "./navigation/utils/deep-link-init";

  // Reactive state
  const activeModule = $derived(getActiveTab()); // Using legacy getActiveTab for now
  const isModuleLoading = $derived(activeModule === null);
  const isAboutActive = $derived(activeModule === "about");

  // Desktop sidebar visibility management
  let desktopSidebarVisibility: ReturnType<
    typeof useDesktopSidebarVisibility
  > | null = null;
  const showDesktopSidebar = $derived(desktopSidebarState.isVisible);

  // Primary navigation visibility - only hide in Explorer module during scroll
  const isPrimaryNavVisible = $derived(
    currentModule() === "explore" ? explorerScrollState.isUIVisible : true
  );

  // Sync state to coordinators
  $effect(() => {
    navigationCoordinator.canAccessEditAndExportPanels =
      layoutState.canAccessEditAndExportPanels;
  });

  // Handle reveal navigation from peek indicator
  function handleRevealNav() {
    explorerScrollState.forceShowUI();
  }

  onMount(() => {
    if (typeof window === "undefined") return;
    // handleHMRInit(); // Disabled - causing HMR verification loops

    // Initialize deep linking for shareable sequence URLs
    initializeDeepLinks();

    // Initialize desktop sidebar visibility
    try {
      const deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      const viewportService = resolve<IViewportService>(TYPES.IViewportService);
      desktopSidebarVisibility = useDesktopSidebarVisibility(
        deviceDetector,
        viewportService
      );
    } catch (error) {
      console.warn(
        "MainInterface: Failed to initialize desktop sidebar visibility",
        error
      );
    }

    // No longer auto-opening info page - users go straight into Create module
    // Info page is now an info/resources page accessible via the info button

    return () => {
      desktopSidebarVisibility?.cleanup();
    };
  });
</script>

<div
  class="main-interface"
  class:nav-landscape={layoutState.isPrimaryNavLandscape}
  class:has-desktop-sidebar={showDesktopSidebar}
  class:about-active={isAboutActive}
  style="--primary-nav-height: {layoutState.primaryNavHeight}px; --desktop-sidebar-width: {desktopSidebarState.width}px;"
>
  <!-- Module Switcher -->
  <ModuleSwitcher
    currentModule={currentModule()}
    currentModuleName={currentModuleName()}
    modules={moduleDefinitions}
    onModuleChange={handleModuleChange}
  />

  <!-- Desktop Navigation Sidebar (only on desktop in side-by-side layout) -->
  {#if showDesktopSidebar}
    <DesktopNavigationSidebar
      currentModule={currentModule()}
      currentSection={currentSection()}
      modules={moduleDefinitions}
      onModuleChange={handleModuleChange}
      onSectionChange={handleSectionChange}
    />
  {/if}

  <!-- Main Content Area -->
  <main
    class="content-area"
    class:about-active={isAboutActive}
    class:has-primary-nav={moduleHasPrimaryNav(currentModule()) &&
      !showDesktopSidebar}
    class:nav-hidden={!isPrimaryNavVisible}
    class:nav-landscape={layoutState.isPrimaryNavLandscape}
  >
    <ModuleRenderer
      {activeModule}
      {isModuleLoading}
      onTabAccessibilityChange={setTabAccessibility}
      onCurrentWordChange={setCurrentWord}
      onLearnHeaderChange={setLearnHeader}
    />
  </main>

  <!-- Primary Navigation (conditionally rendered) -->
  {#if moduleHasPrimaryNav(currentModule()) && !showDesktopSidebar}
    <PrimaryNavigation
      sections={moduleSections()}
      currentSection={currentSection()}
      onSectionChange={handleSectionChange}
      onModuleSwitcherTap={() => {
        window.dispatchEvent(new CustomEvent("module-switcher-toggle"));
      }}
      onLayoutChange={setPrimaryNavLandscape}
      onHeightChange={setPrimaryNavHeight}
      isUIVisible={isPrimaryNavVisible}
      onRevealNav={handleRevealNav}
    />
  {/if}

  <!-- Domain Managers -->
  <PWAInstallationManager />
  <SpotlightRouter />

  <!-- Keyboard Shortcuts -->
  <KeyboardShortcutCoordinator />
  <CommandPalette />
  <ShortcutsHelp />
</div>

<style>
  .main-interface {
    display: flex;
    flex-direction: column;
    height: 100vh;
    height: var(--viewport-height, 100vh);
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    position: relative;
    background: transparent;
    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .main-interface.about-active {
    overflow: visible !important;
    height: auto !important;
    min-height: 100vh !important;
    min-height: var(--viewport-height, 100vh) !important;
    min-height: 100dvh !important;
  }

  /* Desktop sidebar support */
  .main-interface.has-desktop-sidebar {
    padding-left: var(--desktop-sidebar-width, 280px);
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-height: 0;
  }

  .content-area.has-primary-nav {
    padding-bottom: var(--primary-nav-height, 64px);
    padding-left: 0;
    transition: padding 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Remove bottom padding when navigation is hidden to utilize the space */
  .content-area.has-primary-nav.nav-hidden {
    padding-bottom: 0;
  }

  .content-area.has-primary-nav.nav-landscape {
    padding-bottom: 0 !important;
    padding-left: 72px !important;
    padding-left: max(72px, env(safe-area-inset-left)) !important;
  }

  /* Reset padding when desktop sidebar is visible */
  .main-interface.has-desktop-sidebar .content-area {
    padding-left: 0 !important;
  }

  .content-area.about-active {
    overflow: visible !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .main-interface {
      transition: none !important;
      animation: none !important;
    }
  }

  @media (prefers-contrast: high) {
    .main-interface {
      border: 2px solid #667eea;
    }
  }

  @media print {
    .main-interface {
      height: auto;
      overflow: visible;
    }

    .content-area {
      overflow: visible;
      height: auto;
    }
  }
</style>
