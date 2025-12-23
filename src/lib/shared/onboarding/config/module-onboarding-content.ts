/**
 * Module Onboarding Content
 *
 * Centralized content definitions for per-module onboarding carousels.
 * Each module has a welcome message and tab explanations.
 */

import type { ModuleOnboardingContent } from "../domain/types";

// ============================================================================
// DISCOVER MODULE
// ============================================================================
export const DISCOVER_ONBOARDING: ModuleOnboardingContent = {
  moduleId: "discover",
  moduleName: "Discover",
  moduleIcon: "fa-compass",
  moduleColor: "#a855f7",
  welcomeTitle: "Welcome to Discover",
  welcomeSubtitle: "Explore the TKA community",
  welcomeDescription:
    "Browse sequences from flow artists worldwide. Find inspiration, save favorites, and see what's possible with TKA notation.",
  tabs: [
    {
      id: "gallery",
      title: "Gallery",
      subtitle: "Browse all sequences",
      description:
        "See what the community has created. Filter by difficulty, prop type, or style. Tap any sequence to preview it.",
      icon: "fa-layer-group",
      color: "#a855f7",
      features: [
        "Thousands of community sequences",
        "Filter by difficulty & prop type",
        "Preview with animation",
        "Save to your library",
      ],
      recommendation: "Best for: Finding inspiration",
    },
    {
      id: "collections",
      title: "Collections",
      subtitle: "Curated playlists",
      description:
        "Themed collections organized by style, difficulty, or creator. Great for discovering related sequences.",
      icon: "fa-folder",
      color: "#c084fc",
      features: [
        "Themed sequence bundles",
        "Staff picks & featured",
        "Browse by category",
        "Save entire collections",
      ],
      recommendation: "Best for: Guided exploration",
    },
    {
      id: "creators",
      title: "Creators",
      subtitle: "Follow flow artists",
      description:
        "Discover talented creators, follow their work, and get notified when they publish new sequences.",
      icon: "fa-users",
      color: "#ec4899",
      features: [
        "Browse creator profiles",
        "Follow your favorites",
        "See their latest work",
        "Connect with the community",
      ],
      recommendation: "Best for: Finding mentors",
    },
  ],
};

// ============================================================================
// LEARN MODULE
// ============================================================================
export const LEARN_ONBOARDING: ModuleOnboardingContent = {
  moduleId: "learn",
  moduleName: "Learn",
  moduleIcon: "fa-graduation-cap",
  moduleColor: "#3b82f6",
  welcomeTitle: "Welcome to Learn",
  welcomeSubtitle: "Master the Kinetic Alphabet",
  welcomeDescription:
    "Interactive lessons and games to help you read and write TKA notation fluently. From basics to advanced concepts.",
  tabs: [
    {
      id: "concepts",
      title: "Concepts",
      subtitle: "Structured learning path",
      description:
        "Step-by-step lessons that build on each other. Start with the grid, progress to complex movements.",
      icon: "fa-lightbulb",
      color: "#60a5fa",
      features: [
        "Progressive difficulty",
        "Interactive examples",
        "Practice exercises",
        "Track your progress",
      ],
      recommendation: "Best for: Beginners",
    },
    {
      id: "play",
      title: "Play",
      subtitle: "Learn through games",
      description:
        "Quiz games, matching challenges, and timed tests. Earn XP while having fun and reinforcing what you've learned.",
      icon: "fa-gamepad",
      color: "#f472b6",
      features: [
        "Multiple game modes",
        "Earn XP rewards",
        "Compete on leaderboards",
        "Track high scores",
      ],
      recommendation: "Best for: Reinforcement",
    },
    {
      id: "codex",
      title: "Codex",
      subtitle: "Reference encyclopedia",
      description:
        "Look up any pictograph, motion type, or position. Your comprehensive TKA dictionary.",
      icon: "fa-book",
      color: "#f59e0b",
      features: [
        "Complete pictograph index",
        "Motion type breakdowns",
        "Position reference",
        "Searchable database",
      ],
      recommendation: "Best for: Quick reference",
    },
  ],
};

// ============================================================================
// COMPOSE MODULE
// ============================================================================
export const COMPOSE_ONBOARDING: ModuleOnboardingContent = {
  moduleId: "compose",
  moduleName: "Compose",
  moduleIcon: "fa-photo-film",
  moduleColor: "#ec4899",
  welcomeTitle: "Welcome to Compose",
  welcomeSubtitle: "Bring sequences to life",
  welcomeDescription:
    "Turn your sequences into smooth animations. Combine multiple sequences, sync to music, and export videos to share.",
  tabs: [
    {
      id: "arrange",
      title: "Arrange",
      subtitle: "Build compositions",
      description:
        "Combine multiple sequences into a complete choreography. Set timing, add music, and arrange your flow.",
      icon: "fa-layer-group",
      color: "#3b82f6",
      features: [
        "Drag-and-drop timeline",
        "Music synchronization",
        "Transition controls",
        "Preview in real-time",
      ],
      recommendation: "Best for: Creating shows",
    },
    {
      id: "browse",
      title: "Browse",
      subtitle: "Your compositions",
      description:
        "View, edit, and export your saved compositions. Share videos with the community or download for offline use.",
      icon: "fa-film",
      color: "#8b5cf6",
      features: [
        "Saved compositions library",
        "Export to video",
        "Share with community",
        "Edit existing work",
      ],
      recommendation: "Best for: Managing work",
    },
  ],
};

// ============================================================================
// TRAIN MODULE
// ============================================================================
export const TRAIN_ONBOARDING: ModuleOnboardingContent = {
  moduleId: "train",
  moduleName: "Train",
  moduleIcon: "fa-running",
  moduleColor: "#ef4444",
  welcomeTitle: "Welcome to Train",
  welcomeSubtitle: "Practice makes perfect",
  welcomeDescription:
    "Use your camera to practice sequences with real-time feedback. Track your progress and earn rewards.",
  tabs: [
    {
      id: "practice",
      title: "Practice",
      subtitle: "Free training",
      description:
        "Pick any sequence and practice at your own pace. Choose adaptive, step-by-step, or timed modes.",
      icon: "fa-dumbbell",
      color: "#3b82f6",
      features: [
        "Multiple practice modes",
        "Real-time pose feedback",
        "Adjustable speed",
        "Loop specific sections",
      ],
      recommendation: "Best for: Daily practice",
    },
    {
      id: "challenges",
      title: "Challenges",
      subtitle: "Structured goals",
      description:
        "Daily and weekly challenges with XP rewards. Push yourself and compete on leaderboards.",
      icon: "fa-trophy",
      color: "#f59e0b",
      features: [
        "Daily challenges",
        "Weekly tournaments",
        "XP & badge rewards",
        "Global leaderboards",
      ],
      recommendation: "Best for: Motivation",
    },
    {
      id: "progress",
      title: "Progress",
      subtitle: "Track improvement",
      description:
        "See your stats, streaks, and skill progression over time. Celebrate milestones and set goals.",
      icon: "fa-chart-line",
      color: "#10b981",
      features: [
        "Skill analytics",
        "Streak tracking",
        "Achievement badges",
        "Goal setting",
      ],
      recommendation: "Best for: Long-term growth",
    },
  ],
};

// ============================================================================
// LIBRARY MODULE
// ============================================================================
export const LIBRARY_ONBOARDING: ModuleOnboardingContent = {
  moduleId: "library",
  moduleName: "Library",
  moduleIcon: "fa-book",
  moduleColor: "#0891b2",
  welcomeTitle: "Welcome to Library",
  welcomeSubtitle: "Your personal collection",
  welcomeDescription:
    "All your saved sequences, collections, and compositions in one place. Organize, edit, and share your work.",
  tabs: [
    {
      id: "sequences",
      title: "Sequences",
      subtitle: "Your creations",
      description:
        "Sequences you've created or saved from the community. Edit, organize, or share them.",
      icon: "fa-layer-group",
      color: "#3b82f6",
      features: [
        "All your sequences",
        "Sort & filter options",
        "Quick edit access",
        "Share with one tap",
      ],
      recommendation: "Best for: Quick access",
    },
    {
      id: "collections",
      title: "Collections",
      subtitle: "Organize your work",
      description:
        "Group sequences into folders. Create playlists for practice sessions or performances.",
      icon: "fa-folder",
      color: "#8b5cf6",
      features: [
        "Create custom folders",
        "Drag-and-drop organization",
        "Practice playlists",
        "Share entire collections",
      ],
      recommendation: "Best for: Organization",
    },
  ],
};

// ============================================================================
// CONTENT MAP (for easy lookup by module ID)
// ============================================================================
export const MODULE_ONBOARDING_CONTENT: Record<
  string,
  ModuleOnboardingContent
> = {
  discover: DISCOVER_ONBOARDING,
  learn: LEARN_ONBOARDING,
  compose: COMPOSE_ONBOARDING,
  train: TRAIN_ONBOARDING,
  library: LIBRARY_ONBOARDING,
};

/**
 * Get onboarding content for a module
 */
export function getModuleOnboardingContent(
  moduleId: string
): ModuleOnboardingContent | null {
  return MODULE_ONBOARDING_CONTENT[moduleId] ?? null;
}
