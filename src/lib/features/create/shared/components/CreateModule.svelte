<script lang="ts">
  /**
   * CreateModule - Composition Root for Create Module
   * See: docs/architecture/create-module-composition-root.md for detailed architecture documentation
   *
   * Domain: Create module - Composition Root
   */

  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import {
    ensureContainerInitialized,
    resolve,
    TYPES,
  } from "$lib/shared/inversify/di";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import type { BuildModeId } from "$lib/shared/foundation/ui/UITypes";
  import type { PictographData } from "$lib/shared/pictograph/shared/domain/models/PictographData";
  import {
    setAnyPanelOpen,
    setSideBySideLayout,
  } from "$lib/shared/application/state/animation-visibility-state.svelte";
  import { getSettings } from "$lib/shared/application/state/app-state.svelte";
  import { onMount, setContext, tick } from "svelte";
  import { sharedAnimationState } from "$lib/shared/animation-engine/state/shared-animation-state.svelte";
  import ErrorBanner from "./ErrorBanner.svelte";
  import type { CreateModuleServices } from "../services/ServiceInitializer";
  import type { ICreateModuleInitializationService } from "../services/contracts/ICreateModuleInitializationService";
  import type { ICreateModuleHandlers } from "../services/contracts/ICreateModuleHandlers";
  import type { ICreationMethodPersistenceService } from "../services/contracts/ICreationMethodPersistenceService";
  import type { ICreateModuleEffectCoordinator } from "../services/contracts/ICreateModuleEffectCoordinator";
  import type { createCreateModuleState as CreateModuleStateType } from "../state/create-module-state.svelte";
  import type { createConstructTabState as ConstructTabStateType } from "../state/construct-tab-state.svelte";
  import { createPanelCoordinationState } from "../state/panel-coordination-state.svelte";
  import { setCreateModuleStateRef } from "../state/create-module-state-ref.svelte";
  import type { IToolPanelMethods } from "../types/create-module-types";
  import HandPathSettingsView from "./HandPathSettingsView.svelte";
  import TransferConfirmDialog from "./TransferConfirmDialog.svelte";
  import StandardWorkspaceLayout from "./StandardWorkspaceLayout.svelte";
  import CreationMethodSelector from "../workspace-panel/components/CreationMethodSelector.svelte";
  import AnimationSheetCoordinator from "../../../../shared/coordinators/AnimationSheetCoordinator.svelte";
  import { setCreateModuleContext } from "../context/create-module-context";
  import CAPCoordinator from "./coordinators/CAPCoordinator.svelte";
  import EditCoordinator from "./coordinators/EditCoordinator.svelte";
  import CustomizeCoordinator from "./coordinators/CustomizeCoordinator.svelte";
  import SequenceActionsCoordinator from "./coordinators/SequenceActionsCoordinator.svelte";
  import ShareCoordinator from "./coordinators/ShareCoordinator.svelte";
  import VideoRecordCoordinator from "./coordinators/VideoRecordCoordinator.svelte";
  import { SessionManager } from "../services/SessionManager.svelte";
  import { AutosaveService } from "../services/AutosaveService";
  import { SequencePersistenceService } from "../services/SequencePersistenceService";

  const logger = createComponentLogger("CreateModule");

  type CreateModuleState = ReturnType<typeof CreateModuleStateType>;
  type ConstructTabState = ReturnType<typeof ConstructTabStateType>;

  // ============================================================================
  // PROPS
  // ============================================================================
  let {
    onTabAccessibilityChange,
    onCurrentWordChange,
  }: {
    onTabAccessibilityChange?: (canAccessEditAndExport: boolean) => void;
    onCurrentWordChange?: (word: string) => void;
  } = $props();

  // ============================================================================
  // SERVICES & STATE (Resolved via DI)
  // ============================================================================
  let services: CreateModuleServices | null = $state(null);
  let handlers: ICreateModuleHandlers | null = $state(null);
  let creationMethodPersistence: ICreationMethodPersistenceService | null =
    $state(null);
  let effectCoordinator: ICreateModuleEffectCoordinator | null = $state(null);
  let CreateModuleState: CreateModuleState | null = $state(null);
  let constructTabState: ConstructTabState | null = $state(null);

  // Session management services
  let sessionManager: SessionManager | null = $state(null);
  let autosaveService: AutosaveService | null = $state(null);
  let sequencePersistenceService: SequencePersistenceService | null =
    $state(null);

  // ============================================================================
  // COMPONENT STATE
  // ============================================================================
  let panelState = createPanelCoordinationState();
  let animatingBeatNumber = $state<number | null>(null);
  let shouldUseSideBySideLayout = $state<boolean>(false);
  let error = $state<string | null>(null);
  let servicesInitialized = $state<boolean>(false);
  let hasSelectedCreationMethod = $state(false);

  // Transfer confirmation dialog state
  let showTransferConfirmation = $state(false);
  let isMobile = $state(false);
  let sequenceToTransfer: PictographData[] | null = $state(null);
  let toolPanelElement: HTMLElement | null = $state(null);
  let toolPanelRef: IToolPanelMethods | null = $state(null);
  let buttonPanelElement: HTMLElement | null = $state(null);
  let assemblyTabKey = $state(0); // Changes when assembly tab needs to reset
  let effectCleanup: (() => void) | null = null;
  let deepLinkProcessed = $state(false); // Track if deep link has been processed
  let currentDisplayWord = $state<string>(""); // Current word with contextual messages

  // ============================================================================
  // CONTEXT PROVISION
  // ============================================================================
  setContext("panelState", panelState);

  const layoutContext = {
    get shouldUseSideBySideLayout() {
      return shouldUseSideBySideLayout;
    },
    isMobilePortrait() {
      return services?.layoutService?.isMobilePortrait() ?? false;
    },
  };

  setCreateModuleContext({
    get CreateModuleState() {
      if (!CreateModuleState) {
        throw new Error("CreateModuleState not yet initialized");
      }
      return CreateModuleState;
    },
    get constructTabState() {
      if (!constructTabState) {
        throw new Error("constructTabState not yet initialized");
      }
      return constructTabState;
    },
    panelState,
    get services() {
      if (!services) {
        throw new Error("Services not yet initialized");
      }
      return services;
    },
    get sessionManager() {
      return sessionManager;
    },
    get autosaveService() {
      return autosaveService;
    },
    get sequencePersistenceService() {
      return sequencePersistenceService;
    },
    get assemblyTabKey() {
      return assemblyTabKey;
    },
    layout: layoutContext,
    handlers: {
      onError: (err: string) => {
        error = err;
      },
    },
  });

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  // ============================================================================
  // REACTIVE EFFECTS
  // ============================================================================

  // Sync creation method selector visibility to navigation
  // Show selector ONLY if:
  // 1. User has never selected a creation method AND
  // 2. We're NOT currently on a creation method tab AND
  // 3. Workspace is empty
  $effect(() => {
    if (
      !CreateModuleState?.isPersistenceInitialized ||
      !creationMethodPersistence
    )
      return;

    // Check if we're on a creation method tab
    const activeTab = navigationState.activeTab;
    const isOnCreationMethodTab =
      activeTab === "assembler" ||
      activeTab === "constructor" ||
      activeTab === "generator";

    // If we're on a creation method tab, ensure the flag is set
    if (isOnCreationMethodTab && !hasSelectedCreationMethod) {
      hasSelectedCreationMethod = true;
      creationMethodPersistence.markMethodSelected();
    }

    // Only show selector if NOT on a creation tab and method never selected
    const shouldShow = !hasSelectedCreationMethod && !isOnCreationMethodTab;

    navigationState.setCreationMethodSelectorVisible(shouldShow);
  });

  // Notify parent of tab accessibility changes
  $effect(() => {
    if (!CreateModuleState) return;
    const canAccess = CreateModuleState.canAccessEditTab;
    if (onTabAccessibilityChange) {
      onTabAccessibilityChange(canAccess);
    }
  });

  // Sync panel states and layout to global state
  $effect(() => {
    setAnyPanelOpen(panelState.isAnyPanelOpen);
    setSideBySideLayout(shouldUseSideBySideLayout);
  });

  // Sync animating beat number from shared animation state
  // This ensures beat grid highlights current beat when animation plays
  $effect(() => {
    const currentBeat = sharedAnimationState.currentBeat;
    if (sharedAnimationState.isPlaying || currentBeat > 0) {
      animatingBeatNumber = Math.floor(currentBeat) + 1;
    } else {
      animatingBeatNumber = null;
    }
  });

  // Track previous module and tab to detect navigation changes
  let previousModule = $state<string | null>(null);
  let previousTab = $state<string | null>(null);

  // Track previous panel open state to detect user-initiated closes
  let previousPanelOpen = $state<string | null>(null);

  // Clear saved panel state when user explicitly closes a panel (not due to navigation)
  $effect(() => {
    const currentModule = navigationState.currentModule;

    // Only track while we're in the create module
    if (currentModule !== "create") return;

    // Determine current open panel
    let currentPanelOpen: string | null = null;
    if (panelState.isAnimationPanelOpen) currentPanelOpen = "animation";
    else if (panelState.isEditPanelOpen) currentPanelOpen = "edit";
    else if (panelState.isSharePanelOpen) currentPanelOpen = "share";
    else if (panelState.isVideoRecordPanelOpen)
      currentPanelOpen = "videoRecord";
    else if (panelState.isFilterPanelOpen) currentPanelOpen = "filter";
    else if (panelState.isSequenceActionsPanelOpen)
      currentPanelOpen = "sequenceActions";
    else if (panelState.isCAPPanelOpen) currentPanelOpen = "cap";
    else if (panelState.isCustomizePanelOpen) currentPanelOpen = "customize";

    // If a panel was open and is now closed (user closed it), clear the saved state
    if (previousPanelOpen !== null && currentPanelOpen === null) {
      logger.log(
        `Panel "${previousPanelOpen}" was closed by user, clearing saved state for tab`
      );
      navigationState.clearPanelForTab(); // Clears for current module:tab
    }

    previousPanelOpen = currentPanelOpen;
  });

  // Persist and close panels when navigating away from create module OR switching tabs
  // This ensures panels animate away gracefully and can be restored when returning
  $effect(() => {
    const currentModule = navigationState.currentModule;
    const currentTab = navigationState.activeTab;

    // Only act when module or tab actually changes (not on initial render)
    const moduleChanged =
      previousModule !== null && currentModule !== previousModule;
    const tabChanged =
      previousTab !== null &&
      currentTab !== previousTab &&
      currentModule === "create";

    if (moduleChanged || tabChanged) {
      // Save which panel was open before closing (for panel persistence)
      if (
        panelState.isAnyPanelOpen &&
        previousModule === "create" &&
        previousTab
      ) {
        // Determine which panel is currently open and save it
        let openPanelId: string | null = null;
        if (panelState.isAnimationPanelOpen) openPanelId = "animation";
        else if (panelState.isEditPanelOpen) openPanelId = "edit";
        else if (panelState.isSharePanelOpen) openPanelId = "share";
        else if (panelState.isVideoRecordPanelOpen) openPanelId = "videoRecord";
        else if (panelState.isFilterPanelOpen) openPanelId = "filter";
        else if (panelState.isSequenceActionsPanelOpen)
          openPanelId = "sequenceActions";
        else if (panelState.isCAPPanelOpen) openPanelId = "cap";
        else if (panelState.isCustomizePanelOpen) openPanelId = "customize";

        if (openPanelId) {
          logger.log(
            `Saving open panel "${openPanelId}" for tab "${previousModule}:${previousTab}"`
          );
          navigationState.setLastPanelForTab(
            openPanelId,
            previousModule as any,
            previousTab
          );
        }
      }

      // Close all panels when navigating away or switching tabs
      if (panelState.isAnyPanelOpen) {
        if (moduleChanged) {
          logger.log(
            `Module changed from ${previousModule} to ${currentModule}, closing all panels`
          );
        } else {
          logger.log(
            `Tab changed from ${previousTab} to ${currentTab}, closing all panels`
          );
        }
        panelState.closeEditPanel();
        panelState.closeAnimationPanel();
        panelState.closeSharePanel();
        panelState.closeVideoRecordPanel();
        panelState.closeFilterPanel();
        panelState.closeSequenceActionsPanel();
        panelState.closeCAPPanel();
        panelState.closeCustomizePanel();
      }

      // Restore panel for the new tab (if returning to create module or switching tabs within it)
      // Only restore if there's actually a sequence to work with (canAccessEditTab)
      if (
        currentModule === "create" &&
        !panelState.isAnyPanelOpen &&
        CreateModuleState?.canAccessEditTab
      ) {
        const savedPanel = navigationState.getLastPanelForTab(
          "create",
          currentTab
        );
        if (savedPanel) {
          logger.log(
            `Restoring saved panel "${savedPanel}" for tab "create:${currentTab}"`
          );
          // Use setTimeout to allow panel close animation to complete first
          setTimeout(() => {
            switch (savedPanel) {
              case "animation":
                panelState.openAnimationPanel();
                break;
              case "share":
                panelState.openSharePanel();
                break;
              case "videoRecord":
                panelState.openVideoRecordPanel();
                break;
              case "filter":
                panelState.openFilterPanel();
                break;
              case "sequenceActions":
                panelState.openSequenceActionsPanel();
                break;
              // Note: edit and cap panels require additional context (beat data, CAP type)
              // so we skip restoring those - they need user interaction to open
            }
          }, 100);
        }
      }
    }

    previousModule = currentModule;
    previousTab = currentTab;
  });

  // Setup all managed effects using EffectCoordinator (includes URL sync)
  $effect(() => {
    if (
      !servicesInitialized ||
      !CreateModuleState ||
      !constructTabState ||
      !services ||
      !effectCoordinator
    ) {
      return;
    }

    if (effectCleanup) {
      effectCleanup();
      effectCleanup = null;
    }

    effectCleanup = effectCoordinator.setupEffects({
      CreateModuleState,
      constructTabState,
      panelState,
      navigationState,
      layoutService: services.layoutService,
      navigationSyncService: services.navigationSyncService,
      hasSelectedCreationMethod: () => hasSelectedCreationMethod,
      onLayoutChange: (layout) => {
        shouldUseSideBySideLayout = layout;
        setSideBySideLayout(layout);
      },
      onCurrentWordChange: (word: string) => {
        currentDisplayWord = word;
        onCurrentWordChange?.(word);
      },
      toolPanelElement,
      buttonPanelElement,
    });

    return () => {
      if (effectCleanup) {
        effectCleanup();
        effectCleanup = null;
      }
    };
  });

  // Watch for prop type changes in settings and bulk update all motions
  let previousBluePropType = $state<string | undefined>(undefined);
  let previousRedPropType = $state<string | undefined>(undefined);

  $effect(() => {
    if (!servicesInitialized || !CreateModuleState || !services) return;

    const settings = getSettings();
    const newBluePropType = settings.bluePropType;
    const newRedPropType = settings.redPropType;

    // Update blue prop type if changed
    if (
      newBluePropType &&
      newBluePropType !== previousBluePropType &&
      previousBluePropType !== undefined
    ) {
      logger.log(
        `Blue prop type changed to ${newBluePropType}, bulk updating sequence`
      );
      services.beatOperationsService.bulkUpdatePropType(
        "blue",
        newBluePropType,
        CreateModuleState
      );
    }
    previousBluePropType = newBluePropType;

    // Update red prop type if changed
    if (
      newRedPropType &&
      newRedPropType !== previousRedPropType &&
      previousRedPropType !== undefined
    ) {
      logger.log(
        `Red prop type changed to ${newRedPropType}, bulk updating sequence`
      );
      services.beatOperationsService.bulkUpdatePropType(
        "red",
        newRedPropType,
        CreateModuleState
      );
    }
    previousRedPropType = newRedPropType;
  });

  // Mark autosave as dirty when sequence changes
  $effect(() => {
    if (CreateModuleState?.sequenceState.currentSequence && autosaveService) {
      autosaveService.markDirty();
    }
  });

  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  onMount(() => {
    let checkIsMobile: (() => void) | null = null;

    // Run async initialization in an IIFE
    (async () => {
      if (!ensureContainerInitialized()) {
        error = "Dependency injection container not initialized";
        return;
      }

      // Track if a deep link was processed (declared once for entire async scope)
      let hasDeepLink = false;

      try {
        const initService = resolve<ICreateModuleInitializationService>(
          TYPES.ICreateModuleInitializationService
        );

        const result = await initService.initialize();

        // Extract all services and state from initialization result
        services = {
          sequenceService: result.sequenceService,
          sequencePersistenceService: result.sequencePersistenceService,
          startPositionService: result.startPositionService,
          CreateModuleService: result.CreateModuleService,
          layoutService: result.layoutService,
          navigationSyncService: result.navigationSyncService,
          beatOperationsService: result.beatOperationsService,
          shareService: result.shareService,
        };

        CreateModuleState = result.CreateModuleState;
        constructTabState = result.constructTabState;

        // Extract UI coordination services from result (no manual resolution needed)
        handlers = result.handlers;
        creationMethodPersistence = result.creationMethodPersistence;
        effectCoordinator = result.effectCoordinator;

        // Ensure state is initialized before setting reference
        if (!CreateModuleState || !constructTabState) {
          throw new Error(
            "Failed to initialize CreateModuleState or constructTabState"
          );
        }

        // Set global reference for keyboard shortcuts
        setCreateModuleStateRef({
          CreateModuleState,
          constructTabState,
          panelState,
        });

        hasSelectedCreationMethod =
          creationMethodPersistence.hasUserSelectedMethod();
        servicesInitialized = true;

        initService.configureEventCallbacks(CreateModuleState, panelState);

        // Initialize session management
        sessionManager = new SessionManager();
        autosaveService = new AutosaveService();
        sequencePersistenceService = new SequencePersistenceService();

        // Create a new session for this editing session
        await sessionManager.createSession();

        // Start autosave interval (every 30 seconds)
        autosaveService.startAutosave(
          () => CreateModuleState?.sequenceState.currentSequence || null,
          sessionManager.getCurrentSession()?.sessionId || "",
          30000
        );

        logger.success("Session management initialized");

        // Auto-detect if method was already selected (handles page refreshes)
        const detectedSelection = initService.detectCreationMethodSelection(
          navigationState.activeTab,
          CreateModuleState.isWorkspaceEmpty(),
          hasSelectedCreationMethod
        );
        if (detectedSelection && !hasSelectedCreationMethod) {
          hasSelectedCreationMethod = true;
          creationMethodPersistence.markMethodSelected();
        }

        logger.success("CreateModule initialized successfully");

        // Load sequence from deep link or pending edit, then initialize persistence
        await tick(); // Ensure DOM is ready
        const loadResult =
          await initService.loadSequenceAndInitializePersistence(
            (sequence) =>
              CreateModuleState!.sequenceState.setCurrentSequence(sequence),
            () => CreateModuleState!.initializeWithPersistence()
          );

        if (loadResult.sequenceLoaded) {
          // Mark that a creation method has been selected
          if (
            loadResult.shouldMarkMethodSelected &&
            !hasSelectedCreationMethod
          ) {
            hasSelectedCreationMethod = true;
            creationMethodPersistence.markMethodSelected();
          }

          // Navigate to target tab if specified (deep link only)
          if (loadResult.targetTab) {
            navigationState.setActiveTab(loadResult.targetTab);
          }

          hasDeepLink = true;
        }

        // Mark deep link as processed (allow URL syncing now)
        deepLinkProcessed = true;

        // Check if there's a share deep link waiting to be processed by ShareCoordinator
        // If so, don't restore panels from localStorage - let the share deep link take priority
        const hasShareDeepLink = initService.hasShareDeepLink?.() ?? false;

        // Restore previously open panel if returning to create module
        // Only restore if no deep link was processed (deep link takes priority)
        // AND no share deep link is waiting (share coordinator will handle it)
        // AND there's actually a sequence to work with (canAccessEditTab)
        if (
          !hasDeepLink &&
          !hasShareDeepLink &&
          CreateModuleState.canAccessEditTab
        ) {
          const currentTab = navigationState.activeTab;
          const savedPanel = navigationState.getLastPanelForTab(
            "create",
            currentTab
          );
          if (savedPanel) {
            logger.log(
              `Restoring saved panel "${savedPanel}" for tab "create:${currentTab}"`
            );
            // Use tick to ensure UI is ready before opening panel
            await tick();
            switch (savedPanel) {
              case "animation":
                panelState.openAnimationPanel();
                break;
              case "share":
                panelState.openSharePanel();
                break;
              case "videoRecord":
                panelState.openVideoRecordPanel();
                break;
              case "filter":
                panelState.openFilterPanel();
                break;
              case "sequenceActions":
                panelState.openSequenceActionsPanel();
                break;
              // Note: edit and cap panels require additional context (beat data, CAP type)
              // so we skip restoring those - they need user interaction to open
            }
          }
        }

        // Detect if we're on mobile for responsive dialog rendering
        checkIsMobile = () => {
          isMobile = window.innerWidth < 768;
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
      } catch (err) {
        error =
          err instanceof Error
            ? err.message
            : "Failed to initialize CreateModule";
        console.error("CreateModule: Initialization error:", err);
      }
    })();

    // Return cleanup function synchronously (required for Svelte 5 onMount)
    return () => {
      if (checkIsMobile) {
        window.removeEventListener("resize", checkIsMobile);
      }
      setCreateModuleStateRef(null);

      // Cleanup session management
      autosaveService?.stopAutosave();
      sessionManager?.abandonSession();
    };
  });

  // ============================================================================
  // EVENT HANDLERS (Delegated to Services)
  // ============================================================================
  async function handleOptionSelected(option: PictographData): Promise<void> {
    if (!handlers) {
      error = "Handlers service not initialized";
      return;
    }
    try {
      await handlers.handleOptionSelected(option);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to select option";
    }
  }

  function clearError() {
    error = null;
  }

  function handlePlayAnimation() {
    if (!handlers) return;
    handlers.handlePlayAnimation(panelState);
  }

  function handleOpenSharePanel() {
    if (!handlers) return;
    handlers.handleOpenSharePanel(panelState);
  }

  function handleOpenVideoRecordPanel() {
    if (!handlers) return;
    handlers.handleOpenVideoRecordPanel(panelState);
  }

  async function handleCreationMethodSelected(method: BuildModeId) {
    if (!handlers || !creationMethodPersistence) return;

    // FIRST: Set the active tab (but keep selector visible)
    navigationState.setActiveTab(method);
    CreateModuleState?.clearUndoHistory();

    // Wait for Svelte to apply DOM updates
    await tick();

    // Wait multiple frames to ensure effects have completed and tool panel has fully rendered
    // Frame 1: Effect is scheduled
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Frame 2: Effect executes and updates DOM
    await new Promise((resolve) => requestAnimationFrame(resolve));
    // Frame 3: Browser paints the new content
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // THEN: Mark as selected (which triggers the crossfade via effect)
    hasSelectedCreationMethod = true;
    creationMethodPersistence.markMethodSelected();
  }

  async function handleClearSequence() {
    if (
      !handlers ||
      !CreateModuleState ||
      !constructTabState ||
      !creationMethodPersistence
    )
      return;

    try {
      await handlers.handleClearSequence({
        CreateModuleState,
        constructTabState,
        panelState,
        resetCreationMethodSelection: () => {
          hasSelectedCreationMethod = false;
          creationMethodPersistence!.resetSelection();
        },
        shouldResetCreationMethod: false, // Keep creation mode selected, just reset to start position picker
      });

      // Force assembly tab to remount with fresh state
      assemblyTabKey++;
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to clear sequence";
    }
  }

  function handleOpenFilterPanel() {
    if (!handlers) return;
    handlers.handleOpenFilterPanel(panelState);
  }

  function handleOpenSequenceActions() {
    if (!handlers) return;
    handlers.handleOpenSequenceActions(panelState);
  }

  /**
   * Transfer sequence to Constructor workspace
   */
  async function transferSequenceToConstructor(sequence: any) {
    if (!services || !CreateModuleState) return;

    try {
      // Save the sequence to Constructor's localStorage key
      await services.sequencePersistenceService.saveCurrentState({
        currentSequence: sequence,
        selectedStartPosition: sequence.beats[0] || null,
        hasStartPosition: sequence.beats.length > 0,
        activeBuildSection: "constructor",
      });

      // Switch to Constructor tab
      navigationState.setActiveTab("constructor");

      console.log("✓ Transferred sequence to Constructor for editing");
    } catch (error) {
      console.error("❌ Failed to transfer sequence to Constructor:", error);
    }
  }

  /**
   * Handle confirmation of sequence transfer
   */
  async function handleConfirmTransfer() {
    if (!sequenceToTransfer || !CreateModuleState) return;

    const currentSequence = CreateModuleState.sequenceState.currentSequence;
    if (currentSequence) {
      await transferSequenceToConstructor(currentSequence);
    }

    // Reset state
    showTransferConfirmation = false;
    sequenceToTransfer = null;
  }

  /**
   * Handle cancellation of sequence transfer
   */
  function handleCancelTransfer() {
    showTransferConfirmation = false;
    sequenceToTransfer = null;
    console.log("❌ Sequence transfer cancelled by user");
  }
</script>

{#if error}
  <ErrorBanner message={error} onDismiss={clearError} />
{:else if CreateModuleState && constructTabState && services && CreateModuleState.isPersistenceInitialized}
  <div class="create-tab">
    <!-- Hand Path Settings View (Pre-Start State) -->
    {#if navigationState.activeTab === "gestural" && !CreateModuleState?.handPathCoordinator?.isStarted}
      <HandPathSettingsView
        handPathCoordinator={CreateModuleState.handPathCoordinator}
      />
    {:else}
      <!-- Crossfade wrapper for smooth transitions -->
      <div class="transition-wrapper">
        <!-- Creation Method Selector -->
        <div
          class="transition-view"
          class:active={navigationState.isCreationMethodSelectorVisible}
          class:inactive={!navigationState.isCreationMethodSelectorVisible}
        >
          <CreationMethodSelector
            onMethodSelected={handleCreationMethodSelected}
          />
        </div>

        <!-- Standard Workspace/Tool Panel Layout -->
        <div
          class="transition-view"
          class:active={!navigationState.isCreationMethodSelectorVisible}
          class:inactive={navigationState.isCreationMethodSelectorVisible}
        >
          <StandardWorkspaceLayout
            {shouldUseSideBySideLayout}
            {CreateModuleState}
            {panelState}
            {currentDisplayWord}
            bind:animatingBeatNumber
            bind:toolPanelRef
            bind:buttonPanelElement
            bind:toolPanelElement
            onPlayAnimation={handlePlayAnimation}
            onClearSequence={handleClearSequence}
            onShare={handleOpenSharePanel}
            onRecordVideo={handleOpenVideoRecordPanel}
            onSequenceActionsClick={handleOpenSequenceActions}
            onOptionSelected={handleOptionSelected}
            onOpenFilters={handleOpenFilterPanel}
            onCloseFilters={() => {
              panelState.closeFilterPanel();
            }}
          />
        </div>
      </div>
    {/if}
  </div>

  <!-- Edit Coordinator -->
  <EditCoordinator />

  <!-- Share Coordinator -->
  <ShareCoordinator />

  <!-- Video Record Coordinator -->
  <VideoRecordCoordinator />

  <!-- Sequence Actions Coordinator -->
  <SequenceActionsCoordinator />

  <!-- Animation Coordinator - Rendered outside stacking context to appear above navigation -->
  {#if CreateModuleState}
    <AnimationSheetCoordinator
      sequence={CreateModuleState.sequenceState.currentSequence}
      bind:isOpen={panelState.isAnimationPanelOpen}
      bind:animatingBeatNumber
      combinedPanelHeight={panelState.combinedPanelHeight}
    />
  {/if}

  <!-- CAP Coordinator -->
  <CAPCoordinator />

  <!-- Customize Options Coordinator -->
  <CustomizeCoordinator />

  <!-- Sequence Transfer Confirmation Dialog -->
  <TransferConfirmDialog
    bind:isOpen={showTransferConfirmation}
    {isMobile}
    onConfirm={handleConfirmTransfer}
    onCancel={handleCancelTransfer}
  />
{/if}

<style>
  .create-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    transition: background-color 200ms ease-out;
  }

  /* Crossfade transition system */
  .transition-wrapper {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .transition-view {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  .transition-view.active {
    opacity: 1;
    pointer-events: auto;
    z-index: 1;
  }

  .transition-view.inactive {
    opacity: 0;
    pointer-events: none;
    z-index: 0;
  }
</style>
