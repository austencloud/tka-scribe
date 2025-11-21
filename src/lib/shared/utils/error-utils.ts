/**
 * Utility functions for type-safe error handling
 */

/**
 * Type guard to check if an error has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

/**
 * Type guard to check if an error has a code property (e.g., Firebase errors)
 */
export function hasCode(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  );
}

/**
 * Type guard for Firebase Auth errors
 */
export function isFirebaseError(
  error: unknown
): error is { code: string; message: string } {
  return hasCode(error) && hasMessage(error);
}

/**
 * Extract error message from unknown error type
 * @param error - The error to extract message from
 * @param fallback - Fallback message if extraction fails
 * @returns The extracted error message or fallback
 */
export function getErrorMessage(
  error: unknown,
  fallback = "An unknown error occurred"
): string {
  if (hasMessage(error)) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}

/**
 * Extract error code from unknown error type (useful for Firebase errors)
 * @param error - The error to extract code from
 * @returns The error code if available, null otherwise
 */
export function getErrorCode(error: unknown): string | null {
  if (hasCode(error)) {
    return error.code;
  }
  return null;
}
