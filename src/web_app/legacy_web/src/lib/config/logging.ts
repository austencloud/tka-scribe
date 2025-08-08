/**
 * Logging Configuration
 *
 * Central configuration for the application's logging system.
 */

import { LogLevel } from '$lib/core/logging/types';
import { browser } from '$app/environment';

/**
 * Logging configuration interface
 */
export interface LoggingConfig {
  defaultLogLevel: LogLevel;
  enableConsoleOutput: boolean;
  enableRemoteLogging: boolean;
  maxMemoryLogs: number;
  maxStorageLogs: number;
  remoteEndpoint?: string;
  domains: {
    [key: string]: LogLevel;
  };
  machineLogging: {
    logTransitions: boolean;
    performanceTracking: {
      enabled: boolean;
      transitionThreshold: number;
    };
  };
}

/**
 * Detect environment and set appropriate log level
 */
function getEnvironmentLogLevel(): LogLevel {
  if (!browser) {
    return LogLevel.INFO; // Server-side rendering
  }

  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return LogLevel.DEBUG;
  }

  // Check hostname for local development
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1') {
    return LogLevel.DEBUG;
  }

  // Production environment
  return LogLevel.INFO;
}

/**
 * Main logging configuration
 */
export const loggingConfig: LoggingConfig = {
  defaultLogLevel: getEnvironmentLogLevel(),
  enableConsoleOutput: true,
  enableRemoteLogging: false, // Disable for now
  maxMemoryLogs: 1000,
  maxStorageLogs: 500,
  remoteEndpoint: undefined, // Set this when remote logging is implemented

  // Domain-specific log levels
  domains: {
    'app': LogLevel.INFO,
    'pictograph': LogLevel.INFO,
    'sequence': LogLevel.INFO,
    'motion': LogLevel.INFO,
    'svg': LogLevel.WARN,
    'state': LogLevel.INFO,
    'component': LogLevel.INFO,
    'system': LogLevel.WARN,
    'background': LogLevel.INFO,
    'ui': LogLevel.INFO,
    'workbench': LogLevel.INFO,
    'learn': LogLevel.INFO,
    'browse': LogLevel.INFO
  },

  // Machine logging configuration
  machineLogging: {
    logTransitions: true,
    performanceTracking: {
      enabled: true,
      transitionThreshold: 100 // milliseconds
    }
  }
};

/**
 * Get log level for a specific domain
 */
export function getDomainLogLevel(domain: string): LogLevel {
  return loggingConfig.domains[domain] || loggingConfig.defaultLogLevel;
}

/**
 * Update log level for a specific domain
 */
export function setDomainLogLevel(domain: string, level: LogLevel): void {
  loggingConfig.domains[domain] = level;
}

/**
 * Enable or disable console output
 */
export function setConsoleOutput(enabled: boolean): void {
  loggingConfig.enableConsoleOutput = enabled;
}

/**
 * Enable or disable remote logging
 */
export function setRemoteLogging(enabled: boolean, endpoint?: string): void {
  loggingConfig.enableRemoteLogging = enabled;
  if (endpoint) {
    loggingConfig.remoteEndpoint = endpoint;
  }
}

/**
 * Get current logging configuration
 */
export function getLoggingConfig(): LoggingConfig {
  return { ...loggingConfig };
}

/**
 * Reset logging configuration to defaults
 */
export function resetLoggingConfig(): void {
  loggingConfig.defaultLogLevel = getEnvironmentLogLevel();
  loggingConfig.enableConsoleOutput = true;
  loggingConfig.enableRemoteLogging = false;
  loggingConfig.remoteEndpoint = undefined;

  // Reset domain levels to defaults
  Object.keys(loggingConfig.domains).forEach(domain => {
    loggingConfig.domains[domain] = LogLevel.INFO;
  });
}
