/**
 * Core Domain Types
 *
 * Export point for core domain types and fundamental data structures.
 */

// Export from new models directory
export * from "../models/core/ApplicationTypes";
export * from "../models/core/DeviceTypes";
export * from "../models/core/Letter";
export * from "../models/core/SequenceData";
export * from "./AppSettings";
export * from "./pictograph";
export * from "./ui";

// Note: Types from other domain areas are exported directly from domain/index.ts
// to avoid duplicate exports. Import them directly from their source modules.
