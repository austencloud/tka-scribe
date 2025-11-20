<script lang="ts">
  /**
   * CreateModule - Composition Root for Create Module
   * See: docs/architecture/create-module-composition-root.md for detailed architecture documentation
   *
   * Domain: Create module - Composition Root
   */

  import {
    createComponentLogger,
    ensureContainerInitialized,
    navigationState,
    resolve,
    TYPES,
    type BuildModeId,
    type PictographData,
    setAnyPanelOpen,
    setSideBySideLayout,
    AnimationSheetCoordinator,
    Drawer,
    ConfirmDialog,
  } from "$shared";
  import { onMount, setContext, tick } from "svelte";
  import ErrorBanner from "./ErrorBanner.svelte";
  import type { CreateModuleServices } from "../services/ServiceInitializer";
  import type { ICreateModuleInitializationService } from "../services/contracts/ICreateModuleInitializationService";
  import type { ICreateModuleHandlers } from "../services/contracts/ICreateModuleHandlers";
  import type { ICreationMethodPersistenceService } from "../services/contracts/ICreationMethodPersistenceService";
  import type { ICreateModuleEffectCoordinator } from "../services/contracts/ICreateModuleEffectCoordinator";
  import type { createCreateModuleState as CreateModuleStateType } from "../state/create-module-state.svelte";
  import type { createConstructTabState as ConstructTabStateType } from "../state/construct-tab-state.svelte";
  import { setCreateModuleContext } from "../context";
  import { createPanelCoordinationState } from "../state/panel-coordination-state.svelte";
  import { setCreateModuleStateRef } from "../state/create-module-state-ref.svelte";
  import type { IToolPanelMethods } from "../types/create-module-types";
  import {
    CAPCoordinator,
    EditCoordinator,
    SequenceActionsCoordinator,
    ShareCoordinator,
  } from "./coordinators";
  import HandPathSettingsView from "./HandPathSettingsView.svelte";
  import StandardWorkspaceLayout from "./StandardWorkspaceLayout.svelte";
  import CreationMethodSelector from "../workspace-panel/components/CreationMethodSelector.svelte";
  import { deepLinkStore } from "$shared/navigation/utils/deep-link-store.svelte";
  import { syncURLWithSequence } from "$shared/navigation/utils/live-url-sync";
  import { deriveLettersForSequence } from "$shared/navigation/utils/letter-deriver-helper";

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
      console.log(
        "🔧 Auto-fixing: On creation tab but flag not set, setting it now"
      );
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

  // Sync current sequence to URL for easy sharing
  $effect(() => {
    if (!CreateModuleState || !servicesInitialized) return;

    // Only sync URL if we're in the create module
    const currentModule = navigationState.currentModule;
    if (currentModule !== "create") return;

    const currentSequence = CreateModuleState.sequenceState.currentSequence;
    const activeTab = navigationState.activeTab;

    console.log("🔄 URL sync effect running:", {
      hasSequence: !!currentSequence,
      beatCount: currentSequence?.beats?.length,
      activeTab,
      deepLinkProcessed,
    });

    // Map active tab to module shorthand
    const tabToModule: Record<string, string> = {
      constructor: "construct",
      assembler: "assemble",
      generator: "generate",
    };

    const moduleShorthand = tabToModule[activeTab] || "construct";

    // Sync URL with current sequence (debounced)
    // Don't allow clearing URL until deep link is processed
    syncURLWithSequence(currentSequence, moduleShorthand, {
      debounce: 500,
      allowClear: deepLinkProcessed,
    });
  });

  // Setup all managed effects using EffectCoordinator
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
      ...(onCurrentWordChange ? { onCurrentWordChange } : {}),
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
        // Check for deep link BEFORE initialization to prevent persistence from overwriting
        const hasDeepLinkInitially = deepLinkStore.has("create");
        if (hasDeepLinkInitially) {
          console.log("🔗 Deep link detected - will skip persisted state loading");
        }

        const initService = resolve<ICreateModuleInitializationService>(
          TYPES.ICreateModuleInitializationService
        );

        const result = await initService.initialize();

        services = {
          sequenceService: result.sequenceService,
          sequencePersistenceService: result.sequencePersistenceService,
          startPositionService: result.startPositionService,
          CreateModuleService: result.CreateModuleService,
          layoutService: result.layoutService,
          navigationSyncService: result.navigationSyncService,
          beatOperationsService: result.beatOperationsService,
          shareService: resolve(TYPES.IShareService),
        };

        CreateModuleState = result.CreateModuleState;
        constructTabState = result.constructTabState;

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

        handlers = resolve<ICreateModuleHandlers>(TYPES.ICreateModuleHandlers);
        creationMethodPersistence = resolve<ICreationMethodPersistenceService>(
          TYPES.ICreationMethodPersistenceService
        );
        effectCoordinator = resolve<ICreateModuleEffectCoordinator>(
          TYPES.ICreateModuleEffectCoordinator
        );

        hasSelectedCreationMethod =
          creationMethodPersistence.hasUserSelectedMethod();
        servicesInitialized = true;

        initService.configureEventCallbacks(CreateModuleState, panelState);

        // Auto-detect if method was already selected
        // This handles page refreshes where sessionStorage is cleared
        if (!hasSelectedCreationMethod) {
          const activeTab = navigationState.activeTab;
          const isCreationMethodTab =
            activeTab === "assembler" ||
            activeTab === "constructor" ||
            activeTab === "generator";

          console.log("🔍 CreateModule auto-detect:", {
            hasSelectedCreationMethod,
            activeTab,
            isCreationMethodTab,
            isWorkspaceEmpty: CreateModuleState?.isWorkspaceEmpty(),
          });

          // If we're on a creation method tab OR workspace has content, assume method was selected
          if (
            isCreationMethodTab ||
            (CreateModuleState && !CreateModuleState.isWorkspaceEmpty())
          ) {
            console.log("✅ Auto-marking creation method as selected");
            hasSelectedCreationMethod = true;
            creationMethodPersistence.markMethodSelected();
          }
        }

        logger.success("CreateModule initialized successfully");

        // Check for pending edit sequence from Explorer module
        await tick(); // Ensure DOM is ready
        const pendingSequenceData = localStorage.getItem(
          "tka-pending-edit-sequence"
        );
        if (pendingSequenceData && CreateModuleState) {
          try {
            const sequence = JSON.parse(pendingSequenceData);
            console.log("📝 Loading pending edit sequence:", sequence.id);

            // Load the sequence into the workspace
            CreateModuleState.sequenceState.setCurrentSequence(sequence);

            // Clear the pending flag
            localStorage.removeItem("tka-pending-edit-sequence");

            // Mark that a creation method has been selected
            if (!hasSelectedCreationMethod) {
              hasSelectedCreationMethod = true;
              creationMethodPersistence.markMethodSelected();
            }

            logger.success(
              "Loaded sequence for editing:",
              sequence.word || sequence.id
            );
          } catch (err) {
            console.error("❌ Failed to load pending edit sequence:", err);
            localStorage.removeItem("tka-pending-edit-sequence"); // Clear invalid data
          }
        }

        // Check for deep link sequence (shareable URL)
        console.log("🔍 CreateModule: Checking for deep link data...");
        const deepLinkData = deepLinkStore.consume("create");
        console.log("📦 CreateModule: Deep link data:", deepLinkData ? "FOUND" : "NOT FOUND");

        if (deepLinkData && CreateModuleState) {
          try {
            console.log("🔗 Loading sequence from deep link:", {
              beats: deepLinkData.sequence.beats.length,
              word: deepLinkData.sequence.word,
              tabId: deepLinkData.tabId,
            });

            // Load the sequence immediately (letters will be filled in later)
            CreateModuleState.sequenceState.setCurrentSequence(deepLinkData.sequence);
            console.log("✅ Set current sequence in state");

            // Derive letters from motion data (async but non-blocking)
            // This happens in the background after the pictograph module loads
            deriveLettersForSequence(deepLinkData.sequence)
              .then((sequenceWithLetters) => {
                console.log("✅ Letters derived, updating sequence");
                // Create a fresh sequence object with a new timestamp to ensure reactivity
                const updatedSequence = {
                  ...sequenceWithLetters,
                  // Add a timestamp to ensure this is seen as a new object
                  _updatedAt: Date.now(),
                };
                CreateModuleState.sequenceState.setCurrentSequence(updatedSequence);
                console.log("✅ Sequence updated with letters and re-rendered");
              })
              .catch((err) => {
                console.warn("⚠️ Letter derivation failed:", err);
                // Still load the sequence even if letter derivation fails
                // No need to reload since it's already loaded above
              });

            // Mark that a creation method has been selected
            if (!hasSelectedCreationMethod) {
              hasSelectedCreationMethod = true;
              creationMethodPersistence.markMethodSelected();
              console.log("✅ Marked creation method as selected");
            }

            // Navigate to the specified tab if provided
            if (deepLinkData.tabId) {
              navigationState.setActiveTab(deepLinkData.tabId);
              console.log("✅ Navigated to tab:", deepLinkData.tabId);
            }

            hasDeepLink = true;

            logger.success(
              "Loaded sequence from deep link:",
              deepLinkData.sequence.word || deepLinkData.sequence.id
            );
          } catch (err) {
            console.error("❌ Failed to load deep link sequence:", err);
          }
        } else if (!deepLinkData) {
          console.log("ℹ️ CreateModule: No deep link data available");
        }

        // Only initialize with persisted state if NO deep link was found
        // This prevents overwriting the deep link sequence with old saved state
        if (!hasDeepLink && CreateModuleState) {
          console.log("📂 Initializing with persisted state (no deep link)...");
          await CreateModuleState.initializeWithPersistence();
        } else if (hasDeepLink) {
          console.log("🚫 Skipping persisted state - using deep link sequence");
        }

        // Mark deep link as processed (allow URL syncing now)
        deepLinkProcessed = true;
        console.log("✅ Deep link processing complete, URL sync enabled");

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
            bind:animatingBeatNumber
            bind:toolPanelRef
            bind:buttonPanelElement
            bind:toolPanelElement
            onPlayAnimation={handlePlayAnimation}
            onClearSequence={handleClearSequence}
            onShare={handleOpenSharePanel}
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

  <!-- Sequence Transfer Confirmation Dialog -->
  {#if isMobile}
    <!-- Mobile: Bottom Sheet -->
    <Drawer
      isOpen={showTransferConfirmation}
      onclose={handleCancelTransfer}
      ariaLabel="Replace Constructor Content?"
    >
      {#snippet children()}
        <div class="transfer-confirmation-content">
          <h3 class="confirmation-title">Replace Constructor Content?</h3>
          <p class="confirmation-message">
            The Constructor workspace already has content. Transferring this
            sequence will replace it.
          </p>
          <div class="confirmation-actions">
            <button class="cancel-button" onclick={handleCancelTransfer}>
              Cancel
            </button>
            <button class="confirm-button" onclick={handleConfirmTransfer}>
              Replace & Transfer
            </button>
          </div>
        </div>
      {/snippet}
    </Drawer>
  {:else}
    <!-- Desktop: Confirm Dialog -->
    <ConfirmDialog
      bind:isOpen={showTransferConfirmation}
      title="Replace Constructor Content?"
      message="The Constructor workspace already has content. Transferring this sequence will replace it."
      confirmText="Replace & Transfer"
      cancelText="Cancel"
      variant="warning"
      onConfirm={handleConfirmTransfer}
      onCancel={handleCancelTransfer}
    />
  {/if}
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

  /* Transfer Confirmation Dialog Styles */
  .transfer-confirmation-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
  }

  .confirmation-title {
    color: rgba(255, 255, 255, 0.95);
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    line-height: 1.3;
  }

  .confirmation-message {
    color: rgba(255, 255, 255, 0.9);
    font-size: 16px;
    line-height: 1.6;
    margin: 0;
  }

  .confirmation-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }

  .confirmation-actions button {
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
    min-width: 120px;
  }

  .cancel-button {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  .confirm-button {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .confirm-button:hover {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    border-color: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .confirmation-actions {
      flex-direction: column;
    }

    .confirmation-actions button {
      width: 100%;
    }
  }
</style>
