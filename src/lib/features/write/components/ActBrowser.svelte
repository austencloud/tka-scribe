<!-- ActBrowser.svelte - Act browser component with grid layout -->
<script lang="ts">
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ActThumbnailInfo } from "../../word-card/domain/types/write";
  import { onMount } from "svelte";
  import ActThumbnail from "./ActThumbnail.svelte";

  // Props
  let {
    acts = [],
    isLoading = false,
    onActSelected,
    onRefresh,
  } = $props<{
    acts?: ActThumbnailInfo[];
    isLoading?: boolean;
    onActSelected?: (filePath: string) => void;
    onRefresh?: () => void;
  }>();

  // Services
  let hapticService: IHapticFeedback;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  // Handle refresh
  function handleRefresh() {
    // Trigger selection haptic feedback for refresh
    hapticService?.trigger("selection");

    onRefresh?.();
  }

  // Handle act selection
  function handleActSelected(filePath: string) {
    // Trigger selection haptic feedback for act selection
    hapticService?.trigger("selection");
    onActSelected?.(filePath);
  }
</script>

<div class="act-browser">
  <!-- Header -->
  <div class="browser-header">
    <h3 class="browser-title">Acts</h3>
    <button
      class="refresh-button btn-glass"
      onclick={handleRefresh}
      disabled={isLoading}
    >
      {#if isLoading}
        🔄 Loading...
      {:else}
        🔄 Refresh
      {/if}
    </button>
  </div>

  <!-- Content -->
  <div class="browser-content">
    {#if isLoading}
      <!-- Loading state -->
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading acts...</p>
      </div>
    {:else if acts.length === 0}
      <!-- Empty state -->
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <h4>No Acts Found</h4>
        <p>Create your first act to get started.</p>
        <button class="refresh-button btn-primary" onclick={handleRefresh}>
          🔄 Refresh
        </button>
      </div>
    {:else}
      <!-- Acts grid -->
      <div class="acts-grid">
        {#each acts as act (act.id)}
          <ActThumbnail actInfo={act} onActSelected={handleActSelected} />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .act-browser {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    min-width: 252px;
    background: var(--surface-color);
    backdrop-filter: var(--glass-backdrop);
    border: var(--glass-border);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-glass);
    overflow: hidden;
  }

  .browser-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: rgba(255, 255, 255, 0.05);
    border-bottom: var(--glass-border);
    backdrop-filter: var(--glass-backdrop);
  }

  .browser-title {
    color: var(--text-color);
    font-size: var(--font-size-lg);
    font-weight: bold;
    margin: 0;
    text-shadow: var(--text-shadow-glass);
  }

  .refresh-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: 6px;
    font-size: var(--font-size-sm);
    font-weight: 500;
    transition: all var(--transition-normal);
    white-space: nowrap;
  }

  .refresh-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .browser-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--spacing-md);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    gap: var(--spacing-md);
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .loading-state p {
    color: var(--text-secondary);
    margin: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 300px;
    text-align: center;
    gap: var(--spacing-md);
  }

  .empty-icon {
    font-size: 4rem;
    opacity: 0.5;
  }

  .empty-state h4 {
    color: var(--text-color);
    font-size: var(--font-size-lg);
    margin: 0;
    text-shadow: var(--text-shadow-glass);
  }

  .empty-state p {
    color: var(--text-secondary);
    margin: 0;
    max-width: 200px;
  }

  .acts-grid {
    display: grid;
    /* 🎯 Pure CSS auto-fit grid - no JavaScript needed! */
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--spacing-md);
    justify-items: center;
    align-items: start;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .act-browser {
      min-width: 200px;
    }

    .browser-header {
      padding: var(--spacing-sm);
    }

    .browser-title {
      font-size: var(--font-size-base);
    }

    .refresh-button {
      padding: var(--spacing-xs);
      font-size: var(--font-size-xs);
    }

    .browser-content {
      padding: var(--spacing-sm);
    }

    .acts-grid {
      gap: var(--spacing-sm);
    }
  }

  @media (max-width: 480px) {
    .act-browser {
      min-width: 152px;
    }

    .empty-state {
      height: 200px;
    }

    .empty-icon {
      font-size: 3rem;
    }
  }

  /* Custom scrollbar */
  .browser-content::-webkit-scrollbar {
    width: 8px;
  }

  .browser-content::-webkit-scrollbar-track {
    background: transparent;
    border-radius: var(--border-radius-sm);
  }

  .browser-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--border-radius-sm);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .browser-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
</style>
