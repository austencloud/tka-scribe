/**
 * Settings Module State
 *
 * Manages internal tab navigation for the Settings module.
 * Settings tabs: profile, props, background, visibility, misc
 */

// Tab types for settings module
export type SettingsTab =
  | "profile"
  | "props"
  | "background"
  | "visibility"
  | "misc";

// LocalStorage key
const STORAGE_KEY = "tka-settings-active-tab";

// Valid tabs for validation
const VALID_TABS: SettingsTab[] = [
  "profile",
  "props",
  "background",
  "visibility",
  "misc",
];

// Default tab
const DEFAULT_TAB: SettingsTab = "props";

// Helper functions for localStorage
function loadFromStorage(): SettingsTab {
  if (typeof window === "undefined") return DEFAULT_TAB;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isValidTab(stored)) {
      return stored as SettingsTab;
    }
  } catch (err) {
    console.warn("Failed to load settings tab from localStorage:", err);
  }
  return DEFAULT_TAB;
}

function saveToStorage(tab: SettingsTab): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, tab);
  } catch (err) {
    console.warn("Failed to save settings tab to localStorage:", err);
  }
}

function isValidTab(tab: string): tab is SettingsTab {
  return VALID_TABS.includes(tab as SettingsTab);
}

export type SettingsModuleState = {
  // Current tab
  readonly currentTab: SettingsTab;

  // Tab switching
  setCurrentTab: (tab: SettingsTab) => void;

  // Navigation helpers
  goToProfile: () => void;
  goToProps: () => void;
  goToBackground: () => void;
  goToVisibility: () => void;
  goToMisc: () => void;

  // Reset
  reset: () => void;
};

export function createSettingsModuleState(): SettingsModuleState {
  // Current tab (persisted)
  let currentTab = $state<SettingsTab>(loadFromStorage());

  return {
    // Getter
    get currentTab() {
      return currentTab;
    },

    // Tab switching
    setCurrentTab(tab: SettingsTab) {
      if (!isValidTab(tab)) {
        console.warn("SettingsModuleState: Invalid tab", tab);
        return;
      }
      currentTab = tab;
      saveToStorage(tab);
    },

    // Navigation helpers
    goToProfile() {
      currentTab = "profile";
      saveToStorage("profile");
    },

    goToProps() {
      currentTab = "props";
      saveToStorage("props");
    },

    goToBackground() {
      currentTab = "background";
      saveToStorage("background");
    },

    goToVisibility() {
      currentTab = "visibility";
      saveToStorage("visibility");
    },

    goToMisc() {
      currentTab = "misc";
      saveToStorage("misc");
    },

    // Reset
    reset() {
      currentTab = DEFAULT_TAB;
      saveToStorage(DEFAULT_TAB);
    },
  };
}

// Singleton instance
let settingsModuleStateInstance: SettingsModuleState | null = null;

export function getSettingsModuleState(): SettingsModuleState {
  if (!settingsModuleStateInstance) {
    settingsModuleStateInstance = createSettingsModuleState();
  }
  return settingsModuleStateInstance;
}
