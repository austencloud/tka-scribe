<!--
  MediaBrowserPanel.svelte - Inline media browser for timeline

  Uses the existing Discover filter/sort system for consistency.
  - Single-click loads sequence into Source monitor immediately
  - CompactFilterPanel for quick filters
  - Expandable advanced filters using shared parameter cards
-->
<script module lang="ts">
  /** Media import type */
  export type MediaImportType = "animation" | "image" | "recording";
</script>

<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { tryResolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { onMount } from "svelte";
  import type { IDiscoverLoader } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverLoader";
  import type { IDiscoverThumbnailService } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverThumbnailService";
  import type { IDiscoverFilterService } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverFilterService";
  import type { IDiscoverSortService } from "$lib/features/discover/gallery/display/services/contracts/IDiscoverSortService";
  import type { ExploreFilterType } from "$lib/shared/persistence/domain/enums/FilteringEnums";
  import type { ExploreFilterValue } from "$lib/shared/persistence/domain/types/FilteringTypes";
  import { ExploreSortMethod } from "$lib/features/discover/shared/domain/enums/discover-enums";
  import type { DifficultyLevel } from "$lib/shared/domain/models/sequence-parameters";
  import { DIFFICULTY_LEVELS } from "$lib/shared/domain/models/sequence-parameters";

  interface Props {
    /** Callback when sequence is clicked (load to Source) */
    onLoadToSource?: (sequence: SequenceData) => void;
    /** Callback when sequence should be imported to timeline */
    onImport?: (sequence: SequenceData, mediaType: MediaImportType) => void;
  }

  let {
    onLoadToSource,
    onImport,
  }: Props = $props();

  // Services
  let loaderService = $state<IDiscoverLoader | null>(null);
  let thumbnailService = $state<IDiscoverThumbnailService | null>(null);
  let filterService = $state<IDiscoverFilterService | null>(null);
  let sortService = $state<IDiscoverSortService | null>(null);
  let servicesReady = $state(false);

  // State
  let allSequences = $state<SequenceData[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let searchQuery = $state("");
  let loadingSequenceId = $state<string | null>(null);

  // Pagination state for infinite scroll
  let displayedCount = $state(24); // Start with 24 sequences
  const BATCH_SIZE = 24;

  // Filter state (matches Discover module pattern)
  let currentFilter = $state<{ type: string; value: ExploreFilterValue }>({
    type: "all",
    value: null,
  });

  // Sort state
  let currentSortMethod = $state<ExploreSortMethod>(ExploreSortMethod.ALPHABETICAL);
  let sortDirection = $state<"asc" | "desc">("asc");
  let showFilters = $state(false);
  let showLetterSheet = $state(false);
  let selectedLetter = $state<string | null>(null);


  // Sort options
  const sortOptions = [
    { id: ExploreSortMethod.ALPHABETICAL, label: "A → Z", icon: "fa-arrow-down-a-z" },
    { id: ExploreSortMethod.SEQUENCE_LENGTH, label: "Length", icon: "fa-ruler" },
    { id: ExploreSortMethod.DIFFICULTY_LEVEL, label: "Difficulty", icon: "fa-signal" },
    { id: ExploreSortMethod.DATE_ADDED, label: "Recent", icon: "fa-clock" },
  ];

  // Derived: Current difficulty level for LevelCard
  const currentLevel = $derived(
    currentFilter.type === "difficulty" ? currentFilter.value as DifficultyLevel : null
  );
  const currentLength = $derived(
    currentFilter.type === "length" ? currentFilter.value as number : null
  );
  const currentLetter = $derived(
    currentFilter.type === "startingLetter" ? currentFilter.value as string : null
  );
  const isFavoritesActive = $derived(currentFilter.type === "favorites");

  // Apply filter and sort to get ALL matching sequences
  const allFilteredSequences = $derived.by(() => {
    let filtered = allSequences;

    // Apply filter using service if available
    if (filterService && currentFilter.type !== "all") {
      filtered = filterService.applyFilter(
        allSequences,
        currentFilter.type as ExploreFilterType,
        currentFilter.value
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (seq) =>
          seq.word?.toLowerCase().includes(query) ||
          seq.name?.toLowerCase().includes(query) ||
          seq.author?.toLowerCase().includes(query)
      );
    }

    // Apply sort using service if available
    if (sortService) {
      filtered = sortService.sortSequences(filtered, currentSortMethod);
      if (sortDirection === "desc") {
        filtered = [...filtered].reverse();
      }
    }

    return filtered;
  });

  // Only display a subset for performance (infinite scroll)
  const filteredSequences = $derived(
    allFilteredSequences.slice(0, displayedCount)
  );

  const hasMore = $derived(displayedCount < allFilteredSequences.length);

  // Check if sequence has recording
  function hasRecording(seq: SequenceData): boolean {
    return !!seq?.performanceVideoUrl;
  }

  // Initialize services
  async function initializeServices() {
    try {
      await loadFeatureModule("discover");
      loaderService = tryResolve<IDiscoverLoader>(TYPES.IDiscoverLoader);
      thumbnailService = tryResolve<IDiscoverThumbnailService>(TYPES.IDiscoverThumbnailService);
      filterService = tryResolve<IDiscoverFilterService>(TYPES.IDiscoverFilterService);
      sortService = tryResolve<IDiscoverSortService>(TYPES.IDiscoverSortService);
      servicesReady = !!(loaderService && thumbnailService);
    } catch (err) {
      console.error("MediaBrowserPanel: Failed to init services:", err);
      error = "Failed to initialize";
    }
  }

  // Load sequences
  async function loadSequences() {
    if (!loaderService) {
      error = "Loader service not available";
      isLoading = false;
      return;
    }

    try {
      isLoading = true;
      error = null;
      const loaded = await loaderService.loadSequenceMetadata();
      allSequences = loaded;
    } catch (err) {
      console.error("MediaBrowserPanel: Failed to load:", err);
      error = err instanceof Error ? err.message : "Failed to load";
    } finally {
      isLoading = false;
    }
  }

  // Get thumbnail URL
  function getCoverUrl(sequence: SequenceData): string | undefined {
    if (!thumbnailService) return undefined;
    const first = sequence.thumbnails?.[0];
    if (!first) return undefined;
    try {
      return thumbnailService.getThumbnailUrl(sequence.id, first);
    } catch {
      return undefined;
    }
  }

  // Handle sequence click - immediately load to Source
  async function handleSequenceClick(sequence: SequenceData) {
    if (!onLoadToSource) return;
    if (loadingSequenceId) return;

    loadingSequenceId = sequence.id;

    try {
      if (loaderService) {
        console.log('[MediaBrowser] Loading full sequence data for:', sequence.word || sequence.name);
        const fullSequence = await loaderService.loadFullSequenceData(
          sequence.word || sequence.name || sequence.id
        );
        console.log('[MediaBrowser] Loaded sequence:', fullSequence?.word, 'beats:', fullSequence?.beats?.length, 'first beat motions:', fullSequence?.beats?.[0]?.motions, 'has blue?', !!fullSequence?.beats?.[0]?.motions?.blue, 'has red?', !!fullSequence?.beats?.[0]?.motions?.red);
        if (fullSequence) {
          onLoadToSource(fullSequence);
        } else {
          console.warn('[MediaBrowser] loadFullSequenceData returned null, using metadata instead');
          onLoadToSource(sequence);
        }
      } else {
        console.warn('[MediaBrowser] No loader service, using metadata only');
        onLoadToSource(sequence);
      }
    } catch (err) {
      console.error('[MediaBrowser] Failed to load sequence:', err);
      onLoadToSource(sequence);
    } finally {
      loadingSequenceId = null;
    }
  }

  // Filter handlers
  function handleLevelChange(level: DifficultyLevel | null) {
    if (level === null) {
      currentFilter = { type: "all", value: null };
    } else {
      currentFilter = { type: "difficulty", value: level };
    }
  }

  function handleFavoritesToggle(active: boolean) {
    if (active) {
      currentFilter = { type: "favorites", value: null };
    } else {
      currentFilter = { type: "all", value: null };
    }
  }

  function handleLengthChange(length: number | null) {
    if (length === null) {
      currentFilter = { type: "all", value: null };
    } else {
      currentFilter = { type: "length", value: length };
    }
  }

  function handleLetterChange(letter: string | null) {
    if (letter === null) {
      currentFilter = { type: "all", value: null };
    } else {
      currentFilter = { type: "startingLetter", value: letter };
    }
    showLetterSheet = false;
  }

  function handleSortChange(method: ExploreSortMethod) {
    if (currentSortMethod === method) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      currentSortMethod = method;
      sortDirection = "asc";
    }
  }

  function clearFilters() {
    currentFilter = { type: "all", value: null };
    searchQuery = "";
    displayedCount = BATCH_SIZE; // Reset pagination
  }

  function loadMore() {
    if (hasMore) {
      displayedCount = Math.min(displayedCount + BATCH_SIZE, allFilteredSequences.length);
    }
  }

  function handleScroll(e: Event) {
    const target = e.target as HTMLElement;
    const scrolledToBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 200;
    if (scrolledToBottom && hasMore && !isLoading) {
      loadMore();
    }
  }

  // Reset pagination when filters change
  $effect(() => {
    // Track filter changes
    currentFilter.type;
    currentFilter.value;
    searchQuery;
    currentSortMethod;
    sortDirection;

    // Reset to first batch
    displayedCount = BATCH_SIZE;
  });

  // Check if any filter is active
  const hasActiveFilter = $derived(
    currentFilter.type !== "all" || searchQuery.trim() !== ""
  );

  // Load on mount
  onMount(async () => {
    await initializeServices();
    if (servicesReady) {
      loadSequences();
    }
  });
</script>

<div class="media-browser-panel">
  <!-- Header with controls -->
  <div class="panel-header">
    <i class="fas fa-photo-film header-icon"></i>
    <span class="header-title">Media</span>
    <span class="sequence-count">
      {filteredSequences.length}
      {#if hasMore}
        <span class="count-total">/ {allFilteredSequences.length}</span>
      {/if}
    </span>
  </div>

  <!-- Search -->
  <div class="search-bar">
    <i class="fas fa-search"></i>
    <input
      type="text"
      placeholder="Search..."
      bind:value={searchQuery}
    />
    <button
      class="favorites-btn"
      class:active={isFavoritesActive}
      onclick={() => handleFavoritesToggle(!isFavoritesActive)}
      title="Favorites"
    >
      <i class="fas fa-heart"></i>
    </button>
    {#if searchQuery}
      <button class="clear-btn" onclick={() => searchQuery = ""}>
        <i class="fas fa-times"></i>
      </button>
    {/if}
  </div>

  <!-- Sort Row -->
  <div class="sort-row">
    {#each sortOptions as option}
      {@const isActive = currentSortMethod === option.id}
      <button
        class="sort-chip"
        class:active={isActive}
        onclick={() => handleSortChange(option.id)}
        title={option.label}
      >
        <i class="fas {option.icon}"></i>
        {#if isActive}
          <i class="fas {sortDirection === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'} direction-icon"></i>
        {/if}
      </button>
    {/each}

    <!-- Advanced Filters Toggle -->
    <button
      class="advanced-toggle"
      class:active={showFilters}
      onclick={() => showFilters = !showFilters}
      title="Advanced filters"
    >
      <i class="fas fa-sliders-h"></i>
    </button>
  </div>

  <!-- Advanced Filters Panel (compact inline controls) -->
  {#if showFilters}
    <div class="advanced-filters">
      <!-- Difficulty Row -->
      <div class="filter-row">
        <span class="filter-label">Difficulty</span>
        <div class="filter-control">
          <button
            class="level-btn"
            class:active={currentLevel === null}
            onclick={() => handleLevelChange(null)}
            title="All levels"
          >
            All
          </button>
          {#each [1, 2, 3, 4, 5] as level}
            {@const config = DIFFICULTY_LEVELS[level as DifficultyLevel]}
            <button
              class="level-btn level-{level}"
              class:active={currentLevel === level}
              style="--level-gradient: {config.gradient}; --level-shadow: {config.shadowColor};"
              onclick={() => handleLevelChange(level as DifficultyLevel)}
              title="{config.name} - {config.description}"
            >
              {level}
            </button>
          {/each}
        </div>
      </div>

      <!-- Length Row -->
      <div class="filter-row">
        <span class="filter-label">Length</span>
        <div class="filter-control">
          <button
            class="stepper-btn"
            onclick={() => handleLengthChange(null)}
            class:active={currentLength === null}
          >
            Any
          </button>
          <button
            class="stepper-btn"
            onclick={() => currentLength && handleLengthChange(currentLength - 1)}
            disabled={!currentLength || currentLength <= 1}
          >
            <i class="fas fa-minus"></i>
          </button>
          <span class="length-display">{currentLength ?? '–'}</span>
          <button
            class="stepper-btn"
            onclick={() => handleLengthChange((currentLength ?? 0) + 1)}
          >
            <i class="fas fa-plus"></i>
          </button>
        </div>
      </div>

      <!-- Letter Row -->
      <div class="filter-row">
        <span class="filter-label">Letter</span>
        <div class="filter-control">
          <button
            class="letter-select-btn"
            onclick={() => showLetterSheet = true}
          >
            <i class="fas fa-font"></i>
            <span>{currentLetter || 'All'}</span>
            <i class="fas fa-chevron-down"></i>
          </button>
        </div>
      </div>

      {#if hasActiveFilter}
        <button class="clear-filters-compact" onclick={clearFilters}>
          <i class="fas fa-times"></i>
          Clear filters
        </button>
      {/if}
    </div>
  {/if}

  <!-- Letter Selection Sheet -->
  {#if showLetterSheet}
    <div class="letter-sheet-overlay" onclick={() => showLetterSheet = false} role="button" tabindex="0" onkeydown={(e) => e.key === 'Escape' && (showLetterSheet = false)}>
      <div class="letter-sheet" onclick={(e) => e.stopPropagation()} role="dialog">
        <div class="sheet-header">
          <span>Starting Letter</span>
          <button class="close-btn" onclick={() => showLetterSheet = false}>
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="letter-grid">
          <button
            class="letter-btn"
            class:active={currentLetter === null}
            onclick={() => handleLetterChange(null)}
          >
            All
          </button>
          {#each 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('') as letter}
            <button
              class="letter-btn"
              class:active={currentLetter === letter}
              onclick={() => handleLetterChange(letter)}
            >
              {letter}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Sequence grid -->
  <div class="sequence-list" onscroll={handleScroll}>
    {#if isLoading}
      <div class="state-message">
        <div class="spinner"></div>
        <span>Loading...</span>
      </div>
    {:else if error}
      <div class="state-message error">
        <i class="fas fa-exclamation-triangle"></i>
        <span>{error}</span>
        <button onclick={loadSequences}>Retry</button>
      </div>
    {:else if filteredSequences.length === 0}
      <div class="state-message">
        <i class="fas fa-search"></i>
        <span>No sequences found</span>
        {#if hasActiveFilter}
          <button onclick={clearFilters}>
            Clear filters
          </button>
        {/if}
      </div>
    {:else}
      {#each filteredSequences as sequence (sequence.id)}
        {@const coverUrl = getCoverUrl(sequence)}
        {@const hasVideo = hasRecording(sequence)}
        {@const isLoading = loadingSequenceId === sequence.id}
        <button
          class="sequence-item"
          class:loading={isLoading}
          onclick={() => handleSequenceClick(sequence)}
          title="{sequence.word || sequence.name} - Click to preview"
          disabled={!!loadingSequenceId}
        >
          <div class="item-thumb">
            {#if coverUrl}
              <img src={coverUrl} alt={sequence.word || "Sequence"} loading="lazy" />
            {:else}
              <div class="placeholder-thumb">
                <i class="fas fa-film"></i>
              </div>
            {/if}
            {#if hasVideo}
              <div class="video-badge">
                <i class="fas fa-video"></i>
              </div>
            {/if}
            {#if isLoading}
              <div class="loading-overlay">
                <div class="spinner small"></div>
              </div>
            {/if}
          </div>
          <span class="item-name">{sequence.word || sequence.name || "Unnamed"}</span>
          {#if sequence.beats?.length}
            <span class="item-meta">{sequence.beats.length} beats</span>
          {/if}
        </button>
      {/each}

      <!-- Load more indicator -->
      {#if hasMore && filteredSequences.length > 0}
        <div class="load-more-indicator">
          <div class="spinner small"></div>
          <span>Scroll for more...</span>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  .media-browser-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    position: relative;
    overflow: hidden;
  }

  /* Header */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .header-icon {
    font-size: 14px;
    color: var(--theme-accent, #4a9eff);
    filter: drop-shadow(0 0 6px color-mix(in srgb, var(--theme-accent, #4a9eff) 40%, transparent));
  }

  .header-title {
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
    letter-spacing: 0.2px;
  }

  .sequence-count {
    margin-left: auto;
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    padding: 3px 8px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    font-weight: 500;
  }

  .count-total {
    opacity: 0.5;
    margin-left: 2px;
  }

  /* Search bar */
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
  }

  .search-bar i {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
  }

  .search-bar input {
    flex: 1;
    background: transparent;
    border: none;
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
    font-size: var(--font-size-min, 14px);
    outline: none;
    min-width: 0;
  }

  .search-bar input::placeholder {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
  }

  .favorites-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    transition: all 0.2s ease;
    margin-left: auto;
  }

  .favorites-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.65));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: #ec4899;
    transform: scale(1.1);
  }

  .favorites-btn.active {
    background: linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(236, 72, 153, 0.2) 100%);
    border-color: #ec4899;
    color: #ec4899;
    box-shadow: 0 0 12px rgba(236, 72, 153, 0.3);
  }

  .favorites-btn.active:hover {
    background: linear-gradient(135deg, rgba(244, 114, 182, 0.35) 0%, rgba(236, 72, 153, 0.3) 100%);
    transform: scale(1.1);
  }

  .clear-btn {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    transition: all 0.2s ease;
  }

  .clear-btn:hover {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
    box-shadow: 0 0 8px color-mix(in srgb, var(--theme-accent, #4a9eff) 40%, transparent);
  }

  /* Controls row */
  .controls-row {
    display: flex;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  /* Sort dropdown */
  .sort-dropdown {
    position: relative;
    flex: 1;
  }

  .sort-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 8px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .sort-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .sort-btn span {
    flex: 1;
    text-align: left;
  }

  .sort-btn i:last-child {
    font-size: 9px;
    opacity: 0.5;
  }

  .sort-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background: #1a1a24;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    overflow: hidden;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .sort-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 11px;
    cursor: pointer;
    transition: all 0.1s ease;
    text-align: left;
  }

  .sort-option:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .sort-option.active {
    background: rgba(74, 158, 255, 0.15);
    color: #4a9eff;
  }

  /* Filter toggle */
  .filter-toggle {
    position: relative;
    width: 32px;
    height: 28px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    transition: all 0.15s ease;
  }

  .filter-toggle:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
  }

  .filter-toggle.active {
    background: rgba(74, 158, 255, 0.15);
    border-color: rgba(74, 158, 255, 0.3);
    color: #4a9eff;
  }

  .filter-badge {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4a9eff;
  }

  /* Filters panel */
  .filters-panel {
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .filter-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .chip {
    padding: 5px 10px;
    border-radius: 4px;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.15s ease;
  }

  .chip.small {
    padding: 4px 8px;
    font-size: 10px;
  }

  .chip:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .chip.active {
    background: rgba(74, 158, 255, 0.2);
    color: #4a9eff;
  }

  .chip i {
    font-size: 10px;
  }

  .clear-filters {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 4px;
    border: none;
    background: rgba(255, 100, 100, 0.1);
    color: #ff6b6b;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.15s ease;
    align-self: flex-start;
  }

  .clear-filters:hover {
    background: rgba(255, 100, 100, 0.2);
  }

  /* Sort Row */
  .sort-row {
    display: flex;
    gap: 6px;
    padding: 8px 14px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    flex-shrink: 0;
  }

  .sort-chip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 7px 10px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sort-chip:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .sort-chip.active {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
    border-color: var(--theme-accent, #4a9eff);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .direction-icon {
    font-size: 10px;
    margin-left: 2px;
  }

  .advanced-toggle {
    width: 40px;
    height: 32px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .advanced-toggle:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .advanced-toggle.active {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
    border-color: var(--theme-accent, #4a9eff);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  /* Advanced Filters Panel (compact) */
  .advanced-filters {
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-shrink: 0;
  }

  .filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .filter-row .filter-label {
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    min-width: 65px;
    flex-shrink: 0;
    font-weight: 600;
  }

  .filter-control {
    display: flex;
    align-items: center;
    gap: 5px;
    flex: 1;
  }

  /* Level buttons */
  .level-btn {
    flex: 1;
    padding: 6px 10px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }

  .level-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .level-btn.active {
    border-color: var(--theme-accent, #4a9eff);
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 10px color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
  }

  /* Level-specific gradients when active */
  .level-btn.level-1.active,
  .level-btn.level-2.active,
  .level-btn.level-3.active,
  .level-btn.level-4.active,
  .level-btn.level-5.active {
    background: var(--level-gradient);
    border: 2px solid transparent;
    color: var(--theme-text, white);
    box-shadow: 0 0 14px hsl(var(--level-shadow) / 0.4),
                0 0 28px hsl(var(--level-shadow) / 0.2);
    font-weight: 700;
  }

  /* Text color overrides for light backgrounds */
  .level-btn.level-1.active,
  .level-btn.level-3.active {
    color: black;
  }

  /* Stepper controls */
  .stepper-btn {
    padding: 6px 12px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 36px;
  }

  .stepper-btn:hover:not(:disabled) {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .stepper-btn.active {
    border-color: var(--theme-accent, #4a9eff);
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 20%, transparent);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 10px color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
  }

  .stepper-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .length-display {
    min-width: 28px;
    text-align: center;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
    font-weight: 600;
  }

  /* Letter select button */
  .letter-select-btn {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .letter-select-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-1px);
  }

  .letter-select-btn i:first-child {
    font-size: 11px;
  }

  .letter-select-btn span {
    flex: 1;
    text-align: left;
  }

  .letter-select-btn i:last-child {
    font-size: 9px;
    opacity: 0.6;
  }

  .clear-filters-compact {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 12px;
    border: 1px solid var(--semantic-error, #ef4444);
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 15%, transparent);
    color: var(--semantic-error, #ef4444);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 6px;
  }

  .clear-filters-compact:hover {
    background: color-mix(in srgb, var(--semantic-error, #ef4444) 25%, transparent);
    border-color: var(--semantic-error, #ef4444);
    box-shadow: 0 0 10px color-mix(in srgb, var(--semantic-error, #ef4444) 20%, transparent);
  }

  /* Letter Selection Sheet */
  .letter-sheet-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.25s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .letter-sheet {
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 20px;
    padding: 24px;
    max-width: 450px;
    width: 92%;
    max-height: 80vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
    box-shadow: var(--theme-shadow, 0 14px 36px rgba(0, 0, 0, 0.4));
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .sheet-header span {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text, white);
    letter-spacing: 0.3px;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
    color: white;
    transform: rotate(90deg);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .letter-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 10px;
  }

  .letter-btn {
    aspect-ratio: 1;
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .letter-btn:hover {
    background: var(--theme-card-hover-bg, rgba(0, 0, 0, 0.55));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.14));
    color: var(--theme-text, white);
    transform: translateY(-2px) scale(1.05);
  }

  .letter-btn.active {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
    border-color: var(--theme-accent, #4a9eff);
    color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  /* Sequence list */
  .sequence-list {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    align-content: start;
  }

  /* 3 columns for wider panels */
  @media (min-width: 400px) {
    .sequence-list {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  /* Custom scrollbar styling - always visible */
  .sequence-list::-webkit-scrollbar {
    width: 12px;
  }

  .sequence-list::-webkit-scrollbar-track {
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    border-left: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .sequence-list::-webkit-scrollbar-thumb {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.2));
    border: 3px solid var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  .sequence-list::-webkit-scrollbar-thumb:hover {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 40%, transparent);
  }

  .sequence-list::-webkit-scrollbar-thumb:active {
    background: var(--theme-accent-strong, #3a7ed0);
  }

  /* Firefox scrollbar */
  .sequence-list {
    scrollbar-width: auto;
    scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.5);
  }

  .sequence-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: center;
    transition: all 0.2s ease;
  }

  .sequence-item:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.03);
  }

  .sequence-item:hover:not(:disabled) .item-thumb {
    border-color: var(--theme-accent, #4a9eff);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3),
                0 0 16px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
  }

  .sequence-item:disabled {
    cursor: wait;
  }

  .sequence-item.loading {
    opacity: 0.6;
  }

  .item-thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    transition: all 0.2s ease;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.45));
  }

  .item-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder-thumb {
    width: 100%;
    height: 100%;
    background: var(--theme-panel-elevated-bg, rgba(0, 0, 0, 0.5));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: 24px;
  }

  .video-badge {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.9) 100%);
    border: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .loading-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  .item-name {
    font-size: 11px;
    color: var(--theme-text, rgba(255, 255, 255, 0.92));
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 2px;
  }

  .item-meta {
    font-size: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
  }

  /* State messages */
  .state-message {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.65));
    font-size: var(--font-size-min, 14px);
  }

  .state-message i {
    font-size: 32px;
    opacity: 0.5;
    color: var(--theme-accent, #4a9eff);
  }

  .state-message button {
    padding: 8px 16px;
    border-radius: 12px;
    border: 1px solid var(--theme-accent, #4a9eff);
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 15%, transparent);
    color: var(--theme-accent, #4a9eff);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .state-message button:hover {
    background: color-mix(in srgb, var(--theme-accent, #4a9eff) 25%, transparent);
    border-color: var(--theme-accent, #4a9eff);
    box-shadow: 0 0 12px color-mix(in srgb, var(--theme-accent, #4a9eff) 30%, transparent);
    transform: translateY(-1px);
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid color-mix(in srgb, var(--theme-accent, #4a9eff) 15%, transparent);
    border-top-color: var(--theme-accent, #4a9eff);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .spinner.small {
    width: 18px;
    height: 18px;
    border-width: 2px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Load more indicator */
  .load-more-indicator {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 12px;
  }

  .load-more-indicator .spinner {
    opacity: 0.6;
  }
</style>
