/**
 * Error Handling Service
 * 
 * Legacy service for backward compatibility
 */

import { errorLogger, type AppError, ErrorSeverity, ErrorCategory } from "$legacyLib/core/logging";

export { ErrorSeverity, ErrorCategory } from "$legacyLib/core/logging";

/**
 * Legacy error service for backward compatibility
 */
export const errorService = {
  log(error: AppError): void {
    errorLogger.log(error);
  },

  getErrors(): AppError[] {
    return errorLogger.getErrors();
  },

  clearErrors(): void {
    errorLogger.clearErrors();
  },

  createError(
    source: string,
    error: unknown,
    severity: ErrorSeverity = ErrorSeverity.ERROR,
    category?: ErrorCategory
  ): AppError {
    return errorLogger.createError(source, error, severity, category);
  }
};