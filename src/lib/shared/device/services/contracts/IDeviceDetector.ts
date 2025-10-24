/**
 * Device Detector Interface
 *
 * Detects device capabilities and characteristics.
 */

import type { DeviceType } from "$shared";
import type {
  DeviceCapabilities,
  ResponsiveSettings,
} from "../../domain/models/device-models";

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
   * Check if device is in landscape mobile mode
   * (mobile device held sideways with wide aspect ratio)
   */
  isLandscapeMobile(): boolean;

  /**
   * Check if device is in portrait mobile mode
   * (mobile device held upright with narrow width)
   */
  isPortraitMobile(): boolean;

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

  /**
   * Get comprehensive device capabilities
   */
  getCapabilities(): DeviceCapabilities;

  /**
   * Get navigation layout immediately without caching
   * This ensures navigation layout responds instantly to viewport changes
   */
  getNavigationLayoutImmediate(): "top" | "left";

  /**
   * Get responsive design settings based on device
   */
  getResponsiveSettings(): ResponsiveSettings;

  /**
   * Register callback for device capability changes
   */
  onCapabilitiesChanged(
    callback: (caps: DeviceCapabilities) => void
  ): () => void;
}
