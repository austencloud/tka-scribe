<!--
  ChallengeCard.svelte - Train Challenge Card (Modern Bento Style)

  Clean, minimalist challenge card with 48px touch targets and modern interactions.
-->
<script lang="ts">
  import type {
    TrainChallenge,
    UserTrainChallengeProgress,
  } from "../../domain/models/TrainChallengeModels";
  import {
    calculateChallengeProgress,
    getDifficultyColor,
  } from "../../domain/models/TrainChallengeModels";

  interface Props {
    challenge: TrainChallenge;
    progress: UserTrainChallengeProgress | null;
    onStart?: (challengeId: string) => void;
  }

  let { challenge, progress, onStart }: Props = $props();

  // Calculated values
  const currentProgress = $derived(progress?.progress ?? 0);
  const targetProgress = $derived(challenge.requirement.target);
  const progressPercent = $derived(
    calculateChallengeProgress(currentProgress, targetProgress)
  );
  const isComplete = $derived(progress?.isCompleted ?? false);
  const isStarted = $derived(progress !== null);
  const xpReward = $derived(challenge.xpReward);
  const bonusXP = $derived(challenge.bonusXP ?? 0);
  const difficultyColor = $derived(getDifficultyColor(challenge.difficulty));

  // Mode badge text
  const modeBadge = $derived.by(() => {
    const mode = challenge.requirement.metadata?.mode;
    if (!mode) return null;
    const modeLabels: Record<string, string> = {
      adaptive: "Adaptive",
      step_by_step: "Step-by-Step",
      timed: "Timed",
    };
    return modeLabels[mode] ?? null;
  });

  function handleClick() {
    if (isComplete || !onStart) return;
    onStart(challenge.id);
  }
</script>

<button
  class="challenge-card"
  class:complete={isComplete}
  class:clickable={!isComplete && onStart}
  style="--difficulty-color: {difficultyColor}"
  onclick={handleClick}
  disabled={isComplete}
>
  <!-- Header: Title + XP Badge -->
  <div class="card-header">
    <div class="header-content">
      <h3 class="card-title">{challenge.title}</h3>
      <p class="card-description">{challenge.description}</p>
    </div>
    <div class="xp-badge">
      <i class="fas fa-star"></i>
      <span class="xp-value">{xpReward}</span>
      {#if bonusXP > 0 && !isComplete}
        <span class="bonus">+{bonusXP}</span>
      {/if}
    </div>
  </div>

  <!-- Tags + Progress -->
  <div class="card-body">
    <div class="tags-row">
      <span class="tag difficulty" style="--tag-color: {difficultyColor}">
        {challenge.difficulty}
      </span>
      {#if modeBadge}
        <span class="tag mode">{modeBadge}</span>
      {/if}
    </div>

    {#if isStarted}
      <div class="progress-section">
        <div class="progress-track">
          <div
            class="progress-fill"
            class:complete={isComplete}
            style="width: {progressPercent}%"
          ></div>
        </div>
        <span class="progress-text">
          {#if isComplete}
            <i class="fas fa-check"></i>
          {:else}
            {currentProgress}/{targetProgress}
          {/if}
        </span>
      </div>
    {/if}
  </div>

  <!-- Action Footer -->
  <div class="card-footer">
    {#if isComplete}
      <div class="status-badge complete">
        <i class="fas fa-check-circle"></i>
        <span>Completed</span>
      </div>
    {:else}
      <div class="action-hint">
        <span>{isStarted ? "Continue" : "Start"}</span>
        <i class="fas fa-arrow-right"></i>
      </div>
    {/if}
  </div>
</button>

<style>
  /* ============================================================================
     MODERN CHALLENGE CARD - 48px Touch Targets, Clean Design
     ============================================================================ */
  .challenge-card {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    min-height: 140px;
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.04) 0%,
      rgba(255, 255, 255, 0.02) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-left: 4px solid var(--difficulty-color);
    border-radius: 20px;
    text-align: left;
    cursor: default;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  /* Subtle gradient overlay */
  .challenge-card::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      transparent 0%,
      rgba(var(--difficulty-color-rgb, 139, 92, 246), 0.03) 100%
    );
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }

  .challenge-card.clickable {
    cursor: pointer;
  }

  .challenge-card.clickable:hover {
    transform: translateY(-3px);
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.03) 100%
    );
    border-color: rgba(255, 255, 255, 0.12);
    border-left-color: var(--difficulty-color);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.25),
      0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .challenge-card.clickable:hover::before {
    opacity: 1;
  }

  .challenge-card.clickable:active {
    transform: translateY(-1px);
    transition: all 0.1s ease;
  }

  .challenge-card.complete {
    background: linear-gradient(
      145deg,
      rgba(34, 197, 94, 0.08) 0%,
      rgba(34, 197, 94, 0.03) 100%
    );
    border-color: rgba(34, 197, 94, 0.2);
    border-left-color: #22c55e;
  }

  /* Header */
  .card-header {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: flex-start;
  }

  .header-content {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 600;
    color: white;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }

  .card-description {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.5);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* XP Badge */
  .xp-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(167, 139, 250, 0.15) 100%
    );
    border: 1px solid rgba(139, 92, 246, 0.25);
    border-radius: 16px;
    flex-shrink: 0;
  }

  .xp-badge i {
    font-size: 12px;
    color: #fbbf24;
  }

  .xp-value {
    font-size: 14px;
    font-weight: 700;
    color: #c4b5fd;
  }

  .xp-badge .bonus {
    font-size: 12px;
    font-weight: 600;
    color: #fbbf24;
  }

  /* Card Body */
  .card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* Tags */
  .tags-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-radius: 8px;
  }

  .tag.difficulty {
    background: color-mix(in srgb, var(--tag-color) 18%, transparent);
    color: var(--tag-color);
  }

  .tag.mode {
    background: rgba(59, 130, 246, 0.15);
    color: #60a5fa;
  }

  /* Progress Section */
  .progress-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
  }

  .progress-track {
    flex: 1;
    height: 8px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
    border-radius: 4px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #22c55e, #4ade80);
  }

  .progress-text {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    min-width: 48px;
    text-align: right;
  }

  .progress-text i {
    color: #22c55e;
  }

  /* Footer - 48px touch target */
  .card-footer {
    display: flex;
    justify-content: flex-end;
    min-height: 48px;
    align-items: center;
  }

  .action-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 20px;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.2),
      rgba(99, 102, 241, 0.12)
    );
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    color: #60a5fa;
    transition: all 0.2s ease;
  }

  .challenge-card.clickable:hover .action-hint {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.3),
      rgba(99, 102, 241, 0.2)
    );
    border-color: rgba(59, 130, 246, 0.4);
    gap: 10px;
  }

  .action-hint i {
    font-size: 12px;
    transition: transform 0.2s ease;
  }

  .challenge-card.clickable:hover .action-hint i {
    transform: translateX(2px);
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 16px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
  }

  .status-badge.complete {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
  }

  .status-badge i {
    font-size: 14px;
  }

  /* ============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================ */
  @media (min-width: 481px) {
    .challenge-card {
      padding: 22px;
      gap: 18px;
    }

    .card-title {
      font-size: 17px;
    }

    .card-description {
      font-size: 14px;
    }

    .xp-badge {
      padding: 8px 16px;
    }

    .xp-value {
      font-size: 15px;
    }
  }

  @media (min-width: 641px) {
    .challenge-card {
      padding: 24px;
      min-height: 160px;
    }

    .card-title {
      font-size: 18px;
    }

    .tag {
      padding: 6px 14px;
      font-size: 11px;
    }
  }

  /* ============================================================================
     LANDSCAPE MOBILE - Compact
     ============================================================================ */
  @media (max-height: 500px) and (orientation: landscape) {
    .challenge-card {
      min-height: auto;
      padding: 16px;
      gap: 12px;
    }

    .card-title {
      font-size: 14px;
    }

    .card-description {
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }

    .xp-badge {
      padding: 6px 12px;
    }

    .xp-value {
      font-size: 13px;
    }

    .action-hint,
    .status-badge {
      height: 48px;
      font-size: 13px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .challenge-card,
    .challenge-card::before,
    .progress-fill,
    .action-hint,
    .action-hint i {
      transition: none;
    }
  }
</style>
