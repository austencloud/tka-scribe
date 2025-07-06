// src/lib/components/Backgrounds/config/core.ts
export const CoreConfig = {
	performance: {
		lowPerformanceThreshold: 40,
		criticalPerformanceThreshold: 20,
		adaptationInterval: 2000
	},

	background: {
		gradientStops: [
			{ position: 0, color: '#0A0A2A' }, // Darker top
			{ position: 0.15, color: '#121239' }, // Transition
			{ position: 0.3, color: '#1A1A4D' }, // Transition
			{ position: 0.7, color: '#85C1E9' }, // Transition
			{ position: 0.85, color: '#70A8D1' }, // Transition
			{ position: 1, color: '#85C1E9' } // Icy blue bottom
		],
		alternativeGradients: {
			aurora: [
				{ position: 0, color: '#001A33' },
				{ position: 0.4, color: '#003D66' },
				{ position: 0.7, color: '#147A6F' },
				{ position: 1, color: '#0F5B5F' }
			],
			sunset: [
				{ position: 0, color: '#0F2027' },
				{ position: 0.3, color: '#203A43' },
				{ position: 0.7, color: '#2C5364' },
				{ position: 1, color: '#72616E' }
			],
			mystical: [
				{ position: 0, color: '#0f0c29' },
				{ position: 0.3, color: '#302b63' },
				{ position: 0.7, color: '#24243e' },
				{ position: 1, color: '#3b2667' }
			]
		}
	},

	quality: {
		high: {
			densityMultiplier: 1.0,
			enableShootingStars: true,
			enableSeasonal: true,
			particleComplexity: 'high',
			enableBloom: true,
			enableReflections: true
		},
		medium: {
			densityMultiplier: 0.7,
			enableShootingStars: true,
			enableSeasonal: true,
			particleComplexity: 'medium',
			enableBloom: false,
			enableReflections: false
		},
		low: {
			densityMultiplier: 0.4,
			enableShootingStars: false,
			enableSeasonal: false,
			particleComplexity: 'low',
			enableBloom: false,
			enableReflections: false
		},
		minimal: {
			densityMultiplier: 0.2,
			enableShootingStars: false,
			enableSeasonal: false,
			particleComplexity: 'minimal',
			enableBloom: false,
			enableReflections: false
		}
	},

	accessibility: {
		reducedMotion: {
			enabled: false,
			particleSpeed: 0.3,
			effectsOpacity: 0.7
		},
		highContrast: {
			enabled: false,
			colors: {
				background: [
					{ position: 0, color: '#000000' },
					{ position: 1, color: '#0A1855' }
				],
				particles: ['#F0F8FF', '#E3F2FD']
			}
		}
	}
};

export function detectAppropriateQuality(): 'high' | 'medium' | 'low' | 'minimal' {
	if (typeof window === 'undefined') return 'medium';

	if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		CoreConfig.accessibility.reducedMotion.enabled = true;
		return 'low';
	}

	if (window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches) {
		CoreConfig.accessibility.highContrast.enabled = true;
	}

	const lowPowerDevice =
		/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
		(typeof (navigator as any).deviceMemory !== 'undefined' && (navigator as any).deviceMemory < 4);

	if (lowPowerDevice) return 'low';

	const smallScreen = window.innerWidth < 768 || window.innerHeight < 600;
	if (smallScreen) return 'medium';

	return 'high';
}

export function isWebGL2Supported(): boolean {
	try {
		if (typeof window === 'undefined') return false;

		const canvas = document.createElement('canvas');
		return !!canvas.getContext('webgl2');
	} catch (e) {
		return false;
	}
}
