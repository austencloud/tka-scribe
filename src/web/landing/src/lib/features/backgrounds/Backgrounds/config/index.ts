// src/lib/components/Backgrounds/config/index.ts
import { CoreConfig, detectAppropriateQuality, isWebGL2Supported } from './core';
import { SnowfallConfig } from './snowfall';
import { SeasonalConfig } from './seasonal';
import { SantaConfig } from './santa';
import { NightSkyConfig } from './nightSky';
import { DeepOceanConfig } from './deepOcean';
import type { QualityLevel } from '../types/types';

export {
	CoreConfig,
	SnowfallConfig,
	SeasonalConfig,
	SantaConfig,
	NightSkyConfig,
	DeepOceanConfig,
	detectAppropriateQuality,
	isWebGL2Supported
};

// Function to get optimized configuration based on quality level
export function getOptimizedConfig(quality: QualityLevel) {
	const qualitySettings = CoreConfig.quality[quality];

	// Apply accessibility settings if enabled
	const config = {
		core: { ...CoreConfig },
		snowfall: { ...SnowfallConfig },
		seasonal: { ...SeasonalConfig },
		santa: { ...SantaConfig },
		nightSky: { ...NightSkyConfig },
		deepOcean: { ...DeepOceanConfig }
	};

	// --- Keep existing accessibility and seasonal logic ---
	if (CoreConfig.accessibility.reducedMotion.enabled) {
		const speedFactor = CoreConfig.accessibility.reducedMotion.particleSpeed;
		config.snowfall.snowflake.minSpeed *= speedFactor;
		config.snowfall.snowflake.maxSpeed *= speedFactor;
		config.snowfall.shootingStar.minSpeed *= speedFactor;
		config.snowfall.shootingStar.maxSpeed *= speedFactor;
		// Adjustments for nightSky
		config.nightSky.shootingStar.minSpeed *= speedFactor;
		config.nightSky.shootingStar.maxSpeed *= speedFactor;
		config.nightSky.spaceship.speedPercent *= speedFactor;
		config.nightSky.celestialBody.driftSpeed *= speedFactor;
		// Adjustments for deepOcean
		config.deepOcean.fish.speed *= speedFactor;
		config.deepOcean.jellyfish.speed *= speedFactor;
		config.deepOcean.whale.speed *= speedFactor;
	}

	if (CoreConfig.accessibility.highContrast.enabled) {
		config.core.background.gradientStops = CoreConfig.accessibility.highContrast.colors.background;
		config.snowfall.snowflake.colors = CoreConfig.accessibility.highContrast.colors.particles;
		// Adjustments for nightSky
		config.nightSky.stars.colors = CoreConfig.accessibility.highContrast.colors.particles;
		config.nightSky.shootingStar.colors = CoreConfig.accessibility.highContrast.colors.particles;
		config.nightSky.celestialBody.color = '#FFFFFF'; // High contrast planet
		// Adjustments for deepOcean
		config.deepOcean.particles.bubbleColors =
			CoreConfig.accessibility.highContrast.colors.particles;
		config.deepOcean.particles.planktonColors =
			CoreConfig.accessibility.highContrast.colors.particles;
		config.deepOcean.fish.colors = CoreConfig.accessibility.highContrast.colors.particles;
		config.deepOcean.jellyfish.colors = CoreConfig.accessibility.highContrast.colors.particles;
	}

	// Apply seasonal themes if enabled (Can be adapted or removed for nightSky)
	if (SeasonalConfig.enabled && qualitySettings.enableSeasonal) {
		// ... (keep existing seasonal logic, it mainly affects snowfall colors/gradients)
		// You could add nightSky specific seasonal changes here if desired
	}
	// --- End existing accessibility and seasonal logic ---

	return {
		config,
		qualitySettings
	};
}
