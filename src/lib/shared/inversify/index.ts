// Public entrypoint for the DI layer; keeps lazy-loading helpers together.
export * from "./di";

// Legacy bootstrap hook for tools/scripts that still call it directly.
export { initializeInversifyContainer } from "./bootstrap";
