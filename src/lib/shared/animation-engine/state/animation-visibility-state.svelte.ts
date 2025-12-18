/**
 * Animation Visibility State Manager
 *
 * Manages visibility settings specifically for animation playback.
 * Independent from pictograph visibility but can sync from it.
 */

type VisibilityObserver = () => void;

// 3-state enums for multi-option settings
export type TrailStyle = "off" | "subtle" | "vivid";
export type GridMode = "none" | "diamond" | "box";

interface AnimationVisibilitySettings {
  // Animation-specific elements (no pictograph equivalent)
  gridMode: GridMode; // Grid visualization mode (3-state)
  beatNumbers: boolean; // "Beat 1, 2, 3..." overlay at top-left
  props: boolean; // Show props vs trails-only mode
  trailStyle: TrailStyle; // Trail visualization style (3-state)

  // Shared with pictograph visibility (can sync)
  tkaGlyph: boolean;
  reversalIndicators: boolean;
  turnNumbers: boolean;
  blueMotion: boolean;
  redMotion: boolean;
}

const STORAGE_KEY = "animation-visibility-settings";

export class AnimationVisibilityStateManager {
  private settings: AnimationVisibilitySettings;
  private observers: Set<VisibilityObserver> = new Set();

  constructor() {
    // Load from localStorage or use defaults
    this.settings = this.loadFromStorage() || {
      // Animation-specific defaults
      gridMode: "diamond", // Default to diamond grid
      beatNumbers: true,
      props: true,
      trailStyle: "subtle", // Default to subtle trails

      // Shared elements - defaults optimized for animation viewing
      tkaGlyph: true,
      reversalIndicators: false, // Less clutter during animation
      turnNumbers: true,
      blueMotion: true,
      redMotion: true,
    };
  }

  /**
   * Load settings from localStorage
   */
  private loadFromStorage(): AnimationVisibilitySettings | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as AnimationVisibilitySettings;
      }
    } catch (err) {
      console.warn("Failed to load animation visibility from localStorage:", err);
    }
    return null;
  }

  /**
   * Save settings to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch (err) {
      console.warn("Failed to save animation visibility to localStorage:", err);
    }
  }

  /**
   * Register an observer for visibility changes
   */
  registerObserver(callback: VisibilityObserver): void {
    this.observers.add(callback);
  }

  /**
   * Unregister an observer
   */
  unregisterObserver(callback: VisibilityObserver): void {
    this.observers.delete(callback);
  }

  /**
   * Notify observers of changes
   */
  private notifyObservers(): void {
    this.observers.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Error in animation visibility observer:", error);
      }
    });
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  /**
   * Get specific boolean visibility setting
   * (For gridMode and trailStyle, use getGridMode() and getTrailStyle())
   */
  getVisibility(
    key: Exclude<keyof AnimationVisibilitySettings, "gridMode" | "trailStyle">
  ): boolean {
    return this.settings[key];
  }

  /**
   * Get all settings
   */
  getSettings(): AnimationVisibilitySettings {
    return { ...this.settings };
  }

  // ============================================================================
  // SETTERS
  // ============================================================================

  /**
   * Set specific boolean visibility setting
   * (For gridMode and trailStyle, use setGridMode() and setTrailStyle())
   */
  setVisibility(
    key: Exclude<keyof AnimationVisibilitySettings, "gridMode" | "trailStyle">,
    visible: boolean
  ): void {
    this.settings[key] = visible;
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Update multiple settings at once
   */
  updateSettings(updates: Partial<AnimationVisibilitySettings>): void {
    Object.assign(this.settings, updates);
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Sync shared settings from pictograph visibility
   * (Only syncs keys that exist in both systems)
   */
  syncFromPictographVisibility(pictographSettings: {
    tkaGlyph: boolean;
    reversalIndicators: boolean;
    turnNumbers: boolean;
    blueMotion: boolean;
    redMotion: boolean;
  }): void {
    this.settings.tkaGlyph = pictographSettings.tkaGlyph;
    this.settings.reversalIndicators = pictographSettings.reversalIndicators;
    this.settings.turnNumbers = pictographSettings.turnNumbers;
    this.settings.blueMotion = pictographSettings.blueMotion;
    this.settings.redMotion = pictographSettings.redMotion;

    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.settings = {
      gridMode: "diamond",
      beatNumbers: true,
      props: true,
      trailStyle: "subtle",
      tkaGlyph: true,
      reversalIndicators: false,
      turnNumbers: true,
      blueMotion: true,
      redMotion: true,
    };
    this.saveToStorage();
    this.notifyObservers();
  }

  // ============================================================================
  // SPECIFIC GETTERS/SETTERS FOR 3-STATE SETTINGS
  // ============================================================================

  /**
   * Get current trail style
   */
  getTrailStyle(): TrailStyle {
    return this.settings.trailStyle;
  }

  /**
   * Set trail style
   */
  setTrailStyle(style: TrailStyle): void {
    this.settings.trailStyle = style;
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Get current grid mode
   */
  getGridMode(): GridMode {
    return this.settings.gridMode;
  }

  /**
   * Set grid mode
   */
  setGridMode(mode: GridMode): void {
    this.settings.gridMode = mode;
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Check if trails are visible (any style except 'off')
   */
  isTrailsVisible(): boolean {
    return this.settings.trailStyle !== "off";
  }

  /**
   * Check if grid is visible (any mode except 'none')
   */
  isGridVisible(): boolean {
    return this.settings.gridMode !== "none";
  }
}

// Global singleton instance
let globalAnimationVisibilityManager: AnimationVisibilityStateManager | null = null;

/**
 * Get or create the global animation visibility state manager
 */
export function getAnimationVisibilityManager(): AnimationVisibilityStateManager {
  if (!globalAnimationVisibilityManager) {
    globalAnimationVisibilityManager = new AnimationVisibilityStateManager();
  }
  return globalAnimationVisibilityManager;
}

/**
 * Reset the global animation visibility manager (useful for testing)
 */
export function resetAnimationVisibilityManager(): void {
  globalAnimationVisibilityManager = null;
}
