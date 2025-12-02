/**
 * Explore Tab Types
 * Type definitions for the discover module tab navigation
 */

export type DiscoverModuleType =
  | "gallery"
  | "creators"
  | "collections"
  | "search"
  | "library";

export interface DiscoverTabConfig {
  id: DiscoverModuleType;
  label: string;
  icon: string;
  disabled?: boolean;
}
