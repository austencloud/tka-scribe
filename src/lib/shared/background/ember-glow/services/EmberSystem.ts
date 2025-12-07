import type { Dimensions, QualityLevel } from "$lib/shared/background/shared/domain/types/background-types";
import type { Ember } from "../domain/models/ember-models";
import {
  EMBER_COUNTS,
  EMBER_PHYSICS,
  EMBER_SIZE,
  EMBER_OPACITY,
  EMBER_COLORS,
  EMBER_GRADIENT,
  EMBER_BOUNDS,
} from "../domain/constants/ember-constants";

/**
 * Creates and manages the ember particle system
 */
export function createEmberSystem() {
  /**
   * Initialize embers with pre-dispersed positions
   */
  function initialize(dimensions: Dimensions, quality: QualityLevel): Ember[] {
    const count = getEmberCount(quality);
    const embers: Ember[] = [];

    for (let i = 0; i < count; i++) {
      embers.push(createEmber(dimensions, true));
    }

    return embers;
  }

  /**
   * Get ember count based on quality level
   */
  function getEmberCount(quality: QualityLevel): number {
    switch (quality) {
      case "high":
        return EMBER_COUNTS.high;
      case "medium":
        return EMBER_COUNTS.medium;
      case "low":
        return EMBER_COUNTS.low;
      default:
        return EMBER_COUNTS.medium;
    }
  }

  /**
   * Create a single ember particle
   */
  function createEmber(dimensions: Dimensions, randomizeY: boolean = false): Ember {
    const x = Math.random() * dimensions.width;
    const y = randomizeY
      ? Math.random() * dimensions.height
      : dimensions.height + EMBER_BOUNDS.RESPAWN_BUFFER;

    // Larger size variation for better visibility
    const size = EMBER_SIZE.MIN + Math.random() * EMBER_SIZE.RANGE;

    // Rising speed - slower for larger embers (parallax effect)
    const vy = -(EMBER_PHYSICS.RISING_SPEED_BASE + Math.random() * EMBER_PHYSICS.RISING_SPEED_RANGE) * (1 / size);

    // Gentle horizontal drift
    const vx = (Math.random() - 0.5) * EMBER_PHYSICS.DRIFT_AMPLITUDE;

    // Color variation - brighter amber to deep orange
    const colorVariant = Math.random();
    let r: number, g: number, b: number;
    
    if (colorVariant < EMBER_COLORS.ORANGE_RED.probability) {
      // Bright orange-red
      r = EMBER_COLORS.ORANGE_RED.r;
      g = EMBER_COLORS.ORANGE_RED.gMin + Math.floor(Math.random() * (EMBER_COLORS.ORANGE_RED.gMax - EMBER_COLORS.ORANGE_RED.gMin));
      b = EMBER_COLORS.ORANGE_RED.bMin + Math.floor(Math.random() * (EMBER_COLORS.ORANGE_RED.bMax - EMBER_COLORS.ORANGE_RED.bMin));
    } else if (colorVariant < EMBER_COLORS.AMBER.probability) {
      // Bright amber/orange
      r = EMBER_COLORS.AMBER.r;
      g = EMBER_COLORS.AMBER.gMin + Math.floor(Math.random() * (EMBER_COLORS.AMBER.gMax - EMBER_COLORS.AMBER.gMin));
      b = EMBER_COLORS.AMBER.bMin + Math.floor(Math.random() * (EMBER_COLORS.AMBER.bMax - EMBER_COLORS.AMBER.bMin));
    } else {
      // Very bright amber (almost white-hot)
      r = EMBER_COLORS.WHITE_HOT.r;
      g = EMBER_COLORS.WHITE_HOT.gMin + Math.floor(Math.random() * (EMBER_COLORS.WHITE_HOT.gMax - EMBER_COLORS.WHITE_HOT.gMin));
      b = EMBER_COLORS.WHITE_HOT.bMin + Math.floor(Math.random() * (EMBER_COLORS.WHITE_HOT.bMax - EMBER_COLORS.WHITE_HOT.bMin));
    }

    return {
      x,
      y,
      size,
      vx,
      vy,
      opacity: EMBER_OPACITY.MIN + Math.random() * EMBER_OPACITY.RANGE,
      glowRadius: size * EMBER_PHYSICS.GLOW_MULTIPLIER,
      flickerOffset: Math.random() * Math.PI * 2,
      color: { r, g, b },
    };
  }

  /**
   * Update ember positions and properties
   */
  function update(
    embers: Ember[],
    dimensions: Dimensions,
    frameMultiplier: number
  ): Ember[] {
    return embers.map((ember) => {
      // Update position
      let newX = ember.x + ember.vx * frameMultiplier;
      const newY = ember.y + ember.vy * frameMultiplier;

      // More dramatic flicker animation
      const flickerOffset = ember.flickerOffset + EMBER_PHYSICS.FLICKER_SPEED * frameMultiplier;
      const flickerFactor = EMBER_PHYSICS.FLICKER_BASE + Math.sin(flickerOffset) * EMBER_PHYSICS.FLICKER_AMPLITUDE;
      const newOpacity = Math.max(EMBER_PHYSICS.FLICKER_MIN_OPACITY, ember.opacity * flickerFactor);

      // Respawn if ember has risen above the viewport
      if (newY < -EMBER_BOUNDS.RESPAWN_BUFFER) {
        return createEmber(dimensions, false);
      }

      // Wrap horizontally with some variation
      if (newX < -EMBER_BOUNDS.RESPAWN_BUFFER) {
        newX = dimensions.width + EMBER_BOUNDS.RESPAWN_BUFFER;
      } else if (newX > dimensions.width + EMBER_BOUNDS.RESPAWN_BUFFER) {
        newX = -EMBER_BOUNDS.RESPAWN_BUFFER;
      }

      return {
        ...ember,
        x: newX,
        y: newY,
        opacity: newOpacity,
        flickerOffset,
      };
    });
  }

  /**
   * Draw embers with glow effect
   */
  function draw(
    embers: Ember[],
    ctx: CanvasRenderingContext2D,
    _dimensions: Dimensions
  ): void {
    embers.forEach((ember) => {
      const { x, y, size, opacity, glowRadius, color } = ember;

      // Create radial gradient for glow effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
      );
      gradient.addColorStop(
        EMBER_GRADIENT.INNER_STOP,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * EMBER_GRADIENT.INNER_OPACITY})`
      );
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);

      // Draw solid ember core
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * EMBER_OPACITY.CORE_MULTIPLIER})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Adjust embers when viewport resizes
   */
  function adjustToResize(
    embers: Ember[],
    oldDimensions: Dimensions,
    newDimensions: Dimensions,
    quality: QualityLevel
  ): Ember[] {
    const targetCount = getEmberCount(quality);
    const scaleX = newDimensions.width / oldDimensions.width;
    const scaleY = newDimensions.height / oldDimensions.height;

    // Scale existing embers
    const adjusted = embers.map((ember) => ({
      ...ember,
      x: ember.x * scaleX,
      y: ember.y * scaleY,
    }));

    // Add or remove embers to match target count
    while (adjusted.length < targetCount) {
      adjusted.push(createEmber(newDimensions, true));
    }
    while (adjusted.length > targetCount) {
      adjusted.pop();
    }

    return adjusted;
  }

  /**
   * Update quality level
   */
  function setQuality(
    embers: Ember[],
    dimensions: Dimensions,
    quality: QualityLevel
  ): Ember[] {
    const targetCount = getEmberCount(quality);

    if (embers.length < targetCount) {
      // Add more embers
      const toAdd = targetCount - embers.length;
      for (let i = 0; i < toAdd; i++) {
        embers.push(createEmber(dimensions, true));
      }
    } else if (embers.length > targetCount) {
      // Remove excess embers
      embers = embers.slice(0, targetCount);
    }

    return embers;
  }

  return {
    initialize,
    update,
    draw,
    adjustToResize,
    setQuality,
  };
}
