/**
 * Trail Types
 *
 * Type definitions for the spirograph-style trail effect
 * that traces prop endpoints during animation.
 */

/**
 * Single point in the trail path
 */
export interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
  propIndex: 0 | 1; // 0 = blue, 1 = red
  endType: 0 | 1; // 0 = left end, 1 = right end (tip)
}

/**
 * Trail rendering mode
 */
export enum TrailMode {
  OFF = "off",
  FADE = "fade",
  LOOP_CLEAR = "loop_clear", // Clears when animation loops back to start
  PERSISTENT = "persistent", // Never clears - keeps drawing forever
}

/**
 * Trail rendering style (for future expansion)
 */
export enum TrailStyle {
  SMOOTH_LINE = "smooth_line",
  DOTTED = "dotted",
  GRADIENT_WIDTH = "gradient_width",
}

/**
 * Which prop end(s) to track
 */
export enum TrackingMode {
  LEFT_END = "left_end", // Track only left end
  RIGHT_END = "right_end", // Track only right end (tip)
  BOTH_ENDS = "both_ends", // Track both ends
}

/**
 * Trail settings configuration
 */
export interface TrailSettings {
  enabled: boolean;
  mode: TrailMode;
  style: TrailStyle;
  fadeDurationMs: number; // How long before trail fades (fade mode only)
  maxPoints: number; // Maximum trail points to store
  lineWidth: number;
  glowEnabled: boolean;
  glowBlur: number;
  blueColor: string;
  redColor: string;
  minOpacity: number; // Minimum opacity for oldest points
  maxOpacity: number; // Maximum opacity for newest points
  trackingMode: TrackingMode; // Which end(s) to track
  hideProps: boolean; // Hide props and show only trails
  usePathCache: boolean; // Use pre-computed animation paths for gap-free rendering
  previewMode: boolean; // Show future path (training mode) vs past trail (normal mode)
}

/**
 * Default trail settings
 */
export const DEFAULT_TRAIL_SETTINGS: TrailSettings = {
  enabled: true, // ✅ Trails enabled by default
  mode: TrailMode.FADE, // FADE mode provides beautiful, smooth trails
  style: TrailStyle.SMOOTH_LINE,
  fadeDurationMs: 2000, // 2 seconds
  maxPoints: 1000, // Increased for full sequence trails
  lineWidth: 3.5,
  glowEnabled: true,
  glowBlur: 2,
  blueColor: "#2E3192",
  redColor: "#ED1C24",
  minOpacity: 0.15,
  maxOpacity: 0.95, // Increased from 0.8 for more visible trails
  trackingMode: TrackingMode.RIGHT_END, // Track right end (tip) by default
  hideProps: false, // Show props by default
  usePathCache: true, // ✅ Enable intelligent backfill for gap-free trails during device stutters
  previewMode: false, // Show past trail by default (false = trail mode, true = preview/training mode)
};

/**
 * LocalStorage key for trail settings
 */
export const TRAIL_SETTINGS_STORAGE_KEY = "tka_trail_settings";
