import { TYPES } from "$shared/inversify/types";
import { inject, injectable } from "inversify";
import { createComponentLogger } from "../../../utils/debug-logger";
import { DeviceType } from "../../domain";
import type {
  DeviceCapabilities,
  ResponsiveSettings,
} from "../../domain/models/device-models";
import type { IDeviceDetector } from "../contracts/IDeviceDetector";
import type { IViewportService } from "../contracts/IViewportService";

/**
 * Device Detector Implementation
 *
 * Detects device capabilities and characteristics using browser APIs.
 */
@injectable()
export class DeviceDetector implements IDeviceDetector {
  private logger = createComponentLogger("DeviceDetector");
  private capabilitiesCallbacks: ((caps: DeviceCapabilities) => void)[] = [];
  private _cachedDeviceType: DeviceType | null = null;
  private _lastViewportWidth: number = 0;
  private _lastViewportHeight: number = 0;
  private _viewportCleanup: (() => void) | null = null;

  constructor(
    @inject(TYPES.IViewportService) private viewportService: IViewportService
  ) {
    // Subscribe to viewport changes to make device detection reactive
    this._viewportCleanup = this.viewportService.onViewportChange(() => {
      // Clear cached device type to force recalculation
      this._cachedDeviceType = null;

      // Get fresh capabilities with new viewport dimensions
      const newCapabilities = this.getCapabilities();

      // Notify all registered callbacks about the change
      this.capabilitiesCallbacks.forEach(callback => {
        callback(newCapabilities);
      });

      this.logger.log("Viewport changed, notified callbacks", {
        width: this.viewportService.width,
        height: this.viewportService.height,
        callbackCount: this.capabilitiesCallbacks.length
      });
    });
  }

  detectDeviceType(): DeviceType {
    const viewportWidth = this.viewportService.width;
    const viewportHeight = this.viewportService.height;

    // Check if we can use cached result
    if (
      this._cachedDeviceType !== null &&
      this._lastViewportWidth === viewportWidth &&
      this._lastViewportHeight === viewportHeight
    ) {
      return this._cachedDeviceType;
    }

    // Calculate device type
    const hasTouch = "ontouchstart" in window;
    let deviceType: DeviceType;

    // Mobile detection (for testing, use viewport width instead of screen width)
    if (viewportWidth < 768) {
      deviceType = DeviceType.MOBILE;
    }
    // Tablet detection
    else if (hasTouch && viewportWidth >= 768 && viewportWidth < 1024) {
      deviceType = DeviceType.TABLET;
    }
    // Desktop detection
    else {
      deviceType = DeviceType.DESKTOP;
    }

    // Cache the result
    this._cachedDeviceType = deviceType;
    this._lastViewportWidth = viewportWidth;
    this._lastViewportHeight = viewportHeight;

    this.logger.log(`Detected device type: ${deviceType}`);
    return deviceType;
  }

  isTouchDevice(): boolean {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  isMobile(): boolean {
    return this.detectDeviceType() === DeviceType.MOBILE;
  }

  isTablet(): boolean {
    return this.detectDeviceType() === DeviceType.TABLET;
  }

  isDesktop(): boolean {
    return this.detectDeviceType() === DeviceType.DESKTOP;
  }

  /**
   * Check if device is in landscape mobile mode
   * Detects phone-like landscape viewports that should use left navigation
   *
   * Criteria for landscape mobile navigation (very restrictive):
   * - Currently in landscape orientation (width > height)
   * - Very wide aspect ratio (> 2.0:1) indicating phone proportions
   * - Low height (< 500px) indicating actual phone, not tablet
   *
   * This works for:
   * - Actual mobile phones rotated sideways (e.g., 844x390, 932x430)
   * - Desktop windows resized to phone-like proportions (for testing)
   *
   * This excludes (all use top navigation):
   * - Tablets in landscape (e.g., 829x690, 1024x768)
   * - Large foldables (e.g., 2208x1768)
   * - Ultra-wide displays
   *
   * Note: This is intentionally independent of touch detection to allow desktop testing
   */
  isLandscapeMobile(): boolean {
    const viewportWidth = this.viewportService.width;
    const viewportHeight = this.viewportService.height;
    const aspectRatio = this.viewportService.getAspectRatio();

    // Check if in landscape orientation
    const isLandscape = this.viewportService.isLandscape();

    // Phone landscape criteria - wider aspect ratio threshold to include iPhone 6/7/8 landscape (1.78:1)
    const isWideAspectRatio = aspectRatio > 1.7; // Includes most phone landscape orientations
    const isLowHeight = viewportHeight < 500; // Actual phone height

    // Only phones in landscape should use left navigation
    const result = isLandscape && isWideAspectRatio && isLowHeight;

    if (result) {
      this.logger.log(`Landscape mobile layout active (phone-like):`, {
        viewportWidth,
        viewportHeight,
        aspectRatio: aspectRatio.toFixed(2),
        isWideAspectRatio,
        isLowHeight,
        reason: "Phone-like proportions in landscape orientation",
      });
    }

    return result;
  }

  /**
   * Check if device is in portrait mobile mode
   * Detects narrow portrait viewports that should use horizontal navigation
   *
   * Criteria for portrait mobile navigation:
   * - Currently in portrait orientation (height > width)
   * - Viewport width is relatively narrow (< 600px typical phone width)
   * - This ensures navigation gets maximum horizontal space
   *
   * This works for:
   * - Phones held upright (portrait mode)
   * - Desktop windows resized narrow for testing
   * - Foldable phones on front screen in portrait
   */
  isPortraitMobile(): boolean {
    const viewportWidth = this.viewportService.width;
    const viewportHeight = this.viewportService.height;

    // Check if in portrait orientation
    const isPortrait = this.viewportService.isPortrait();

    // Check if width is narrow (typical phone portrait width)
    const hasNarrowWidth = viewportWidth < 600;

    // Combine conditions
    const result = isPortrait && hasNarrowWidth;

    if (result) {
      this.logger.log(`Portrait mobile layout active:`, {
        viewportWidth,
        viewportHeight,
        reason: "Narrow width in portrait - using horizontal navigation",
      });
    }

    return result;
  }

  getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      pixelRatio: window.devicePixelRatio || 1,
    };
  }

  supportsFoldable(): boolean {
    // Basic check for foldable device features
    // This would need to be expanded with actual foldable detection logic
    return "screen" in window && "orientation" in window.screen;
  }

  getCapabilities(): DeviceCapabilities {
    const screenInfo = this.getScreenInfo();
    const deviceType = this.detectDeviceType();
    const hasTouch = this.isTouchDevice();

    return {
      primaryInput: hasTouch ? "touch" : "mouse",
      screenSize: this.getScreenSizeCategory(deviceType),
      hasTouch,
      hasPrecisePointer: !hasTouch,
      hasKeyboard: !this.isMobile(),
      viewport: {
        width: screenInfo.width,
        height: screenInfo.height,
      },
      pixelRatio: screenInfo.pixelRatio,
      colorDepth: window.screen?.colorDepth || 24,
      supportsHDR: false, // Basic implementation
      hardwareConcurrency: navigator.hardwareConcurrency || 4,
    };
  }

  /**
   * Get navigation layout immediately without caching
   * This ensures navigation layout responds instantly to viewport changes
   * - "top": Desktop and tablet (horizontal navigation bar at top)
   * - "left": Landscape mobile (vertical navigation bar on left)
   * - "bottom": Portrait mobile (bottom navigation bar)
   */
  getNavigationLayoutImmediate(): "top" | "left" | "bottom" {
    const viewportWidth = this.viewportService.width;
    const viewportHeight = this.viewportService.height;

    // Portrait mobile detection - use bottom navigation
    const isPortrait = viewportHeight > viewportWidth;
    const hasNarrowWidth = viewportWidth < 600;
    const isPortraitMobile = isPortrait && hasNarrowWidth;

    if (isPortraitMobile) {
      this.logger.log(`Navigation layout: bottom (portrait mobile)`, {
        isPortraitMobile,
        viewport: { width: viewportWidth, height: viewportHeight },
      });
      return "bottom";
    }

    // Phone landscape criteria - wider aspect ratio threshold to include iPhone 6/7/8 landscape (1.78:1)
    const isLandscape = viewportWidth > viewportHeight;
    const aspectRatio = viewportWidth / viewportHeight;
    const isWideAspectRatio = aspectRatio > 1.7; // Includes most phone landscape orientations
    const isLowHeight = viewportHeight < 500; // Actual phone height

    // Use left navigation only for phones in landscape
    const isLandscapeMobile = isLandscape && isWideAspectRatio && isLowHeight;

    const navigationLayout = isLandscapeMobile ? "left" : "top";

    this.logger.log(`Navigation layout: ${navigationLayout}`, {
      isLandscapeMobile,
      isWideAspectRatio,
      isLowHeight,
      aspectRatio: aspectRatio.toFixed(2),
      viewport: { width: viewportWidth, height: viewportHeight },
    });

    return navigationLayout;
  }

  getResponsiveSettings(): ResponsiveSettings {
    const capabilities = this.getCapabilities();
    const isMobile = this.isMobile();
    const isTablet = this.isTablet();
    const isDesktop = this.isDesktop();
    const isLandscapeMobile = this.isLandscapeMobile();

    // Use immediate navigation layout detection to avoid timing issues
    const navigationLayout = this.getNavigationLayoutImmediate();

    // Enhanced dual-density spacing for better desktop optimization
    // Mobile: 4px (optimized for touch, user-confirmed perfect)
    // Tablet: 8px (balanced middle ground)
    // Desktop: 10px base (aggressively reduced from 16px for compact desktop layout)
    // Note: CSS media queries in components will further compact (×0.6, ×0.5, ×0.4)
    const elementSpacing = isMobile ? 4 : isTablet ? 8 : 10;

    return {
      minTouchTarget: capabilities.hasTouch ? 44 : 32,
      elementSpacing,
      allowScrolling: true,
      layoutDensity: isMobile
        ? "compact"
        : isTablet
          ? "comfortable"
          : "spacious",
      fontScaling: isMobile ? 1.1 : 1.0,
      isMobile,
      isTablet,
      isDesktop,
      screenWidth: capabilities.viewport.width,
      screenHeight: capabilities.viewport.height,
      devicePixelRatio: capabilities.pixelRatio,
      touchSupported: capabilities.hasTouch,
      orientation:
        capabilities.viewport.width > capabilities.viewport.height
          ? "landscape"
          : "portrait",
      navigationLayout,
      isLandscapeMobile,
    };
  }

  onCapabilitiesChanged(
    callback: (caps: DeviceCapabilities) => void
  ): () => void {
    this.capabilitiesCallbacks.push(callback);

    // Return cleanup function
    return () => {
      const index = this.capabilitiesCallbacks.indexOf(callback);
      if (index > -1) {
        this.capabilitiesCallbacks.splice(index, 1);
      }
    };
  }

  private getScreenSizeCategory(
    deviceType: DeviceType
  ): "mobile" | "tablet" | "desktop" | "largeDesktop" {
    switch (deviceType) {
      case DeviceType.MOBILE:
        return "mobile";
      case DeviceType.TABLET:
        return "tablet";
      case DeviceType.DESKTOP:
        return window.screen.width > 1440 ? "largeDesktop" : "desktop";
      default:
        return "desktop";
    }
  }
}
