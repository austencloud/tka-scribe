/**
 * Effects Config State for 3D Animation
 *
 * Manages user preferences for all visual effects (trails, particles, etc.).
 * Uses Svelte 5 runes for reactive state management.
 */

import {
  DEFAULT_TRAIL_CONFIG,
  DEFAULT_FIRE_CONFIG,
  DEFAULT_SPARKLE_CONFIG,
  DEFAULT_ELECTRICITY_CONFIG,
  DEFAULT_GLOW_CONFIG,
  type TrailConfig,
  type FireConfig,
  type SparkleConfig,
  type ElectricityConfig,
  type GlowConfig,
} from "../types";

// =============================================================================
// Motion Effects Configuration
// =============================================================================

/**
 * Configuration for motion-based effects (blur, speed lines)
 */
export interface MotionEffectsConfig {
  /** Enable motion blur */
  blur: boolean;
  /** Enable speed lines */
  speedLines: boolean;
  /** Minimum velocity threshold to trigger effects */
  threshold: number;
  /** Effect intensity (0-1) */
  intensity: number;
}

const DEFAULT_MOTION_CONFIG: MotionEffectsConfig = {
  blur: false,
  speedLines: false,
  threshold: 2,
  intensity: 0.5,
};

// =============================================================================
// Bloom Configuration
// =============================================================================

/**
 * Configuration for bloom post-processing
 */
export interface BloomConfig {
  /** Enable bloom effect */
  enabled: boolean;
  /** Bloom intensity (0-1) */
  intensity: number;
  /** Luminance threshold for bloom (0-1) */
  threshold: number;
}

const DEFAULT_BLOOM_CONFIG: BloomConfig = {
  enabled: false,
  intensity: 0.5,
  threshold: 0.8,
};

// =============================================================================
// Combined Effects Config
// =============================================================================

/**
 * All effect configurations
 */
export interface EffectsConfig {
  trails: TrailConfig;
  fire: FireConfig;
  sparkles: SparkleConfig;
  electricity: ElectricityConfig;
  motion: MotionEffectsConfig;
  bloom: BloomConfig;
  glow: GlowConfig;
}

/**
 * Default configuration for all effects
 */
export const DEFAULT_EFFECTS_CONFIG: EffectsConfig = {
  trails: DEFAULT_TRAIL_CONFIG,
  fire: DEFAULT_FIRE_CONFIG,
  sparkles: DEFAULT_SPARKLE_CONFIG,
  electricity: DEFAULT_ELECTRICITY_CONFIG,
  motion: DEFAULT_MOTION_CONFIG,
  bloom: DEFAULT_BLOOM_CONFIG,
  glow: DEFAULT_GLOW_CONFIG,
};

// =============================================================================
// Effects Config State Factory
// =============================================================================

/**
 * Create effects configuration state
 */
export function createEffectsConfigState(
  initialConfig: Partial<EffectsConfig> = {}
) {
  // Merge with defaults
  let config = $state<EffectsConfig>({
    trails: { ...DEFAULT_TRAIL_CONFIG, ...initialConfig.trails },
    fire: { ...DEFAULT_FIRE_CONFIG, ...initialConfig.fire },
    sparkles: { ...DEFAULT_SPARKLE_CONFIG, ...initialConfig.sparkles },
    electricity: { ...DEFAULT_ELECTRICITY_CONFIG, ...initialConfig.electricity },
    motion: { ...DEFAULT_MOTION_CONFIG, ...initialConfig.motion },
    bloom: { ...DEFAULT_BLOOM_CONFIG, ...initialConfig.bloom },
    glow: { ...DEFAULT_GLOW_CONFIG, ...initialConfig.glow },
  });

  // Panel collapsed state
  let isCollapsed = $state(false);

  // =============================================================================
  // Derived States - Count of enabled effects
  // =============================================================================

  let enabledCount = $derived(
    [
      config.trails.enabled,
      config.fire.enabled,
      config.sparkles.enabled,
      config.electricity.enabled,
      config.motion.blur || config.motion.speedLines,
      config.bloom.enabled,
      config.glow.enabled,
    ].filter(Boolean).length
  );

  // =============================================================================
  // Trail Methods
  // =============================================================================

  function updateTrails(partial: Partial<TrailConfig>) {
    config.trails = { ...config.trails, ...partial };
  }

  function toggleTrails() {
    config.trails.enabled = !config.trails.enabled;
  }

  function setTrailMode(mode: "color" | "rainbow") {
    config.trails.color = mode === "rainbow" ? "rainbow" : "#ffffff";
  }

  // =============================================================================
  // Fire Methods
  // =============================================================================

  function updateFire(partial: Partial<FireConfig>) {
    config.fire = { ...config.fire, ...partial };
  }

  function toggleFire() {
    config.fire.enabled = !config.fire.enabled;
  }

  // =============================================================================
  // Sparkles Methods
  // =============================================================================

  function updateSparkles(partial: Partial<SparkleConfig>) {
    config.sparkles = { ...config.sparkles, ...partial };
  }

  function toggleSparkles() {
    config.sparkles.enabled = !config.sparkles.enabled;
  }

  // =============================================================================
  // Electricity Methods
  // =============================================================================

  function updateElectricity(partial: Partial<ElectricityConfig>) {
    config.electricity = { ...config.electricity, ...partial };
  }

  function toggleElectricity() {
    config.electricity.enabled = !config.electricity.enabled;
  }

  // =============================================================================
  // Motion Methods
  // =============================================================================

  function updateMotion(partial: Partial<MotionEffectsConfig>) {
    config.motion = { ...config.motion, ...partial };
  }

  function toggleMotionBlur() {
    config.motion.blur = !config.motion.blur;
  }

  function toggleSpeedLines() {
    config.motion.speedLines = !config.motion.speedLines;
  }

  // =============================================================================
  // Bloom Methods
  // =============================================================================

  function updateBloom(partial: Partial<BloomConfig>) {
    config.bloom = { ...config.bloom, ...partial };
  }

  function toggleBloom() {
    config.bloom.enabled = !config.bloom.enabled;
  }

  // =============================================================================
  // Glow Methods
  // =============================================================================

  function updateGlow(partial: Partial<GlowConfig>) {
    config.glow = { ...config.glow, ...partial };
  }

  function toggleGlow() {
    config.glow.enabled = !config.glow.enabled;
  }

  // =============================================================================
  // Panel Methods
  // =============================================================================

  function toggleCollapsed() {
    isCollapsed = !isCollapsed;
  }

  function setCollapsed(collapsed: boolean) {
    isCollapsed = collapsed;
  }

  // =============================================================================
  // Reset Methods
  // =============================================================================

  function resetToDefaults() {
    config = { ...DEFAULT_EFFECTS_CONFIG };
  }

  function disableAll() {
    config.trails.enabled = false;
    config.fire.enabled = false;
    config.sparkles.enabled = false;
    config.electricity.enabled = false;
    config.motion.blur = false;
    config.motion.speedLines = false;
    config.bloom.enabled = false;
    config.glow.enabled = false;
  }

  // =============================================================================
  // Return API
  // =============================================================================

  return {
    // Reactive config (read-only getters)
    get config() {
      return config;
    },
    get trails() {
      return config.trails;
    },
    get fire() {
      return config.fire;
    },
    get sparkles() {
      return config.sparkles;
    },
    get electricity() {
      return config.electricity;
    },
    get motion() {
      return config.motion;
    },
    get bloom() {
      return config.bloom;
    },
    get glow() {
      return config.glow;
    },
    get isCollapsed() {
      return isCollapsed;
    },
    get enabledCount() {
      return enabledCount;
    },

    // Trail methods
    updateTrails,
    toggleTrails,
    setTrailMode,

    // Fire methods
    updateFire,
    toggleFire,

    // Sparkles methods
    updateSparkles,
    toggleSparkles,

    // Electricity methods
    updateElectricity,
    toggleElectricity,

    // Motion methods
    updateMotion,
    toggleMotionBlur,
    toggleSpeedLines,

    // Bloom methods
    updateBloom,
    toggleBloom,

    // Glow methods
    updateGlow,
    toggleGlow,

    // Panel methods
    toggleCollapsed,
    setCollapsed,

    // Reset methods
    resetToDefaults,
    disableAll,
  };
}

// =============================================================================
// Type Export
// =============================================================================

export type EffectsConfigState = ReturnType<typeof createEffectsConfigState>;

// =============================================================================
// Singleton Instance
// =============================================================================

let singletonInstance: EffectsConfigState | null = null;

/**
 * Get or create the singleton effects config state
 */
export function getEffectsConfigState(): EffectsConfigState {
  if (!singletonInstance) {
    singletonInstance = createEffectsConfigState();
  }
  return singletonInstance;
}

/**
 * Reset the singleton instance (for testing or cleanup)
 */
export function resetEffectsConfigState(): void {
  singletonInstance = null;
}
