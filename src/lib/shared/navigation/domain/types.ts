/**
 * Navigation Domain Types
 *
 * Core types for the navigation system.
 */

// Re-export TabId from foundation UI types for convenience
export type { TabId } from "../../foundation/ui/UITypes";

/**
 * Tab within a module
 * Represents a navigation tab within a specific module (e.g., "Construct" tab in Create module)
 */
export interface Section {
  id: string;
  label: string;
  icon: string;
  description?: string;
  color?: string;
  gradient?: string; // Optional gradient for colorful icons
  disabled?: boolean; // For conditional tab accessibility
}

// Module-based navigation types
export type ModuleId =
  | "create"
  | "discover"
  | "community"
  | "learn"
  | "collect"
  | "animate"
  | "edit"
  | "library"
  | "write"
  | "word_card"
  | "account"
  | "admin";

/**
 * Module Definition
 * Represents a top-level module with its sections
 */
export interface ModuleDefinition {
  id: ModuleId;
  label: string;
  icon: string;
  description?: string;
  isMain: boolean;
  sections: Section[]; // Sections within this module
  disabled?: boolean; // For conditional module accessibility (e.g., coming soon for non-admin)
  disabledMessage?: string; // Message to show when module is disabled
}

export interface ModuleSelectorState {
  isOpen: boolean;
  showDiscoveryHint: boolean;
}
