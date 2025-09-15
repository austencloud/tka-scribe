/**
 * Error Handling Service Interface
 * 
 * Provides a unified interface for error handling across the application
 */

import type { ErrorSeverity, ErrorCategory, AppError } from "$legacyLib/core/logging";

export { ErrorSeverity, ErrorCategory } from "$legacyLib/core/logging";

/**
 * Error log entry interface
 */
export interface ErrorLogEntry {
  source: string;
  message: string;
  severity: ErrorSeverity;
  category?: ErrorCategory;
  context?: Record<string, any>;
  stack?: string;
  recoverable?: boolean;
  recoverySuggestion?: string;
  errorCode?: string;
}

/**
 * Error Handler interface for dependency injection
 */
export interface ErrorHandler {
  /**
   * Log an error
   */
  log(error: ErrorLogEntry): void;

  /**
   * Get all current errors
   */
  getErrors(): AppError[];

  /**
   * Clear all stored errors
   */
  clearErrors(): void;

  /**
   * Create an error from an unknown error object
   */
  createError(
    source: string,
    error: unknown,
    severity?: ErrorSeverity,
    category?: ErrorCategory
  ): AppError;
}