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
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skill-list.compact {
    gap: 8px;
  }

  .skill-item {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .compact .skill-item {
    padding: 12px;
    gap: 12px;
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
    width: 44px;
    height: 44px;
    background: color-mix(in srgb, var(--category-color) 20%, transparent);
    border-radius: 10px;
    color: var(--category-color);
    font-size: 18px;
    flex-shrink: 0;
  }

  .compact .skill-icon {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }

  .letter-icon {
    font-size: 20px;
    font-weight: 700;
  }

  .compact .letter-icon {
    font-size: 16px;
  }

  .skill-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }

  .skill-header {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .skill-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
  }

  .level-badge {
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 500;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }

  .level-badge.mastered {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
  }

  .skill-description {
    margin: 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-progress {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .progress-bar {
    flex: 1;
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--category-color);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-fill.completed {
    background: #22c55e;
  }

  .progress-text {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
  }

  .progress-text i {
    color: #22c55e;
    margin-right: 4px;
  }

  .skill-xp {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(245, 158, 11, 0.15);
    border-radius: 16px;
    color: #f59e0b;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.4);
  }

  .empty-state i {
    font-size: 32px;
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
  }
</style>
