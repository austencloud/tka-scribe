import type {
  Dimensions,
  QualityLevel,
} from "$lib/shared/background/shared/domain/types/background-types";
import type { SakuraPetal } from "../domain/models/sakura-models";
import {
  SAKURA_COUNTS,
  SAKURA_DISTRIBUTION,
  SAKURA_PHYSICS,
  SAKURA_SIZE,
  SAKURA_ROTATION,
  SAKURA_OPACITY,
  SAKURA_COLORS,
  SAKURA_FLOWER,
  SAKURA_PETAL,
  SAKURA_BOUNDS,
} from "../domain/constants/sakura-constants";

/**
 * Creates and manages the sakura petal particle system
 */
export function createSakuraSystem() {
  /**
   * Initialize petals with pre-dispersed positions
   */
  function initialize(
    dimensions: Dimensions,
    quality: QualityLevel
  ): SakuraPetal[] {
    const count = getPetalCount(quality);
    const petals: SakuraPetal[] = [];

    for (let i = 0; i < count; i++) {
      petals.push(createPetal(dimensions, true));
    }

    return petals;
  }

  /**
   * Get petal count based on quality level
   */
  function getPetalCount(quality: QualityLevel): number {
    switch (quality) {
      case "high":
        return SAKURA_COUNTS.high;
      case "medium":
        return SAKURA_COUNTS.medium;
      case "low":
        return SAKURA_COUNTS.low;
      default:
        return SAKURA_COUNTS.medium;
    }
  }

  /**
   * Create a single sakura petal or flower
   */
  function createPetal(
    dimensions: Dimensions,
    randomizeY: boolean = false
  ): SakuraPetal {
    const x = Math.random() * dimensions.width;
    const y = randomizeY
      ? Math.random() * dimensions.height
      : -SAKURA_BOUNDS.RESPAWN_BUFFER;

    // 30% chance of being a full flower, 70% single petal
    const isFlower = Math.random() < SAKURA_DISTRIBUTION.FLOWER_PROBABILITY;

    // Size variation - flowers are larger
    const size = isFlower
      ? SAKURA_SIZE.FLOWER.MIN + Math.random() * SAKURA_SIZE.FLOWER.RANGE
      : SAKURA_SIZE.PETAL.MIN + Math.random() * SAKURA_SIZE.PETAL.RANGE;

    // Gentle falling speed - slower for larger items (parallax effect)
    const vy =
      (SAKURA_PHYSICS.FALLING_SPEED_BASE +
        Math.random() * SAKURA_PHYSICS.FALLING_SPEED_RANGE) *
      (1 / (size / 4));

    // Gentle horizontal drift
    const vx = (Math.random() - 0.5) * SAKURA_PHYSICS.DRIFT_AMPLITUDE;

    // Rotation properties - flowers rotate slower
    const rotationSpeed = isFlower
      ? (Math.random() - SAKURA_ROTATION.RANDOMNESS) *
        SAKURA_ROTATION.FLOWER_SPEED
      : (Math.random() - SAKURA_ROTATION.RANDOMNESS) *
        SAKURA_ROTATION.PETAL_SPEED;

    // Sway properties
    const swayAmplitude =
      SAKURA_PHYSICS.SWAY_AMPLITUDE_MIN +
      Math.random() * SAKURA_PHYSICS.SWAY_AMPLITUDE_RANGE;
    const swayOffset = Math.random() * Math.PI * 2;

    // Color variation - more vibrant for flowers
    const colorVariant = Math.random();
    let r: number, g: number, b: number;

    if (isFlower) {
      // Flowers are more vibrant
      if (colorVariant < SAKURA_COLORS.FLOWER_PINK.probability) {
        // Bright pink
        r = SAKURA_COLORS.FLOWER_PINK.r;
        g =
          SAKURA_COLORS.FLOWER_PINK.gMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.FLOWER_PINK.gMax - SAKURA_COLORS.FLOWER_PINK.gMin)
          );
        b =
          SAKURA_COLORS.FLOWER_PINK.bMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.FLOWER_PINK.bMax - SAKURA_COLORS.FLOWER_PINK.bMin)
          );
      } else {
        // White with pink tint
        r = SAKURA_COLORS.FLOWER_WHITE.r;
        g =
          SAKURA_COLORS.FLOWER_WHITE.gMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.FLOWER_WHITE.gMax -
                SAKURA_COLORS.FLOWER_WHITE.gMin)
          );
        b =
          SAKURA_COLORS.FLOWER_WHITE.bMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.FLOWER_WHITE.bMax -
                SAKURA_COLORS.FLOWER_WHITE.bMin)
          );
      }
    } else {
      // Petals are softer
      if (colorVariant < SAKURA_COLORS.PETAL_PINK.probability) {
        // Pale pink
        r = SAKURA_COLORS.PETAL_PINK.r;
        g =
          SAKURA_COLORS.PETAL_PINK.gMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.PETAL_PINK.gMax - SAKURA_COLORS.PETAL_PINK.gMin)
          );
        b =
          SAKURA_COLORS.PETAL_PINK.bMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.PETAL_PINK.bMax - SAKURA_COLORS.PETAL_PINK.bMin)
          );
      } else if (colorVariant < SAKURA_COLORS.PETAL_CREAM.probability) {
        // Cream/off-white
        r = SAKURA_COLORS.PETAL_CREAM.r;
        g =
          SAKURA_COLORS.PETAL_CREAM.gMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.PETAL_CREAM.gMax - SAKURA_COLORS.PETAL_CREAM.gMin)
          );
        b =
          SAKURA_COLORS.PETAL_CREAM.bMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.PETAL_CREAM.bMax - SAKURA_COLORS.PETAL_CREAM.bMin)
          );
      } else {
        // Soft lavender
        r =
          SAKURA_COLORS.PETAL_LAVENDER.r +
          Math.floor(Math.random() * SAKURA_COLORS.PETAL_LAVENDER.rRange);
        g =
          SAKURA_COLORS.PETAL_LAVENDER.gMin +
          Math.floor(
            Math.random() *
              (SAKURA_COLORS.PETAL_LAVENDER.gMax -
                SAKURA_COLORS.PETAL_LAVENDER.gMin)
          );
        b = SAKURA_COLORS.PETAL_LAVENDER.b;
      }
    }

    return {
      x,
      y,
      size,
      vx,
      vy,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      opacity: isFlower
        ? SAKURA_OPACITY.FLOWER.MIN +
          Math.random() * SAKURA_OPACITY.FLOWER.RANGE
        : SAKURA_OPACITY.PETAL.MIN + Math.random() * SAKURA_OPACITY.PETAL.RANGE,
      swayOffset,
      swayAmplitude,
      color: { r, g, b },
      isFlower,
    };
  }

  /**
   * Update petal positions and properties
   */
  function update(
    petals: SakuraPetal[],
    dimensions: Dimensions,
    frameMultiplier: number
  ): SakuraPetal[] {
    return petals.map((petal) => {
      // Update sway animation
      const newSwayOffset =
        petal.swayOffset + SAKURA_PHYSICS.SWAY_SPEED * frameMultiplier;
      const swayX =
        Math.sin(newSwayOffset) *
        petal.swayAmplitude *
        SAKURA_PHYSICS.SWAY_SCALE;

      // Update position with sway
      let newX = petal.x + (petal.vx + swayX) * frameMultiplier;
      const newY = petal.y + petal.vy * frameMultiplier;

      // Update rotation
      const newRotation =
        petal.rotation + petal.rotationSpeed * frameMultiplier;

      // Respawn if petal has fallen below the viewport
      if (newY > dimensions.height + SAKURA_BOUNDS.RESPAWN_BUFFER) {
        return createPetal(dimensions, false);
      }

      // Wrap horizontally
      if (newX < -SAKURA_BOUNDS.RESPAWN_BUFFER) {
        newX = dimensions.width + SAKURA_BOUNDS.RESPAWN_BUFFER;
      } else if (newX > dimensions.width + SAKURA_BOUNDS.RESPAWN_BUFFER) {
        newX = -SAKURA_BOUNDS.RESPAWN_BUFFER;
      }

      return {
        ...petal,
        x: newX,
        y: newY,
        rotation: newRotation,
        swayOffset: newSwayOffset,
      };
    });
  }

  /**
   * Draw petals and flowers with soft edges
   */
  function draw(
    petals: SakuraPetal[],
    ctx: CanvasRenderingContext2D,
    _dimensions: Dimensions
  ): void {
    petals.forEach((petal) => {
      const { x, y, size, rotation, opacity, color, isFlower } = petal;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      if (isFlower) {
        // Draw a full cherry blossom flower (5 petals)
        for (let i = 0; i < SAKURA_FLOWER.PETAL_COUNT; i++) {
          const angle = (i * Math.PI * 2) / SAKURA_FLOWER.PETAL_COUNT;
          ctx.save();
          ctx.rotate(angle);

          // Petal gradient
          const gradient = ctx.createRadialGradient(
            0,
            size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            0,
            0,
            size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * 0.6
          );
          gradient.addColorStop(
            SAKURA_FLOWER.GRADIENT_INNER,
            `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
          );
          gradient.addColorStop(
            SAKURA_FLOWER.GRADIENT_MID,
            `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * SAKURA_FLOWER.MID_OPACITY})`
          );
          gradient.addColorStop(
            SAKURA_FLOWER.GRADIENT_OUTER,
            `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * SAKURA_FLOWER.OUTER_OPACITY})`
          );

          ctx.fillStyle = gradient;
          ctx.beginPath();
          // Heart-shaped petal
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * SAKURA_FLOWER.CURVE.TOP_Y,
            size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * SAKURA_FLOWER.CURVE.MID_Y
          );
          ctx.quadraticCurveTo(
            size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * SAKURA_FLOWER.CURVE.BOTTOM_Y,
            0,
            size * SAKURA_FLOWER.CURVE.END_Y
          );
          ctx.quadraticCurveTo(
            -size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * SAKURA_FLOWER.CURVE.BOTTOM_Y,
            -size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * SAKURA_FLOWER.CURVE.MID_Y
          );
          ctx.quadraticCurveTo(
            -size * SAKURA_FLOWER.CURVE.WIDTH_FACTOR,
            size * SAKURA_FLOWER.CURVE.TOP_Y,
            0,
            0
          );
          ctx.fill();

          ctx.restore();
        }

        // Draw yellow center
        const centerGradient = ctx.createRadialGradient(
          0,
          0,
          0,
          0,
          0,
          size * SAKURA_FLOWER.CENTER.RADIUS_MULTIPLIER
        );
        centerGradient.addColorStop(
          0,
          `rgba(${SAKURA_FLOWER.CENTER.COLOR.r}, ${SAKURA_FLOWER.CENTER.COLOR.g}, ${SAKURA_FLOWER.CENTER.COLOR.b}, ${opacity})`
        );
        centerGradient.addColorStop(
          1,
          `rgba(${SAKURA_FLOWER.CENTER.OUTER_COLOR.r}, ${SAKURA_FLOWER.CENTER.OUTER_COLOR.g}, ${SAKURA_FLOWER.CENTER.OUTER_COLOR.b}, ${opacity * SAKURA_FLOWER.CENTER.OUTER_OPACITY})`
        );
        ctx.fillStyle = centerGradient;
        ctx.beginPath();
        ctx.arc(
          0,
          0,
          size * SAKURA_FLOWER.CENTER.RADIUS_MULTIPLIER,
          0,
          Math.PI * 2
        );
        ctx.fill();
      } else {
        // Draw single petal
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
        gradient.addColorStop(
          SAKURA_PETAL.GRADIENT.INNER,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
        );
        gradient.addColorStop(
          SAKURA_PETAL.GRADIENT.MID,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * SAKURA_PETAL.OPACITY.MID})`
        );
        gradient.addColorStop(
          SAKURA_PETAL.GRADIENT.OUTER,
          `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * SAKURA_PETAL.OPACITY.OUTER})`
        );

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Draw stylized petal shape (two overlapping ellipses)
        ctx.ellipse(
          0,
          0,
          size * SAKURA_PETAL.ELLIPSE.PRIMARY.width,
          size * SAKURA_PETAL.ELLIPSE.PRIMARY.height,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          size * SAKURA_PETAL.ELLIPSE.SECONDARY.width,
          size * SAKURA_PETAL.ELLIPSE.SECONDARY.height,
          SAKURA_PETAL.ELLIPSE.SECONDARY.rotation,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      ctx.restore();
    });
  }

  /**
   * Adjust petals when viewport resizes
   */
  function adjustToResize(
    petals: SakuraPetal[],
    oldDimensions: Dimensions,
    newDimensions: Dimensions,
    quality: QualityLevel
  ): SakuraPetal[] {
    const targetCount = getPetalCount(quality);
    const scaleX = newDimensions.width / oldDimensions.width;
    const scaleY = newDimensions.height / oldDimensions.height;

    // Scale existing petals
    const adjusted = petals.map((petal) => ({
      ...petal,
      x: petal.x * scaleX,
      y: petal.y * scaleY,
    }));

    // Add or remove petals to match target count
    while (adjusted.length < targetCount) {
      adjusted.push(createPetal(newDimensions, true));
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
    petals: SakuraPetal[],
    dimensions: Dimensions,
    quality: QualityLevel
  ): SakuraPetal[] {
    const targetCount = getPetalCount(quality);

    if (petals.length < targetCount) {
      // Add more petals
      const toAdd = targetCount - petals.length;
      for (let i = 0; i < toAdd; i++) {
        petals.push(createPetal(dimensions, true));
      }
    } else if (petals.length > targetCount) {
      // Remove excess petals
      petals = petals.slice(0, targetCount);
    }

    return petals;
  }

  return {
    initialize,
    update,
    draw,
    adjustToResize,
    setQuality,
  };
}
