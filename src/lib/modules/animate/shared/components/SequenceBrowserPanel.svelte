<!--
  SequenceBrowserPanel.svelte - Sequence Selection Panel

  A slide-in panel for selecting sequences to animate.
  Reuses Discover module's sequence grid/display logic.

  Props:
  - mode: Which sequence slot we're filling (primary, secondary, grid-0, etc.)
  - onSelect: Callback when sequence is selected
  - onClose: Callback to close the panel
-->
<script lang="ts">
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { resolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import { Drawer } from "$lib/shared/foundation/ui";

  import { onMount } from "svelte";
  import type { IDiscoverLoader } from "../../../discover";
  import type { IDiscoverThumbnailService } from "../../../discover/gallery/display/services/contracts/IDiscoverThumbnailService";
  import SequenceCard from "../../../discover/gallery/display/components/SequenceCard/SequenceCard.svelte";

  // Props
  let {
    mode = "primary",
    show = false,
    onSelect = (sequence: SequenceData) => {},
    onClose = () => {},
    requiredBeatCount = undefined,
    placement = undefined,
  }: {
    mode: "primary" | "secondary" | "grid-0" | "grid-1" | "grid-2" | "grid-3";
    show?: boolean;
    onSelect?: (sequence: SequenceData) => void;
    onClose?: () => void;
    requiredBeatCount?: number | undefined;
    placement?: "bottom" | "right" | "left" | "top" | undefined;
  } = $props();

  // Services
  let loaderService = resolve(TYPES.IDiscoverLoader) as IDiscoverLoader;
  let thumbnailService = resolve(
    TYPES.IDiscoverThumbnailService
  ) as IDiscoverThumbnailService;

  // Auto-detect placement based on screen size if not provided
  let drawerPlacement = $state<"bottom" | "right" | "left" | "top">("right");

  $effect(() => {
    if (placement) {
      drawerPlacement = placement;
      return;
    } else {
      // Default behavior: bottom on mobile, right on desktop
      drawerPlacement = window.innerWidth < 768 ? "bottom" : "right";

      const handleResize = () => {
        if (!placement) {
          drawerPlacement = window.innerWidth < 768 ? "bottom" : "right";
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  });

  // State
  let sequences = $state<SequenceData[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let searchQuery = $state("");

  // Filtered sequences based on search and beat count
  const filteredSequences = $derived.by(() => {
    let filtered = sequences;

    // Filter by beat count if required
    if (requiredBeatCount !== undefined) {
      filtered = filtered.filter(
        (seq) => seq.beats.length === requiredBeatCount
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (seq) =>
          seq.word?.toLowerCase().includes(query) ||
          seq.name?.toLowerCase().includes(query) ||
          seq.author?.toLowerCase().includes(query)
      );
    }

    return filtered;
  });

  // Load sequences
  async function loadSequences() {
    try {
      isLoading = true;
      error = null;

      const loaded = await loaderService.loadSequenceMetadata();
      sequences = loaded;
    } catch (err) {
      console.error("❌ SequenceBrowserPanel: Failed to load sequences:", err);
      error = err instanceof Error ? err.message : "Failed to load sequences";
    } finally {
      isLoading = false;
    }
  }

  // Get cover URL for a sequence
  function getCoverUrl(sequence: SequenceData): string | undefined {
    // Get the first thumbnail from the sequence's thumbnails array
    const firstThumbnail = sequence.thumbnails?.[0];
    if (!firstThumbnail) return undefined;
    try {
      return thumbnailService.getThumbnailUrl(sequence.id, firstThumbnail);
    } catch (error) {
      return undefined;
    }
  }

  // Handle sequence selection
  function handleSelect(sequence: SequenceData) {
    onSelect(sequence);
    onClose();
  }

  // Load on mount
  onMount(() => {
    loadSequences();
  });

  // Mode label
  const modeLabel = $derived.by(() => {
    switch (mode) {
      case "primary":
        return "Primary Sequence";
      case "secondary":
        return "Secondary Sequence";
      case "grid-0":
        return "Grid Position 1 (Top-Left)";
      case "grid-1":
        return "Grid Position 2 (Top-Right)";
      case "grid-2":
        return "Grid Position 3 (Bottom-Left)";
      case "grid-3":
        return "Grid Position 4 (Bottom-Right)";
      default:
        return "Select Sequence";
    }
  });

  // Beat count filter message
  const beatCountMessage = $derived(
    requiredBeatCount !== undefined
      ? `Showing only ${requiredBeatCount}-beat sequences`
      : null
  );
</script>

<Drawer
  isOpen={show}
  onclose={onClose}
  placement={drawerPlacement}
  class="sequence-browser-panel"
  labelledBy="sequence-browser-title"
>
  <div class="browser-content">
    <!-- Header -->
    <div class="browser-header">
      <button class="close-button" onclick={onClose} aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
      <h2 id="sequence-browser-title">{modeLabel}</h2>
    </div>

    <!-- Search Bar -->
    <div class="search-container">
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        class="search-input"
        placeholder="Search sequences..."
        bind:value={searchQuery}
      />
      {#if searchQuery}
        <button
          class="clear-search"
          onclick={() => (searchQuery = "")}
          aria-label="Clear search"
        >
          <i class="fas fa-times"></i>
        </button>
      {/if}
    </div>

    <!-- Beat Count Filter Info -->
    {#if beatCountMessage}
      <div class="filter-info">
        <i class="fas fa-filter"></i>
        <span>{beatCountMessage}</span>
      </div>
    {/if}

    <!-- Sequence Grid -->
    <div class="sequence-grid-container">
      {#if isLoading}
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading sequences...</p>
        </div>
      {:else if error}
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onclick={loadSequences}>Retry</button>
        </div>
      {:else if filteredSequences.length === 0}
        <div class="empty-state">
          <i class="fas fa-search"></i>
          <p>No sequences found</p>
        </div>
      {:else}
        <div class="sequence-grid">
          {#each filteredSequences as sequence (sequence.id)}
            {@const coverUrl = getCoverUrl(sequence)}
            <SequenceCard
              {sequence}
              {...coverUrl && { coverUrl }}
              onPrimaryAction={handleSelect}
            />
          {/each}
        </div>
      {/if}
    </div>
  </div>
</Drawer>

<style>
  :global(.sequence-browser-panel) {
    max-width: 500px;
  }

  .browser-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Header */
  .browser-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .browser-header h2 {
    flex: 1;
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .close-button {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Search */
  .search-container {
    position: relative;
    padding: var(--spacing-md) var(--spacing-lg);
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    flex-shrink: 0;
  }

  .search-icon {
    position: absolute;
    left: calc(var(--spacing-lg) + var(--spacing-md));
    top: 50%;
    transform: translateY(-50%);
    opacity: 0.5;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    padding-left: calc(var(--spacing-xl) + var(--spacing-sm));
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-md);
    color: white;
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: rgba(236, 72, 153, 0.5);
    background: rgba(255, 255, 255, 0.08);
  }

  .clear-search {
    position: absolute;
    right: calc(var(--spacing-lg) + var(--spacing-sm));
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    opacity: 0.7;
    transition: all 0.2s ease;
  }

  .clear-search:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.2);
  }

  /* Filter Info */
  .filter-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: rgba(59, 130, 246, 0.1);
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    font-size: 0.875rem;
  }

  .filter-info i {
    font-size: 0.875rem;
  }

  /* Grid Container */
  .sequence-grid-container {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-lg);
  }

  .sequence-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--spacing-md);
  }

  /* Loading/Error/Empty States */
  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    gap: var(--spacing-md);
    color: rgba(255, 255, 255, 0.5);
  }

  .error-state i,
  .empty-state i {
    font-size: 3rem;
    opacity: 0.3;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #ec4899;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .error-state button {
    padding: var(--spacing-sm) var(--spacing-lg);
    background: rgba(236, 72, 153, 0.2);
    border: 1px solid rgba(236, 72, 153, 0.3);
    border-radius: var(--border-radius-md);
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .error-state button:hover {
    background: rgba(236, 72, 153, 0.3);
  }
</style>
