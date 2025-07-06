// src/lib/services/ErrorHandlingService.ts

import { browser } from '$app/environment';
import {
	errorLogger,
	ErrorSeverity as LogErrorSeverity,
	ErrorCategory,
	type AppError as LogAppError
} from '$lib/core/logging/error-logger';

// Re-export error severity for backward compatibility
export enum ErrorSeverity {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
	CRITICAL = 'critical'
}

// Map old severity to new severity
const severityMap = {
	[ErrorSeverity.INFO]: LogErrorSeverity.INFO,
	[ErrorSeverity.WARNING]: LogErrorSeverity.WARNING,
	[ErrorSeverity.ERROR]: LogErrorSeverity.ERROR,
	[ErrorSeverity.CRITICAL]: LogErrorSeverity.CRITICAL
};

// Re-export AppError interface for backward compatibility
export interface AppError {
	id: string;
	source: string;
	message: string;
	timestamp: number;
	stack?: string;
	severity: ErrorSeverity;
	context?: Record<string, any>;
}

/**
 * ErrorHandlingService - Legacy service that now delegates to the new error logger
 *
 * This maintains backward compatibility while using the new logging system.
 */
export class ErrorHandlingService {
	private static instance: ErrorHandlingService;
	private isProduction: boolean;

	private constructor() {
		this.isProduction = import.meta.env.PROD;
	}

	public static getInstance(): ErrorHandlingService {
		if (!ErrorHandlingService.instance) {
			ErrorHandlingService.instance = new ErrorHandlingService();
		}
		return ErrorHandlingService.instance;
	}

	/**
	 * Log an error with comprehensive details
	 */
	public log(error: Omit<AppError, 'id' | 'timestamp'>): void {
		// Map to new error logger format
		errorLogger.log({
			source: error.source,
			message: error.message,
			stack: error.stack,
			severity: severityMap[error.severity] || LogErrorSeverity.ERROR,
			context: error.context
		});
	}

	/**
	 * Report an error (alias for log for backward compatibility)
	 */
	public reportError(error: Omit<AppError, 'id' | 'timestamp'>): void {
		this.log(error);
	}

	/**
	 * Get all current errors
	 */
	public getErrors(): AppError[] {
		// Map from new error logger format to old format
		return errorLogger.getErrors().map((error) => ({
			id: error.id,
			source: error.source,
			message: error.message,
			timestamp: error.timestamp,
			stack: error.stack,
			severity: this.mapSeverityBack(error.severity),
			context: error.context
		}));
	}

	/**
	 * Clear all stored errors
	 */
	public clearErrors(): void {
		errorLogger.clearErrors();
	}

	/**
	 * Create an error from an unknown error object
	 */
	public createError(
		source: string,
		error: unknown,
		severity: ErrorSeverity = ErrorSeverity.ERROR
	): AppError {
		// Use the new error logger to create the error
		const newError = errorLogger.createError(
			source,
			error,
			severityMap[severity] || LogErrorSeverity.ERROR
		);

		// Map back to old format
		return {
			id: newError.id,
			source: newError.source,
			message: newError.message,
			stack: newError.stack,
			timestamp: newError.timestamp,
			severity: this.mapSeverityBack(newError.severity),
			context: newError.context
		};
	}

	/**
	 * Map new severity back to old severity
	 */
	private mapSeverityBack(severity: LogErrorSeverity): ErrorSeverity {
		switch (severity) {
			case LogErrorSeverity.INFO:
				return ErrorSeverity.INFO;
			case LogErrorSeverity.WARNING:
				return ErrorSeverity.WARNING;
			case LogErrorSeverity.ERROR:
				return ErrorSeverity.ERROR;
			case LogErrorSeverity.CRITICAL:
				return ErrorSeverity.CRITICAL;
			default:
				return ErrorSeverity.ERROR;
		}
	}
}

// Singleton export for easy usage
export const errorService = ErrorHandlingService.getInstance();
