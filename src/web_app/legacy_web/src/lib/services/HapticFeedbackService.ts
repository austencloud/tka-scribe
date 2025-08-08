/**
 * Haptic Feedback Service
 *
 * Provides tactile feedback for user interactions.
 * This is a minimal implementation that provides the interface needed by the legacy web app.
 */

export type HapticFeedbackType =
  | 'navigation'
  | 'success'
  | 'selection'
  | 'warning'
  | 'error';

/**
 * Simple haptic feedback service implementation
 */
class HapticFeedbackService {
  private isSupported: boolean;
  private isEnabled: boolean = true;

  constructor() {
    // Check if haptic feedback is supported (only in browser)
    this.isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  /**
   * Trigger haptic feedback based on the interaction type
   */
  public trigger(type: HapticFeedbackType): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    try {
      switch (type) {
        case 'navigation':
          this.vibrate(10);
          break;
        case 'success':
          this.vibrate([50, 50, 100]);
          break;
        case 'selection':
          this.vibrate(25);
          break;
        case 'warning':
          this.vibrate([100, 50, 100]);
          break;
        case 'error':
          this.vibrate([200, 100, 200]);
          break;
        default:
          this.vibrate(25);
      }
    } catch (error) {
      // Silently fail if vibration is not supported
      console.debug('Haptic feedback not available:', error);
    }
  }

  /**
   * Vibrate the device with the specified pattern
   */
  private vibrate(pattern: number | number[]): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Enable haptic feedback
   */
  public enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable haptic feedback
   */
  public disable(): void {
    this.isEnabled = false;
  }

  /**
   * Check if haptic feedback is currently enabled
   */
  public isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Check if the device supports haptic feedback
   */
  public isHapticSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if haptic feedback is available (alias for isHapticSupported)
   */
  public isAvailable(): boolean {
    return this.isSupported && this.isEnabled;
  }

  /**
   * Check if haptic feedback is supported (alias for isHapticSupported)
   */
  public isHapticFeedbackSupported(): boolean {
    return this.isSupported;
  }
}

// Create and export a singleton instance
const hapticFeedbackService = new HapticFeedbackService();
export default hapticFeedbackService;
