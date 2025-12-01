/**
 * Shared Animation Components
 *
 * Reusable animation components for use across the app.
 * These components are used by multiple modules (animate, create, edit, share, train, etc.)
 */

// Core canvas infrastructure
export { default as AnimatorCanvas } from './AnimatorCanvas.svelte';
export { default as GlyphRenderer } from './GlyphRenderer.svelte';

// High-level animation viewers/panels
export { default as AnimationPanel } from './AnimationPanel.svelte';
export { default as ShareAnimationViewer } from './ShareAnimationViewer.svelte';

// Sequence browsing (used across many modules)
export { default as SequenceBrowserPanel } from './SequenceBrowserPanel.svelte';

// Trail settings UI
export { default as TrailSettingsChips } from './TrailSettingsChips.svelte';
