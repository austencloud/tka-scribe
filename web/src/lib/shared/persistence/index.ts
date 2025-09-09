/**
 * Persistence Module Barrel Export
 * 
 * This file exports everything you need from the persistence module.
 * Import from here to get access to the database and services.
 */

// Database
export { TKADatabase, db, initializeDatabase, clearAllData, getDatabaseInfo } from './database/TKADatabase';
export type { UserWorkData, UserProject } from './database/TKADatabase';

// Service contracts
export type { IPersistenceService } from './services/contracts/IPersistenceService';

// Service implementations
export { DexiePersistenceService } from './services/implementations/DexiePersistenceService';
