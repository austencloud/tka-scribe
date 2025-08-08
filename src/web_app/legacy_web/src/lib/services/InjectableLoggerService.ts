/**
 * Injectable Logger Service
 * 
 * Provides logging functionality for the legacy web app.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: any;
}

export class InjectableLoggerService {
  private logLevel: LogLevel = LogLevel.INFO;
  private logs: LogEntry[] = [];
  private maxLogEntries: number = 1000;
  private enableConsoleOutput: boolean = true;

  constructor() {
    // Set log level based on environment
    if (typeof window !== 'undefined') {
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
      this.logLevel = isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    }
  }

  public debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  public info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  public warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  public error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  public getLogs(count?: number): LogEntry[] {
    if (count) {
      return this.logs.slice(-count);
    }
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level < this.logLevel) {
      return;
    }

    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data
    };

    this.addToLogs(logEntry);

    if (this.enableConsoleOutput) {
      this.outputToConsole(logEntry);
    }
  }

  private addToLogs(entry: LogEntry): void {
    this.logs.push(entry);

    if (this.logs.length > this.maxLogEntries) {
      this.logs.shift();
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context ? `[${entry.context}]` : '';
    const logMessage = `${timestamp} ${context} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(logMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, entry.data);
        break;
    }
  }

  public setConsoleOutput(enabled: boolean): void {
    this.enableConsoleOutput = enabled;
  }

  public setMaxLogEntries(max: number): void {
    this.maxLogEntries = max;
    
    if (this.logs.length > max) {
      this.logs = this.logs.slice(-max);
    }
  }
}

// Export singleton instance
const loggerService = new InjectableLoggerService();
export default loggerService;
