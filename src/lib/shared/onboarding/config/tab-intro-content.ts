/**
 * Tab Intro Content - Definitions for all tab introductions
 *
 * Each tab's intro content is defined here. Descriptions should be
 * written by the product owner to capture the right voice/messaging.
 */

export interface TabIntroContent {
  icon: string;
  color: string;
  title: string;
  description: string; // Write your own!
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Module Tabs
// ─────────────────────────────────────────────────────────────────────────────

export const CREATE_TAB_INTROS: Record<string, TabIntroContent> = {
  constructor: {
    icon: "fa-cubes",
    color: "#3b82f6",
    title: "Constructor",
    description: "TODO: Write description", // <-- Fill this in
  },

  generator: {
    icon: "fa-wand-magic-sparkles",
    color: "#8b5cf6",
    title: "Generator",
    description: "TODO: Write description", // <-- Fill this in
  },

  assembler: {
    icon: "fa-route",
    color: "#06b6d4",
    title: "Assembler",
    description: "TODO: Write description", // <-- Fill this in
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Learn Module Tabs
// ─────────────────────────────────────────────────────────────────────────────

export const LEARN_TAB_INTROS: Record<string, TabIntroContent> = {
  concepts: {
    icon: "fa-lightbulb",
    color: "#f59e0b",
    title: "Concepts",
    description: "TODO: Write description",
  },

  codex: {
    icon: "fa-book",
    color: "#10b981",
    title: "Codex",
    description: "TODO: Write description",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Discover Module Tabs
// ─────────────────────────────────────────────────────────────────────────────

export const DISCOVER_TAB_INTROS: Record<string, TabIntroContent> = {
  sequences: {
    icon: "fa-compass",
    color: "#a855f7",
    title: "Browse",
    description: "TODO: Write description",
  },

  creators: {
    icon: "fa-users",
    color: "#ec4899",
    title: "Creators",
    description: "TODO: Write description",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Library Module Tabs
// ─────────────────────────────────────────────────────────────────────────────

export const LIBRARY_TAB_INTROS: Record<string, TabIntroContent> = {
  sequences: {
    icon: "fa-folder",
    color: "#6366f1",
    title: "Your Sequences",
    description: "TODO: Write description",
  },

  favorites: {
    icon: "fa-heart",
    color: "#ef4444",
    title: "Favorites",
    description: "TODO: Write description",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Compose Module Tabs
// ─────────────────────────────────────────────────────────────────────────────

export const COMPOSE_TAB_INTROS: Record<string, TabIntroContent> = {
  playback: {
    icon: "fa-play",
    color: "#22c55e",
    title: "Playback",
    description: "TODO: Write description",
  },

  timeline: {
    icon: "fa-film",
    color: "#f97316",
    title: "Timeline",
    description: "TODO: Write description",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper to get intro content
// ─────────────────────────────────────────────────────────────────────────────

const ALL_INTROS: Record<string, Record<string, TabIntroContent>> = {
  create: CREATE_TAB_INTROS,
  learn: LEARN_TAB_INTROS,
  discover: DISCOVER_TAB_INTROS,
  library: LIBRARY_TAB_INTROS,
  compose: COMPOSE_TAB_INTROS,
};

/**
 * Get intro content for a specific tab
 */
export function getTabIntroContent(
  moduleId: string,
  tabId: string
): TabIntroContent | undefined {
  return ALL_INTROS[moduleId]?.[tabId];
}

/**
 * Check if a tab has intro content defined
 */
export function hasTabIntroContent(moduleId: string, tabId: string): boolean {
  return !!getTabIntroContent(moduleId, tabId);
}
