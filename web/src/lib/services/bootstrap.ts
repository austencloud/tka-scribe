/**
 * Application Bootstrap - TKA V2 Modern (InversifyJS)
 *
 * This module exports the InversifyJS container and resolve function.
 * All legacy DI system functions have been removed.
 */

// Re-export everything from the inversify container
export { container, resolve, TYPES } from "./inversify/container";
