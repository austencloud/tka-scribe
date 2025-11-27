/**
 * Feature Flag Types and Configuration
 *
 * Defines the available feature flags and their access control.
 * Features can be gated by:
 * - Role (minimum role required)
 * - Explicit user override (per-user enable/disable)
 * - Global enable/disable
 */

import type { UserRole } from "./UserRole";
import type { ModuleId } from "$shared";

/**
 * Feature identifiers for modules
 */
export type ModuleFeatureId =
  | "module:create"
  | "module:community"
  | "module:explore"
  | "module:learn"
  | "module:collect"
  | "module:animate"
  | "module:edit"
  | "module:about"
  | "module:admin";

/**
 * Feature identifiers for tabs within modules
 */
export type TabFeatureId =
  // Create module tabs
  | "tab:create:assembler"
  | "tab:create:constructor"
  | "tab:create:generator"
  // Explore module tabs
  | "tab:explore:gallery"
  | "tab:explore:community"
  | "tab:explore:collections"
  | "tab:explore:search"
  // Community module tabs
  | "tab:community:explore"
  | "tab:community:gallery"
  | "tab:community:creators"
  | "tab:community:challenges"
  // Learn module tabs
  | "tab:learn:concepts"
  | "tab:learn:drills"
  // Animate module tabs
  | "tab:animate:single"
  | "tab:animate:tunnel"
  | "tab:animate:mirror"
  | "tab:animate:grid"
  // Edit module tabs
  | "tab:edit:sequence"
  | "tab:edit:beat"
  // Collect module tabs
  | "tab:collect:gallery"
  | "tab:collect:achievements"
  | "tab:collect:challenges"
  // About module tabs
  | "tab:about:overview"
  | "tab:about:support"
  // Admin module tabs
  | "tab:admin:challenges"
  | "tab:admin:analytics"
  | "tab:admin:users"
  | "tab:admin:flags";

/**
 * Feature identifiers for specific capabilities
 */
export type CapabilityFeatureId =
  | "capability:export:video"
  | "capability:export:gif"
  | "capability:export:png"
  | "capability:share:social"
  | "capability:advanced:filters"
  | "capability:sequence:import";

/**
 * All feature flag identifiers
 */
export type FeatureId = ModuleFeatureId | TabFeatureId | CapabilityFeatureId;

/**
 * Feature flag configuration
 */
export interface FeatureFlagConfig {
  /** Unique feature identifier */
  id: FeatureId;
  /** Human-readable name */
  name: string;
  /** Description for admin UI */
  description: string;
  /** Minimum role required to access this feature */
  minimumRole: UserRole;
  /** Whether the feature is globally enabled */
  enabled: boolean;
  /** Category for grouping in admin UI */
  category: "module" | "tab" | "capability";
}

/**
 * User-specific feature overrides stored in Firestore
 */
export interface UserFeatureOverrides {
  /** Features explicitly enabled for this user (bypasses role check) */
  enabledFeatures: FeatureId[];
  /** Features explicitly disabled for this user (overrides role) */
  disabledFeatures: FeatureId[];
}

/**
 * Default feature flag configuration
 * This defines the baseline access for each feature
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig[] = [
  // ===== MODULES =====
  {
    id: "module:create",
    name: "Create Module",
    description: "Access to sequence creation tools",
    minimumRole: "user",
    enabled: true,
    category: "module",
  },
  {
    id: "module:community",
    name: "Community Module",
    description: "Access to community features",
    minimumRole: "user",
    enabled: true,
    category: "module",
  },
  {
    id: "module:explore",
    name: "Explore Module",
    description: "Browse and discover sequences",
    minimumRole: "tester", // Only testers can access for now
    enabled: true,
    category: "module",
  },
  {
    id: "module:learn",
    name: "Learn Module",
    description: "Educational content and tutorials",
    minimumRole: "tester",
    enabled: true,
    category: "module",
  },
  {
    id: "module:collect",
    name: "Collect Module",
    description: "Save and organize favorite sequences",
    minimumRole: "tester",
    enabled: true,
    category: "module",
  },
  {
    id: "module:animate",
    name: "Animate Module",
    description: "Animation playback and export",
    minimumRole: "tester",
    enabled: true,
    category: "module",
  },
  {
    id: "module:edit",
    name: "Edit Module",
    description: "Advanced sequence editing tools",
    minimumRole: "tester",
    enabled: true,
    category: "module",
  },
  {
    id: "module:about",
    name: "About Module",
    description: "Information about the application",
    minimumRole: "user",
    enabled: true,
    category: "module",
  },
  {
    id: "module:admin",
    name: "Admin Module",
    description: "Administrative tools and settings",
    minimumRole: "admin",
    enabled: true,
    category: "module",
  },

  // ===== CREATE MODULE TABS =====
  {
    id: "tab:create:assembler",
    name: "Assembler Tab",
    description: "Simplified 6-choice sequence builder",
    minimumRole: "admin", // Admin-only advanced feature
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:create:constructor",
    name: "Constructor Tab",
    description: "Step-by-step sequence construction",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:create:generator",
    name: "Generator Tab",
    description: "Automatic sequence generation",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },

  // ===== EXPLORE MODULE TABS =====
  {
    id: "tab:explore:gallery",
    name: "Gallery Tab",
    description: "Browse all sequences in the gallery",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:explore:community",
    name: "Community Tab",
    description: "Explore community-shared sequences",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:explore:collections",
    name: "Collections Tab",
    description: "Browse curated sequence collections",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:explore:search",
    name: "Search Tab",
    description: "Search for specific sequences",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },

  // ===== COMMUNITY MODULE TABS =====
  {
    id: "tab:community:explore",
    name: "Explore Tab",
    description: "Browse community content",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:community:gallery",
    name: "Gallery Tab",
    description: "User's personal gallery",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:community:creators",
    name: "Creators Tab",
    description: "View other creators",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:community:challenges",
    name: "Challenges Tab",
    description: "Daily and weekly challenges",
    minimumRole: "tester", // Coming soon - tester preview
    enabled: true,
    category: "tab",
  },

  // ===== LEARN MODULE TABS =====
  {
    id: "tab:learn:concepts",
    name: "Concepts Tab",
    description: "Progressive concept mastery path",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:learn:drills",
    name: "Drills Tab",
    description: "Quick pictograph flash card quizzes",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },

  // ===== ANIMATE MODULE TABS =====
  {
    id: "tab:animate:single",
    name: "Single Mode Tab",
    description: "Single sequence animation playback",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:animate:tunnel",
    name: "Tunnel Mode Tab",
    description: "Tunnel animation visualization",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:animate:mirror",
    name: "Mirror Mode Tab",
    description: "Mirrored animation display",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:animate:grid",
    name: "Grid Mode Tab",
    description: "Grid-based animation layout",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },

  // ===== EDIT MODULE TABS =====
  {
    id: "tab:edit:sequence",
    name: "Sequence Editor Tab",
    description: "Edit entire sequence properties and structure",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:edit:beat",
    name: "Beat Editor Tab",
    description: "Edit individual beat properties",
    minimumRole: "tester",
    enabled: true,
    category: "tab",
  },

  // ===== COLLECT MODULE TABS =====
  {
    id: "tab:collect:gallery",
    name: "Gallery Tab",
    description: "User's saved sequences gallery",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:collect:achievements",
    name: "Achievements Tab",
    description: "View earned achievements and badges",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:collect:challenges",
    name: "Challenges Tab",
    description: "View and participate in challenges",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },

  // ===== ABOUT MODULE TABS =====
  {
    id: "tab:about:overview",
    name: "Overview Tab",
    description: "Application overview and information",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:about:support",
    name: "Support Tab",
    description: "Support information and contact options",
    minimumRole: "user",
    enabled: true,
    category: "tab",
  },

  // ===== ADMIN MODULE TABS =====
  {
    id: "tab:admin:challenges",
    name: "Admin Challenges Tab",
    description: "Manage daily and weekly challenges",
    minimumRole: "admin",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:admin:analytics",
    name: "Admin Analytics Tab",
    description: "View system analytics and metrics",
    minimumRole: "admin",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:admin:users",
    name: "Admin Users Tab",
    description: "Manage user accounts and roles",
    minimumRole: "admin",
    enabled: true,
    category: "tab",
  },
  {
    id: "tab:admin:flags",
    name: "Admin Flags Tab",
    description: "Manage feature flags and access control",
    minimumRole: "admin",
    enabled: true,
    category: "tab",
  },

  // ===== CAPABILITIES =====
  {
    id: "capability:export:video",
    name: "Video Export",
    description: "Export sequences as MP4 video",
    minimumRole: "tester",
    enabled: true,
    category: "capability",
  },
  {
    id: "capability:export:gif",
    name: "GIF Export",
    description: "Export sequences as animated GIF",
    minimumRole: "tester",
    enabled: true,
    category: "capability",
  },
  {
    id: "capability:export:png",
    name: "PNG Export",
    description: "Export sequences as PNG images",
    minimumRole: "user",
    enabled: true,
    category: "capability",
  },
  {
    id: "capability:share:social",
    name: "Social Sharing",
    description: "Share to social media platforms",
    minimumRole: "user",
    enabled: true,
    category: "capability",
  },
  {
    id: "capability:advanced:filters",
    name: "Advanced Filters",
    description: "Advanced sequence filtering options",
    minimumRole: "premium",
    enabled: true,
    category: "capability",
  },
  {
    id: "capability:sequence:import",
    name: "Sequence Import",
    description: "Import sequences from file",
    minimumRole: "tester",
    enabled: true,
    category: "capability",
  },
];

/**
 * Helper to convert module ID to feature ID
 */
export function moduleIdToFeatureId(moduleId: ModuleId): ModuleFeatureId {
  return `module:${moduleId}` as ModuleFeatureId;
}

/**
 * Helper to convert tab ID to feature ID
 */
export function tabIdToFeatureId(
  moduleId: ModuleId,
  tabId: string
): TabFeatureId {
  return `tab:${moduleId}:${tabId}` as TabFeatureId;
}

/**
 * Get feature config by ID from defaults
 */
export function getDefaultFeatureConfig(
  featureId: FeatureId
): FeatureFlagConfig | undefined {
  return DEFAULT_FEATURE_FLAGS.find((f) => f.id === featureId);
}
