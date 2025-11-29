<script lang="ts">
  /**
   * ChallengeStats
   * Displays challenge statistics in a grid of stat cards.
   */

  import type { ChallengeDashboard } from "$lib/shared/gamification/domain/models/challenge-models";

  interface Props {
    dashboard: ChallengeDashboard;
  }

  let { dashboard }: Props = $props();

  // Stats to display
  const stats = $derived([
    {
      label: "Daily Streak",
      value: dashboard.stats.dailyStreak,
      suffix: " days",
      icon: "fa-fire",
      color: "#f97316",
    },
    {
      label: "Weekly Streak",
      value: dashboard.stats.weeklyStreak,
      suffix: " weeks",
      icon: "fa-calendar-check",
      color: "#8b5cf6",
    },
    {
      label: "Challenges Done",
      value: dashboard.stats.totalChallengesCompleted,
      suffix: "",
      icon: "fa-trophy",
      color: "#f59e0b",
    },
    {
      label: "Skills Mastered",
      value: dashboard.stats.totalSkillsCompleted,
      suffix: "",
      icon: "fa-medal",
      color: "#22c55e",
    },
    {
      label: "Skill Levels",
      value: dashboard.stats.totalSkillLevels,
      suffix: "",
      icon: "fa-star",
      color: "#06b6d4",
    },
  ]);
</script>

<div class="challenge-stats">
  {#each stats as stat}
    <div class="stat-card" style="--stat-color: {stat.color}">
      <div class="stat-icon">
        <i class="fas {stat.icon}"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">
          {stat.value}{stat.suffix}
        </div>
        <div class="stat-label">{stat.label}</div>
      </div>
    </div>
  {/each}
</div>

<style>
  .challenge-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: color-mix(in srgb, var(--stat-color) 20%, transparent);
    border-radius: 10px;
    color: var(--stat-color);
    font-size: 16px;
    flex-shrink: 0;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .stat-value {
    font-size: 20px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .challenge-stats {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-card {
      padding: 12px;
      gap: 10px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }

    .stat-value {
      font-size: 18px;
    }

    .stat-label {
      font-size: 11px;
    }
  }
</style>
