/**
 * Shared Animation State
 *
 * Exports for animation state management.
 */

// Settings state (persisted, global singleton)
export {
	// State factory and instance
	createAnimationSettingsState,
	animationSettings,
	// Types
	type AnimationSettingsState,
	type AnimationSettings,
	type TrailSettings,
	type TrailAppearance,
	type MotionVisibility,
	// Enums
	TrailMode,
	TrackingMode,
	// Defaults
	DEFAULT_ANIMATION_SETTINGS,
	DEFAULT_TRAIL_SETTINGS,
	DEFAULT_TRAIL_APPEARANCE
} from './animation-settings-state.svelte';

// Playback state (per-instance, not persisted)
export {
	// State factory
	createAnimationPlaybackState,
	// Types
	type AnimationPlaybackState,
	type PlaybackState
} from './animation-playback-state.svelte';

