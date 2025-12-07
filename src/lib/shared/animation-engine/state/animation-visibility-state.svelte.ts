/**
 * Animation Visibility State Manager
 *
 * Manages visibility settings specifically for animation playback.
 * Independent from pictograph visibility but can sync from it.
 */

type VisibilityObserver = () => void;

interface AnimationVisibilitySettings {
  // Animation-specific elements (no pictograph equivalent)
  grid: boolean;
  beatNumbers: boolean; // "Beat 1, 2, 3..." overlay at top-left
  props: boolean; // Show props vs trails-only mode
  trails: boolean; // Show trails

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
      grid: true,
      beatNumbers: true,
      props: true,
      trails: true,

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
   * Get specific visibility setting
   */
  getVisibility(key: keyof AnimationVisibilitySettings): boolean {
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
   * Set specific visibility setting
   */
  setVisibility(key: keyof AnimationVisibilitySettings, visible: boolean): void {
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
      grid: true,
      beatNumbers: true,
      props: true,
      trails: true,
      tkaGlyph: true,
      reversalIndicators: false,
      turnNumbers: true,
      blueMotion: true,
      redMotion: true,
    };
    this.saveToStorage();
    this.notifyObservers();
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
