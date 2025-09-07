/**
 * Basic Device Types
 * 
 * Simple device type definitions.
 */

export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export const DEVICE_TYPES = {
  MOBILE: "mobile" as const,
  TABLET: "tablet" as const,
  DESKTOP: "desktop" as const,
  UNKNOWN: "unknown" as const,
} as const;
