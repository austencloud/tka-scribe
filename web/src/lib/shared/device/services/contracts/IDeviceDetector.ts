/**
 * Device Detector Interface
 *
 * Detects device capabilities and characteristics.
 */

import type { DeviceType } from "$shared";

export interface IDeviceDetector {
  /**
   * Detect the current device type
   */
  detectDeviceType(): DeviceType;

  /**
   * Check if device supports touch input
   */
  isTouchDevice(): boolean;

  /**
   * Check if device is mobile
   */
  isMobile(): boolean;

  /**
   * Check if device is tablet
   */
  isTablet(): boolean;

  /**
   * Check if device is desktop
   */
  isDesktop(): boolean;

  /**
   * Get device screen information
   */
  getScreenInfo(): {
    width: number;
    height: number;
    pixelRatio: number;
  };

  /**
   * Check if device supports foldable features
   */
  supportsFoldable(): boolean;
}
