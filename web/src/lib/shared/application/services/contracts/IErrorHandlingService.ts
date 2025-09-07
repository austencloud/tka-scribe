/**
 * Error Handling Service Interface
 * 
 * Centralized error handling and reporting for the application.
 */

export interface IErrorHandlingService {
  /**
   * Handle and log an error
   */
  handleError(error: Error, context?: string): void;

  /**
   * Report a critical error
   */
  reportCriticalError(error: Error, context?: string): void;

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    criticalErrors: number;
    lastError?: Date;
  };

  /**
   * Clear error history
   */
  clearErrors(): void;
}
