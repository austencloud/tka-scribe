/**
 * Option Picker Sizing Service Interface
 * 
 * Provides centralized sizing calculations for consistent pictograph sizing
 * across all sections and groups in the option picker.
 */

export interface DeviceConfig {
  padding: {
    horizontal: number;
    vertical: number;
  };
  gap: number;
  minItemSize: number;
  maxItemSize: number;
  scaleFactor: number;
}

export interface SizingCalculationParams {
  count: number;
  containerWidth: number;
  containerHeight: number;
  columns: number;
  isMobileDevice: boolean;
  deviceType?: string;
}

export interface SizingResult {
  pictographSize: number;
  pictographSizeString: string;
  gridGap: string;
  deviceConfig: DeviceConfig;
  calculationDetails: {
    availableWidth: number;
    availableHeight: number;
    widthPerItem: number;
    heightPerItem: number;
    rawCalculatedSize: number;
    scaledSize: number;
    finalSize: number;
  };
}

export interface IOptionSizer {
  /**
   * Calculate consistent pictograph size for all sections
   * This is the main method that ensures all pictographs are the same size
   */
  calculatePictographSize(params: SizingCalculationParams): SizingResult;

  /**
   * Calculate maximized pictograph size based on layout constraints
   * This method maximizes space usage for the given layout mode
   */
  calculateMaximizedSize(params: {
    containerWidth: number;
    containerHeight: number;
    layoutMode: '4-column' | '8-column';
    maxPictographsPerSection: number;
    isMobileDevice: boolean;
  }): SizingResult;

  /**
   * Get device configuration for a specific device type
   */
  getDeviceConfig(deviceType: string): DeviceConfig;

  /**
   * Calculate grid gap based on device and container
   */
  calculateGridGap(params: SizingCalculationParams): string;

  /**
   * Get the optimal number of columns for the given parameters
   */
  getOptimalColumns(containerWidth: number, isMobileDevice: boolean): number;
}
