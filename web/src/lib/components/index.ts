/**
 * Components Module - Main entry point for all TKA components
 *
 * Provides barrel exports for all component categories with domain-specific
 * naming to avoid conflicts between similar components in different contexts.
 */

// Organized component categories with barrel exports
export * from "./about";
export * from "./animator";
export * from "./browse";
export * from "./build";
export * from "./core";
export * from "./learn";
export * from "./word-card";
export * from "./write";

// Top-level app components
export { default as SettingsDialog } from "./core/settings/SettingsDialog.svelte";

// Individual component exports for directories without index.ts
export { default as BrowseTab } from "./browse/BrowseTab.svelte";
export { default as LearnTab } from "./learn/quiz/LearnTab.svelte";

// Missing components that are being imported
export { default as BrowseLoadingOverlay } from "./browse/BrowseLoadingOverlay.svelte";
export { default as SequenceBrowserGrid } from "./browse/browser/SequenceBrowserGrid.svelte";
export { default as BrowseSequenceThumbnail } from "./browse/thumbnail/BrowseSequenceThumbnail.svelte";
