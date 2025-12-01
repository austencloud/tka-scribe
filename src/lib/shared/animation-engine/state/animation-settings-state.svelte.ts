/**
 * Animation Settings State
 *
 * Shared, persisted animation settings that apply globally.
 * These settings follow the user across the app - Share panel,
 * Animate module, Quick Play, etc.
 *
 * Includes:
 * - Trail settings (mode, tracking, appearance)
 * - Playback settings (BPM, loop)
 * - Motion visibility (blue/red)
 */

// ============================================================================
// TYPES - Re-export from canonical source in animate module
// ============================================================================

// Import types from the canonical source
import {
	TrailMode,
	TrackingMode,
	TrailStyle,
	type TrailSettings,
	type TrailPoint,
	DEFAULT_TRAIL_SETTINGS as MODULE_DEFAULT_TRAIL_SETTINGS
} from '$lib/modules/animate/shared/domain/types/TrailTypes';

// Re-export for convenience
export { TrailMode, TrackingMode, TrailStyle };
export type { TrailSettings, TrailPoint };

/**
 * Trail appearance settings (subset for convenience)
 */
export interface TrailAppearance {
	lineWidth: number;
	maxOpacity: number;
	minOpacity: number;
	glowEnabled: boolean;
	glowBlur: number;
	blueColor: string;
	redColor: string;
}

/**
 * Motion visibility settings
 */
export interface MotionVisibility {
	blue: boolean;
	red: boolean;
}

/**
 * Complete animation settings (persisted)
 */
export interface AnimationSettings {
	// Playback
	bpm: number;
	shouldLoop: boolean;

	// Trails
	trail: TrailSettings;

	// Visibility
	motionVisibility: MotionVisibility;
}

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_TRAIL_APPEARANCE: TrailAppearance = {
	lineWidth: 3.5,
	maxOpacity: 0.95,
	minOpacity: 0.15,
	glowEnabled: true,
	glowBlur: 2,
	blueColor: '#2E3192',
	redColor: '#ED1C24'
};

export const DEFAULT_TRAIL_SETTINGS: TrailSettings = { ...MODULE_DEFAULT_TRAIL_SETTINGS };

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
	bpm: 120,
	shouldLoop: true,
	trail: { ...DEFAULT_TRAIL_SETTINGS },
	motionVisibility: {
		blue: true,
		red: true
	}
};

// ============================================================================
// PERSISTENCE
// ============================================================================

const STORAGE_KEY = 'tka_animation_settings';

function loadSettings(): AnimationSettings {
	if (typeof localStorage === 'undefined') {
		return { ...DEFAULT_ANIMATION_SETTINGS };
	}

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return { ...DEFAULT_ANIMATION_SETTINGS };

		const parsed = JSON.parse(stored);
		// Merge with defaults to handle missing fields from older versions
		return {
			...DEFAULT_ANIMATION_SETTINGS,
			...parsed,
			trail: {
				...DEFAULT_TRAIL_SETTINGS,
				...parsed.trail
			},
			motionVisibility: {
				...DEFAULT_ANIMATION_SETTINGS.motionVisibility,
				...parsed.motionVisibility
			}
		};
	} catch (error) {
		console.warn('Failed to load animation settings:', error);
		return { ...DEFAULT_ANIMATION_SETTINGS };
	}
}

function saveSettings(settings: AnimationSettings): void {
	if (typeof localStorage === 'undefined') return;

	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch (error) {
		console.warn('Failed to save animation settings:', error);
	}
}

// ============================================================================
// STATE FACTORY
// ============================================================================

export type AnimationSettingsState = {
	// Read-only access
	readonly settings: AnimationSettings;
	readonly bpm: number;
	readonly shouldLoop: boolean;
	readonly trail: TrailSettings;
	readonly motionVisibility: MotionVisibility;

	// Playback setters
	setBpm: (bpm: number) => void;
	setShouldLoop: (loop: boolean) => void;

	// Trail setters
	setTrailEnabled: (enabled: boolean) => void;
	setTrailMode: (mode: TrailMode) => void;
	setTrackingMode: (mode: TrackingMode) => void;
	setFadeDuration: (ms: number) => void;
	setTrailAppearance: (appearance: Partial<TrailAppearance>) => void;
	setHideProps: (hide: boolean) => void;

	// Visibility setters
	setBlueVisible: (visible: boolean) => void;
	setRedVisible: (visible: boolean) => void;
	toggleBlueVisibility: () => void;
	toggleRedVisibility: () => void;

	// Bulk operations
	updateSettings: (partial: Partial<AnimationSettings>) => void;
	resetToDefaults: () => void;
};

/**
 * Create the shared animation settings state.
 * This is a singleton - call once at app init and share via context.
 */
export function createAnimationSettingsState(): AnimationSettingsState {
	let settings = $state<AnimationSettings>(loadSettings());

	// Auto-save on changes
	function persist() {
		saveSettings(settings);
	}

	return {
		// Read-only getters
		get settings() {
			return settings;
		},
		get bpm() {
			return settings.bpm;
		},
		get shouldLoop() {
			return settings.shouldLoop;
		},
		get trail() {
			return settings.trail;
		},
		get motionVisibility() {
			return settings.motionVisibility;
		},

		// Playback setters
		setBpm: (bpm: number) => {
			settings = { ...settings, bpm: Math.max(30, Math.min(300, bpm)) };
			persist();
		},

		setShouldLoop: (loop: boolean) => {
			settings = { ...settings, shouldLoop: loop };
			persist();
		},

		// Trail setters
		setTrailEnabled: (enabled: boolean) => {
			settings = {
				...settings,
				trail: { ...settings.trail, enabled }
			};
			persist();
		},

		setTrailMode: (mode: TrailMode) => {
			settings = {
				...settings,
				trail: {
					...settings.trail,
					mode,
					enabled: mode !== TrailMode.OFF
				}
			};
			persist();
		},

		setTrackingMode: (mode: TrackingMode) => {
			settings = {
				...settings,
				trail: { ...settings.trail, trackingMode: mode }
			};
			persist();
		},

		setFadeDuration: (ms: number) => {
			settings = {
				...settings,
				trail: {
					...settings.trail,
					fadeDurationMs: Math.max(500, Math.min(10000, ms))
				}
			};
			persist();
		},

		setTrailAppearance: (appearance: Partial<TrailAppearance>) => {
			// TrailSettings is flat, so spread appearance props directly into trail
			settings = {
				...settings,
				trail: {
					...settings.trail,
					...appearance
				}
			};
			persist();
		},

		setHideProps: (hide: boolean) => {
			settings = {
				...settings,
				trail: { ...settings.trail, hideProps: hide }
			};
			persist();
		},

		// Visibility setters
		setBlueVisible: (visible: boolean) => {
			settings = {
				...settings,
				motionVisibility: { ...settings.motionVisibility, blue: visible }
			};
			persist();
		},

		setRedVisible: (visible: boolean) => {
			settings = {
				...settings,
				motionVisibility: { ...settings.motionVisibility, red: visible }
			};
			persist();
		},

		toggleBlueVisibility: () => {
			settings = {
				...settings,
				motionVisibility: {
					...settings.motionVisibility,
					blue: !settings.motionVisibility.blue
				}
			};
			persist();
		},

		toggleRedVisibility: () => {
			settings = {
				...settings,
				motionVisibility: {
					...settings.motionVisibility,
					red: !settings.motionVisibility.red
				}
			};
			persist();
		},

		// Bulk operations
		updateSettings: (partial: Partial<AnimationSettings>) => {
			settings = { ...settings, ...partial };
			persist();
		},

		resetToDefaults: () => {
			settings = { ...DEFAULT_ANIMATION_SETTINGS };
			persist();
		}
	};
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global animation settings state instance.
 * Import this directly for easy access across the app.
 */
export const animationSettings = createAnimationSettingsState();
