<script lang="ts">
  /**
   * AnalyticsDashboard
   * Comprehensive analytics view for admin users
   *
   * Uses Firebase Firestore data via AnalyticsDataService
   */
  import { onMount } from "svelte";
  import { resolve, TYPES, loadFeatureModule } from "$lib/shared/inversify/di";
  import type {
    IAnalyticsDataService,
    AnalyticsTimeRange,
    EventTypeBreakdown,
    ModuleUsageData,
    RecentActivityEvent,
  } from "../services/contracts/IAnalyticsDataService";

  import MetricCard from "./analytics/MetricCard.svelte";
  import UserActivityChart from "./analytics/UserActivityChart.svelte";
  import EventBreakdown from "./analytics/EventBreakdown.svelte";
  import ModuleUsage from "./analytics/ModuleUsage.svelte";
  import RecentActivityFeed from "./analytics/RecentActivityFeed.svelte";
  import ContentStatistics from "./analytics/ContentStatistics.svelte";
  import EngagementMetrics from "./analytics/EngagementMetrics.svelte";
  import { calculateChange, formatNumber } from "./analytics/utils";
  import type {
    MetricCardData,
    TimeSeriesPoint,
    ContentStat,
    TopSequence,
    EngagementStat,
    TimeRangeOption,
  } from "./analytics/types";

  // State
  let hasError = $state(false);
  let errorMessage = $state("");
  let selectedTimeRange = $state<TimeRangeOption>("30d");

  // Per-section loading states
  let loadingSummary = $state(true);
  let loadingActivity = $state(true);
  let loadingContent = $state(true);
  let loadingEngagement = $state(true);
  let loadingEvents = $state(true);
  let loadingModules = $state(true);
  let loadingRecent = $state(true);

  // Analytics data
  let summaryMetrics = $state<MetricCardData[]>([]);
  let userActivityData = $state<TimeSeriesPoint[]>([]);
  let contentStats = $state<ContentStat[]>([]);
  let topSequences = $state<TopSequence[]>([]);
  let engagementStats = $state<EngagementStat[]>([]);

  // Activity event data
  let eventBreakdown = $state<EventTypeBreakdown[]>([]);
  let moduleUsage = $state<ModuleUsageData[]>([]);
  let recentActivity = $state<RecentActivityEvent[]>([]);

  // Service reference
  let analyticsService: IAnalyticsDataService | null = null;

  function getTimeRange(): AnalyticsTimeRange {
    const days =
      selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return { days, startDate, endDate };
  }

  async function loadAnalyticsData() {
    if (!analyticsService) {
      console.error("AnalyticsDashboard: Service not initialized");
      return;
    }

    hasError = false;
    const timeRange = getTimeRange();

    // Reset all loading states
    loadingSummary = true;
    loadingActivity = true;
    loadingContent = true;
    loadingEngagement = true;
    loadingEvents = true;
    loadingModules = true;
    loadingRecent = true;

    // Load each section independently - they update as they arrive
    analyticsService
      .getSummaryMetrics(timeRange)
      .then((summary) => {
        summaryMetrics = [
          {
            label: "Total Users",
            value: formatNumber(summary.totalUsers),
            change: 0,
            changeLabel: "all time",
            icon: "fas fa-users",
            color: "#3b82f6",
          },
          {
            label: "Active Today",
            value: formatNumber(summary.activeToday),
            change: calculateChange(
              summary.activeToday,
              summary.previousActiveToday
            ),
            changeLabel: "vs yesterday",
            icon: "fas fa-user-check",
            color: "#10b981",
          },
          {
            label: "Total Sequences",
            value: formatNumber(summary.sequencesCreated),
            change: 0,
            changeLabel: "all time",
            icon: "fas fa-layer-group",
            color: "var(--theme-accent-strong, #8b5cf6)",
          },
          {
            label: "Total Challenges",
            value: formatNumber(summary.challengesCompleted),
            change: 0,
            changeLabel: "all time",
            icon: "fas fa-trophy",
            color: "#f59e0b",
          },
        ];
        loadingSummary = false;
      })
      .catch((err) => {
        console.error("Failed to load summary metrics", err);
        loadingSummary = false;
      });

    analyticsService
      .getUserActivity(timeRange)
      .then((activity) => {
        userActivityData = activity.map((point) => ({
          date: point.date,
          value: point.activeUsers,
        }));
        loadingActivity = false;
      })
      .catch((err) => {
        console.error("Failed to load user activity", err);
        loadingActivity = false;
      });

    Promise.all([
      analyticsService.getContentStatistics(),
      analyticsService.getTopSequences(5),
    ])
      .then(([content, sequences]) => {
        contentStats = [
          {
            label: "Total Sequences",
            value: content.totalSequences,
            icon: "fas fa-layer-group",
          },
          {
            label: "Public Sequences",
            value: content.publicSequences,
            icon: "fas fa-globe",
          },
          {
            label: "Gallery Views",
            value: content.totalViews,
            icon: "fas fa-eye",
          },
          {
            label: "Shares",
            value: content.totalShares,
            icon: "fas fa-share-alt",
          },
        ];
        topSequences = sequences.map((seq) => ({
          name: seq.name,
          word: seq.word,
          views: seq.views,
          creator: seq.creator,
        }));
        loadingContent = false;
      })
      .catch((err) => {
        console.error("Failed to load content stats", err);
        loadingContent = false;
      });

    analyticsService
      .getEngagementMetrics()
      .then((engagement) => {
        engagementStats = [
          {
            label: "Daily Challenges",
            value: engagement.challengeParticipants,
            total: engagement.totalUsers,
            icon: "fas fa-calendar-check",
            color: "#f59e0b",
          },
          {
            label: "Achievements Unlocked",
            value: engagement.achievementsUnlocked,
            total: engagement.totalAchievementsPossible,
            icon: "fas fa-award",
            color: "#ec4899",
          },
          {
            label: "Active Streaks",
            value: engagement.activeStreaks,
            total: engagement.totalUsers,
            icon: "fas fa-fire",
            color: "#ef4444",
          },
          {
            label: "XP Earned (K)",
            value: Math.round(engagement.totalXPEarned / 1000),
            total: Math.max(
              1000,
              Math.round((engagement.totalXPEarned / 1000) * 2)
            ),
            icon: "fas fa-star",
            color: "var(--theme-accent-strong, #8b5cf6)",
          },
        ];
        loadingEngagement = false;
      })
      .catch((err) => {
        console.error("Failed to load engagement metrics", err);
        loadingEngagement = false;
      });

    analyticsService
      .getEventTypeBreakdown(timeRange)
      .then((events) => {
        eventBreakdown = events;
        loadingEvents = false;
      })
      .catch((err) => {
        console.error("Failed to load event breakdown", err);
        loadingEvents = false;
      });

    analyticsService
      .getModuleUsage(timeRange)
      .then((modules) => {
        moduleUsage = modules;
        loadingModules = false;
      })
      .catch((err) => {
        console.error("Failed to load module usage", err);
        loadingModules = false;
      });

    analyticsService
      .getRecentActivity(10)
      .then((recent) => {
        recentActivity = recent;
        loadingRecent = false;
      })
      .catch((err) => {
        console.error("Failed to load recent activity", err);
        loadingRecent = false;
      });
  }

  onMount(async () => {
    try {
      await loadFeatureModule("admin");
      analyticsService = resolve<IAnalyticsDataService>(
        TYPES.IAnalyticsDataService
      );
      loadAnalyticsData();
    } catch (error) {
      console.error("AnalyticsDashboard: Failed to get service", error);
      hasError = true;
      errorMessage = "Failed to initialize analytics service";
      loadingSummary = false;
      loadingActivity = false;
      loadingContent = false;
      loadingEngagement = false;
      loadingEvents = false;
      loadingModules = false;
      loadingRecent = false;
    }
  });

  let previousTimeRange = $state<string | null>(null);

  $effect(() => {
    const currentRange = selectedTimeRange;
    if (
      analyticsService &&
      previousTimeRange !== null &&
      previousTimeRange !== currentRange
    ) {
      loadAnalyticsData();
    }
    previousTimeRange = currentRange;
  });
</script>

<div class="analytics-dashboard">
  {#if hasError}
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Failed to load analytics</p>
      <span class="error-message">{errorMessage}</span>
      <button onclick={() => loadAnalyticsData()}>
        <i class="fas fa-redo"></i> Retry
      </button>
    </div>
  {/if}

  <header class="dashboard-header">
    <h2>Analytics Overview</h2>
    <div class="time-range-selector">
      <button
        class:active={selectedTimeRange === "7d"}
        onclick={() => (selectedTimeRange = "7d")}
      >
        7 Days
      </button>
      <button
        class:active={selectedTimeRange === "30d"}
        onclick={() => (selectedTimeRange = "30d")}
      >
        30 Days
      </button>
      <button
        class:active={selectedTimeRange === "90d"}
        onclick={() => (selectedTimeRange = "90d")}
      >
        90 Days
      </button>
    </div>
  </header>

  <section class="metrics-grid">
    {#if loadingSummary}
      {#each Array(4) as _}
        <MetricCard loading={true} />
      {/each}
    {:else}
      {#each summaryMetrics as metric}
        <MetricCard {metric} />
      {/each}
    {/if}
  </section>

  <UserActivityChart data={userActivityData} loading={loadingActivity} />

  <div class="two-column">
    <EventBreakdown events={eventBreakdown} loading={loadingEvents} />
    <ModuleUsage modules={moduleUsage} loading={loadingModules} />
  </div>

  <RecentActivityFeed
    activities={recentActivity}
    {eventBreakdown}
    loading={loadingRecent}
  />

  <div class="two-column">
    <ContentStatistics
      stats={contentStats}
      {topSequences}
      loading={loadingContent}
    />
    <EngagementMetrics stats={engagementStats} loading={loadingEngagement} />
  </div>

  {#if !loadingSummary && summaryMetrics.length > 0 && summaryMetrics[0]?.value === "0"}
    <div class="data-notice warning">
      <i class="fas fa-info-circle"></i>
      <span
        >No data available. Please ensure you're signed in with an admin account
        and Firebase has user data.</span
      >
      <button class="refresh-btn" onclick={() => loadAnalyticsData()}>
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
    </div>
  {:else if !loadingSummary}
    <div class="data-notice success">
      <i class="fas fa-database"></i>
      <span>Showing live data from Firebase Firestore.</span>
      <button class="refresh-btn" onclick={() => loadAnalyticsData()}>
        <i class="fas fa-sync-alt"></i> Refresh
      </button>
    </div>
  {/if}
</div>

<style>
  .analytics-dashboard {
    padding: 24px;
    max-width: 1600px;
    width: 100%;
    margin: 0 auto;
    color: rgba(255, 255, 255, 0.95);
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 12px;
    color: rgba(255, 255, 255, 0.6);
  }

  .error-state i {
    font-size: 48px;
    color: #ef4444;
  }

  .error-state p {
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .error-state .error-message {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
    max-width: 400px;
    text-align: center;
  }

  .error-state button {
    margin-top: 8px;
    padding: 10px 20px;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .error-state button:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .dashboard-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .time-range-selector {
    display: flex;
    gap: 8px;
    background: rgba(255, 255, 255, 0.05);
    padding: 4px;
    border-radius: 8px;
  }

  .time-range-selector button {
    padding: 8px 16px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
  }

  .time-range-selector button:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .time-range-selector button.active {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .two-column {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 24px;
  }

  .data-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 8px;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 24px;
  }

  .data-notice i {
    color: #3b82f6;
  }

  .data-notice.success {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .data-notice.success i {
    color: #10b981;
  }

  .data-notice.warning {
    background: rgba(245, 158, 11, 0.1);
    border-color: rgba(245, 158, 11, 0.2);
  }

  .data-notice.warning i {
    color: #f59e0b;
  }

  .data-notice .refresh-btn {
    margin-left: auto;
    padding: 6px 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }

  .data-notice .refresh-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
  }

  @media (max-width: 768px) {
    .analytics-dashboard {
      padding: 16px;
    }

    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .two-column {
      grid-template-columns: 1fr;
    }

    .metrics-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
