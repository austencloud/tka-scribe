<script lang="ts">
  import type { SequenceSection } from "./../../../shared/domain/models/discover-models.ts";
  import type { IHapticFeedbackService, SequenceData } from "$shared";
  import { resolve, TYPES } from "$shared";
  import { onMount } from "svelte";
  import type { IDiscoverThumbnailService } from "../services/contracts/IDiscoverThumbnailService";
  import DiscoverGrid from "./DiscoverGrid.svelte";
  import DiscoverThumbnailSkeleton from "./DiscoverThumbnailSkeleton.svelte";
  import GalleryTopBarControls from "../../../shared/components/GalleryTopBarControls.svelte";

  let hapticService: IHapticFeedbackService;

  // ✅ PURE RUNES: Props using modern Svelte 5 runes
  const {
    sequences = [],
    sections = [],
    isLoading = false,
    error = null,
    showSections = false,
    onAction = () => {},
    onScroll,
  } = $props<{
    sequences?: SequenceData[];
    sections?: SequenceSection[];
    isLoading?: boolean;
    error?: string | null;
    showSections?: boolean;
    onAction?: (action: string, sequence: SequenceData) => void;
    onScroll?: (event: CustomEvent<{ scrollTop: number }>) => void;
  }>();

  // ✅ RESOLVE SERVICES: Get services from DI container
  const thumbnailService = resolve<IDiscoverThumbnailService>(
    TYPES.IDiscoverThumbnailService
  );

  // ✅ DERIVED RUNES: UI state
  const isEmpty = $derived(!isLoading && !error && sequences.length === 0);
  const hasSequences = $derived(!isLoading && !error && sequences.length > 0);

  // Handle sequence actions
  function handleSequenceAction(action: string, sequence: SequenceData) {
    onAction(action, sequence);
  }

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  function handleRetry() {
    hapticService?.trigger("selection");
    onAction("retry", {} as SequenceData);
  }

  // Handle scroll events and emit to parent
  function handleScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (onScroll) {
      onScroll(
        new CustomEvent("scroll", {
          detail: { scrollTop: target.scrollTop },
        })
      );
    }
  }
</script>

<div class="sequence-display-panel">
  <!-- Gallery controls (moved from TopBar) -->
  <div class="gallery-controls-container">
    <GalleryTopBarControls />
  </div>

  <!-- Content area -->
  <div class="display-content" onscroll={handleScroll}>
    {#if isLoading && sequences.length === 0}
      <!-- Show skeletons on initial load for instant feedback -->
      <DiscoverThumbnailSkeleton viewMode="grid" count={12} />
    {:else if error}
      <div class="error-state">
        <p class="error-message">{error}</p>
        <button onclick={handleRetry}> Try Again </button>
      </div>
    {:else if isEmpty}
      <div class="empty-state">
        <p>No sequences found</p>
      </div>
    {:else if hasSequences}
      <DiscoverGrid
        {sequences}
        {sections}
        viewMode="grid"
        {showSections}
        {thumbnailService}
        onAction={handleSequenceAction}
      />
    {/if}
  </div>
</div>

<style>
  .sequence-display-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  /* Gallery controls inline header */
  .gallery-controls-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .display-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-lg);
    container-type: inline-size; /* Enable container queries for responsive grid */
  }

  /* Error state */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: var(--spacing-md);
    color: #ff6b6b;
  }

  .error-message {
    margin: 0;
    text-align: center;
  }

  .error-state button {
    padding: var(--spacing-sm) var(--spacing-md);
    background: rgba(255, 107, 107, 0.2);
    border: 1px solid #ff6b6b;
    border-radius: 6px;
    color: #ff6b6b;
    cursor: pointer;
    transition: all 0.2s;
  }

  .error-state button:hover {
    background: rgba(255, 107, 107, 0.3);
  }

  /* Empty state */
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: rgba(255, 255, 255, 0.5);
  }

  .empty-state p {
    margin: 0;
    font-size: 16px;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    /* Responsive styles for mobile */
  }
</style>
