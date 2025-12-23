/**
 * Composite Export Options
 *
 * Configuration for composite video export (animation + grid side-by-side).
 */

export interface CompositeExportOptions {
  orientation: 'horizontal' | 'vertical';
  gridBeatSize: number;  // Size of each beat in the grid (pixels)
  includeStartPosition: boolean;
  showBeatNumbers: boolean;
  fps: number;
  loopCount: number;
}

export const DEFAULT_COMPOSITE_OPTIONS: CompositeExportOptions = {
  orientation: 'horizontal',
  gridBeatSize: 120,
  includeStartPosition: true,
  showBeatNumbers: true,
  fps: 50,
  loopCount: 1,
};
