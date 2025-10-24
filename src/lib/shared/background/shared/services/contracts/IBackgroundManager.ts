/**
 * Background Manager Interface
 *
 * Interface for managing background canvas animation and lifecycle.
 * Handles canvas initialization, animation loops, performance tracking, and cleanup.
 */

import type { Dimensions, PerformanceMetrics } from "$shared";

export interface IBackgroundManager {
  /**
   * Set state callbacks for reactive updates
   * This allows the service to communicate with state management without holding state
   */
  setStateCallbacks(callbacks: {
    onDimensionsChange?: (dimensions: Dimensions) => void;
    onMetricsChange?: (metrics: PerformanceMetrics) => void;
    shouldRender?: () => boolean;
  }): void;

  /**
   * Initialize the canvas for background rendering
   */
  initializeCanvas(canvas: HTMLCanvasElement, onReady?: () => void): void;

  /**
   * Start the animation loop with custom render function
   */
  startAnimation(
    renderFn: (ctx: CanvasRenderingContext2D, dimensions: Dimensions) => void,
    reportFn?: (metrics: PerformanceMetrics) => void
  ): void;

  /**
   * Stop the current animation loop
   */
  stopAnimation(): void;

  /**
   * Clean up all resources and event listeners
   */
  cleanup(): void;

  // Quality and loading state are now managed by separate state layer
  // These methods removed to maintain clean separation of concerns
}
