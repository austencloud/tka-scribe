/**
 * Animation Controls V2
 *
 * Modern, tiered animation controls with progressive disclosure.
 * Barrel export for all v2 components.
 */

// Types and utilities
export {
	TRAIL_PRESETS,
	getPresetById,
	detectActivePreset,
	isModifiedFromPreset,
	applyPreset,
	type TrailPreset,
	type TrailPresetId
} from './TrailPresets';

// Components
export { default as AnimationControlsV2 } from './AnimationControlsV2.svelte';
export { default as FloatingControlBar } from './FloatingControlBar.svelte';
export { default as BpmControl } from './BpmControl.svelte';
export { default as PlayPauseButton } from './PlayPauseButton.svelte';
export { default as QuickTogglesRow } from './QuickTogglesRow.svelte';
export { default as VisibilityChip } from './VisibilityChip.svelte';
export { default as TrailPresetPicker } from './TrailPresetPicker.svelte';
export { default as TrailPresetPanel } from './TrailPresetPanel.svelte';
export { default as AdvancedSettingsDrawer } from './AdvancedSettingsDrawer.svelte';
