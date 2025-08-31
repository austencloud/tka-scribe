/**
 * Device Detection Service Interface
 *
 * Interface for device capability detection, responsive design,
 * and platform-specific optimizations.
 */

// ============================================================================
// RESPONSIVE SETTINGS
// ============================================================================

export interface ResponsiveSettings {
  /** Minimum touch target size in pixels */
  minTouchTarget: number;

  /** Preferred spacing between interactive elements */
  elementSpacing: number;

  /** Whether scrolling is acceptable in current context */
  allowScrolling: boolean;

  /** Layout density preference */
  layoutDensity: "compact" | "comfortable" | "spacious";

  /** Font size scaling factor */
  fontScaling: number;
}
