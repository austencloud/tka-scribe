/**
 * Injectable Logger Service
 */

import { Injectable } from "$legacyLib/core/di/ServiceDecorator";
import { SERVICE_TOKENS } from "$legacyLib/core/di/ServiceTokens";
import { logger } from "$legacyLib/core/logging";
import type { Logger } from "$legacyLib/core/logging/types";

@Injectable(SERVICE_TOKENS.LOGGER)
export class InjectableLoggerService implements Logger {
  // Delegate all methods to the singleton logger
  trace(message: string, params?: any): void {
    logger.debug(message, params);
  }

  debug(message: string, params?: any): void {
    logger.debug(message, params);
  }

  info(message: string, params?: any): void {
    logger.info(message, params);
  }

  warn(message: string, params?: any): void {
    logger.warn(message, params);
  }

  error(message: string, params?: any): void {
    logger.error(message, params);
  }

  fatal(message: string, params?: any): void {
    logger.fatal(message, params);
  }

  log(level: any, message: string, params?: any): void {
    // Use the logger's log method directly with proper typing
    logger.log(level, message, params);
  }

  pictograph(message: string, params: {
    letter?: string;
    gridMode?: string;
    componentState?: string;
    renderMetrics?: any;
    error?: Error;
    data?: Record<string, unknown>;
  }): void {
    logger.pictograph(message, params);
  }

  svgError(message: string, params: {
    path?: string;
    component?: string;
    fallbackApplied?: boolean;
    error?: Error;
    data?: Record<string, unknown>;
  }): void {
    logger.svgError(message, params);
  }

  transition(params: {
    machine: string;
    from: string;
    to: string;
    event: string;
    duration?: number;
    data?: Record<string, unknown>;
  }): void {
    logger.transition(params);
  }

  withContext(context: any): Logger {
    return logger.withContext(context);
  }

  startTimer(operation: string): any {
    return logger.startTimer(operation);
  }

  setConfig(config: any): void {
    logger.setConfig(config);
  }

  getConfig(): any {
    return logger.getConfig();
  }

  isEnabled(level: any): boolean {
    return logger.isEnabled(level);
  }

  createChildLogger(source: string, context?: any): Logger {
    return logger.createChildLogger(source, context);
  }
}