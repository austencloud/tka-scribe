export const NightSkyConfig = {
	// Background gradient for night sky
	background: {
		gradientStops: [
			{ position: 0, color: '#0A0E2C' }, // Deep blue at top
			{ position: 0.3, color: '#1A2151' }, // Navy blue
			{ position: 0.6, color: '#2A3270' }, // Medium blue
			{ position: 0.8, color: '#3A4380' }, // Lighter blue
			{ position: 1, color: '#4A5490' } // Light blue/purple at bottom
		]
	},

	// Parallax layer configuration with reduced density
	parallax: {
		far: { drift: 0.00001, density: 0.00004 }, // Reduced from 0.4
		mid: { drift: 0.00004, density: 0.00003 }, // Reduced from 0.35
		near: { drift: 0.0001, density: 0.00002 } // Reduced from 0.25
	},

	// Stars configuration
	stars: {
		colors: ['#FFFFFF', '#E0E0FF', '#FFDDEE', '#D0E0FF', '#C0C0F0'],
		minSize: 1,
		maxSize: 3,
		twinkleChance: 0.7,
		baseOpacityMin: 0.5,
		baseOpacityMax: 1.0,
		minTwinkleSpeed: 0.01,
		maxTwinkleSpeed: 0.05
	},

	// Nebulae
	nebula: {
		enabledOnQuality: ['high', 'medium'],
		count: 4,
		maxRadius: 600,
		minRadius: 250,
		colors: ['rgba(55,80,160,0.35)', 'rgba(120,60,180,0.28)', 'rgba(35,150,200,0.25)'],
		pulseSpeed: { min: 0.0005, max: 0.001 } // radians / frame
	},

	// Constellations with reduced line count
	constellations: {
		enabledOnQuality: ['high', 'medium', 'low'],
		maxLines: 20, // Reduced from 180
		opacity: 0.15,
		twinkleSpeed: 0.003
	},

	// Shooting star configuration
	shootingStar: {
		enabledOnQuality: ['high', 'medium'],
		minInterval: 300,
		maxInterval: 900,
		minSpeed: 5,
		maxSpeed: 15,
		minSize: 2,
		maxSize: 4,
		minLength: 50,
		maxLength: 150,
		colors: ['#FFFFFF', '#E0E0FF', '#FFDDEE']
	},

	// Comet (hourly easter‑egg)
	comet: {
		enabledOnQuality: ['high', 'medium'],
		interval: 3600 * 60, // frames at 60 fps ≈ 60 min
		speed: 0.00025,
		radius: 5,
		tailLength: 120,
		color: '#B2FFFF'
	},

	celestialBody: {
		enabledOnQuality: ['high', 'medium', 'low'],
		radiusPercent: 0.05,
		maxRadiusPx: 60,
		driftSpeed: 0.00005,
		position: { x: 0.8, y: 0.2 },
		color: '#C0C0FF'
	},
	spaceship: {
		enabledOnQuality: ['high'],
		interval: 1800 * 60, // frames at 60 fps ≈ 30 min
		speedPercent: 0.0003,
		size: 10,
		color: '#FFFFFF',
		thrusterColor: '#FF6600'
	}
};
