<script lang="ts">
  /**
   * UserStatsGrid
   * Displays user statistics in a grid layout
   */
  import type { UserData } from "./types";

  interface Props {
    user: UserData;
  }

  let { user }: Props = $props();
</script>

<div class="stats-grid">
  <div class="stat-card">
    <i class="fas fa-layer-group"></i>
    <span class="stat-value">{user.sequenceCount}</span>
    <span class="stat-label">Sequences</span>
  </div>
  <div class="stat-card">
    <i class="fas fa-star"></i>
    <span class="stat-value">{user.totalXP.toLocaleString()}</span>
    <span class="stat-label">Total XP</span>
  </div>
  <div class="stat-card">
    <i class="fas fa-chart-line"></i>
    <span class="stat-value">{user.currentLevel}</span>
    <span class="stat-label">Level</span>
  </div>
  <div class="stat-card">
    <i class="fas fa-trophy"></i>
    <span class="stat-value">{user.achievementCount}</span>
    <span class="stat-label">Achievements</span>
  </div>
  <div class="stat-card">
    <i class="fas fa-fire"></i>
    <span class="stat-value">{user.currentStreak}</span>
    <span class="stat-label">Day Streak</span>
  </div>
</div>

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 12px;
  }

  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    gap: 6px;
  }

  .stat-card i {
    font-size: 18px;
    color: rgba(255, 255, 255, 0.5);
  }

  .stat-card .stat-value {
    font-size: 18px;
    font-weight: 700;
  }

  .stat-card .stat-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }
</style>
