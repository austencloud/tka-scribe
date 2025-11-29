/**
 * Explore Tab Types
 * Type definitions for the discover module tab navigation
 */

export type DiscoverModuleType =
  | "gallery"
  | "community"
  | "collections"
  | "search";

export interface DiscoverTabConfig {
  id: DiscoverModuleType;
  label: string;
  icon: string;
  disabled?: boolean;
}
