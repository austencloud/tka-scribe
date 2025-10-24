// src/lib/components/SequenceWorkbench/SequenceBeatFrame/beatFrameHelpers.ts

export type LayoutDict = Record<string, [number, number]>;

export async function fetchDefaultLayouts(url: string): Promise<LayoutDict> {
	try {
		const resp = await fetch(url);
		if (!resp.ok) throw new Error(`Failed to fetch layouts from ${url}`);
		const data: LayoutDict = await resp.json();
		return data;
	} catch (err) {
		console.error('fetchDefaultLayouts error =>', err);
		// Return an empty dictionary so the caller can fallback
		return {};
	}
}

export function applyLayout(
	defaultLayouts: LayoutDict,
	beatCount: number,
	fallback: [number, number] = [4, 4]
): [number, number] {
	const key = String(beatCount);
	if (defaultLayouts[key]) {
		return defaultLayouts[key];
	}
	return fallback;
}

/**
 * Calculate the optimal cell size for the beat frame grid
 * @param containerWidth Width of the container
 * @param containerHeight Height of the container
 * @param totalRows Number of rows in the grid
 * @param totalCols Number of columns in the grid
 * @param gap Gap between cells
 * @returns Optimal cell size in pixels
 */
export function calculateCellSize(
	containerWidth: number,
	containerHeight: number,
	totalRows: number,
	totalCols: number,
	gap: number
): number {
	// Ensure we have valid dimensions
	if (containerWidth <= 0 || containerHeight <= 0 || totalRows <= 0 || totalCols <= 0) {
		return 50; // Default fallback size
	}

	// Calculate available space after accounting for gaps
	const totalGapWidth = gap * (totalCols - 1);
	const totalGapHeight = gap * (totalRows - 1);

	const availableWidth = Math.max(0, containerWidth - totalGapWidth);
	const availableHeight = Math.max(0, containerHeight - totalGapHeight);

	// Calculate cell size based on available space
	const cellWidthByContainer = availableWidth / totalCols;
	const cellHeightByContainer = availableHeight / totalRows;

	// Take the smaller dimension to ensure cells fit within container
	const cellSize = Math.min(cellWidthByContainer, cellHeightByContainer);

	// Apply minimum and maximum constraints
	return Math.max(30, Math.min(cellSize, 200));
}

export function autoAdjustLayout(beatCount: number): [number, number] {
	if (beatCount <= 0) return [1, 1]; // Empty grid
	if (beatCount <= 4) return [2, 2]; // 2x2 grid
	if (beatCount <= 9) return [3, 3]; // 3x3 grid
	if (beatCount <= 16) return [4, 4]; // 4x4 grid
	if (beatCount <= 32) return [4, 8]; // 4x8 grid
	if (beatCount <= 48) return [6, 8]; // 6x8 grid
	return [8, 8]; // Max 8x8 grid
}
