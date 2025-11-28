/**
 * Navigation State - Global Navigation State Management
 *
 * Manages global navigation state including current modes for tabs with sub-modes.
 * This provides a centralized way to track and update navigation state across the app.
 */

import type { ModuleDefinition, ModuleId, Section } from "../domain/types";
import { tryResolve } from "../../inversify";
import { TYPES } from "../../inversify/types";
import type { IActivityLogService } from "../../analytics";

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
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  },
];

// Library tabs configuration (personal - dashboard-based, no sub-tabs needed)
// The Library module uses a dashboard layout with drill-down views
export const LIBRARY_TABS: Section[] = [];

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

// Animate tabs configuration
export const ANIMATE_TABS: Section[] = [
  {
    id: "single",
    label: "Single",
    icon: '<i class="fas fa-user"></i>',
    description: "Animate one sequence",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
  },
  {
    id: "tunnel",
    label: "Tunnel",
    icon: '<i class="fas fa-users"></i>',
    description: "Overlay two sequences",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
  },
  {
    id: "mirror",
    label: "Mirror",
    icon: '<i class="fas fa-left-right"></i>',
    description: "Side-by-side mirrored view",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
  },
  {
    id: "grid",
    label: "Grid",
    icon: '<i class="fas fa-th"></i>',
    description: "2×2 rotated grid",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
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
    color: "#10b981",
    gradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: '<i class="fas fa-sliders-h"></i>',
    description: "App settings and customization",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
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

// Admin tabs configuration
export const ADMIN_TABS: Section[] = [
  {
    id: "challenges",
    label: "Challenges",
    icon: '<i class="fas fa-calendar-day"></i>',
    description: "Manage daily challenges",
    color: "#ffd700",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #ffd700 100%)",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: '<i class="fas fa-chart-line"></i>',
    description: "View app usage and metrics",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
  },
  {
    id: "users",
    label: "Users",
    icon: '<i class="fas fa-users"></i>',
    description: "Manage users and permissions",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
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
    id: "tools",
    label: "Tools",
    icon: '<i class="fas fa-toolbox"></i>',
    description: "Data migration and maintenance tools",
    color: "#f97316",
    gradient: "linear-gradient(135deg, #fb923c 0%, #f97316 100%)",
  },
];

// Module definitions for the new navigation system
export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: "create",
    label: "Create",
    icon: '<i class="fas fa-tools" style="color: #f59e0b;"></i>', // Amber - construction/creation
    description: "Construct and generate sequences",
    isMain: true,
    sections: CREATE_TABS,
  },
  {
    id: "discover",
    label: "Discover",
    icon: '<i class="fas fa-compass" style="color: #a855f7;"></i>', // Purple - discovery/exploration
    description: "Discover and discover sequences",
    isMain: true,
    sections: DISCOVER_TABS,
  },
  {
    id: "community",
    label: "Community",
    icon: '<i class="fas fa-users" style="color: #06b6d4;"></i>', // Cyan - social/community
    description: "Discover creators and challenges",
    isMain: true,
    sections: COMMUNITY_TABS,
  },
  {
    id: "learn",
    label: "Learn",
    icon: '<i class="fas fa-graduation-cap" style="color: #3b82f6;"></i>', // Blue - education/knowledge
    description: "Study and practice TKA",
    isMain: true,
    sections: LEARN_TABS,
  },
  {
    id: "library",
    label: "Library",
    icon: '<i class="fas fa-book" style="color: #10b981;"></i>', // Green - personal collection
    description: "Your sequences, collections, and acts",
    isMain: true,
    sections: LIBRARY_TABS,
  },
  {
    id: "animate",
    label: "Animate",
    icon: '<i class="fas fa-play-circle" style="color: #ec4899;"></i>', // Pink - animation/motion
    description: "Advanced animation visualization",
    isMain: true,
    sections: ANIMATE_TABS,
  },
  // Removed: edit module (Edit functionality is now a slide-out panel accessible from Create and Sequence Viewer)
  // Removed: write and word_card modules (not currently in use)
  // Removed: about module (content moved to Community > Support tab)
  {
    id: "account",
    label: "Account",
    icon: '<i class="fas fa-user-circle" style="color: #6366f1;"></i>', // Indigo - personal/account
    description: "Your profile, library, and settings",
    isMain: true, // Shown in sidebar with expandable tabs like other modules
    sections: ACCOUNT_TABS,
  },
  {
    id: "admin",
    label: "Admin",
    icon: '<i class="fas fa-crown" style="color: #ffd700;"></i>', // Gold - admin/privileged
    description: "System management & configuration",
    isMain: true, // Visibility controlled by getModuleDefinitions() based on admin status
    sections: ADMIN_TABS,
  },
];

/**
 * Creates navigation state for managing modules and tabs
 */
export function createNavigationState() {
  // Current state
  let currentCreateMode = $state<string>("constructor");
  let currentLearnMode = $state<string>("concepts");

  // Module-based state
  let currentModule = $state<ModuleId>("create");
  let activeTab = $state<string>("constructor"); // Active tab within the current module
  const MODULE_LAST_TABS_KEY = "tka-module-last-tabs";
  let lastTabByModule = $state<Partial<Record<ModuleId, string>>>({});

  // Panel persistence per tab (e.g., animation panel open in construct tab)
  // Key format: "moduleId:tabId" (e.g., "create:constructor", "create:assembler")
  const TAB_LAST_PANELS_KEY = "tka-tab-last-panels";
  let lastPanelByTab = $state<Record<string, string | null>>({});

  // Creation method selector visibility (for hiding tabs when selector is shown)
  let isCreationMethodSelectorVisible = $state<boolean>(false);

  // Load persisted state
  if (typeof localStorage !== "undefined") {
    // Load create mode persistence
    const savedCreateMode = localStorage.getItem("tka-current-create-mode");
    if (savedCreateMode && CREATE_TABS.some((t) => t.id === savedCreateMode)) {
      currentCreateMode = savedCreateMode;
    }

    const savedLearnMode = localStorage.getItem("tka-current-learn-mode");
    if (savedLearnMode && LEARN_TABS.some((t) => t.id === savedLearnMode)) {
      currentLearnMode = savedLearnMode;
    }

    // Load module persistence
    const savedModule = localStorage.getItem("tka-current-module");
    if (savedModule && MODULE_DEFINITIONS.some((m) => m.id === savedModule)) {
      currentModule = savedModule as ModuleId;
    }

    // Load last active tab for each module
    const savedLastTabs = localStorage.getItem(MODULE_LAST_TABS_KEY);
    if (savedLastTabs) {
      try {
        const parsed = JSON.parse(savedLastTabs) as Record<string, string>;
        const filteredEntries = Object.entries(parsed).filter(
          ([moduleId, tabId]) => {
            const moduleDefinition = MODULE_DEFINITIONS.find(
              (m) => m.id === moduleId
            );
            return (
              moduleDefinition?.sections.some((tab) => tab.id === tabId) ??
              false
            );
          }
        );

        if (filteredEntries.length > 0) {
          lastTabByModule = filteredEntries.reduce<
            Partial<Record<ModuleId, string>>
          >((acc, [moduleId, tabId]) => {
            acc[moduleId as ModuleId] = tabId;
            return acc;
          }, {});
        }
      } catch (error) {
        console.warn(
          "NavigationState: failed to parse saved module tab map:",
          error
        );
      }
    }

    // Load last open panel for each tab (key format: "moduleId:tabId")
    const savedLastPanels = localStorage.getItem(TAB_LAST_PANELS_KEY);
    if (savedLastPanels) {
      try {
        const parsed = JSON.parse(savedLastPanels) as Record<string, string | null>;
        // Validate tab keys - format "moduleId:tabId"
        const filteredEntries = Object.entries(parsed).filter(([tabKey]) => {
          const [moduleId, tabId] = tabKey.split(":");
          if (!moduleId || !tabId) return false;
          const moduleDefinition = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
          return moduleDefinition?.sections.some((tab) => tab.id === tabId) ?? false;
        });
        if (filteredEntries.length > 0) {
          lastPanelByTab = Object.fromEntries(filteredEntries);
        }
      } catch (error) {
        console.warn(
          "NavigationState: failed to parse saved tab panel map:",
          error
        );
      }
    }

    // Load current active tab
    const savedActiveTab = localStorage.getItem("tka-active-tab");
    if (savedActiveTab) {
      activeTab = savedActiveTab;
    }

    // Remember the last active tab for current module (inline to avoid closure warning)
    const rememberedTab = lastTabByModule[currentModule];
    if (rememberedTab) {
      const moduleDefinition = MODULE_DEFINITIONS.find(
        (m) => m.id === currentModule
      );
      if (moduleDefinition?.sections.some((tab) => tab.id === rememberedTab)) {
        activeTab = rememberedTab;
      }
    }

    // Sync mode-specific state with activeTab after all loading is complete
    // This ensures currentLearnMode/currentCreateMode match activeTab on refresh
    // Note: These comparisons use the current values directly (not in a closure)
    const moduleAtInit = currentModule;
    const tabAtInit = activeTab;
    if (moduleAtInit === "learn" && LEARN_TABS.some((t) => t.id === tabAtInit)) {
      currentLearnMode = tabAtInit;
    } else if (moduleAtInit === "create" && CREATE_TABS.some((t) => t.id === tabAtInit)) {
      currentCreateMode = tabAtInit;
    }
  }

  // Action functions
  function setCreateMode(mode: string) {
    if (CREATE_TABS.some((t) => t.id === mode)) {
      currentCreateMode = mode;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("tka-current-create-mode", mode);
      }
    }
  }

  function setLearnMode(mode: string) {
    if (LEARN_TABS.some((t) => t.id === mode)) {
      currentLearnMode = mode;
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("tka-current-learn-mode", mode);
      }
      // Sync with new state when in Learn module
      if (currentModule === "learn") {
        activeTab = mode;
      }
    }
  }

  function persistLastTabs() {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        MODULE_LAST_TABS_KEY,
        JSON.stringify(lastTabByModule)
      );
    } catch (error) {
      console.warn("NavigationState: failed to persist module tab map:", error);
    }
  }

  function persistLastPanels() {
    if (typeof localStorage === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        TAB_LAST_PANELS_KEY,
        JSON.stringify(lastPanelByTab)
      );
    } catch (error) {
      console.warn("NavigationState: failed to persist tab panel map:", error);
    }
  }

  // Module-based functions
  // targetTab: Optional tab to set directly (bypasses remembered/default tab logic)
  function setCurrentModule(moduleId: ModuleId, targetTab?: string) {
    if (MODULE_DEFINITIONS.some((m) => m.id === moduleId)) {
      const previousModule = currentModule;
      currentModule = moduleId;

      // Set default tab for the module
      const moduleDefinition = MODULE_DEFINITIONS.find(
        (m) => m.id === moduleId
      );
      let nextTab = activeTab;
      if (moduleDefinition && moduleDefinition.sections.length > 0) {
        // If targetTab is specified and valid, use it directly
        if (targetTab && moduleDefinition.sections.some((tab) => tab.id === targetTab)) {
          nextTab = targetTab;
        } else {
          // Otherwise fall back to remembered or first tab
          const remembered = lastTabByModule[moduleId];
          const firstSection = moduleDefinition.sections[0];
          const fallbackTab = firstSection ? firstSection.id : "";
          nextTab =
            remembered &&
            moduleDefinition.sections.some((tab) => tab.id === remembered)
              ? remembered
              : fallbackTab;
        }

        lastTabByModule = {
          ...lastTabByModule,
          [moduleId]: nextTab,
        };
      } else {
        const updatedMap = { ...lastTabByModule };
        delete updatedMap[moduleId];
        lastTabByModule = updatedMap;
      }

      activeTab = nextTab;

      // Log module navigation for analytics (non-blocking)
      // Include the tab for more granular tracking (e.g., "create:generator")
      if (previousModule !== moduleId) {
        try {
          const activityService = tryResolve<IActivityLogService>(TYPES.IActivityLogService);
          if (activityService) {
            const moduleWithTab = nextTab ? `${moduleId}:${nextTab}` : moduleId;
            void activityService.logModuleView(moduleWithTab, previousModule);
          }
        } catch {
          // Silently fail - activity logging is non-critical
        }
      }

      // Persist both module and active tab
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("tka-current-module", moduleId);
        if (nextTab) {
          localStorage.setItem("tka-active-tab", nextTab);
        }
      }

      persistLastTabs();

      // Sync with mode-specific state
      const tab = getActiveTab();
      if (moduleId === "create") {
        setCreateMode(tab);
      } else if (moduleId === "learn") {
        setLearnMode(tab);
      }
    }
  }

  function setActiveTab(tabId: string) {
    const moduleDefinition = MODULE_DEFINITIONS.find(
      (m) => m.id === currentModule
    );
    if (
      moduleDefinition &&
      moduleDefinition.sections.some((tab) => tab.id === tabId)
    ) {
      const previousTab = activeTab;
      activeTab = tabId;

      // Log tab switch for analytics (non-blocking)
      if (previousTab !== tabId) {
        try {
          const activityService = tryResolve<IActivityLogService>(TYPES.IActivityLogService);
          if (activityService) {
            const moduleWithTab = `${currentModule}:${tabId}`;
            const previousModuleWithTab = `${currentModule}:${previousTab}`;
            void activityService.logModuleView(moduleWithTab, previousModuleWithTab);
          }
        } catch {
          // Silently fail - activity logging is non-critical
        }
      }

      if (typeof localStorage !== "undefined") {
        localStorage.setItem("tka-active-tab", tabId);
      }

      lastTabByModule = {
        ...lastTabByModule,
        [currentModule]: tabId,
      };
      persistLastTabs();

      // Sync with mode-specific state
      const module = getCurrentModule();
      if (module === "create") {
        setCreateMode(tabId);
      } else if (module === "learn") {
        setLearnMode(tabId);
      }
    }
  }

  function getCurrentModule(): ModuleId {
    return currentModule;
  }

  function getActiveTab(): string {
    return activeTab;
  }

  function getTabsForModule(moduleId: ModuleId): Section[] {
    const moduleDefinition = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
    return moduleDefinition ? moduleDefinition.sections : [];
  }

  function getModuleDefinition(
    moduleId: ModuleId
  ): ModuleDefinition | undefined {
    return MODULE_DEFINITIONS.find((m) => m.id === moduleId);
  }

  function updateTabAccessibility(tabId: string, disabled: boolean) {
    // Find and update the tab in CREATE_TABS (mutate directly)
    const tab = CREATE_TABS.find((t) => t.id === tabId);
    if (tab) {
      tab.disabled = disabled;
    }
  }

  return {
    // Current state
    get currentCreateMode() {
      return currentCreateMode;
    },
    get currentLearnMode() {
      return currentLearnMode;
    },

    // Module-based readonly state
    get currentModule() {
      return currentModule;
    },
    get activeTab() {
      return activeTab;
    },

    // Tab configurations
    get createTabs() {
      return CREATE_TABS;
    },
    get learnTabs() {
      return LEARN_TABS;
    },
    get discoverTabs() {
      return DISCOVER_TABS;
    },
    get communityTabs() {
      return COMMUNITY_TABS;
    },
    get libraryTabs() {
      return LIBRARY_TABS;
    },
    get adminTabs() {
      return ADMIN_TABS;
    },
    get accountTabs() {
      return ACCOUNT_TABS;
    },
    get moduleDefinitions() {
      return MODULE_DEFINITIONS;
    },

    // Legacy getters (deprecated)
    /** @deprecated Use createTabs instead */
    get CreateModules() {
      return CREATE_TABS;
    },
    /** @deprecated Use createTabs instead */
    get buildModes() {
      return CREATE_TABS;
    },
    /** @deprecated Use createTabs instead */
    get createModes() {
      return CREATE_TABS;
    },
    /** @deprecated Use currentCreateMode instead */
    get currentBuildMode() {
      return currentCreateMode;
    },
    /** @deprecated Use learnTabs instead */
    get learnModes() {
      return LEARN_TABS;
    },
    /** @deprecated Use discoverTabs instead */
    get discoverModes() {
      return DISCOVER_TABS;
    },
    /** @deprecated Use discoverTabs instead */
    get DiscoverModes() {
      return DISCOVER_TABS;
    },
    /** @deprecated Use activeTab instead */
    get currentSection() {
      return activeTab;
    },

    // Actions
    setCreateMode,
    setLearnMode,

    // Module-based actions
    setCurrentModule,
    setActiveTab,
    getCurrentModule,
    getActiveTab,
    getTabsForModule,
    getModuleDefinition,
    updateTabAccessibility,

    // Creation method selector visibility
    get isCreationMethodSelectorVisible() {
      return isCreationMethodSelectorVisible;
    },
    setCreationMethodSelectorVisible(visible: boolean) {
      isCreationMethodSelectorVisible = visible;
    },

    // Panel persistence per tab (key format: "moduleId:tabId")
    /**
     * Get the last open panel for a specific tab
     * @param moduleId The module (defaults to current module)
     * @param tabId The tab within the module (defaults to active tab)
     * @returns The panel ID (e.g., "animation", "edit", "share") or null if no panel was open
     */
    getLastPanelForTab(moduleId?: ModuleId, tabId?: string): string | null {
      const module = moduleId ?? currentModule;
      const tab = tabId ?? activeTab;
      const tabKey = `${module}:${tab}`;
      return lastPanelByTab[tabKey] ?? null;
    },

    /**
     * Set the last open panel for a specific tab
     * @param panelId The panel ID to save (e.g., "animation", "edit", "share") or null to clear
     * @param moduleId The module (defaults to current module)
     * @param tabId The tab within the module (defaults to active tab)
     */
    setLastPanelForTab(panelId: string | null, moduleId?: ModuleId, tabId?: string) {
      const module = moduleId ?? currentModule;
      const tab = tabId ?? activeTab;
      const tabKey = `${module}:${tab}`;
      lastPanelByTab = {
        ...lastPanelByTab,
        [tabKey]: panelId,
      };
      persistLastPanels();
    },

    /**
     * Clear the panel state for a tab (use when explicitly closing a panel)
     * @param moduleId The module (defaults to current module)
     * @param tabId The tab within the module (defaults to active tab)
     */
    clearPanelForTab(moduleId?: ModuleId, tabId?: string) {
      const module = moduleId ?? currentModule;
      const tab = tabId ?? activeTab;
      const tabKey = `${module}:${tab}`;
      const updated = { ...lastPanelByTab };
      delete updated[tabKey];
      lastPanelByTab = updated;
      persistLastPanels();
    },

    // Legacy action aliases (deprecated)
    /** @deprecated Use setCreateMode instead */
    setBuildMode: setCreateMode,
    /** @deprecated Use setActiveTab instead */
    setCurrentSection: setActiveTab,
    /** @deprecated Use getActiveTab instead */
    getCurrentSection: getActiveTab,
    /** @deprecated Use getTabsForModule instead */
    getSectionsForModule: getTabsForModule,
  };
}

/**
 * Type for NavigationState - the return type of createNavigationState
 */
export type NavigationState = ReturnType<typeof createNavigationState>;

// Global navigation state instance
export const navigationState = createNavigationState();
