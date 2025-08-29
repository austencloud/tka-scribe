/**
 * Responsive Layout Service Interfaces
 *
 * Interfaces for responsive UI layout calculations, grid configuration,
 * and option picker layout management.
 */
// ============================================================================
// LAYOUT TYPES
// ============================================================================


// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface LayoutDimensions {
  width: number;
  height: number;
}

export interface GridConfiguration {
  columns: number;
  gap: string;
  itemSize: number;
  gridClass: string;
  aspectClass: string;
  scaleFactor: number;
}

export interface ResponsiveLayoutConfig {
  gridColumns: string;
  optionSize: string;
  gridGap: string;
  gridClass: string;
  aspectClass: string;
  scaleFactor: number;
}

export interface LayoutCalculationParams {
  count: number;
  containerWidth: number;
  containerHeight: number;
  windowWidth?: number;
  windowHeight?: number;
  isMobileUserAgent?: boolean;
}

export interface LayoutCalculationResult {
  optionsPerRow: number;
  optionSize: number;
  gridGap: string;
  gridColumns: string;
  gridClass: string;
  aspectClass: string;
  scaleFactor: number;
  deviceType: string;
  containerAspect: string;
  isMobile: boolean;
  isTablet: boolean;
  isPortrait: boolean;
  layoutConfig: ResponsiveLayoutConfig;
}
