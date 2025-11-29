<script lang="ts">
  /**
   * WeeklyChallengeCard
   * Displays a weekly challenge with progress, bonus deadline, and completion status.
   */

  import type {
    WeeklyChallenge,
    UserWeeklyChallengeProgress,
  } from "$lib/shared/gamification/domain/models/challenge-models";

  interface Props {
    challenge: WeeklyChallenge;
    progress: UserWeeklyChallengeProgress | null;
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
  const bonusEarned = $derived(progress?.bonusEarned ?? false);
  const xpReward = $derived(challenge.xpReward);
  const bonusXP = $derived(
    challenge.bonusMultiplier
      ? Math.floor(xpReward * challenge.bonusMultiplier)
      : 0
  );

  // Time calculations
  const timeRemaining = $derived.by(() => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const ms = end.getTime() - now.getTime();
    if (ms <= 0) return null;

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  });

  const bonusTimeRemaining = $derived.by(() => {
    if (!challenge.bonusDeadline) return null;

    const now = new Date();
    const deadline = new Date(challenge.bonusDeadline);
    const ms = deadline.getTime() - now.getTime();
    if (ms <= 0) return null;

    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
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

<div class="weekly-challenge-card" class:compact class:complete={isComplete}>
  <!-- Header -->
  <div class="card-header">
    <div class="challenge-icon">
      <i class="fas fa-calendar-week"></i>
    </div>
    <div class="challenge-title">
      <h3>{challenge.title}</h3>
      {#if !compact}
        <div class="badge-row">
          <span
            class="difficulty-badge"
            style="--badge-color: {difficultyColor}"
          >
            {challenge.difficulty}
          </span>
          <span class="week-badge">
            Week {challenge.weekNumber}
          </span>
        </div>
      {/if}
    </div>
    <div class="xp-rewards">
      <div class="xp-reward">
        <i class="fas fa-star"></i>
        <span>{xpReward} XP</span>
      </div>
      {#if bonusXP > 0 && !isComplete}
        <div class="bonus-reward" class:expired={!bonusTimeRemaining}>
          <i class="fas fa-bolt"></i>
          <span>+{bonusXP}</span>
        </div>
      {/if}
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
        <div class="completion-status">
          <i class="fas fa-check-circle"></i>
          <span>Completed!</span>
          {#if bonusEarned}
            <span class="bonus-badge">Bonus Earned!</span>
          {/if}
        </div>
      {:else}
        <span>{currentProgress} / {targetProgress}</span>
      {/if}
    </div>
  </div>

  <!-- Time Remaining -->
  {#if !isComplete && !compact}
    <div class="time-info">
      {#if timeRemaining}
        <div class="time-block">
          <i class="fas fa-clock"></i>
          <span>
            {timeRemaining.days}d {timeRemaining.hours}h remaining
          </span>
        </div>
      {/if}
      {#if bonusTimeRemaining && bonusXP > 0}
        <div class="bonus-time-block">
          <i class="fas fa-bolt"></i>
          <span>
            Bonus: {bonusTimeRemaining.days}d {bonusTimeRemaining.hours}h left
          </span>
        </div>
      {:else if bonusXP > 0}
        <div class="bonus-time-block expired">
          <i class="fas fa-times-circle"></i>
          <span>Bonus expired</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .weekly-challenge-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    transition: all 0.2s ease;
  }

  .weekly-challenge-card.compact {
    padding: 16px;
    gap: 12px;
  }

  .weekly-challenge-card.complete {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.08);
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .challenge-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
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
    gap: 6px;
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

  .badge-row {
    display: flex;
    gap: 8px;
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
  }

  .week-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    background: rgba(139, 92, 246, 0.2);
    color: #a78bfa;
  }

  .xp-rewards {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }

  .xp-reward {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(139, 92, 246, 0.15);
    border-radius: 20px;
    color: #a78bfa;
    font-size: 13px;
    font-weight: 600;
  }

  .bonus-reward {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 20px;
    color: #f59e0b;
    font-size: 12px;
    font-weight: 600;
  }

  .bonus-reward.expired {
    opacity: 0.5;
    text-decoration: line-through;
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
    background: linear-gradient(90deg, #8b5cf6, #7c3aed);
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

  .completion-status {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .completion-status .fa-check-circle {
    color: #22c55e;
  }

  .bonus-badge {
    padding: 2px 8px;
    background: rgba(245, 158, 11, 0.2);
    border-radius: 4px;
    color: #f59e0b;
    font-size: 11px;
    font-weight: 600;
  }

  .time-info {
    display: flex;
    gap: 16px;
    padding-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  .time-block,
  .bonus-time-block {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .bonus-time-block {
    color: #f59e0b;
  }

  .bonus-time-block.expired {
    color: rgba(255, 255, 255, 0.4);
  }
</style>
