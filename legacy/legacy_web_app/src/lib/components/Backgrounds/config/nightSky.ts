// src/lib/components/Backgrounds/config/nightSky.ts

export const NightSkyConfig = {
	// Background Gradient
	background: {
		gradientStops: [
			{ position: 0, color: '#000000' }, // Black top
			{ position: 0.3, color: '#0b132b' }, // Dark blue transition
			{ position: 0.7, color: '#1c2541' }, // Deeper blue
			{ position: 1, color: '#3a506b' } // Lighter blue horizon
		]
	},

	// Stars
	stars: {
		density: 0.00015, // Density relative to canvas area
		minSize: 0.5,
		maxSize: 2.5,
		colors: ['#FFFFFF', '#E0E0FF', '#D0D0FF', '#C0C0F0'], // White with bluish tints
		twinkleChance: 0.3, // 30% of stars will twinkle
		minTwinkleSpeed: 0.005,
		maxTwinkleSpeed: 0.02,
		baseOpacityMin: 0.4,
		baseOpacityMax: 1.0
	},

	// Shooting Stars (Adapted from SnowfallConfig)
	shootingStar: {
		enabledOnQuality: ['high', 'medium'], // Only on medium and high
		minInterval: 2000, // Less frequent than snowfall
		maxInterval: 5000,
		minSize: 1, // Smaller
		maxSize: 3,
		minSpeed: 0.015, // Slightly slower base speed range
		maxSpeed: 0.03,
		tailLength: {
			min: 15,
			max: 30
		},
		colors: ['#FFFFFF', '#FFFFE0', '#ADD8E6'], // White, light yellow, light blue
		fadeRate: 0.03,
		twinkleChance: 0.1 // Less likely to twinkle
	},

	// Distant Planet/Moon (Easter Egg)
	celestialBody: {
		enabledOnQuality: ['high', 'medium'],
		radiusPercent: 0.05, // 5% of min(width, height)
		maxRadiusPx: 60,
		color: '#d0e0f0', // Pale blue/grey
		position: { x: 0.85, y: 0.15 }, // Top right quadrant (relative coords)
		driftSpeed: 0.00001 // Very slow drift
		// imagePath: '/images/distant_planet.png' // Optional image path
	},

	// Spaceship (Easter Egg)
	spaceship: {
		enabledOnQuality: ['high'], // Only on high quality
		minInterval: 15000, // Appears infrequently (15 seconds)
		maxInterval: 30000, // Up to 30 seconds
		widthPercent: 0.03,
		maxWidthPx: 40,
		aspectRatio: 2, // Width is 2x height
		speedPercent: 0.0005, // Speed relative to width
		opacity: 0.9
		// imagePath: '/images/spaceship.png' // Optional image path
	}
};
