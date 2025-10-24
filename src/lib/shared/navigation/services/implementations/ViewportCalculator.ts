/**
 * Viewport Calculator Service
 *
 * Handles viewport calculations for responsive layouts, especially mobile modals.
 * Provides utilities for calculating safe heights accounting for browser UI elements.
 */

export interface ViewportDimensions {
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  browserUIOffset: number;
  devicePixelRatio: number;
  visualViewport?: {
    width: number;
    height: number;
    offsetTop: number;
    offsetLeft: number;
  };
}

export class ViewportCalculator {
  /**
   * Get current viewport dimensions with detailed metrics
   */
  public getDimensions(): ViewportDimensions {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const screenHeight = window.screen.height;
    const screenWidth = window.screen.width;

    const dimensions: ViewportDimensions = {
      viewportWidth: vw,
      viewportHeight: vh,
      screenWidth,
      screenHeight,
      browserUIOffset: screenHeight - vh,
      devicePixelRatio: window.devicePixelRatio,
    };

    // Add visual viewport if supported
    if (window.visualViewport) {
      dimensions.visualViewport = {
        width: window.visualViewport.width,
        height: window.visualViewport.height,
        offsetTop: window.visualViewport.offsetTop,
        offsetLeft: window.visualViewport.offsetLeft,
      };
    }

    return dimensions;
  }

  /**
   * Calculate safe modal height for mobile devices
   * Accounts for browser UI and provides conservative height
   */
  public calculateSafeModalHeight(): number {
    const vh = window.innerHeight;
    // 75% of viewport or viewport minus 60px, whichever is smaller
    return Math.min(vh * 0.75, vh - 60);
  }

  /**
   * Update CSS custom properties for viewport dimensions
   * Sets fallback properties for browsers without dvh support
   */
  public updateCSSProperties(): void {
    const dimensions = this.getDimensions();

    document.documentElement.style.setProperty(
      "--actual-vh",
      `${dimensions.viewportHeight}px`
    );
    document.documentElement.style.setProperty(
      "--actual-vw",
      `${dimensions.viewportWidth}px`
    );
    document.documentElement.style.setProperty(
      "--modal-max-height",
      `${this.calculateSafeModalHeight()}px`
    );
  }

  /**
   * Log viewport debug information
   * Useful for troubleshooting mobile layout issues
   */
  public logDebugInfo(): void {
    const dimensions = this.getDimensions();

    console.log("🔍 Viewport Debug Info:", {
      viewport: {
        width: dimensions.viewportWidth,
        height: dimensions.viewportHeight,
      },
      screen: {
        width: dimensions.screenWidth,
        height: dimensions.screenHeight,
      },
      browserUIOffset: dimensions.browserUIOffset,
      devicePixelRatio: dimensions.devicePixelRatio,
      visualViewport: dimensions.visualViewport || "not supported",
      safeModalHeight: this.calculateSafeModalHeight(),
    });
  }

  /**
   * Set up viewport listeners for responsive updates
   * Returns cleanup function
   */
  public setupListeners(callback: () => void): () => void {
    const handleUpdate = () => {
      this.updateCSSProperties();
      callback();
    };

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("orientationchange", handleUpdate);

    // Initial update
    handleUpdate();

    // Return cleanup function
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("orientationchange", handleUpdate);
    };
  }
}
