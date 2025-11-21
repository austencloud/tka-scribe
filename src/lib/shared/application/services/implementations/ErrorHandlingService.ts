import { injectable } from "inversify";

import type { IErrorHandlingService } from "../contracts/IErrorHandlingService";

/**
 * Error Handling Service Implementation
 *
 * Centralized error handling and reporting for the application.
 */
@injectable()
export class ErrorHandlingService implements IErrorHandlingService {
  private errors: Array<{ error: Error; context?: string; timestamp: Date }> =
    [];
  private criticalErrors: Array<{
    error: Error;
    context?: string;
    timestamp: Date;
  }> = [];

  handleError(error: Error, context?: string): void {
    const errorEntry = {
      error,
      ...(context && { context }),
      timestamp: new Date(),
    };

    this.errors.push(errorEntry);

    console.error(
      `🚨 Error ${context ? `in ${context}` : ""}: ${error.message}`,
      error
    );

    // Keep only last 100 errors to prevent memory issues
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  }

  reportCriticalError(error: Error, context?: string): void {
    const errorEntry = {
      error,
      ...(context && { context }),
      timestamp: new Date(),
    };

    this.criticalErrors.push(errorEntry);
    this.handleError(error, context); // Also log as regular error

    console.error(
      `🔥 CRITICAL ERROR ${context ? `in ${context}` : ""}: ${error.message}`,
      error
    );

    // Keep only last 50 critical errors
    if (this.criticalErrors.length > 50) {
      this.criticalErrors = this.criticalErrors.slice(-50);
    }

    // TODO: Add critical error reporting (e.g., to external service)
  }

  getErrorStats(): {
    totalErrors: number;
    criticalErrors: number;
    lastError?: Date;
  } {
    const lastErrorEntry = this.errors[this.errors.length - 1];
    return {
      totalErrors: this.errors.length,
      criticalErrors: this.criticalErrors.length,
      ...(lastErrorEntry && { lastError: lastErrorEntry.timestamp }),
    };
  }

  clearErrors(): void {
    this.errors = [];
    this.criticalErrors = [];
    console.log("🧹 ErrorHandlingService: Error history cleared");
  }
}
