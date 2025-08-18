/**
 * Application State - Clean and Unified
 *
 * Single source of truth for all application state using Svelte 5 runes.
 * No redundancy, no "simple" prefixes, just clean state management.
 */

import { browser } from "$app/environment";
import type { AppSettings } from "$services/interfaces/application-interfaces";
import { BackgroundType } from "$lib/components/backgrounds/types/types";
import { BrowseStatePersistenceService } from "../services/implementations/BrowseStatePersistenceService";

// ============================================================================
// TYPES
// ============================================================================

type TabId =
  | "construct"
  | "browse"
  | "sequence_card"
  | "write"
  | "learn"
  | "about"
  | "motion-tester"
  | "arrow-debug";

// ============================================================================
// PERSISTENCE SERVICES
// ============================================================================

const browseStatePersistence = new BrowseStatePersistenceService();

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

const SETTINGS_STORAGE_KEY = "tka-modern-web-settings";

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  gridMode: "diamond",
  showBeatNumbers: true,
  autoSave: true,
  exportQuality: "high",
  workbenchColumns: 5,
  developerMode: true,
  animationsEnabled: true,
  backgroundType: BackgroundType.NIGHT_SKY,
  backgroundQuality: "medium",
  backgroundEnabled: true,
  visibility: {
    TKA: true,
    Reversals: true,
    Positions: true,
    Elemental: true,
    VTG: true,
    nonRadialPoints: true,
  },
} as AppSettings;

// ============================================================================
// SETTINGS PERSISTENCE
// ============================================================================

function loadSettingsFromStorage(): AppSettings {
  if (!browser) return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);
    const merged = { ...DEFAULT_SETTINGS, ...parsed };

    // Ensure developer mode is enabled for all tabs visibility
    if (merged.developerMode === false || merged.developerMode === undefined) {
      merged.developerMode = true;
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    }

    return merged;
  } catch (error) {
    console.warn("Failed to load settings from localStorage:", error);
    return DEFAULT_SETTINGS;
  }
}

function saveSettingsToStorage(settings: AppSettings): void {
  if (!browser) return;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
}

// ============================================================================
// APPLICATION STATE
// ============================================================================

const appState = $state({
  // Core UI state
  activeTab: "construct" as TabId,
  showSettings: false,
  theme: "dark" as "light" | "dark",
  isFullScreen: false,

  // Transition state
  isTransitioning: false,

  // App initialization
  isInitialized: false,
  isInitializing: false,
  initializationError: null as string | null,
  initializationProgress: 0,

  // Performance metrics
  performanceMetrics: {
    initializationTime: 0,
    lastRenderTime: 0,
    memoryUsage: 0,
  },

  // Settings
  settings: loadSettingsFromStorage(),
});

// ============================================================================
// GETTERS
// ============================================================================

// Initialization state
export function getIsInitialized() {
  return appState.isInitialized;
}

export function getIsInitializing() {
  return appState.isInitializing;
}

export function getInitializationError() {
  return appState.initializationError;
}

export function getInitializationProgress() {
  return appState.initializationProgress;
}

// UI state
export function getActiveTab() {
  return appState.activeTab;
}

export function getShowSettings() {
  return appState.showSettings;
}

export function getTheme() {
  return appState.theme;
}

export function getIsFullScreen() {
  return appState.isFullScreen;
}

export function getIsTransitioning() {
  return appState.isTransitioning;
}

// Settings
export function getSettings() {
  return appState.settings;
}

// Performance
export function getPerformanceMetrics() {
  return appState.performanceMetrics;
}

// Derived state
export function getIsReady() {
  return (
    appState.isInitialized &&
    !appState.isInitializing &&
    !appState.initializationError
  );
}

export function getCanUseApp() {
  return getIsReady() && !appState.showSettings;
}

export function getInitializationComplete() {
  return appState.initializationProgress >= 100;
}

// ============================================================================
// ACTIONS
// ============================================================================

// Tab management
export async function switchTab(tab: TabId): Promise<void> {
  if (appState.activeTab === tab) return;

  // Save current tab state before switching
  await saveCurrentTabState(appState.activeTab);

  // Simple transition handling
  appState.isTransitioning = true;
  const previousTab = appState.activeTab;
  appState.activeTab = tab;

  // Save application-level tab state
  await saveApplicationTabState(tab, previousTab);

  // Brief delay to allow transition to complete
  setTimeout(() => {
    appState.isTransitioning = false;
  }, 300);
}

export function isTabActive(tab: string): boolean {
  return appState.activeTab === tab;
}

export function setFullScreen(fullScreen: boolean): void {
  appState.isFullScreen = fullScreen;
}

// Settings management
export function showSettingsDialog(): void {
  appState.showSettings = true;
}

export function hideSettingsDialog(): void {
  appState.showSettings = false;
}

export function toggleSettingsDialog(): void {
  appState.showSettings = !appState.showSettings;
}

export function updateSettings(newSettings: Partial<AppSettings>): void {
  Object.assign(appState.settings, newSettings);
  saveSettingsToStorage(appState.settings);

  if (newSettings.theme) {
    appState.theme = newSettings.theme;
  }
}

export function setTheme(theme: "light" | "dark"): void {
  appState.theme = theme;
  appState.settings.theme = theme;
  saveSettingsToStorage(appState.settings);
}

// Initialization
export function setInitializationState(
  initialized: boolean,
  initializing: boolean,
  error: string | null = null,
  progress: number = 0
): void {
  appState.isInitialized = initialized;
  appState.isInitializing = initializing;
  appState.initializationError = error;
  appState.initializationProgress = progress;
}

export function setInitializationError(error: string): void {
  appState.initializationError = error;
  appState.isInitialized = false;
  appState.isInitializing = false;
}

export function setInitializationProgress(progress: number): void {
  appState.initializationProgress = progress;
}

// Performance tracking
export function updateInitializationTime(time: number): void {
  appState.performanceMetrics.initializationTime = time;
}

export function updateLastRenderTime(time: number): void {
  appState.performanceMetrics.lastRenderTime = time;
}

export function updateMemoryUsage(): void {
  if (typeof performance !== "undefined" && "memory" in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number } })
      .memory;
    appState.performanceMetrics.memoryUsage = Math.round(
      memory.usedJSHeapSize / 1048576
    );
  }
}

// ============================================================================
// TAB STATE PERSISTENCE
// ============================================================================

async function saveCurrentTabState(currentTab: TabId): Promise<void> {
  if (!browser) return;

  try {
    // Save tab-specific state based on current tab
    switch (currentTab) {
      case "browse":
        // Browse state is handled by its own persistence service
        break;
      case "construct":
      case "sequence_card":
      case "write":
      case "learn":
        // Add tab-specific state saving logic as needed
        break;
    }
  } catch (error) {
    console.error(`Failed to save ${currentTab} tab state:`, error);
  }
}

async function saveApplicationTabState(
  newTab: TabId,
  previousTab: TabId
): Promise<void> {
  if (!browser) return;

  try {
    const tabState = {
      activeTab: newTab,
      lastActiveTab: previousTab,
      tabStates: {},
      lastUpdated: new Date(),
    };

    await browseStatePersistence.saveApplicationTabState(tabState);
  } catch (error) {
    console.error("Failed to save application tab state:", error);
  }
}

export async function restoreApplicationState(): Promise<void> {
  if (!browser) return;

  try {
    const tabState = await browseStatePersistence.loadApplicationTabState();
    if (tabState?.activeTab && typeof tabState.activeTab === "string") {
      const validTabs: TabId[] = [
        "construct",
        "browse",
        "sequence_card",
        "write",
        "learn",
      ];
      if (validTabs.includes(tabState.activeTab as TabId)) {
        appState.activeTab = tabState.activeTab as TabId;
      }
    }
  } catch (error) {
    console.error("Failed to restore application state:", error);
  }
}

// ============================================================================
// UTILITIES & DEBUG
// ============================================================================

export function getAppStateSnapshot() {
  return {
    activeTab: appState.activeTab,
    showSettings: appState.showSettings,
    theme: appState.theme,
    isFullScreen: appState.isFullScreen,
    isTransitioning: appState.isTransitioning,
    isInitialized: appState.isInitialized,
    isInitializing: appState.isInitializing,
    initializationError: appState.initializationError,
    initializationProgress: appState.initializationProgress,
    performanceMetrics: { ...appState.performanceMetrics },
    settings: { ...appState.settings },
  };
}

export function resetAppState(): void {
  appState.activeTab = "construct";
  appState.showSettings = false;
  appState.theme = "dark";
  appState.isFullScreen = false;
  appState.isTransitioning = false;
  appState.isInitialized = false;
  appState.isInitializing = false;
  appState.initializationError = null;
  appState.initializationProgress = 0;
  Object.assign(appState.performanceMetrics, {
    initializationTime: 0,
    lastRenderTime: 0,
    memoryUsage: 0,
  });
  Object.assign(appState.settings, DEFAULT_SETTINGS);
  saveSettingsToStorage(appState.settings);
}

export function clearStoredSettings(): void {
  if (!browser) return;

  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    Object.assign(appState.settings, DEFAULT_SETTINGS);
    appState.theme = DEFAULT_SETTINGS.theme;
  } catch (error) {
    console.error("Failed to clear stored settings:", error);
  }
}

export function debugSettings(): void {
  if (!browser) return;

  try {
    console.log("🔍 Debug Settings:", {
      stored: localStorage.getItem(SETTINGS_STORAGE_KEY),
      parsed: JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}"),
      current: appState.settings,
    });
  } catch (error) {
    console.error("Error debugging settings:", error);
  }
}

// ============================================================================
// BROWSE STATE PERSISTENCE ACCESS
// ============================================================================

export function getBrowseStatePersistence(): BrowseStatePersistenceService {
  return browseStatePersistence;
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

declare global {
  interface Window {
    debugSettings?: typeof debugSettings;
    resetAppState?: typeof resetAppState;
    clearStoredSettings?: typeof clearStoredSettings;
  }
}

if (browser && typeof window !== "undefined") {
  window.debugSettings = debugSettings;
  window.resetAppState = resetAppState;
  window.clearStoredSettings = clearStoredSettings;
}
