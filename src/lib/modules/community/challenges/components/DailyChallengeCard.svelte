<script lang="ts">
  /**
   * DailyChallengeCard
   * Displays a daily challenge with progress bar and completion status.
   */

  import type { DailyChallenge, UserChallengeProgress } from "$lib/shared/gamification/domain/models";

  interface Props {
    challenge: DailyChallenge;
    progress: UserChallengeProgress | null;
    compact?: boolean;
    onComplete?: () => void;
  }

  let { challenge, progress, compact = false, onComplete }: Props = $props();

  // Calculated values
  const currentProgress = $derived(progress?.progress ?? 0);
  const targetProgress = $derived(challenge.requirement.target);
  const progressPercent = $derived(
    Math.min(100, Math.round((currentProgress / targetProgress) * 100))
  );
  const isComplete = $derived(progress?.isCompleted ?? false);
  const xpReward = $derived(challenge.xpReward);

  // Time remaining until midnight
  const timeRemaining = $derived.by(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - now.getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes };
  });

  // Difficulty colors
  const difficultyColors: Record<string, string> = {
    easy: "#22c55e",
    medium: "#f59e0b",
    hard: "#ef4444",
  };

  const difficultyColor = $derived(
    difficultyColors[challenge.difficulty] ?? "#6b7280"
  );
</script>

<div class="daily-challenge-card" class:compact class:complete={isComplete}>
  <!-- Header -->
  <div class="card-header">
    <div class="challenge-icon">
      <i class="fas fa-sun"></i>
    </div>
    <div class="challenge-title">
      <h3>{challenge.title}</h3>
      {#if !compact}
        <span
          class="difficulty-badge"
          style="--badge-color: {difficultyColor}"
        >
          {challenge.difficulty}
        </span>
      {/if}
    </div>
    <div class="xp-reward">
      <i class="fas fa-star"></i>
      <span>{xpReward} XP</span>
    </div>
  </div>

  <!-- Description -->
  {#if !compact}
    <p class="challenge-description">{challenge.description}</p>
  {/if}

  <!-- Progress -->
  <div class="progress-section">
    <div class="progress-bar">
      <div
        class="progress-fill"
        style="width: {progressPercent}%"
        class:complete={isComplete}
      ></div>
    </div>
    <div class="progress-text">
      {#if isComplete}
        <i class="fas fa-check-circle"></i>
        <span>Completed!</span>
      {:else}
        <span>{currentProgress} / {targetProgress}</span>
        <span class="time-remaining">
          <i class="fas fa-clock"></i>
          {timeRemaining.hours}h {timeRemaining.minutes}m left
        </span>
      {/if}
    </div>
  </div>
</div>

<style>
  .daily-challenge-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    transition: all 0.2s ease;
  }

  .daily-challenge-card.compact {
    padding: 16px;
    gap: 12px;
  }

  .daily-challenge-card.complete {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.08);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .challenge-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    border-radius: 12px;
    color: white;
    font-size: 18px;
    flex-shrink: 0;
  }

  .compact .challenge-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
    border-radius: 10px;
  }

  .challenge-title {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .challenge-title h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .compact .challenge-title h3 {
    font-size: 14px;
  }

  .difficulty-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--badge-color) 20%, transparent);
    color: var(--badge-color);
    width: fit-content;
  }

  .xp-reward {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 20px;
    color: #f59e0b;
    font-size: 13px;
    font-weight: 600;
  }

  .compact .xp-reward {
    padding: 4px 10px;
    font-size: 12px;
  }

  .challenge-description {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }

  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .progress-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #f97316);
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #22c55e, #16a34a);
  }

  .progress-text {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
  }

  .progress-text .fa-check-circle {
    color: #22c55e;
    margin-right: 6px;
  }

  .time-remaining {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.5);
  }

  .time-remaining i {
    font-size: 12px;
  }
</style>
