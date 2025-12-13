/**
 * Thumbnail Grid Layout Utilities
 *
 * Pure functions for calculating thumbnail grid layouts.
 * Simplified version of grid-calculations.ts for thumbnail use.
 */

export interface ThumbnailGridLayout {
  columns: number;
  rows: number;
  cellSize: number;
  gap: number;
}

/**
 * Calculate optimal grid layout for thumbnail display
 * Grid expands to fill available space
 */
export function calculateThumbnailGridLayout(
  beatCount: number,
  containerWidth: number,
  containerHeight: number,
  maxColumns: number = 4
): ThumbnailGridLayout {
  const MIN_CELL_SIZE = 20;
  const GAP = 2;

  // Include start position in total cells
  const totalCells = beatCount + 1;

  // Determine columns based on beat count - use optimal layout
  let columns: number;
  if (totalCells <= 2) {
    columns = 2;
  } else if (totalCells <= 4) {
    columns = 2;
  } else if (totalCells <= 8) {
    columns = 4;
  } else if (totalCells <= 16) {
    columns = 4;
  } else {
    columns = Math.min(8, maxColumns);
  }

  columns = Math.min(columns, totalCells, maxColumns);

  const rows = Math.ceil(totalCells / columns);

  // Calculate cell size to fill container (no artificial max cap)
  const availableWidth = containerWidth - (columns - 1) * GAP;
  const availableHeight = containerHeight - (rows - 1) * GAP;

  const maxCellWidth = availableWidth / columns;
  const maxCellHeight = availableHeight / rows;

  // Use the smaller dimension to ensure cells are square and fit
  let cellSize = Math.floor(Math.min(maxCellWidth, maxCellHeight));
  cellSize = Math.max(MIN_CELL_SIZE, cellSize);

  return {
    columns,
    rows,
    cellSize,
    gap: GAP,
  };
}

/**
 * Get position in grid for a cell index
 */
export function getCellGridPosition(
  index: number,
  columns: number
): { row: number; column: number } {
  return {
    row: Math.floor(index / columns),
    column: index % columns,
  };
}
