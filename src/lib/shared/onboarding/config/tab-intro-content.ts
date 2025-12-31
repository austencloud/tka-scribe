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
    description:
      "Build sequences beat by beat with full creative control. Choose your start position, then browse and select from all available moves to craft exactly the choreography you envision.",
  },

  generator: {
    icon: "fa-wand-magic-sparkles",
    color: "#8b5cf6",
    title: "Generator",
    description:
      "Let the system surprise you with randomly generated sequences based on your preferences. Set your parameters and discover new movement combinations you might never have imagined.",
  },

  assembler: {
    icon: "fa-route",
    color: "#06b6d4",
    title: "Assembler",
    description:
      "Draw hand paths directly on the grid to create sequences from gesture. Trace the movement you want and watch your choreography come to life.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Learn Module Tabs
// ─────────────────────────────────────────────────────────────────────────────

export const LEARN_TAB_INTROS: Record<string, TabIntroContent> = {
  concepts: {
    icon: "fa-lightbulb",
    color: "#f59e0b",
    title: "Learning Path",
    description:
      "Master the Kinetic Alphabet step by step. Work through interactive lessons that build your understanding from foundational concepts to advanced techniques.",
  },

  codex: {
    icon: "fa-book",
    color: "#10b981",
    title: "Codex",
    description:
      "Your complete reference guide to every letter and pictograph in the Kinetic Alphabet. Browse, study, and deepen your understanding of the movement notation system.",
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
    description:
      "Explore thousands of community-created sequences. Filter by difficulty, style, or props to find inspiration for your next performance.",
  },

  creators: {
    icon: "fa-users",
    color: "#ec4899",
    title: "Creators",
    description:
      "Connect with the flow arts community. Discover talented creators, follow their work, and find collaborators for your next project.",
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
    description:
      "Your personal collection of created and saved sequences. Organize, edit, and manage all your choreography in one place.",
  },

  favorites: {
    icon: "fa-heart",
    color: "#ef4444",
    title: "Favorites",
    description:
      "Quick access to sequences you've marked as favorites. Keep your go-to choreography close at hand for practice and performance.",
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
    description:
      "Watch your sequences come alive with animated playback. Adjust speed, loop sections, and study the movement flow in real time.",
  },

  timeline: {
    icon: "fa-film",
    color: "#f97316",
    title: "Timeline",
    description:
      "Arrange and sequence your choreography on a visual timeline. Sync movements to music, adjust timing, and create polished performances.",
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
