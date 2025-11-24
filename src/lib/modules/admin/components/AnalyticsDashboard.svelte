<script lang="ts">
  /**
   * AnalyticsDashboard
   * Comprehensive analytics view for admin users
   *
   * Currently uses mock data - ready to wire up to Firebase Analytics
   */
  import { onMount } from "svelte";

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
  let selectedTimeRange = $state<"7d" | "30d" | "90d">("30d");

  // Mock data - replace with real Firebase queries
  let summaryMetrics = $state<MetricCard[]>([]);
  let userActivityData = $state<TimeSeriesPoint[]>([]);
  let contentStats = $state<ContentStat[]>([]);
  let topSequences = $state<TopSequence[]>([]);
  let engagementStats = $state<EngagementStat[]>([]);

  // Generate mock data
  function generateMockData() {
    // Summary metrics
    summaryMetrics = [
      {
        label: "Total Users",
        value: "1,247",
        change: 12.5,
        changeLabel: "vs last month",
        icon: "fas fa-users",
        color: "#3b82f6",
      },
      {
        label: "Active Today",
        value: "89",
        change: -3.2,
        changeLabel: "vs yesterday",
        icon: "fas fa-user-check",
        color: "#10b981",
      },
      {
        label: "Sequences Created",
        value: "3,892",
        change: 23.1,
        changeLabel: "vs last month",
        icon: "fas fa-layer-group",
        color: "#8b5cf6",
      },
      {
        label: "Challenges Completed",
        value: "567",
        change: 45.8,
        changeLabel: "vs last month",
        icon: "fas fa-trophy",
        color: "#f59e0b",
      },
    ];

    // User activity over time (mock)
    const days = selectedTimeRange === "7d" ? 7 : selectedTimeRange === "30d" ? 30 : 90;
    userActivityData = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      return {
        date: date.toISOString().split("T")[0] ?? "",
        value: Math.floor(Math.random() * 50) + 30,
      };
    });

    // Content stats
    contentStats = [
      { label: "Total Sequences", value: 3892, icon: "fas fa-layer-group" },
      { label: "Public Sequences", value: 2341, icon: "fas fa-globe" },
      { label: "Gallery Views", value: 12847, icon: "fas fa-eye" },
      { label: "Shares", value: 456, icon: "fas fa-share-alt" },
    ];

    // Top sequences
    topSequences = [
      { name: "Flow Basics", word: "FLOW", views: 234, creator: "admin" },
      { name: "Spinner's Delight", word: "SPIN", views: 189, creator: "user123" },
      { name: "Wave Motion", word: "WAVE", views: 156, creator: "flowmaster" },
      { name: "Circle Dance", word: "CIRCLE", views: 143, creator: "admin" },
      { name: "Quick Combo", word: "QUICK", views: 121, creator: "newbie42" },
    ];

    // Engagement stats
    engagementStats = [
      {
        label: "Daily Challenges",
        value: 567,
        total: 1247,
        icon: "fas fa-calendar-check",
        color: "#f59e0b",
      },
      {
        label: "Achievements Unlocked",
        value: 2891,
        total: 12470, // 10 achievements * users
        icon: "fas fa-award",
        color: "#ec4899",
      },
      {
        label: "Active Streaks",
        value: 234,
        total: 1247,
        icon: "fas fa-fire",
        color: "#ef4444",
      },
      {
        label: "XP Earned (K)",
        value: 456,
        total: 1000,
        icon: "fas fa-star",
        color: "#8b5cf6",
      },
    ];
  }

  onMount(() => {
    // Simulate loading
    setTimeout(() => {
      generateMockData();
      isLoading = false;
    }, 500);
  });

  // Recalculate when time range changes
  $effect(() => {
    if (!isLoading) {
      generateMockData();
    }
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
</script>

<div class="analytics-dashboard">
  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading analytics...</p>
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
            <span class="metric-change {getChangeClass(metric.change)}">
              <i class="fas fa-arrow-{metric.change >= 0 ? 'up' : 'down'}"></i>
              {formatChange(metric.change)} {metric.changeLabel}
            </span>
          </div>
        </div>
      {/each}
    </section>

    <!-- User Activity Section -->
    <section class="section">
      <h3><i class="fas fa-chart-line"></i> User Activity</h3>
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
    <div class="data-notice">
      <i class="fas fa-info-circle"></i>
      <span>Currently showing mock data. Wire up Firebase Analytics for live metrics.</span>
    </div>
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
  }
</style>
