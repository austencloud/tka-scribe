<!-- Main Application Layout -->
<script lang="ts">
  import AchievementNotificationToast from "../../gamification/components/AchievementNotificationToast.svelte";
  import XPToast from "../../gamification/components/XPToast.svelte";
  import QuickFeedbackPanel from "$lib/features/feedback/components/quick/QuickFeedbackPanel.svelte";
  import AnnouncementChecker from "$lib/features/admin/components/AnnouncementChecker.svelte";
  import { ErrorModal } from "../../error";

  import { TYPES } from "../../inversify/types";

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
  import { authStore } from "../../auth/stores/authStore.svelte";
  import ErrorScreen from "../../foundation/ui/ErrorScreen.svelte";
  import type { ISettingsState } from "../../settings/services/contracts/ISettingsState";
  import { ThemeService } from "../../theme/services/ThemeService";
  import type { IApplicationInitializer } from "../services/contracts/IApplicationInitializer";
  import {
    getSettings,
    restoreApplicationState,
    updateSettings,
  } from "../state/app-state.svelte";
  import {
    getIsInitialized,
    getInitializationError,
    setInitializationError,
    setInitializationState,
    initializeAppState,
  } from "../state/initialization-state.svelte";
  import type { IDeviceDetector } from "../../device/services/contracts/IDeviceDetector";
  import BackgroundCanvas from "../../background/shared/components/BackgroundCanvas.svelte";
  import { BackgroundType } from "../../background/shared/domain/enums/background-enums";
  import {
    getShowDebugPanel,
    toggleDebugPanel,
  } from "../state/ui/ui-state.svelte";
  import { switchModule } from "../state/ui/module-state";
  import { navigationState } from "../../navigation/state/navigation-state.svelte";
  import type { ModuleId } from "../../navigation/domain/types";
  import { handleModuleChange } from "../../navigation-coordinator/navigation-coordinator.svelte";
  import {
    ensureContainerInitialized,
    resolve,
    isContainerReady,
  } from "../../inversify/di";

  // Get DI container from context
  const getContainer = getContext<() => Container | null>("di-container");

  // Services - resolved lazily
  let initService: IApplicationInitializer | null = $state(null);
  let settingsService: ISettingsState | null = $state(null);
  let deviceService: IDeviceDetector | null = $state(null);
  let sheetRouterService: ISheetRouterService | null = $state(null);
  let servicesResolved = $state(false);

  // App state
  let isInitialized = $derived(getIsInitialized());
  let initializationError = $derived(getInitializationError());
  let settings = $derived(getSettings());

  // Route-based sheet state
  let currentSheetType = $state<SheetType>(null);
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
            settingsService = resolve(TYPES.ISettingsState);
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

        if (
          !initService ||
          !settingsService ||
          !deviceService ||
          !sheetRouterService
        ) {
          console.error("Services not properly resolved");
          setInitializationError("Services not properly resolved");
          return;
        }

        // Initialize sheet router state (now that service is resolved)
        currentSheetType = sheetRouterService.getCurrentSheet();

        // Check for legacy ?sheet=settings URL and redirect to settings module
        if (currentSheetType === "settings") {
          sheetRouterService.closeSheet();
          await handleModuleChange("settings" as ModuleId);
        }

        cleanupSheetListener = sheetRouterService.onRouteChange(
          async (state) => {
            // Redirect legacy ?sheet=settings to settings module
            if (state.sheet === "settings") {
              sheetRouterService?.closeSheet();
              await handleModuleChange("settings" as ModuleId);
              return;
            }

            currentSheetType = state.sheet ?? null;
          }
        );

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

      // Settings module toggle (Ctrl/Cmd + ,)
      if ((event.ctrlKey || event.metaKey) && event.key === ",") {
        event.preventDefault();
        // Toggle behavior: if in settings, go back to previous module
        if (navigationState.currentModule === "settings") {
          const previousModule = navigationState.previousModule || "dashboard";
          switchModule(previousModule as ModuleId);
        } else {
          switchModule("settings" as ModuleId);
        }
        return;
      }

      // Tab navigation (Ctrl/Cmd + 1-6)
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            switchModule("create");
            break;
          case "2":
            event.preventDefault();
            switchModule("discover");
            break;
          case "3":
            event.preventDefault();
            switchModule("learn");
            break;
          case "4":
            event.preventDefault();
            switchModule("compose");
            break;
          case "5":
            event.preventDefault();
            switchModule("train");
            break;
          case "6":
            event.preventDefault();
            switchModule("library");
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  });

  // Create a serialized key for background settings to detect actual changes
  const backgroundSettingsKey = $derived(
    JSON.stringify({
      type: settings.backgroundType,
    })
  );

  // Watch for background changes to update theme (CSS variable updates handled by SettingsState)
  $effect(() => {
    // Track only the serialized key to detect actual value changes
    const key = backgroundSettingsKey;
    const initialized = isInitialized;

    if (!initialized) return;

    // Parse the key back to get values (avoids re-reading reactive state)
    const parsed = JSON.parse(key) as {
      type: BackgroundType;
    };

    if (parsed.type) {
      // Only update theme - SettingsState handles updateBodyBackground
      ThemeService.updateTheme(parsed.type);
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

    <!-- Auth sheet (route-based) -->
    <AuthSheet
      isOpen={showAuthSheet}
      onClose={() => sheetRouterService?.closeSheet()}
    />

    <!-- Terms sheet (route-based) -->
    <TermsSheet
      isOpen={showTermsSheet}
      onClose={() => sheetRouterService?.closeSheet()}
    />

    <!-- Privacy sheet (route-based) -->
    <PrivacySheet
      isOpen={showPrivacySheet}
      onClose={() => sheetRouterService?.closeSheet()}
    />

    <!-- Gamification Toast Notifications -->
    <AchievementNotificationToast />
    <XPToast />

    <!-- Quick Feedback Panel (desktop hotkey: f) -->
    <QuickFeedbackPanel />

    <!-- System Announcements Modal -->
    <AnnouncementChecker />

    <!-- Global Error Modal -->
    <ErrorModal />
  {/if}
</div>

<style>
  .tka-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    position: relative;
    z-index: 2; /* Above body::after transition layer (z-index: 1) */
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
