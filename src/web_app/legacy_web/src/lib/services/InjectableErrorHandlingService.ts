/**
 * Injectable Error Handling Service
 * 
 * Minimal implementation for legacy web app compatibility.
 */

export class InjectableErrorHandlingService {
  private enabled: boolean = true;

  constructor() {
    // Set up basic error handling
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private setupGlobalErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message), 'high', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(`Unhandled Promise Rejection: ${event.reason}`), 'high');
    });
  }

  public handleError(error: Error, severity: string = 'medium', context?: any): void {
    if (!this.enabled) return;

    console.error(`[${severity.toUpperCase()}] ${error.message}`, { error, context });
  }

  public reportError(error: Error, context?: any): void {
    this.handleError(error, 'high', context);
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
const errorHandlingService = new InjectableErrorHandlingService();
export default errorHandlingService;
