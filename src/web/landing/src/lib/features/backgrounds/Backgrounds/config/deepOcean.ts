// src/lib/components/Backgrounds/config/deepOcean.ts

export const DeepOceanConfig = {
	// Background gradient for deep ocean
	background: {
		gradientStops: [
			{ position: 0, color: '#001122' },
			{ position: 0.3, color: '#003366' },
			{ position: 0.7, color: '#004080' },
			{ position: 1, color: '#001133' }
		]
	},

	// Particle configuration
	particles: {
		density: 0.00008,
		bubbleColors: ['rgba(255,255,255,0.6)', 'rgba(173,216,230,0.4)', 'rgba(135,206,235,0.3)'],
		planktonColors: ['rgba(0,255,127,0.8)', 'rgba(50,205,50,0.6)', 'rgba(144,238,144,0.4)'],
		debrisColors: ['rgba(139,69,19,0.3)', 'rgba(160,82,45,0.2)', 'rgba(205,133,63,0.1)']
	},

	// Marine life configuration
	jellyfish: {
		count: { high: 3, medium: 2, low: 1, minimal: 0 },
		colors: [
			'rgba(255,20,147,0.7)',
			'rgba(138,43,226,0.6)',
			'rgba(75,0,130,0.5)',
			'rgba(0,191,255,0.6)'
		],
		speed: 0.5,
		pulseSpeed: 0.02
	},

	fish: {
		schoolSize: { high: 12, medium: 8, low: 4, minimal: 2 },
		schoolCount: { high: 3, medium: 2, low: 1, minimal: 1 },
		colors: ['#FFD700', '#FF6347', '#32CD32', '#1E90FF', '#FF69B4'],
		speed: 0.8
	},

	// Environment configuration
	coral: {
		count: { high: 4, medium: 3, low: 2, minimal: 1 },
		colors: ['#FF7F50', '#FF6347', '#FF1493', '#DA70D6', '#9370DB'],
		swaySpeed: 0.02
	},

	whale: {
		size: 120,
		speed: 0.0008,
		color: '#2F4F4F',
		spawnInterval: { min: 15000, max: 40000 } // 15-40 seconds
	},

	// Light effects
	lightRays: {
		count: { high: 6, medium: 4, low: 2, minimal: 0 },
		opacity: 0.3,
		swaySpeed: 0.01
	},

	// Performance settings
	performance: {
		enableCaustics: { high: true, medium: false, low: false, minimal: false },
		enableGlow: { high: true, medium: true, low: false, minimal: false },
		enableReflections: { high: true, medium: false, low: false, minimal: false }
	}
};
