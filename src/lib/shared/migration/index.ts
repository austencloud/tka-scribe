/**
 * Domain Migration Module
 *
 * Handles the transition from tkaflowarts.com to tkascribe.com
 *
 * Usage:
 * 1. Import and add <MigrationChecker /> to MainApplication.svelte
 * 2. Set ENABLED: true in config/migration-config.ts when ready
 * 3. Set MIGRATION_DEADLINE to the actual deadline date
 */

export { MIGRATION_CONFIG } from "./config/migration-config";
export {
  isOnOldDomain,
  getNewDomainUrl,
  getDaysUntilDeadline,
  formatDeadline,
  getMigrationSeverity,
} from "./config/migration-config";

export { migrationState } from "./state/migration-state.svelte";

// Components are imported directly where needed
// to avoid SSR issues with Svelte components
