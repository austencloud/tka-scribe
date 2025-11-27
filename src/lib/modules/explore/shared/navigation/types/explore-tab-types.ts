/**
 * Explore Tab Types
 * Type definitions for the explore module tab navigation
 */

export type ExploreModuleType =
  | "gallery"
  | "library"
  | "community"
  | "collections"
  | "search";

export interface ExploreTabConfig {
  id: ExploreModuleType;
  label: string;
  icon: string;
  disabled?: boolean;
}
