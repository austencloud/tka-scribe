<!--
Optimized Gallery Grid - Mobile Performance

Progressive loading gallery with:
- Infinite scroll with intersection observer
- Skeleton loading states
- Virtual scrolling for large datasets
- Mobile-first responsive design
-->
<script lang="ts">
  import type { IHapticFeedbackService, SequenceData } from "$shared";
  import { createSequenceData, resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { SequenceMetadata } from "../../shared/services/contracts/IOptimizedGalleryService";
  import { createOptimizedGalleryState } from "../../shared/state/optimized-gallery-state.svelte";
  import type { IGalleryThumbnailService } from "../services/contracts/IGalleryThumbnailService";
  import GalleryThumbnail from "./GalleryThumbnail.svelte";
  import GalleryThumbnailSkeleton from "./GalleryThumbnailSkeleton.svelte";

  let hapticService: IHapticFeedbackService;

  const {
    thumbnailService,
    viewMode = "grid",
    onAction = () => {},
  } = $props<{
    thumbnailService: IGalleryThumbnailService;
    viewMode?: "grid" | "list";
    onAction?: (action: string, sequence: any) => void;
  }>();

  // Create optimized gallery state
  const galleryState = createOptimizedGalleryState();

  // Refs for infinite scroll (DOM references)
  let galleryContainer: HTMLElement;
  let loadMoreTrigger: HTMLElement | undefined = $state();

  // Performance tracking
  let renderStartTime = $state<number | null>(null);

  // Convert SequenceMetadata to SequenceData for thumbnail component
  function convertToSequenceData(metadata: SequenceMetadata): SequenceData {
    return createSequenceData({
      id: metadata.id,
      name: metadata.word.toUpperCase(),
      word: metadata.word,
      beats: [], // Empty beats array for metadata-only display
      thumbnails: [metadata.thumbnailUrl],
      sequenceLength: metadata.length,
      author: "TKA Gallery",
      level: 1,
      dateAdded: new Date(),
      isFavorite: false,
      isCircular: false,
      difficultyLevel: "beginner",
      tags: ["gallery"],
      metadata: {
        hasImage: metadata.hasImage,
        priority: metadata.priority,
        webpThumbnailUrl: metadata.webpThumbnailUrl,
      },
    });
  }

  onMount(async () => {
    console.log("🚀 OptimizedGalleryGrid: Initializing...");
    renderStartTime = performance.now();

    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );

    // Load initial sequences
    await galleryState.loadInitialSequences();

    // Set up infinite scroll
    if (loadMoreTrigger) {
      galleryState.setupInfiniteScroll(loadMoreTrigger);
    }

    const renderTime = performance.now() - (renderStartTime || 0);
    console.log(
      `✅ OptimizedGalleryGrid: Rendered in ${Math.round(renderTime)}ms`
    );
  });

  // Handle sequence actions
  function handleSequenceAction(action: string, sequence: any) {
    onAction(action, sequence);
  }

  // Manual load more (for button fallback)
  async function handleLoadMore() {
    hapticService?.trigger("selection");
    await galleryState.loadMoreSequences();
  }

  // Search handling
  let searchInput: HTMLInputElement;
  function handleSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    galleryState.searchSequences(target.value);
  }

  function clearSearch() {
    hapticService?.trigger("selection");
    if (searchInput) {
      searchInput.value = "";
    }
    galleryState.clearSearch();
  }
</script>

<!-- Search Bar -->
<div class="search-section">
  <div class="search-container">
    <input
      bind:this={searchInput}
      type="text"
      placeholder="Search sequences..."
      class="search-input"
      oninput={handleSearch}
    />
    {#if galleryState.searchQuery}
      <button class="clear-search-btn" onclick={clearSearch}> ✕ </button>
    {/if}
  </div>

  {#if galleryState.isSearching}
    <div class="search-status">Searching...</div>
  {:else if galleryState.searchQuery}
    <div class="search-status">
      Found {galleryState.searchResults.length} results for "{galleryState.searchQuery}"
    </div>
  {/if}
</div>

<!-- Loading Progress -->
{#if galleryState.isLoading() && galleryState.loadingProgress() > 0}
  <div class="loading-progress">
    <div class="progress-bar">
      <div
        class="progress-fill"
        style="width: {galleryState.loadingProgress()}%"
      ></div>
    </div>
    <div class="progress-text">
      Loading {galleryState.loadingState.loadedCount} of {galleryState
        .loadingState.totalCount} sequences...
    </div>
  </div>
{/if}

<!-- Gallery Grid -->
<div
  bind:this={galleryContainer}
  class="gallery-container"
  class:list-view={viewMode === "list"}
  class:grid-view={viewMode === "grid"}
>
  <!-- Actual Sequences -->
  {#if galleryState.displayedSequences().length > 0}
    <div class="sequences-grid">
      {#each galleryState.displayedSequences() as sequence, index (sequence.id)}
        <GalleryThumbnail
          sequence={convertToSequenceData(sequence)}
          {thumbnailService}
          {viewMode}
          priority={index < 10}
          onAction={handleSequenceAction}
        />
      {/each}
    </div>
  {/if}

  <!-- Initial Loading Skeletons -->
  {#if galleryState.loadingState.isInitialLoading}
    <GalleryThumbnailSkeleton {viewMode} count={12} />
  {/if}

  <!-- Load More Skeletons -->
  {#if galleryState.loadingState.isLoadingMore}
    <GalleryThumbnailSkeleton {viewMode} count={6} />
  {/if}

  <!-- Infinite Scroll Trigger -->
  {#if galleryState.canLoadMore()}
    <div bind:this={loadMoreTrigger} class="load-more-trigger">
      <!-- Fallback Load More Button -->
      <button
        class="load-more-btn"
        onclick={handleLoadMore}
        disabled={galleryState.isLoading()}
      >
        {galleryState.loadingState.isLoadingMore ? "Loading..." : "Load More"}
      </button>
    </div>
  {/if}

  <!-- End of Results -->
  {#if !galleryState.hasMore && galleryState.displayedSequences.length > 0}
    <div class="end-of-results">
      <p>You've reached the end! 🎉</p>
      <p>Showing all {galleryState.displayedSequences.length} sequences</p>
    </div>
  {/if}

  <!-- Error State -->
  {#if galleryState.loadingState.error}
    <div class="error-state">
      <p>❌ {galleryState.loadingState.error}</p>
      <button onclick={galleryState.refreshGallery}> Try Again </button>
    </div>
  {/if}

  <!-- Empty State -->
  {#if !galleryState.isLoading() && galleryState.displayedSequences().length === 0}
    <div class="empty-state">
      {#if galleryState.searchQuery}
        <p>No sequences found for "{galleryState.searchQuery}"</p>
        <button onclick={clearSearch}>Clear Search</button>
      {:else}
        <p>No sequences available</p>
        <button onclick={galleryState.refreshGallery}>Refresh</button>
      {/if}
    </div>
  {/if}
</div>

<!-- Performance Info (Development) -->
{#if galleryState.lastLoadDuration}
  <div class="performance-info">
    Last load: {galleryState.lastLoadDuration}ms
  </div>
{/if}

<style>
  .search-section {
    margin-bottom: 24px;
  }

  .search-container {
    position: relative;
    max-width: 400px;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 16px;
  }

  .clear-search-btn {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 18px;
  }

  .search-status {
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }

  .loading-progress {
    margin-bottom: 24px;
  }

  .progress-bar {
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4f46e5, #7c3aed);
    transition: width 0.3s ease;
  }

  .progress-text {
    margin-top: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
    text-align: center;
  }

  .gallery-container {
    width: 100%;
  }

  .sequences-grid {
    display: grid;
    gap: 16px;
    width: 100%;
  }

  .sequences-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }

  .gallery-container.list-view .sequences-grid {
    grid-template-columns: 1fr;
  }

  .load-more-trigger {
    margin-top: 32px;
    text-align: center;
  }

  .load-more-btn {
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.2s ease;
  }

  .load-more-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
  }

  .load-more-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .end-of-results,
  .error-state,
  .empty-state {
    text-align: center;
    padding: 32px;
    color: rgba(255, 255, 255, 0.7);
  }

  .performance-info {
    position: fixed;
    bottom: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  }

  /* Mobile optimizations */
  @media (max-width: 768px) {
    .sequences-grid {
      gap: 12px;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    .search-input {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }

  @media (max-width: 480px) {
    .sequences-grid {
      gap: 8px;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
</style>
