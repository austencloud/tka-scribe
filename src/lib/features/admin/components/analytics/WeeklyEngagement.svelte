<script lang="ts">
  /**
   * WeeklyEngagement.svelte
   *
   * Shows weekly engagement metrics calculated from cached SystemState data.
   * No additional Firebase queries - uses the 2-min cached user data.
   */
  import { onMount } from "svelte";
  import { resolve, TYPES, loadFeatureModule } from "$lib/shared/inversify/di";
  import type {
    ISystemStateService,
    CachedUserMetadata,
  } from "../../services/contracts/ISystemStateService";

  let isLoading = $state(true);
  let users = $state<CachedUserMetadata[]>([]);
  let cacheAge = $state<string>("");

  // Calculate date boundaries
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Metrics derived from user data
  const metrics = $derived(() => {
    const totalUsers = users.length;

    // New users this week
    const newThisWeek = users.filter(
      (u) => u.createdAt && u.createdAt >= weekAgo
    ).length;

    // New users last week (for comparison)
    const newLastWeek = users.filter(
      (u) => u.createdAt && u.createdAt >= twoWeeksAgo && u.createdAt < weekAgo
    ).length;

    // Active users this week
    const activeThisWeek = users.filter(
      (u) => u.lastActivityDate && u.lastActivityDate >= weekAgo
    ).length;

    // Returning users (active this week, created before this week)
    const returningUsers = users.filter(
      (u) =>
        u.lastActivityDate &&
        u.lastActivityDate >= weekAgo &&
        u.createdAt &&
        u.createdAt < weekAgo
    ).length;

    // Users with active streaks
    const usersWithStreaks = users.filter((u) => u.currentStreak > 0).length;

    // Average streak among active streakers
    const activeStreakers = users.filter((u) => u.currentStreak > 0);
    const avgStreak =
      activeStreakers.length > 0
        ? Math.round(
            activeStreakers.reduce((sum, u) => sum + u.currentStreak, 0) /
              activeStreakers.length
          )
        : 0;

    return {
      totalUsers,
      newThisWeek,
      newLastWeek,
      activeThisWeek,
      returningUsers,
      usersWithStreaks,
      avgStreak,
    };
  });

  // Calculate change indicator
  function getChange(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const change = Math.round(((current - previous) / previous) * 100);
    return change > 0 ? `+${change}%` : `${change}%`;
  }

  onMount(async () => {
    try {
      await loadFeatureModule("admin");
      const systemStateService = resolve<ISystemStateService>(
        TYPES.ISystemStateService
      );
      const state = await systemStateService.getSystemState();
      users = state.users;

      // Show cache age
      const ageMs = Date.now() - state.loadedAt;
      if (ageMs < 60000) {
        cacheAge = "just now";
      } else {
        cacheAge = `${Math.round(ageMs / 60000)}m ago`;
      }
    } catch (error) {
      console.error("Failed to load system state:", error);
    } finally {
      isLoading = false;
    }
  });
</script>

<section class="section">
  <header class="section-header">
    <h3><i class="fas fa-chart-line"></i> Weekly Engagement</h3>
    {#if cacheAge}
      <span class="cache-indicator" title="Data cached from SystemState">
        <i class="fas fa-database"></i> {cacheAge}
      </span>
    {/if}
  </header>

  {#if isLoading}
    <div class="metrics-grid">
      {#each Array(4) as _}
        <div class="metric-card skeleton">
          <div class="skeleton-value"></div>
          <div class="skeleton-label"></div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">{metrics().activeThisWeek}</div>
        <div class="metric-label">Active This Week</div>
        <div class="metric-sub">of {metrics().totalUsers} total</div>
      </div>

      <div class="metric-card">
        <div class="metric-value">{metrics().newThisWeek}</div>
        <div class="metric-label">New Users</div>
        <div class="metric-change" class:positive={metrics().newThisWeek >= metrics().newLastWeek}>
          {getChange(metrics().newThisWeek, metrics().newLastWeek)} vs last week
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-value">{metrics().returningUsers}</div>
        <div class="metric-label">Returning Users</div>
        <div class="metric-sub">active again this week</div>
      </div>

      <div class="metric-card">
        <div class="metric-value">{metrics().avgStreak}</div>
        <div class="metric-label">Avg Streak</div>
        <div class="metric-sub">{metrics().usersWithStreaks} users with streaks</div>
      </div>
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

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .section-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .section-header h3 i {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .cache-indicator {
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .metric-card {
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.04));
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--theme-text, white);
    line-height: 1;
    margin-bottom: 6px;
  }

  .metric-label {
    font-size: 13px;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    margin-bottom: 4px;
  }

  .metric-sub {
    font-size: 11px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .metric-change {
    font-size: 11px;
    color: var(--semantic-error, #ef4444);
  }

  .metric-change.positive {
    color: var(--semantic-success, #10b981);
  }

  /* Skeleton loading */
  .metric-card.skeleton {
    background: var(--theme-panel-bg, rgba(255, 255, 255, 0.04));
  }

  .skeleton-value {
    width: 48px;
    height: 28px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 4px;
    margin: 0 auto 8px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-label {
    width: 80px;
    height: 13px;
    background: var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 3px;
    margin: 0 auto;
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

  @media (max-width: 400px) {
    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
