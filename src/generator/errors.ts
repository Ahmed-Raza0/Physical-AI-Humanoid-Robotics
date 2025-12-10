/**
 * Custom error classes for textbook generation
 * Based on specs/main/data-model.md error handling requirements
 */

/**
 * Base error class for all generation-related errors
 */
export class GeneratorError extends Error {
  constructor(message: string, public readonly retryable: boolean = false) {
    super(message);
    this.name = 'GeneratorError';
    Object.setPrototypeOf(this, GeneratorError.prototype);
  }
}

/**
 * Error thrown when Claude API calls fail
 */
export class APIError extends GeneratorError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: unknown,
    retryable: boolean = false
  ) {
    super(message, retryable);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Error thrown when rate limits are exceeded
 */
export class RateLimitError extends APIError {
  constructor(
    message: string,
    public readonly retryAfterMs?: number
  ) {
    super(message, 429, undefined, true);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends GeneratorError {
  constructor(
    message: string,
    public readonly validationErrors: string[] = []
  ) {
    super(message, false);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Error thrown when file operations fail
 */
export class FileOperationError extends GeneratorError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly operation: 'read' | 'write' | 'delete' | 'create',
    retryable: boolean = false
  ) {
    super(message, retryable);
    this.name = 'FileOperationError';
    Object.setPrototypeOf(this, FileOperationError.prototype);
  }
}

/**
 * Error thrown when API requests timeout
 */
export class TimeoutError extends APIError {
  constructor(
    message: string,
    public readonly timeoutMs: number
  ) {
    super(message, 408, undefined, true);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends GeneratorError {
  constructor(
    message: string,
    public readonly configKey?: string
  ) {
    super(message, false);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

/**
 * Error thrown when template rendering fails
 */
export class TemplateError extends GeneratorError {
  constructor(
    message: string,
    public readonly templatePath?: string
  ) {
    super(message, false);
    this.name = 'TemplateError';
    Object.setPrototypeOf(this, TemplateError.prototype);
  }
}

/**
 * Type guard to check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof GeneratorError) {
    return error.retryable;
  }
  return false;
}

/**
 * Extracts error message from unknown error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Creates a standardized GenerationError from unknown error
 */
export function toGenerationError(
  error: unknown,
  context: string
): GeneratorError {
  if (error instanceof GeneratorError) {
    return error;
  }

  const message = getErrorMessage(error);
  return new GeneratorError(`${context}: ${message}`, false);
}
