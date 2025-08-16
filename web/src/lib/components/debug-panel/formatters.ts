/**
 * Debug Panel Formatting Utilities
 * 
 * Pure utility functions for formatting debug data.
 * Extracted from ArrowDebugInfoPanel.svelte to promote reusability.
 */

export interface Point {
  x: number | (() => number);
  y: number | (() => number);
}

/**
 * Format a numeric coordinate value with fallback for undefined/null
 */
export function formatCoordinate(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(2);
}

/**
 * Format a point object (with potential function-based coordinates)
 */
export function formatPoint(point: Point | null | undefined): string {
  if (!point) return "N/A";
  
  // Handle function-based coordinates
  if (typeof point.x === "function" && typeof point.y === "function") {
    return `(${formatCoordinate(point.x())}, ${formatCoordinate(point.y())})`;
  }
  
  // Handle direct property access
  return `(${formatCoordinate(point.x as number)}, ${formatCoordinate(point.y as number)})`;
}

/**
 * Format timestamp to readable time string
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

/**
 * Format angle values consistently
 */
export function formatAngle(angle: number | undefined): string {
  if (angle === undefined || angle === null) return "N/A";
  return `${angle.toFixed(2)}°`;
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Format boolean values with visual indicators
 */
export function formatBoolean(value: boolean | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return value ? "✅ Yes" : "❌ No";
}
