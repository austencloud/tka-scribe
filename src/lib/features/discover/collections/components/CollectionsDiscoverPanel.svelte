<!--
CollectionsDiscoverPanel - Browse Creator Libraries

Displays creators with their content (sequences, collections) inline.
Users can browse what others have created without navigating away.

Uses singleton state for caching - data persists across tab switches.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, loadFeatureModule, TYPES } from "$lib/shared/inversify/di";
  import type { IUserService } from "$lib/shared/community/services/contracts/IUserService";
  import type { ICollectionService } from "$lib/features/library/services/contracts/ICollectionService";
  import type { ILibraryService } from "$lib/features/library/services/contracts/ILibraryService";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { authState } from "$lib/shared/auth/state/authState.svelte.ts";
  import { discoverNavigationState } from "../../shared/state/discover-navigation-state.svelte";
  import {
    collectionsBrowseState,
    type CreatorContentTab,
  } from "../state/collections-browse-state.svelte";
  import CreatorLibraryCard from "./CreatorLibraryCard.svelte";
  import PanelState from "$lib/shared/components/panel/PanelState.svelte";
  import PanelContent from "$lib/shared/components/panel/PanelContent.svelte";
  import PanelSearch from "$lib/shared/components/panel/PanelSearch.svelte";
  import PanelHeader from "$lib/shared/components/panel/PanelHeader.svelte";
  import DiscoverNavButtons from "../../shared/components/DiscoverNavButtons.svelte";
  import { getContext } from "svelte";
  import type { DiscoverLocation } from "../../shared/state/discover-navigation-state.svelte";

  // Get navigation handler from context (provided by DiscoverModule)
  const navContext = getContext<{
    onNavigate: (location: DiscoverLocation) => void;
  }>("discoverNavigation");

  const onNavigate = navContext?.onNavigate ?? (() => {});

  // Services
  let userService: IUserService;
  let collectionService: ICollectionService;
  let libraryService: ILibraryService;
  let hapticService: IHapticFeedbackService;

  // Local search state (synced with global state)
  let searchQuery = $state("");

  // Get current user ID
  const currentUserId = $derived(authState.user?.uid);

  // Reactive getters from cached state
  const creatorLibraries = $derived(collectionsBrowseState.creatorLibraries);
  const isLoading = $derived(
    collectionsBrowseState.isLoading && !collectionsBrowseState.isLoaded
  );
  const error = $derived(collectionsBrowseState.error);
  const expandedCreatorId = $derived(collectionsBrowseState.expandedCreatorId);
  const activeContentTab = $derived(collectionsBrowseState.activeContentTab);

  // Filtered creators based on search
  const filteredCreators = $derived.by(() => {
    if (!searchQuery) return creatorLibraries;
    const query = searchQuery.toLowerCase();
    return creatorLibraries.filter(
      (lib) =>
        lib.profile.displayName.toLowerCase().includes(query) ||
        lib.profile.username.toLowerCase().includes(query)
    );
  });

  // Only show creators with content
  const creatorsWithContent = $derived(
    filteredCreators.filter(
      (lib) => lib.publicSequenceCount > 0 || lib.publicCollections.length > 0
    )
  );

  onMount(async () => {
    try {
      // Load required modules
      await Promise.all([
        loadFeatureModule("community"),
        loadFeatureModule("library"),
      ]);

      // Resolve services
      userService = resolve<IUserService>(TYPES.IUserService);
      collectionService = resolve<ICollectionService>(TYPES.ICollectionService);
      libraryService = resolve<ILibraryService>(TYPES.ILibraryService);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );

      // Load data (uses cache if already loaded)
      await collectionsBrowseState.loadCreatorLibraries(
        userService,
        collectionService,
        libraryService,
        currentUserId
      );
    } catch (err) {
      console.error("[CollectionsDiscoverPanel] Error loading:", err);
    }
  });

  function handleExpand(creatorId: string) {
    hapticService?.trigger("selection");
    collectionsBrowseState.expandCreator(creatorId);
  }

  function handleCollapse() {
    collectionsBrowseState.collapseCreator();
  }

  function handleTabChange(tab: CreatorContentTab) {
    hapticService?.trigger("selection");
    collectionsBrowseState.setContentTab(tab);
  }

  function handleViewProfile(creatorId: string) {
    hapticService?.trigger("selection");
    // Navigate to creator profile using unified navigation state
    discoverNavigationState.viewCreatorProfile(creatorId);
  }

  function handleSequenceClick(sequenceId: string) {
    hapticService?.trigger("selection");
    // TODO: Navigate to sequence detail or animate
    console.log("[CollectionsDiscoverPanel] Sequence clicked:", sequenceId);
  }

  function handleSearchChange() {
    collectionsBrowseState.setSearchQuery(searchQuery);
  }
</script>

<div class="collections-discover-panel">
  <!-- Top bar with navigation -->
  <div class="collections-topbar">
    <div class="nav-section">
      <DiscoverNavButtons {onNavigate} />
    </div>
    <div class="header-section">
      <h2 class="panel-title">
        <i class="fas fa-book-open"></i>
        Browse Libraries
      </h2>
    </div>
    <div class="spacer"></div>
  </div>

  <PanelSearch
    placeholder="Search creators..."
    bind:value={searchQuery}
    oninput={handleSearchChange}
  />

  <PanelContent>
    {#if error}
      <PanelState type="error" title="Error" message={error} />
    {:else if isLoading}
      <PanelState type="loading" message="Loading creator libraries..." />
    {:else if creatorsWithContent.length === 0}
      <PanelState
        type="empty"
        icon="fa-book-open"
        title="No Libraries Found"
        message={searchQuery
          ? "No creators match your search"
          : "No public content available yet"}
      />
    {:else}
      <div class="creators-list">
        {#each creatorsWithContent as library (library.profile.id)}
          <CreatorLibraryCard
            data={library}
            isExpanded={expandedCreatorId === library.profile.id}
            activeTab={activeContentTab}
            onExpand={() => handleExpand(library.profile.id)}
            onCollapse={handleCollapse}
            onTabChange={handleTabChange}
            onViewProfile={() => handleViewProfile(library.profile.id)}
            onSequenceClick={handleSequenceClick}
          />
        {/each}
      </div>
    {/if}
  </PanelContent>
</div>

<style>
  .collections-discover-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding: 0 16px;
  }

  /* Top bar with navigation */
  .collections-topbar {
    display: flex;
    align-items: center;
    padding: 10px 0;
    background: transparent;
    width: 100%;
    min-height: 52px;
  }

  .nav-section {
    flex-shrink: 0;
    min-width: 104px; /* Space for nav buttons */
  }

  .header-section {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .panel-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: color-mix(in srgb, var(--theme-text, white) 95%, transparent);
  }

  .panel-title i {
    font-size: 16px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .spacer {
    flex-shrink: 0;
    min-width: 104px; /* Match nav section for centering */
  }

  .creators-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding: 4px;
  }

  /* Responsive grid for larger screens */
  @media (min-width: 1024px) {
    .creators-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    }
  }

  @media (max-width: 480px) {
    .collections-discover-panel {
      padding: 0 12px;
    }

    .panel-title {
      font-size: 16px;
    }
  }
</style>
