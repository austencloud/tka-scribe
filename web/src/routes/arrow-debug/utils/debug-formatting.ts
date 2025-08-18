/**
 * Debug Formatting Utilities
 *
 * Extracted utility functions for formatting debug information
 * in the arrow debug system.
 */

/**
 * Format a coordinate value for display
 */
export function formatCoordinate(value: number | undefined): string {
  if (value === undefined || value === null) return "N/A";
  return value.toFixed(2);
}

/**
 * Format a point object for display
 */
export function formatPoint(
  point:
    | { x: number | (() => number); y: number | (() => number) }
    | null
    | undefined
): string {
  if (!point) return "N/A";
  if (typeof point.x === "function" && typeof point.y === "function") {
    return `(${formatCoordinate(point.x())}, ${formatCoordinate(point.y())})`;
  }
  return `(${formatCoordinate(point.x as number)}, ${formatCoordinate(point.y as number)})`;
}

/**
 * Format a timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}
