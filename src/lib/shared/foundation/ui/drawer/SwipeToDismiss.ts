/**
 * SwipeToDismissHandler - Manages swipe-to-dismiss gesture interactions
 *
 * Handles touch and mouse events for drawer dismissal with threshold-based detection.
 * Prevents conflicts with interactive elements and manages drag state.
 *
 * This is a plain helper class, not an inversify service - instantiated directly by components.
 */

import { createComponentLogger } from "$lib/shared/utils/debug-logger";
import { isTopDrawer } from "./DrawerStack";

const debug = createComponentLogger("SwipeToDismiss");

export type SwipePlacement = "bottom" | "top" | "right" | "left";

export interface SwipeToDismissOptions {
  placement: SwipePlacement;
  dismissible: boolean;
  onDismiss: () => void;
  /** Called during drag with current state. isDragging=true on start/move, false on end */
  onDragChange?: (offset: number, progress: number, isDragging: boolean) => void;
  /** Called when drag ends with offset, velocity (px/ms), and duration. Return true to prevent default dismiss. */
  onDragEnd?: (offset: number, velocity: number, duration: number) => boolean;
  /** Drawer ID for stack management - only top drawer responds to swipe */
  drawerId?: string;
}

export class SwipeToDismiss {
  private element: HTMLElement | null = null;
  private isDragging = false;
  private startY = 0;
  private currentY = 0;
  private startX = 0;
  private currentX = 0;
  private startTime = 0;
  private hasMoved = false;
  private startedOnInteractive = false;
  private justDragged = false;
  private cleanupFn: (() => void) | null = null;

  constructor(private options: SwipeToDismissOptions) {}

  /**
   * Attach event listeners to the target element
   */
  attach(element: HTMLElement) {
    this.detach(); // Clean up any previous listeners
    this.element = element;

    const handleStart = (e: TouchEvent | MouseEvent) => this.handleTouchStart(e);
    const handleMove = (e: TouchEvent | MouseEvent) => this.handleTouchMove(e);
    const handleEnd = (e: TouchEvent | MouseEvent) => this.handleTouchEnd(e);
    const handleClick = (e: MouseEvent) => this.handleClick(e);

    // Touch events - must all be {passive: false}
    element.addEventListener("touchstart", handleStart, { passive: false });
    element.addEventListener("touchmove", handleMove, { passive: false });
    element.addEventListener("touchend", handleEnd, { passive: false });

    // Mouse events - also need {passive: false}
    element.addEventListener("mousedown", handleStart, { passive: false });
    element.addEventListener("mousemove", handleMove, { passive: false });
    element.addEventListener("mouseup", handleEnd, { passive: false });
    element.addEventListener("mouseleave", handleEnd, { passive: false });

    // Click event - capture phase to intercept before button handlers
    element.addEventListener("click", handleClick, { capture: true });

    this.cleanupFn = () => {
      element.removeEventListener("touchstart", handleStart);
      element.removeEventListener("touchmove", handleMove);
      element.removeEventListener("touchend", handleEnd);
      element.removeEventListener("mousedown", handleStart);
      element.removeEventListener("mousemove", handleMove);
      element.removeEventListener("mouseup", handleEnd);
      element.removeEventListener("mouseleave", handleEnd);
      element.removeEventListener("click", handleClick, true);
    };
  }

  /**
   * Remove event listeners and clean up
   */
  detach() {
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = null;
    }
    this.element = null;
  }

  /**
   * Update options (e.g., when props change)
   */
  updateOptions(options: Partial<SwipeToDismissOptions>) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current drag state
   */
  getIsDragging(): boolean {
    return this.isDragging;
  }

  /**
   * Get current drag offset for Y axis
   */
  getDragOffsetY(): number {
    if (!this.isDragging) return 0;
    const delta = this.currentY - this.startY;

    if (this.options.placement === "bottom") {
      return Math.max(0, delta); // Only allow downward
    } else if (this.options.placement === "top") {
      return Math.min(0, delta); // Only allow upward
    }
    return 0;
  }

  /**
   * Get current drag offset for X axis
   */
  getDragOffsetX(): number {
    if (!this.isDragging) return 0;
    const delta = this.currentX - this.startX;

    if (this.options.placement === "right") {
      return Math.max(0, delta); // Only allow rightward
    } else if (this.options.placement === "left") {
      return Math.min(0, delta); // Only allow leftward
    }
    return 0;
  }

  /**
   * Reset drag state
   */
  reset() {
    this.isDragging = false;
    this.hasMoved = false;
    this.startedOnInteractive = false;
    this.justDragged = false;
    this.startY = 0;
    this.currentY = 0;
    this.startX = 0;
    this.currentX = 0;
  }

  private handleTouchStart(event: TouchEvent | MouseEvent) {
    if (!this.options.dismissible) return;

    // Only process if this drawer is the top drawer (prevents nested drawer conflicts)
    if (this.options.drawerId && !isTopDrawer(this.options.drawerId)) {
      return;
    }

    // Track if we started on an interactive element
    const target = event.target as HTMLElement;
    this.startedOnInteractive = !!(
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input") ||
      target.closest("select") ||
      target.closest("textarea")
    );

    if (event instanceof TouchEvent) {
      const touch = event.touches[0]!;
      this.startY = touch.clientY;
      this.startX = touch.clientX;
      this.currentY = this.startY;
      this.currentX = this.startX;
    } else {
      this.startY = event.clientY;
      this.startX = event.clientX;
      this.currentY = this.startY;
      this.currentX = this.startX;
    }
    this.startTime = Date.now();
    this.hasMoved = false;
    this.isDragging = true;

    // Notify drag started (offset 0, progress 1)
    this.reportDragProgress();
  }

  private handleTouchMove(event: TouchEvent | MouseEvent) {
    if (!this.isDragging || !this.options.dismissible) return;

    if (event instanceof TouchEvent) {
      const touch = event.touches[0]!;
      this.currentY = touch.clientY;
      this.currentX = touch.clientX;
    } else {
      this.currentY = event.clientY;
      this.currentX = event.clientX;
    }

    const deltaY = Math.abs(this.currentY - this.startY);
    const deltaX = Math.abs(this.currentX - this.startX);
    const movementThreshold = 5;

    if (deltaY > movementThreshold || deltaX > movementThreshold) {
      this.hasMoved = true;
      if (this.startedOnInteractive) {
        event.preventDefault();
      }
    }

    // Prevent default for valid drag directions
    if (this.options.placement === "bottom" && this.currentY - this.startY > 0) {
      event.preventDefault();
    } else if (this.options.placement === "top" && this.currentY - this.startY < 0) {
      event.preventDefault();
    } else if (this.options.placement === "right" && this.currentX - this.startX > 0) {
      event.preventDefault();
    } else if (this.options.placement === "left" && this.currentX - this.startX < 0) {
      event.preventDefault();
    }

    // Report drag progress
    this.reportDragProgress();
  }

  private handleTouchEnd(event: TouchEvent | MouseEvent) {
    if (!this.isDragging || !this.options.dismissible) return;

    const deltaY = this.currentY - this.startY;
    const deltaX = this.currentX - this.startX;
    const duration = Date.now() - this.startTime;

    if (this.startedOnInteractive && this.hasMoved) {
      event.preventDefault();
      event.stopPropagation();
      this.justDragged = true;
      setTimeout(() => {
        this.justDragged = false;
      }, 100);
    }

    this.isDragging = false;

    // Calculate offset based on placement
    const offset =
      this.options.placement === "right" || this.options.placement === "left"
        ? this.getDragOffsetXInternal(deltaX)
        : this.getDragOffsetYInternal(deltaY);

    // Calculate velocity (px/ms)
    const velocity = duration > 0 ? Math.abs(offset) / duration : 0;

    // Allow custom handler to intercept drag end (for snap points)
    if (this.options.onDragEnd) {
      const handled = this.options.onDragEnd(offset, velocity, duration);
      if (handled) {
        // Custom handler took over - reset and return
        this.startY = 0;
        this.currentY = 0;
        this.startX = 0;
        this.currentX = 0;
        this.options.onDragChange?.(0, 1, false);
        return;
      }
    }

    let wasAboveThreshold = false;

    // Check dismissal threshold based on placement
    if (this.options.placement === "bottom") {
      wasAboveThreshold = deltaY > 100 || (deltaY > 50 && duration < 500);
    } else if (this.options.placement === "top") {
      wasAboveThreshold = deltaY < -100 || (deltaY < -50 && duration < 500);
    } else if (this.options.placement === "right") {
      wasAboveThreshold = deltaX > 100 || (deltaX > 50 && duration < 500);
    } else if (this.options.placement === "left") {
      wasAboveThreshold = deltaX < -100 || (deltaX < -50 && duration < 500);
    }

    // Debug logging
    debug.log(`Swipe end: placement=${this.options.placement}, deltaX=${deltaX}, deltaY=${deltaY}, duration=${duration}ms, threshold=${wasAboveThreshold}`);

    this.startY = 0;
    this.currentY = 0;
    this.startX = 0;
    this.currentX = 0;

    // Notify drag ended (offset 0, progress 1, isDragging false)
    this.options.onDragChange?.(0, 1, false);

    if (wasAboveThreshold) {
      debug.log("Dismissing drawer");
      this.options.onDismiss();
    }
  }

  /** Internal offset calculation that takes the raw delta */
  private getDragOffsetYInternal(delta: number): number {
    if (this.options.placement === "bottom") {
      return Math.max(0, delta);
    } else if (this.options.placement === "top") {
      return Math.min(0, delta);
    }
    return 0;
  }

  /** Internal offset calculation that takes the raw delta */
  private getDragOffsetXInternal(delta: number): number {
    if (this.options.placement === "right") {
      return Math.max(0, delta);
    } else if (this.options.placement === "left") {
      return Math.min(0, delta);
    }
    return 0;
  }

  private handleClick(event: MouseEvent) {
    if (this.justDragged) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  private reportDragProgress() {
    if (!this.options.onDragChange || !this.isDragging) return;

    const offset =
      this.options.placement === "right" || this.options.placement === "left"
        ? this.getDragOffsetX()
        : this.getDragOffsetY();

    let progress = 0;
    if (this.options.placement === "right") {
      const drawerWidth = this.element?.offsetWidth || 600;
      progress = Math.max(0, Math.min(1, 1 - offset / drawerWidth));
    } else if (this.options.placement === "left") {
      const drawerWidth = this.element?.offsetWidth || 600;
      progress = Math.max(0, Math.min(1, 1 + offset / drawerWidth));
    } else if (this.options.placement === "bottom") {
      const drawerHeight = this.element?.offsetHeight || 400;
      progress = Math.max(0, Math.min(1, 1 - offset / drawerHeight));
    } else if (this.options.placement === "top") {
      const drawerHeight = this.element?.offsetHeight || 400;
      progress = Math.max(0, Math.min(1, 1 + offset / drawerHeight));
    }

    this.options.onDragChange(offset, progress, true);
  }
}
