/**
 * Canvas Resize Service Implementation
 *
 * Handles canvas resize logic for AnimatorCanvas.
 * Uses ResizeObserver when available, falls back to window resize.
 */

import {
  DEFAULT_CANVAS_SIZE,
  type ICanvasResizeService,
  type ResizableRenderer,
  type SizeChangeCallback,
  type ResizeCompleteCallback,
} from "../contracts/ICanvasResizeService";

export class CanvasResizeService implements ICanvasResizeService {
  private container: HTMLDivElement | null = null;
  private renderer: ResizableRenderer | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private onSizeChange: SizeChangeCallback | null = null;
  private onResizeComplete: ResizeCompleteCallback | null = null;
  private currentSize: number = DEFAULT_CANVAS_SIZE;

  // Bound reference to resize handler for event listener cleanup
  private boundResizeHandler = () => this.handleResize();

  initialize(container: HTMLDivElement, renderer: ResizableRenderer): void {
    this.container = container;
    this.renderer = renderer;
  }

  setSizeChangeCallback(callback: SizeChangeCallback): void {
    this.onSizeChange = callback;
  }

  setResizeCompleteCallback(callback: ResizeCompleteCallback): void {
    this.onResizeComplete = callback;
  }

  setup(): void {
    this.teardown();

    if (typeof ResizeObserver !== "undefined" && this.container) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.container);
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.boundResizeHandler);
    }
  }

  teardown(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.boundResizeHandler);
    }
  }

  async resize(currentSize: number): Promise<number> {
    this.currentSize = currentSize;
    return this.performResize();
  }

  dispose(): void {
    this.teardown();
    this.container = null;
    this.renderer = null;
    this.onSizeChange = null;
    this.onResizeComplete = null;
  }

  private handleResize(): void {
    this.performResize();
  }

  private async performResize(): Promise<number> {
    if (!this.container || !this.renderer) return this.currentSize;

    const rect = this.container.getBoundingClientRect();
    const newSize =
      Math.min(
        rect.width || DEFAULT_CANVAS_SIZE,
        rect.height || DEFAULT_CANVAS_SIZE
      ) || DEFAULT_CANVAS_SIZE;

    if (newSize !== this.currentSize) {
      this.currentSize = newSize;
      this.onSizeChange?.(newSize);
      await this.renderer.resize(newSize);
      this.onResizeComplete?.();
    }

    return newSize;
  }
}
