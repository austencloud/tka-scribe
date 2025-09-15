/**
 * Haptic Feedback Service
 * 
 * Provides haptic feedback functionality for mobile devices
 */

import { browser } from "$app/environment";

export type HapticFeedbackType = "selection" | "success" | "warning" | "error" | "navigation";

export interface HapticPattern {
  duration: number;
  intensity?: number;
}

/**
 * Haptic Feedback Service Implementation
 */
class HapticFeedbackService {
  private isSupported: boolean = false;
  private isEnabled: boolean = true;

  constructor() {
    if (browser) {
      this.checkSupport();
    }
  }

  /**
   * Check if haptic feedback is supported on this device
   */
  private checkSupport(): void {
    this.isSupported = 
      'vibrate' in navigator || 
      'mozVibrate' in navigator || 
      'webkitVibrate' in navigator;
  }

  /**
   * Check if haptic feedback is supported
   */
  isHapticFeedbackSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if haptic feedback is available (supported and enabled)
   */
  isAvailable(): boolean {
    return this.isSupported && this.isEnabled;
  }

  /**
   * Enable or disable haptic feedback
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Trigger haptic feedback with the specified type
   */
  trigger(type: HapticFeedbackType): void {
    if (!this.isAvailable() || !browser) {
      return;
    }

    const pattern = this.getPatternForType(type);
    this.vibrate(pattern);
  }

  /**
   * Get vibration pattern for feedback type
   */
  private getPatternForType(type: HapticFeedbackType): number | number[] {
    switch (type) {
      case "selection":
        return 10; // Short, light tap
      case "success":
        return [50, 50, 100]; // Double tap with emphasis
      case "warning":
        return [100, 50, 100, 50, 100]; // Triple tap pattern
      case "error":
        return [200, 100, 200]; // Strong double tap
      case "navigation":
        return 25; // Medium tap
      default:
        return 10; // Default light tap
    }
  }

  /**
   * Perform vibration with fallback for different browsers
   */
  private vibrate(pattern: number | number[]): void {
    try {
      if (navigator.vibrate) {
        navigator.vibrate(pattern);
      } else if ((navigator as any).mozVibrate) {
        (navigator as any).mozVibrate(pattern);
      } else if ((navigator as any).webkitVibrate) {
        (navigator as any).webkitVibrate(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Test haptic feedback with a custom pattern
   */
  testPattern(pattern: number | number[]): void {
    if (this.isAvailable()) {
      this.vibrate(pattern);
    }
  }
}

// Create and export singleton instance
const hapticFeedbackService = new HapticFeedbackService();
export default hapticFeedbackService;