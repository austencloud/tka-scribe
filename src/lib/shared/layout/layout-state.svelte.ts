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
  // PrimaryNavigation height - measured dynamically by PrimaryNavigation component
  primaryNavHeight: 64, // Default fallback

  // Navigation layout state - updated by PrimaryNavigation
  isPrimaryNavLandscape: false,

  // Panel accessibility state - updated by Create Module
  // Note: Edit and Export are panels, not tabs
  canAccessEditAndExportPanels: false,

  // Current word state - updated by Create Module
  currentCreateWord: "",

  // Current learn header - updated by LearnTab
  currentLearnHeader: "",
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

// Helper to check if module needs primary navigation
// Dashboard is the meta/launcher layer - no nav bar needed
// Modules are the app layer - they have nav bar with Home button to return
export function moduleHasPrimaryNav(moduleId: string): boolean {
  return (
    moduleId === "create" ||    // Assembler, Constructor, Generator tabs
    moduleId === "discover" ||  // Gallery, Collections, Creators, Library tabs
    moduleId === "learn" ||     // Concepts, Play, Codex tabs
    moduleId === "compose" ||   // Compose, Playback, Browse tabs
    moduleId === "train" ||     // Challenges, Sessions tabs
    moduleId === "feedback" ||  // Submit, Manage tabs
    moduleId === "admin"        // Various admin tabs
  );
}
