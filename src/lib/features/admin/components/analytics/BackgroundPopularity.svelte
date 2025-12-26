<script lang="ts">
  /**
   * BackgroundPopularity.svelte
   *
   * Admin analytics component showing which backgrounds are most popular.
   * Displays a ranked list with usage counts and visual bars.
   */
  import { onMount } from "svelte";
  import { BackgroundPopularityService } from "$lib/shared/settings/services/implementations/BackgroundPopularityService";
  import { backgroundsConfig } from "$lib/shared/settings/components/tabs/background/background-config";
  import type { BackgroundPopularityCounts } from "$lib/shared/settings/services/contracts/IBackgroundPopularityService";

  interface Props {
    loading?: boolean;
  }

  let { loading: externalLoading = false }: Props = $props();

  let counts = $state<BackgroundPopularityCounts>({});
  let isLoading = $state(true);
  let unsubscribe: (() => void) | null = null;

  // Sort backgrounds by popularity
  const sortedBackgrounds = $derived(() => {
    return backgroundsConfig
      .map((bg) => ({
        ...bg,
        count: counts[bg.type] ?? 0,
      }))
      .sort((a, b) => b.count - a.count);
  });

  const maxCount = $derived(
    Math.max(...sortedBackgrounds().map((b) => b.count), 1)
  );
  const totalUsers = $derived(
    sortedBackgrounds().reduce((sum, b) => sum + b.count, 0)
  );

  // Get color for bar based on background theme
  function getBarColor(bg: (typeof backgroundsConfig)[0]): string {
    if (bg.themeColors && bg.themeColors.length > 0) {
      return bg.themeColors[1] ?? bg.themeColors[0];
    }
    if (bg.color) {
      return bg.color === "#000000" ? "#3f3f46" : bg.color;
    }
    if (bg.colors && bg.colors.length > 0) {
      return bg.colors[1] ?? bg.colors[0];
    }
    return "#8b5cf6";
  }

  onMount(async () => {
    const service = new BackgroundPopularityService();

    // Subscribe to real-time updates
    unsubscribe = await service.subscribeToPopularity((newCounts) => {
      counts = newCounts;
      isLoading = false;
    });

    // Also fetch initial data
    const initialCounts = await service.getPopularityCounts();
    if (Object.keys(initialCounts).length > 0) {
      counts = initialCounts;
    }
    isLoading = false;

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  });

  const loading = $derived(externalLoading || isLoading);
</script>

<section class="section">
  <h3><i class="fas fa-palette"></i> Background Popularity</h3>
  {#if loading}
    <div class="background-list">
      {#each Array(5) as _, i}
        <div class="background-row">
          <div class="background-header">
            <div class="background-icon skeleton-icon"></div>
            <span class="skeleton-label"></span>
            <span class="skeleton-count"></span>
          </div>
          <div class="background-bar">
            <div
              class="background-bar-fill skeleton-bar"
              style="width: {80 - i * 12}%"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  {:else if totalUsers > 0}
    <div class="summary-row">
      <span class="summary-label">Total users tracked:</span>
      <span class="summary-value">{totalUsers.toLocaleString()}</span>
    </div>
    <div class="background-list">
      {#each sortedBackgrounds() as bg}
        <div class="background-row" class:zero={bg.count === 0}>
          <div class="background-header">
            <div
              class="background-icon"
              style="background: {getBarColor(bg)}20; color: {getBarColor(bg)}"
            >
              {#if bg.icon.startsWith("<")}
                {@html bg.icon}
              {:else}
                <span class="emoji-icon">{bg.icon}</span>
              {/if}
            </div>
            <span class="background-label">{bg.name}</span>
            <span class="background-count">
              {bg.count.toLocaleString()}
              {#if bg.count > 0}
                <span class="percentage"
                  >({Math.round((bg.count / totalUsers) * 100)}%)</span
                >
              {/if}
            </span>
          </div>
          <div class="background-bar">
            <div
              class="background-bar-fill"
              style="width: {(bg.count / maxCount) *
                100}%; background: {getBarColor(bg)}"
            ></div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-data-message">
      <i class="fas fa-info-circle"></i>
      <span
        >No background usage data yet. Stats will appear as users select
        backgrounds.</span
      >
    </div>
  {/if}
</section>

<style>
  .section {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-radius: 12px;
    padding: 20px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
  }

  .section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .section h3 i {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.04));
    border-radius: 8px;
    margin-bottom: 16px;
  }

  .summary-label {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .summary-value {
    font-size: 14px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .background-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .background-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: opacity 0.2s;
  }

  .background-row.zero {
    opacity: 0.5;
  }

  .background-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .background-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .background-icon :global(i) {
    font-size: 12px;
  }

  .emoji-icon {
    font-size: 14px;
    line-height: 1;
  }

  .background-label {
    flex: 1;
    font-size: 14px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
  }

  .background-count {
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .percentage {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    font-size: 12px;
    margin-left: 4px;
  }

  .background-bar {
    height: 4px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 2px;
    overflow: hidden;
    margin-left: 38px;
  }

  .background-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .no-data-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.03));
    border-radius: 8px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-size: 14px;
  }

  .no-data-message i {
    font-size: 20px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  /* Skeleton styles */
  .skeleton-icon {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1)) !important;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-label {
    display: block;
    flex: 1;
    height: 14px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-count {
    display: block;
    width: 50px;
    height: 13px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-bar {
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1)) !important;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
