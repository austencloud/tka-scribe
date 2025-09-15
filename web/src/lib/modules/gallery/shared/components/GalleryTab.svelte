<script lang="ts">
  import type { SequenceData } from "$shared";
  import { ErrorBanner, LoadingSpinner, resolve, TYPES } from "$shared";
  import { onDestroy, onMount } from "svelte";
  import { showSpotlight } from "../../../../shared/application/state/app-state.svelte";

  import type { IGalleryThumbnailService } from "../../display";
  import { SequenceDisplayPanel } from "../../display/components";
  import FilterModal from "../../filtering/components/FilterModal.svelte";
  import SortControls from "../../filtering/components/SortControls.svelte";
  import { SimpleNavigationSidebar } from "../../navigation/components";
  import { createGalleryState } from "../state/gallery-state-factory.svelte";
  import GalleryDeleteDialog from "./GalleryDeleteDialog.svelte";
  import GalleryLayout from "./GalleryLayout.svelte";

  // ============================================================================
  // STATE MANAGEMENT (Shared Coordination)
  // ============================================================================

  const galleryState = createGalleryState();
  const thumbnailService = resolve<IGalleryThumbnailService>(TYPES.IGalleryThumbnailService);

  // ✅ PURE RUNES: Local state
  let selectedSequence = $state<SequenceData | null>(null);
  let deleteConfirmationData = $state<any>(null);
  let error = $state<string | null>(null);
  let isInitialized = $state(false);

  // ============================================================================
  // EVENT HANDLERS (Coordination)
  // ============================================================================

  function handleSequenceSelect(sequence: SequenceData) {
    selectedSequence = sequence;
    galleryState.selectSequence(sequence);
    console.log("✅ GalleryTab: Sequence selected:", sequence);
  }

  async function handleSequenceAction(action: string, sequence: SequenceData) {
    console.log("🎬 BrowseTab: handleSequenceAction called with:", action, "for sequence:", sequence.id);
    
    try {
      switch (action) {
        case "select":
          handleSequenceSelect(sequence);
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
        default:
          console.warn("⚠️ BrowseTab: Unknown action:", action);
      }
    } catch (err) {
      console.error("❌ BrowseTab: Action failed:", err);
      error = err instanceof Error ? err.message : `Failed to ${action} sequence`;
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
    console.log("🎭 BrowseTab: Opening spotlight for sequence:", sequence.id);
    showSpotlight(sequence, thumbnailService);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirmationData?.sequence) return;

    try {
      // TODO: Implement actual delete logic
      console.log("🗑️ BrowseTab: Deleting sequence:", deleteConfirmationData.sequence.id);
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

  onMount(async () => {
    console.log("✅ GalleryTab: Mounted");

    try {
      // Load initial data through gallery state
      await galleryState.loadAllSequences();

      isInitialized = true;
      console.log("✅ GalleryTab: Initialization complete");
    } catch (err) {
      console.error("❌ GalleryTab: Initialization failed:", err);
      error = err instanceof Error ? err.message : "Failed to initialize gallery tab";
      isInitialized = true; // Mark as initialized even on error to prevent infinite loading
    }
  });

  onDestroy(() => {
    console.log("✅ GalleryTab: Cleanup");
  });
</script>

<!-- Error banner -->
{#if error}
  <ErrorBanner
    show={true}
    message={error}
    onDismiss={handleErrorDismiss}
    onRetry={handleRetry}
  />
{/if}

<!-- Delete confirmation dialog -->
{#if deleteConfirmationData}
  <GalleryDeleteDialog
    show={true}
    confirmationData={deleteConfirmationData}
    onConfirm={handleDeleteConfirm}
    onCancel={handleDeleteCancel}
  />
{/if}

<!-- Main layout with panels -->
{#if isInitialized}
  <div class="gallery-content" class:ready={!galleryState.isLoading}>
    <GalleryLayout>
      {#snippet sortControls()}
        <SortControls
          currentSort={galleryState.currentSortMethod}
          sortDirection={galleryState.sortDirection}
          onSortChange={galleryState.handleSortChange}
          onFilterClick={galleryState.openFilterModal}
        />
      {/snippet}

      {#snippet navigationSidebar()}
        <SimpleNavigationSidebar
          currentSortMethod={galleryState.currentSortMethod}
          availableSections={galleryState.availableNavigationSections()}
          onSectionClick={galleryState.scrollToSection}
        />
      {/snippet}

      {#snippet centerPanel()}
        <SequenceDisplayPanel
          sequences={galleryState.displayedSequences}
          sections={galleryState.sequenceSections}
          isLoading={galleryState.isLoading}
          error={error}
          showSections={galleryState.showSections}
          onAction={handleSequenceAction}
        />
      {/snippet}
    </GalleryLayout>

    <!-- Filter Modal -->
    <FilterModal
      isOpen={galleryState.isFilterModalOpen}
      currentFilter={galleryState.currentFilter}
      availableSequenceLengths={galleryState.availableSequenceLengths()}
      onFilterChange={galleryState.handleFilterChange}
      onClose={galleryState.closeFilterModal}
    />
  </div>
{:else}
  <!-- Initial loading state -->
  <LoadingSpinner 
    overlay={true}
    message="Loading sequences..." 
    show={true}
  />
{/if}

<style>
  .gallery-content {
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .gallery-content.ready {
    opacity: 1;
  }
</style>