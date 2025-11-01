/**
 * Database Constants
 *
 * Centralized configuration for the TKA database including
 * database name, table names, indexes, and version information.
 */

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

/**
 * Main database name in IndexedDB
 */
export const DATABASE_NAME = "TKADatabase";

/**
 * Current database schema version
 * Version 2: Added gamification tables (achievements, XP, challenges, streaks, notifications)
 */
export const DATABASE_VERSION = 2;

// ============================================================================
// TABLE NAMES
// ============================================================================

export const TABLE_NAMES = {
  SEQUENCES: "sequences",
  PICTOGRAPHS: "pictographs",
  USER_WORK: "userWork",
  USER_PROJECTS: "userProjects",
  SETTINGS: "settings",
  // Gamification tables (v2)
  USER_ACHIEVEMENTS: "userAchievements",
  USER_XP: "userXP",
  XP_EVENTS: "xpEvents",
  DAILY_CHALLENGES: "dailyChallenges",
  USER_CHALLENGE_PROGRESS: "userChallengeProgress",
  USER_STREAKS: "userStreaks",
  ACHIEVEMENT_NOTIFICATIONS: "achievementNotifications",
} as const;

// ============================================================================
// INDEX CONFIGURATIONS
// ============================================================================

/**
 * Index definitions for each table
 * Format: '++primaryKey, index1, index2, *multiValueIndex'
 */
export const TABLE_INDEXES = {
  [TABLE_NAMES.SEQUENCES]:
    "++id, name, word, author, dateAdded, level, isFavorite, difficultyLevel, *tags",
  [TABLE_NAMES.PICTOGRAPHS]: "++id, letter, startPosition, endPosition",
  [TABLE_NAMES.USER_WORK]:
    "++id, type, tabId, [type+tabId], userId, lastModified",
  [TABLE_NAMES.USER_PROJECTS]:
    "++id, name, userId, createdAt, lastModified, isPublic, *tags",
  [TABLE_NAMES.SETTINGS]: "++id, userId",
  // Gamification tables (v2)
  [TABLE_NAMES.USER_ACHIEVEMENTS]:
    "++id, achievementId, userId, isCompleted, unlockedAt",
  [TABLE_NAMES.USER_XP]: "++id, userId, totalXP, currentLevel, lastUpdated",
  [TABLE_NAMES.XP_EVENTS]: "++id, action, timestamp, userId",
  [TABLE_NAMES.DAILY_CHALLENGES]: "++id, date, difficulty, expiresAt",
  [TABLE_NAMES.USER_CHALLENGE_PROGRESS]:
    "++id, challengeId, userId, isCompleted, completedAt",
  [TABLE_NAMES.USER_STREAKS]: "++id, userId, currentStreak, longestStreak",
  [TABLE_NAMES.ACHIEVEMENT_NOTIFICATIONS]: "++id, type, timestamp, isRead",
} as const;

// ============================================================================
// DATA VERSIONING
// ============================================================================

/**
 * Default version for new user work data
 */
export const DEFAULT_USER_WORK_VERSION = 1;

/**
 * Default version for new user projects
 */
export const DEFAULT_USER_PROJECT_VERSION = 1;

// ============================================================================
// PERFORMANCE SETTINGS
// ============================================================================

/**
 * Maximum number of items to return in a single query
 */
export const MAX_QUERY_LIMIT = 1000;

/**
 * Default page size for paginated queries
 */
export const DEFAULT_PAGE_SIZE = 50;
