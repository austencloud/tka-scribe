/**
 * Tab Configuration Definitions
 *
 * Pure data definitions for all module tabs.
 * Separated from state management for cleaner architecture.
 */

import type { Section } from "../domain/types";

// Create tabs configuration - mutable to allow dynamic tab accessibility updates
// Note: Edit functionality is now handled via a slide-out panel, not a tab
// Note: Animate is now a Play button in the button panel with inline animator
// Note: Record removed (not implemented yet, users will use native camera apps)
// Note: HandPath (gestural) temporarily removed - not ready for production
export const CREATE_TABS: Section[] = [
  {
    id: "assembler",
    label: "Assemble",
    icon: '<i class="fas fa-puzzle-piece"></i>',
    description: "Build sequences one hand at a time (6 simple choices)",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  {
    id: "constructor",
    label: "Construct",
    icon: '<i class="fas fa-hammer"></i>',
    description: "Create sequences step by step (all options)",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  },
  {
    id: "generator",
    label: "Generate",
    icon: '<i class="fas fa-wand-magic-sparkles"></i>',
    description: "Auto-create sequences",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)",
  },
];

// Learn tabs configuration
export const LEARN_TABS: Section[] = [
  {
    id: "concepts",
    label: "Concepts",
    icon: '<i class="fas fa-lightbulb"></i>',
    description: "Progressive concept mastery path",
    color: "#60a5fa",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    id: "play",
    label: "Play",
    icon: '<i class="fas fa-gamepad"></i>',
    description: "Fun games to test your pictograph skills",
    color: "#f472b6",
    gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  },
  {
    id: "codex",
    label: "Codex",
    icon: '<i class="fas fa-book-open"></i>',
    description: "Browse all letters and pictographs",
    color: "#a78bfa",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
];

// Discover tabs configuration (public discovery)
// Note: Library functionality is now integrated into Gallery via scope toggle (Community / My Library)
export const DISCOVER_TABS: Section[] = [
  {
    id: "gallery",
    label: "Gallery",
    icon: '<i class="fas fa-layer-group"></i>',
    description: "Browse and discover sequences",
    color: "#a855f7",
    gradient: "linear-gradient(135deg, #c084fc 0%, #a855f7 100%)",
  },
  {
    id: "collections",
    label: "Collections",
    icon: '<i class="fas fa-folder"></i>',
    description: "Browse curated playlists",
    color: "#c084fc",
    gradient: "linear-gradient(135deg, #d8b4fe 0%, #c084fc 100%)",
  },
  {
    id: "creators",
    label: "Creators",
    icon: '<i class="fas fa-users"></i>',
    description: "Discover community members",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
  },
];

// Library tabs configuration - Personal content management
export const LIBRARY_TABS: Section[] = [
  {
    id: "sequences",
    label: "Sequences",
    icon: '<i class="fas fa-layer-group"></i>',
    description: "Your saved sequences",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    id: "collections",
    label: "Collections",
    icon: '<i class="fas fa-folder"></i>',
    description: "Organize content into folders",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  {
    id: "compositions",
    label: "Compositions",
    icon: '<i class="fas fa-film"></i>',
    description: "Your saved compositions",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  },
];

// Inbox tabs configuration - Messages and notifications
export const INBOX_TABS: Section[] = [
  {
    id: "messages",
    label: "Messages",
    icon: '<i class="fas fa-envelope"></i>',
    description: "Conversations with other users",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: '<i class="fas fa-bell"></i>',
    description: "System alerts and updates",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  },
];

// Community tabs configuration
export const COMMUNITY_TABS: Section[] = [
  {
    id: "creators",
    label: "Creators",
    icon: '<i class="fas fa-users"></i>',
    description: "Discover community members",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
  },
  {
    id: "challenges",
    label: "Challenges",
    icon: '<i class="fas fa-bolt"></i>',
    description: "Daily and weekly challenges",
    color: "#fbbf24",
    gradient: "linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%)",
  },
  {
    id: "support",
    label: "Support",
    icon: '<i class="fas fa-heart"></i>',
    description: "Support TKA development",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  },
];

/**
 * @deprecated Collect module renamed to Library.
 */
export const COLLECT_TABS: Section[] = LIBRARY_TABS;

// Legacy exports for backwards compatibility during migration
export const BUILD_TABS = CREATE_TABS; // Legacy name
export const COLLECTION_TABS = LIBRARY_TABS; // Legacy name

// Compose module tabs configuration
// Arrange (mode selection + sequence config) | Browse (saved compositions) | Timeline (DAW-style editor)
// Note: Playback is an overlay, not a tab - triggered from Arrange or Browse
export const ANIMATE_TABS: Section[] = [
  {
    id: "arrange",
    label: "Arrange",
    icon: '<i class="fas fa-layer-group"></i>',
    description: "Arrange sequences into compositions",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  },
  {
    id: "browse",
    label: "Browse",
    icon: '<i class="fas fa-film"></i>',
    description: "Explore saved compositions",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: '<i class="fas fa-timeline"></i>',
    description: "DAW-style timeline editor for precise clip arrangement",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  },
];

// Train tabs configuration
export const TRAIN_TABS: Section[] = [
  {
    id: "practice",
    label: "Practice",
    icon: '<i class="fas fa-dumbbell"></i>',
    description: "Free practice with adaptive, step, and timed modes",
    color: "#3b82f6",
  },
  {
    id: "challenges",
    label: "Challenges",
    icon: '<i class="fas fa-trophy"></i>',
    description: "Structured challenges with XP rewards",
    color: "#f59e0b",
  },
  {
    id: "progress",
    label: "Progress",
    icon: '<i class="fas fa-chart-line"></i>',
    description: "View stats and performance history",
    color: "#8b5cf6",
  },
];

// About - single page module (no sub-tabs)
export const ABOUT_TABS: Section[] = [];

// Account tabs configuration (personal account management)
export const ACCOUNT_TABS: Section[] = [
  {
    id: "overview",
    label: "Overview",
    icon: '<i class="fas fa-user"></i>',
    description: "Profile info, stats, and achievements",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
  },
  {
    id: "library",
    label: "Library",
    icon: '<i class="fas fa-book"></i>',
    description: "Your sequences, favorites, and collections",
    color: "#0891b2",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #0891b2 100%)",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: '<i class="fas fa-sliders-h"></i>',
    description: "App settings and customization",
    color: "#64748b",
    gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
  },
  {
    id: "security",
    label: "Security",
    icon: '<i class="fas fa-shield-alt"></i>',
    description: "Sign in, accounts, and privacy",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
  },
];

/**
 * @deprecated Edit is no longer a navigation tab.
 * Edit functionality is now a slide-out panel accessible from Create and Sequence Viewer.
 * Kept for backwards compatibility.
 */
export const EDIT_TABS: Section[] = [];

// ML Training tabs configuration
export const ML_TRAINING_TABS: Section[] = [
  {
    id: "capture",
    label: "Capture",
    icon: '<i class="fas fa-video"></i>',
    description: "Record prop training data",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: '<i class="fas fa-folder-open"></i>',
    description: "Manage captured sessions",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
];

// Admin tabs configuration
export const ADMIN_TABS: Section[] = [
  {
    id: "users",
    label: "Users",
    icon: '<i class="fas fa-users"></i>',
    description: "Active users and activity monitoring",
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
  },
  {
    id: "challenges",
    label: "Challenges",
    icon: '<i class="fas fa-calendar-day"></i>',
    description: "Manage daily challenges",
    color: "#ffd700",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #ffd700 100%)",
  },
  {
    id: "train-challenges",
    label: "Train",
    icon: '<i class="fas fa-dumbbell"></i>',
    description: "Manage training challenges",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: '<i class="fas fa-chart-line"></i>',
    description: "View app usage and metrics",
    color: "#64748b",
    gradient: "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)",
  },
  {
    id: "flags",
    label: "Flags",
    icon: '<i class="fas fa-flag"></i>',
    description: "Manage feature flags and access control",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  {
    id: "announcements",
    label: "Announcements",
    icon: '<i class="fas fa-bullhorn"></i>',
    description: "Create and manage system announcements",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
  },
];

// Settings tabs configuration - shown in sidebar like other modules
export const SETTINGS_TABS: Section[] = [
  {
    id: "profile",
    label: "Profile",
    icon: '<i class="fas fa-user"></i>',
    description: "Account and profile settings",
    color: "#6366f1",
    gradient: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
  },
  {
    id: "release-notes",
    label: "Release Notes",
    icon: '<i class="fas fa-gift"></i>',
    description: "Version history and release notes",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: '<i class="fas fa-bell"></i>',
    description: "Announcements and notification preferences",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)",
  },
  {
    id: "props",
    label: "Props",
    icon: '<i class="fas fa-tags"></i>',
    description: "Prop type preferences",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #f472b6 0%, #ec4899 100%)",
  },
  {
    id: "theme",
    label: "Theme",
    icon: '<i class="fas fa-palette"></i>',
    description: "Theme and visual settings",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)",
  },
  {
    id: "visibility",
    label: "Visibility",
    icon: '<i class="fas fa-eye"></i>',
    description: "Element visibility controls",
    color: "#22c55e",
    gradient: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
  },
  {
    id: "keyboard",
    label: "Keyboard",
    icon: '<i class="fas fa-keyboard"></i>',
    description: "Keyboard shortcuts and customization",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
];

// Feedback tabs configuration (testers/admins only)
export const FEEDBACK_TABS: Section[] = [
  {
    id: "submit",
    label: "Submit",
    icon: '<i class="fas fa-paper-plane"></i>',
    description: "Submit feedback, bug reports, or feature requests",
    color: "#14b8a6",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)",
  },
  {
    id: "my-feedback",
    label: "My Feedback",
    icon: '<i class="fas fa-list-check"></i>',
    description: "Track your submitted feedback and confirmations",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    id: "manage",
    label: "Manage",
    icon: '<i class="fas fa-inbox"></i>',
    description: "Review and manage submitted feedback",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
  },
];
