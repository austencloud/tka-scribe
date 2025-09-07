import { DeviceType } from "$shared";
import { injectable } from "inversify";
import type { IDeviceDetector } from "../contracts/IDeviceDetector";

/**
 * Device Detector Implementation
 *
 * Detects device capabilities and characteristics using browser APIs.
 */
@injectable()
export class DeviceDetector implements IDeviceDetector {
  private deviceType: DeviceType | null = null;

  detectDeviceType(): DeviceType {
    if (this.deviceType) {
      return this.deviceType;
    }

    const screenWidth = window.screen.width;
    const hasTouch = "ontouchstart" in window;

    // Mobile detection
    if (hasTouch && screenWidth < 768) {
      this.deviceType = DeviceType.MOBILE;
    }
    // Tablet detection
    else if (hasTouch && screenWidth >= 768 && screenWidth < 1024) {
      this.deviceType = DeviceType.TABLET;
    }
    // Desktop detection
    else {
      this.deviceType = DeviceType.DESKTOP;
    }

    console.log(`📱 DeviceDetector: Detected device type: ${this.deviceType}`);
    return this.deviceType!; // Non-null assertion since we just set it above
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
}
