/**
 * Explore Tab Types
 * Type definitions for the discover module tab navigation
 */

// Note: "library" removed - now integrated into Gallery via scope toggle
export type DiscoverModuleType = "gallery" | "creators" | "collections";

export interface DiscoverTabConfig {
  id: DiscoverModuleType;
  label: string;
  icon: string;
  disabled?: boolean;
}
