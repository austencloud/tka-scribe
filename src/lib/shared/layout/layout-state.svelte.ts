/**
 * LayoutState
 * Domain: Application Layout State
 *
 * Responsibilities:
 * - Manage layout measurements (heights, widths)
 * - Track layout orientations (landscape/portrait)
 * - Provide layout state to components
 */

// Reactive state object using Svelte 5 $state rune
export const layoutState = $state({
  // MobileNavigation height - measured dynamically by MobileNavigation component
  primaryNavHeight: 64, // Default fallback

  // Navigation layout state - updated by MobileNavigation
  isPrimaryNavLandscape: false,

  // Panel accessibility state - updated by Create Module
  // Note: Edit and Export are panels, not tabs
  canAccessEditAndExportPanels: false,

  // Current word state - updated by Create Module
  currentCreateWord: "",

  // Current learn header - updated by LearnTab
  currentLearnHeader: "",

  // Side-by-side layout detection - true when viewport is wide enough for desktop layout
  // Updated by MainInterface component based on container width
  isSideBySideLayout: false,
});

// Helper functions
export function setPrimaryNavHeight(height: number) {
  layoutState.primaryNavHeight = height;
}

export function setPrimaryNavLandscape(isLandscape: boolean) {
  layoutState.isPrimaryNavLandscape = isLandscape;
}

export function setTabAccessibility(canAccess: boolean) {
  layoutState.canAccessEditAndExportPanels = canAccess;
}

export function setCurrentWord(word: string) {
  layoutState.currentCreateWord = word;
}

export function setLearnHeader(header: string) {
  layoutState.currentLearnHeader = header;
}

export function setSideBySideLayout(isSideBySide: boolean) {
  layoutState.isSideBySideLayout = isSideBySide;
}

// Helper to check if module needs primary navigation
// All modules show nav bar on mobile for module switcher access
export function moduleHasPrimaryNav(moduleId: string): boolean {
  return (
    moduleId === "dashboard" || // Community hub - needs nav for module switcher
    moduleId === "create" || // Assembler, Constructor, Generator tabs
    moduleId === "discover" || // Gallery, Creators tabs
    moduleId === "learn" || // Concepts, Play, Codex tabs
    moduleId === "compose" || // Compose, Playback, Browse tabs
    moduleId === "train" || // Challenges, Sessions tabs
    moduleId === "library" || // Sequences, Collections, Compositions tabs
    moduleId === "inbox" || // Messages, Notifications tabs
    moduleId === "feedback" || // Submit, Manage tabs
    moduleId === "ml-training" || // ML Training - no tabs, full page
    moduleId === "admin" || // Various admin tabs
    moduleId === "settings" || // No tabs, but needs nav bar for module switcher on mobile
    moduleId === "3d-viewer" || // 3D Viewer - needs nav bar for module switcher on mobile
    moduleId === "premium" // Premium - needs nav bar for module switcher on mobile
  );
}
