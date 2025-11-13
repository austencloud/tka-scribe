<script lang="ts">
  import type { IDeviceDetector, SequenceData } from "$shared";
  import { resolve, TYPES, AnimationSheetCoordinator } from "$shared";
  import type { ResponsiveSettings } from "$shared/device/domain/models/device-models";
  import { onMount, setContext } from "svelte";
  import { fade } from "svelte/transition";
  import { openSpotlightViewer } from "../../../../shared/application/state/app-state.svelte";
  import { navigationState } from "../../../../shared/navigation/state/navigation-state.svelte";
  import ErrorBanner from "../../../create/shared/components/ErrorBanner.svelte";

  import type { IExploreThumbnailService } from "../../display";
  import { SequenceDisplayPanel, SequenceDetailPanel } from "../../display/components";
  import { FilterModal, ViewPresetsDropdown } from "../../filtering/components";
  import { NavigationDropdown } from "../../navigation/components";
  import UsersExplorePanel from "../../users/components/UsersExplorePanel.svelte";
  import CollectionsExplorePanel from "../../collections/components/CollectionsExplorePanel.svelte";
  import { createExploreState } from "../state/explore-state-factory.svelte";
  import ExploreDeleteDialog from "./ExploreDeleteDialog.svelte";
  import ExploreLayout from "./ExploreLayout.svelte";
  import { explorerScrollState } from "../state/ExplorerScrollState.svelte";
  import { ExplorerScrollBehaviorService } from "../services/implementations/ExplorerScrollBehaviorService";
  import { desktopSidebarState } from "../../../../shared/layout/desktop-sidebar-state.svelte";
  import { galleryControlsManager } from "../state/gallery-controls-state.svelte";

  // Modern panel system
  import Drawer from "../../../../shared/foundation/ui/Drawer.svelte";
  import { galleryPanelManager } from "../state/gallery-panel-state.svelte";
  import ViewPresetsSheet from "../../filtering/components/ViewPresetsSheet.svelte";
  import SortJumpSheet from "../../navigation/components/SortJumpSheet.svelte";
  import SequenceDetailContent from "../../display/components/SequenceDetailContent.svelte";

  type ExploreTabType = "sequences" | "users" | "collections";

  // ============================================================================
  // STATE MANAGEMENT (Shared Coordination)
  // ============================================================================

  const galleryState = createExploreState();
  const thumbnailService = resolve<IExploreThumbnailService>(
    TYPES.IExploreThumbnailService
  );

  // ✅ PURE RUNES: Local state
  let selectedSequence = $state<SequenceData | null>(null);
  let deleteConfirmationData = $state<any>(null);
  let error = $state<string | null>(null);
  let activeTab = $state<ExploreTabType>("sequences");
  let showAnimator = $state<boolean>(false);
  // Remove isInitialized blocking state - show UI immediately with skeletons

  // Detail panel state
  let isDetailPanelOpen = $state<boolean>(false);
  let selectedSequenceForDetail = $state<SequenceData | null>(null);

  // Services
  let deviceDetector: IDeviceDetector | null = null;

  // Reactive responsive settings from DeviceDetector
  let responsiveSettings = $state<ResponsiveSettings | null>(null);

  // ✅ PURE RUNES: Portrait mode detection using DeviceDetector
  const isPortraitMobile = $derived(
    responsiveSettings?.isMobile &&
      responsiveSettings?.orientation === "portrait"
  );

  // ✅ PURE RUNES: Device detection for UI adaptation
  const isMobile = $derived(
    responsiveSettings?.isMobile || responsiveSettings?.isTablet || false
  );

  // ✅ PURE RUNES: Panel mode (mobile uses bottom sheets, desktop uses side panels)
  const panelMode = $derived<"mobile" | "desktop">(
    isMobile ? "mobile" : "desktop"
  );

  // ✅ PURE RUNES: Viewport mode for detail panel
  const detailPanelViewMode = $derived<"desktop" | "mobile">(
    responsiveSettings && (responsiveSettings.isMobile || responsiveSettings.isTablet)
      ? "mobile"
      : "desktop"
  );

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

  // Debug: Log drawer width changes
  $effect(() => {
    console.log("🔧 Drawer width updated:", drawerWidth, "| Sidebar:", sidebarWidth, "px", "| Collapsed:", desktopSidebarState.isCollapsed);
  });

  // ✅ SYNC WITH BOTTOM NAVIGATION STATE
  // This effect syncs the local tab state with the global navigation state
  $effect(() => {
    const navTab = navigationState.activeTab;

    // Map navigation state to local explore tab
    if (navTab === "sequences" || navTab === "explore") {
      activeTab = "sequences";
    } else if (navTab === "users") {
      activeTab = "users";
    } else if (navTab === "collections") {
      activeTab = "collections";
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
  const scrollBehaviorService = new ExplorerScrollBehaviorService(explorerScrollState);

  // Track last scroll position for the container
  let lastContainerScrollTop = $state(0);

  // Reactive UI visibility state
  const isUIVisible = $derived(explorerScrollState.isUIVisible);

  // Desktop sidebar visibility (to hide top section when sidebar is visible)
  const showDesktopSidebar = $derived(desktopSidebarState.isVisible);

  // Debug: Log sidebar state changes
  $effect(() => {
    console.log("📊 Sidebar state:", showDesktopSidebar, "| isVisible:", desktopSidebarState.isVisible);
  });

  // Provide scroll visibility context for child components
  setContext('explorerScrollVisibility', {
    getVisible: () => explorerScrollState.isUIVisible,
    hide: () => scrollBehaviorService.forceHideUI(),
    show: () => scrollBehaviorService.forceShowUI(),
  });

  // Provide gallery state for TopBar controls via global reactive state
  // (Context doesn't work for siblings, so we use module-level $state)
  $effect(() => {
    galleryControlsManager.set({
      get currentFilter() { return galleryState.currentFilter; },
      get currentSortMethod() { return galleryState.currentSortMethod; },
      get availableNavigationSections() { return galleryState.availableNavigationSections; },
      onFilterChange: galleryState.handleFilterChange,
      onSortMethodChange: galleryState.handleSortMethodChange,
      scrollToSection: galleryState.scrollToSection,
      openFilterModal: () => galleryState.openFilterModal(),
    });
  });

  // Handle scroll events from the scrollable container
  function handleContainerScroll(event: CustomEvent<{ scrollTop: number }>) {
    const { scrollTop } = event.detail;
    scrollBehaviorService.handleContainerScroll(scrollTop, lastContainerScrollTop);
    lastContainerScrollTop = scrollTop;
  }

  // ============================================================================
  // EVENT HANDLERS (Coordination)
  // ============================================================================

  function handleSequenceSelect(sequence: SequenceData) {
    selectedSequence = sequence;
    galleryState.selectSequence(sequence);
    // console.log("✅ ExploreTab: Sequence selected:", sequence);
  }

  async function handleSequenceAction(action: string, sequence: SequenceData) {
    // console.log(
    //   "🎬 BrowseTab: handleSequenceAction called with:",
    //   action,
    //   "for sequence:",
    //   sequence.id
    // );

    try {
      switch (action) {
        case "select":
          handleSequenceSelect(sequence);
          break;
        case "view-detail":
          handleViewDetail(sequence);
          break;
        case "delete":
          handleSequenceDelete(sequence);
          break;
        case "favorite":
          await galleryState.toggleFavorite(sequence.id);
          break;
        case "fullscreen":
          handleSpotlightView(sequence);
          break;
        case "animate":
          galleryState.openAnimationModal(sequence);
          break;
        default:
          console.warn("⚠️ BrowseTab: Unknown action:", action);
      }
    } catch (err) {
      console.error("❌ BrowseTab: Action failed:", err);
      error =
        err instanceof Error ? err.message : `Failed to ${action} sequence`;
    }
  }

  function handleViewDetail(sequence: SequenceData) {
    // console.log("📋 BrowseTab: Opening detail panel for sequence:", sequence.id);
    // Use the new unified panel system
    galleryPanelManager.openDetail(sequence);
  }

  function handleCloseDetailPanel() {
    // console.log("📋 BrowseTab: Closing detail panel");
    galleryPanelManager.close();
  }

  function handleEditSequence(sequence: SequenceData) {
    try {
      // Store the sequence data in localStorage for the Create module to pick up
      localStorage.setItem("tka-pending-edit-sequence", JSON.stringify(sequence));

      // Close the detail panel if open
      handleCloseDetailPanel();

      // Navigate to Create module's construct tab
      navigationState.setCurrentModule("create");
      navigationState.setCurrentSection("construct");

      console.log("🖊️ Navigating to edit sequence:", sequence.id);
    } catch (err) {
      console.error("❌ Failed to initiate edit:", err);
      error = err instanceof Error ? err.message : "Failed to open sequence for editing";
    }
  }

  async function handleDetailPanelAction(action: string, sequence: SequenceData) {
    // console.log("📋 BrowseTab: Detail panel action:", action);

    // Handle actions from the detail panel
    switch (action) {
      case "play":
      case "animate":
        galleryState.openAnimationModal(sequence);
        break;
      case "fullscreen":
        handleSpotlightView(sequence);
        break;
      case "favorite":
        await galleryState.toggleFavorite(sequence.id);
        break;
      case "edit":
        handleEditSequence(sequence);
        break;
      case "delete":
        handleSequenceDelete(sequence);
        handleCloseDetailPanel(); // Close panel before showing delete dialog
        break;
      default:
        console.warn("⚠️ Unknown detail panel action:", action);
    }
  }

  function handleSequenceDelete(sequence: SequenceData) {
    deleteConfirmationData = {
      sequence: sequence,
      relatedSequences: [],
      totalCount: 1,
    };
  }

  function handleSpotlightView(sequence: SequenceData) {
    // console.log("🎭 BrowseTab: Opening spotlight for sequence:", sequence.id);
    openSpotlightViewer(sequence, thumbnailService);

    // Also update URL for sharing/bookmarking
    import("$shared/navigation/utils/sheet-router").then(
      ({ openSpotlight }) => {
        openSpotlight(sequence.id);
      }
    );
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmationData?.sequence) return;

    try {
      // TODO: Implement actual delete logic
      console.log(
        "🗑️ BrowseTab: Deleting sequence:",
        deleteConfirmationData.sequence.id
      );
      deleteConfirmationData = null;
      // Refresh the sequence list
      await galleryState.loadAllSequences();
    } catch (err) {
      console.error("❌ BrowseTab: Delete failed:", err);
      error = err instanceof Error ? err.message : "Failed to delete sequence";
    }
  }

  function handleDeleteCancel() {
    deleteConfirmationData = null;
  }

  function handleErrorDismiss() {
    error = null;
  }

  function handleRetry() {
    error = null;
    galleryState.loadAllSequences();
  }

  // ============================================================================
  // LIFECYCLE (Coordination)
  // ============================================================================

  onMount(() => {
    // console.log("✅ ExploreTab: Mounted");

    // Initialize DeviceDetector service
    let cleanup: (() => void) | undefined;
    try {
      deviceDetector = resolve<IDeviceDetector>(TYPES.IDeviceDetector);
      responsiveSettings = deviceDetector.getResponsiveSettings();

      // Store cleanup function from onCapabilitiesChanged
      cleanup = deviceDetector.onCapabilitiesChanged(() => {
        responsiveSettings = deviceDetector!.getResponsiveSettings();
      });
    } catch (error) {
      console.warn("ExploreTab: Failed to resolve DeviceDetector", error);
    }

    // Load initial data through gallery state (non-blocking)
    // UI shows immediately with skeletons while data loads
    galleryState
      .loadAllSequences()
      .then(() => {
        // console.log("✅ ExploreTab: Data loaded");
      })
      .catch((err) => {
        console.error("❌ ExploreTab: Data loading failed:", err);
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
    onDismiss={handleErrorDismiss}
    onRetry={handleRetry}
  />
{/if}

<!-- Delete confirmation dialog -->
{#if deleteConfirmationData}
  <ExploreDeleteDialog
    show={true}
    confirmationData={deleteConfirmationData}
    onConfirm={handleDeleteConfirm}
    onCancel={handleDeleteCancel}
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
  <div class="tab-content">
    {#key activeTab}
      <div class="tab-panel" transition:fade={{ duration: 200 }}>
        {#if activeTab === "sequences"}
      <ExploreLayout isUIVisible={isUIVisible} hideTopSection={showDesktopSidebar}>
        {#snippet viewPresetsDropdown()}
          {#if isMobile}
            <!-- Mobile: Button to trigger bottom sheet -->
            <button
              class="mobile-control-button"
              onclick={() => galleryPanelManager.openViewPresets()}
              type="button"
              aria-label="View presets"
            >
              <i class="fas fa-eye"></i>
              <span>View</span>
            </button>
          {:else}
            <!-- Desktop: Dropdown -->
            <ViewPresetsDropdown
              currentFilter={galleryState.currentFilter}
              onFilterChange={galleryState.handleFilterChange}
            />
          {/if}
        {/snippet}

        {#snippet sortAndJumpDropdown()}
          {#if isMobile}
            <!-- Mobile: Button to trigger bottom sheet -->
            <button
              class="mobile-control-button"
              onclick={() => galleryPanelManager.openSortJump()}
              type="button"
              aria-label="Sort and navigate"
            >
              <i class="fas fa-sort"></i>
              <span>Sort</span>
            </button>
          {:else}
            <!-- Desktop: Dropdown -->
            <NavigationDropdown
              currentSortMethod={galleryState.currentSortMethod}
              availableSections={galleryState.availableNavigationSections}
              onSectionClick={galleryState.scrollToSection}
              onSortMethodChange={galleryState.handleSortMethodChange}
            />
          {/if}
        {/snippet}

        {#snippet advancedFilterButton()}
          <button
            class="advanced-filter-button"
            onclick={() => galleryPanelManager.openFilters()}
            type="button"
            aria-label="Advanced filters"
          >
            <i class="fas fa-sliders-h"></i>
            <span>Filters</span>
          </button>
        {/snippet}

        {#snippet centerPanel()}
          <div class="sequences-with-detail">
            <div
              class="sequences-main"
              class:panel-open={galleryPanelManager.isDetailOpen && !isMobile}
              style:--drawer-width={drawerWidth}
            >
              <SequenceDisplayPanel
                sequences={galleryState.displayedSequences}
                sections={galleryState.sequenceSections}
                isLoading={galleryState.isLoading}
                {error}
                showSections={galleryState.showSections}
                onAction={handleSequenceAction}
                onScroll={handleContainerScroll}
              />
            </div>
          </div>
        {/snippet}
      </ExploreLayout>

      <!-- ============================================ -->
      <!-- UNIFIED PANEL SYSTEM (Using Drawer) -->
      <!-- ============================================ -->

      <!-- View Presets Sheet (Mobile) -->
      {#if isMobile}
        <Drawer
          isOpen={galleryPanelManager.isViewPresetsOpen}
          placement="bottom"
          onOpenChange={(open) => {
            if (!open) galleryPanelManager.close();
          }}
        >
          <div class="drawer-header">
            <h2>View Presets</h2>
            <button
              class="drawer-close-btn"
              onclick={() => galleryPanelManager.close()}
              aria-label="Close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <ViewPresetsSheet
            currentFilter={galleryState.currentFilter}
            onFilterChange={(preset) => {
              galleryState.handleFilterChange(preset);
              galleryPanelManager.close();
            }}
          />
        </Drawer>
      {/if}

      <!-- Sort & Jump Sheet (Mobile) -->
      {#if isMobile}
        <Drawer
          isOpen={galleryPanelManager.isSortJumpOpen}
          placement="bottom"
          onOpenChange={(open) => {
            if (!open) galleryPanelManager.close();
          }}
        >
          <div class="drawer-header">
            <h2>Sort & Navigate</h2>
            <button
              class="drawer-close-btn"
              onclick={() => galleryPanelManager.close()}
              aria-label="Close"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
          <SortJumpSheet
            currentSortMethod={galleryState.currentSortMethod}
            availableSections={galleryState.availableNavigationSections}
            onSortMethodChange={(method) => {
              galleryState.handleSortMethodChange(method);
              galleryPanelManager.close();
            }}
            onSectionClick={(sectionId) => {
              galleryState.scrollToSection(sectionId);
              galleryPanelManager.close();
            }}
          />
        </Drawer>
      {/if}

      <!-- Filters Panel (Both Mobile & Desktop) -->
      <Drawer
        isOpen={galleryPanelManager.isFiltersOpen}
        placement={isMobile ? "bottom" : "right"}
        onOpenChange={(open) => {
          if (!open) galleryPanelManager.close();
        }}
      >
        <div class="drawer-header">
          <h2>Advanced Filters</h2>
          <button
            class="drawer-close-btn"
            onclick={() => galleryPanelManager.close()}
            aria-label="Close"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <FilterModal
          isOpen={true}
          currentFilter={galleryState.currentFilter}
          availableSequenceLengths={galleryState.availableSequenceLengths}
          onFilterChange={galleryState.handleFilterChange}
          onClose={() => galleryPanelManager.close()}
        />
      </Drawer>

      <!-- Detail Panel (Unified for Both Mobile & Desktop) -->
      <div style:--drawer-width={drawerWidth}>
        <Drawer
          isOpen={galleryPanelManager.isDetailOpen}
          placement={isMobile ? "bottom" : "right"}
          class="detail-drawer"
          showHandle={false}
          closeOnBackdrop={false}
          backdropClass={!isMobile ? "transparent-backdrop" : ""}
          onOpenChange={(open) => {
            if (!open) {
              handleCloseDetailPanel();
            }
          }}
        >
          {#if galleryPanelManager.activeSequence}
            <div class="detail-content-wrapper">
              <SequenceDetailContent
                sequence={galleryPanelManager.activeSequence}
                onClose={handleCloseDetailPanel}
                onAction={handleDetailPanelAction}
              />
            </div>
          {/if}
        </Drawer>
      </div>
        {:else if activeTab === "users"}
          <UsersExplorePanel />
        {:else if activeTab === "collections"}
          <CollectionsExplorePanel />
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

  .tab-content {
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
    height: 100%;
    overflow: hidden;
  }

  .tab-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  /* Container for sequences grid + detail panel */
  .sequences-with-detail {
    display: flex;
    flex: 1;
    overflow: hidden;
    height: 100%;
    transition: all 0.3s ease;
  }

  /* Main sequences area (grid) */
  .sequences-main {
    flex: 1;
    overflow-y: auto; /* Allow scrolling */
    overflow-x: hidden;
    min-width: 0; /* Allow flexbox shrinking */
    --drawer-width: min(600px, 90vw); /* Default width, overridden by inline style */
    /* Smooth transition - matches sidebar and drawer timing for cohesive animation */
    transition: padding-right 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Add padding when panel is open (desktop only) - simple, standard approach */
  .sequences-main.panel-open {
    padding-right: var(--drawer-width);
  }

  /* Style the detail drawer with dynamic width and integrated appearance */
  :global(.detail-drawer.drawer-content[data-placement="right"]) {
    width: var(--drawer-width, min(600px, 90vw));
    /* Animate width changes - synchronized with sidebar and grid for cohesive motion */
    transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
    /* Respect top bar - start below it */
    top: 64px !important;
    height: calc(100vh - 64px) !important;
    /* Integrated, native feel - transparent background, no hard edges */
    background: rgba(20, 20, 30, 0.7) !important;
    backdrop-filter: blur(20px) !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: -2px 0 16px rgba(0, 0, 0, 0.15) !important;
  }

  /* Subtle vertical grip indicator on left edge for swipe affordance */
  :global(.detail-drawer.drawer-content[data-placement="right"]::before) {
    content: '';
    position: absolute;
    left: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 48px;
    background:
      linear-gradient(to bottom,
        transparent 0%,
        rgba(255, 255, 255, 0.2) 10%,
        rgba(255, 255, 255, 0.2) 90%,
        transparent 100%
      );
    border-radius: 2px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  :global(.detail-drawer.drawer-content[data-placement="right"]:hover::before) {
    opacity: 1;
  }

  /* Position close button more prominently in top right corner */
  :global(.detail-drawer .close-button) {
    top: 20px !important;
    right: 20px !important;
    width: 36px !important;
    height: 36px !important;
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.25) !important;
    z-index: 100 !important;
  }

  :global(.detail-drawer .close-button:hover) {
    background: rgba(255, 255, 255, 0.25) !important;
    border-color: rgba(255, 255, 255, 0.4) !important;
  }

  /* Transparent backdrop for desktop - allows clicking through to grid */
  :global(.drawer-overlay.transparent-backdrop) {
    background: transparent !important;
    backdrop-filter: none !important;
    pointer-events: none !important;
  }

  /* Detail content wrapper - absolute positioning for true crossfade */
  .detail-content-wrapper {
    position: absolute;
    inset: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Mobile Control Buttons */
  .mobile-control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .mobile-control-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .mobile-control-button:active {
    transform: scale(0.98);
  }

  /* Advanced Filter Button */
  .advanced-filter-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .advanced-filter-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }

  .advanced-filter-button:active {
    transform: scale(0.98);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .sequences-with-detail,
    .sequences-main {
      transition: none;
    }
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .mobile-control-button,
    .advanced-filter-button {
      padding: 8px 12px;
      font-size: 0.875rem;
    }

    .mobile-control-button span,
    .advanced-filter-button span {
      display: none;
    }

    .mobile-control-button i,
    .advanced-filter-button i {
      font-size: 1rem;
    }
  }

  /* Small mobile adjustments */
  @media (max-width: 380px) {
    .mobile-control-button,
    .advanced-filter-button {
      padding: 6px 10px;
    }
  }

  /* Drawer Headers */
  :global(.drawer-content) .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  :global(.drawer-content) .drawer-header h2 {
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  :global(.drawer-content) .drawer-close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  :global(.drawer-content) .drawer-close-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 1);
  }

  :global(.drawer-content) .drawer-close-btn:active {
    transform: scale(0.95);
  }

  /* Mobile drawer header adjustments */
  @media (max-width: 768px) {
    :global(.drawer-content) .drawer-header {
      padding: 16px 20px;
    }

    :global(.drawer-content) .drawer-header h2 {
      font-size: 18px;
    }
  }
</style>
