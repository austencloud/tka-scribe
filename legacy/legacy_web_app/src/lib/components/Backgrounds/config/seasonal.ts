// src/lib/components/Backgrounds/config/seasonal.ts
export const SeasonalConfig = {
	enabled: true,
	isChristmas: () => {
		const date = new Date();
		const month = date.getMonth();
		const day = date.getDate();
		return month === 11 || (month === 0 && day <= 7);
	},
	isNewYear: () => {
		const date = new Date();
		const month = date.getMonth();
		const day = date.getDate();
		return (month === 11 && day >= 30) || (month === 0 && day <= 7);
	},
	isHalloween: () => {
		const date = new Date();
		const month = date.getMonth();
		const day = date.getDate();
		return month === 9 && day >= 15;
	},
	themes: {
		christmas: {
			background: {
				gradientStops: [
					{ position: 0, color: '#1a472a' },
					{ position: 0.5, color: '#2d623d' },
					{ position: 1, color: '#5d8b75' }
				]
			},
			particles: {
				additionalColors: ['#FF0000', '#FFFF00', '#00FF00']
			}
		},
		halloween: {
			background: {
				gradientStops: [
					{ position: 0, color: '#000000' },
					{ position: 0.5, color: '#310A31' },
					{ position: 1, color: '#571B7E' }
				]
			},
			particles: {
				additionalColors: ['#FF6700', '#C21807']
			}
		}
	}
};
