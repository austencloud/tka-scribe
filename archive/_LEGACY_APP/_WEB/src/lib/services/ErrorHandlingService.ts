// src/lib/services/ErrorHandlingService.ts

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
  
  export class ErrorHandlingService {
    private static instance: ErrorHandlingService;
    private errors: AppError[] = [];
    private maxErrorCount = 100;
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
      const newError: AppError = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...error
      };
  
      // Trim error list if it exceeds max count
      if (this.errors.length >= this.maxErrorCount) {
        this.errors.shift();
      }
  
      this.errors.push(newError);
  
      // Dispatch to different logging methods based on environment and severity
      this.dispatchErrorLogging(newError);
    }
  
    /**
     * Get all current errors
     */
    public getErrors(): AppError[] {
      return [...this.errors];
    }
  
    /**
     * Clear all stored errors
     */
    public clearErrors(): void {
      this.errors = [];
    }
  
    /**
     * Dispatch error logging based on environment and severity
     */
    private dispatchErrorLogging(error: AppError): void {
      // Development logging - more verbose
      if (!this.isProduction) {
        console.group(`🚨 Error in ${error.source}`);
        console.error(error.message);
        if (error.stack) console.debug('Stack:', error.stack);
        if (error.context) console.debug('Context:', error.context);
        console.groupEnd();
      }
  
      // Production logging - more controlled
      if (this.isProduction) {
        if (error.severity === ErrorSeverity.CRITICAL) {
          // Potentially send to error tracking service
          this.reportCriticalError(error);
        }
  
        // Simple console logging in production
        console.error(`[${error.severity.toUpperCase()}] ${error.source}: ${error.message}`);
      }
    }
  
    /**
     * Report critical errors to external service
     * Note: Replace with actual error tracking service implementation
     */
    private reportCriticalError(error: AppError): void {
      // Placeholder for external error reporting (e.g., Sentry, LogRocket)
      console.warn('Critical Error Reported:', error);
    }
  
    /**
     * Create an error from an unknown error object
     */
    public createError(
      source: string, 
      error: unknown, 
      severity: ErrorSeverity = ErrorSeverity.ERROR
    ): AppError {
      if (error instanceof Error) {
        return {
          id: crypto.randomUUID(),
          source,
          message: error.message,
          stack: error.stack,
          timestamp: Date.now(),
          severity
        };
      }
  
      return {
        id: crypto.randomUUID(),
        source,
        message: String(error),
        timestamp: Date.now(),
        severity
      };
    }
  }
  
  // Singleton export for easy usage
  export const errorService = ErrorHandlingService.getInstance();