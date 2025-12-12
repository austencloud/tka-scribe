<script lang="ts">
  /**
   * MainInterface
   * Domain: Application Layout Shell
   *
   * Pure layout orchestration component.
   * Delegates all business logic to specialized managers.
   */
  import { onMount } from "svelte";
  import { getActiveTab } from "./application/state/ui/ui-state.svelte";
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
    initializeNavigationHistory,
    getModuleDefinitions,
    moduleSections,
    navigationCoordinator,
  } from "./navigation-coordinator/navigation-coordinator.svelte";

  // Get module definitions reactively
  const moduleDefinitions = $derived(getModuleDefinitions());

  // Layout components
  import PrimaryNavigation from "./navigation/components/PrimaryNavigation.svelte";
  import DesktopNavigationSidebar from "./navigation/components/DesktopNavigationSidebar.svelte";
  // Domain managers
  import ModuleRenderer from "./modules/ModuleRenderer.svelte";
  import PWAInstallationManager from "./pwa/PWAInstallationManager.svelte";
  import SpotlightRouter from "./spotlight/SpotlightRouter.svelte";
  import { desktopSidebarState } from "./layout/desktop-sidebar-state.svelte";
  // Keyboard shortcuts

  import type { IDeepLinkService } from "./navigation/services/contracts/IDeepLinkService";
  import { useDesktopSidebarVisibility } from "./navigation/services/desktop-sidebar-visibility.svelte";
  import { discoverScrollState } from "../features/discover/shared/state/DiscoverScrollState.svelte";
  import type { IViewportService } from "./device/services/contracts/IViewportService";
  import { resolve } from "./inversify/di";
  import { TYPES } from "./inversify/types";
  import type { IDeviceDetector } from "./device/services/contracts/IDeviceDetector";
  import type { ModuleId } from "./navigation/domain/types";
  import { navigationState } from "./navigation/state/navigation-state.svelte";
  import { hasOpenDrawers } from "./foundation/ui/drawer/DrawerStack";
  import { keyboardShortcutState } from "./keyboard/state/keyboard-shortcut-state.svelte";
  import CommandPalette from "./keyboard/components/CommandPalette.svelte";
  import ShortcutsHelp from "./keyboard/components/ShortcutsHelp.svelte";
  import KeyboardShortcutCoordinator from "./keyboard/coordinators/KeyboardShortcutCoordinator.svelte";

  // Debug tools
  import RoleSwitcherDebugPanel from "./debug/components/RoleSwitcherDebugPanel.svelte";
  import PreviewModeBanner from "./debug/components/PreviewModeBanner.svelte";
  import { initUserPreviewContext } from "./debug/context/user-preview-context";
  import { userPreviewState } from "./debug/state/user-preview-state.svelte";
  import { featureFlagService } from "./auth/services/FeatureFlagService.svelte";
  import ToastContainer from "./toast/components/ToastContainer.svelte";

  // Toast notifications

  // Initialize user preview context for app-wide access
  initUserPreviewContext();

  // Reactive state
  const activeModule = $derived(getActiveTab()); // Using legacy getActiveTab for now
  const isModuleLoading = $derived(activeModule === null);
  // Show banner offset when user preview OR role override is active
  const isPreviewMode = $derived(
    userPreviewState.isActive || !!featureFlagService.debugRoleOverride
  );

  // Desktop sidebar visibility management
  let desktopSidebarVisibility: ReturnType<
    typeof useDesktopSidebarVisibility
  > | null = null;
  const showDesktopSidebar = $derived(desktopSidebarState.isVisible);

  // Primary navigation visibility - only hide in Explorer module during scroll
  const isPrimaryNavVisible = $derived(
    currentModule() === "discover" ? discoverScrollState.isUIVisible : true
  );

  // Sync state to coordinators
  $effect(() => {
    navigationCoordinator.canAccessEditAndExportPanels =
      layoutState.canAccessEditAndExportPanels;
  });

  // Handle reveal navigation from peek indicator
  function handleRevealNav() {
    discoverScrollState.forceShowUI();
  }

  function isTypingTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      target.isContentEditable ||
      target.getAttribute("role") === "textbox"
    );
  }

  function shouldDeferEscapeNavigation(): boolean {
    if (keyboardShortcutState.showCommandPalette) return true;
    if (keyboardShortcutState.showHelp) return true;
    if (hasOpenDrawers()) return true;
    return false;
  }

  const handleGlobalEscape = (event: KeyboardEvent) => {
    if (event.key !== "Escape") return;
    if (isTypingTarget(event.target)) return;
    if (shouldDeferEscapeNavigation()) return;

    const currentModuleId = navigationState.currentModule;
    if (currentModuleId === "dashboard") return;

    event.preventDefault();

    if (currentModuleId === "settings") {
      const previousModule =
        navigationState.previousModule ||
        navigationCoordinator.previousModuleBeforeSettings ||
        "dashboard";
      void handleModuleChange(previousModule as ModuleId);
      return;
    }

    void handleModuleChange("dashboard");
  };

  onMount(() => {
    if (typeof window === "undefined") return;
    // handleHMRInit(); // Disabled - causing HMR verification loops

    // Enable native back/forward by wiring navigation state to history
    initializeNavigationHistory();

    // Initialize deep linking for shareable sequence URLs
    try {
      const deepLinkService = resolve<IDeepLinkService>(TYPES.IDeepLinkService);
      deepLinkService.initialize();
    } catch (error) {
      console.warn("Failed to initialize deep link service:", error);
    }

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
    window.addEventListener("keydown", handleGlobalEscape, true);

    return () => {
      window.removeEventListener("keydown", handleGlobalEscape, true);
      desktopSidebarVisibility?.cleanup();
    };
  });
</script>

<!-- Global Preview Banner -->
<PreviewModeBanner />

<div
  class="main-interface"
  class:nav-landscape={layoutState.isPrimaryNavLandscape}
  class:has-desktop-sidebar={showDesktopSidebar}
  class:has-preview-banner={isPreviewMode}
  style="--primary-nav-height: {layoutState.primaryNavHeight}px; --desktop-sidebar-width: {desktopSidebarState.width}px;"
>
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

  <!-- Content + Navigation Wrapper (flex layout) -->
  <div class="content-wrapper">
    <!-- Main Content Area -->
    <main
      class="content-area"
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
          // Navigate to Dashboard with "pull out" view transition
          const doc = document as any;
          if (typeof doc.startViewTransition === "function") {
            // Set direction for CSS to use reverse animation
            document.documentElement.classList.add("back-transition");

            const transition = doc.startViewTransition(async () => {
              await handleModuleChange("dashboard");
            });

            transition.finished.finally(() => {
              document.documentElement.classList.remove("back-transition");
            });
          } else {
            handleModuleChange("dashboard");
          }
        }}
        onLayoutChange={setPrimaryNavLandscape}
        onHeightChange={setPrimaryNavHeight}
        isUIVisible={isPrimaryNavVisible}
        onRevealNav={handleRevealNav}
      />
    {/if}
  </div>

  <!-- Domain Managers -->
  <PWAInstallationManager />
  <SpotlightRouter />
  <!-- Keyboard Shortcuts -->
  <KeyboardShortcutCoordinator />
  <CommandPalette />
  <ShortcutsHelp />
  <!-- Debug Tools -->
  <RoleSwitcherDebugPanel />
  <!-- Toast Notifications -->
  <ToastContainer />
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
    transition:
      padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      padding-top 0.2s ease;
  }

  /* Desktop sidebar support */
  .main-interface.has-desktop-sidebar {
    padding-left: var(--desktop-sidebar-width, 280px);
  }

  /* Debug banner support (user preview OR role override) - push content down */
  /* Banner height: 56px content + 2px border = 58px total */
  .main-interface.has-preview-banner {
    padding-top: 58px;
  }

  /* Push desktop sidebar down when banner is shown */
  .main-interface.has-preview-banner :global(.desktop-navigation-sidebar) {
    top: 58px;
  }

  @media (max-width: 768px) {
    /* Mobile banner: 48px content + 2px border = 50px total */
    .main-interface.has-preview-banner {
      padding-top: 50px;
    }
  }

  /* Content + Navigation Wrapper - flex container for content and nav */
  .content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-height: 0;
  }

  .content-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    min-height: 0;
  }

  /* Landscape mode - add left padding for side navigation */
  .content-area.nav-landscape {
    padding-left: 72px !important;
    padding-left: max(72px, env(safe-area-inset-left)) !important;
  }

  /* Reset padding when desktop sidebar is visible */
  .main-interface.has-desktop-sidebar .content-area {
    padding-left: 0 !important;
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
