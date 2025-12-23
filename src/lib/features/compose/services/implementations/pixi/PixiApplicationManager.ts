/**
 * PixiJS Application Manager
 *
 * Handles PixiJS application lifecycle:
 * - Initialization and configuration
 * - Canvas management
 * - Resize operations
 * - Cleanup and disposal
 *
 * Single Responsibility: PixiJS app setup and lifecycle
 */

import { Application } from "pixi.js";

export class PixiApplicationManager {
  private app: Application | null = null;
  private currentSize: number = 500;
  private isInitialized: boolean = false;
  private pendingRenderRetry: number | null = null;

  async initialize(
    container: HTMLElement,
    size: number,
    backgroundAlpha: number = 1
  ): Promise<Application> {
    if (this.isInitialized) {
      console.warn("[PixiApplicationManager] Already initialized");
      return this.app!;
    }

    this.currentSize = size;

    try {
      // Check WebGL support before attempting initialization
      const webGLSupported = this.checkWebGLSupport();
      if (!webGLSupported) {
        throw new Error(
          "WebGL is not supported in this browser. PixiJS v8 requires WebGL - Canvas fallback is not available."
        );
      }

      // Create PixiJS application with autoStart: false to prevent automatic render loop
      this.app = new Application();
      await this.app.init({
        width: size,
        height: size,
        // Use transparent black when alpha is 0, white otherwise
        backgroundColor: backgroundAlpha === 0 ? 0x000000 : 0xffffff,
        backgroundAlpha, // Support transparent canvas for overlay rendering
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        autoStart: false, // Prevent automatic ticker
        // CRITICAL: Required for GIF export - preserves canvas content for drawImage capture
        preserveDrawingBuffer: true,
        // Explicitly prefer WebGL renderer (PixiJS v8 doesn't support Canvas2D fallback)
        preference: "webgl",
      });

      // Wait a tick for canvas to be available
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Append canvas to container
      const canvas = this.app.canvas;
      if (!canvas) {
        throw new Error("PixiJS canvas not available after initialization");
      }
      container.appendChild(canvas);

      this.isInitialized = true;

      return this.app;
    } catch (error) {
      console.error("[PixiApplicationManager] Initialization failed:", error);
      // Clean up on failure
      if (this.app) {
        try {
          this.app.destroy();
        } catch (e) {
          // Ignore cleanup errors
        }
        this.app = null;
      }
      throw error;
    }
  }

  resize(newSize: number): void {
    if (!this.isInitialized || !this.app?.renderer) return;

    this.currentSize = newSize;
    this.app.renderer.resize(newSize, newSize);
  }

  private hasLoggedRenderPipeError = false;
  private hasLoggedSuccessfulRender = false;

  render(): void {
    if (!this.isInitialized || !this.app?.renderer) {
      console.warn(
        "[PixiApplicationManager] Skipped render - not initialized or no renderer"
      );
      return;
    }

    try {
      const stage = this.app.stage;
      if (!stage || stage.destroyed) {
        if (!this.hasLoggedRenderPipeError) {
          console.warn("[PixiApplicationManager] Stage is null or destroyed");
          this.hasLoggedRenderPipeError = true;
        }
        this.isInitialized = false;
        return;
      }

      // Reset error flag on successful render preparation
      this.hasLoggedRenderPipeError = false;

      // Debug: log successful render once
      if (!this.hasLoggedSuccessfulRender) {
        console.log("[PixiApplicationManager] Attempting first render...");
        this.hasLoggedSuccessfulRender = true;
      }

      this.app.renderer.render(stage);
    } catch (error) {
      // Catch WebGL errors like context loss or invalid state
      if (!this.hasLoggedRenderPipeError) {
        console.error("[PixiApplicationManager] Render error:", error);
        this.hasLoggedRenderPipeError = true;
      }
      // Don't stop render loop on errors - renderer might recover
      // this.isInitialized = false;
    }
  }

  getApplication(): Application | null {
    return this.app;
  }

  getCanvas(): HTMLCanvasElement | null {
    return (this.app?.canvas as HTMLCanvasElement) || null;
  }

  getCurrentSize(): number {
    return this.currentSize;
  }

  isReady(): boolean {
    return this.isInitialized && this.app !== null;
  }

  destroy(): void {
    if (!this.app || !this.isInitialized) return;

    try {
      // Cancel any pending render retries
      if (this.pendingRenderRetry !== null) {
        cancelAnimationFrame(this.pendingRenderRetry);
        this.pendingRenderRetry = null;
      }

      // CRITICAL: Remove canvas from DOM before destroying
      const canvas = this.app.canvas;
      if (canvas.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }

      // Destroy entire app (includes renderer, stage, ticker, etc.)
      // Pass true to remove canvas from DOM and destroy all children
      this.app.destroy(true, { children: true, texture: true });

      this.app = null;
      this.isInitialized = false;
    } catch (error) {
      console.error("[PixiApplicationManager] Error during destroy:", error);
      this.app = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if WebGL is supported in the current browser context.
   * PixiJS v8 requires WebGL - Canvas2D fallback is not available.
   */
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      return gl !== null;
    } catch {
      return false;
    }
  }
}
