/**
 * Skill Progression Service Implementation
 *
 * Manages skill progression tracking with Firebase/Firestore.
 * Skills represent long-term goals across Letter Mastery, Concept Mastery, and Practice Goals.
 */

import { inject, injectable } from "inversify";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, firestore } from "../../../auth/firebase";
import { db } from "../../../persistence/database/TKADatabase";
import { getUserSkillProgressPath } from "../../data/firestore-collections";
import type {
  SkillProgression,
  UserSkillProgress,
  SkillCategory,
  SkillLevel,
} from "../../domain/models/challenge-models";
import { isSkillUnlocked } from "../../domain/models/challenge-models";
import {
  ALL_SKILLS,
  getSkillsByCategory as getSkillsByCategoryFromDefinitions,
  getSkillById as getSkillByIdFromDefinitions,
} from "../../domain/constants/skill-definitions";
import type {
  ISkillProgressionService,
  SkillProgressActionType,
  SkillProgressMetadata,
} from "../contracts/ISkillProgressionService";
import type { IAchievementService } from "../contracts/IAchievementService";
import { TYPES } from "../../../inversify/types";

@injectable()
export class SkillProgressionService implements ISkillProgressionService {
  private _initialized = false;
  private _achievementService: IAchievementService | null = null;
  private _userProgressCache: Map<string, UserSkillProgress> = new Map();

  constructor(
    @inject(TYPES.IAchievementService) achievementService: IAchievementService
  ) {
    this._achievementService = achievementService;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      return;
    }

    // Load user's skill progress into cache
    await this.getAllUserProgress();

    this._initialized = true;
  }

  // ============================================================================
  // SKILL RETRIEVAL
  // ============================================================================

  async getAllSkills(): Promise<SkillProgression[]> {
    return ALL_SKILLS.filter((skill) => skill.isActive);
  }

  async getSkillsByCategory(category: SkillCategory): Promise<SkillProgression[]> {
    return getSkillsByCategoryFromDefinitions(category).filter(
      (skill) => skill.isActive
    );
  }

  async getSkillById(skillId: string): Promise<SkillProgression | null> {
    const skill = getSkillByIdFromDefinitions(skillId);
    return skill?.isActive ? skill : null;
  }

  async getAvailableSkills(): Promise<SkillProgression[]> {
    const user = auth.currentUser;
    if (!user) return [];

    const completedSkillIds = await this._getCompletedSkillIds();
    const userLevel = await this._getUserLevel();

    return ALL_SKILLS.filter(
      (skill) =>
        skill.isActive && isSkillUnlocked(skill, completedSkillIds, userLevel)
    );
  }

  async getLockedSkills(): Promise<
    Array<{
      skill: SkillProgression;
      reason: "prerequisite" | "level" | "not_active";
      missingPrerequisites?: string[];
      requiredLevel?: number;
    }>
  > {
    const user = auth.currentUser;
    if (!user) return [];

    const completedSkillIds = await this._getCompletedSkillIds();
    const userLevel = await this._getUserLevel();

    const locked: Array<{
      skill: SkillProgression;
      reason: "prerequisite" | "level" | "not_active";
      missingPrerequisites?: string[];
      requiredLevel?: number;
    }> = [];

    for (const skill of ALL_SKILLS) {
      if (!skill.isActive) {
        locked.push({ skill, reason: "not_active" });
        continue;
      }

      // Check level requirement
      if (skill.minimumUserLevel && userLevel < skill.minimumUserLevel) {
        locked.push({
          skill,
          reason: "level",
          requiredLevel: skill.minimumUserLevel,
        });
        continue;
      }

      // Check prerequisites
      if (skill.prerequisiteSkillIds && skill.prerequisiteSkillIds.length > 0) {
        const missing = skill.prerequisiteSkillIds.filter(
          (prereqId) => !completedSkillIds.includes(prereqId)
        );
        if (missing.length > 0) {
          locked.push({
            skill,
            reason: "prerequisite",
            missingPrerequisites: missing,
          });
        }
      }
    }

    return locked;
  }

  // ============================================================================
  // PROGRESS TRACKING
  // ============================================================================

  async getAllUserProgress(): Promise<Map<string, UserSkillProgress>> {
    const user = auth.currentUser;
    if (!user) return new Map();

    // Check cache first
    if (this._userProgressCache.size > 0) {
      return this._userProgressCache;
    }

    // Load from local DB
    const localProgress = await db.userSkillProgress.toArray();
    if (localProgress.length > 0) {
      localProgress.forEach((p) => {
        this._userProgressCache.set(p.skillId, p);
      });
      return this._userProgressCache;
    }

    // Load from Firestore
    try {
      const progressPath = getUserSkillProgressPath(user.uid);
      const progressQuery = query(collection(firestore, progressPath));
      const snapshot = await getDocs(progressQuery);

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const progress: UserSkillProgress = {
          id: doc.id,
          skillId: data.skillId,
          userId: user.uid,
          currentLevel: data.currentLevel || 0,
          levelProgress: data.levelProgress || 0,
          isCompleted: data.isCompleted || false,
          startedAt: data.startedAt?.toDate?.() || new Date(),
          lastProgressAt: data.lastProgressAt?.toDate?.() || new Date(),
          completedLevels: data.completedLevels || [],
          completedAt: data.completedAt?.toDate?.(),
        };

        this._userProgressCache.set(progress.skillId, progress);
        // Cache locally
        db.userSkillProgress.put(progress);
      });

      return this._userProgressCache;
    } catch (error) {
      console.error("Failed to load skill progress from Firestore:", error);
      return new Map();
    }
  }

  async getUserProgress(skillId: string): Promise<UserSkillProgress | null> {
    const allProgress = await this.getAllUserProgress();
    return allProgress.get(skillId) || null;
  }

  async getUserProgressByCategory(
    category: SkillCategory
  ): Promise<Map<string, UserSkillProgress>> {
    const allProgress = await this.getAllUserProgress();
    const categorySkills = await this.getSkillsByCategory(category);
    const categorySkillIds = new Set(categorySkills.map((s) => s.skillId));

    const result = new Map<string, UserSkillProgress>();
    allProgress.forEach((progress, skillId) => {
      if (categorySkillIds.has(skillId)) {
        result.set(skillId, progress);
      }
    });

    return result;
  }

  async startSkill(skillId: string): Promise<UserSkillProgress> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in");
    }

    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    // Check if already started
    const existing = await this.getUserProgress(skillId);
    if (existing) {
      return existing;
    }

    // Check if skill is available
    const available = await this.getAvailableSkills();
    if (!available.find((s) => s.skillId === skillId)) {
      throw new Error(`Skill is locked: ${skillId}`);
    }

    // Create initial progress
    const progress: UserSkillProgress = {
      id: `${user.uid}_${skillId}`,
      skillId,
      userId: user.uid,
      currentLevel: 1,
      levelProgress: 0,
      isCompleted: false,
      startedAt: new Date(),
      lastProgressAt: new Date(),
      completedLevels: [],
    };

    // Save to Firestore
    const progressPath = getUserSkillProgressPath(user.uid);
    const progressDocRef = doc(firestore, `${progressPath}/${skillId}`);
    await setDoc(progressDocRef, {
      ...progress,
      startedAt: serverTimestamp(),
      lastProgressAt: serverTimestamp(),
    });

    // Cache
    this._userProgressCache.set(skillId, progress);
    await db.userSkillProgress.put(progress);

    console.log(`Started skill: ${skill.skillName}`);

    return progress;
  }

  async updateSkillProgress(
    skillId: string,
    progressDelta: number
  ): Promise<{
    progress: UserSkillProgress;
    levelCompleted: boolean;
    skillCompleted: boolean;
    xpAwarded: number;
  }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in");
    }

    const skill = await this.getSkillById(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }

    let currentProgress = await this.getUserProgress(skillId);
    if (!currentProgress) {
      // Auto-start skill
      currentProgress = await this.startSkill(skillId);
    }

    // Already completed
    if (currentProgress.isCompleted) {
      return {
        progress: currentProgress,
        levelCompleted: false,
        skillCompleted: false,
        xpAwarded: 0,
      };
    }

    const currentLevel = skill.levels[currentProgress.currentLevel - 1];
    if (!currentLevel) {
      return {
        progress: currentProgress,
        levelCompleted: false,
        skillCompleted: false,
        xpAwarded: 0,
      };
    }

    const newLevelProgress = currentProgress.levelProgress + progressDelta;
    const levelCompleted = newLevelProgress >= currentLevel.requirement.target;

    const progressPath = getUserSkillProgressPath(user.uid);
    const progressDocRef = doc(firestore, `${progressPath}/${skillId}`);

    let xpAwarded = 0;
    let skillCompleted = false;

    if (levelCompleted) {
      // Level completed
      xpAwarded = currentLevel.xpReward;

      const completedLevels = [
        ...currentProgress.completedLevels,
        currentProgress.currentLevel,
      ];
      const nextLevel = currentProgress.currentLevel + 1;
      skillCompleted = nextLevel > skill.totalLevels;

      const updatedProgress: UserSkillProgress = {
        ...currentProgress,
        currentLevel: skillCompleted ? skill.totalLevels : nextLevel,
        levelProgress: 0,
        isCompleted: skillCompleted,
        completedLevels,
        lastProgressAt: new Date(),
        completedAt: skillCompleted ? new Date() : undefined,
      };

      await updateDoc(progressDocRef, {
        currentLevel: updatedProgress.currentLevel,
        levelProgress: 0,
        isCompleted: skillCompleted,
        completedLevels,
        lastProgressAt: serverTimestamp(),
        ...(skillCompleted && { completedAt: serverTimestamp() }),
      });

      // Cache
      this._userProgressCache.set(skillId, updatedProgress);
      await db.userSkillProgress.put(updatedProgress);

      // Award XP
      if (this._achievementService) {
        await this._achievementService.trackAction("skill_level_completed", {
          skillId,
          skillLevel: currentProgress.currentLevel,
          skillCategory: skill.skillCategory,
        });

        if (skillCompleted) {
          await this._achievementService.trackAction("skill_mastery_achieved", {
            skillId,
            skillCategory: skill.skillCategory,
          });
        }
      }

      console.log(
        `Skill level completed: ${skill.skillName} Level ${currentProgress.currentLevel}${skillCompleted ? " (MASTERED!)" : ""}`
      );

      return {
        progress: updatedProgress,
        levelCompleted: true,
        skillCompleted,
        xpAwarded,
      };
    } else {
      // Progress update
      const updatedProgress: UserSkillProgress = {
        ...currentProgress,
        levelProgress: newLevelProgress,
        lastProgressAt: new Date(),
      };

      await updateDoc(progressDocRef, {
        levelProgress: newLevelProgress,
        lastProgressAt: serverTimestamp(),
      });

      // Cache
      this._userProgressCache.set(skillId, updatedProgress);
      await db.userSkillProgress.put(updatedProgress);

      return {
        progress: updatedProgress,
        levelCompleted: false,
        skillCompleted: false,
        xpAwarded: 0,
      };
    }
  }

  async trackAction(
    actionType: SkillProgressActionType,
    metadata: SkillProgressMetadata
  ): Promise<
    Array<{
      skillId: string;
      progressDelta: number;
      levelCompleted: boolean;
      skillCompleted: boolean;
    }>
  > {
    const results: Array<{
      skillId: string;
      progressDelta: number;
      levelCompleted: boolean;
      skillCompleted: boolean;
    }> = [];

    // Find skills that match this action
    const relevantSkills = await this._findRelevantSkills(actionType, metadata);

    for (const { skill, progressDelta } of relevantSkills) {
      try {
        const result = await this.updateSkillProgress(
          skill.skillId,
          progressDelta
        );
        results.push({
          skillId: skill.skillId,
          progressDelta,
          levelCompleted: result.levelCompleted,
          skillCompleted: result.skillCompleted,
        });
      } catch (error) {
        console.error(`Failed to update skill ${skill.skillId}:`, error);
      }
    }

    return results;
  }

  // ============================================================================
  // LEVEL MANAGEMENT
  // ============================================================================

  async getCurrentLevel(skillId: string): Promise<SkillLevel | null> {
    const skill = await this.getSkillById(skillId);
    if (!skill) return null;

    const progress = await this.getUserProgress(skillId);
    if (!progress || progress.currentLevel === 0) {
      return skill.levels[0] || null;
    }

    return skill.levels[progress.currentLevel - 1] || null;
  }

  async getNextLevel(skillId: string): Promise<SkillLevel | null> {
    const skill = await this.getSkillById(skillId);
    if (!skill) return null;

    const progress = await this.getUserProgress(skillId);
    if (!progress || progress.isCompleted) {
      return null;
    }

    return skill.levels[progress.currentLevel] || null;
  }

  async canLevelUp(skillId: string): Promise<boolean> {
    const skill = await this.getSkillById(skillId);
    if (!skill) return false;

    const progress = await this.getUserProgress(skillId);
    if (!progress || progress.isCompleted) return false;

    const currentLevel = skill.levels[progress.currentLevel - 1];
    if (!currentLevel) return false;

    return progress.levelProgress >= currentLevel.requirement.target;
  }

  async levelUp(skillId: string): Promise<{
    success: boolean;
    newLevel: number;
    xpAwarded: number;
    skillCompleted: boolean;
  }> {
    const canLevel = await this.canLevelUp(skillId);
    if (!canLevel) {
      const progress = await this.getUserProgress(skillId);
      return {
        success: false,
        newLevel: progress?.currentLevel || 0,
        xpAwarded: 0,
        skillCompleted: false,
      };
    }

    // Force completion of current level
    const result = await this.updateSkillProgress(skillId, 9999);

    return {
      success: result.levelCompleted,
      newLevel: result.progress.currentLevel,
      xpAwarded: result.xpAwarded,
      skillCompleted: result.skillCompleted,
    };
  }

  // ============================================================================
  // COMPLETION & MASTERY
  // ============================================================================

  async isSkillMastered(skillId: string): Promise<boolean> {
    const progress = await this.getUserProgress(skillId);
    return progress?.isCompleted ?? false;
  }

  async getMasteredSkills(): Promise<SkillProgression[]> {
    const allProgress = await this.getAllUserProgress();
    const completedSkillIds: string[] = [];

    allProgress.forEach((progress, skillId) => {
      if (progress.isCompleted) {
        completedSkillIds.push(skillId);
      }
    });

    const allSkills = await this.getAllSkills();
    return allSkills.filter((skill) =>
      completedSkillIds.includes(skill.skillId)
    );
  }

  async getSkillsInProgress(): Promise<
    Array<{
      skill: SkillProgression;
      progress: UserSkillProgress;
    }>
  > {
    const allProgress = await this.getAllUserProgress();
    const result: Array<{
      skill: SkillProgression;
      progress: UserSkillProgress;
    }> = [];

    for (const [skillId, progress] of allProgress) {
      if (!progress.isCompleted && progress.currentLevel > 0) {
        const skill = await this.getSkillById(skillId);
        if (skill) {
          result.push({ skill, progress });
        }
      }
    }

    return result;
  }

  async getRecentCompletions(): Promise<
    Array<{
      skill: SkillProgression;
      level: number;
      completedAt: Date;
    }>
  > {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const allProgress = await this.getAllUserProgress();
    const completions: Array<{
      skill: SkillProgression;
      level: number;
      completedAt: Date;
    }> = [];

    for (const [skillId, progress] of allProgress) {
      if (progress.lastProgressAt >= sevenDaysAgo) {
        const skill = await this.getSkillById(skillId);
        if (skill) {
          // Get last completed level
          const lastLevel =
            progress.completedLevels[progress.completedLevels.length - 1];
          if (lastLevel) {
            completions.push({
              skill,
              level: lastLevel,
              completedAt: progress.lastProgressAt,
            });
          }
        }
      }
    }

    return completions.sort(
      (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
    );
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async getStats(): Promise<{
    totalSkills: number;
    skillsStarted: number;
    skillsInProgress: number;
    skillsMastered: number;
    totalLevelsCompleted: number;
    totalPossibleLevels: number;
    completionPercentage: number;
    xpFromSkills: number;
    byCategory: Map<
      SkillCategory,
      {
        total: number;
        started: number;
        mastered: number;
        levelsCompleted: number;
      }
    >;
  }> {
    const allSkills = await this.getAllSkills();
    const allProgress = await this.getAllUserProgress();

    let skillsStarted = 0;
    let skillsInProgress = 0;
    let skillsMastered = 0;
    let totalLevelsCompleted = 0;
    let totalPossibleLevels = 0;
    let xpFromSkills = 0;

    const byCategory = new Map<
      SkillCategory,
      {
        total: number;
        started: number;
        mastered: number;
        levelsCompleted: number;
      }
    >();

    // Initialize category stats
    const categories: SkillCategory[] = [
      "letter_mastery",
      "concept_mastery",
      "practice_goals",
    ];
    for (const cat of categories) {
      byCategory.set(cat, {
        total: 0,
        started: 0,
        mastered: 0,
        levelsCompleted: 0,
      });
    }

    // Calculate stats
    for (const skill of allSkills) {
      totalPossibleLevels += skill.totalLevels;

      const catStats = byCategory.get(skill.skillCategory)!;
      catStats.total++;

      const progress = allProgress.get(skill.skillId);
      if (progress) {
        skillsStarted++;
        catStats.started++;

        if (progress.isCompleted) {
          skillsMastered++;
          catStats.mastered++;
          totalLevelsCompleted += skill.totalLevels;
          catStats.levelsCompleted += skill.totalLevels;

          // Calculate XP from completed skill
          skill.levels.forEach((level) => {
            xpFromSkills += level.xpReward;
          });
        } else {
          skillsInProgress++;
          totalLevelsCompleted += progress.completedLevels.length;
          catStats.levelsCompleted += progress.completedLevels.length;

          // Calculate XP from completed levels
          progress.completedLevels.forEach((levelNum) => {
            const level = skill.levels[levelNum - 1];
            if (level) {
              xpFromSkills += level.xpReward;
            }
          });
        }
      }
    }

    const completionPercentage =
      totalPossibleLevels > 0
        ? Math.round((totalLevelsCompleted / totalPossibleLevels) * 100)
        : 0;

    return {
      totalSkills: allSkills.length,
      skillsStarted,
      skillsInProgress,
      skillsMastered,
      totalLevelsCompleted,
      totalPossibleLevels,
      completionPercentage,
      xpFromSkills,
      byCategory,
    };
  }

  async getCategoryStats(category: SkillCategory): Promise<{
    total: number;
    started: number;
    mastered: number;
    levelsCompleted: number;
    totalPossibleLevels: number;
    completionPercentage: number;
  }> {
    const stats = await this.getStats();
    const catStats = stats.byCategory.get(category);

    if (!catStats) {
      return {
        total: 0,
        started: 0,
        mastered: 0,
        levelsCompleted: 0,
        totalPossibleLevels: 0,
        completionPercentage: 0,
      };
    }

    const categorySkills = await this.getSkillsByCategory(category);
    const totalPossibleLevels = categorySkills.reduce(
      (sum, s) => sum + s.totalLevels,
      0
    );
    const completionPercentage =
      totalPossibleLevels > 0
        ? Math.round((catStats.levelsCompleted / totalPossibleLevels) * 100)
        : 0;

    return {
      ...catStats,
      totalPossibleLevels,
      completionPercentage,
    };
  }

  // ============================================================================
  // RECOMMENDATIONS
  // ============================================================================

  async getRecommendedSkills(limit: number = 5): Promise<
    Array<{
      skill: SkillProgression;
      reason: "continue" | "new" | "almost_complete" | "trending";
      progress?: UserSkillProgress;
    }>
  > {
    const recommendations: Array<{
      skill: SkillProgression;
      reason: "continue" | "new" | "almost_complete" | "trending";
      progress?: UserSkillProgress;
      priority: number;
    }> = [];

    const allProgress = await this.getAllUserProgress();
    const availableSkills = await this.getAvailableSkills();

    // Priority 1: Almost complete skills
    for (const skill of availableSkills) {
      const progress = allProgress.get(skill.skillId);
      if (progress && !progress.isCompleted) {
        const currentLevel = skill.levels[progress.currentLevel - 1];
        if (currentLevel) {
          const completionRatio =
            progress.levelProgress / currentLevel.requirement.target;
          if (completionRatio >= 0.75) {
            recommendations.push({
              skill,
              reason: "almost_complete",
              progress,
              priority: 1,
            });
          } else {
            recommendations.push({
              skill,
              reason: "continue",
              progress,
              priority: 2,
            });
          }
        }
      }
    }

    // Priority 3: New skills to start
    const newSkills = availableSkills.filter(
      (s) => !allProgress.has(s.skillId)
    );
    for (const skill of newSkills.slice(0, 3)) {
      recommendations.push({
        skill,
        reason: "new",
        priority: 3,
      });
    }

    // Sort by priority and limit
    recommendations.sort((a, b) => a.priority - b.priority);

    return recommendations.slice(0, limit).map(({ skill, reason, progress }) => ({
      skill,
      reason,
      progress,
    }));
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async _getCompletedSkillIds(): Promise<string[]> {
    const allProgress = await this.getAllUserProgress();
    const completed: string[] = [];

    allProgress.forEach((progress, skillId) => {
      if (progress.isCompleted) {
        completed.push(skillId);
      }
    });

    return completed;
  }

  private async _getUserLevel(): Promise<number> {
    if (!this._achievementService) return 1;

    try {
      const xp = await this._achievementService.getUserXP();
      return xp.currentLevel;
    } catch {
      return 1;
    }
  }

  private async _findRelevantSkills(
    actionType: SkillProgressActionType,
    metadata: SkillProgressMetadata
  ): Promise<Array<{ skill: SkillProgression; progressDelta: number }>> {
    const results: Array<{ skill: SkillProgression; progressDelta: number }> =
      [];
    const availableSkills = await this.getAvailableSkills();

    for (const skill of availableSkills) {
      const progress = await this.getUserProgress(skill.skillId);
      if (progress?.isCompleted) continue;

      const currentLevelIndex = (progress?.currentLevel || 1) - 1;
      const currentLevel = skill.levels[currentLevelIndex];
      if (!currentLevel) continue;

      let matches = false;
      let delta = 1;

      switch (actionType) {
        case "sequence_with_letter":
          if (
            currentLevel.requirement.type === "sequence_with_letter" ||
            currentLevel.requirement.type === "unique_sequences_with_letter"
          ) {
            const reqLetter = currentLevel.requirement.metadata?.letter;
            if (
              reqLetter &&
              metadata.letter?.toUpperCase() === reqLetter.toUpperCase()
            ) {
              matches = true;
            }
          }
          break;

        case "sequence_created":
          if (currentLevel.requirement.type === "sequences_created_total") {
            matches = true;
          }
          break;

        case "drill_completed":
          if (currentLevel.requirement.type === "concept_drills_completed") {
            const reqConceptIds = currentLevel.requirement.metadata?.conceptIds as string[] | undefined;
            if (
              reqConceptIds &&
              metadata.conceptId &&
              reqConceptIds.includes(metadata.conceptId)
            ) {
              matches = true;
            }
          }
          break;

        case "quiz_completed":
          if (currentLevel.requirement.type === "concept_quiz_score") {
            const reqConceptIds = currentLevel.requirement.metadata?.conceptIds as string[] | undefined;
            const minScore = currentLevel.requirement.metadata?.minScore || 0;
            if (
              reqConceptIds &&
              metadata.conceptId &&
              reqConceptIds.includes(metadata.conceptId) &&
              metadata.quizScore &&
              metadata.quizScore >= minScore
            ) {
              matches = true;
            }
          }
          break;

        case "daily_practice":
          if (currentLevel.requirement.type === "consecutive_days") {
            matches = true;
          } else if (currentLevel.requirement.type === "total_practice_time") {
            matches = true;
            delta = metadata.practiceMinutes || 1;
          }
          break;

        case "challenge_completed":
          if (currentLevel.requirement.type === "challenges_completed") {
            matches = true;
          }
          break;

        case "exploration_complete":
          if (
            currentLevel.requirement.type === "unique_sequences_with_letter" &&
            currentLevel.requirement.metadata?.trackUnique
          ) {
            matches = true;
          }
          break;
      }

      if (matches) {
        results.push({ skill, progressDelta: delta });
      }
    }

    return results;
  }
}
