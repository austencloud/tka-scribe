/**
 * Injectable Logger Service
 * 
 * Provides the logger as an injectable service for the DI system.
 */

import { Injectable } from '$lib/core/di/ServiceDecorator';
import { SERVICE_TOKENS } from '$lib/core/di/ServiceTokens';
import { logger, type Logger } from '$lib/core/logging';

@Injectable(SERVICE_TOKENS.LOGGER)
export class InjectableLoggerService implements Logger {
  // Simply delegate all methods to the singleton logger
  
  trace(message: string, params?: any): void {
    return logger.trace(message, params);
  }
  
  debug(message: string, params?: any): void {
    return logger.debug(message, params);
  }
  
  info(message: string, params?: any): void {
    return logger.info(message, params);
  }
  
  warn(message: string, params?: any): void {
    return logger.warn(message, params);
  }
  
  error(message: string, params?: any): void {
    return logger.error(message, params);
  }
  
  fatal(message: string, params?: any): void {
    return logger.fatal(message, params);
  }
  
  log(level: any, message: string, params?: any): void {
    return logger.log(level, message, params);
  }
  
  withContext(context: any): Logger {
    return logger.withContext(context);
  }
  
  startTimer(operation: string): any {
    return logger.startTimer(operation);
  }
  
  pictograph(message: string, params: any): void {
    return logger.pictograph(message, params);
  }
  
  svgError(message: string, params: any): void {
    return logger.svgError(message, params);
  }
  
  transition(params: any): void {
    return logger.transition(params);
  }
  
  setConfig(config: any): void {
    return logger.setConfig(config);
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
