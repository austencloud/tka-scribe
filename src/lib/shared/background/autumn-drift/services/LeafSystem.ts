// LeafSystem.ts - Autumn leaf particle management and rendering
// Handles creation, animation, and drawing of falling leaves

import type { Leaf, LeafType, LeafSystemConfig } from "../domain/models/autumn-models";
import {
  AUTUMN_COLORS,
  AUTUMN_LEAF_SIZES,
  AUTUMN_LEAF_DISTRIBUTION,
  AUTUMN_PHYSICS,
  AUTUMN_OPACITY,
  AUTUMN_BOUNDS,
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
    if (rand < AUTUMN_LEAF_DISTRIBUTION.maple) return "maple";
    if (rand < AUTUMN_LEAF_DISTRIBUTION.maple + AUTUMN_LEAF_DISTRIBUTION.oak) return "oak";
    return "oval";
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

    return colors[Math.floor(Math.random() * colors.length)] ?? AUTUMN_COLORS.golds[0];
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
    const x = Math.random() * (canvasWidth + AUTUMN_BOUNDS.wrapMargin * 2) - AUTUMN_BOUNDS.wrapMargin;
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
        Math.random() * (AUTUMN_PHYSICS.rotationSpeed.max - AUTUMN_PHYSICS.rotationSpeed.min));

    const tumbleSpeed =
      AUTUMN_PHYSICS.tumbleSpeed.min +
      Math.random() * (AUTUMN_PHYSICS.tumbleSpeed.max - AUTUMN_PHYSICS.tumbleSpeed.min);

    // Opacity based on depth
    const baseOpacity = AUTUMN_OPACITY.min + Math.random() * (AUTUMN_OPACITY.max - AUTUMN_OPACITY.min);
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
    for (let i = 0; i < targetParticleCount; i++) {
      leaves.push(createLeaf(false)); // Distribute across screen initially
    }

    // Sort by depth for proper layering (far to near)
    leaves.sort((a, b) => a.depth - b.depth);
  }

  function update(windForce: number, frameMultiplier: number): void {
    for (const leaf of leaves) {
      // Apply wind force
      leaf.vx += windForce * 0.1 * frameMultiplier;

      // Apply spiral motion if active
      if (leaf.spiralActive && leaf.spiralPhase !== undefined) {
        leaf.spiralPhase += AUTUMN_PHYSICS.spiralSpeed * frameMultiplier;
        const spiralX = Math.sin(leaf.spiralPhase) * AUTUMN_PHYSICS.spiralRadius * leaf.size;
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

  function getOrCreateLeafPath(type: LeafType, size: number): Path2D {
    const key = `${type}-${Math.round(size)}`;
    if (leafPathCache.has(key)) {
      return leafPathCache.get(key)!;
    }

    const path = new Path2D();

    switch (type) {
      case "maple":
        drawMaplePath(path, size);
        break;
      case "oak":
        drawOakPath(path, size);
        break;
      case "oval":
        drawOvalPath(path, size);
        break;
    }

    leafPathCache.set(key, path);
    return path;
  }

  function drawMaplePath(path: Path2D, size: number): void {
    // 5-pointed maple leaf with curved indentations
    const points = 5;
    const outerRadius = size / 2;
    const innerRadius = outerRadius * 0.4;

    path.moveTo(0, -outerRadius);

    for (let i = 0; i < points; i++) {
      const outerAngle = (i * 2 * Math.PI) / points - Math.PI / 2;
      const innerAngle = ((i + 0.5) * 2 * Math.PI) / points - Math.PI / 2;
      const nextOuterAngle = ((i + 1) * 2 * Math.PI) / points - Math.PI / 2;

      const outerX = Math.cos(outerAngle) * outerRadius;
      const outerY = Math.sin(outerAngle) * outerRadius;
      const innerX = Math.cos(innerAngle) * innerRadius;
      const innerY = Math.sin(innerAngle) * innerRadius;
      const nextOuterX = Math.cos(nextOuterAngle) * outerRadius;
      const nextOuterY = Math.sin(nextOuterAngle) * outerRadius;

      // Curve from current outer point to inner point
      const cp1x = outerX + (innerX - outerX) * 0.5;
      const cp1y = outerY + (innerY - outerY) * 0.3;
      path.quadraticCurveTo(cp1x, cp1y, innerX, innerY);

      // Curve from inner point to next outer point
      const cp2x = innerX + (nextOuterX - innerX) * 0.5;
      const cp2y = innerY + (nextOuterY - innerY) * 0.3;
      path.quadraticCurveTo(cp2x, cp2y, nextOuterX, nextOuterY);
    }

    path.closePath();

    // Add stem
    path.moveTo(0, outerRadius * 0.3);
    path.lineTo(0, outerRadius * 1.2);
  }

  function drawOakPath(path: Path2D, size: number): void {
    // Oak leaf with wavy lobed edges
    const halfWidth = size * 0.4;
    const halfHeight = size * 0.6;
    const lobes = 4;

    path.moveTo(0, -halfHeight);

    // Right side with lobes
    for (let i = 0; i < lobes; i++) {
      const t = i / lobes;
      const nextT = (i + 1) / lobes;
      const y1 = -halfHeight + t * halfHeight * 2;
      const y2 = -halfHeight + nextT * halfHeight * 2;
      const lobeDepth = halfWidth * (0.7 + 0.3 * Math.sin(t * Math.PI));
      const insetDepth = halfWidth * 0.5;

      path.quadraticCurveTo(lobeDepth, (y1 + y2) / 2 - halfHeight * 0.1, insetDepth, y2);
    }

    // Bottom point
    path.lineTo(0, halfHeight);

    // Left side with lobes (mirror)
    for (let i = lobes - 1; i >= 0; i--) {
      const t = i / lobes;
      const prevT = (i - 1) / lobes;
      const y1 = -halfHeight + t * halfHeight * 2;
      const y2 = -halfHeight + Math.max(0, prevT) * halfHeight * 2;
      const lobeDepth = -halfWidth * (0.7 + 0.3 * Math.sin(t * Math.PI));
      const insetDepth = -halfWidth * 0.5;

      path.quadraticCurveTo(lobeDepth, (y1 + y2) / 2, insetDepth, y2);
    }

    path.closePath();

    // Add stem
    path.moveTo(0, halfHeight);
    path.lineTo(0, halfHeight + size * 0.25);
  }

  function drawOvalPath(path: Path2D, size: number): void {
    // Simple elongated oval leaf
    const halfWidth = size * 0.35;
    const halfHeight = size * 0.55;

    path.ellipse(0, 0, halfWidth, halfHeight, 0, 0, Math.PI * 2);

    // Add center vein
    path.moveTo(0, -halfHeight * 0.8);
    path.lineTo(0, halfHeight * 0.8);

    // Add stem
    path.moveTo(0, halfHeight);
    path.lineTo(0, halfHeight + size * 0.2);
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
