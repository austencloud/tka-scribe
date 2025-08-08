// src/lib/components/Backgrounds/config/nightSky.ts

export const NightSkyConfig = {
	stars: {
		count: 200,
		minSize: 1,
		maxSize: 3,
		colors: ['#ffffff', '#f0f8ff', '#e6f3ff', '#ddeeff', '#ffff99'],
		twinkleSpeed: 0.02,
		parallaxLayers: 3
	},
	celestialBodies: {
		moon: {
			size: 60,
			color: '#f5f5dc',
			glowRadius: 20,
			enabled: true
		},
		planets: {
			count: 2,
			minSize: 3,
			maxSize: 8,
			colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
		}
	},
	shootingStars: {
		frequency: 0.001,
		minSpeed: 2,
		maxSpeed: 5,
		colors: ['#ffffff', '#ffff99', '#99ccff', '#ffcc99'],
		tailLength: 15
	},
	spaceship: {
		size: 12,
		speed: 1.5,
		color: '#silver',
		blinkInterval: 2000,
		enabled: false // Easter egg
	},
	comet: {
		size: 8,
		speed: 0.8,
		tailLength: 30,
		color: '#87ceeb',
		enabled: false // Easter egg
	},
	background: {
		gradientStops: [
			{ offset: 0, color: '#0c0c1e' },
			{ offset: 0.3, color: '#1a1a2e' },
			{ offset: 0.7, color: '#16213e' },
			{ offset: 1, color: '#0f3460' }
		]
	},
	animation: {
		starDriftSpeed: 0.1,
		celestialBodyDriftSpeed: 0.05,
		parallaxMultiplier: 0.3
	}
};

export type NightSkyConfigType = typeof NightSkyConfig;
