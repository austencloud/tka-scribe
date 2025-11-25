/**
 * Custom Error Classes for Generation Module
 *
 * Provides structured error types for better error handling and debugging
 */

/**
 * Base class for all generation-related errors
 */
export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "GenerationError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GenerationError);
    }
  }
}

/**
 * Thrown when validation of generation configuration fails
 */
export class ValidationError extends GenerationError {
  constructor(
    message: string,
    public readonly field?: string,
    context?: Record<string, unknown>
  ) {
    super(message, "VALIDATION_ERROR", { ...context, field });
    this.name = "ValidationError";
  }
}

/**
 * Thrown when CAP execution fails
 */
export class CAPExecutionError extends GenerationError {
  constructor(
    message: string,
    public readonly capType?: string,
    context?: Record<string, unknown>
  ) {
    super(message, "CAP_EXECUTION_ERROR", { ...context, capType });
    this.name = "CAPExecutionError";
  }
}

/**
 * Thrown when sequence generation fails
 */
export class SequenceGenerationError extends GenerationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "SEQUENCE_GENERATION_ERROR", context);
    this.name = "SequenceGenerationError";
  }
}

/**
 * Thrown when filtering produces no valid options
 */
export class FilteringError extends GenerationError {
  constructor(
    message: string,
    public readonly filterType?: string,
    context?: Record<string, unknown>
  ) {
    super(message, "FILTERING_ERROR", { ...context, filterType });
    this.name = "FilteringError";
  }
}

/**
 * Thrown when required configuration is missing
 */
export class ConfigurationError extends GenerationError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONFIGURATION_ERROR", context);
    this.name = "ConfigurationError";
  }
}
