/**
 * Haptic Feedback Service Implementation
 *
 * Provides haptic feedback capabilities for mobile devices with proper
 * accessibility considerations, browser compatibility, and performance optimization.
 */

import { injectable } from "inversify";

import { browser } from "$app/environment";
import type {
  HapticFeedbackConfig,
  HapticFeedbackType,
  IHapticFeedbackService,
} from "$shared";

// Feedback patterns (in milliseconds)
const FEEDBACK_PATTERNS: Record<
  Exclude<HapticFeedbackType, "custom">,
  number[]
> = {
  selection: [70], // Standard haptic for all interactive elements
  success: [100, 30, 50], // Triple pulse for successful actions
  warning: [60, 0, 60], // Double tap for warnings
  error: [100, 0, 100, 0, 100], // Triple tap for errors
};

// Default configuration
const DEFAULT_CONFIG: HapticFeedbackConfig = {
  enabled: true,
  respectReducedMotion: true,
  throttleTime: 100,
  customPatterns: {},
};

@injectable()
export class HapticFeedbackService implements IHapticFeedbackService {
  private lastFeedbackTime: number = 0;
  private config: HapticFeedbackConfig = { ...DEFAULT_CONFIG };
  private deviceSupportsVibration: boolean = false;

  constructor() {
    this.initializeService();
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  public trigger(type: HapticFeedbackType = "selection"): boolean {
    if (!this.canTriggerFeedback()) {
      return false;
    }

    // Get the pattern based on the type
    const pattern =
      type === "custom"
        ? [] // Custom patterns are handled via triggerCustom
        : FEEDBACK_PATTERNS[type];

    return this.vibrate(pattern);
  }

  public setCustomPattern(name: string, pattern: number[]): void {
    this.config.customPatterns[name] = [...pattern];
  }

  public triggerCustom(name: string): boolean {
    if (!this.canTriggerFeedback()) {
      return false;
    }

    const pattern = this.config.customPatterns[name];
    if (!pattern) {
      console.warn(`Custom haptic pattern '${name}' not found`);
      return false;
    }

    return this.vibrate(pattern);
  }

  public isSupported(): boolean {
    return this.deviceSupportsVibration;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public getConfig(): HapticFeedbackConfig {
    return { ...this.config };
  }

  public updateConfig(config: Partial<HapticFeedbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeService(): void {
    this.detectBrowserSupport();
    this.setupReducedMotionListener();
  }

  /**
   * Detect if the device supports haptic feedback
   */
  private detectBrowserSupport(): void {
    if (!browser) {
      this.deviceSupportsVibration = false;
      return;
    }

    try {
      this.deviceSupportsVibration =
        "vibrate" in navigator ||
        "mozVibrate" in navigator ||
        "webkitVibrate" in navigator;
    } catch (error) {
      console.warn("Error detecting haptic feedback support:", error);
      this.deviceSupportsVibration = false;
    }
  }

  /**
   * Setup listener for reduced motion preference changes
   */
  private setupReducedMotionListener(): void {
    if (!browser || !window.matchMedia) {
      return;
    }

    try {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      // Check initial state
      this.handleReducedMotionChange(mediaQuery);

      // Listen for changes
      const handler = (event: MediaQueryListEvent) => {
        this.handleReducedMotionChange(event);
      };
      mediaQuery.addEventListener("change", handler);
    } catch (error) {
      console.warn("Could not set up reduced motion listener:", error);
    }
  }

  /**
   * Handle changes to reduced motion preference
   */
  private handleReducedMotionChange(
    mediaQuery: MediaQueryList | MediaQueryListEvent
  ): void {
    if (!this.config.respectReducedMotion) {
      return;
    }

    // Disable haptic feedback if user prefers reduced motion
    if (mediaQuery.matches) {
      this.config.enabled = false;
    }
  }

  /**
   * Check if feedback can be triggered (all conditions met)
   */
  private canTriggerFeedback(): boolean {
    // Skip if not in browser environment
    if (!browser) {
      return false;
    }

    // Skip if not supported
    if (!this.deviceSupportsVibration) {
      return false;
    }

    // Skip if disabled
    if (!this.config.enabled) {
      return false;
    }

    // Check throttling
    const now = Date.now();
    if (now - this.lastFeedbackTime < this.config.throttleTime) {
      return false;
    }

    return true;
  }

  /**
   * Execute the vibration with error handling
   */
  private vibrate(pattern: number[]): boolean {
    try {
      // Update throttle time
      this.lastFeedbackTime = Date.now();

      // Trigger vibration
      navigator.vibrate(pattern);

      return true;
    } catch (error) {
      console.warn("Haptic feedback failed:", error);
      return false;
    }
  }
}
