import type { Firefly } from "../domain/models/firefly-models";
import type {
  Dimensions,
  QualityLevel,
} from "$lib/shared/background/shared/domain/types/background-types";
import {
  FIREFLY_COUNTS,
  FIREFLY_PHYSICS,
  FIREFLY_SIZE,
  FIREFLY_OPACITY,
  FIREFLY_COLORS,
  RESPAWN_BUFFER,
  SPECIAL_FIREFLY,
} from "../domain/constants/firefly-constants";

function randomInRange(min: number, range: number): number {
  return min + Math.random() * range;
}

function createFireflyColor(): { r: number; g: number; b: number } {
  const colorVariant = Math.random();

  if (colorVariant < FIREFLY_COLORS.YELLOW_GREEN.probability) {
    return {
      r: FIREFLY_COLORS.YELLOW_GREEN.r,
      g: randomInRange(
        FIREFLY_COLORS.YELLOW_GREEN.gMin,
        FIREFLY_COLORS.YELLOW_GREEN.gMax - FIREFLY_COLORS.YELLOW_GREEN.gMin
      ),
      b: randomInRange(
        FIREFLY_COLORS.YELLOW_GREEN.bMin,
        FIREFLY_COLORS.YELLOW_GREEN.bMax - FIREFLY_COLORS.YELLOW_GREEN.bMin
      ),
    };
  } else if (colorVariant < FIREFLY_COLORS.BRIGHT_GREEN.probability) {
    return {
      r: FIREFLY_COLORS.BRIGHT_GREEN.r,
      g: randomInRange(
        FIREFLY_COLORS.BRIGHT_GREEN.gMin,
        FIREFLY_COLORS.BRIGHT_GREEN.gMax - FIREFLY_COLORS.BRIGHT_GREEN.gMin
      ),
      b: randomInRange(
        FIREFLY_COLORS.BRIGHT_GREEN.bMin,
        FIREFLY_COLORS.BRIGHT_GREEN.bMax - FIREFLY_COLORS.BRIGHT_GREEN.bMin
      ),
    };
  } else {
    return {
      r: randomInRange(
        FIREFLY_COLORS.WARM_GOLD.rMin,
        FIREFLY_COLORS.WARM_GOLD.rMax - FIREFLY_COLORS.WARM_GOLD.rMin
      ),
      g: randomInRange(
        FIREFLY_COLORS.WARM_GOLD.gMin,
        FIREFLY_COLORS.WARM_GOLD.gMax - FIREFLY_COLORS.WARM_GOLD.gMin
      ),
      b: randomInRange(
        FIREFLY_COLORS.WARM_GOLD.bMin,
        FIREFLY_COLORS.WARM_GOLD.bMax - FIREFLY_COLORS.WARM_GOLD.bMin
      ),
    };
  }
}

export function createFireflySystem() {
  function createFirefly(
    dimensions: Dimensions,
    randomizePosition: boolean = true
  ): Firefly {
    const zoneTop = dimensions.height * FIREFLY_PHYSICS.ZONE_TOP;
    const zoneBottom = dimensions.height * FIREFLY_PHYSICS.ZONE_BOTTOM;
    const zoneHeight = zoneBottom - zoneTop;

    // Easter egg: 1% chance for a special rose-colored firefly
    const isSpecial = Math.random() < SPECIAL_FIREFLY.CHANCE;

    const baseSize = randomInRange(FIREFLY_SIZE.MIN, FIREFLY_SIZE.RANGE);
    const size = isSpecial
      ? baseSize * SPECIAL_FIREFLY.SIZE_MULTIPLIER
      : baseSize;
    const glowMultiplier = isSpecial
      ? SPECIAL_FIREFLY.GLOW_MULTIPLIER
      : FIREFLY_PHYSICS.GLOW_MULTIPLIER;

    const wanderAngle = Math.random() * Math.PI * 2;
    const wanderSpeed = randomInRange(
      FIREFLY_PHYSICS.WANDER_SPEED_BASE,
      FIREFLY_PHYSICS.WANDER_SPEED_RANGE
    );

    return {
      x: randomizePosition ? Math.random() * dimensions.width : -RESPAWN_BUFFER,
      y: randomizePosition
        ? zoneTop + Math.random() * zoneHeight
        : zoneTop + Math.random() * zoneHeight,
      size,
      vx: Math.cos(wanderAngle) * wanderSpeed,
      vy: Math.sin(wanderAngle) * wanderSpeed,
      glowRadius: size * glowMultiplier,
      glowIntensity: Math.random(),
      blinkPhase:
        Math.random() *
        (FIREFLY_PHYSICS.BLINK_CYCLE_MIN + FIREFLY_PHYSICS.BLINK_CYCLE_RANGE),
      blinkCycleLength:
        FIREFLY_PHYSICS.BLINK_CYCLE_MIN +
        Math.random() * FIREFLY_PHYSICS.BLINK_CYCLE_RANGE,
      color: isSpecial ? { ...SPECIAL_FIREFLY.COLOR } : createFireflyColor(),
      wanderAngle,
      wanderSpeed,
      baseOpacity: randomInRange(FIREFLY_OPACITY.MIN, FIREFLY_OPACITY.RANGE),
      isSpecial,
    };
  }

  function initialize(
    dimensions: Dimensions,
    quality: QualityLevel
  ): Firefly[] {
    const count = FIREFLY_COUNTS[quality];
    const fireflies: Firefly[] = [];

    for (let i = 0; i < count; i++) {
      fireflies.push(createFirefly(dimensions, true));
    }

    return fireflies;
  }

  function update(
    fireflies: Firefly[],
    dimensions: Dimensions,
    frameMultiplier: number = 1.0
  ): Firefly[] {
    const zoneTop = dimensions.height * FIREFLY_PHYSICS.ZONE_TOP;
    const zoneBottom = dimensions.height * FIREFLY_PHYSICS.ZONE_BOTTOM;

    return fireflies.map((firefly) => {
      // Update wander angle with smooth random changes
      const angleChange =
        (Math.random() - 0.5) *
        FIREFLY_PHYSICS.WANDER_ANGLE_RANGE *
        frameMultiplier;
      let newWanderAngle = firefly.wanderAngle + angleChange;

      // Soft boundary correction - steer back toward center if near edges
      if (firefly.y < zoneTop + 50) {
        newWanderAngle += 0.05 * frameMultiplier; // Steer down
      } else if (firefly.y > zoneBottom - 50) {
        newWanderAngle -= 0.05 * frameMultiplier; // Steer up
      }

      // Calculate new velocities from wander angle
      const newVx = Math.cos(newWanderAngle) * firefly.wanderSpeed;
      const newVy = Math.sin(newWanderAngle) * firefly.wanderSpeed;

      // Update position
      let newX = firefly.x + newVx * frameMultiplier;
      let newY = firefly.y + newVy * frameMultiplier;

      // Update blink phase
      let newBlinkPhase = firefly.blinkPhase + frameMultiplier;
      if (newBlinkPhase >= firefly.blinkCycleLength) {
        newBlinkPhase = 0;
      }

      // Calculate glow intensity based on blink phase
      const blinkProgress = newBlinkPhase / firefly.blinkCycleLength;
      let newGlowIntensity: number;

      if (blinkProgress < FIREFLY_PHYSICS.BLINK_ON_DURATION) {
        // Lit phase - smooth fade in/out
        const litProgress = blinkProgress / FIREFLY_PHYSICS.BLINK_ON_DURATION;
        // Use sine for smooth fade: 0 -> 1 -> 0
        newGlowIntensity = Math.sin(litProgress * Math.PI);
      } else {
        // Dark phase
        newGlowIntensity = 0;
      }

      // Wrap horizontally
      if (newX < -RESPAWN_BUFFER) {
        newX = dimensions.width + RESPAWN_BUFFER;
      } else if (newX > dimensions.width + RESPAWN_BUFFER) {
        newX = -RESPAWN_BUFFER;
      }

      // Clamp vertically within zone
      newY = Math.max(zoneTop, Math.min(zoneBottom, newY));

      return {
        ...firefly,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy,
        wanderAngle: newWanderAngle,
        blinkPhase: newBlinkPhase,
        glowIntensity: newGlowIntensity,
      };
    });
  }

  function draw(fireflies: Firefly[], ctx: CanvasRenderingContext2D): void {
    for (const firefly of fireflies) {
      if (firefly.glowIntensity < 0.01) continue; // Skip if nearly invisible

      const { x, y, size, glowRadius, glowIntensity, color, baseOpacity } =
        firefly;
      const opacity = baseOpacity * glowIntensity;

      // Draw outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradient.addColorStop(
        0,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`
      );
      gradient.addColorStop(
        0.3,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.5})`
      );
      gradient.addColorStop(
        0.6,
        `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.2})`
      );
      gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(
        x - glowRadius,
        y - glowRadius,
        glowRadius * 2,
        glowRadius * 2
      );

      // Draw bright core
      ctx.fillStyle = `rgba(${Math.min(255, color.r + 40)}, ${Math.min(255, color.g + 20)}, ${Math.min(255, color.b + 20)}, ${Math.min(1, opacity * FIREFLY_OPACITY.CORE_MULTIPLIER)})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function adjustToResize(
    fireflies: Firefly[],
    oldDimensions: Dimensions,
    newDimensions: Dimensions,
    quality: QualityLevel
  ): Firefly[] {
    const scaleX = newDimensions.width / oldDimensions.width;
    const scaleY = newDimensions.height / oldDimensions.height;
    const targetCount = FIREFLY_COUNTS[quality];

    const adjusted = fireflies.map((f) => ({
      ...f,
      x: f.x * scaleX,
      y: f.y * scaleY,
    }));

    while (adjusted.length < targetCount) {
      adjusted.push(createFirefly(newDimensions, true));
    }
    while (adjusted.length > targetCount) {
      adjusted.pop();
    }

    return adjusted;
  }

  function setQuality(
    fireflies: Firefly[],
    dimensions: Dimensions,
    quality: QualityLevel
  ): Firefly[] {
    const targetCount = FIREFLY_COUNTS[quality];
    const adjusted = [...fireflies];

    while (adjusted.length < targetCount) {
      adjusted.push(createFirefly(dimensions, true));
    }
    while (adjusted.length > targetCount) {
      adjusted.pop();
    }

    return adjusted;
  }

  return {
    createFirefly,
    initialize,
    update,
    draw,
    adjustToResize,
    setQuality,
  };
}
