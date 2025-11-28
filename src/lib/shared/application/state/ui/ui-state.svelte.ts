import type { SequenceData } from "../../../foundation/domain/models/SequenceData";
import type { TabId } from "../../../navigation/domain/types";
import type { IDiscoverThumbnailService } from "../../../../modules/discover/gallery/display";

// Centralized UI state leveraging Svelte 5 runes.
// Uses TabId (which includes both ModuleId and LegacyTabId) for backwards compatibility
export const uiState = $state({
  activeModule: null as TabId | null, // Start null - will be set after services load in initializeModulePersistence()
  showSettings: false,
  // Default to "desktop" mode - mobile will override this when navigation buttons are clicked
  // Desktop is the primary/default experience (769px+)
  settingsPanelMode: (typeof window !== "undefined" && window.innerWidth >= 769
    ? "desktop"
    : "mobile") as "mobile" | "desktop",
  isFullScreen: false,
  isTransitioning: false,
  isWaitingForModuleLoad: false,
  showSpotlight: false,
  spotlightSequence: null as SequenceData | null,
  spotlightThumbnailService: null as IDiscoverThumbnailService | null,
  showDebugPanel: false, // Admin-only debug console
});

// ============================================================================
// MODULE STATE (Primary API)
// ============================================================================

export function getActiveModule(): TabId | null {
  return uiState.activeModule;
}

export function getActiveModuleOrDefault(): TabId {
  return uiState.activeModule || "create";
}

export function setActiveModule(module: TabId | null): void {
  uiState.activeModule = module;
}

export function isModuleActive(module: string): boolean {
  return uiState.activeModule === module;
}

// ============================================================================
// LEGACY TAB API (for backwards compatibility)
// @deprecated Use module functions instead
// ============================================================================

/** @deprecated Use getActiveModule() instead */
export function getActiveTab(): TabId | null {
  return getActiveModule();
}

/** @deprecated Use getActiveModuleOrDefault() instead */
export function getActiveTabOrDefault(): TabId {
  return getActiveModuleOrDefault();
}

/** @deprecated Use setActiveModule() instead */
export function setActiveTab(module: TabId | null): void {
  setActiveModule(module);
}

/** @deprecated Use isModuleActive() instead */
export function isTabActive(module: string): boolean {
  return isModuleActive(module);
}

// ============================================================================
// SETTINGS STATE
// ============================================================================

export function getShowSettings(): boolean {
  return uiState.showSettings;
}

export function getSettingsPanelMode(): "mobile" | "desktop" {
  return uiState.settingsPanelMode;
}

export function setShowSettings(show: boolean): void {
  uiState.showSettings = show;
}

export function setSettingsPanelMode(mode: "mobile" | "desktop"): void {
  uiState.settingsPanelMode = mode;
}

export function toggleShowSettings(): void {
  uiState.showSettings = !uiState.showSettings;
}

export function showSettingsDialog(mode?: "mobile" | "desktop"): void {
  if (mode) {
    setSettingsPanelMode(mode);
  }
  setShowSettings(true);
}

export function hideSettingsDialog(): void {
  setShowSettings(false);
}

export function toggleSettingsDialog(mode?: "mobile" | "desktop"): void {
  if (mode) {
    setSettingsPanelMode(mode);
  }
  toggleShowSettings();
}

// ============================================================================
// FULLSCREEN STATE
// ============================================================================

export function getIsFullScreen(): boolean {
  return uiState.isFullScreen;
}

export function setFullScreen(fullScreen: boolean): void {
  uiState.isFullScreen = fullScreen;
}

// ============================================================================
// TRANSITION STATE
// ============================================================================

export function getIsTransitioning(): boolean {
  return uiState.isTransitioning;
}

export function setIsTransitioning(isTransitioning: boolean): void {
  uiState.isTransitioning = isTransitioning;
}

// ============================================================================
// MODULE LOADING STATE
// ============================================================================

export function getIsWaitingForModuleLoad(): boolean {
  return uiState.isWaitingForModuleLoad;
}

export function setIsWaitingForModuleLoad(waiting: boolean): void {
  uiState.isWaitingForModuleLoad = waiting;
}

/** @deprecated Use getIsWaitingForModuleLoad() instead */
export function getIsWaitingForTabLoad(): boolean {
  return getIsWaitingForModuleLoad();
}

/** @deprecated Use setIsWaitingForModuleLoad() instead */
export function setIsWaitingForTabLoad(waiting: boolean): void {
  setIsWaitingForModuleLoad(waiting);
}

// ============================================================================
// SPOTLIGHT STATE
// ============================================================================

export function getShowSpotlight(): boolean {
  return uiState.showSpotlight;
}

export function getSpotlightSequence(): SequenceData | null {
  return uiState.spotlightSequence;
}

export function getSpotlightThumbnailService(): IDiscoverThumbnailService | null {
  return uiState.spotlightThumbnailService;
}

export function openSpotlightViewer(
  sequence: SequenceData,
  thumbnailService: IDiscoverThumbnailService
): void {
  uiState.spotlightSequence = sequence;
  uiState.spotlightThumbnailService = thumbnailService;
  uiState.showSpotlight = true;
}

export function closeSpotlightViewer(): void {
  uiState.showSpotlight = false;
  uiState.spotlightSequence = null;
  uiState.spotlightThumbnailService = null;
}

// ============================================================================
// DEBUG PANEL STATE (Admin Only)
// ============================================================================

export function getShowDebugPanel(): boolean {
  return uiState.showDebugPanel;
}

export function setShowDebugPanel(show: boolean): void {
  uiState.showDebugPanel = show;
}

export function toggleDebugPanel(): void {
  uiState.showDebugPanel = !uiState.showDebugPanel;
}

export function openDebugPanel(): void {
  uiState.showDebugPanel = true;
}

export function closeDebugPanel(): void {
  uiState.showDebugPanel = false;
}

// ============================================================================
// RESET STATE
// ============================================================================

export function resetUIState(): void {
  uiState.activeModule = "create";
  uiState.showSettings = false;
  uiState.isFullScreen = false;
  uiState.isTransitioning = false;
  uiState.isWaitingForModuleLoad = false;
  uiState.showSpotlight = false;
  uiState.spotlightSequence = null;
  uiState.spotlightThumbnailService = null;
  uiState.showDebugPanel = false;
}
