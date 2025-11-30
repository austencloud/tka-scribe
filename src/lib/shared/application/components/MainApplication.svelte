<!-- Main Application Layout -->
<script lang="ts">
  import {
    BackgroundCanvas,
    BackgroundType,
    updateBodyBackground,
  } from "../../background";
  import type { IDeviceDetector } from "../../device";
  import { ErrorScreen } from "../../foundation";
  import AchievementNotificationToast from "../../gamification/components/AchievementNotificationToast.svelte";
  import {
    ensureContainerInitialized,
    isContainerReady,
    resolve,
  } from "../../inversify";
  import { TYPES } from "../../inversify/types";
  import { ThemeService } from "../../theme";

  import type { ISettingsService } from "../../index";
  import type { Container } from "inversify";
  import { getContext, onMount } from "svelte";
  import MainInterface from "../../MainInterface.svelte";
  import AuthSheet from "../../navigation/components/AuthSheet.svelte";
  import PrivacySheet from "../../navigation/components/PrivacySheet.svelte";
  import TermsSheet from "../../navigation/components/TermsSheet.svelte";
  import type {
    ISheetRouterService,
    SheetType,
  } from "../../navigation/services/contracts/ISheetRouterService";
  import SettingsPanel from "../../settings/components/SettingsPanel.svelte";
  import { authStore } from "../../auth";
  import type { IApplicationInitializer } from "../services";
  import {
    getInitializationError,
    getIsInitialized,
    getSettings,
    getShowSettings,
    getShowDebugPanel,
    toggleDebugPanel,
    closeDebugPanel,
    hideSettingsDialog,
    initializeAppState,
    restoreApplicationState,
    setInitializationError,
    setInitializationState,
    showSettingsDialog,
    switchTab,
    updateSettings,
  } from "../state";

  // Get DI container from context
  const getContainer = getContext<() => Container | null>("di-container");

  // Services - resolved lazily
  let initService: IApplicationInitializer | null = $state(null);
  let settingsService: ISettingsService | null = $state(null);
  let deviceService: IDeviceDetector | null = $state(null);
  let sheetRouterService: ISheetRouterService | null = $state(null);
  let servicesResolved = $state(false);

  // App state
  let isInitialized = $derived(getIsInitialized());
  let initializationError = $derived(getInitializationError());
  let settings = $derived(getSettings());

  // Route-based sheet state
  let currentSheetType = $state<SheetType>(null);
  let showRouteBasedSettings = $derived(currentSheetType === "settings");
  let showAuthSheet = $derived(currentSheetType === "auth");
  let showTermsSheet = $derived(currentSheetType === "terms");
  let showPrivacySheet = $derived(currentSheetType === "privacy");

  // Debug panel state (admin-only) - uses centralized UI state
  let showDebugPanel = $derived(getShowDebugPanel());

  // Resolve services when container is available
  $effect(() => {
    const container = getContainer?.();

    if (container && !servicesResolved) {
      (async () => {
        try {
          if (!isContainerReady()) {
            console.warn(
              "Container available but not cached, ensuring initialization..."
            );
            await ensureContainerInitialized();
          }

          if (!servicesResolved) {
            initService = resolve(TYPES.IApplicationInitializer);
            settingsService = resolve(TYPES.ISettingsService);
            deviceService = resolve(TYPES.IDeviceDetector);
            sheetRouterService = resolve(TYPES.ISheetRouterService);
            servicesResolved = true;
          }
        } catch (error) {
          console.error("Failed to resolve services:", error);
          setInitializationError(`Service resolution failed: ${error}`);
        }
      })();
    }
  });

  // Initialize application
  onMount(() => {
    let cleanupSheetListener: (() => void) | null = null;

    // Run async initialization without blocking cleanup function return
    (async () => {
      try {
        setInitializationState(false, true, null, 0);
        await ensureContainerInitialized();
        await initializeAppState();

        const container = getContainer?.();
        if (!container) {
          console.error("No DI container available");
          setInitializationError("No DI container available");
          return;
        }

        // Wait for services to be resolved with timeout
        let waitCount = 0;
        const MAX_WAIT = 500; // 5 seconds max
        while (!servicesResolved && waitCount < MAX_WAIT) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          waitCount++;
        }

        if (!servicesResolved) {
          console.error("Service resolution timeout");
          setInitializationError(
            "Service resolution timeout - services failed to initialize"
          );
          return;
        }

        if (!initService || !settingsService || !deviceService || !sheetRouterService) {
          console.error("Services not properly resolved");
          setInitializationError("Services not properly resolved");
          return;
        }

        // Initialize sheet router state (now that service is resolved)
        currentSheetType = sheetRouterService.getCurrentSheet();
        cleanupSheetListener = sheetRouterService.onRouteChange((state) => {
          currentSheetType = state.sheet ?? null;

          // Sync with legacy settings dialog state
          if (state.sheet === "settings") {
            if (!getShowSettings()) {
              showSettingsDialog();
            }
          } else if (state.sheet === null && getShowSettings()) {
            hideSettingsDialog();
          }
        });

        await restoreApplicationState();
        await initService.initialize();
        await settingsService.loadSettings();
        updateSettings(settingsService.currentSettings);
        ThemeService.initialize();

        // Initialize gamification system
        try {
          const { initializeGamification } = await import(
            "../../gamification/init/gamification-initializer"
          );
          await initializeGamification();
        } catch (gamError) {
          console.error(
            "⚠️ Gamification failed to initialize (non-blocking):",
            gamError
          );
        }

        setInitializationState(true, false, null, 0);
      } catch (error) {
        console.error("Application initialization failed:", error);
        setInitializationError(
          error instanceof Error
            ? error.message
            : "Unknown initialization error"
        );
      }
    })();

    return () => {
      cleanupSheetListener?.();
    };
  });

  // Handle keyboard shortcuts
  $effect(() => {
    function handleKeydown(event: KeyboardEvent) {
      // Debug panel toggle (Ctrl/Cmd + `) - Admin only
      if ((event.ctrlKey || event.metaKey) && event.key === "`") {
        event.preventDefault();
        if (authStore.isAdmin) {
          toggleDebugPanel();
        }
        return;
      }

      // Settings dialog toggle (Ctrl/Cmd + ,)
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        if (getShowSettings() || currentSheetType === "settings") {
          sheetRouterService?.closeSheet();
          hideSettingsDialog();
        } else {
          sheetRouterService?.openSheet("settings");
          showSettingsDialog();
        }
      }

      // Tab navigation (Ctrl/Cmd + 1-6)
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            switchTab("create");
            break;
          case "2":
            event.preventDefault();
            switchTab("discover");
            break;
          case "3":
            event.preventDefault();
            switchTab("community");
            break;
          case "4":
            event.preventDefault();
            switchTab("learn");
            break;
          case "5":
            event.preventDefault();
            switchTab("animate");
            break;
          case "6":
            event.preventDefault();
            switchTab("train");
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });

  // Watch for background type changes and update body background immediately
  $effect(() => {
    const backgroundType = settings.backgroundType;
    if (backgroundType && isInitialized) {
      updateBodyBackground(backgroundType);
      ThemeService.updateTheme(backgroundType);
    }
  });
</script>

<svelte:head>
  <title>TKA Studio - Flow Arts Choreography Tool</title>
  <meta
    name="description"
    content="TKA Studio is a revolutionary flow arts choreography toolbox for staffs, fans, and other flow arts. Create, learn, and share movement sequences using The Kinetic Alphabet notation system."
  />
</svelte:head>

<!-- Application Container -->
<div class="tka-app" data-testid="tka-application">
  <!-- Background Canvas - Uses reactive settings -->
  {#if settings.backgroundEnabled}
    <BackgroundCanvas
      backgroundType={settings.backgroundType || BackgroundType.NIGHT_SKY}
      quality={settings.backgroundQuality || "medium"}
      backgroundColor={settings.backgroundColor || "#000000"}
      {...settings.gradientColors
        ? { gradientColors: settings.gradientColors }
        : {}}
      {...settings.gradientDirection !== undefined
        ? { gradientDirection: settings.gradientDirection }
        : {}}
    />
  {/if}

  {#if initializationError}
    <ErrorScreen
      error={initializationError}
      onRetry={() => window.location.reload()}
    />
  {:else}
    <!-- Main Interface - Always shown, progressive loading inside -->
    <MainInterface />

    <!-- Settings slide panel (route-aware) -->
    <SettingsPanel isOpen={getShowSettings() || showRouteBasedSettings} />

    <!-- Auth sheet (route-based) -->
    <AuthSheet isOpen={showAuthSheet} onClose={() => sheetRouterService?.closeSheet()} />

    <!-- Terms sheet (route-based) -->
    <TermsSheet isOpen={showTermsSheet} onClose={() => sheetRouterService?.closeSheet()} />

    <!-- Privacy sheet (route-based) -->
    <PrivacySheet isOpen={showPrivacySheet} onClose={() => sheetRouterService?.closeSheet()} />

    <!-- Gamification Toast Notifications -->
    <AchievementNotificationToast />


  {/if}
</div>

<style>
  .tka-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
    background: transparent;
    --text-color: rgba(255, 255, 255, 0.95);
    --foreground: rgba(255, 255, 255, 0.95);
    --muted-foreground: rgba(255, 255, 255, 0.7);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .tka-app {
      /* Dynamic viewport height for mobile app */
      min-height: 100dvh;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .tka-app {
      transition: none;
    }
  }

  /* High contrast mode */
  @media (prefers-contrast: high) {
    .tka-app {
      --text-color: white;
      --foreground: white;
    }
  }

  /* Print styles */
  @media print {
    .tka-app {
      min-height: auto;
      overflow: visible;
    }
  }
</style>
