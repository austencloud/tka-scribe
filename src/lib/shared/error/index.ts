/**
 * Error Handling Module
 *
 * Centralized error handling for user-facing error display and bug reporting.
 *
 * ## Quick Usage (no DI needed)
 *
 * ```ts
 * import { handleError, appError } from "$lib/shared/error";
 *
 * // Quick error display
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   handleError(error, {
 *     message: "Operation failed",
 *     context: { module: "myModule", action: "riskyOperation" }
 *   });
 * }
 *
 * // Or simpler:
 * appError.error("Something went wrong");
 * ```
 *
 * ## Full Control (via DI)
 *
 * ```ts
 * const errorService = resolve<IErrorHandlingService>(TYPES.IErrorHandlingService);
 * errorService.showUserError({ message: "...", severity: "critical" });
 * ```
 *
 * ## Setup
 *
 * Place <ErrorModal /> once at app root (MainApplication.svelte).
 */

export * from "./domain/error-models";
export * from "./state/error-state.svelte";
export { default as ErrorModal } from "./components/ErrorModal.svelte";

import type { ErrorContext, ShowErrorOptions } from "./domain/error-models";
import { showError } from "./state/error-state.svelte";

/**
 * Standalone error handler - use this when you don't want to resolve the service.
 *
 * This logs the error to console and shows a user-facing error modal.
 */
export function handleError(
  error: unknown,
  options?: {
    message?: string;
    context?: Partial<ErrorContext>;
    reportable?: boolean;
  }
): string {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  const message = options?.message || errorObj.message || "An unexpected error occurred";

  console.error(`Error${options?.context?.action ? ` in ${options.context.action}` : ""}:`, error);

  return showError({
    message,
    technicalDetails: errorObj.message !== message ? errorObj.message : undefined,
    error: errorObj,
    severity: "error",
    context: options?.context,
    reportable: options?.reportable ?? true,
  });
}
