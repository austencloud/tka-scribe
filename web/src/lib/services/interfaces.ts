/**
 * Service Interfaces - Main Export
 *
 * Clean barrel export for all service interfaces.
 * This file now delegates to the organized interface files in the interfaces/ directory.
 *
 * ✅ REFACTORED: This 872-line monolith has been split into focused, domain-specific files:
 * - core-types.ts - Shared types and utilities
 * - sequence-interfaces.ts - Sequence management
 * - pictograph-interfaces.ts - Pictograph rendering
 * - positioning-interfaces.ts - Arrow positioning
 * - generation-interfaces.ts - Motion/sequence generation
 * - application-interfaces.ts - App settings and coordination
 * - browse-interfaces.ts - Browse and search
 * - device-interfaces.ts - Device detection
 * - export-interfaces.ts - Export and sequence cards
 * - panel-interfaces.ts - Panel management
 */

// Export everything from the organized interfaces directory
export * from "./interfaces";
