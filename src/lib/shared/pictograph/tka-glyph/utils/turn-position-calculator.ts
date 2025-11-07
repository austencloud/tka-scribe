/**
 * Turn Position Calculator
 *
 * Calculates X/Y positions for top and bottom turn numbers
 * based on letter dimensions.
 *
 * Logic ported from legacy turns_column.py position_turns() method.
 */

export interface Dimensions {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface TurnPositions {
  top: Position;
  bottom: Position;
}

// Constants from legacy implementation
const PADDING_X = 15; // Distance to the right of letter (reduced from 15 for tighter spacing)
const PADDING_Y = 5; // Vertical padding from letter edges

/**
 * Calculate positions for top and bottom turn numbers
 * based on letter dimensions and bottom number height.
 *
 * Legacy positioning logic from turns_column.py:
 * - Top: letter.top - PADDING_Y
 * - Bottom: letter.bottom - bottomNumberHeight + PADDING_Y
 *
 * @param letterDimensions - Width and height of the letter SVG
 * @param bottomNumberHeight - Height of the bottom number SVG (default 45)
 * @returns Positions for top and bottom turn numbers
 */
export function calculateTurnPositions(
  letterDimensions: Dimensions,
  bottomNumberHeight: number = 45 // Default from SVG viewBox
): TurnPositions {
  // Base X position: right edge of letter + padding
  const baseX = letterDimensions.width + PADDING_X;

  // Top Y position: top of letter - padding
  const topY = -PADDING_Y;

  // Bottom Y position: bottom of letter - number height + padding
  // This aligns the bottom of the number with the bottom of the letter
  const bottomY = letterDimensions.height - bottomNumberHeight + PADDING_Y;

  return {
    top: { x: baseX, y: topY },
    bottom: { x: baseX, y: bottomY },
  };
}
