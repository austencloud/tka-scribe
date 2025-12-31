/**
 * MoonSystem - Realistic Moon Renderer
 *
 * Features:
 * - Real moon texture from public domain imagery
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

export class MoonSystem {
	private moon: Moon | null = null;
	private config: MoonConfig;
	private lastDimensions: Dimensions | null = null;
	private calculationService: INightSkyCalculationService;

	// Moon texture
	private moonTexture: HTMLImageElement | null = null;
	private textureLoaded = false;

	constructor(
		config: MoonConfig,
		_gradientStops: BackgroundGradientStop[],
		calculationService: INightSkyCalculationService
	) {
		this.config = config;
		this.calculationService = calculationService;
		this.loadMoonTexture();
	}

	private loadMoonTexture() {
		if (typeof window === 'undefined') return;

		this.moonTexture = new Image();
		this.moonTexture.onload = () => {
			this.textureLoaded = true;
		};
		this.moonTexture.onerror = () => {
			console.warn('Failed to load moon texture, falling back to procedural');
			this.textureLoaded = false;
		};
		// Public domain moon image
		this.moonTexture.src = '/images/moon-texture.jpg';
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

		// 2. Draw moon surface (texture or fallback)
		if (this.textureLoaded && this.moonTexture) {
			this.drawMoonTexture(ctx, x, y, R);
		} else {
			this.drawMoonSurfaceFallback(ctx, x, y, R);
		}

		// 3. Draw earthshine on dark portion (during crescent phases)
		if (illumination.earthshineIntensity > 0) {
			this.drawEarthshine(ctx, x, y, R, illumination);
		}

		// 4. Draw phase shadow with proper elliptical terminator
		if (illumination.fraction < 0.99) {
			this.drawPhaseShadow(ctx, x, y, R, illumination);
		}

		// 5. Draw subtle limb darkening and edge glow
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

	private drawMoonTexture(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		if (!this.moonTexture) return;

		ctx.save();

		// Clip to circle
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.clip();

		// Draw base moon color first to prevent any edge artifacts
		ctx.fillStyle = '#e8e4d4';
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.fill();

		// Draw the texture scaled LARGER than the clip circle (18% overscan)
		// This ensures any dark edge/halo from the source image falls outside the visible area
		const overscan = 1.18;
		const size = R * 2 * overscan;
		const offset = R * overscan;
		ctx.drawImage(this.moonTexture, x - offset, y - offset, size, size);

		ctx.restore();
	}

	private drawMoonSurfaceFallback(ctx: CanvasRenderingContext2D, x: number, y: number, R: number) {
		// Simple gradient fallback if texture fails to load
		const surfaceGradient = ctx.createRadialGradient(
			x - R * 0.25,
			y - R * 0.25,
			R * 0.05,
			x,
			y,
			R
		);
		surfaceGradient.addColorStop(0, '#fffef5');
		surfaceGradient.addColorStop(0.2, '#f8f6e8');
		surfaceGradient.addColorStop(0.5, '#e8e4d4');
		surfaceGradient.addColorStop(0.8, '#d8d4c4');
		surfaceGradient.addColorStop(1, '#c8c4b4');

		ctx.fillStyle = surfaceGradient;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.fill();
	}

	private drawEarthshine(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		R: number,
		illumination: MoonIllumination
	) {
		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.clip();

		const darkSideX = illumination.isWaxing ? x - R * 0.3 : x + R * 0.3;
		const earthshineGradient = ctx.createRadialGradient(darkSideX, y, 0, darkSideX, y, R * 1.5);

		const intensity = illumination.earthshineIntensity;
		earthshineGradient.addColorStop(0, `rgba(100, 110, 140, ${intensity})`);
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

		// Phase angle determines terminator curve
		const phaseAngle = fraction * Math.PI;
		const terminatorCos = Math.cos(phaseAngle);

		ctx.beginPath();

		const steps = 50;

		if (isWaxing) {
			// Shadow on LEFT, lit on right
			const startX = x + terminatorCos * R;
			ctx.moveTo(startX, y - R);

			for (let i = 0; i <= steps; i++) {
				const t = i / steps;
				const angle = -Math.PI / 2 + t * Math.PI;
				const py = y + R * Math.sin(angle);
				const px = x + terminatorCos * R * Math.cos(angle);
				ctx.lineTo(px, py);
			}

			ctx.arc(x, y, R, Math.PI / 2, -Math.PI / 2, false);
		} else {
			// Shadow on RIGHT, lit on left
			const startX = x - terminatorCos * R;
			ctx.moveTo(startX, y - R);

			for (let i = 0; i <= steps; i++) {
				const t = i / steps;
				const angle = -Math.PI / 2 + t * Math.PI;
				const py = y + R * Math.sin(angle);
				const px = x - terminatorCos * R * Math.cos(angle);
				ctx.lineTo(px, py);
			}

			ctx.arc(x, y, R, Math.PI / 2, -Math.PI / 2, true);
		}

		ctx.closePath();

		// Dark shadow fill
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
		// Very subtle limb darkening (reduced to avoid dark ring artifact)
		const limbGradient = ctx.createRadialGradient(x, y, R * 0.85, x, y, R);
		limbGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
		limbGradient.addColorStop(1, 'rgba(0, 0, 0, 0.05)');

		ctx.fillStyle = limbGradient;
		ctx.beginPath();
		ctx.arc(x, y, R, 0, 2 * Math.PI);
		ctx.fill();

		// Subtle bright edge glow (helps blend the edge)
		ctx.globalAlpha = 0.3;
		ctx.strokeStyle = 'rgba(255, 255, 250, 0.6)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(x, y, R - 1, 0, 2 * Math.PI);
		ctx.stroke();
		ctx.globalAlpha = 1;
	}

	getMoon(): Moon | null {
		return this.moon;
	}

	cleanup() {
		this.moon = null;
		this.moonTexture = null;
		this.textureLoaded = false;
	}
}
