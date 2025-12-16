/**
 * Module Definitions
 *
 * Defines all application modules with their metadata.
 * Separated from state management for cleaner architecture.
 */

import type { ModuleDefinition } from "../domain/types";
import {
  CREATE_TABS,
  LEARN_TABS,
  DISCOVER_TABS,
  ANIMATE_TABS,
  TRAIN_TABS,
  LIBRARY_TABS,
  FEEDBACK_TABS,
  ML_TRAINING_TABS,
  ADMIN_TABS,
  SETTINGS_TABS,
} from "./tab-definitions";

// Module definitions for the new navigation system
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: '<i class="fas fa-home" style="color: #10b981;"></i>',
    color: "#10b981", // Emerald - home/dashboard
    description: "Your TKA Scribe home",
    isMain: true,
    sections: [], // Dashboard has no sub-tabs
  },
  {
    id: "create",
    label: "Create",
    icon: '<i class="fas fa-tools" style="color: #f59e0b;"></i>',
    color: "#f59e0b", // Amber - construction/creation
    description: "Construct and generate sequences",
    isMain: true,
    sections: CREATE_TABS,
  },
  {
    id: "discover",
    label: "Discover",
    icon: '<i class="fas fa-compass" style="color: #a855f7;"></i>',
    color: "#a855f7", // Purple - discovery/exploration
    description: "Discover sequences and creators",
    isMain: true,
    sections: DISCOVER_TABS,
  },
  // Community module retired - Creators moved to Discover, Challenges to Dashboard
  {
    id: "learn",
    label: "Learn",
    icon: '<i class="fas fa-graduation-cap" style="color: #3b82f6;"></i>',
    color: "#3b82f6", // Blue - education/knowledge
    description: "Study and practice TKA",
    isMain: true,
    sections: LEARN_TABS,
  },
  {
    id: "compose",
    label: "Compose",
    icon: '<i class="fas fa-photo-film" style="color: #ec4899;"></i>',
    color: "#ec4899", // Pink - composition/choreography
    description: "Compose sequences into animations",
    isMain: true,
    sections: ANIMATE_TABS, // TODO: Rename to COMPOSE_TABS
  },
  {
    id: "train",
    label: "Train",
    icon: '<i class="fas fa-running" style="color: #ef4444;"></i>',
    color: "#ef4444", // Red - action/training
    description: "Practice with real-time scoring",
    isMain: true,
    sections: TRAIN_TABS,
  },
  {
    id: "library",
    label: "Library",
    icon: '<i class="fas fa-book" style="color: #0891b2;"></i>',
    color: "#0891b2", // Cyan - personal collection
    description: "Your sequences, collections, and compositions",
    isMain: true,
    sections: LIBRARY_TABS,
  },
  // Removed: account module (merged into Dashboard - profile widget handles auth)
  // Removed: edit module (Edit functionality is now a slide-out panel accessible from Create and Sequence Viewer)
  // Removed: write and word_card modules (not currently in use)
  // Removed: about module (content moved to Dashboard > Support widget)
  {
    id: "feedback",
    label: "Feedback",
    icon: '<i class="fas fa-comment-dots" style="color: #14b8a6;"></i>',
    color: "#14b8a6", // Teal - feedback/communication
    description: "Submit and manage feedback",
    isMain: true, // Visibility controlled by getModuleDefinitions() based on tester status
    sections: FEEDBACK_TABS,
  },
  {
    id: "ml-training",
    label: "ML Training",
    icon: '<i class="fas fa-brain" style="color: #8b5cf6;"></i>',
    color: "#8b5cf6", // Purple - AI/ML
    description: "Train prop detection models",
    isMain: true, // Visibility controlled by getModuleDefinitions() based on tester status
    sections: ML_TRAINING_TABS,
  },
  {
    id: "admin",
    label: "Admin",
    icon: '<i class="fas fa-crown" style="color: #ffd700;"></i>',
    color: "#ffd700", // Gold - admin/privileged
    description: "System management & configuration",
    isMain: true, // Visibility controlled by getModuleDefinitions() based on admin status
    sections: ADMIN_TABS,
  },
  {
    id: "settings",
    label: "Settings",
    icon: '<i class="fas fa-cog" style="color: #64748b;"></i>',
    color: "#64748b", // Slate - neutral settings color
    description: "Configure app preferences",
    isMain: true, // Main module button on dashboard
    sections: SETTINGS_TABS, // Profile, Props, Background, Visibility, Misc, AI tabs
  },
];
