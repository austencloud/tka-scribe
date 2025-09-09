/**
 * TKA Database - Dexie Configuration
 * 
 * This is your main database configuration using Dexie.js
 * Think of this as your "database schema" - it defines what tables you have
 * and how they're indexed for fast queries.
 */

import type {
  AppSettings,
  PictographData,
  SequenceData
} from '$shared';
import Dexie, { type EntityTable } from 'dexie';

// ============================================================================
// USER DATA INTERFACES
// ============================================================================

/**
 * User's work-in-progress data
 * This stores things like partially built sequences, tab states, etc.
 */
export interface UserWorkData {
  id?: number; // Auto-increment primary key
  type: 'sequence-draft' | 'tab-state' | 'user-preferences' | 'gallery-state';
  tabId?: string; // Which tab this belongs to (build, browse, etc.)
  userId?: string; // For future multi-user support
  data: unknown; // The actual state data (flexible)
  lastModified: Date;
  version: number; // For handling data migrations
}

/**
 * User projects - collections of sequences
 */
export interface UserProject {
  id?: number;
  name: string;
  description?: string;
  sequenceIds: string[]; // References to sequences in this project
  userId?: string;
  createdAt: Date;
  lastModified: Date;
  isPublic: boolean;
  tags: string[];
}

// ============================================================================
// DATABASE CLASS
// ============================================================================

/**
 * TKA Database Class
 * 
 * This extends Dexie and defines your database structure.
 * Each property represents a "table" in your database.
 */
export class TKADatabase extends Dexie {
  // Define your tables with TypeScript types
  sequences!: EntityTable<SequenceData, 'id'>;
  pictographs!: EntityTable<PictographData, 'id'>;
  userWork!: EntityTable<UserWorkData, 'id'>;
  userProjects!: EntityTable<UserProject, 'id'>;
  settings!: EntityTable<AppSettings & { id: string }, 'id'>;

  constructor() {
    super('TKADatabase'); // Database name in browser
    
    // Version 1 schema - this is like a database migration
    this.version(1).stores({
      // Sequences table with indexes for fast searching
      sequences: '++id, name, word, author, dateAdded, level, isFavorite, difficultyLevel, *tags',
      
      // Pictographs table with position-based indexes
      pictographs: '++id, letter, startPosition, endPosition',
      
      // User work data with type-based indexing
      userWork: '++id, type, tabId, userId, lastModified',
      
      // User projects
      userProjects: '++id, name, userId, createdAt, lastModified, isPublic, *tags',
      
      // Settings (usually just one record per user)
      settings: '++id, userId'
    });

    // Optional: Add hooks for automatic timestamps
    this.userWork.hook('creating', function (primKey, obj, trans) {
      obj.lastModified = new Date();
      obj.version = obj.version || 1;
    });

    this.userWork.hook('updating', function (modifications, primKey, obj, trans) {
      (modifications as any).lastModified = new Date();
    });
  }
}

// ============================================================================
// DATABASE INSTANCE
// ============================================================================

/**
 * Single database instance for your entire app
 * Import this wherever you need database access
 */
export const db = new TKADatabase();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Initialize database - call this when your app starts
 */
export async function initializeDatabase(): Promise<void> {
  try {
    await db.open();
    console.log('✅ TKA Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Clear all data (useful for development/testing)
 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.sequences, db.pictographs, db.userWork, db.userProjects, db.settings], async () => {
    await db.sequences.clear();
    await db.pictographs.clear();
    await db.userWork.clear();
    await db.userProjects.clear();
    await db.settings.clear();
  });
  console.log('🗑️ All database data cleared');
}

/**
 * Get database info for debugging
 */
export async function getDatabaseInfo() {
  const info = {
    sequences: await db.sequences.count(),
    pictographs: await db.pictographs.count(),
    userWork: await db.userWork.count(),
    userProjects: await db.userProjects.count(),
    settings: await db.settings.count(),
  };
  console.log('📊 Database info:', info);
  return info;
}
