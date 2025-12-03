<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ResponsiveSettings } from "$lib/shared/device/domain/models/device-models";
  import { onMount, setContext } from "svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import ErrorBanner from "../../../create/shared/components/ErrorBanner.svelte";

  import type { IDiscoverEventHandlerService } from "../services/contracts/IDiscoverEventHandlerService";
  import CollectionsDiscoverPanel from "../../collections/components/CollectionsDiscoverPanel.svelte";
  import CreatorsPanel from "../../creators/components/CreatorsPanel.svelte";
  import UserProfilePanel from "../../creators/components/UserProfilePanel.svelte";
  import { creatorsViewState } from "../../creators/state/creators-view-state.svelte";
  import { createExploreState } from "../state/discover-state-factory.svelte";
  import DiscoverDeleteDialog from "./DiscoverDeleteDialog.svelte";
  import DiscoverSequencesTab from "./DiscoverSequencesTab.svelte";
  import { discoverScrollState } from "../state/DiscoverScrollState.svelte";
  import { DiscoverScrollBehaviorService } from "../services/implementations/DiscoverScrollBehaviorService";
  import { desktopSidebarState } from "$lib/shared/layout/desktop-sidebar-state.svelte";
  import { galleryControlsManager } from "../state/gallery-controls-state.svelte";
  import AnimationSheetCoordinator from "../../../../shared/coordinators/AnimationSheetCoordinator.svelte";
  import LibraryDashboard from "../../../library/components/LibraryDashboard.svelte";
  import {
    libraryState,
    type LibraryViewSection,
  } from "../../../library/state/library-state.svelte";
  import SequencesView from "../../../library/components/SequencesView.svelte";

  type DiscoverModuleType =
    | "sequences"
    | "collections"
    | "creators"
    | "library";

  // ============================================================================
  // STATE MANAGEMENT (Shared Coordination)
  // ============================================================================

  const galleryState = createExploreState();

  // Service resolved lazily in onMount to ensure feature module is loaded
  let eventHandlerService: IDiscoverEventHandlerService | null = null;

  // ✅ PURE RUNES: Local state
  let _selectedSequence = $state<SequenceData | null>(null);
  let deleteConfirmationData = $state<any>(null);
  let error = $state<string | null>(null);
  let activeTab = $state<DiscoverModuleType>("sequences");
  let showAnimator = $state<boolean>(false);

  // Library tab navigation state
  let libraryView = $state<"dashboard" | LibraryViewSection>("dashboard");

  // Library navigation handlers
  function handleLibraryNavigate(section: LibraryViewSection) {
    libraryView = section;
    libraryState.setActiveSection(section);
  }

  function handleLibraryBack() {
    libraryView = "dashboard";
  }

  // Services
  let deviceDetector: IDeviceDetector | null = null;

  // Reactive responsive settings from DeviceDetector
  let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // ✅ PURE RUNES: Device detection for UI adaptation
  const isMobile = $derived(
    responsiveSettings?.isMobile || responsiveSettings?.isTablet || false
  );

  // Desktop sidebar visibility (to hide top section when sidebar is visible)
  const showDesktopSidebar = $derived(desktopSidebarState.isVisible);

  // ✅ Calculate drawer width for 60/40 split (grid gets 60%, detail panel gets 40% of remaining space)
  // Use actual sidebar width which reflects collapsed state (220px expanded, 64px collapsed, 0px hidden)
  const sidebarWidth = $derived(
    showDesktopSidebar ? desktopSidebarState.width : 0
  );
  // Keep drawer width constant to avoid flashing when opening/closing
  const drawerWidth = $derived(
    !isMobile
      ? `calc((100vw - ${sidebarWidth}px) * 0.4)` // Detail panel takes 40% of remaining space
      : "min(600px, 90vw)"
  );

  // ✅ SYNC WITH BOTTOM NAVIGATION STATE
  // This effect syncs the local tab state with the global navigation state
  $effect(() => {
    const navTab = navigationState.activeTab;

    // Map navigation state to local explore tab
    if (
      navTab === "sequences" ||
      navTab === "discover" ||
      navTab === "gallery"
    ) {
      activeTab = "sequences";
    } else if (navTab === "collections") {
      activeTab = "collections";
    } else if (navTab === "creators") {
      activeTab = "creators";
    } else if (navTab === "library") {
      activeTab = "library";
    }
  });

  // Reset creators view state when leaving the creators tab
  $effect(() => {
    if (activeTab !== "creators") {
      creatorsViewState.reset();
    }
  });

  // Reset library view state when leaving the library tab
  $effect(() => {
    if (activeTab !== "library") {
      libraryView = "dashboard";
    }
  });

  // ✅ SYNC ANIMATION MODAL STATE
  // This effect syncs the local showAnimator state with galleryState
  $effect(() => {
    showAnimator = galleryState.isAnimationModalOpen;
  });

  // ✅ SYNC CLOSE HANDLER
  // When showAnimator is closed, inform galleryState
  $effect(() => {
    if (!showAnimator && galleryState.isAnimationModalOpen) {
      galleryState.closeAnimationModal();
    }
  });

  // ============================================================================
  // SCROLL BEHAVIOR (UI Visibility Control)
  // ============================================================================

  // Create scroll behavior service instance
  const scrollBehaviorService = new DiscoverScrollBehaviorService(
    discoverScrollState
  );

  // Track last scroll position for the container
  let lastContainerScrollTop = $state(0);

  // Reactive UI visibility state
  const isUIVisible = $derived(discoverScrollState.isUIVisible);

  // Provide scroll visibility context for child components
  setContext("explorerScrollVisibility", {
    getVisible: () => discoverScrollState.isUIVisible,
    hide: () => scrollBehaviorService.forceHideUI(),
    show: () => scrollBehaviorService.forceShowUI(),
  });

  // Provide gallery state for TopBar controls via global reactive state
  // (Context doesn't work for siblings, so we use module-level $state)
  $effect(() => {
    galleryControlsManager.set({
      get currentFilter() {
        return galleryState.currentFilter;
      },
      get currentSortMethod() {
        return galleryState.currentSortMethod;
      },
      get availableNavigationSections() {
        return galleryState.availableNavigationSections;
      },
      onFilterChange: (filter) =>
        galleryState.handleFilterChange(filter.type, filter.value),
      onSortMethodChange: (method: string) =>
        galleryState.handleSortChange(method as any, "asc"),
      scrollToSection: galleryState.scrollToSection,
      openFilterModal: () => galleryState.openFilterModal(),
    });
  });

  // Handle scroll events from the scrollable container
  function handleContainerScroll(event: CustomEvent<{ scrollTop: number }>) {
    const { scrollTop } = event.detail;
    scrollBehaviorService.handleContainerScroll(
      scrollTop,
      lastContainerScrollTop
    );
    lastContainerScrollTop = scrollTop;
  }

  // ============================================================================
  // LIFECYCLE (Coordination)
  // ============================================================================

  onMount(() => {
    // Resolve event handler service (feature module should be loaded by now)
    try {
      eventHandlerService = resolve<IDiscoverEventHandlerService>(
        TYPES.IDiscoverEventHandlerService
      );

      // Initialize event handler service with required parameters
      eventHandlerService.initialize({
        galleryState,
        setSelectedSequence: (seq: SequenceData | null) =>
          (_selectedSequence = seq),
        setDeleteConfirmationData: (data: any) =>
          (deleteConfirmationData = data),
        setError: (err: string | null) => (error = err),
      });
    } catch (err) {
      console.error(
        "DiscoverModule: Failed to resolve IDiscoverEventHandlerService",
        err
      );
      error = "Failed to initialize discover module services";
    }

    // Initialize DeviceDetector service
    let cleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      responsiveSettings = deviceDetector.getResponsiveSettings();

      // Store cleanup function from onCapabilitiesChanged
      cleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (err) {
      console.warn("DiscoverModule: Failed to resolve DeviceDetector", err);
    }

    // Load initial data through gallery state (non-blocking)
    // UI shows immediately with skeletons while data loads
    galleryState
      .loadAllSequences()
      .then(() => {
        // console.log("✅ DiscoverModule: Data loaded");
      })
      .catch((err) => {
        console.error("❌ DiscoverModule: Data loading failed:", err);
        error =
          err instanceof Error
            ? err.message
            : "Failed to load gallery sequences";
      });

    // Return cleanup function
    return () => {
      cleanup?.();
      galleryControlsManager.clear();
    };
  });
</script>

<!-- Error banner -->
{#if error}
  <ErrorBanner
    message={error}
    onDismiss={() => eventHandlerService?.handleErrorDismiss()}
    onRetry={() => eventHandlerService?.handleRetry()}
  />
{/if}

<!-- Delete confirmation dialog -->
{#if deleteConfirmationData}
  <DiscoverDeleteDialog
    show={true}
    confirmationData={deleteConfirmationData}
    onConfirm={() =>
      eventHandlerService?.handleDeleteConfirm(deleteConfirmationData)}
    onCancel={() => eventHandlerService?.handleDeleteCancel()}
  />
{/if}

<!-- Animation Sheet Coordinator -->
<AnimationSheetCoordinator
  sequence={galleryState.sequenceToAnimate}
  bind:isOpen={showAnimator}
/>

<!-- Main layout - shows immediately with skeletons while data loads -->
<div class="explore-content">
  <!-- Tab Content - Bottom navigation controls the active tab -->
  <div class="explore-tab-content">
    {#key activeTab}
      <div class="tab-panel">
        {#if activeTab === "sequences"}
          <DiscoverSequencesTab
            {isMobile}
            {isUIVisible}
            {showDesktopSidebar}
            {drawerWidth}
            {galleryState}
            {error}
            onSequenceAction={(action, sequence) =>
              eventHandlerService?.handleSequenceAction(action, sequence) ??
              Promise.resolve()}
            onDetailPanelAction={(action, sequence) =>
              eventHandlerService?.handleDetailPanelAction(action, sequence) ??
              Promise.resolve()}
            onCloseDetailPanel={() =>
              eventHandlerService?.handleCloseDetailPanel()}
            onContainerScroll={handleContainerScroll}
          />
        {:else if activeTab === "collections"}
          <CollectionsDiscoverPanel />
        {:else if activeTab === "creators"}
          {#if creatorsViewState.currentView === "user-profile" && creatorsViewState.viewingUserId}
            <UserProfilePanel userId={creatorsViewState.viewingUserId} />
          {:else}
            <CreatorsPanel />
          {/if}
        {:else if activeTab === "library"}
          <div class="library-tab-content">
            {#if libraryView !== "dashboard"}
              <div class="library-header">
                <button
                  class="back-btn"
                  onclick={handleLibraryBack}
                  aria-label="Go back"
                >
                  <i class="fas fa-arrow-left"></i>
                </button>
                <h2 class="library-title">
                  {libraryView === "sequences"
                    ? "All Sequences"
                    : libraryView === "favorites"
                      ? "Favorites"
                      : libraryView === "collections"
                        ? "Collections"
                        : "Library"}
                </h2>
              </div>
            {/if}
            {#if libraryView === "dashboard"}
              <LibraryDashboard onNavigate={handleLibraryNavigate} />
            {:else}
              <SequencesView />
            {/if}
          </div>
        {/if}
      </div>
    {/key}
  </div>
</div>

<style>
  .explore-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .explore-tab-content {
    position: relative;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .tab-panel {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Library Tab Styles */
  .library-tab-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .library-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    flex-shrink: 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .library-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }
</style>
