/**
 * Toast State - Simple toast notification system
 *
 * Provides a lightweight way to show temporary messages to users.
 */

export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  timestamp: number;
}

// Reactive toast queue
export const toastQueue = $state<Toast[]>([]);

let toastIdCounter = 0;

/**
 * Show a toast notification
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  duration: number = 3000
): string {
  const id = `toast_${++toastIdCounter}_${Date.now()}`;

  const toast: Toast = {
    id,
    message,
    type,
    duration,
    timestamp: Date.now(),
  };

  toastQueue.push(toast);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

/**
 * Remove a specific toast by ID
 */
export function removeToast(id: string): void {
  const index = toastQueue.findIndex((t) => t.id === id);
  if (index !== -1) {
    toastQueue.splice(index, 1);
  }
}

/**
 * Clear all toasts
 */
export function clearToasts(): void {
  toastQueue.length = 0;
}

// Convenience methods
export const toast = {
  info: (message: string, duration?: number) =>
    showToast(message, "info", duration),
  success: (message: string, duration?: number) =>
    showToast(message, "success", duration),
  warning: (message: string, duration?: number) =>
    showToast(message, "warning", duration),
  error: (message: string, duration?: number) =>
    showToast(message, "error", duration),
};
