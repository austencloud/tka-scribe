/**
 * Device Detection Interfaces
 *
 * Core interfaces for device capability detection.
 */

export interface DeviceFeatureCapabilities {
  touch: boolean;
  mouse: boolean;
  keyboard: boolean;
  orientation: boolean;
  vibration: boolean;
  geolocation: boolean;
}

export interface ScreenMetrics {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  pixelRatio: number;
  orientation: "portrait" | "landscape";
}

export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop" | "unknown";
  platform: string;
  userAgent: string;
  capabilities: DeviceFeatureCapabilities;
  screenMetrics: ScreenMetrics;
  isFoldable: boolean;
}
