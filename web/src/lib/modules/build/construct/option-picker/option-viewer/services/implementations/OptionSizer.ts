/**
 * Option Picker Sizing Service Implementation
 * 
 * Implements the exact same sizing logic as the legacy web app to ensure
 * consistent pictograph sizing across all sections and groups.
 */

import { injectable } from 'inversify';
import type {
  DeviceConfig,
  IOptionSizer,
  SizingCalculationParams,
  SizingResult
} from '../contracts/IOptionSizer';

@injectable()
export class OptionSizer implements IOptionSizer {
  
  // Device configuration matching legacy exactly
  private readonly DEVICE_CONFIG: Record<string, DeviceConfig> = {
    smallMobile: {
      padding: { horizontal: 12, vertical: 12 },
      gap: 2,
      minItemSize: 80,
      maxItemSize: 150,
      scaleFactor: 1,
    },
    mobile: {
      padding: { horizontal: 12, vertical: 12 },
      gap: 2,
      minItemSize: 80,
      maxItemSize: 175,
      scaleFactor: 1,
    },
    tablet: {
      padding: { horizontal: 12, vertical: 12 },
      gap: 2,
      minItemSize: 80,
      maxItemSize: 175,
      scaleFactor: 1,
    },
    desktop: {
      padding: { horizontal: 12, vertical: 12 },
      gap: 2,
      minItemSize: 90,
      maxItemSize: 180,
      scaleFactor: 1,
    },
    largeDesktop: {
      padding: { horizontal: 12, vertical: 12 },
      gap: 2,
      minItemSize: 100,
      maxItemSize: 200,
      scaleFactor: 1,
    },
  };

  calculateMaximizedSize(params: {
    containerWidth: number;
    containerHeight: number;
    layoutMode: '4-column' | '8-column';
    maxPictographsPerSection: number;
    isMobileDevice: boolean;
  }): SizingResult {
    const { containerWidth, containerHeight, layoutMode, maxPictographsPerSection, isMobileDevice } = params;

    const deviceType = this.determineDeviceType(containerWidth, isMobileDevice);
    const deviceConfig = this.getDeviceConfig(deviceType);

    // Calculate available space
    const availableWidth = containerWidth - (deviceConfig.padding.horizontal * 2);
    const availableHeight = containerHeight - (deviceConfig.padding.vertical * 2);

    let optimalColumns: number;
    let maxPictographsPerRow: number;

    if (layoutMode === '8-column') {
      // 8-column mode: maximize based on the most constrained section
      optimalColumns = 8;
      maxPictographsPerRow = Math.min(optimalColumns, maxPictographsPerSection);
    } else {
      // 4-column mode: different layout for Types 4-6
      optimalColumns = 4;
      maxPictographsPerRow = Math.min(optimalColumns, maxPictographsPerSection);
    }

    // Calculate maximum size that fits within constraints
    const widthPerItem = (availableWidth - (deviceConfig.gap * (maxPictographsPerRow - 1))) / maxPictographsPerRow;

    // For height, assume reasonable number of rows based on typical content
    const estimatedRows = Math.ceil(maxPictographsPerSection / maxPictographsPerRow);
    const heightPerItem = (availableHeight - (deviceConfig.gap * (estimatedRows - 1))) / estimatedRows;

    // Take the smaller dimension but prioritize width for better visual consistency
    let calculatedSize = Math.min(widthPerItem, heightPerItem * 1.2); // Allow slightly taller than wide

    // Apply device-specific scaling
    const scaledSize = calculatedSize * deviceConfig.scaleFactor;

    // Enforce constraints but allow larger sizes for better space utilization
    const finalSize = Math.max(
      deviceConfig.minItemSize,
      Math.min(deviceConfig.maxItemSize * 1.5, scaledSize) // Allow 50% larger than normal max
    );

    const flooredSize = Math.floor(finalSize);

    return {
      pictographSize: flooredSize,
      pictographSizeString: `${flooredSize}px`,
      gridGap: `${deviceConfig.gap}px`,
      deviceConfig,
      calculationDetails: {
        availableWidth,
        availableHeight,
        widthPerItem,
        heightPerItem,
        rawCalculatedSize: calculatedSize,
        scaledSize,
        finalSize: flooredSize,
      },
    };
  }

  calculatePictographSize(params: SizingCalculationParams): SizingResult {
    const {
      count,
      containerWidth,
      containerHeight,
      columns,
      isMobileDevice,
      deviceType = this.determineDeviceType(containerWidth, isMobileDevice)
    } = params;

    // Return fallback for invalid dimensions
    if (containerWidth <= 0 || containerHeight <= 0 || columns <= 0) {
      const fallbackSize = isMobileDevice ? 80 : 100;
      return this.createFallbackResult(fallbackSize, deviceType);
    }

    const deviceConfig = this.getDeviceConfig(deviceType);

    // Calculate available space (matching legacy exactly)
    const availableWidth = containerWidth - (deviceConfig.padding.horizontal * 2);
    const availableHeight = containerHeight - (deviceConfig.padding.vertical * 2);

    // Calculate size per item based on grid layout
    const widthPerItem = availableWidth / columns;
    const heightPerItem = availableHeight / Math.ceil(count / columns);

    // Take the smaller dimension to ensure everything fits
    let calculatedSize = Math.min(widthPerItem, heightPerItem);

    // Apply device-specific scaling factor
    const scaledSize = calculatedSize * deviceConfig.scaleFactor;

    // Enforce min/max constraints from device config
    const finalSize = Math.max(
      deviceConfig.minItemSize,
      Math.min(deviceConfig.maxItemSize, scaledSize)
    );

    const flooredSize = Math.floor(finalSize);

    return {
      pictographSize: flooredSize,
      pictographSizeString: `${flooredSize}px`,
      gridGap: this.calculateGridGap(params),
      deviceConfig,
      calculationDetails: {
        availableWidth,
        availableHeight,
        widthPerItem,
        heightPerItem,
        rawCalculatedSize: calculatedSize,
        scaledSize,
        finalSize: flooredSize,
      },
    };
  }

  getDeviceConfig(deviceType: string): DeviceConfig {
    return this.DEVICE_CONFIG[deviceType] || this.DEVICE_CONFIG.desktop;
  }

  calculateGridGap(params: SizingCalculationParams): string {
    const deviceType = params.deviceType || this.determineDeviceType(params.containerWidth, params.isMobileDevice);
    const deviceConfig = this.getDeviceConfig(deviceType);
    
    // Base gap from device config
    let gapSize = deviceConfig.gap;
    
    // Enforce minimum gap of 6px to prevent options from sticking together
    // (matching legacy behavior)
    const finalGap = Math.max(6, gapSize);
    
    return `${finalGap}px`;
  }

  getOptimalColumns(containerWidth: number, isMobileDevice: boolean): number {
    // TKA system uses 4 or 8 columns based on available width
    // This matches the current modern implementation
    return containerWidth >= 800 ? 8 : 4;
  }

  private determineDeviceType(containerWidth: number, isMobileDevice: boolean): string {
    if (isMobileDevice) {
      return containerWidth < 400 ? 'smallMobile' : 'mobile';
    }
    
    if (containerWidth < 768) return 'tablet';
    if (containerWidth < 1200) return 'desktop';
    return 'largeDesktop';
  }

  private createFallbackResult(fallbackSize: number, deviceType: string): SizingResult {
    const deviceConfig = this.getDeviceConfig(deviceType);
    
    return {
      pictographSize: fallbackSize,
      pictographSizeString: `${fallbackSize}px`,
      gridGap: '8px',
      deviceConfig,
      calculationDetails: {
        availableWidth: 0,
        availableHeight: 0,
        widthPerItem: 0,
        heightPerItem: 0,
        rawCalculatedSize: fallbackSize,
        scaledSize: fallbackSize,
        finalSize: fallbackSize,
      },
    };
  }
}
