<!--
  PersonalBests.svelte - Personal Best Scores

  Displays best performance for each sequence.
-->
<script lang="ts">
  import type { PersonalBest } from "../../services/contracts/IPerformanceHistoryTracker";

  interface Props {
    bests: PersonalBest[];
  }

  let { bests }: Props = $props();

  function getGradeColor(grade: string): string {
    switch (grade.toUpperCase()) {
      case "S":
        return "var(--semantic-warning)"; // Gold
      case "A":
        return "var(--semantic-success)"; // Green
      case "B":
        return "var(--semantic-info)"; // Blue
      case "C":
        return "var(--semantic-warning)"; // Orange
      case "D":
        return "var(--semantic-error)"; // Red
      default:
        return "#9ca3af"; // Gray
    }
  }

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  }
</script>

<div class="personal-bests">
  {#each bests as best}
    <div class="best-card">
      <div class="best-header">
        <h3>{best.sequenceName}</h3>
        <div
          class="grade-badge"
          style="--grade-color: {getGradeColor(best.bestGrade)}"
        >
          {best.bestGrade}
        </div>
      </div>
      <div class="best-stats">
        <div class="stat">
          <i class="fas fa-bullseye" aria-hidden="true"></i>
          <span>{best.bestAccuracy.toFixed(1)}%</span>
        </div>
        <div class="stat">
          <i class="fas fa-fire" aria-hidden="true"></i>
          <span>{best.bestCombo} combo</span>
        </div>
        <div class="stat date">
          <i class="fas fa-calendar" aria-hidden="true"></i>
          <span>{formatDate(best.achievedAt)}</span>
        </div>
      </div>
    </div>
  {/each}
</div>

<style>
  .personal-bests {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .best-card {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: var(--theme-card-bg, var(--theme-card-bg));
    border: 1px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 0.75rem;
    transition: all 0.2s;
  }

  .best-card:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-stroke-strong);
    transform: translateY(-2px);
  }

  .best-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .best-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grade-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    background: var(--grade-color);
    border-radius: 0.5rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #000000;
    box-shadow: 0 2px 4px var(--theme-shadow, var(--theme-shadow));
  }

  .best-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    opacity: 0.9;
  }

  .stat i {
    font-size: 0.875rem;
    opacity: 0.7;
  }

  .stat.date {
    margin-left: auto;
    opacity: 0.6;
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .personal-bests {
      grid-template-columns: 1fr;
    }
  }
</style>
