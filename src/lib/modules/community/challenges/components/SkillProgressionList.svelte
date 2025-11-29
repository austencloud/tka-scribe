<script lang="ts">
  /**
   * SkillProgressionList
   * Displays a list of skill progressions with their progress levels.
   */

  import type {
    SkillProgression,
    UserSkillProgress,
  } from "$lib/shared/gamification/domain/models/challenge-models";

  interface Props {
    skills: SkillProgression[];
    progressMap: Map<string, UserSkillProgress>;
    compact?: boolean;
    onSkillSelect?: (skillId: string) => void;
  }

  let { skills, progressMap, compact = false, onSkillSelect }: Props = $props();

  // Get progress for a skill
  function getProgress(skillId: string): UserSkillProgress | null {
    return progressMap.get(skillId) ?? null;
  }

  // Calculate progress percentage for a skill
  function getProgressPercent(skill: SkillProgression): number {
    const progress = getProgress(skill.skillId);
    if (!progress) return 0;

    const currentLevel = skill.levels[progress.currentLevel - 1];
    if (!currentLevel) return 100; // Completed

    return Math.round(
      (progress.levelProgress / currentLevel.requirement.target) * 100
    );
  }

  // Get level title
  function getLevelTitle(skill: SkillProgression): string {
    const progress = getProgress(skill.skillId);
    if (!progress) return "Not Started";
    if (progress.isCompleted) return "Mastered";

    const currentLevel = skill.levels[progress.currentLevel - 1];
    return currentLevel?.title ?? "Level " + progress.currentLevel;
  }

  // Category colors
  const categoryColors: Record<string, string> = {
    letter_mastery: "#06b6d4",
    concept_mastery: "#8b5cf6",
    practice_goals: "#f59e0b",
  };

  function getCategoryColor(category: string): string {
    return categoryColors[category] ?? "#6b7280";
  }
</script>

<div class="skill-list" class:compact>
  {#each skills as skill (skill.skillId)}
    {@const progress = getProgress(skill.skillId)}
    {@const progressPercent = getProgressPercent(skill)}
    {@const levelTitle = getLevelTitle(skill)}
    {@const isCompleted = progress?.isCompleted ?? false}
    {@const categoryColor = getCategoryColor(skill.skillCategory)}

    <button
      class="skill-item"
      class:completed={isCompleted}
      onclick={() => onSkillSelect?.(skill.skillId)}
      style="--category-color: {categoryColor}"
    >
      <!-- Icon -->
      <div class="skill-icon">
        {#if skill.icon.startsWith("fa-")}
          <i class="fas {skill.icon}"></i>
        {:else}
          <span class="letter-icon">{skill.icon}</span>
        {/if}
      </div>

      <!-- Info -->
      <div class="skill-info">
        <div class="skill-header">
          <h4>{skill.skillName}</h4>
          <span class="level-badge" class:mastered={isCompleted}>
            {levelTitle}
          </span>
        </div>

        {#if !compact}
          <p class="skill-description">{skill.description}</p>
        {/if}

        <!-- Progress bar -->
        <div class="skill-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {progressPercent}%"
              class:completed={isCompleted}
            ></div>
          </div>
          <span class="progress-text">
            {#if isCompleted}
              <i class="fas fa-check"></i> Complete
            {:else if progress}
              Level {progress.currentLevel}/{skill.totalLevels}
            {:else}
              0/{skill.totalLevels} levels
            {/if}
          </span>
        </div>
      </div>

      <!-- XP Reward -->
      <div class="skill-xp">
        <i class="fas fa-star"></i>
        <span>{skill.xpPerLevel * skill.totalLevels}</span>
      </div>
    </button>
  {/each}

  {#if skills.length === 0}
    <div class="empty-state">
      <i class="fas fa-medal"></i>
      <p>No skills to display</p>
    </div>
  {/if}
</div>

<style>
  /* ============================================================================
     BASE STYLES - iPhone SE (320px) Mobile-First
     ============================================================================ */
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .skill-list.compact {
    gap: 6px;
  }

  .skill-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .compact .skill-item {
    padding: 8px;
    gap: 8px;
  }

  .skill-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
  }

  .skill-item.completed {
    border-color: rgba(34, 197, 94, 0.3);
    background: rgba(34, 197, 94, 0.05);
  }

  .skill-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: color-mix(in srgb, var(--category-color) 20%, transparent);
    border-radius: 8px;
    color: var(--category-color);
    font-size: 14px;
    flex-shrink: 0;
  }

  .compact .skill-icon {
    width: 32px;
    height: 32px;
    font-size: 12px;
  }

  .letter-icon {
    font-size: 16px;
    font-weight: 700;
  }

  .compact .letter-icon {
    font-size: 14px;
  }

  .skill-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .skill-header {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .skill-header h4 {
    margin: 0;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  .level-badge {
    padding: 1px 6px;
    font-size: 9px;
    font-weight: 500;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }

  .level-badge.mastered {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .skill-description {
    margin: 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-progress {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .progress-bar {
    flex: 1;
    height: 5px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2.5px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--category-color);
    border-radius: 2.5px;
    transition: width 0.3s ease;
  }

  .progress-fill.completed {
    background: #22c55e;
  }

  .progress-text {
    font-size: 10px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
  }

  .progress-text i {
    color: #22c55e;
    margin-right: 3px;
  }

  .skill-xp {
    display: flex;
    align-items: center;
    gap: 3px;
    padding: 3px 6px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 12px;
    color: #f59e0b;
    font-size: 10px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 30px 16px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
  }

  .empty-state i {
    font-size: 28px;
  }

  .empty-state p {
    margin: 0;
    font-size: 12px;
  }

  /* ============================================================================
     LARGE MOBILE (481px+)
     ============================================================================ */
  @media (min-width: 481px) {
    .skill-list {
      gap: 10px;
    }

    .skill-list.compact {
      gap: 8px;
    }

    .skill-item {
      gap: 12px;
      padding: 14px;
      border-radius: 11px;
    }

    .compact .skill-item {
      padding: 10px;
      gap: 10px;
    }

    .skill-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
      border-radius: 9px;
    }

    .compact .skill-icon {
      width: 34px;
      height: 34px;
      font-size: 13px;
    }

    .letter-icon {
      font-size: 18px;
    }

    .compact .letter-icon {
      font-size: 15px;
    }

    .skill-info {
      gap: 7px;
    }

    .skill-header {
      gap: 7px;
    }

    .skill-header h4 {
      font-size: 13px;
    }

    .level-badge {
      padding: 2px 7px;
      font-size: 10px;
    }

    .skill-description {
      font-size: 12px;
      line-height: 1.4;
    }

    .skill-progress {
      gap: 10px;
    }

    .progress-bar {
      height: 5.5px;
    }

    .progress-text {
      font-size: 11px;
    }

    .skill-xp {
      gap: 4px;
      padding: 4px 8px;
      font-size: 11px;
    }

    .empty-state {
      gap: 12px;
      padding: 35px 20px;
    }

    .empty-state i {
      font-size: 30px;
    }

    .empty-state p {
      font-size: 13px;
    }
  }

  /* ============================================================================
     TABLET (641px+)
     ============================================================================ */
  @media (min-width: 641px) {
    .skill-list {
      gap: 12px;
    }

    .skill-list.compact {
      gap: 8px;
    }

    .skill-item {
      gap: 16px;
      padding: 16px;
      border-radius: 12px;
    }

    .compact .skill-item {
      padding: 12px;
      gap: 12px;
    }

    .skill-icon {
      width: 44px;
      height: 44px;
      font-size: 18px;
      border-radius: 10px;
    }

    .compact .skill-icon {
      width: 36px;
      height: 36px;
      font-size: 14px;
    }

    .letter-icon {
      font-size: 20px;
    }

    .compact .letter-icon {
      font-size: 16px;
    }

    .skill-info {
      gap: 8px;
    }

    .skill-header {
      gap: 8px;
    }

    .skill-header h4 {
      font-size: 14px;
      white-space: normal;
    }

    .level-badge {
      padding: 2px 8px;
      font-size: 11px;
      border-radius: 4px;
    }

    .skill-description {
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .skill-progress {
      gap: 12px;
    }

    .progress-bar {
      height: 6px;
      border-radius: 3px;
    }

    .progress-fill {
      border-radius: 3px;
    }

    .progress-text {
      font-size: 11px;
    }

    .progress-text i {
      margin-right: 4px;
    }

    .skill-xp {
      gap: 4px;
      padding: 4px 10px;
      font-size: 12px;
      border-radius: 16px;
    }

    .empty-state {
      gap: 12px;
      padding: 40px 20px;
    }

    .empty-state i {
      font-size: 32px;
    }

    .empty-state p {
      font-size: 14px;
    }
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .skill-item,
    .progress-fill {
      transition: none;
    }
  }
</style>
