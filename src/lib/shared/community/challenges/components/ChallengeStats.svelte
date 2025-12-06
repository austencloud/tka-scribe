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
  /* ============================================================================
     BASE STYLES - iPhone SE (320px) Mobile-First
     ============================================================================ */
  .challenge-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: color-mix(in srgb, var(--stat-color) 20%, transparent);
    border-radius: 8px;
    color: var(--stat-color);
    font-size: 13px;
    flex-shrink: 0;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ============================================================================
     LARGE MOBILE (481px+)
     ============================================================================ */
  @media (min-width: 481px) {
    .challenge-stats {
      gap: 10px;
    }

    .stat-card {
      gap: 10px;
      padding: 12px;
      border-radius: 11px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      font-size: 14px;
      border-radius: 9px;
    }

    .stat-content {
      gap: 2px;
    }

    .stat-value {
      font-size: 18px;
    }

    .stat-label {
      font-size: 11px;
    }
  }

  /* ============================================================================
     TABLET (641px+)
     ============================================================================ */
  @media (min-width: 641px) {
    .challenge-stats {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }

    .stat-card {
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
      border-radius: 10px;
    }

    .stat-value {
      font-size: 20px;
    }

    .stat-label {
      font-size: 12px;
    }
  }

  /* ============================================================================
     DESKTOP (1025px+) - 5-column layout for stats
     ============================================================================ */
  @media (min-width: 1025px) {
    .challenge-stats {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  /* ============================================================================
     LARGE DESKTOP (1400px+)
     ============================================================================ */
  @media (min-width: 1400px) {
    .stat-card {
      padding: 18px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      font-size: 18px;
    }

    .stat-value {
      font-size: 22px;
    }

    .stat-label {
      font-size: 13px;
    }
  }
</style>
