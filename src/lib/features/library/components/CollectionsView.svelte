<!--
  CollectionsView.svelte - Collections Tab Content

  Displays user's collections (folders) with ability to:
  - View all collections
  - Create new collections
  - Open collection to see contents
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ICollectionService } from "../services/contracts/ICollectionService";
  import type { LibraryCollection } from "../domain/models/Collection";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import PanelState from "$lib/shared/components/panel/PanelState.svelte";
  import PanelButton from "$lib/shared/components/panel/PanelButton.svelte";

  let collections = $state<LibraryCollection[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let collectionService: ICollectionService | null = null;

  const isAuthenticated = $derived(!!authStore.user);

  onMount(async () => {
    if (!isAuthenticated) {
      isLoading = false;
      return;
    }

    try {
      collectionService = resolve<ICollectionService>(TYPES.ICollectionService);
      collections = await collectionService.getCollections();
      isLoading = false;
    } catch (err) {
      console.error("[CollectionsView] Failed to load collections:", err);
      error = err instanceof Error ? err.message : "Failed to load collections";
      isLoading = false;
    }
  });

  async function handleCreateCollection() {
    // TODO: Open create collection modal
    console.log("[CollectionsView] Create collection clicked");
  }

  function handleOpenCollection(collection: LibraryCollection) {
    // TODO: Navigate to collection detail view
    console.log("[CollectionsView] Open collection:", collection.id);
  }
</script>

<div class="collections-view">
  {#if !isAuthenticated}
    <PanelState
      type="info"
      title="Sign In Required"
      message="Sign in to view and create collections"
    />
  {:else if isLoading}
    <PanelState type="loading" message="Loading collections..." />
  {:else if error}
    <PanelState type="error" title="Error" message={error} />
  {:else}
    <!-- Header with create button -->
    <div class="header">
      <h2>My Collections</h2>
      <PanelButton variant="primary" onclick={handleCreateCollection}>
        <i class="fas fa-plus"></i>
        New Collection
      </PanelButton>
    </div>

    {#if collections.length === 0}
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <h3>No Collections Yet</h3>
        <p>Create collections to organize your sequences, compositions, and more.</p>
        <PanelButton variant="primary" onclick={handleCreateCollection}>
          <i class="fas fa-plus"></i>
          Create Your First Collection
        </PanelButton>
      </div>
    {:else}
      <!-- Collections grid -->
      <div class="collections-grid">
        {#each collections as collection (collection.id)}
          <button
            class="collection-card"
            onclick={() => handleOpenCollection(collection)}
            style="--card-color: {collection.color || '#8b5cf6'}"
          >
            <div class="card-icon">
              <i class="fas {collection.icon || 'fa-folder'}"></i>
            </div>
            <div class="card-content">
              <h3>{collection.name}</h3>
              <p class="item-count">
                {collection.sequenceCount}
                {collection.sequenceCount === 1 ? "item" : "items"}
              </p>
            </div>
            {#if collection.systemType}
              <div class="system-badge">
                <i class="fas fa-lock"></i>
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  .collections-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 16px;
    overflow-y: auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    text-align: center;
    padding: 40px 20px;
    color: rgba(255, 255, 255, 0.7);
  }

  .empty-state i {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.4;
  }

  .empty-state h3 {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .empty-state p {
    margin: 0 0 20px 0;
    max-width: 300px;
  }

  .collections-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .collection-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: center;
  }

  .collection-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: var(--card-color, #8b5cf6);
    transform: translateY(-2px);
  }

  .card-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--card-color, #8b5cf6);
    border-radius: 12px;
    margin-bottom: 12px;
  }

  .card-icon i {
    font-size: 1.5rem;
    color: white;
  }

  .card-content h3 {
    margin: 0 0 4px 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .item-count {
    margin: 0;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .system-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 4px;
  }

  .system-badge i {
    font-size: 0.625rem;
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 480px) {
    .collections-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .collection-card {
      padding: 16px;
    }

    .card-icon {
      width: 48px;
      height: 48px;
    }

    .card-icon i {
      font-size: 1.25rem;
    }
  }
</style>
