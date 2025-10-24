/**
 * Hover Controller
 *
 * Manages hover interactions with intelligent timeout handling to prevent race conditions.
 * Provides smooth hover-to-open and hover-away-to-close behavior for dropdowns and modals.
 */

export interface HoverControllerConfig {
  /** Delay in ms before opening (default: 100) */
  openDelay?: number;
  /** Delay in ms before closing (default: 300) */
  closeDelay?: number;
  /** Whether hover behavior is enabled (default: true) */
  enabled?: boolean;
}

export type HoverControllerCallbacks = {
  onOpen: () => void;
  onClose: () => void;
};

/**
 * HoverController - Manages hover-based UI interactions with timeout handling
 *
 * Prevents race conditions by tracking timeout IDs and invalidating stale timeouts.
 * Provides methods for enter/leave events and cleanup.
 */
export class HoverController {
  private config: Required<HoverControllerConfig>;
  private callbacks: HoverControllerCallbacks;

  private openTimeout: ReturnType<typeof setTimeout> | null = null;
  private closeTimeout: ReturnType<typeof setTimeout> | null = null;

  // Track timeout IDs to prevent race conditions
  private currentOpenTimeoutId = 0;
  private currentCloseTimeoutId = 0;

  private isOpen = false;

  constructor(
    callbacks: HoverControllerCallbacks,
    config: HoverControllerConfig = {}
  ) {
    this.callbacks = callbacks;
    this.config = {
      openDelay: config.openDelay ?? 100,
      closeDelay: config.closeDelay ?? 300,
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Handle mouse enter event
   * Starts a timer to open after delay, cancels any pending close
   */
  public onMouseEnter(): void {
    if (!this.config.enabled) return;

    // Clear any existing timeouts
    this.clearOpenTimeout();
    this.clearCloseTimeout();

    // Increment close timeout ID to invalidate any pending closes
    this.currentCloseTimeoutId++;

    // If already open, do nothing
    if (this.isOpen) return;

    // Set timeout to open with ID tracking
    const timeoutId = ++this.currentOpenTimeoutId;
    this.openTimeout = setTimeout(() => {
      // Check if this timeout is still valid
      if (timeoutId === this.currentOpenTimeoutId) {
        this.open();
      }
    }, this.config.openDelay);
  }

  /**
   * Handle mouse leave event
   * Starts a timer to close after delay, cancels any pending open
   */
  public onMouseLeave(): void {
    if (!this.config.enabled) return;

    // Clear any pending open timeout
    this.clearOpenTimeout();

    // Increment open timeout ID to invalidate any pending opens
    this.currentOpenTimeoutId++;

    // Set timeout to close with ID tracking
    const timeoutId = ++this.currentCloseTimeoutId;
    this.closeTimeout = setTimeout(() => {
      // Check if this timeout is still valid
      if (timeoutId === this.currentCloseTimeoutId) {
        this.close();
      }
    }, this.config.closeDelay);
  }

  /**
   * Keep open - cancels any pending close timeouts
   * Useful when hovering over the opened element itself
   */
  public keepOpen(): void {
    if (!this.config.enabled) return;

    // Clear any pending close timeout
    this.clearCloseTimeout();

    // Invalidate any pending close timeouts
    this.currentCloseTimeoutId++;
  }

  /**
   * Immediately open without delay
   */
  public openImmediately(): void {
    this.clearAllTimeouts();
    this.open();
  }

  /**
   * Immediately close without delay
   */
  public closeImmediately(): void {
    this.clearAllTimeouts();
    this.close();
  }

  /**
   * Toggle open/close state immediately
   */
  public toggle(): void {
    if (this.isOpen) {
      this.closeImmediately();
    } else {
      this.openImmediately();
    }
  }

  /**
   * Get current open state
   */
  public getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<HoverControllerConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }

  /**
   * Enable hover behavior
   */
  public enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable hover behavior (useful for mobile)
   */
  public disable(): void {
    this.config.enabled = false;
    this.clearAllTimeouts();
  }

  /**
   * Cleanup - clear all timeouts and reset state
   */
  public cleanup(): void {
    this.clearAllTimeouts();
    this.isOpen = false;
  }

  // Private methods

  private open(): void {
    this.isOpen = true;
    this.callbacks.onOpen();
  }

  private close(): void {
    this.isOpen = false;
    this.callbacks.onClose();
  }

  private clearOpenTimeout(): void {
    if (this.openTimeout) {
      clearTimeout(this.openTimeout);
      this.openTimeout = null;
    }
  }

  private clearCloseTimeout(): void {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  private clearAllTimeouts(): void {
    this.clearOpenTimeout();
    this.clearCloseTimeout();
  }
}
