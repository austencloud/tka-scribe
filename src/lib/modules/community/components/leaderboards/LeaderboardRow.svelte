<script lang="ts">
  import type {
    LeaderboardEntry,
    LeaderboardCategory,
  } from "../../domain/models/leaderboard-models";

  const {
    entry,
    category,
    highlight = false,
    podium = null,
  } = $props<{
    entry: LeaderboardEntry,
    category: LeaderboardCategory,
    highlight?: boolean,
    podium?: "gold" | "silver" | "bronze" | null
  }>();

  const metricValue = $derived.by(() => {
    switch (category) {
      case "xp":
        return entry.totalXP?.toLocaleString() || "0";
      case "level":
        return `Level ${entry.currentLevel || 0}`;
      case "sequences":
        return entry.sequenceCount || 0;
      case "achievements":
        return entry.achievementCount || 0;
      case "streak":
        return `${entry.currentStreak || 0} days`;
      default:
        return "0";
    }
  });

  const rankIcon = $derived.by(() => {
    if (podium === "gold") return "🥇";
    if (podium === "silver") return "🥈";
    if (podium === "bronze") return "🥉";
    return null;
  });

  function handleClick() {
    // TODO: Navigate to user profile
    console.log("View profile:", entry.userId);
  }
</script>

<button
  class="leaderboard-row"
  class:highlight
  class:podium={!!podium}
  data-podium={podium}
  onclick={handleClick}
  aria-label="View {entry.displayName}'s profile"
>
  <div class="rank">
    {#if rankIcon}
      <span class="rank-icon">{rankIcon}</span>
    {:else}
      <span class="rank-number">#{entry.rank}</span>
    {/if}

    {#if entry.rankChange}
      <span
        class="rank-change"
        class:up={entry.rankChange > 0}
        class:down={entry.rankChange < 0}
      >
        <i class="fas fa-{entry.rankChange > 0 ? 'arrow-up' : 'arrow-down'}"
        ></i>
        {Math.abs(entry.rankChange)}
      </span>
    {/if}
  </div>

  <div class="user-info">
    <div class="avatar">
      {#if entry.avatar}
        <img src={entry.avatar} alt={entry.displayName} />
      {:else}
        <i class="fas fa-user"></i>
      {/if}
    </div>
    <div class="names">
      <span class="display-name">{entry.displayName}</span>
      <span class="username">@{entry.username}</span>
    </div>
  </div>

  <div class="metric">
    <span class="metric-value">{metricValue}</span>
  </div>

  <div class="chevron">
    <i class="fas fa-chevron-right"></i>
  </div>
</button>

<style>
  .leaderboard-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    width: 100%;
    text-align: left;
  }

  .leaderboard-row:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateX(2px);
  }

  .leaderboard-row.highlight {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.3);
  }

  .leaderboard-row.podium {
    background: rgba(255, 255, 255, 0.08);
    border-width: 2px;
  }

  .leaderboard-row.podium[data-podium="gold"] {
    border-color: rgba(255, 215, 0, 0.4);
    background: rgba(255, 215, 0, 0.08);
  }

  .leaderboard-row.podium[data-podium="silver"] {
    border-color: rgba(192, 192, 192, 0.4);
    background: rgba(192, 192, 192, 0.08);
  }

  .leaderboard-row.podium[data-podium="bronze"] {
    border-color: rgba(205, 127, 50, 0.4);
    background: rgba(205, 127, 50, 0.08);
  }

  .rank {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    min-width: 48px;
  }

  .rank-icon {
    font-size: 24px;
  }

  .rank-number {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .rank-change {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 11px;
    font-weight: 500;
  }

  .rank-change.up {
    color: #10b981;
  }

  .rank-change.down {
    color: #ef4444;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
  }

  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar i {
    color: rgba(255, 255, 255, 0.5);
    font-size: 18px;
  }

  .names {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .display-name {
    font-size: 15px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .username {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .metric {
    display: flex;
    align-items: center;
    margin-left: auto;
  }

  .metric-value {
    font-size: 16px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .chevron {
    color: rgba(255, 255, 255, 0.4);
    font-size: 14px;
    flex-shrink: 0;
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .leaderboard-row {
      gap: 8px;
      padding: 10px 12px;
    }

    .rank {
      min-width: 40px;
    }

    .rank-icon {
      font-size: 20px;
    }

    .rank-number {
      font-size: 14px;
    }

    .rank-change {
      font-size: 10px;
    }

    .avatar {
      width: 36px;
      height: 36px;
    }

    .avatar i {
      font-size: 16px;
    }

    .user-info {
      gap: 10px;
    }

    .display-name {
      font-size: 14px;
    }

    .username {
      font-size: 12px;
    }

    .metric-value {
      font-size: 14px;
    }

    .chevron {
      font-size: 12px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-contrast: high) {
    .leaderboard-row {
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .leaderboard-row:hover {
      border-color: white;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .leaderboard-row {
      transition: none;
    }
  }
</style>
