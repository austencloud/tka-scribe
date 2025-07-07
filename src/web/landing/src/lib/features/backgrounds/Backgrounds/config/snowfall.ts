// src/lib/components/Backgrounds/config/snowfall.ts
export const SnowfallConfig = {
	snowflake: {
		density: 0.0001,
		windChangeInterval: 200,
		minSize: 2,
		maxSize: 7,
		minSpeed: 1,
		maxSpeed: 3,
		colors: ['#FFFFFF', '#D6EAF8', '#AED6F1', '#85C1E9']
	},

	shootingStar: {
		minInterval: 1000,
		maxInterval: 1500,
		minSize: 3,
		maxSize: 5,
		minSpeed: 0.02,
		maxSpeed: 0.05,
		tailLength: {
			min: 10,
			max: 20
		},
		colors: ['#FFD700', '#FFFFFF', '#FFA500', '#00FFFF'],
		fadeRate: 0.02,
		twinkleChance: 0.5
	}
};
