<!--
  LibraryDashboard.svelte - Dashboard View for Library Module

  A landing page showing quick access to:
  - Recent Sequences (with "See All" link)
  - Collections (with "See All" link)
  - Acts (with "See All" link)

  Uses a grid layout with cards for each section.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { libraryState, type LibraryViewSection } from "../state/library-state.svelte";
  import { authStore } from "$shared/auth/stores/authStore.svelte";
  import SequenceCard from "../../explore/gallery/display/components/SequenceCard/SequenceCard.svelte";
  import type { LibrarySequence } from "../domain/models/LibrarySequence";
  import type { SequenceData } from "$shared/foundation/domain/models/SequenceData";
  import { goto } from "$app/navigation";

  interface Props {
    onNavigate?: (section: LibraryViewSection) => void;
  }

  let { onNavigate }: Props = $props();

  // Derived state
  const isLoading = $derived(libraryState.isLoading);
  const error = $derived(libraryState.error);
  const isAuthenticated = $derived(!!authStore.effectiveUserId);

  // Recent sequences (last 8, sorted by update time)
  const recentSequences = $derived(() => {
    const sequences = [...libraryState.sequences];
    return sequences
      .sort((a, b) => {
        const aTime = a.updatedAt?.getTime() ?? 0;
        const bTime = b.updatedAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 8);
  });

  // Favorites (last 4)
  const favoriteSequences = $derived(() => {
    return libraryState.sequences
      .filter((s) => s.isFavorite)
      .slice(0, 4);
  });

  // Stats
  const totalSequences = $derived(libraryState.sequences.length);
  const totalFavorites = $derived(libraryState.sequences.filter((s) => s.isFavorite).length);

  // Navigation handlers
  function handleSeeAllSequences() {
    onNavigate?.("sequences");
  }

  function handleSeeAllFavorites() {
    onNavigate?.("favorites");
  }

  function handleSequenceClick(sequence: SequenceData) {
    // Navigate to sequence viewer
    goto(`/sequence?id=${sequence.id}`);
  }

  function getCoverUrl(sequence: LibrarySequence): string | undefined {
    return sequence.thumbnails?.[0];
  }

  // Initialize
  onMount(() => {
    if (isAuthenticated) {
      libraryState.initialize();
    }
  });

  onDestroy(() => {
    libraryState.dispose();
  });

  // Re-initialize when auth changes
  $effect(() => {
    if (isAuthenticated) {
      libraryState.initialize();
    } else {
      libraryState.reset();
    }
  });
</script>

<div class="library-dashboard">
  {#if !isAuthenticated}
    <div class="auth-required">
      <i class="fas fa-lock"></i>
      <h3>Sign In Required</h3>
      <p>Please sign in to access your personal library.</p>
    </div>
  {:else if isLoading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading your library...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Error Loading Library</h3>
      <p>{error}</p>
      <button class="retry-btn" onclick={() => libraryState.initialize()}>
        <i class="fas fa-redo"></i>
        Retry
      </button>
    </div>
  {:else}
    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-value">{totalSequences}</span>
          <span class="stat-label">Sequences</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{totalFavorites}</span>
          <span class="stat-label">Favorites</span>
        </div>
      </div>

      <!-- Recent Sequences Section -->
      <section class="dashboard-section">
        <div class="section-header">
          <div class="section-title">
            <i class="fas fa-clock"></i>
            <h2>Recent Sequences</h2>
          </div>
          {#if totalSequences > 0}
            <button class="see-all-btn" onclick={handleSeeAllSequences}>
              See All <i class="fas fa-chevron-right"></i>
            </button>
          {/if}
        </div>

        {#if recentSequences().length > 0}
          <div class="sequences-grid">
            {#each recentSequences() as sequence (sequence.id)}
              <SequenceCard
                {sequence}
                coverUrl={getCoverUrl(sequence)}
                onPrimaryAction={handleSequenceClick}
              />
            {/each}
          </div>
        {:else}
          <div class="empty-section">
            <i class="fas fa-plus-circle"></i>
            <p>No sequences yet. Create your first sequence!</p>
          </div>
        {/if}
      </section>

      <!-- Favorites Section -->
      {#if totalFavorites > 0}
        <section class="dashboard-section">
          <div class="section-header">
            <div class="section-title">
              <i class="fas fa-star"></i>
              <h2>Favorites</h2>
            </div>
            <button class="see-all-btn" onclick={handleSeeAllFavorites}>
              See All <i class="fas fa-chevron-right"></i>
            </button>
          </div>

          <div class="sequences-grid compact">
            {#each favoriteSequences() as sequence (sequence.id)}
              <SequenceCard
                {sequence}
                coverUrl={getCoverUrl(sequence)}
                onPrimaryAction={handleSequenceClick}
              />
            {/each}
          </div>
        </section>
      {/if}

      <!-- Collections & Acts will be added in future updates -->
    </div>
  {/if}
</div>

<style>
  .library-dashboard {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: transparent;
    color: var(--foreground, #ffffff);
  }

  /* Loading State */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.7);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgba(16, 185, 129, 0.8);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: var(--spacing-md, 16px);
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
    color: rgba(255, 255, 255, 0.7);
    padding: var(--spacing-xl, 32px);
  }

  .auth-required i {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg, 24px);
    opacity: 0.5;
  }

  .auth-required h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md, 16px);
    color: rgba(255, 255, 255, 0.9);
  }

  /* Error State */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    padding: var(--spacing-xl, 32px);
  }

  .error-state i {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg, 24px);
    color: rgba(239, 68, 68, 0.7);
  }

  .error-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-md, 16px);
    color: rgba(255, 255, 255, 0.9);
  }

  .retry-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 4px);
    padding: var(--spacing-sm, 8px) var(--spacing-lg, 24px);
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid rgba(16, 185, 129, 0.4);
    border-radius: var(--border-radius-md, 8px);
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: var(--spacing-md, 16px);
  }

  .retry-btn:hover {
    background: rgba(16, 185, 129, 0.3);
    border-color: rgba(16, 185, 129, 0.5);
  }

  /* Dashboard Content */
  .dashboard-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--spacing-lg, 24px);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl, 32px);
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    gap: var(--spacing-md, 16px);
    padding: var(--spacing-lg, 24px);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--border-radius-lg, 12px);
    justify-content: space-around;
    flex-wrap: wrap;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs, 4px);
    min-width: 80px;
  }

  .stat-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(16, 185, 129, 0.9);
  }

  .stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Dashboard Section */
  .dashboard-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md, 16px);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-md, 16px);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm, 8px);
  }

  .section-title i {
    font-size: 1.25rem;
    color: rgba(16, 185, 129, 0.8);
  }

  .section-title h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .see-all-btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs, 4px);
    padding: var(--spacing-xs, 4px) var(--spacing-sm, 8px);
    background: transparent;
    border: none;
    color: rgba(16, 185, 129, 0.9);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .see-all-btn:hover {
    color: rgba(16, 185, 129, 1);
    transform: translateX(2px);
  }

  .see-all-btn i {
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }

  .see-all-btn:hover i {
    transform: translateX(2px);
  }

  /* Sequences Grid */
  .sequences-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: var(--spacing-md, 16px);
  }

  .sequences-grid.compact {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  /* Empty Section */
  .empty-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl, 32px);
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-lg, 12px);
    text-align: center;
    gap: var(--spacing-sm, 8px);
  }

  .empty-section i {
    font-size: 2rem;
    color: rgba(255, 255, 255, 0.3);
  }

  .empty-section p {
    margin: 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
  }

  /* Responsive adjustments */
  @media (max-width: 600px) {
    .dashboard-content {
      padding: var(--spacing-md, 16px);
    }

    .stats-bar {
      padding: var(--spacing-md, 16px);
    }

    .stat-value {
      font-size: 1.5rem;
    }

    .sequences-grid {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    }
  }
</style>
