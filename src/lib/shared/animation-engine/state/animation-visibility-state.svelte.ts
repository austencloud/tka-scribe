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
export type PlaybackMode = "continuous" | "step";

interface AnimationVisibilitySettings {
  // Animation-specific elements (no pictograph equivalent)
  gridMode: GridMode; // Grid visualization mode (3-state)
  beatNumbers: boolean; // "Beat 1, 2, 3..." overlay at top-left
  props: boolean; // Show props vs trails-only mode
  trailStyle: TrailStyle; // Trail visualization style (3-state)
  playbackMode: PlaybackMode; // Continuous flow vs step-by-step
  speed: number; // Speed multiplier (1.0 = 60 BPM, range 0.1-3.0)

  // Global Effects (applies to pictograph, animation, and image export)
  // Lights Off: dark background, inverted grid, white text/outlines
  // Prop glow is automatically enabled for animations when lightsOff is true
  lightsOff: boolean;

  // Legacy property - kept for migration only, do not use
  ledMode?: boolean;

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
    this.settings = this.loadFromStorage() || this.getDefaultSettings();
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): AnimationVisibilitySettings {
    return {
      // Animation-specific defaults
      gridMode: "diamond", // Default to diamond grid
      beatNumbers: true,
      props: true,
      trailStyle: "subtle", // Default to subtle trails
      playbackMode: "continuous", // Default to continuous playback
      speed: 1.0, // Default to 60 BPM

      // Global effects
      lightsOff: false, // Lights off mode disabled by default

      // Shared elements - defaults optimized for animation viewing
      tkaGlyph: true,
      reversalIndicators: false, // Less clutter during animation
      turnNumbers: true,
      blueMotion: true,
      redMotion: true,
    };
  }

  /**
   * Load settings from localStorage with migration support
   */
  private loadFromStorage(): AnimationVisibilitySettings | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Migration: convert old ledMode to lightsOff
        if (parsed.ledMode !== undefined && parsed.lightsOff === undefined) {
          parsed.lightsOff = parsed.ledMode;
          delete parsed.ledMode;
          // Save migrated settings
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }

        // Clean up old propGlow setting if present
        if (parsed.propGlow !== undefined) {
          delete parsed.propGlow;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }

        // Ensure new properties exist with defaults if missing
        const defaults = this.getDefaultSettings();
        return {
          ...defaults,
          ...parsed,
        };
      }
    } catch (err) {
      console.warn(
        "Failed to load animation visibility from localStorage:",
        err
      );
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
    console.log(`[AnimationVisibilityManager] Notifying ${this.observers.size} observers`);
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
   * (For gridMode, trailStyle, playbackMode, speed use dedicated getters)
   * (For ledMode, use isLightsOff() instead)
   */
  getVisibility(
    key: Exclude<keyof AnimationVisibilitySettings, "gridMode" | "trailStyle" | "playbackMode" | "speed" | "ledMode">
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
   * (For gridMode, trailStyle, playbackMode, speed use dedicated setters)
   */
  setVisibility(
    key: Exclude<keyof AnimationVisibilitySettings, "gridMode" | "trailStyle" | "playbackMode" | "speed">,
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
    this.settings = this.getDefaultSettings();
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

  /**
   * Get current playback mode
   */
  getPlaybackMode(): PlaybackMode {
    return this.settings.playbackMode;
  }

  /**
   * Set playback mode
   */
  setPlaybackMode(mode: PlaybackMode): void {
    this.settings.playbackMode = mode;
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Get current speed (multiplier where 1.0 = 60 BPM)
   */
  getSpeed(): number {
    return this.settings.speed;
  }

  /**
   * Get current BPM (speed * 60)
   */
  getBpm(): number {
    return Math.round(this.settings.speed * 60);
  }

  /**
   * Set speed (multiplier where 1.0 = 60 BPM)
   */
  setSpeed(speed: number): void {
    this.settings.speed = Math.max(0.1, Math.min(3.0, speed));
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Set speed from BPM value
   */
  setBpm(bpm: number): void {
    this.setSpeed(bpm / 60);
  }

  // ============================================================================
  // GLOBAL EFFECTS: LIGHTS OFF + PROP GLOW
  // ============================================================================

  /**
   * Check if Lights Off mode is enabled
   * When enabled: dark background, inverted grid colors, white text/outlines
   */
  isLightsOff(): boolean {
    return this.settings.lightsOff;
  }

  /**
   * Set Lights Off mode
   * Controls: dark background, inverted grid, white text/outlines
   */
  setLightsOff(enabled: boolean): void {
    this.settings.lightsOff = enabled;
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * Toggle Lights Off mode
   */
  toggleLightsOff(): void {
    this.setLightsOff(!this.settings.lightsOff);
  }

  // ============================================================================
  // LEGACY COMPATIBILITY (for gradual migration)
  // ============================================================================

  /**
   * @deprecated Use isLightsOff() instead
   * Kept for backward compatibility - returns lightsOff status
   */
  isLedMode(): boolean {
    return this.settings.lightsOff;
  }

  /**
   * @deprecated Use setLightsOff() instead
   * Kept for backward compatibility - sets lightsOff
   */
  setLedMode(enabled: boolean): void {
    this.settings.lightsOff = enabled;
    this.saveToStorage();
    this.notifyObservers();
  }

  /**
   * @deprecated Use toggleLightsOff() instead
   */
  toggleLedMode(): void {
    this.setLedMode(!this.settings.lightsOff);
  }
}

// Global singleton instance
let globalAnimationVisibilityManager: AnimationVisibilityStateManager | null =
  null;

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
