/**
 * TKA Export Services
 * 
 * Clean, focused export services that provide desktop-compatible
 * image export functionality for TKA sequences.
 * 
 * ARCHITECTURE:
 * - ImageExportService: Main orchestrator (like desktop ImageExportManager)
 * - Layout services: Exact desktop layout tables and calculations
 * - Rendering services: Beat and canvas rendering with SVG conversion
 * - Text services: Word, user info, and difficulty badge rendering
 * - File services: Browser download and format conversion
 */

// Export all contracts (interfaces)
export * from './contracts';

// Export all implementations
export * from './implementations';

// Main export service type symbol (for DI container)
export const IMAGE_EXPORT_SERVICE = Symbol.for('IImageExportService');
