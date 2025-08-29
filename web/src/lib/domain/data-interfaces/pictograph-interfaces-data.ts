/**
 * Pictograph and Rendering Service Interfaces
 *
 * Interfaces for pictograph rendering, SVG generation, and visual representation
 * of sequences and beats.
 */
// ============================================================================
// SHARED TYPES (imported from core-types to avoid duplication)
// ============================================================================

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface ISvgConfiguration {
  readonly SVG_SIZE: number;
  readonly CENTER_X: number;
  readonly CENTER_Y: number;
}

export interface ArrowSvgData {
  imageSrc: string;
  viewBox: { width: number; height: number };
  center: { x: number; y: number };
}

export interface SVGDimensions {
  viewBox: { width: number; height: number };
  center: { x: number; y: number };
}
