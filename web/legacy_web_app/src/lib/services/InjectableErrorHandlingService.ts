/**
 * Injectable Error Handling Service
 * 
 * Implements the ErrorHandler interface for dependency injection
 */

import { Injectable } from "$legacyLib/core/di/ServiceDecorator";
import { SERVICE_TOKENS } from "$legacyLib/core/di/ServiceTokens";
import { errorLogger, type AppError, ErrorSeverity, ErrorCategory } from "$legacyLib/core/logging";
import type { ErrorHandler, ErrorLogEntry } from "$legacyLib/core/services/ErrorHandling";

@Injectable(SERVICE_TOKENS.ERROR_HANDLER)
export class InjectableErrorHandlingService implements ErrorHandler {
  /**
   * Log an error
   */
  log(error: ErrorLogEntry): void {
    errorLogger.log(error);
  }

  /**
   * Get all current errors
   */
  getErrors(): AppError[] {
    return errorLogger.getErrors();
  }

  /**
   * Clear all stored errors
   */
  clearErrors(): void {
    errorLogger.clearErrors();
  }

  /**
   * Create an error from an unknown error object
   */
  createError(
    source: string,
    error: unknown,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category?: ErrorCategory
  ): AppError {
    return errorLogger.createError(source, error, severity, category);
  }
}