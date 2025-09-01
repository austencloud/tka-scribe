/**
 * Option Picker Type Aliases
 *
 * Type aliases and unions for option picker layout functionality.
 */

// ============================================================================
// DEVICE AND VIEWPORT TYPES
// ============================================================================

export type DeviceType =
  | "smallMobile"
  | "mobile"
  | "tablet"
  | "desktop"
  | "largeDesktop";

export type ContainerAspect = "tall" | "square" | "wide";

export type LayoutCategory =
  | "singleItem"
  | "twoItems"
  | "fewItems"
  | "mediumItems"
  | "manyItems";
