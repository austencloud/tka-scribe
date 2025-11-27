<script lang="ts">
  /**
   * AnalyticsDashboard
   * Comprehensive analytics view for admin users
   *
   * Uses Firebase Firestore data via AnalyticsDataService
   */
  import { onMount } from "svelte";
  import { container, loadFeatureModule } from "$shared/inversify/container";
  import { TYPES } from "$shared/inversify/types";
  import type {
    IAnalyticsDataService,
    AnalyticsTimeRange,
    EventTypeBreakdown,
    ModuleUsageData,
    RecentActivityEvent,
  } from "../services/contracts";

  // Types for analytics data
  interface MetricCard {
    label: string;
    value: string | number;
    change: number; // percentage change
    changeLabel: string;
    icon: string;
    color: string;
  }

  interface TimeSeriesPoint {
    date: string;
    value: number;
  }

  interface ContentStat {
    label: string;
    value: number;
    icon: string;
  }

  interface TopSequence {
    name: string;
    word: string;
    views: number;
    creator: string;
  }

  interface EngagementStat {
    label: string;
    value: number;
    total: number;
    icon: string;
    color: string;
  }

  // State
  let isLoading = $state(true);
  let hasError = $state(false);
  let errorMessage = $state("");
  let selectedTimeRange = $state<"7d" | "30d" | "90d">("30d");

  // Analytics data
  let summaryMetrics = $state<MetricCard[]>([]);
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

  /**
   * Calculate percentage change between current and previous values
   */
  function calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Format number with commas
   */
  function formatNumber(num: number): string {
    return num.toLocaleString();
  }

  /**
   * Get time range configuration
   */
  function getTimeRange(): AnalyticsTimeRange {
    const days = selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return { days, startDate, endDate };
  }

  /**
   * Load all analytics data from Firebase
   */
  async function loadAnalyticsData() {
    if (!analyticsService) {
      console.error("AnalyticsDashboard: Service not initialized");
      return;
    }

    isLoading = true;
    hasError = false;

    try {
      const timeRange = getTimeRange();

      // Load all data in parallel
      const [summary, activity, content, sequences, engagement, events, modules, recent] = await Promise.all([
        analyticsService.getSummaryMetrics(timeRange),
        analyticsService.getUserActivity(timeRange),
        analyticsService.getContentStatistics(),
        analyticsService.getTopSequences(5),
        analyticsService.getEngagementMetrics(),
        analyticsService.getEventTypeBreakdown(timeRange),
        analyticsService.getModuleUsage(timeRange),
        analyticsService.getRecentActivity(10),
      ]);

      // Store activity event data
      eventBreakdown = events;
      moduleUsage = modules;
      recentActivity = recent;

      // Transform summary metrics
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
          change: calculateChange(summary.activeToday, summary.previousActiveToday),
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
          color: "#8b5cf6",
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

      // Transform user activity data
      userActivityData = activity.map((point) => ({
        date: point.date,
        value: point.activeUsers,
      }));

      // Transform content stats
      contentStats = [
        { label: "Total Sequences", value: content.totalSequences, icon: "fas fa-layer-group" },
        { label: "Public Sequences", value: content.publicSequences, icon: "fas fa-globe" },
        { label: "Gallery Views", value: content.totalViews, icon: "fas fa-eye" },
        { label: "Shares", value: content.totalShares, icon: "fas fa-share-alt" },
      ];

      // Transform top sequences
      topSequences = sequences.map((seq) => ({
        name: seq.name,
        word: seq.word,
        views: seq.views,
        creator: seq.creator,
      }));

      // Transform engagement stats
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
          total: Math.max(1000, Math.round((engagement.totalXPEarned / 1000) * 2)),
          icon: "fas fa-star",
          color: "#8b5cf6",
        },
      ];
    } catch (error) {
      console.error("AnalyticsDashboard: Error loading data", error);
      hasError = true;
      errorMessage =
        error instanceof Error ? error.message : "Failed to load analytics data";
    } finally {
      isLoading = false;
    }
  }

  onMount(async () => {
    // Load admin module and get service from DI container
    try {
      await loadFeatureModule("admin");
      analyticsService = container.get<IAnalyticsDataService>(TYPES.IAnalyticsDataService);
      loadAnalyticsData();
    } catch (error) {
      console.error("AnalyticsDashboard: Failed to get service", error);
      hasError = true;
      errorMessage = "Failed to initialize analytics service";
      isLoading = false;
    }
  });

  // Track previous time range to detect changes
  let previousTimeRange = $state<string | null>(null);

  // Reload data when time range changes (not on initial load - that's handled by onMount)
  $effect(() => {
    const currentRange = selectedTimeRange;
    if (analyticsService && previousTimeRange !== null && previousTimeRange !== currentRange) {
      loadAnalyticsData();
    }
    previousTimeRange = currentRange;
  });

  function getChangeClass(change: number): string {
    return change >= 0 ? "positive" : "negative";
  }

  function formatChange(change: number): string {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  }

  function getBarWidth(value: number, total: number): string {
    return `${Math.min((value / total) * 100, 100)}%`;
  }

  function formatEventType(eventType: string): string {
    return eventType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  function getEventIcon(eventType: string): string {
    const icons: Record<string, string> = {
      session_start: "fa-sign-in-alt",
      module_view: "fa-eye",
      sequence_create: "fa-plus-circle",
      sequence_save: "fa-save",
      sequence_delete: "fa-trash",
      sequence_play: "fa-play-circle",
      sequence_export: "fa-download",
      setting_change: "fa-cog",
    };
    return icons[eventType] ?? "fa-circle";
  }

  function getTotalEvents(): number {
    return eventBreakdown.reduce((sum, e) => sum + e.count, 0);
  }

  function formatModuleLabel(moduleTab: string): string {
    const labels: Record<string, string> = {
      "create:constructor": "Construct",
      "create:assembler": "Assemble",
      "create:generator": "Generate",
      "learn:concepts": "Concepts",
      "learn:play": "Play",
      "explore:gallery": "Gallery",
      "explore:collections": "Collections",
      "community:leaderboards": "Leaderboards",
      "community:creators": "Creators",
      "community:support": "Support",
      "animate:single": "Single Mode",
      "animate:tunnel": "Tunnel Mode",
      "animate:mirror": "Mirror Mode",
      "animate:grid": "Grid Mode",
      "admin:analytics": "Analytics",
      "admin:challenges": "Challenges",
      "admin:users": "Users",
      "admin:flags": "Flags",
      "admin:tools": "Tools",
      create: "Create",
      explore: "Explore",
      learn: "Learn",
      library: "Library",
      animate: "Animate",
      community: "Community",
      admin: "Admin",
    };
    return labels[moduleTab] ?? moduleTab;
  }
</script>

<div class="analytics-dashboard">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading analytics from Firebase...</p>
    </div>
  {:else if hasError}
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>Failed to load analytics</p>
      <span class="error-message">{errorMessage}</span>
      <button onclick={() => loadAnalyticsData()}>
        <i class="fas fa-redo"></i> Retry
      </button>
    </div>
  {:else}
    <!-- Header with time range selector -->
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

    <!-- Summary Metric Cards -->
    <section class="metrics-grid">
      {#each summaryMetrics as metric}
        <div class="metric-card" style="--accent-color: {metric.color}">
          <div class="metric-icon">
            <i class={metric.icon}></i>
          </div>
          <div class="metric-content">
            <span class="metric-value">{metric.value}</span>
            <span class="metric-label">{metric.label}</span>
            {#if metric.changeLabel === "all time"}
              <span class="metric-change neutral">
                {metric.changeLabel}
              </span>
            {:else}
              <span class="metric-change {getChangeClass(metric.change)}">
                <i class="fas fa-arrow-{metric.change >= 0 ? 'up' : 'down'}"></i>
                {formatChange(metric.change)} {metric.changeLabel}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </section>

    <!-- User Activity Section -->
    <section class="section">
      <h3><i class="fas fa-chart-line"></i> User Activity</h3>
      {#if userActivityData.length > 0}
        <div class="activity-chart">
          <div class="chart-container">
            {#each userActivityData as point, i}
              {@const maxValue = Math.max(...userActivityData.map((p) => p.value))}
              {@const height = (point.value / maxValue) * 100}
              <div
                class="bar"
                style="height: {height}%"
                title="{point.date}: {point.value} active users"
              ></div>
            {/each}
          </div>
          <div class="chart-labels">
            <span>{userActivityData[0]?.date}</span>
            <span>{userActivityData[userActivityData.length - 1]?.date}</span>
          </div>
        </div>
      {:else}
        <div class="no-data-message">
          <i class="fas fa-info-circle"></i>
          <span>Historical activity tracking requires Firebase indexes or Cloud Functions. Current "Active Today" count is shown above.</span>
        </div>
      {/if}
    </section>

    <!-- Activity Events Row -->
    <div class="two-column">
      <!-- Event Type Breakdown -->
      <section class="section">
        <h3><i class="fas fa-chart-pie"></i> Activity Breakdown</h3>
        {#if eventBreakdown.length > 0}
          <div class="event-breakdown">
            {#each eventBreakdown as event}
              {@const percentage = getTotalEvents() > 0 ? (event.count / getTotalEvents()) * 100 : 0}
              <div class="event-row">
                <div class="event-header">
                  <div class="event-icon" style="color: {event.color}">
                    <i class="fas {getEventIcon(event.eventType)}"></i>
                  </div>
                  <span class="event-label">{event.label}</span>
                  <span class="event-count">{event.count.toLocaleString()}</span>
                </div>
                <div class="event-bar">
                  <div
                    class="event-bar-fill"
                    style="width: {percentage}%; background: {event.color}"
                  ></div>
                </div>
              </div>
            {/each}
            <div class="total-events">
              Total Events: {getTotalEvents().toLocaleString()}
            </div>
          </div>
        {:else}
          <div class="no-data-message">
            <i class="fas fa-info-circle"></i>
            <span>No activity events recorded yet. Events will appear as users interact with the app.</span>
          </div>
        {/if}
      </section>

      <!-- Module Usage -->
      <section class="section">
        <h3><i class="fas fa-th-large"></i> Module Usage</h3>
        {#if moduleUsage.length > 0}
          {@const maxViews = Math.max(...moduleUsage.map(m => m.views))}
          <div class="module-usage">
            {#each moduleUsage as module}
              <div class="module-row">
                <div class="module-header">
                  <div class="module-icon" style="background: {module.color}20; color: {module.color}">
                    <i class="fas fa-cube"></i>
                  </div>
                  <span class="module-label">{module.label}</span>
                  <span class="module-views">{module.views.toLocaleString()} views</span>
                </div>
                <div class="module-bar">
                  <div
                    class="module-bar-fill"
                    style="width: {(module.views / maxViews) * 100}%; background: {module.color}"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="no-data-message">
            <i class="fas fa-info-circle"></i>
            <span>No module navigation data yet. Usage stats will appear as users navigate between modules.</span>
          </div>
        {/if}
      </section>
    </div>

    <!-- Recent Activity Feed -->
    <section class="section">
      <h3><i class="fas fa-stream"></i> Recent Activity</h3>
      {#if recentActivity.length > 0}
        <div class="activity-feed">
          {#each recentActivity as activity}
            <div class="activity-item">
              <!-- User Avatar -->
              <div class="activity-user-avatar">
                {#if activity.user?.photoURL}
                  <img src={activity.user.photoURL} alt={activity.user.displayName} class="user-avatar" />
                {:else}
                  <div class="user-avatar-placeholder">
                    <i class="fas fa-user"></i>
                  </div>
                {/if}
              </div>

              <!-- Activity Details -->
              <div class="activity-main">
                <div class="activity-header-row">
                  <span class="activity-user-name">{activity.user?.displayName ?? "Unknown User"}</span>
                  <span class="activity-time">{formatTimestamp(activity.timestamp)}</span>
                </div>
                <div class="activity-action-row">
                  <div class="activity-icon-small" style="color: {eventBreakdown.find(e => e.eventType === activity.eventType)?.color ?? '#94a3b8'}">
                    <i class="fas {getEventIcon(activity.eventType)}"></i>
                  </div>
                  <span class="activity-type">{formatEventType(activity.eventType)}</span>
                  {#if activity.metadata?.["sequenceWord"]}
                    <span class="activity-detail">"{activity.metadata["sequenceWord"]}"</span>
                  {:else if activity.metadata?.["module"]}
                    <span class="activity-detail">{formatModuleLabel(activity.metadata["module"] as string)}</span>
                  {:else if activity.metadata?.["settingKey"]}
                    <span class="activity-detail">{activity.metadata["settingKey"]}</span>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="no-data-message">
          <i class="fas fa-info-circle"></i>
          <span>No recent activity recorded yet. Activity will appear as users interact with the app.</span>
        </div>
      {/if}
    </section>

    <!-- Content & Engagement Row -->
    <div class="two-column">
      <!-- Content Stats -->
      <section class="section">
        <h3><i class="fas fa-layer-group"></i> Content Statistics</h3>
        <div class="stats-list">
          {#each contentStats as stat}
            <div class="stat-row">
              <div class="stat-icon">
                <i class={stat.icon}></i>
              </div>
              <span class="stat-label">{stat.label}</span>
              <span class="stat-value">{stat.value.toLocaleString()}</span>
            </div>
          {/each}
        </div>

        <h4>Top Sequences</h4>
        <div class="top-sequences">
          {#each topSequences as seq, i}
            <div class="sequence-row">
              <span class="rank">#{i + 1}</span>
              <div class="sequence-info">
                <span class="sequence-name">{seq.name}</span>
                <span class="sequence-word">{seq.word}</span>
              </div>
              <span class="sequence-views">{seq.views} views</span>
            </div>
          {/each}
        </div>
      </section>

      <!-- Engagement Stats -->
      <section class="section">
        <h3><i class="fas fa-heart"></i> Engagement Metrics</h3>
        <div class="engagement-list">
          {#each engagementStats as stat}
            <div class="engagement-row">
              <div class="engagement-header">
                <div class="engagement-icon" style="color: {stat.color}">
                  <i class={stat.icon}></i>
                </div>
                <span class="engagement-label">{stat.label}</span>
                <span class="engagement-value">
                  {stat.value.toLocaleString()}
                </span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {getBarWidth(stat.value, stat.total)}; background: {stat.color}"
                ></div>
              </div>
              <span class="engagement-percent">
                {((stat.value / stat.total) * 100).toFixed(1)}% of users
              </span>
            </div>
          {/each}
        </div>
      </section>
    </div>

    <!-- Data Source Notice -->
    {#if summaryMetrics.length > 0 && summaryMetrics[0]?.value === "0"}
      <div class="data-notice warning">
        <i class="fas fa-info-circle"></i>
        <span>No data available. Please ensure you're signed in with an admin account and Firebase has user data.</span>
        <button class="refresh-btn" onclick={() => loadAnalyticsData()}>
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    {:else}
      <div class="data-notice success">
        <i class="fas fa-database"></i>
        <span>Showing live data from Firebase Firestore.</span>
        <button class="refresh-btn" onclick={() => loadAnalyticsData()}>
          <i class="fas fa-sync-alt"></i> Refresh
        </button>
      </div>
    {/if}
  {/if}
</div>

<style>
  .analytics-dashboard {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    color: rgba(255, 255, 255, 0.95);
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: 16px;
    color: rgba(255, 255, 255, 0.6);
  }

  .loading-state i {
    font-size: 32px;
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

  /* Header */
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

  /* Metric Cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .metric-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--accent-color) 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-size: 20px;
    flex-shrink: 0;
  }

  .metric-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  .metric-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .metric-change {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metric-change.positive {
    color: #10b981;
  }

  .metric-change.negative {
    color: #ef4444;
  }

  .metric-change.neutral {
    color: rgba(255, 255, 255, 0.4);
  }

  /* Sections */
  .section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.9);
  }

  .section h3 i {
    color: rgba(255, 255, 255, 0.5);
  }

  .section h4 {
    margin: 20px 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  /* Activity Chart */
  .activity-chart {
    height: 200px;
    display: flex;
    flex-direction: column;
  }

  .chart-container {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    padding: 0 4px;
  }

  .chart-container .bar {
    flex: 1;
    background: linear-gradient(to top, #3b82f6, #60a5fa);
    border-radius: 2px 2px 0 0;
    min-height: 4px;
    transition: height 0.3s ease;
    cursor: pointer;
  }

  .chart-container .bar:hover {
    background: linear-gradient(to top, #2563eb, #3b82f6);
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .no-data-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .no-data-message i {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.3);
  }

  /* Two Column Layout */
  .two-column {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
  }

  .two-column .section {
    margin-bottom: 0;
  }

  /* Stats List */
  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .stat-row:last-child {
    border-bottom: none;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  .stat-label {
    flex: 1;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-value {
    font-weight: 600;
    font-size: 16px;
  }

  /* Top Sequences */
  .top-sequences {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sequence-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .rank {
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    width: 28px;
  }

  .sequence-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .sequence-name {
    font-weight: 500;
  }

  .sequence-word {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-family: monospace;
  }

  .sequence-views {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Engagement Stats */
  .engagement-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .engagement-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .engagement-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .engagement-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .engagement-label {
    flex: 1;
    color: rgba(255, 255, 255, 0.8);
  }

  .engagement-value {
    font-weight: 600;
    font-size: 16px;
  }

  .progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .engagement-percent {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Data Notice */
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

  /* Event Breakdown */
  .event-breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .event-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .event-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .event-label {
    flex: 1;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .event-count {
    font-weight: 600;
    font-size: 14px;
    color: white;
  }

  .event-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 38px;
  }

  .event-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .total-events {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    text-align: right;
  }

  /* Module Usage */
  .module-usage {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .module-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .module-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .module-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .module-label {
    flex: 1;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .module-views {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  .module-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 38px;
  }

  .module-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  /* Activity Feed */
  .activity-feed {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 500px;
    overflow-y: auto;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    transition: background 0.2s;
  }

  .activity-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .activity-user-avatar {
    flex-shrink: 0;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .user-avatar-placeholder {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .activity-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .activity-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .activity-user-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .activity-icon-small {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .activity-type {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .activity-detail {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* Responsive */
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

    .activity-feed {
      max-height: 300px;
    }
  }
</style>
