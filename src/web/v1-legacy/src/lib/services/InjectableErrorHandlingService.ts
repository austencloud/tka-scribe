import { ErrorSeverity, type AppError, type ErrorHandler } from '$lib/core/services/ErrorHandling';
import { Injectable } from '$lib/core/di/ServiceDecorator';
import { SERVICE_TOKENS } from '$lib/core/di/ServiceTokens';
import { browser } from '$app/environment';
import { errorLogger, ErrorSeverity as LogErrorSeverity } from '$lib/core/logging/error-logger';

/**
 * Injectable Error Handling Service
 *
 * Implements the ErrorHandler interface for dependency injection
 * and delegates to the unified error logger.
 */
@Injectable(SERVICE_TOKENS.ERROR_HANDLER)
export class InjectableErrorHandlingService implements ErrorHandler {
	// Map old severity to new severity
	private severityMap = {
		[ErrorSeverity.INFO]: LogErrorSeverity.INFO,
		[ErrorSeverity.WARNING]: LogErrorSeverity.WARNING,
		[ErrorSeverity.ERROR]: LogErrorSeverity.ERROR,
		[ErrorSeverity.CRITICAL]: LogErrorSeverity.CRITICAL
	};

	log(error: Omit<AppError, 'id' | 'timestamp'>): void {
		// Delegate to the unified error logger
		errorLogger.log({
			source: error.source,
			message: error.message,
			stack: error.stack,
			severity: this.severityMap[error.severity] || LogErrorSeverity.ERROR,
			context: error.context
		});
	}

	getErrors(): AppError[] {
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

	clearErrors(): void {
		errorLogger.clearErrors();
	}

	createError(
		source: string,
		error: unknown,
		severity: ErrorSeverity = ErrorSeverity.ERROR
	): AppError {
		// Use the new error logger to create the error
		const newError = errorLogger.createError(
			source,
			error,
			this.severityMap[severity] || LogErrorSeverity.ERROR
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
