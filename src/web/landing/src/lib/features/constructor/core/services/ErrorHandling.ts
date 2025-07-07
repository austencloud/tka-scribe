export enum ErrorSeverity {
	INFO = 'info',
	WARNING = 'warning',
	ERROR = 'error',
	CRITICAL = 'critical'
}

export interface AppError {
	id: string;
	source: string;
	message: string;
	timestamp: number;
	stack?: string;
	severity: ErrorSeverity;
	context?: Record<string, any>;
}

export interface ErrorHandler {
	log(error: Omit<AppError, 'id' | 'timestamp'>): void;
	getErrors(): AppError[];
	clearErrors(): void;
	createError(source: string, error: unknown, severity?: ErrorSeverity): AppError;
}
