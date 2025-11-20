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
      // Create PixiJS application with autoStart: false to prevent automatic render loop
      this.app = new Application();
      await this.app.init({
        width: size,
        height: size,
        backgroundColor: 0xffffff,
        backgroundAlpha, // Support transparent canvas for overlay rendering
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        autoStart: false, // Prevent automatic ticker
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
      console.log("[PixiApplicationManager] Initialized successfully");

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
    if (!this.app) return;

    this.currentSize = newSize;
    this.app.renderer.resize(newSize, newSize);
  }

  render(): void {
    if (this.app?.renderer) {
      this.app.renderer.render(this.app.stage);
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
      // CRITICAL: Remove canvas from DOM before destroying renderer
      const canvas = this.app.canvas;
      if (canvas?.parentElement) {
        canvas.parentElement.removeChild(canvas);
      }

      // Destroy app
      if (this.app.renderer) {
        this.app.renderer.destroy();
      }

      this.app = null;
      this.isInitialized = false;
      console.log("[PixiApplicationManager] Destroyed");
    } catch (error) {
      console.error("[PixiApplicationManager] Error during destroy:", error);
      this.app = null;
      this.isInitialized = false;
    }
  }
}
