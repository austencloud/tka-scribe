/**
 * Canvas Resize Service Interface
 *
 * Handles canvas resize logic for AnimatorCanvas.
 * Uses ResizeObserver when available, falls back to window resize.
 */

/**
 * Default canvas size
 */
export const DEFAULT_CANVAS_SIZE = 500;

/**
 * Renderer interface for resize operations
 */
export interface ResizableRenderer {
  resize: (size: number) => Promise<void>;
}

/**
 * Callback for when canvas size changes
 */
export type SizeChangeCallback = (newSize: number) => void;

/**
 * Callback for when resize operation completes
 */
export type ResizeCompleteCallback = () => void;

/**
 * Service for managing canvas resizing
 */
export interface ICanvasResizeService {
  /**
   * Initialize the service with container and renderer
   */
  initialize(container: HTMLDivElement, renderer: ResizableRenderer): void;

  /**
   * Set callback for size changes
   */
  setSizeChangeCallback(callback: SizeChangeCallback): void;

  /**
   * Set callback for resize completion
   */
  setResizeCompleteCallback(callback: ResizeCompleteCallback): void;

  /**
   * Set up resize observers and listeners
   */
  setup(): void;

  /**
   * Clean up resize observers and listeners
   */
  teardown(): void;

  /**
   * Manually trigger a resize
   * @param currentSize - Current canvas size to compare against
   */
  resize(currentSize: number): Promise<number>;

  /**
   * Clean up all resources
   */
  dispose(): void;
}
