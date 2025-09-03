/**
 * Domain Barrel Exports
 *
 * Clean barrel export structure - each subdomain manages its own exports
 */

// Domain barrel exports (no conflicts)
export * from "./animator";
export * from "./browse";
export * from "./core";
export * from "./learn";

// Build domain - export everything except conflicting types
export * from "./build";

// Word-cards domain - export everything except conflicting types
export * from "./word-cards";

// Top-level schemas
export * from "./schemas";
