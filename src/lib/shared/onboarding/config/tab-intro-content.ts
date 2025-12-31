/**
 * Tab Intro Content - Definitions for all tab introductions
 *
 * Each tab's intro content is defined here. Most tabs need just one page,
 * but some benefit from a second page to show additional features.
 *
 * Page content can be:
 * - A simple string for basic descriptions
 * - An object with heading + bullet points for structured content
 */

export interface TabIntroPage {
  /** Optional heading for this page (uses main title if omitted) */
  heading?: string;
  /** Main content - string or structured with bullets */
  content: string | { text?: string; points: string[] };
  /** Optional tip shown at bottom of page */
  tip?: string;
}

export interface TabIntroContent {
  icon: string;
  color: string;
  title: string;
  /** Single page or array of pages (max 2-3 recommended) */
  pages: TabIntroPage[];
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
      "Build sequences one beat at a time. Pick a start position, then choose from available options to add each move.",
  },

  generator: {
    icon: "fa-wand-magic-sparkles",
    color: "#8b5cf6",
    title: "Generator",
    description:
      "Generate random sequences based on filters you set. Good for exploring new combinations or getting unstuck.",
  },

  assembler: {
    icon: "fa-route",
    color: "#06b6d4",
    title: "Assembler",
    description:
      "Draw hand paths on the grid to create sequences. Trace the movement and the system figures out the beats.",
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
      "Interactive lessons that teach the Kinetic Alphabet from basics to advanced concepts. Go at your own pace.",
  },

  codex: {
    icon: "fa-book",
    color: "#10b981",
    title: "Codex",
    description:
      "Reference for all letters and pictographs. Look up any symbol to see how it works.",
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
      "Browse sequences created by the community. Filter by length, difficulty, or prop type to find what you're looking for.",
  },

  creators: {
    icon: "fa-users",
    color: "#ec4899",
    title: "Creators",
    description:
      "See who's creating sequences. Follow people and check out their work.",
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
      "Sequences you've created or saved. Organize them into collections if you want.",
  },

  favorites: {
    icon: "fa-heart",
    color: "#ef4444",
    title: "Favorites",
    description:
      "Sequences you've favorited for quick access.",
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
      "Play back sequences as animations. Adjust speed, loop, or step through beat by beat.",
  },

  timeline: {
    icon: "fa-film",
    color: "#f97316",
    title: "Timeline",
    description:
      "Arrange sequences on a timeline and sync them to music. Export videos when you're done.",
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
