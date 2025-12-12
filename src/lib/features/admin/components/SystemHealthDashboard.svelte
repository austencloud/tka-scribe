<script lang="ts">
  /**
   * SystemHealthDashboard
   * Admin landing view with system health status and recent operations
   */
  import { onMount } from "svelte";
  import { di } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { ISystemStateService } from "../services/contracts/ISystemStateService";
  import type { IAuditLogService } from "../services/contracts/IAuditLogService";
  import type { IAnalyticsDataService } from "../services/contracts/IAnalyticsDataService";

  const systemStateService = di.get<ISystemStateService>(TYPES.ISystemStateService);
  const auditLogService = di.get<IAuditLogService>(TYPES.IAuditLogService);
  const analyticsService = di.get<IAnalyticsDataService>(TYPES.IAnalyticsDataService);

  interface HealthStatus {
    totalUsers: number;
    activeToday: number;
    challengesCount: number;
    announcementsCount: number;
    flagsCount: number;
  }

  let health = $state<HealthStatus | null>(null);
  let recentActions = $state<any[]>([]);
  let isLoading = $state(true);

  async function loadDashboardData() {
    try {
      const systemState = await systemStateService.getSystemState();
      const metrics = await analyticsService.getSummaryMetrics({
        days: 1,
        startDate: new Date(),
        endDate: new Date(),
      });
      const actions = await auditLogService.getRecentActions(10);

      health = {
        totalUsers: metrics.totalUsers,
        activeToday: metrics.activeToday,
        challengesCount: systemState.challenges.length,
        announcementsCount: systemState.announcements.length,
        flagsCount: 0, // Feature flags would need to be loaded separately
      };

      recentActions = actions;
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      isLoading = false;
    }
  }

  function formatTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function getActionIcon(action: string): string {
    const iconMap: Record<string, string> = {
      'role_changed': 'fa-user-tag',
      'account_disabled': 'fa-ban',
      'account_enabled': 'fa-check-circle',
      'user_data_reset': 'fa-redo',
      'user_deleted': 'fa-trash',
      'challenge_created': 'fa-plus-circle',
      'announcement_created': 'fa-bell',
      'flag_updated': 'fa-flag',
    };
    return iconMap[action] || 'fa-circle';
  }

  function getActionColor(action: string): string {
    const colorMap: Record<string, string> = {
      'role_changed': '#3b82f6',
      'account_disabled': '#ef4444',
      'account_enabled': '#10b981',
      'user_data_reset': '#f59e0b',
      'user_deleted': '#dc2626',
      'challenge_created': 'var(--theme-accent-strong, #8b5cf6)',
      'announcement_created': '#06b6d4',
      'flag_updated': '#ec4899',
    };
    return colorMap[action] || '#94a3b8';
  }

  onMount(() => {
    loadDashboardData();
  });
</script>

<div class="system-health">
  <header class="health-header">
    <h1>System Health</h1>
    <button class="refresh-btn" onclick={() => loadDashboardData()} disabled={isLoading}>
      <i class="fas fa-sync" class:spinning={isLoading}></i>
      Refresh
    </button>
  </header>

  {#if isLoading}
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading system health...</p>
    </div>
  {:else if health}
    <div class="health-grid">
      <div class="health-block">
        <div class="health-label">Total Users</div>
        <div class="health-value">{health.totalUsers.toLocaleString()}</div>
      </div>

      <div class="health-block">
        <div class="health-label">Active Today</div>
        <div class="health-value">{health.activeToday}</div>
      </div>

      <div class="health-block">
        <div class="health-label">Challenges</div>
        <div class="health-value">{health.challengesCount}</div>
      </div>

      <div class="health-block">
        <div class="health-label">Announcements</div>
        <div class="health-value">{health.announcementsCount}</div>
      </div>
    </div>

    <section class="recent-section">
      <h2>Recent Operations</h2>
      <div class="recent-list">
        {#if recentActions.length === 0}
          <div class="empty-state">
            <i class="fas fa-history"></i>
            <p>No recent operations</p>
          </div>
        {:else}
          {#each recentActions as action}
            <div class="action-item">
              <div
                class="action-icon"
                style="background: {getActionColor(action.action)}20; color: {getActionColor(action.action)}"
              >
                <i class="fas {getActionIcon(action.action)}"></i>
              </div>
              <div class="action-content">
                <div class="action-summary">{action.summary}</div>
                <div class="action-meta">
                  {formatTime(action.timestamp)} • {action.performedBy}
                </div>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .system-health {
    height: 100%;
    display: flex;
    flex-direction: column;
    color: rgba(255, 255, 255, 0.95);
    overflow: hidden;
  }

  .health-header {
    padding: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .health-header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }

  .refresh-btn {
    padding: 8px 16px;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 8px;
    color: #3b82f6;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .refresh-btn:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }

  .refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .refresh-btn i.spinning {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .loading-state i {
    font-size: 32px;
    animation: spin 1s linear infinite;
  }

  .health-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.02);
  }

  .health-block {
    padding: 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    text-align: center;
  }

  .health-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .health-value {
    font-size: 32px;
    font-weight: 600;
    color: #3b82f6;
  }

  .recent-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0 24px 24px;
  }

  .recent-section h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .recent-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .action-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    align-items: flex-start;
  }

  .action-icon {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-icon i {
    font-size: 16px;
  }

  .action-content {
    flex: 1;
    min-width: 0;
  }

  .action-summary {
    font-size: 14px;
    margin-bottom: 4px;
  }

  .action-meta {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .empty-state i {
    font-size: 32px;
  }

  @media (max-width: 768px) {
    .health-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
