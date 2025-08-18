/**
 * Application State - Pure Svelte 5 Runes
 *
 * Global application state using only runes - no stores anywhere!
 * Simple, clean state management without complex fade orchestration
 */

import { browser } from "$app/environment";
// import { GridMode as DomainGridMode } from "$lib/domain/enums";
import type { AppSettings } from "$services/interfaces/application-interfaces";
import { BrowseStatePersistenceService } from "../services/implementations/BrowseStatePersistenceService";

// ============================================================================
// PERSISTENCE SERVICES
// ============================================================================

// Initialize persistence service
const browseStatePersistence = new BrowseStatePersistenceService();

// ============================================================================
// INITIALIZATION STATE
// ============================================================================

// Create state object to avoid export issues
const initState = $state({
  isInitialized: false,
  isInitializing: false,
  initializationError: null as string | null,
  initializationProgress: 0,
});

// Export getter functions for the state
export function getIsInitialized() {
  return initState.isInitialized;
}
export function getIsInitializing() {
  return initState.isInitializing;
}
export function getInitializationError() {
  return initState.initializationError;
}
export function getInitializationProgress() {
  return initState.initializationProgress;
}

// ============================================================================
// UI STATE
// ============================================================================

// UPDATED: Tab types to match desktop app exactly - including sequence_card tab
type TabId =
  | "construct"
  | "browse"
  | "sequence_card"
  | "write"
  | "learn"
  | "about"
  | "motion-tester"
  | "arrow-debug";

const uiState = $state({
  activeTab: "browse" as TabId, // Temporarily changed from construct to avoid About tab
  isFullScreen: false,
  showSettings: false,
  theme: "dark" as "light" | "dark",
  isTransitioning: false,
});

export function getActiveTab() {
  return uiState.activeTab;
}
export function getIsFullScreen() {
  return uiState.isFullScreen;
}
export function getShowSettings() {
  return uiState.showSettings;
}
export function getTheme() {
  return uiState.theme;
}
export function getIsTransitioning() {
  return uiState.isTransitioning;
}

// ============================================================================
// PERFORMANCE STATE
// ============================================================================

const perfState = $state({
  initializationTime: 0,
  lastRenderTime: 0,
  memoryUsage: 0,
});

export function getPerformanceMetrics() {
  return perfState;
}

// ============================================================================
// SETTINGS STATE
// ============================================================================

const SETTINGS_STORAGE_KEY = "tka-modern-web-settings";

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  gridMode: "diamond",
  showBeatNumbers: true,
  autoSave: true,
  exportQuality: "high",
  workbenchColumns: 5,
  developerMode: true, // Enable developer mode by default so all tabs are visible
  animationsEnabled: true,
  backgroundType: "nightSky",
  backgroundQuality: "medium",
  backgroundEnabled: true,
  // Add any other fields from the interface as needed
  visibility: {
    TKA: true,
    Reversals: true,
    Positions: true,
    Elemental: true,
    VTG: true,
    nonRadialPoints: true,
  },
} as AppSettings;

// Load settings from localStorage
function loadSettingsFromStorage(): AppSettings {
  if (!browser) return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!stored) {
      return DEFAULT_SETTINGS;
    }

    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new settings
    // Special handling: if developerMode is not explicitly set, use the new default
    const merged = { ...DEFAULT_SETTINGS, ...parsed };

    // Force developer mode to true if it was previously false or unset
    // This ensures all tabs are visible after the update
    if (merged.developerMode === false || merged.developerMode === undefined) {
      merged.developerMode = true;
      // Save the updated settings back to localStorage
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    }

    return merged;
  } catch (error) {
    console.warn("Failed to load settings from localStorage:", error);
    return DEFAULT_SETTINGS;
  }
}

// Save settings to localStorage
function saveSettingsToStorage(settings: AppSettings): void {
  if (!browser) return;

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("❌ Failed to save settings to localStorage:", error);
  }
}

const settingsState = $state<AppSettings>(loadSettingsFromStorage());

// Extend Window interface for debug functions
declare global {
  interface Window {
    enableDeveloperMode?: typeof enableDeveloperMode;
    resetSettingsToDefaults?: typeof resetSettingsToDefaults;
    debugSettings?: typeof debugSettings;
  }
}

// Make debug functions available globally in development
if (browser && typeof window !== "undefined") {
  window.enableDeveloperMode = enableDeveloperMode;
  window.resetSettingsToDefaults = resetSettingsToDefaults;
  window.debugSettings = debugSettings;
}

export function getSettings() {
  return settingsState;
}

// ============================================================================
// DERIVED STATE
// ============================================================================

export function getIsReady(): boolean {
  return (
    initState.isInitialized &&
    !initState.isInitializing &&
    !initState.initializationError
  );
}

export function getCanUseApp(): boolean {
  return getIsReady() && !uiState.showSettings;
}

export function getInitializationComplete(): boolean {
  return initState.initializationProgress >= 100;
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Set initialization state
 */
export function setInitializationState(
  initialized: boolean,
  initializing: boolean,
  error: string | null = null,
  progress: number = 0
): void {
  initState.isInitialized = initialized;
  initState.isInitializing = initializing;
  initState.initializationError = error;
  initState.initializationProgress = progress;
}

/**
 * Set initialization progress
 */
export function setInitializationProgress(progress: number): void {
  initState.initializationProgress = Math.max(0, Math.min(100, progress));
}

/**
 * Set initialization error
 */
export function setInitializationError(error: string | null): void {
  initState.initializationError = error;
  if (error) {
    initState.isInitializing = false;
  }
}

/**
 * Clear initialization error
 */
export function clearInitializationError(): void {
  initState.initializationError = null;
}

/**
 * Switch to a different tab - with transition feedback and state persistence
 */
export function switchTab(tab: TabId): void {
  const currentTab = uiState.activeTab;

  // Don't switch if already on the same tab
  if (currentTab === tab) {
    return;
  }

  // Save current tab state before switching
  saveCurrentTabState(currentTab);

  // Set transitioning state
  uiState.isTransitioning = true;

  // Switch tab immediately (transitions handled by components)
  uiState.activeTab = tab;

  // Save application tab state
  saveApplicationTabState(tab, currentTab);

  // Clear transitioning state after a short delay
  setTimeout(() => {
    uiState.isTransitioning = false;
  }, 600); // Allow time for transitions to complete
}

/**
 * Check if tab is active
 */
export function isTabActive(tab: string): boolean {
  return uiState.activeTab === tab;
}

/**
 * Toggle fullscreen
 */
export function toggleFullScreen(): void {
  uiState.isFullScreen = !uiState.isFullScreen;
}

/**
 * Set fullscreen state
 */
export function setFullScreen(fullscreen: boolean): void {
  uiState.isFullScreen = fullscreen;
}

/**
 * Show settings dialog
 */
export function showSettingsDialog(): void {
  uiState.showSettings = true;
}

/**
 * Hide settings dialog
 */
export function hideSettingsDialog(): void {
  uiState.showSettings = false;
}

/**
 * Toggle settings dialog
 */
export function toggleSettingsDialog(): void {
  uiState.showSettings = !uiState.showSettings;
}

/**
 * Set theme
 */
export function setTheme(newTheme: "light" | "dark"): void {
  uiState.theme = newTheme;
  settingsState.theme = newTheme;
  // Save to localStorage
  saveSettingsToStorage(settingsState);
}

/**
 * Update settings
 */
export function updateSettings(newSettings: Partial<AppSettings>): void {
  // Auto-configure background settings when backgroundType changes
  if (newSettings.backgroundType) {
    newSettings.backgroundEnabled = true; // Always enable backgrounds
    newSettings.backgroundQuality = "medium"; // Auto-manage quality
  }

  Object.assign(settingsState, newSettings);

  // Apply theme if changed
  if (newSettings.theme) {
    uiState.theme = newSettings.theme;
  }

  // Save to localStorage
  saveSettingsToStorage(settingsState);
}

/**
 * Set performance metrics
 */
export function setPerformanceMetrics(
  metrics: Partial<typeof perfState>
): void {
  Object.assign(perfState, metrics);
}

/**
 * Track render time
 */
export function trackRenderTime(
  componentName: string,
  renderTime: number
): void {
  perfState.lastRenderTime = renderTime;

  if (renderTime > 100) {
    console.warn(`Slow render detected for ${componentName}: ${renderTime}ms`);
  }
}

/**
 * Update memory usage
 */
export function updateMemoryUsage(): void {
  if (typeof performance !== "undefined" && "memory" in performance) {
    const memory = (performance as { memory: { usedJSHeapSize: number } })
      .memory;
    perfState.memoryUsage = Math.round(memory.usedJSHeapSize / 1048576);
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get complete application state snapshot
 */
export function getAppStateSnapshot() {
  return {
    isInitialized: initState.isInitialized,
    isInitializing: initState.isInitializing,
    initializationError: initState.initializationError,
    initializationProgress: initState.initializationProgress,
    activeTab: uiState.activeTab,
    isFullScreen: uiState.isFullScreen,
    showSettings: uiState.showSettings,
    theme: uiState.theme,
    performanceMetrics: { ...perfState },
    settings: { ...settingsState },
  };
}

/**
 * Reset application state
 */
export function resetAppState(): void {
  initState.isInitialized = false;
  initState.isInitializing = false;
  initState.initializationError = null;
  initState.initializationProgress = 0;
  uiState.activeTab = "construct";
  uiState.isFullScreen = false;
  uiState.showSettings = false;
  uiState.theme = "dark";
  Object.assign(perfState, {
    initializationTime: 0,
    lastRenderTime: 0,
    memoryUsage: 0,
  });
}

/**
 * Clear settings from localStorage (for debugging)
 */
export function clearStoredSettings(): void {
  if (!browser) return;

  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    // Reset to defaults
    Object.assign(settingsState, DEFAULT_SETTINGS);
    uiState.theme = DEFAULT_SETTINGS.theme;
  } catch (error) {
    console.error("❌ Failed to clear stored settings:", error);
  }
}

/**
 * Debug function to show current localStorage state
 */
export function debugSettings(): void {
  if (!browser) return;

  try {
    console.log("🔍 Debug Settings:", {
      stored: localStorage.getItem(SETTINGS_STORAGE_KEY),
      parsed: JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}"),
      current: settingsState,
      tabState: localStorage.getItem("tka-browse-app-tab-state"),
    });
  } catch (error) {
    console.error("❌ Error debugging settings:", error);
  }
}

/**
 * Force enable developer mode (for debugging)
 */
export function enableDeveloperMode(): void {
  if (!browser) return;

  settingsState.developerMode = true;
  saveSettingsToStorage(settingsState);
}

/**
 * Reset localStorage settings to defaults (for debugging)
 */
export function resetSettingsToDefaults(): void {
  if (!browser) return;

  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    Object.assign(settingsState, DEFAULT_SETTINGS);
    uiState.theme = DEFAULT_SETTINGS.theme;
  } catch (error) {
    console.error("❌ Error resetting settings:", error);
  }
}

// ============================================================================
// TAB STATE PERSISTENCE
// ============================================================================

/**
 * Save current tab state before switching
 */
async function saveCurrentTabState(currentTab: TabId): Promise<void> {
  if (!browser) return;

  try {
    // Save tab-specific state based on the current tab
    switch (currentTab) {
      case "browse":
        // Browse tab state is handled by BrowseTabStateManager
        break;

      case "construct":
        // TODO: Save construct tab state (active panels, current sequence, etc.)
        break;

      case "motion-tester":
        // TODO: Save motion tester state (current settings, animation state, etc.)
        break;

      case "arrow-debug":
        // TODO: Save arrow debug state
        break;

      case "sequence_card":
        // TODO: Save sequence card state
        break;

      case "write":
        // TODO: Save write tab state (current act, unsaved changes, etc.)
        break;

      case "learn":
        // TODO: Save learn tab state
        break;

      case "about":
        // About tab probably doesn't need state persistence
        break;

      default:
        // No specific state saving for unhandled tabs
        break;
    }
  } catch (error) {
    console.error(`❌ Failed to save state for tab ${currentTab}:`, error);
  }
}

/**
 * Save application-level tab state
 */
async function saveApplicationTabState(
  newTab: TabId,
  previousTab: TabId
): Promise<void> {
  if (!browser) return;

  try {
    const tabState = {
      activeTab: newTab,
      lastActiveTab: previousTab,
      tabStates: {}, // Will be populated with individual tab states
      lastUpdated: new Date(),
    };

    await browseStatePersistence.saveApplicationTabState(tabState);
  } catch (error) {
    console.error("❌ Failed to save application tab state:", error);
  }
}

/**
 * Load and restore application tab state on startup
 */
export async function restoreApplicationState(): Promise<void> {
  if (!browser) return;

  try {
    const tabState = await browseStatePersistence.loadApplicationTabState();

    if (tabState && tabState.activeTab) {
      // TEMPORARILY DISABLED: Don't restore About tab to avoid Svelte error
      if (tabState.activeTab === "about") {
        uiState.activeTab = "browse"; // Use Browse instead
        return;
      }

      // Check if the saved tab is a developer tab
      const developerTabs = [
        "sequence_card",
        "write",
        "motion-tester",
        "arrow-debug",
      ];
      const isDevTab = developerTabs.includes(tabState.activeTab);

      // If it's a developer tab but developer mode is disabled, use a main tab instead
      if (isDevTab && !settingsState.developerMode) {
        uiState.activeTab = "browse"; // Use Browse as default instead
        return;
      }

      // Restore the last active tab
      uiState.activeTab = tabState.activeTab as TabId;
    }
  } catch (error) {
    console.error("❌ Failed to restore application state:", error);
  }
}

/**
 * Get the browse state persistence service for use by Browse tab components
 */
export function getBrowseStatePersistence(): BrowseStatePersistenceService {
  return browseStatePersistence;
}
