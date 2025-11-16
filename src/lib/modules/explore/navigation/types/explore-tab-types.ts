/**
 * Explore Tab Types
 * Type definitions for the explore module tab navigation
 */

export type ExploreModuleType = "sequences" | "users" | "collections" | "search";

export interface ExploreModule {
  id: ExploreModuleType;
  label: string;
  icon: string;
  disabled?: boolean;
}
