<script lang="ts">
  /**
   * ChallengesPanelDesktop
   * Desktop-optimized Challenges panel with modern bento-style layout.
   * Takes full advantage of larger screens with side-by-side layouts,
   * animated cards, and a 2026-ready aesthetic.
   */

  import { onMount } from "svelte";
  import { resolve, tryResolve } from "$lib/shared/inversify";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IChallengeCoordinator } from "$lib/shared/gamification/services/contracts";
  import type { ChallengeDashboard } from "$lib/shared/gamification/domain/models/challenge-models";
  import { PanelState } from "$lib/shared";

  // State
  let isLoading = $state(true);
  let error = $state<string | null>(null);
  let dashboard = $state<ChallengeDashboard | null>(null);

  // Service
  let coordinator: IChallengeCoordinator | null = null;

  // Stats configuration with gradients
  const statsConfig = [
    {
      key: "dailyStreak",
      label: "Daily Streak",
      suffix: "days",
      icon: "fa-fire",
      gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    },
    {
      key: "weeklyStreak",
      label: "Weekly Streak",
      suffix: "weeks",
      icon: "fa-calendar-check",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
    {
      key: "totalChallengesCompleted",
      label: "Challenges Done",
      suffix: "",
      icon: "fa-trophy",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
    {
      key: "totalSkillsCompleted",
      label: "Skills Mastered",
      suffix: "",
      icon: "fa-medal",
      gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    },
    {
      key: "totalSkillLevels",
      label: "Skill Levels",
      suffix: "",
      icon: "fa-star",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    },
  ];

  // Get stat value by key
  function getStatValue(key: string): number {
    if (!dashboard) return 0;
    return (dashboard.stats as Record<string, number>)[key] ?? 0;
  }

  // Time calculations
  function getDailyTimeRemaining() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - now.getTime();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  function getWeeklyTimeRemaining() {
    if (!dashboard?.weekly.challenge) return null;
    const now = new Date();
    const end = new Date(dashboard.weekly.challenge.endDate);
    const ms = end.getTime() - now.getTime();
    if (ms <= 0) return null;
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  }

  // Progress calculations
  function getDailyProgress(): {
    current: number;
    target: number;
    percent: number;
  } {
    if (!dashboard?.daily.challenge)
      return { current: 0, target: 1, percent: 0 };
    const current = dashboard.daily.progress?.progress ?? 0;
    const target = dashboard.daily.challenge.requirement.target;
    return {
      current,
      target,
      percent: Math.min(100, Math.round((current / target) * 100)),
    };
  }

  function getWeeklyProgress(): {
    current: number;
    target: number;
    percent: number;
  } {
    if (!dashboard?.weekly.challenge)
      return { current: 0, target: 1, percent: 0 };
    const current = dashboard.weekly.progress?.progress ?? 0;
    const target = dashboard.weekly.challenge.requirement.target;
    return {
      current,
      target,
      percent: Math.min(100, Math.round((current / target) * 100)),
    };
  }

  onMount(async () => {
    try {
      coordinator = tryResolve<IChallengeCoordinator>(
        TYPES.IChallengeCoordinator
      );
      if (!coordinator) {
        coordinator = resolve<IChallengeCoordinator>(
          TYPES.IChallengeCoordinator
        );
      }
      await coordinator.initialize();
      dashboard = await coordinator.getDashboard();
      isLoading = false;
    } catch (err) {
      console.error("[ChallengesPanelDesktop] Error loading challenges:", err);
      error = err instanceof Error ? err.message : "Failed to load challenges";
      isLoading = false;
    }
  });
</script>

<div class="challenges-desktop">
  {#if error}
    <PanelState type="error" title="Error" message={error} />
  {:else if isLoading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading challenges...</p>
    </div>
  {:else if dashboard}
    <!-- Bento Grid Layout -->
    <div class="bento-grid">
      <!-- Stats Row - Spans full width -->
      <section class="bento-card stats-row">
        <div class="stats-grid">
          {#each statsConfig as stat, i}
            <div
              class="stat-card"
              style="--stat-gradient: {stat.gradient}; --delay: {i * 0.05}s"
            >
              <div class="stat-icon-wrap">
                <i class="fas {stat.icon}"></i>
              </div>
              <div class="stat-content">
                <span class="stat-value">
                  {getStatValue(stat.key)}{stat.suffix ? ` ${stat.suffix}` : ""}
                </span>
                <span class="stat-label">{stat.label}</span>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <!-- Daily Challenge Card -->
      <section class="bento-card daily-card">
        <div class="card-header">
          <div class="card-icon daily-icon">
            <i class="fas fa-sun"></i>
          </div>
          <div class="card-title-group">
            <h2>Today's Challenge</h2>
            <span class="time-badge">
              <i class="fas fa-clock"></i>
              {getDailyTimeRemaining()} left
            </span>
          </div>
        </div>

        {#if dashboard.daily.challenge}
          {@const progress = getDailyProgress()}
          {@const isComplete = dashboard.daily.progress?.isCompleted}
          <div class="challenge-content" class:complete={isComplete}>
            <h3 class="challenge-title">{dashboard.daily.challenge.title}</h3>
            <p class="challenge-description">
              {dashboard.daily.challenge.description}
            </p>

            <div class="progress-section">
              <div class="progress-bar-container">
                <div
                  class="progress-bar-fill daily-fill"
                  class:complete={isComplete}
                  style="width: {progress.percent}%"
                ></div>
              </div>
              <div class="progress-info">
                {#if isComplete}
                  <span class="complete-badge">
                    <i class="fas fa-check-circle"></i>
                    Completed!
                  </span>
                {:else}
                  <span class="progress-text"
                    >{progress.current} / {progress.target}</span
                  >
                {/if}
                <span class="xp-badge">
                  <i class="fas fa-star"></i>
                  {dashboard.daily.challenge.xpReward} XP
                </span>
              </div>
            </div>

            <div class="difficulty-row">
              <span
                class="difficulty-badge"
                class:easy={dashboard.daily.challenge.difficulty === "easy"}
                class:medium={dashboard.daily.challenge.difficulty === "medium"}
                class:hard={dashboard.daily.challenge.difficulty === "hard"}
              >
                {dashboard.daily.challenge.difficulty}
              </span>
            </div>
          </div>
        {:else}
          <div class="empty-challenge">
            <div class="empty-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <p>No daily challenge available</p>
            <span class="empty-hint">Check back tomorrow!</span>
          </div>
        {/if}
      </section>

      <!-- Weekly Challenge Card -->
      <section class="bento-card weekly-card">
        <div class="card-header">
          <div class="card-icon weekly-icon">
            <i class="fas fa-calendar-week"></i>
          </div>
          <div class="card-title-group">
            <h2>This Week's Challenge</h2>
            {#if getWeeklyTimeRemaining()}
              <span class="time-badge">
                <i class="fas fa-hourglass-half"></i>
                {getWeeklyTimeRemaining()} remaining
              </span>
            {/if}
          </div>
        </div>

        {#if dashboard.weekly.challenge}
          {@const progress = getWeeklyProgress()}
          {@const isComplete = dashboard.weekly.progress?.isCompleted}
          {@const bonusEarned = dashboard.weekly.progress?.bonusEarned}
          <div class="challenge-content" class:complete={isComplete}>
            <h3 class="challenge-title">{dashboard.weekly.challenge.title}</h3>
            <p class="challenge-description">
              {dashboard.weekly.challenge.description}
            </p>

            <div class="progress-section">
              <div class="progress-bar-container">
                <div
                  class="progress-bar-fill weekly-fill"
                  class:complete={isComplete}
                  style="width: {progress.percent}%"
                ></div>
              </div>
              <div class="progress-info">
                {#if isComplete}
                  <span class="complete-badge">
                    <i class="fas fa-check-circle"></i>
                    Completed!
                    {#if bonusEarned}
                      <span class="bonus-earned">+ Bonus!</span>
                    {/if}
                  </span>
                {:else}
                  <span class="progress-text"
                    >{progress.current} / {progress.target}</span
                  >
                {/if}
                <span class="xp-badge">
                  <i class="fas fa-star"></i>
                  {dashboard.weekly.challenge.xpReward} XP
                  {#if dashboard.weekly.challenge.bonusMultiplier && !isComplete}
                    <span class="bonus-xp">
                      +{Math.floor(
                        dashboard.weekly.challenge.xpReward *
                          dashboard.weekly.challenge.bonusMultiplier
                      )}
                    </span>
                  {/if}
                </span>
              </div>
            </div>

            <div class="difficulty-row">
              <span
                class="difficulty-badge"
                class:easy={dashboard.weekly.challenge.difficulty === "easy"}
                class:medium={dashboard.weekly.challenge.difficulty ===
                  "medium"}
                class:hard={dashboard.weekly.challenge.difficulty === "hard"}
              >
                {dashboard.weekly.challenge.difficulty}
              </span>
              <span class="week-badge"
                >Week {dashboard.weekly.challenge.weekNumber}</span
              >
            </div>
          </div>
        {:else}
          <div class="empty-challenge">
            <div class="empty-icon">
              <i class="fas fa-calendar-times"></i>
            </div>
            <p>No weekly challenge available</p>
            <span class="empty-hint">Check back next week!</span>
          </div>
        {/if}
      </section>

      <!-- Skills in Progress Card -->
      <section class="bento-card skills-card">
        <div class="card-header">
          <div class="card-icon skills-icon">
            <i class="fas fa-medal"></i>
          </div>
          <div class="card-title-group">
            <h2>Skills in Progress</h2>
            <span class="count-badge">
              {dashboard.skills.inProgressSkills.length} active
            </span>
          </div>
        </div>

        {#if dashboard.skills.inProgressSkills.length > 0}
          <div class="skills-list">
            {#each dashboard.skills.inProgressSkills.slice(0, 4) as skill, i}
              {@const progress = dashboard.skills.userProgress.get(
                skill.skillId
              )}
              {@const isCompleted = progress?.isCompleted}
              {@const currentLevel = progress?.currentLevel ?? 1}
              {@const levelProgress = progress?.levelProgress ?? 0}
              {@const currentLevelData = skill.levels[currentLevel - 1]}
              {@const progressPercent = currentLevelData
                ? Math.round(
                    (levelProgress / currentLevelData.requirement.target) * 100
                  )
                : 0}
              <div
                class="skill-item"
                class:completed={isCompleted}
                style="--delay: {i * 0.05}s"
              >
                <div
                  class="skill-icon"
                  style="--skill-color: {skill.skillCategory ===
                  'letter_mastery'
                    ? '#06b6d4'
                    : skill.skillCategory === 'concept_mastery'
                      ? '#8b5cf6'
                      : '#f59e0b'}"
                >
                  {#if skill.icon.startsWith("fa-")}
                    <i class="fas {skill.icon}"></i>
                  {:else}
                    <span class="letter-icon">{skill.icon}</span>
                  {/if}
                </div>
                <div class="skill-info">
                  <span class="skill-name">{skill.skillName}</span>
                  <div class="skill-progress-bar">
                    <div
                      class="skill-progress-fill"
                      class:completed={isCompleted}
                      style="width: {isCompleted ? 100 : progressPercent}%"
                    ></div>
                  </div>
                  <span class="skill-level">
                    {#if isCompleted}
                      <i class="fas fa-crown"></i> Mastered
                    {:else}
                      Level {currentLevel}/{skill.totalLevels}
                    {/if}
                  </span>
                </div>
              </div>
            {/each}
          </div>
          {#if dashboard.skills.inProgressSkills.length > 4}
            <div class="skills-more">
              +{dashboard.skills.inProgressSkills.length - 4} more skills
            </div>
          {/if}
        {:else}
          <div class="empty-challenge">
            <div class="empty-icon">
              <i class="fas fa-star"></i>
            </div>
            <p>Start a skill to track your progress</p>
            <span class="empty-hint"
              >Master letters and concepts to level up!</span
            >
          </div>
        {/if}
      </section>
    </div>
  {:else}
    <PanelState
      type="empty"
      icon="fa-bolt"
      title="No Challenges"
      message="Challenges will appear here when available"
    />
  {/if}
</div>

<style>
  /* ============================================================================
     DESKTOP CHALLENGES - BENTO GRID LAYOUT
     Modern 2026 aesthetic with glassmorphism and smooth animations
     ============================================================================ */

  .challenges-desktop {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 24px;
    overflow-y: auto;
    overflow-x: hidden;
    background: transparent;
  }

  /* Loading State */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    height: 100%;
    color: rgba(255, 255, 255, 0.6);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ============================================================================
     BENTO GRID
     ============================================================================ */

  .bento-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto 1fr 1fr;
    gap: 20px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
  }

  .bento-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(12px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    animation: fadeInUp 0.5s ease-out backwards;
  }

  .bento-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Stats Row - Full width */
  .stats-row {
    grid-column: 1 / -1;
    padding: 20px;
    animation-delay: 0s;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease-out backwards;
    animation-delay: var(--delay, 0s);
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.04);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }

  .stat-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--stat-gradient);
    border-radius: 12px;
    font-size: 20px;
    color: white;
    box-shadow: 0 4px 16px
      color-mix(in srgb, var(--stat-gradient) 30%, transparent);
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* Daily Card */
  .daily-card {
    animation-delay: 0.1s;
  }

  /* Weekly Card */
  .weekly-card {
    animation-delay: 0.15s;
  }

  /* Skills Card - Full width on bottom */
  .skills-card {
    grid-column: 1 / -1;
    animation-delay: 0.2s;
  }

  /* ============================================================================
     CARD HEADER
     ============================================================================ */

  .card-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 14px;
    font-size: 20px;
    color: white;
  }

  .daily-icon {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
  }

  .weekly-icon {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  }

  .skills-icon {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
  }

  .card-title-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .card-title-group h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .time-badge,
  .count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .time-badge i {
    font-size: 11px;
  }

  /* ============================================================================
     CHALLENGE CONTENT
     ============================================================================ */

  .challenge-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .challenge-content.complete {
    opacity: 0.85;
  }

  .challenge-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .challenge-description {
    margin: 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
  }

  /* Progress Section */
  .progress-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .progress-bar-container {
    height: 10px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    border-radius: 10px;
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .daily-fill {
    background: linear-gradient(90deg, #f97316 0%, #f59e0b 100%);
    box-shadow: 0 0 12px rgba(249, 115, 22, 0.4);
  }

  .weekly-fill {
    background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
    box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
  }

  .progress-bar-fill.complete {
    background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
    box-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
  }

  .progress-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .progress-text {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .complete-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 600;
    color: #22c55e;
  }

  .bonus-earned {
    color: #f59e0b;
    font-size: 12px;
  }

  .xp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    color: #f59e0b;
  }

  .bonus-xp {
    color: #22c55e;
    font-size: 11px;
  }

  /* Difficulty & Week Badges */
  .difficulty-row {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .difficulty-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .difficulty-badge.easy {
    background: rgba(34, 197, 94, 0.15);
    color: #22c55e;
  }

  .difficulty-badge.medium {
    background: rgba(245, 158, 11, 0.15);
    color: #f59e0b;
  }

  .difficulty-badge.hard {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
  }

  .week-badge {
    padding: 4px 10px;
    background: rgba(139, 92, 246, 0.15);
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    color: #a78bfa;
  }

  /* ============================================================================
     EMPTY STATE
     ============================================================================ */

  .empty-challenge {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
  }

  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    background: rgba(255, 255, 255, 0.04);
    border-radius: 20px;
    font-size: 28px;
    color: rgba(255, 255, 255, 0.3);
  }

  .empty-challenge p {
    margin: 0;
    font-size: 15px;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-hint {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ============================================================================
     SKILLS LIST
     ============================================================================ */

  .skills-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 14px;
    transition: all 0.3s ease;
    animation: fadeInUp 0.5s ease-out backwards;
    animation-delay: var(--delay, 0s);
  }

  .skill-item:hover {
    background: rgba(255, 255, 255, 0.04);
    transform: translateX(4px);
  }

  .skill-item.completed {
    border-color: rgba(34, 197, 94, 0.2);
    background: rgba(34, 197, 94, 0.05);
  }

  .skill-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: color-mix(in srgb, var(--skill-color) 15%, transparent);
    border-radius: 12px;
    color: var(--skill-color);
    font-size: 18px;
    flex-shrink: 0;
  }

  .letter-icon {
    font-size: 20px;
    font-weight: 700;
  }

  .skill-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .skill-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    overflow: hidden;
  }

  .skill-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #06b6d4 0%, #22d3ee 100%);
    border-radius: 6px;
    transition: width 0.6s ease;
  }

  .skill-progress-fill.completed {
    background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
  }

  .skill-level {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .skill-level i {
    color: #f59e0b;
    font-size: 10px;
  }

  .skills-more {
    margin-top: 12px;
    text-align: center;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ============================================================================
     RESPONSIVE - EXTRA LARGE SCREENS
     ============================================================================ */

  @media (min-width: 1600px) {
    .bento-grid {
      gap: 24px;
    }

    .bento-card {
      padding: 28px;
    }

    .stats-grid {
      gap: 20px;
    }

    .stat-icon-wrap {
      width: 56px;
      height: 56px;
      font-size: 24px;
    }

    .stat-value {
      font-size: 26px;
    }
  }

  /* ============================================================================
     RESPONSIVE - SMALLER DESKTOP
     ============================================================================ */

  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    .stat-card {
      flex-direction: column;
      text-align: center;
      padding: 14px;
      gap: 10px;
    }

    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      font-size: 18px;
    }

    .stat-value {
      font-size: 20px;
    }

    .skills-list {
      grid-template-columns: 1fr;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */

  @media (prefers-reduced-motion: reduce) {
    .bento-card,
    .stat-card,
    .skill-item {
      animation: none;
      transition: none;
    }

    .progress-bar-fill,
    .skill-progress-fill {
      transition: none;
    }
  }
</style>
