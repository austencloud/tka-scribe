// LeafSystem.ts - Autumn leaf particle management and rendering
// Handles creation, animation, and drawing of falling leaves

import type {
  Leaf,
  LeafType,
  LeafSystemConfig,
} from "../domain/models/autumn-models";
import {
  AUTUMN_COLORS,
  AUTUMN_LEAF_SIZES,
  AUTUMN_LEAF_DISTRIBUTION,
  AUTUMN_PHYSICS,
  AUTUMN_OPACITY,
  AUTUMN_BOUNDS,
  AUTUMN_LEAF_PATHS,
} from "../domain/constants/autumn-constants";

export interface LeafSystem {
  leaves: Leaf[];
  initialize(config: LeafSystemConfig): void;
  update(windForce: number, frameMultiplier: number): void;
  draw(ctx: CanvasRenderingContext2D): void;
  resize(width: number, height: number): void;
  setParticleCount(count: number): void;
}

export function createLeafSystem(): LeafSystem {
  let leaves: Leaf[] = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let targetParticleCount = 0;

  // Pre-computed Path2D objects for each leaf type (created once per size)
  const leafPathCache = new Map<string, Path2D>();

  function getLeafType(): LeafType {
    const rand = Math.random();
    let cumulative = 0;

    cumulative += AUTUMN_LEAF_DISTRIBUTION.maple;
    if (rand < cumulative) return "maple";

    cumulative += AUTUMN_LEAF_DISTRIBUTION.curved;
    if (rand < cumulative) return "curved";

    cumulative += AUTUMN_LEAF_DISTRIBUTION.oak;
    if (rand < cumulative) return "oak";

    cumulative += AUTUMN_LEAF_DISTRIBUTION.rounded;
    if (rand < cumulative) return "rounded";

    cumulative += AUTUMN_LEAF_DISTRIBUTION.double;
    if (rand < cumulative) return "double";

    return "nature";
  }

  function getLeafColor(): string {
    const rand = Math.random();
    let colors: readonly string[];

    if (rand < 0.3) {
      colors = AUTUMN_COLORS.golds;
    } else if (rand < 0.6) {
      colors = AUTUMN_COLORS.oranges;
    } else if (rand < 0.85) {
      colors = AUTUMN_COLORS.reds;
    } else if (rand < 0.95) {
      colors = AUTUMN_COLORS.browns;
    } else {
      colors = AUTUMN_COLORS.greens;
    }

    return (
      colors[Math.floor(Math.random() * colors.length)] ??
      AUTUMN_COLORS.golds[0]
    );
  }

  function getLeafSize(type: LeafType): number {
    const sizeRange = AUTUMN_LEAF_SIZES[type];
    return sizeRange.min + Math.random() * (sizeRange.max - sizeRange.min);
  }

  function createLeaf(atTop: boolean = false): Leaf {
    const type = getLeafType();
    const size = getLeafSize(type);
    const depth = Math.random();

    // Position
    const x =
      Math.random() * (canvasWidth + AUTUMN_BOUNDS.wrapMargin * 2) -
      AUTUMN_BOUNDS.wrapMargin;
    const y = atTop
      ? -AUTUMN_BOUNDS.respawnBuffer - Math.random() * 50
      : Math.random() * canvasHeight;

    // Velocity - larger leaves fall slower
    const sizeModifier = 1 - (size / 30) * AUTUMN_PHYSICS.sizeSpeedFactor;
    const vy =
      AUTUMN_PHYSICS.baseSpeed +
      Math.random() * AUTUMN_PHYSICS.speedVariance * sizeModifier;

    const vx =
      (Math.random() - 0.5) * 2 * AUTUMN_PHYSICS.baseDrift +
      (Math.random() - 0.5) * AUTUMN_PHYSICS.driftVariance;

    // Rotation
    const rotationSpeed =
      (Math.random() < 0.5 ? 1 : -1) *
      (AUTUMN_PHYSICS.rotationSpeed.min +
        Math.random() *
          (AUTUMN_PHYSICS.rotationSpeed.max -
            AUTUMN_PHYSICS.rotationSpeed.min));

    const tumbleSpeed =
      AUTUMN_PHYSICS.tumbleSpeed.min +
      Math.random() *
        (AUTUMN_PHYSICS.tumbleSpeed.max - AUTUMN_PHYSICS.tumbleSpeed.min);

    // Opacity based on depth
    const baseOpacity =
      AUTUMN_OPACITY.min +
      Math.random() * (AUTUMN_OPACITY.max - AUTUMN_OPACITY.min);
    const opacity = baseOpacity - depth * AUTUMN_OPACITY.depthFactor;

    // Spiral descent
    const spiralActive = Math.random() < AUTUMN_PHYSICS.spiralChance;

    return {
      x,
      y,
      vx,
      vy,
      size,
      type,
      color: getLeafColor(),
      opacity: Math.max(0.4, opacity),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      tumblePhase: Math.random() * Math.PI * 2,
      tumbleSpeed,
      depth,
      spiralPhase: spiralActive ? Math.random() * Math.PI * 2 : undefined,
      spiralActive,
    };
  }

  function initialize(config: LeafSystemConfig): void {
    canvasWidth = config.canvasWidth;
    canvasHeight = config.canvasHeight;
    targetParticleCount = config.particleCount;

    leaves = [];

    // Use stratified sampling for even vertical distribution
    // Divide screen into horizontal bands, place one leaf per band with jitter
    const bandHeight = canvasHeight / targetParticleCount;

    for (let i = 0; i < targetParticleCount; i++) {
      const bandStart = i * bandHeight;
      // Random Y position within this band (stratified with jitter)
      const stratifiedY = bandStart + Math.random() * bandHeight;
      leaves.push(createLeafWithPosition(stratifiedY));
    }

    // Sort by depth for proper layering (far to near)
    leaves.sort((a, b) => a.depth - b.depth);
  }

  /**
   * Create leaf at a specific Y position (for stratified initialization)
   */
  function createLeafWithPosition(y: number): Leaf {
    const type = getLeafType();
    const size = getLeafSize(type);
    const depth = Math.random();

    // Position - X is random, Y is provided
    const x =
      Math.random() * (canvasWidth + AUTUMN_BOUNDS.wrapMargin * 2) -
      AUTUMN_BOUNDS.wrapMargin;

    // Velocity - larger leaves fall slower
    const sizeModifier = 1 - (size / 30) * AUTUMN_PHYSICS.sizeSpeedFactor;
    const vy =
      AUTUMN_PHYSICS.baseSpeed +
      Math.random() * AUTUMN_PHYSICS.speedVariance * sizeModifier;

    const vx =
      (Math.random() - 0.5) * 2 * AUTUMN_PHYSICS.baseDrift +
      (Math.random() - 0.5) * AUTUMN_PHYSICS.driftVariance;

    // Rotation
    const rotationSpeed =
      (Math.random() < 0.5 ? 1 : -1) *
      (AUTUMN_PHYSICS.rotationSpeed.min +
        Math.random() *
          (AUTUMN_PHYSICS.rotationSpeed.max -
            AUTUMN_PHYSICS.rotationSpeed.min));

    const tumbleSpeed =
      AUTUMN_PHYSICS.tumbleSpeed.min +
      Math.random() *
        (AUTUMN_PHYSICS.tumbleSpeed.max - AUTUMN_PHYSICS.tumbleSpeed.min);

    // Opacity based on depth
    const baseOpacity =
      AUTUMN_OPACITY.min +
      Math.random() * (AUTUMN_OPACITY.max - AUTUMN_OPACITY.min);
    const opacity = baseOpacity - depth * AUTUMN_OPACITY.depthFactor;

    // Spiral descent
    const spiralActive = Math.random() < AUTUMN_PHYSICS.spiralChance;

    return {
      x,
      y,
      vx,
      vy,
      size,
      type,
      color: getLeafColor(),
      opacity: Math.max(0.4, opacity),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed,
      tumblePhase: Math.random() * Math.PI * 2,
      tumbleSpeed,
      depth,
      spiralPhase: spiralActive ? Math.random() * Math.PI * 2 : undefined,
      spiralActive,
    };
  }

  function update(windForce: number, frameMultiplier: number): void {
    for (const leaf of leaves) {
      // Apply wind force
      leaf.vx += windForce * 0.1 * frameMultiplier;

      // Apply spiral motion if active
      if (leaf.spiralActive && leaf.spiralPhase !== undefined) {
        leaf.spiralPhase += AUTUMN_PHYSICS.spiralSpeed * frameMultiplier;
        const spiralX =
          Math.sin(leaf.spiralPhase) * AUTUMN_PHYSICS.spiralRadius * leaf.size;
        leaf.x += spiralX * 0.1 * frameMultiplier;
      }

      // Update position
      leaf.x += leaf.vx * frameMultiplier;
      leaf.y += leaf.vy * frameMultiplier;

      // Update rotations
      leaf.rotation += leaf.rotationSpeed * frameMultiplier;
      leaf.tumblePhase += leaf.tumbleSpeed * frameMultiplier;

      // Dampen horizontal velocity (air resistance)
      leaf.vx *= 0.995;

      // Respawn if below screen
      if (leaf.y > canvasHeight + AUTUMN_BOUNDS.respawnBuffer) {
        Object.assign(leaf, createLeaf(true));
      }

      // Wrap horizontally
      if (leaf.x < -AUTUMN_BOUNDS.wrapMargin) {
        leaf.x = canvasWidth + AUTUMN_BOUNDS.wrapMargin;
      } else if (leaf.x > canvasWidth + AUTUMN_BOUNDS.wrapMargin) {
        leaf.x = -AUTUMN_BOUNDS.wrapMargin;
      }
    }
  }

  /**
   * Create a scaled and centered Path2D from SVG path data
   * Transforms the original viewBox coordinates to be centered at origin
   * and scaled to the target size
   */
  function createScaledPath(
    svgPath: string,
    viewBox: { width: number; height: number },
    targetSize: number
  ): Path2D {
    // Calculate scale factor to fit within target size
    const maxDimension = Math.max(viewBox.width, viewBox.height);
    const scale = targetSize / maxDimension;

    // Center offsets (move origin to center of viewBox)
    const offsetX = -viewBox.width / 2;
    const offsetY = -viewBox.height / 2;

    // Create a transformation matrix
    const matrix = new DOMMatrix();
    matrix.scaleSelf(scale, scale);
    matrix.translateSelf(offsetX, offsetY);

    // Create path from SVG string and apply transformation
    const originalPath = new Path2D(svgPath);
    const scaledPath = new Path2D();
    scaledPath.addPath(originalPath, matrix);

    return scaledPath;
  }

  function getOrCreateLeafPath(type: LeafType, size: number): Path2D {
    const key = `${type}-${Math.round(size)}`;
    if (leafPathCache.has(key)) {
      return leafPathCache.get(key)!;
    }

    const leafData = AUTUMN_LEAF_PATHS[type];
    const path = createScaledPath(leafData.d, leafData.viewBox, size);

    leafPathCache.set(key, path);
    return path;
  }

  function draw(ctx: CanvasRenderingContext2D): void {
    for (const leaf of leaves) {
      ctx.save();

      // Position
      ctx.translate(leaf.x, leaf.y);

      // Primary rotation
      ctx.rotate(leaf.rotation);

      // 3D tumble effect via scale (simulates rotation on perpendicular axis)
      const tumbleScale = 0.5 + 0.5 * Math.abs(Math.cos(leaf.tumblePhase));
      ctx.scale(tumbleScale, 1);

      // Get cached path
      const path = getOrCreateLeafPath(leaf.type, leaf.size);

      // Draw leaf with gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, leaf.size * 0.6);
      gradient.addColorStop(0, adjustColorBrightness(leaf.color, 1.2));
      gradient.addColorStop(0.5, leaf.color);
      gradient.addColorStop(1, adjustColorBrightness(leaf.color, 0.7));

      ctx.globalAlpha = leaf.opacity;
      ctx.fillStyle = gradient;
      ctx.fill(path);

      // Subtle stroke for definition
      ctx.strokeStyle = adjustColorBrightness(leaf.color, 0.5);
      ctx.lineWidth = 0.5;
      ctx.stroke(path);

      ctx.restore();
    }
  }

  function adjustColorBrightness(hex: string, factor: number): string {
    // Parse hex color
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Adjust brightness
    const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
    const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
    const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
  }

  function resize(width: number, height: number): void {
    canvasWidth = width;
    canvasHeight = height;
  }

  function setParticleCount(count: number): void {
    targetParticleCount = count;

    if (leaves.length < count) {
      // Add more leaves
      while (leaves.length < count) {
        leaves.push(createLeaf(true));
      }
    } else if (leaves.length > count) {
      // Remove excess leaves
      leaves.length = count;
    }

    // Re-sort by depth
    leaves.sort((a, b) => a.depth - b.depth);
  }

  return {
    get leaves() {
      return leaves;
    },
    initialize,
    update,
    draw,
    resize,
    setParticleCount,
  };
}
