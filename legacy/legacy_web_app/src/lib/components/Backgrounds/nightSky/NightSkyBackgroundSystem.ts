// src/lib/components/Backgrounds/nightSky/NightSkyBackgroundSystem.ts
import type {
    BackgroundSystem,
    Dimensions,
    QualityLevel,
    ShootingStarState,
    Star,
    CelestialBody,
    Spaceship,
    EasterEggState,
    AccessibilitySettings
} from '../types/types';
import { drawBackgroundGradient } from '../snowfall/utils/backgroundUtils'; // Re-use gradient util
import { getOptimizedConfig } from '../config';
import { createShootingStarSystem } from '../systems/ShootingStarSystem'; // Re-use shooting stars

export class NightSkyBackgroundSystem implements BackgroundSystem {
    private quality: QualityLevel = 'medium';
    private stars: Star[] = [];
    private shootingStarSystem = createShootingStarSystem();
    private shootingStarState: ShootingStarState;
    private celestialBody: CelestialBody | null = null;
    private spaceshipState: EasterEggState<Spaceship>;

    // Config shortcuts
    private nightSkyConfig = getOptimizedConfig(this.quality).config.nightSky;
    private coreQualitySettings = getOptimizedConfig(this.quality).qualitySettings;

    private accessibility: AccessibilitySettings = {
        reducedMotion: false, highContrast: false, visibleParticleSize: 2
    };

    // Image loading (optional) - using simple shapes for now
    // private planetImage: HTMLImageElement | null = null;
    // private spaceshipImage: HTMLImageElement | null = null;
    // private imagesLoaded = { planet: false, spaceship: false };

    constructor() {
        this.shootingStarState = this.shootingStarSystem.initialState;
        this.spaceshipState = {
            element: null,
            timer: 0,
            interval: this.getRandomSpaceshipInterval()
        };
        // this.preloadImages(); // Call if using images
    }

    // --- Image Preloading (Example if using images) ---
    /*
    private async preloadImages(): Promise<void> {
        if (typeof window === 'undefined') return;
        const promises = [];

        if (this.nightSkyConfig.celestialBody.imagePath) {
            this.planetImage = new Image();
            promises.push(new Promise((resolve, reject) => {
                this.planetImage!.onload = () => { this.imagesLoaded.planet = true; resolve(true); };
                this.planetImage!.onerror = reject;
                this.planetImage!.src = this.nightSkyConfig.celestialBody.imagePath;
            }));
        } else {
             this.imagesLoaded.planet = true; // Mark as loaded if no image path
        }


        if (this.nightSkyConfig.spaceship.imagePath) {
            this.spaceshipImage = new Image();
             promises.push(new Promise((resolve, reject) => {
                this.spaceshipImage!.onload = () => { this.imagesLoaded.spaceship = true; resolve(true); };
                this.spaceshipImage!.onerror = reject;
                this.spaceshipImage!.src = this.nightSkyConfig.spaceship.imagePath;
            }));
        } else {
            this.imagesLoaded.spaceship = true; // Mark as loaded if no image path
        }

        try {
            await Promise.all(promises);
            console.log('NightSky images loaded.');
        } catch (error) {
            console.error('Error loading NightSky images:', error);
        }
    }
    */

    // --- Initialization ---
    public initialize(dimensions: Dimensions, quality: QualityLevel): void {
        this.setQuality(quality); // Apply quality first
        this.stars = this.initializeStars(dimensions);
        this.celestialBody = this.initializeCelestialBody(dimensions);
        this.shootingStarState = this.shootingStarSystem.initialState; // Reset shooting star
        this.spaceshipState = { // Reset spaceship timer/state
            element: null,
            timer: 0,
            interval: this.getRandomSpaceshipInterval()
        };
    }

    private initializeStars(dimensions: Dimensions): Star[] {
        const { config, qualitySettings } = getOptimizedConfig(this.quality);
        const starConfig = config.nightSky.stars;
        const density = starConfig.density * qualitySettings.densityMultiplier;
        const count = Math.floor(dimensions.width * dimensions.height * density);
        const stars: Star[] = [];

        for (let i = 0; i < count; i++) {
            const radius = this.randomFloat(starConfig.minSize, starConfig.maxSize);
            const isTwinkling = Math.random() < starConfig.twinkleChance;
            const baseOpacity = this.randomFloat(starConfig.baseOpacityMin, starConfig.baseOpacityMax);
            stars.push({
                x: Math.random() * dimensions.width,
                y: Math.random() * dimensions.height,
                radius: radius,
                baseOpacity: baseOpacity,
                currentOpacity: baseOpacity,
                twinkleSpeed: isTwinkling ? this.randomFloat(starConfig.minTwinkleSpeed, starConfig.maxTwinkleSpeed) : 0,
                twinklePhase: Math.random() * Math.PI * 2, // Random start phase
                isTwinkling: isTwinkling,
                color: starConfig.colors[Math.floor(Math.random() * starConfig.colors.length)]
            });
        }
        return stars;
    }

    private initializeCelestialBody(dimensions: Dimensions): CelestialBody | null {
         const { config, qualitySettings } = getOptimizedConfig(this.quality);
         const bodyConfig = config.nightSky.celestialBody;

         if (!bodyConfig.enabledOnQuality.includes(this.quality)) {
             return null;
         }

         const baseSize = Math.min(dimensions.width, dimensions.height);
         const radius = Math.min(baseSize * bodyConfig.radiusPercent, bodyConfig.maxRadiusPx);
         const driftSpeed = this.accessibility.reducedMotion ? bodyConfig.driftSpeed * 0.1 : bodyConfig.driftSpeed;

         return {
             x: dimensions.width * bodyConfig.position.x,
             y: dimensions.height * bodyConfig.position.y,
             radius: radius,
             color: bodyConfig.color,
             driftX: (Math.random() - 0.5) * driftSpeed * dimensions.width, // Random initial drift
             driftY: (Math.random() - 0.5) * driftSpeed * dimensions.height
             // image: this.planetImage, // Assign preloaded image if using
             // imageLoaded: this.imagesLoaded.planet
         };
    }


    // --- Update ---
    public update(dimensions: Dimensions): void {
        this.updateStars();
        this.updateCelestialBody(dimensions);

        // Update systems only if enabled for current quality
        const { qualitySettings } = getOptimizedConfig(this.quality);
        if (qualitySettings.enableShootingStars && this.nightSkyConfig.shootingStar.enabledOnQuality.includes(this.quality)) {
             this.shootingStarState = this.shootingStarSystem.update(this.shootingStarState, dimensions);
        }
        if (this.nightSkyConfig.spaceship.enabledOnQuality.includes(this.quality)) {
            this.updateSpaceship(dimensions);
        }
    }

    private updateStars(): void {
        const now = performance.now() * 0.01; // Use time for smooth twinkle
        this.stars.forEach(star => {
            if (star.isTwinkling) {
                // Use sine wave for smooth twinkling effect
                star.currentOpacity = star.baseOpacity * (0.7 + 0.3 * Math.sin(star.twinklePhase + now * star.twinkleSpeed));
            }
        });
    }

     private updateCelestialBody(dimensions: Dimensions): void {
        if (!this.celestialBody || !this.celestialBody.driftX || !this.celestialBody.driftY) return;

        this.celestialBody.x += this.celestialBody.driftX;
        this.celestialBody.y += this.celestialBody.driftY;

        // Optional: Wrap around edges or bounce
        const radius = this.celestialBody.radius;
        if (this.celestialBody.x < -radius) this.celestialBody.x = dimensions.width + radius;
        if (this.celestialBody.x > dimensions.width + radius) this.celestialBody.x = -radius;
        if (this.celestialBody.y < -radius) this.celestialBody.y = dimensions.height + radius;
        if (this.celestialBody.y > dimensions.height + radius) this.celestialBody.y = -radius;
    }

    private updateSpaceship(dimensions: Dimensions): void {
        const { config } = getOptimizedConfig(this.quality);
        const spaceshipConfig = config.nightSky.spaceship;

        if (!this.spaceshipState.element?.active) {
            // Decrement timer if spaceship is not active
            this.spaceshipState.timer++;
            if (this.spaceshipState.timer >= this.spaceshipState.interval) {
                // Time to potentially spawn
                this.spaceshipState.element = this.spawnSpaceship(dimensions);
                this.spaceshipState.timer = 0; // Reset timer only if spawned
                 if(!this.spaceshipState.element) { // If spawn failed (e.g. image not loaded)
                     this.spaceshipState.interval = this.getRandomSpaceshipInterval(); // Get new interval
                 }
            }
        } else {
            // Move active spaceship
            const ship = this.spaceshipState.element;
            ship.x += ship.speed * ship.direction;

            // Check if off-screen
            const offScreenLeft = ship.x > dimensions.width + ship.width;
            const offScreenRight = ship.x < -ship.width;

            if (offScreenLeft || offScreenRight) {
                this.spaceshipState.element = null; // Deactivate
                this.spaceshipState.interval = this.getRandomSpaceshipInterval(); // Set timer for next appearance
            }
        }
    }

     private spawnSpaceship(dimensions: Dimensions): Spaceship | null {
        const { config } = getOptimizedConfig(this.quality);
        const spaceshipConfig = config.nightSky.spaceship;

        // If using images, check if loaded
        // if (spaceshipConfig.imagePath && !this.imagesLoaded.spaceship) return null;

        const direction = Math.random() > 0.5 ? 1 : -1; // 1 = LTR, -1 = RTL
        const width = Math.min(dimensions.width * spaceshipConfig.widthPercent, spaceshipConfig.maxWidthPx);
        const height = width / spaceshipConfig.aspectRatio;
        const startY = Math.random() * (dimensions.height * 0.6) + (dimensions.height * 0.1); // Avoid top/bottom edges
        const startX = direction === 1 ? -width : dimensions.width;
        const speed = dimensions.width * spaceshipConfig.speedPercent * (this.accessibility.reducedMotion ? 0.3 : 1);


        return {
            x: startX,
            y: startY,
            width: width,
            height: height,
            speed: speed,
            active: true,
            direction: direction,
            opacity: spaceshipConfig.opacity,
            // image: this.spaceshipImage, // Assign preloaded image
            // imageLoaded: this.imagesLoaded.spaceship
        };
    }

    private getRandomSpaceshipInterval(): number {
         const { config } = getOptimizedConfig(this.quality);
         const spaceshipConfig = config.nightSky.spaceship;
         // Interval is in frames (assuming ~60fps)
         const intervalInFrames = Math.floor(Math.random() * (spaceshipConfig.maxInterval - spaceshipConfig.minInterval + 1)) + spaceshipConfig.minInterval;
         return intervalInFrames;
    }


    // --- Draw ---
    public draw(ctx: CanvasRenderingContext2D, dimensions: Dimensions): void {
        const { config } = getOptimizedConfig(this.quality);

        // 1. Draw Background
        drawBackgroundGradient(ctx, dimensions, config.nightSky.background.gradientStops);

        // 2. Draw Celestial Body (behind stars)
        this.drawCelestialBody(ctx);

        // 3. Draw Stars
        this.drawStars(ctx);

        // 4. Draw Shooting Stars
        if (this.nightSkyConfig.shootingStar.enabledOnQuality.includes(this.quality)) {
            this.shootingStarSystem.draw(this.shootingStarState, ctx);
        }

        // 5. Draw Spaceship (on top)
         if (this.nightSkyConfig.spaceship.enabledOnQuality.includes(this.quality)) {
            this.drawSpaceship(ctx);
        }
    }

    private drawStars(ctx: CanvasRenderingContext2D): void {
        this.stars.forEach(star => {
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.currentOpacity;
            ctx.fill();
        });
        ctx.globalAlpha = 1.0; // Reset alpha
    }

    private drawCelestialBody(ctx: CanvasRenderingContext2D): void {
        if (!this.celestialBody) return;

        /* // If using image:
        if (this.celestialBody.image && this.celestialBody.imageLoaded) {
             ctx.drawImage(
                 this.celestialBody.image,
                 this.celestialBody.x - this.celestialBody.radius,
                 this.celestialBody.y - this.celestialBody.radius,
                 this.celestialBody.radius * 2,
                 this.celestialBody.radius * 2
             );
        } else { // Fallback to drawing a circle
             ctx.beginPath();
             ctx.arc(this.celestialBody.x, this.celestialBody.y, this.celestialBody.radius, 0, Math.PI * 2);
             ctx.fillStyle = this.celestialBody.color;
             // Optional: Add a subtle glow
             ctx.shadowColor = this.celestialBody.color;
             ctx.shadowBlur = this.celestialBody.radius * 0.5;
             ctx.fill();
             ctx.shadowColor = 'transparent'; // Reset shadow
             ctx.shadowBlur = 0;
        }
        */
        // --- Drawing simple circle ---
         ctx.beginPath();
         ctx.arc(this.celestialBody.x, this.celestialBody.y, this.celestialBody.radius, 0, Math.PI * 2);
         ctx.fillStyle = this.celestialBody.color;
         // Optional: Add a subtle glow
         ctx.shadowColor = this.celestialBody.color;
         ctx.shadowBlur = this.celestialBody.radius * 0.5;
         ctx.fill();
         ctx.shadowColor = 'transparent'; // Reset shadow
         ctx.shadowBlur = 0;
         // --- End simple circle ---
    }

     private drawSpaceship(ctx: CanvasRenderingContext2D): void {
        if (!this.spaceshipState.element?.active) return;
        const ship = this.spaceshipState.element;

        /* // If using image:
        if (ship.image && ship.imageLoaded) {
            ctx.globalAlpha = ship.opacity;
            ctx.drawImage(ship.image, ship.x, ship.y, ship.width, ship.height);
            ctx.globalAlpha = 1.0;
        } else { // Fallback to drawing a simple shape
            ctx.fillStyle = '#cccccc';
            ctx.globalAlpha = ship.opacity;
            ctx.beginPath();
            // Simple triangle shape
            if (ship.direction > 0) { // Moving right
                ctx.moveTo(ship.x, ship.y);
                ctx.lineTo(ship.x + ship.width, ship.y + ship.height / 2);
                ctx.lineTo(ship.x, ship.y + ship.height);
            } else { // Moving left
                 ctx.moveTo(ship.x + ship.width, ship.y);
                 ctx.lineTo(ship.x, ship.y + ship.height / 2);
                 ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
            }
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
        */
        // --- Drawing simple shape ---
         ctx.fillStyle = '#cccccc';
         ctx.globalAlpha = ship.opacity;
         ctx.beginPath();
         // Simple triangle shape
         if (ship.direction > 0) { // Moving right
             ctx.moveTo(ship.x, ship.y);
             ctx.lineTo(ship.x + ship.width, ship.y + ship.height / 2);
             ctx.lineTo(ship.x, ship.y + ship.height);
         } else { // Moving left
              ctx.moveTo(ship.x + ship.width, ship.y);
              ctx.lineTo(ship.x, ship.y + ship.height / 2);
              ctx.lineTo(ship.x + ship.width, ship.y + ship.height);
         }
         ctx.closePath();
         ctx.fill();
         ctx.globalAlpha = 1.0;
         // --- End simple shape ---
    }

    // --- Quality & Accessibility ---
    public setQuality(quality: QualityLevel): void {
        if (this.quality === quality) return;
        console.log(`NightSky: Setting quality to ${quality}`);
        this.quality = quality;
        // Re-initialize elements based on new quality settings
        // Get current dimensions (assuming context provides this or it's stored)
        // This needs access to dimensions, ideally passed during the call or stored
        // For now, we assume re-initialization happens externally or on next update cycle
        // A better approach might involve storing dimensions and calling initialize explicitly.
        this.nightSkyConfig = getOptimizedConfig(this.quality).config.nightSky;
        this.coreQualitySettings = getOptimizedConfig(this.quality).qualitySettings;
        // Need to re-run initializeStars, initializeCelestialBody etc. based on new quality
        // This might require storing the last known dimensions.
    }

    public setAccessibility(settings: AccessibilitySettings): void {
        this.accessibility = settings;
        // Re-initialize or adjust speeds/effects based on new settings
         this.nightSkyConfig = getOptimizedConfig(this.quality).config.nightSky; // Recalculate config based on accessibility potentially
    }

     // --- Resize Handling ---
    public handleResize(oldDimensions: Dimensions, newDimensions: Dimensions): void {
        // Adjust particle counts and positions based on resize
        this.stars = this.adjustStarsToResize(this.stars, oldDimensions, newDimensions);
        this.celestialBody = this.adjustCelestialBodyToResize(this.celestialBody, oldDimensions, newDimensions);
        // Reset shooting stars and spaceships as their paths depend on dimensions
        this.shootingStarState = this.shootingStarSystem.initialState;
        this.spaceshipState.element = null; // Deactivate spaceship
        this.spaceshipState.timer = 0;
        this.spaceshipState.interval = this.getRandomSpaceshipInterval();
    }

    private adjustStarsToResize(stars: Star[], oldDimensions: Dimensions, newDimensions: Dimensions): Star[] {
         const { config, qualitySettings } = getOptimizedConfig(this.quality);
         const starConfig = config.nightSky.stars;
         const density = starConfig.density * qualitySettings.densityMultiplier;
         const targetCount = Math.floor(newDimensions.width * newDimensions.height * density);
         const currentCount = stars.length;
         const widthRatio = newDimensions.width / oldDimensions.width;
         const heightRatio = newDimensions.height / oldDimensions.height;

         // Reposition existing stars
         const adjustedStars = stars.map(star => ({
             ...star,
             x: star.x * widthRatio,
             y: star.y * heightRatio
         }));

         // Add or remove stars
         if (targetCount > currentCount) {
             for (let i = 0; i < targetCount - currentCount; i++) {
                 adjustedStars.push(this.createStar(newDimensions));
             }
         } else if (targetCount < currentCount) {
             adjustedStars.length = targetCount; // Truncate array
         }

         return adjustedStars;
    }

     private adjustCelestialBodyToResize(body: CelestialBody | null, oldDimensions: Dimensions, newDimensions: Dimensions): CelestialBody | null {
        if (!body) return null;
         const { config } = getOptimizedConfig(this.quality);
         const bodyConfig = config.nightSky.celestialBody;

         if (!bodyConfig.enabledOnQuality.includes(this.quality)) {
             return null; // Ensure it's still null if quality changed
         }

         // Recalculate size and position based on new dimensions
         const baseSize = Math.min(newDimensions.width, newDimensions.height);
         const radius = Math.min(baseSize * bodyConfig.radiusPercent, bodyConfig.maxRadiusPx);
         const driftSpeed = this.accessibility.reducedMotion ? bodyConfig.driftSpeed * 0.1 : bodyConfig.driftSpeed;

        // Keep relative position
        const xRatio = body.x / oldDimensions.width;
        const yRatio = body.y / oldDimensions.height;

        return {
            ...body,
            x: newDimensions.width * xRatio,
            y: newDimensions.height * yRatio,
            radius: radius,
             // Recalculate drift based on new dimensions if needed, or keep direction
             driftX: (body.driftX && body.driftX > 0 ? 1 : -1) * driftSpeed * newDimensions.width * (Math.random()*0.4 + 0.8), // Keep direction, adjust magnitude
             driftY: (body.driftY && body.driftY > 0 ? 1 : -1) * driftSpeed * newDimensions.height * (Math.random()*0.4 + 0.8)
        };
    }

    // Helper to create a single star (used in initialization and resize)
    private createStar(dimensions: Dimensions): Star {
        const { config } = getOptimizedConfig(this.quality);
        const starConfig = config.nightSky.stars;
        const radius = this.randomFloat(starConfig.minSize, starConfig.maxSize);
        const isTwinkling = Math.random() < starConfig.twinkleChance;
        const baseOpacity = this.randomFloat(starConfig.baseOpacityMin, starConfig.baseOpacityMax);
        return {
            x: Math.random() * dimensions.width,
            y: Math.random() * dimensions.height,
            radius: radius,
            baseOpacity: baseOpacity,
            currentOpacity: baseOpacity,
            twinkleSpeed: isTwinkling ? this.randomFloat(starConfig.minTwinkleSpeed, starConfig.maxTwinkleSpeed) : 0,
            twinklePhase: Math.random() * Math.PI * 2,
            isTwinkling: isTwinkling,
            color: starConfig.colors[Math.floor(Math.random() * starConfig.colors.length)]
        };
    }

    // Helper for random float
    private randomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }


    // --- Cleanup ---
    public cleanup(): void {
        this.stars = [];
        this.celestialBody = null;
        this.shootingStarState = this.shootingStarSystem.initialState;
        this.spaceshipState = { element: null, timer: 0, interval: this.getRandomSpaceshipInterval() };
        // Cancel image loading if necessary
        // if (this.planetImage) this.planetImage.src = '';
        // if (this.spaceshipImage) this.spaceshipImage.src = '';
        console.log('NightSkyBackgroundSystem cleaned up.');
    }
}

