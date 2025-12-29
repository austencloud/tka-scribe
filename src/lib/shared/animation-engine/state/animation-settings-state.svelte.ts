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
  TrailEffect,
  type TrailSettings,
  type TrailPoint,
  DEFAULT_TRAIL_SETTINGS as MODULE_DEFAULT_TRAIL_SETTINGS,
} from "../domain/types/TrailTypes";

// Re-export for convenience
export { TrailMode, TrackingMode, TrailStyle, TrailEffect };
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
 * Complete animation settings (persisted)
 */
export interface AnimationSettings {
  // Playback
  bpm: number;
  shouldLoop: boolean;

  // Trails
  trail: TrailSettings;
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
  blueColor: "#2E3192",
  redColor: "#ED1C24",
};

export const DEFAULT_TRAIL_SETTINGS: TrailSettings = {
  ...MODULE_DEFAULT_TRAIL_SETTINGS,
};

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  bpm: 120,
  shouldLoop: true,
  trail: { ...DEFAULT_TRAIL_SETTINGS },
};

// ============================================================================
// PERSISTENCE
// ============================================================================

import { createPersistenceHelper } from "$lib/shared/state/utils/persistent-state";

const settingsPersistence = createPersistenceHelper({
  key: "tka_animation_settings",
  defaultValue: DEFAULT_ANIMATION_SETTINGS,
});

/**
 * Load animation settings with migration logic
 * Applies vivid trail preset if trails were previously disabled
 */
function loadSettings(): AnimationSettings {
  const settings = settingsPersistence.load();

  // Migration: Re-enable trails with vivid preset if they were disabled
  // (Trails were temporarily broken, now restored - default to vivid preset)
  if (settings.trail) {
    if (settings.trail.mode === TrailMode.OFF || !settings.trail.enabled) {
      // Apply vivid preset: enabled with fade mode
      settings.trail.enabled = true;
      settings.trail.mode = TrailMode.FADE;
      settings.trail.lineWidth = 4;
      settings.trail.maxOpacity = 0.95;
      settings.trail.glowEnabled = true;
      settings.trail.fadeDurationMs = 2500;
    }
  }

  return settings;
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

  // Playback setters
  setBpm: (bpm: number) => void;
  setShouldLoop: (loop: boolean) => void;

  // Trail setters
  setTrailEnabled: (enabled: boolean) => void;
  setTrailMode: (mode: TrailMode) => void;
  setTrailEffect: (effect: TrailEffect) => void;
  setTrackingMode: (mode: TrackingMode) => void;
  setFadeDuration: (ms: number) => void;
  setTrailAppearance: (appearance: Partial<TrailAppearance>) => void;
  setHideProps: (hide: boolean) => void;

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

  // Auto-save on any changes (using $effect.root for module-level usage)
  $effect.root(() => {
    $effect(() => {
      // Access all properties to track changes
      void settings.bpm;
      void settings.shouldLoop;
      void settings.trail.enabled;
      void settings.trail.mode;
      void settings.trail.effect;
      void settings.trail.trackingMode;
      void settings.trail.lineWidth;
      void settings.trail.maxOpacity;
      void settings.trail.minOpacity;
      void settings.trail.glowEnabled;
      void settings.trail.glowBlur;
      void settings.trail.blueColor;
      void settings.trail.redColor;
      void settings.trail.fadeDurationMs;
      void settings.trail.hideProps;

      settingsPersistence.setupAutoSave(settings);
    });
  });

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

    // Playback setters
    setBpm: (bpm: number) => {
      settings = { ...settings, bpm: Math.max(30, Math.min(300, bpm)) };
    },

    setShouldLoop: (loop: boolean) => {
      settings = { ...settings, shouldLoop: loop };
    },

    // Trail setters
    setTrailEnabled: (enabled: boolean) => {
      settings = {
        ...settings,
        trail: { ...settings.trail, enabled },
      };
    },

    setTrailMode: (mode: TrailMode) => {
      settings = {
        ...settings,
        trail: {
          ...settings.trail,
          mode,
          enabled: mode !== TrailMode.OFF,
        },
      };
    },

    setTrailEffect: (effect: TrailEffect) => {
      settings = {
        ...settings,
        trail: { ...settings.trail, effect },
      };
    },

    setTrackingMode: (mode: TrackingMode) => {
      settings = {
        ...settings,
        trail: { ...settings.trail, trackingMode: mode },
      };
    },

    setFadeDuration: (ms: number) => {
      settings = {
        ...settings,
        trail: {
          ...settings.trail,
          fadeDurationMs: Math.max(500, Math.min(10000, ms)),
        },
      };
    },

    setTrailAppearance: (appearance: Partial<TrailAppearance>) => {
      // TrailSettings is flat, so spread appearance props directly into trail
      settings = {
        ...settings,
        trail: {
          ...settings.trail,
          ...appearance,
        },
      };
    },

    setHideProps: (hide: boolean) => {
      settings = {
        ...settings,
        trail: { ...settings.trail, hideProps: hide },
      };
    },

    // Bulk operations
    updateSettings: (partial: Partial<AnimationSettings>) => {
      settings = { ...settings, ...partial };
    },

    resetToDefaults: () => {
      settings = { ...DEFAULT_ANIMATION_SETTINGS };
    },
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
