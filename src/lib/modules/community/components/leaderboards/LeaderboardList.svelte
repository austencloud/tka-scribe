<script lang="ts">
  /**
   * LeaderboardList - Displays leaderboard with podium and rows
   *
   * Refactored to use CSS variables and shared components.
   */

  import { PanelState } from "$shared";
  import type {
    LeaderboardEntry,
    LeaderboardCategory,
  } from "../../domain/models/leaderboard-models";
  import LeaderboardRow from "./LeaderboardRow.svelte";

  const { entries, category, currentUserRank } = $props<{
    entries: LeaderboardEntry[];
    category: LeaderboardCategory;
    currentUserRank?: number;
  }>();

  // Split entries into podium (top 3) and rest
  const podiumEntries = $derived(entries.slice(0, 3));
  const regularEntries = $derived(entries.slice(3));

  function scrollToCurrentUser() {
    const userRow = document.querySelector(".leaderboard-row.highlight");
    userRow?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
</script>

<div class="leaderboard-list">
  <!-- Podium Display (Top 3) -->
  {#if podiumEntries.length >= 3}
    <div class="podium">
      <div class="podium-header">
        <i class="fas fa-trophy"></i>
        <span>Top 3 Champions</span>
      </div>
      <div class="podium-grid">
        <!-- Silver (2nd place) - Left -->
        {#if podiumEntries[1]}
          <div class="podium-position second">
            <LeaderboardRow
              entry={podiumEntries[1]}
              {category}
              podium="silver"
            />
          </div>
        {/if}

        <!-- Gold (1st place) - Center, elevated -->
        {#if podiumEntries[0]}
          <div class="podium-position first">
            <LeaderboardRow entry={podiumEntries[0]} {category} podium="gold" />
          </div>
        {/if}

        <!-- Bronze (3rd place) - Right -->
        {#if podiumEntries[2]}
          <div class="podium-position third">
            <LeaderboardRow
              entry={podiumEntries[2]}
              {category}
              podium="bronze"
            />
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Rest of Leaderboard -->
  {#if regularEntries.length > 0}
    <div class="leaderboard-rows">
      <div class="rows-header">
        <span>Rank {podiumEntries.length + 1}+</span>
      </div>
      {#each regularEntries as entry (entry.userId)}
        <LeaderboardRow {entry} {category} highlight={entry.isCurrentUser} />
      {/each}
    </div>
  {/if}

  <!-- Current User Position Indicator (if not in top 100) -->
  {#if currentUserRank && currentUserRank > 100}
    <div class="current-user-indicator">
      <button onclick={scrollToCurrentUser}>
        <i class="fas fa-user"></i>
        Your rank: #{currentUserRank}
        <i class="fas fa-arrow-down"></i>
      </button>
    </div>
  {/if}

  <!-- Empty State -->
  {#if entries.length === 0}
    <PanelState
      type="empty"
      icon="fa-chart-line"
      title="No Data Yet"
      message="The leaderboard will populate as users start earning {category}."
    />
  {/if}
</div>

<style>
  .leaderboard-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
  }

  /* ============================================================================
     PODIUM DISPLAY
     ============================================================================ */
  .podium {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--accent-color) 8%, transparent) 0%,
      color-mix(in srgb, var(--accent-color) 8%, transparent) 100%
    );
    border: 1px solid color-mix(in srgb, var(--accent-color) 20%, transparent);
    border-radius: 16px;
  }

  .podium-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary-current, rgba(255, 255, 255, 0.95));
  }

  .podium-header i {
    color: var(--accent-color);
    font-size: 20px;
  }

  .podium-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    align-items: end;
  }

  .podium-position {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* First place - center, elevated */
  .podium-position.first {
    order: 2;
    transform: translateY(-8px);
  }

  /* Second place - left */
  .podium-position.second {
    order: 1;
  }

  /* Third place - right */
  .podium-position.third {
    order: 3;
  }

  /* ============================================================================
     LEADERBOARD ROWS
     ============================================================================ */
  .leaderboard-rows {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .rows-header {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-secondary-current, rgba(255, 255, 255, 0.6));
    padding: 0 16px 8px;
    border-bottom: 1px solid var(--card-border-current, rgba(255, 255, 255, 0.1));
  }

  /* ============================================================================
     CURRENT USER INDICATOR
     ============================================================================ */
  .current-user-indicator {
    position: sticky;
    bottom: 16px;
    display: flex;
    justify-content: center;
    z-index: 10;
  }

  .current-user-indicator button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: var(--accent-color);
    backdrop-filter: blur(12px);
    border: none;
    border-radius: 100px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 12px color-mix(in srgb, var(--accent-color) 40%, transparent);
    transition: all 0.2s ease;
  }

  .current-user-indicator button:hover {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px color-mix(in srgb, var(--accent-color) 50%, transparent);
  }

  /* ============================================================================
     RESPONSIVE
     ============================================================================ */
  @media (max-width: 640px) {
    .leaderboard-list {
      gap: 16px;
    }

    .podium {
      padding: 12px;
      gap: 12px;
    }

    .podium-header {
      font-size: 15px;
    }

    .podium-header i {
      font-size: 16px;
    }

    .podium-grid {
      grid-template-columns: 1fr;
      gap: 6px;
    }

    .podium-position.first,
    .podium-position.second,
    .podium-position.third {
      order: unset;
      transform: none;
    }

    .podium-position.first {
      order: 1;
    }

    .podium-position.second {
      order: 2;
    }

    .podium-position.third {
      order: 3;
    }

    .rows-header {
      padding: 0 8px 6px;
      font-size: 12px;
    }

    .current-user-indicator {
      bottom: 8px;
    }

    .current-user-indicator button {
      padding: 8px 16px;
      font-size: 13px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .current-user-indicator button {
      transition: none;
    }

    .current-user-indicator button:hover {
      transform: none;
    }
  }
</style>
