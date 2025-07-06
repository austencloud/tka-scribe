/**
 * Logging Configuration
 * 
 * Central place to configure logging behavior for the application.
 */

import { LogLevel } from '$lib/core/logging/types';

/**
 * Global logging configuration
 */
export const loggingConfig = {
  // Set to false to disable performance metrics in console
  enablePerformanceMetrics: false,
  
  // Default log level
  defaultLogLevel: LogLevel.ERROR,
  
  // Machine logging configuration
  machineLogging: {
    performanceTracking: {
      enabled: false,
      transitionThreshold: 50 // ms
    },
    logTransitions: false
  }
};
