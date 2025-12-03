<!--
  ChallengeCard.svelte - Train Challenge Card (Refined 2026 Style)

  Sophisticated cards with colored accents rather than overwhelming gradients.
  Neutral bodies with colored top bars signal difficulty at a glance.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { resolve, TYPES } from "$lib/shared/inversify/di";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import type {
    TrainChallenge,
    UserTrainChallengeProgress,
  } from "../../domain/models/TrainChallengeModels";
  import {
    calculateChallengeProgress,
  } from "../../domain/models/TrainChallengeModels";
  import type { ChallengeDifficulty } from "$lib/shared/gamification/domain/models/achievement-models";

  interface Props {
    challenge: TrainChallenge;
    progress: UserTrainChallengeProgress | null;
    onStart?: (challengeId: string) => void;
  }

  let { challenge, progress, onStart }: Props = $props();

  // Haptic feedback service
  let hapticService: IHapticFeedbackService | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

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

  // Refined color theme - accent colors for top bar and subtle tints
  const difficultyTheme = $derived.by(() => {
    const themes: Record<ChallengeDifficulty, {
      color: string;
      gradient: string;
      tint: string;
      glow: string;
    }> = {
      easy: {
        color: "#10b981",
        gradient: "linear-gradient(90deg, #10b981 0%, #34d399 100%)",
        tint: "rgba(16, 185, 129, 0.06)",
        glow: "rgba(16, 185, 129, 0.3)"
      },
      beginner: {
        color: "#22c55e",
        gradient: "linear-gradient(90deg, #22c55e 0%, #4ade80 100%)",
        tint: "rgba(34, 197, 94, 0.06)",
        glow: "rgba(34, 197, 94, 0.3)"
      },
      medium: {
        color: "#f59e0b",
        gradient: "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)",
        tint: "rgba(245, 158, 11, 0.06)",
        glow: "rgba(245, 158, 11, 0.3)"
      },
      intermediate: {
        color: "#eab308",
        gradient: "linear-gradient(90deg, #eab308 0%, #facc15 100%)",
        tint: "rgba(234, 179, 8, 0.06)",
        glow: "rgba(234, 179, 8, 0.3)"
      },
      hard: {
        color: "#f97316",
        gradient: "linear-gradient(90deg, #f97316 0%, #fb923c 100%)",
        tint: "rgba(249, 115, 22, 0.06)",
        glow: "rgba(249, 115, 22, 0.3)"
      },
      advanced: {
        color: "#ef4444",
        gradient: "linear-gradient(90deg, #ef4444 0%, #f87171 100%)",
        tint: "rgba(239, 68, 68, 0.06)",
        glow: "rgba(239, 68, 68, 0.3)"
      },
      expert: {
        color: "#dc2626",
        gradient: "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)",
        tint: "rgba(220, 38, 38, 0.08)",
        glow: "rgba(220, 38, 38, 0.35)"
      }
    };
    return themes[challenge.difficulty] ?? themes.medium;
  });

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
    hapticService?.trigger("selection");
    onStart(challenge.id);
  }
</script>

<button
  class="challenge-card"
  class:complete={isComplete}
  class:clickable={!isComplete && onStart}
  style="--accent-color: {difficultyTheme.color}; --accent-gradient: {difficultyTheme.gradient}; --accent-tint: {difficultyTheme.tint}; --accent-glow: {difficultyTheme.glow}"
  onclick={handleClick}
  disabled={isComplete}
>
  <!-- Colored top accent bar -->
  <div class="accent-bar"></div>

  <!-- Card Content -->
  <div class="card-content">
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

    <!-- Tags -->
    <div class="tags-row">
      <span class="tag difficulty">
        {challenge.difficulty}
      </span>
      {#if modeBadge}
        <span class="tag mode">{modeBadge}</span>
      {/if}
    </div>

    <!-- Progress (if started) -->
    {#if isStarted}
      <div class="progress-section">
        <div class="progress-track">
          <div
            class="progress-fill"
            class:complete={isComplete}
            style="width: {progressPercent}%; background: var(--accent-gradient)"
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
  </div>
</button>

<style>
  /* ============================================================================
     REFINED 2026 CHALLENGE CARD
     Neutral body with colored accent bar - sophisticated, not overwhelming
     ============================================================================ */
  .challenge-card {
    display: flex;
    flex-direction: column;
    min-height: 160px;
    background: var(--accent-tint);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    text-align: left;
    cursor: default;
    transition: all 0.2s ease;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .challenge-card.clickable {
    cursor: pointer;
  }

  .challenge-card.clickable:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow:
      0 12px 32px rgba(0, 0, 0, 0.2),
      0 0 0 1px var(--accent-color),
      0 0 40px var(--accent-glow);
  }

  .challenge-card.clickable:active {
    transform: translateY(-1px);
    transition: all 0.1s ease;
  }

  /* Completed state */
  .challenge-card.complete {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.2);
    opacity: 0.9;
  }

  .challenge-card.complete .accent-bar {
    background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
  }

  /* Colored top accent bar */
  .accent-bar {
    height: 4px;
    background: var(--accent-gradient);
    flex-shrink: 0;
  }

  /* Card content wrapper */
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 18px 20px 20px;
    flex: 1;
  }

  /* Header */
  .card-header {
    display: flex;
    justify-content: space-between;
    gap: 14px;
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
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.35;
    letter-spacing: -0.01em;
  }

  .card-description {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
    color: rgba(255, 255, 255, 0.55);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* XP Badge - Premium golden look */
  .xp-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: linear-gradient(
      135deg,
      rgba(251, 191, 36, 0.15) 0%,
      rgba(245, 158, 11, 0.1) 100%
    );
    border: 1px solid rgba(251, 191, 36, 0.25);
    border-radius: 12px;
    flex-shrink: 0;
  }

  .xp-badge i {
    font-size: 12px;
    color: #fbbf24;
  }

  .xp-value {
    font-size: 14px;
    font-weight: 700;
    color: #fcd34d;
  }

  .xp-badge .bonus {
    font-size: 11px;
    font-weight: 600;
    color: #f59e0b;
  }

  /* Tags */
  .tags-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 5px 10px;
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 6px;
  }

  .tag.difficulty {
    background: color-mix(in srgb, var(--accent-color) 20%, transparent);
    color: var(--accent-color);
    border: 1px solid color-mix(in srgb, var(--accent-color) 30%, transparent);
  }

  .tag.mode {
    background: rgba(99, 102, 241, 0.12);
    color: #a5b4fc;
    border: 1px solid rgba(99, 102, 241, 0.2);
  }

  /* Progress Section */
  .progress-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .progress-track {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .progress-fill.complete {
    background: linear-gradient(90deg, #22c55e, #4ade80) !important;
  }

  .progress-text {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    min-width: 44px;
    text-align: right;
  }

  .progress-text i {
    color: #4ade80;
  }

  /* Footer */
  .card-footer {
    display: flex;
    justify-content: flex-end;
    min-height: 48px;
    align-items: center;
    margin-top: auto;
  }

  .action-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 18px;
    background: color-mix(in srgb, var(--accent-color) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent-color) 25%, transparent);
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: var(--accent-color);
    transition: all 0.2s ease;
  }

  .challenge-card.clickable:hover .action-hint {
    background: color-mix(in srgb, var(--accent-color) 18%, transparent);
    border-color: color-mix(in srgb, var(--accent-color) 35%, transparent);
    gap: 10px;
  }

  .action-hint i {
    font-size: 11px;
    transition: transform 0.2s ease;
  }

  .challenge-card.clickable:hover .action-hint i {
    transform: translateX(3px);
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 16px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
  }

  .status-badge.complete {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .status-badge i {
    font-size: 14px;
  }

  /* ============================================================================
     RESPONSIVE ADJUSTMENTS
     ============================================================================ */
  @media (min-width: 481px) {
    .card-content {
      padding: 20px 22px 22px;
      gap: 16px;
    }

    .card-title {
      font-size: 17px;
    }

    .card-description {
      font-size: 14px;
    }

    .xp-badge {
      padding: 8px 14px;
    }

    .xp-value {
      font-size: 15px;
    }

    .tag {
      padding: 6px 12px;
      font-size: 11px;
    }
  }

  @media (min-width: 641px) {
    .challenge-card {
      min-height: 170px;
    }

    .accent-bar {
      height: 5px;
    }

    .card-content {
      padding: 22px 24px 24px;
    }

    .card-title {
      font-size: 18px;
    }
  }

  /* ============================================================================
     LANDSCAPE MOBILE - Compact with accessible touch targets
     ============================================================================ */
  @media (max-height: 500px) and (orientation: landscape) {
    .challenge-card {
      min-height: auto;
    }

    .card-content {
      padding: 14px 16px 16px;
      gap: 10px;
    }

    .card-title {
      font-size: 14px;
    }

    .card-description {
      -webkit-line-clamp: 1;
      line-clamp: 1;
    }

    .xp-badge {
      padding: 6px 10px;
    }

    .xp-value {
      font-size: 13px;
    }

    /* Visual size compact but touch target maintained at 48px */
    .action-hint,
    .status-badge {
      height: 40px;
      font-size: 12px;
      position: relative;
    }

    .action-hint::before,
    .status-badge::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      min-width: 100%;
      min-height: 48px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .challenge-card,
    .progress-fill,
    .action-hint,
    .action-hint i {
      transition: none;
    }
  }
</style>
