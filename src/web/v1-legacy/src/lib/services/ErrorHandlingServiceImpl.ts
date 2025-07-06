import { ErrorSeverity, type AppError, type ErrorHandler } from '$lib/core/services/ErrorHandling';
import { browser } from '$app/environment';

export class ErrorHandlingServiceImpl implements ErrorHandler {
	private errors: AppError[] = [];
	private maxErrorCount = 100;
	private isProduction = import.meta.env.PROD;

	log(error: Omit<AppError, 'id' | 'timestamp'>): void {
		const newError: AppError = {
			id: browser ? crypto.randomUUID() : `error-${Date.now()}`,
			timestamp: Date.now(),
			...error
		};

		if (this.errors.length >= this.maxErrorCount) {
			this.errors.shift();
		}

		this.errors.push(newError);
		this.dispatchErrorLogging(newError);
	}

	getErrors(): AppError[] {
		return [...this.errors];
	}

	clearErrors(): void {
		this.errors = [];
	}

	createError(
		source: string,
		error: unknown,
		severity: ErrorSeverity = ErrorSeverity.ERROR
	): AppError {
		if (error instanceof Error) {
			return {
				id: browser ? crypto.randomUUID() : `error-${Date.now()}`,
				source,
				message: error.message,
				stack: error.stack,
				timestamp: Date.now(),
				severity
			};
		}

		return {
			id: browser ? crypto.randomUUID() : `error-${Date.now()}`,
			source,
			message: String(error),
			timestamp: Date.now(),
			severity
		};
	}

	private dispatchErrorLogging(error: AppError): void {
		if (!this.isProduction) {
			console.group(`🚨 Error in ${error.source}`);
			console.error(error.message);
			if (error.stack) console.debug('Stack:', error.stack);
			if (error.context) console.debug('Context:', error.context);
			console.groupEnd();
		} else if (error.severity === ErrorSeverity.CRITICAL) {
			console.error(`[${error.severity.toUpperCase()}] ${error.source}: ${error.message}`);
			// Here you could add reporting to an error tracking service
		}
	}
}
