/**
 * MoonSystem - Realistic Moon Renderer
 *
 * Features:
 * - Accurate lunar maria (the dark "seas" that form the "man in the moon")
 * - Proper elliptical terminator for accurate phase shadow
 * - Earthshine during crescent phases
 * - Location-based orientation (southern hemisphere sees moon "upside down")
 * - Subtle glow and atmospheric effects
 */

import type { AccessibilitySettings } from '../../shared/domain/models/background-models';
import type { Dimensions, QualityLevel } from '../../shared/domain/types/background-types';
import type { Moon, MoonIllumination } from '../domain/models/night-sky-models';
import type { INightSkyCalculationService } from './contracts/INightSkyCalculationService';

export interface MoonConfig {
	radiusPercent: number;
	maxRadiusPx: number;
	color: string;
	position: { x: number; y: number };
	driftSpeed: number;
	enabledOnQuality: QualityLevel[];
}

export interface BackgroundGradientStop {
	position: number;
	color: string;
}

/**
 * Lunar maria (dark basaltic plains) - approximate positions and sizes
 * These are the recognizable dark patches that form the "Man in the Moon"
 */
const LUNAR_MARIA = [
	// Mare Imbrium (Sea of Rains) - large, upper left
	{ x: -0.25, y: -0.3, rx: 0.28, ry: 0.25, rotation: -15 },
	// Mare Serenitatis (Sea of Serenity) - right of Imbrium
	{ x: 0.15, y: -0.25, rx: 0.18, ry: 0.15, rotation: 10 },
	// Mare Tranquillitatis (Sea of Tranquility) - where Apollo 11 landed
	{ x: 0.25, y: 0.0, rx: 0.22, ry: 0.18, rotation: 20 },
	// Mare Crisium (Sea of Crises) - isolated, right side
	{ x: 0.45, y: -0.15, rx: 0.12, ry: 0.1, rotation: 0 },
	// Mare Fecunditatis (Sea of Fertility)
	{ x: 0.35, y: 0.2, rx: 0.15, ry: 0.12, rotation: -10 },
	// Mare Nectaris (Sea of Nectar)
	{ x: 0.2, y: 0.35, rx: 0.1, ry: 0.08, rotation: 5 },
	// Oceanus Procellarum (Ocean of Storms) - largest, left side
	{ x: -0.35, y: 0.1, rx: 0.25, ry: 0.4, rotation: -5 },
	// Mare Nubium (Sea of Clouds)
	{ x: -0.15, y: 0.35, rx: 0.15, ry: 0.12, rotation: 15 },
	// Mare Humorum (Sea of Moisture)
	{ x: -0.4, y: 0.3, rx: 0.1, ry: 0.1, rotation: 0 }
];


export class MoonSystem {
	private moon: Moon | null = null;
	private config: MoonConfig;
	private lastDimensions: Dimensions | null = null;
	private calculationService: INightSkyCalculationService;

	constructor(
		config: MoonConfig,
		_gradientStops: BackgroundGradientStop[],
		calculationService: INightSkyCalculationService
	) {
		this.config = config;
		this.calculationService = calculationService;
	}

	initialize(dim: Dimensions, quality: QualityLevel, a11y: AccessibilitySettings): Moon | null {
		if (!this.config.enabledOnQuality.includes(quality)) {
			this.moon = null;
			return null;
		}

		const baseSize = Math.min(dim.width, dim.height);
		const radius = Math.min(baseSize * this.config.radiusPercent, this.config.maxRadiusPx);

		const moonIlluminationData = this.calculationService.getMoonIllumination(new Date());

		this.moon = {
			x: dim.width * this.config.position.x,
			y: dim.height * this.config.position.y,
			radius: radius,
			color: a11y.highContrast ? '#FFFFFF' : this.config.color,
			driftX: (Math.random() - 0.5) * this.config.driftSpeed * dim.width,
			driftY: (Math.random() - 0.5) * this.config.driftSpeed * dim.height,
			illumination: moonIlluminationData,
			observerLatitude: this.calculationService.getObserverLatitude()
		};

		this.lastDimensions = dim;
		return this.moon;
	}

	update(dim: Dimensions, a11y: AccessibilitySettings, frameMultiplier: number = 1.0) {
		if (!this.moon) return;

		// Handle dimension changes
		if (
			this.lastDimensions &&
			(dim.width !== this.lastDimensions.width || dim.height !== this.lastDimensions.height)
		) {
			this.handleResize(this.lastDimensions, dim);
			this.lastDimensions = dim;
			return;
		}

		// Drift animation
		const b = this.moon;
		const effectiveDriftSpeed = frameMultiplier * (a11y.reducedMotion ? 0.1 : 1);
		b.x = (b.x + (b.driftX || 0) * effectiveDriftSpeed + dim.width) % dim.width;
		b.y = (b.y + (b.driftY || 0) * effectiveDriftSpeed + dim.height * 1.5) % (dim.height * 1.5);

		if (b.y > dim.height + b.radius) {
			b.y = -b.radius;
			b.x = Math.random() * dim.width;
		}

		// Update illumination periodically (every frame for smooth animation isn't needed)
		// Moon phase changes slowly enough that we can update less frequently
	}

	private handleResize(oldDim: Dimensions, newDim: Dimensions) {
		if (!this.moon) return;

		const scaleX = newDim.width / oldDim.width;
		const scaleY = newDim.height / oldDim.height;

		this.moon.x = this.moon.x * scaleX;
		this.moon.y = this.moon.y * scaleY;
		this.moon.driftX = (this.moon.driftX || 0) * scaleX;
		this.moon.driftY = (this.moon.driftY || 0) * scaleY;

		const baseSize = Math.min(newDim.width, newDim.height);
		this.moon.radius = Math.min(baseSize * this.config.radiusPercent, this.config.maxRadiusPx);
	}

	draw(ctx: CanvasRenderingContext2D, _a11y: AccessibilitySettings) {
		const moon = this.moon;
		if (!moon?.illumination) return;

		const { x, y, radius: R } = moon;
		const illumination = moon.illumination;

		ctx.save();

		// Apply rotation based on observer's latitude (parallactic angle)
		ctx.translate(x, y);
		ctx.rotate(illumination.parallacticAngle);
		ctx.translate(-x, -y);

		// 1. Draw outer atmospheric glow
		this.drawAtmosphericGlow(ctx, x, y, R);

		// 2. Draw base moon surface
		this.drawMoonSurface(ctx, x, y, R);

		// 3. Draw lunar maria (the dark "seas")
		this.drawLunarMaria(ctx, x, y, R);

		// 4. Draw major craters
		this.drawMajorCraters(ctx, x, y, R);

		// 5. Draw earthshine on dark portion (during crescent phases)
		if (illumination.earthshineIntensity > 0) {
			this.drawEarthshine(ctx, x, y, R, illumination);
		}

		// 6. Draw phase shadow with proper elliptical terminator
		if (illumination.fraction < 0.99) {
			this.drawPhaseShadow(ctx, x, y, R, illumination);
		}

		// 7. Draw subtle limb darkening and edge glow
		this.drawLimbEffects(ctx, x, y, R);

		ctx.restore();
	}

	private drawAtmosphericGlow(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		const glowGradient = ctx.createRadialGradient(x, y, R * 0.9, x, y, R * 2.2);
		glowGradient.addColorStop(0, 'rgba(255, 252, 240, 0.12)');
		glowGradient.addColorStop(0.3, 'rgba(255, 250, 235, 0.06)');
		glowGradient.addColorStop(0.6, 'rgba(220, 220, 255, 0.02)');
		glowGradient.addColorStop(1, 'rgba(200, 200, 255, 0)');

		ctx.fillStyle = glowGradient;
		ctx.beginPath();
		ctx.arc(x, y, R * 2.2, 0, 2 * Math.PI);
		ctx.fill();
	}

	private drawMoonSurface(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		// Base color with slight 3D shading
		const surfaceGradient = ctx.createRadialGradient(
			x - R * 0.25,
			y - R * 0.25,
			R * 0.05,
			x,
			y,
			R
		);
		surfaceGradient.addColorStop(0, '#fffef5'); // Bright highlight
		surfaceGradient.addColorStop(0.2, '#f8f6e8'); // Light cream
		surfaceGradient.addColorStop(0.5, '#e8e4d4'); // Mid-tone
		surfaceGradient.addColorStop(0.8, '#d8d4c4'); // Slightly darker
		surfaceGradient.addColorStop(1, '#c8c4b4'); // Edge

		ctx.fillStyle = surfaceGradient;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.fill();
	}

	private drawLunarMaria(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		ctx.save();

		// Clip to moon circle
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.clip();

		// Draw maria as very subtle darkening - much more subtle than before
		ctx.globalAlpha = 0.12; // Very subtle

		for (const mare of LUNAR_MARIA) {
			const mareX = x + mare.x * R;
			const mareY = y + mare.y * R;
			const mareRx = mare.rx * R;
			const mareRy = mare.ry * R;

			ctx.save();
			ctx.translate(mareX, mareY);
			ctx.rotate((mare.rotation * Math.PI) / 180);

			// Very soft gradient - barely visible darkening
			const mareGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(mareRx, mareRy));
			mareGradient.addColorStop(0, 'rgba(60, 55, 50, 0.5)');
			mareGradient.addColorStop(0.6, 'rgba(70, 65, 60, 0.25)');
			mareGradient.addColorStop(1, 'rgba(80, 75, 70, 0)');

			ctx.fillStyle = mareGradient;
			ctx.beginPath();
			ctx.ellipse(0, 0, mareRx, mareRy, 0, 0, 2 * Math.PI);
			ctx.fill();

			ctx.restore();
		}

		ctx.globalAlpha = 1;
		ctx.restore();
	}

	private drawMajorCraters(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		// Skip crater rendering - they were too prominent and looked bad
		// The maria provide enough texture
		// Keeping this method for potential future use with better implementation
	}

	private drawEarthshine(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		R: number,
		illumination: MoonIllumination
	) {
		// Earthshine: faint illumination of the dark side during crescent phases
		// The Earth reflects sunlight onto the moon's dark portion

		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.clip();

		// Determine which side is dark based on waxing/waning
		const darkSideX = illumination.isWaxing ? x - R * 0.3 : x + R * 0.3;

		const earthshineGradient = ctx.createRadialGradient(darkSideX, y, 0, darkSideX, y, R * 1.5);

		const intensity = illumination.earthshineIntensity;
		earthshineGradient.addColorStop(0, `rgba(100, 110, 140, ${intensity})`); // Slight blue tint
		earthshineGradient.addColorStop(0.5, `rgba(80, 90, 120, ${intensity * 0.5})`);
		earthshineGradient.addColorStop(1, 'rgba(60, 70, 100, 0)');

		ctx.fillStyle = earthshineGradient;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.fill();

		ctx.restore();
	}

	private drawPhaseShadow(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		R: number,
		illumination: MoonIllumination
	) {
		ctx.save();

		// Clip to moon circle
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.clip();

		const { fraction, isWaxing } = illumination;

		// The terminator is the edge between light and shadow on the moon.
		// It appears as an ellipse whose width depends on the phase.
		//
		// Phase geometry:
		// - fraction 0 = new moon (fully dark)
		// - fraction 0.5 = full moon (fully lit)
		// - fraction 0.25 = quarter (terminator is a straight line)
		//
		// The terminator's horizontal "squeeze" factor:
		// At new/full moon: cos(0) = 1, terminator at edge
		// At quarter: cos(π/2) = 0, terminator is straight vertical line at center

		// Convert fraction to phase angle (0 to π for waxing, π to 2π for waning)
		// For the terminator shape, we need the angle from the quarter phase
		const phaseAngle = fraction * Math.PI; // 0 at new, π/2 at quarter, π at full

		// The terminator ellipse width factor
		// This determines how much the terminator curves
		// cos(phaseAngle) goes: 1 (new) -> 0 (quarter) -> -1 (full)
		const terminatorCos = Math.cos(phaseAngle);

		// Build the shadow path by tracing:
		// 1. The terminator curve (an ellipse)
		// 2. The outer edge of the moon (an arc)

		ctx.beginPath();

		const steps = 50; // Smoothness of the curve

		if (isWaxing) {
			// Shadow is on the LEFT side, lit on right
			// Terminator curves based on phase

			// Start at top of terminator
			const startX = x + terminatorCos * R;
			ctx.moveTo(startX, y - R);

			// Draw terminator curve from top to bottom
			for (let i = 0; i <= steps; i++) {
				const t = i / steps;
				const angle = -Math.PI / 2 + t * Math.PI; // -π/2 to π/2
				const py = y + R * Math.sin(angle);
				const px = x + terminatorCos * R * Math.cos(angle);
				ctx.lineTo(px, py);
			}

			// Draw arc along the left edge of moon (from bottom to top)
			ctx.arc(x, y, R, Math.PI / 2, -Math.PI / 2, false);

		} else {
			// Shadow is on the RIGHT side, lit on left
			// Mirror the waxing case

			const startX = x - terminatorCos * R;
			ctx.moveTo(startX, y - R);

			// Draw terminator curve from top to bottom
			for (let i = 0; i <= steps; i++) {
				const t = i / steps;
				const angle = -Math.PI / 2 + t * Math.PI;
				const py = y + R * Math.sin(angle);
				const px = x - terminatorCos * R * Math.cos(angle);
				ctx.lineTo(px, py);
			}

			// Draw arc along the right edge of moon (from bottom to top)
			ctx.arc(x, y, R, Math.PI / 2, -Math.PI / 2, true);
		}

		ctx.closePath();

		// Fill with dark gradient
		const shadowEdgeX = isWaxing ? x - R : x + R;
		const terminatorX = isWaxing ? x + terminatorCos * R : x - terminatorCos * R;

		const shadowGradient = ctx.createLinearGradient(terminatorX, y, shadowEdgeX, y);
		shadowGradient.addColorStop(0, 'rgba(8, 8, 20, 0.88)');
		shadowGradient.addColorStop(0.5, 'rgba(5, 5, 15, 0.94)');
		shadowGradient.addColorStop(1, 'rgba(2, 2, 8, 0.98)');

		ctx.fillStyle = shadowGradient;
		ctx.fill();

		ctx.restore();
	}

	private drawLimbEffects(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		// Limb darkening - edges of moon appear slightly darker
		const limbGradient = ctx.createRadialGradient(x, y, R * 0.7, x, y, R);
		limbGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		limbGradient.addColorStop(0.8, 'rgba(0, 0, 0, 0.05)');
		limbGradient.addColorStop(1, 'rgba(0, 0, 0, 0.15)');

		ctx.fillStyle = limbGradient;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.fill();

		// Subtle bright edge glow
		ctx.globalAlpha = 0.25;
		ctx.strokeStyle = 'rgba(255, 255, 245, 0.5)';
		ctx.lineWidth = 1.5;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.globalAlpha = 1;
	}

	getMoon(): Moon | null {
		return this.moon;
	}

	cleanup() {
		this.moon = null;
	}
}
