<!--
  SequencesView.svelte - Sequences Library View

  Displays user's saved sequences with optional favorites filter.
  Library = sequences YOU created/saved.

  Features:
  - Real-time Firestore sync
  - Search, sort, and filter by tags
  - Favorites toggle
  - Selection mode for batch operations
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { libraryState } from "../state/library-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte.ts";
  import SequenceCard from "../../discover/gallery/display/components/SequenceCard/SequenceCard.svelte";
  import SequenceDetailDrawer from "./SequenceDetailDrawer.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import TagFilterChips from "./tags/TagFilterChips.svelte";

  // Local UI state
  let showOnlyFavorites = $state(false);
  let searchQuery = $state("");
  let showSortMenu = $state(false);
  let showDetailDrawer = $state(false);
  let selectedSequenceId = $state<string | null>(null);

  // Derived from library state
  const isLoading = $derived(libraryState.isLoading);
  const error = $derived(libraryState.error);
  const isSelectMode = $derived(libraryState.isSelectMode);
  const selectedCount = $derived(libraryState.selectedCount);
  const isAuthenticated = $derived(!!authState.effectiveUserId);

  // Filtered sequences
  const displayedSequences = $derived(() => {
    let sequences = libraryState.filteredSequences;
    if (showOnlyFavorites) {
      return sequences.filter((s) => s.isFavorite);
    }
    return sequences;
  });

  // Stats
  const totalCount = $derived(libraryState.sequences.length);
  const favoritesCount = $derived(
    libraryState.sequences.filter((s) => s.isFavorite).length
  );

  // Sort options
  const sortOptions = [
    { field: "updatedAt", label: "Recently Updated" },
    { field: "createdAt", label: "Date Created" },
    { field: "name", label: "Name" },
    { field: "word", label: "Word" },
  ] as const;

  function handleSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    searchQuery = target.value;
    libraryState.setSearchQuery(searchQuery);
  }

  function handleSortChange(
    field: "updatedAt" | "createdAt" | "name" | "word"
  ) {
    if (libraryState.filters.sortBy === field) {
      libraryState.toggleSortDirection();
    } else {
      libraryState.setSortBy(field);
    }
    showSortMenu = false;
  }

  // Selection handlers
  function enterSelectMode() {
    libraryState.enterSelectMode();
  }

  function exitSelectMode() {
    libraryState.exitSelectMode();
  }

  function handleSelectAll() {
    libraryState.selectAll();
  }

  function handleCardClick(sequence: SequenceData) {
    if (isSelectMode) {
      libraryState.toggleSelection(sequence.id ?? "");
    } else {
      // Open detail drawer
      selectedSequenceId = sequence.id ?? null;
      showDetailDrawer = true;
    }
  }

  function handleCloseDetail() {
    showDetailDrawer = false;
    selectedSequenceId = null;
  }

  // Batch actions
  async function handleDeleteSelected() {
    if (selectedCount === 0) return;

    const confirmed = confirm(
      `Delete ${selectedCount} sequence${selectedCount > 1 ? "s" : ""}? This cannot be undone.`
    );

    if (confirmed) {
      await libraryState.deleteSelected();
    }
  }

  async function handlePublishSelected() {
    await libraryState.setVisibilityBatch("public");
  }

  async function handleUnpublishSelected() {
    await libraryState.setVisibilityBatch("private");
  }

  // Track previous auth state to detect changes
  let prevIsAuthenticated: boolean | undefined;

  // Initialize on mount
  onMount(() => {
    prevIsAuthenticated = isAuthenticated;

    if (isAuthenticated) {
      libraryState.initialize();
    }
  });

  onDestroy(() => {
    libraryState.dispose();
  });

  // Re-initialize only when auth state CHANGES (not on every render)
  $effect(() => {
    const currentAuth = isAuthenticated;
    // Skip if this is the initial run (handled by onMount)
    if (prevIsAuthenticated === undefined) {
      return;
    }
    // Only act if auth state actually changed
    if (currentAuth !== prevIsAuthenticated) {
      prevIsAuthenticated = currentAuth;
      if (currentAuth) {
        libraryState.initialize();
      } else {
        libraryState.reset();
      }
    }
  });
</script>

<div class="sequences-view">
  <!-- Header with Search & Actions -->
  <div class="header-bar">
    <!-- Search -->
    <div class="search-container">
      <i class="fas fa-search search-icon" aria-hidden="true"></i>
      <input
        type="text"
        placeholder="Search sequences..."
        value={searchQuery}
        oninput={handleSearchInput}
        class="search-input"
      />
      {#if searchQuery}
        <button
          class="clear-search"
          aria-label="Clear search"
          onclick={() => {
            searchQuery = "";
            libraryState.setSearchQuery("");
          }}
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      {/if}
    </div>

    <!-- Actions -->
    <div class="header-actions">
      <!-- Sort button -->
      <div class="sort-dropdown">
        <button
          class="action-btn"
          aria-label="Sort sequences"
          onclick={() => (showSortMenu = !showSortMenu)}
          title="Sort sequences"
        >
          <i class="fas fa-sort-amount-down" aria-hidden="true"></i>
        </button>
        {#if showSortMenu}
          <div class="sort-menu">
            {#each sortOptions as option}
              <button
                class="sort-option"
                class:active={libraryState.filters.sortBy === option.field}
                onclick={() => handleSortChange(option.field)}
              >
                <span>{option.label}</span>
                {#if libraryState.filters.sortBy === option.field}
                  <i
                    class="fas fa-arrow-{libraryState.filters.sortDirection ===
                    'asc'
                      ? 'up'
                      : 'down'}"
                    aria-hidden="true"
                  ></i>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Select mode toggle -->
      {#if !isSelectMode}
        <button
          class="action-btn"
          aria-label="Select sequences"
          onclick={enterSelectMode}
          title="Select"
        >
          <i class="fas fa-check-square" aria-hidden="true"></i>
        </button>
      {:else}
        <button
          class="action-btn active"
          aria-label="Exit selection mode"
          onclick={exitSelectMode}
          title="Done"
        >
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      {/if}
    </div>
  </div>

  <!-- Filter Bar -->
  <div class="filter-bar">
    <div class="sequence-count">
      {#if showOnlyFavorites}
        <span>{favoritesCount} favorite{favoritesCount !== 1 ? "s" : ""}</span>
      {:else}
        <span>{totalCount} sequence{totalCount !== 1 ? "s" : ""}</span>
      {/if}
    </div>

    {#if favoritesCount > 0}
      <button
        class="favorites-toggle"
        class:active={showOnlyFavorites}
        onclick={() => (showOnlyFavorites = !showOnlyFavorites)}
      >
        <i class="fas fa-star" aria-hidden="true"></i>
        <span>{showOnlyFavorites ? "Show All" : "Favorites"}</span>
      </button>
    {/if}
  </div>

  <!-- Tag Filter Chips -->
  <TagFilterChips />

  <!-- Selection Bar (when in select mode) -->
  {#if isSelectMode}
    <div class="selection-bar">
      <div class="selection-info">
        <span>{selectedCount} selected</span>
        <button class="text-btn" onclick={handleSelectAll}>Select All</button>
        <button class="text-btn" onclick={() => libraryState.clearSelection()}>
          Clear
        </button>
      </div>
      <div class="selection-actions">
        <button
          class="batch-btn"
          aria-label="Make selected sequences public"
          onclick={handlePublishSelected}
          disabled={selectedCount === 0}
          title="Make public"
        >
          <i class="fas fa-globe" aria-hidden="true"></i>
        </button>
        <button
          class="batch-btn"
          aria-label="Make selected sequences private"
          onclick={handleUnpublishSelected}
          disabled={selectedCount === 0}
          title="Make private"
        >
          <i class="fas fa-lock" aria-hidden="true"></i>
        </button>
        <button
          class="batch-btn danger"
          aria-label="Delete selected sequences"
          onclick={handleDeleteSelected}
          disabled={selectedCount === 0}
          title="Delete"
        >
          <i class="fas fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  {/if}

  <!-- Content Area -->
  <div class="content-area">
    {#if !isAuthenticated}
      <div class="auth-required">
        <i class="fas fa-lock" aria-hidden="true"></i>
        <h3>Sign In Required</h3>
        <p>Please sign in to access your library.</p>
      </div>
    {:else if isLoading}
      <div
        class="loading-state"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="spinner" aria-hidden="true"></div>
        <p>Loading your library...</p>
      </div>
    {:else if error}
      <div class="error-state" role="alert" aria-live="assertive">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <h3>Error Loading Sequences</h3>
        <p>{error}</p>
        <button
          class="retry-button"
          onclick={() => libraryState.loadSequences()}
        >
          <i class="fas fa-redo" aria-hidden="true"></i>
          Retry
        </button>
      </div>
    {:else if displayedSequences().length === 0}
      <div class="empty-state">
        <i class="fas fa-folder-open" aria-hidden="true"></i>
        <h3>
          {#if searchQuery}
            No Results Found
          {:else if showOnlyFavorites}
            No Favorites Yet
          {:else}
            Library is Empty
          {/if}
        </h3>
        <p>
          {#if searchQuery}
            Try a different search term.
          {:else if showOnlyFavorites}
            Star sequences to add them to your favorites.
          {:else}
            Create your first sequence in the Create module!
          {/if}
        </p>
      </div>
    {:else}
      <div class="sequences-grid">
        {#each displayedSequences() as sequence (sequence.id)}
          <SequenceCard
            {sequence}
            onPrimaryAction={handleCardClick}
            selected={libraryState.isSelected(sequence.id)}
          />
        {/each}
      </div>
    {/if}
  </div>

  <!-- Detail Drawer -->
  <SequenceDetailDrawer
    bind:isOpen={showDetailDrawer}
    sequenceId={selectedSequenceId}
    onClose={handleCloseDetail}
  />
</div>

<style>
  .sequences-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  /* Header Bar */
  .header-bar {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .search-container {
    flex: 1;
    position: relative;
    max-width: 400px;
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.75); /* WCAG AAA */
    font-size: 0.875rem;
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    padding-left: calc(var(--spacing-sm) + 1.5rem);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: var(--radius-2026-sm, 10px);
    color: var(--theme-text);
    font-size: 0.875rem;
  }

  .search-input::placeholder {
    color: rgba(255, 255, 255, 0.75); /* WCAG AAA */
  }

  .search-input:focus {
    outline: none;
    border-color: rgba(16, 185, 129, 0.4);
    background: var(--theme-card-bg);
  }

  .clear-search {
    position: absolute;
    right: var(--spacing-sm);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.75); /* WCAG AAA */
    cursor: pointer;
    padding: var(--spacing-xs);
  }

  .clear-search:hover {
    color: rgba(255, 255, 255, 0.7);
  }

  .header-actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  .action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: var(--radius-2026-sm, 10px);
    color: var(--theme-text-dim);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--theme-text);
  }

  .action-btn.active {
    background: rgba(16, 185, 129, 0.2);
    border-color: rgba(16, 185, 129, 0.4);
    color: rgba(16, 185, 129, 0.9);
  }

  /* Sort Dropdown */
  .sort-dropdown {
    position: relative;
  }

  .sort-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--spacing-xs);
    background: rgba(30, 30, 40, 0.98);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: var(--radius-2026-sm, 10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 100;
    min-width: 180px;
    overflow: hidden;
  }

  .sort-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: none;
    border: none;
    color: var(--theme-text-dim);
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .sort-option:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .sort-option.active {
    background: rgba(16, 185, 129, 0.15);
    color: rgba(16, 185, 129, 0.9);
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .sequence-count {
    font-size: var(--font-size-sm, 14px);
    color: var(--theme-text-dim);
  }

  .favorites-toggle {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-xs) var(--spacing-md);
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 999px;
    color: var(--theme-text-dim);
    font-size: var(--font-size-sm, 14px);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .favorites-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--theme-text);
  }

  .favorites-toggle.active {
    background: rgba(250, 204, 21, 0.2);
    border-color: rgba(250, 204, 21, 0.4);
    color: rgba(250, 204, 21, 1);
  }

  .favorites-toggle i {
    font-size: 0.875rem;
  }

  /* Selection Bar */
  .selection-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(16, 185, 129, 0.1);
    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
  }

  .selection-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    color: var(--theme-text);
    font-size: 0.875rem;
  }

  .text-btn {
    background: none;
    border: none;
    color: rgba(16, 185, 129, 0.9);
    font-size: 0.875rem;
    cursor: pointer;
    padding: 0;
  }

  .text-btn:hover {
    text-decoration: underline;
  }

  .selection-actions {
    display: flex;
    gap: var(--spacing-xs);
  }

  .batch-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid var(--theme-stroke-strong);
    border-radius: var(--radius-2026-sm, 10px);
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .batch-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  .batch-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .batch-btn.danger:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.3);
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(239, 68, 68, 0.9);
  }

  /* Content Area */
  .content-area {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-lg);
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--theme-text-dim);
  }

  .spinner {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    border: 3px solid var(--theme-stroke);
    border-top-color: rgba(16, 185, 129, 0.8);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: var(--spacing-md);
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Auth Required State */
  .auth-required {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--theme-text-dim);
    padding: var(--spacing-xl);
  }

  .auth-required i {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }

  .auth-required h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--theme-text);
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--theme-text-dim);
    padding: var(--spacing-xl);
  }

  .empty-state i {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
  }

  .empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--theme-text);
  }

  .empty-state p {
    font-size: 1rem;
    line-height: 1.6;
    max-width: 400px;
  }

  /* Error State */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: var(--theme-text-dim);
    padding: var(--spacing-xl);
  }

  .error-state i {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg);
    color: rgba(239, 68, 68, 0.7);
  }

  .error-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: var(--theme-text);
  }

  .error-state p {
    font-size: 1rem;
    margin-bottom: var(--spacing-lg);
    max-width: 400px;
  }

  .retry-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: var(--radius-2026-sm, 10px);
    color: var(--theme-text);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-button:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.5);
  }

  /* Sequences Grid */
  .sequences-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--spacing-md);
  }

  /* Responsive adjustments */
  @container (max-width: 600px) {
    .sequences-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }

    .favorites-toggle span {
      display: none;
    }
  }
</style>
