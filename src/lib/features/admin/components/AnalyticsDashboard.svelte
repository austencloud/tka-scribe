<script lang="ts">
  /**
   * AnalyticsDashboard
   *
   * Minimal analytics view for admin users.
   * Two sections: Quick Stats + Active Users
   *
   * Uses SystemStateService cached data - no wasteful Firebase queries.
   */
  import WeeklyEngagement from "./analytics/WeeklyEngagement.svelte";
  import ActiveUsersPanel from "./ActiveUsersPanel.svelte";
</script>

<div class="analytics-dashboard">
  <header class="dashboard-header">
    <h2>Analytics Overview</h2>
  </header>

  <WeeklyEngagement />

  <section class="active-users-section">
    <ActiveUsersPanel />
  </section>
</div>

<style>
  .analytics-dashboard {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dashboard-header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .active-users-section {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    border-radius: 12px;
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    min-height: 400px;
    overflow: hidden;
  }

  /* Themed scrollbar */
  .analytics-dashboard :global(::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  .analytics-dashboard :global(::-webkit-scrollbar-track) {
    background: transparent;
  }

  .analytics-dashboard :global(::-webkit-scrollbar-thumb) {
    background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 30%, transparent);
    border-radius: 3px;
  }

  .analytics-dashboard :global(::-webkit-scrollbar-thumb:hover) {
    background: color-mix(in srgb, var(--theme-accent, #8b5cf6) 50%, transparent);
  }

  @media (max-width: 768px) {
    .analytics-dashboard {
      padding: 16px;
      gap: 16px;
    }

    .dashboard-header h2 {
      font-size: 20px;
    }
  }
</style>
