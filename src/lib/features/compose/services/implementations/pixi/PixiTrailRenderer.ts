/**
 * PixiJS Trail Renderer
 *
 * Handles trail rendering:
 * - Smooth trail rendering (Catmull-Rom splines)
 * - Segmented trail rendering
 * - Trail opacity calculations (fade/gradient)
 * - Multi-end trail support (both ends tracking)
 *
 * Single Responsibility: Trail rendering logic
 */

import type { Container } from "pixi.js";
import { Graphics } from "pixi.js";
import type {
  TrailPoint,
  TrailSettings,
} from "../../../shared/domain/types/TrailTypes";
import {
  TrailMode,
  TrailStyle,
  TrackingMode,
} from "../../../shared/domain/types/TrailTypes";

// ============================================================================
// CATMULL-ROM SPLINE (inlined for smooth trail curves)
// ============================================================================

interface Point2D {
  x: number;
  y: number;
}

interface SplineConfig {
  alpha: number;
  subdivisionsPerSegment: number;
}

/**
 * Create smooth curve through control points using centripetal Catmull-Rom splines
 */
function createSmoothCurve(
  controlPoints: readonly Point2D[],
  config: Partial<SplineConfig> = {}
): Point2D[] {
  const alpha = config.alpha ?? 0.5;
  const subdivisions = config.subdivisionsPerSegment ?? 10;

  if (controlPoints.length < 2) return [...controlPoints];

  if (controlPoints.length === 2) {
    // Linear interpolation for 2 points
    const points: Point2D[] = [];
    const [p0, p1] = controlPoints;
    for (let i = 0; i <= subdivisions; i++) {
      const t = i / subdivisions;
      points.push({
        x: p0!.x + (p1!.x - p0!.x) * t,
        y: p0!.y + (p1!.y - p0!.y) * t,
      });
    }
    return points;
  }

  const result: Point2D[] = [{ ...controlPoints[0]! }];

  for (let i = 0; i < controlPoints.length - 1; i++) {
    const p0 = i > 0 ? controlPoints[i - 1]! : controlPoints[i]!;
    const p1 = controlPoints[i]!;
    const p2 = controlPoints[i + 1]!;
    const p3 = i < controlPoints.length - 2 ? controlPoints[i + 2]! : controlPoints[i + 1]!;

    // Calculate t values for centripetal parameterization
    const getT = (t: number, pa: Point2D, pb: Point2D) => {
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      return t + Math.pow(Math.sqrt(dx * dx + dy * dy), alpha);
    };

    const t0 = 0;
    const t1 = getT(t0, p0, p1);
    const t2 = getT(t1, p1, p2);
    const t3 = getT(t2, p2, p3);

    // Linear interpolation helper
    const lerp = (pa: Point2D, pb: Point2D, t: number): Point2D => {
      const ct = Math.max(0, Math.min(1, t));
      return { x: pa.x + (pb.x - pa.x) * ct, y: pa.y + (pb.y - pa.y) * ct };
    };

    // Generate segment points
    for (let j = 1; j <= subdivisions; j++) {
      const t = t1 + (j / subdivisions) * (t2 - t1);

      const a1 = lerp(p0, p1, (t - t0) / (t1 - t0));
      const a2 = lerp(p1, p2, (t - t1) / (t2 - t1));
      const a3 = lerp(p2, p3, (t - t2) / (t3 - t2));

      const b1 = lerp(a1, a2, (t - t0) / (t2 - t0));
      const b2 = lerp(a2, a3, (t - t1) / (t3 - t1));

      result.push(lerp(b1, b2, (t - t1) / (t2 - t1)));
    }
  }

  return result;
}

// ============================================================================
// PIXI TRAIL RENDERER
// ============================================================================

export class PixiTrailRenderer {
  private trailContainer: Container;
  private blueTrailGraphics: Graphics;
  private redTrailGraphics: Graphics;

  constructor(trailContainer: Container) {
    this.trailContainer = trailContainer;

    // Create trail graphics (persistent, cleared and redrawn each frame)
    this.blueTrailGraphics = new Graphics();
    this.redTrailGraphics = new Graphics();
    this.trailContainer.addChild(this.blueTrailGraphics);
    this.trailContainer.addChild(this.redTrailGraphics);
  }

  renderTrails(
    blueTrailPoints: TrailPoint[],
    redTrailPoints: TrailPoint[],
    trailSettings: TrailSettings,
    currentTime: number,
    hasBlue: boolean,
    hasRed: boolean
  ): void {
    if (!trailSettings.enabled || trailSettings.mode === TrailMode.OFF) {
      this.blueTrailGraphics.clear();
      this.redTrailGraphics.clear();
      return;
    }

    // Debug: log visibility state

    // Clear and render blue trail (always clear to remove stale trails when visibility toggled off)
    this.blueTrailGraphics.clear();
    if (hasBlue && blueTrailPoints.length >= 2) {
      this.renderTrailSegments(
        this.blueTrailGraphics,
        blueTrailPoints,
        trailSettings.blueColor,
        trailSettings,
        currentTime
      );
    }

    // Clear and render red trail (always clear to remove stale trails when visibility toggled off)
    this.redTrailGraphics.clear();
    if (hasRed && redTrailPoints.length >= 2) {
      this.renderTrailSegments(
        this.redTrailGraphics,
        redTrailPoints,
        trailSettings.redColor,
        trailSettings,
        currentTime
      );
    }
  }

  private renderTrailSegments(
    graphics: Graphics,
    points: TrailPoint[],
    colorString: string,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // Separate points by endType if tracking both ends
    const pointSets: TrailPoint[][] =
      settings.trackingMode === TrackingMode.BOTH_ENDS
        ? [
            points.filter((p) => p.endType === 0), // Left end
            points.filter((p) => p.endType === 1), // Right end
          ]
        : [points]; // Single end (left or right)

    // Convert color string to hex number (e.g., "#2E3192" -> 0x2E3192)
    const color = parseInt(colorString.replace("#", ""), 16);

    for (const pointSet of pointSets) {
      if (pointSet.length < 2) continue;

      // Use smooth curves if enabled, otherwise line segments
      if (settings.style === TrailStyle.SMOOTH_LINE) {
        this.renderSmoothTrail(
          graphics,
          pointSet,
          color,
          settings,
          currentTime
        );
      } else {
        this.renderSegmentedTrail(
          graphics,
          pointSet,
          color,
          settings,
          currentTime
        );
      }
    }
  }

  private renderSmoothTrail(
    graphics: Graphics,
    points: TrailPoint[],
    color: number,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // Convert trail points to Point2D for spline interpolation
    const controlPoints: Point2D[] = points.map((p) => ({ x: p.x, y: p.y }));

    // Debug logging disabled - too noisy for every frame
    // console.log(`🎨 SMOOTH TRAIL INPUT (${points.length} points):`);
    // console.log(`   First 3 points:`, points.slice(0, 3).map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);

    // Adaptive subdivision based on point count
    const subdivisionsPerSegment = Math.max(
      2, // Minimum 2 subdivisions
      Math.min(
        10, // Maximum 10 subdivisions
        Math.floor(150 / points.length) // Scale inversely with point count
      )
    );

    const smoothPoints = createSmoothCurve(controlPoints, {
      alpha: 0.5, // Centripetal Catmull-Rom
      subdivisionsPerSegment,
    });

    // Debug logging disabled - too noisy for every frame
    // console.log(`   Smoothed to ${smoothPoints.length} points`);
    // console.log(`   First 3 smoothed:`, smoothPoints.slice(0, 3).map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`);

    if (smoothPoints.length < 2) return;

    // Calculate average opacity for the entire trail
    const avgOpacity = this.calculateOpacity(
      Math.floor(smoothPoints.length / 2),
      smoothPoints.length,
      points,
      settings,
      currentTime
    );

    // Draw as ONE continuous path (no gaps!)
    const firstPoint = smoothPoints[0]!;
    graphics.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < smoothPoints.length; i++) {
      const point = smoothPoints[i]!;

      // Skip invalid points
      if (isNaN(point.x) || isNaN(point.y)) {
        continue;
      }

      graphics.lineTo(point.x, point.y);
    }

    // Stroke the entire path at once (smooth and gap-free!)
    graphics.stroke({
      width: settings.lineWidth,
      color: color,
      alpha: avgOpacity,
      cap: "round",
      join: "round",
    });
  }

  private renderSegmentedTrail(
    graphics: Graphics,
    points: TrailPoint[],
    color: number,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

    // Debug: Log first few input points for segmented trail
    console.log(`📏 SEGMENTED TRAIL INPUT (${points.length} points):`);
    console.log(`   First 3 points:`, points.slice(0, 3).map(p => `(${p.x.toFixed(1)}, ${p.y.toFixed(1)})`));

    // Draw trail segments with varying opacity
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i]!;
      const nextPoint = points[i + 1]!;

      // Skip invalid points
      if (
        isNaN(point.x) ||
        isNaN(point.y) ||
        isNaN(nextPoint.x) ||
        isNaN(nextPoint.y)
      ) {
        continue;
      }

      let opacity: number;

      if (settings.mode === TrailMode.FADE) {
        const age = currentTime - point.timestamp;
        const progress = age / settings.fadeDurationMs;
        opacity =
          settings.maxOpacity -
          progress * (settings.maxOpacity - settings.minOpacity);
        opacity = Math.max(
          settings.minOpacity,
          Math.min(settings.maxOpacity, opacity)
        );
      } else {
        // LOOP_CLEAR and PERSISTENT - gradient from old to new
        const progress = i / (points.length - 1);
        opacity =
          settings.minOpacity +
          progress * (settings.maxOpacity - settings.minOpacity);
      }

      // Draw line segment
      graphics.moveTo(point.x, point.y);
      graphics.lineTo(nextPoint.x, nextPoint.y);
      graphics.stroke({
        width: settings.lineWidth,
        color: color,
        alpha: opacity,
        cap: "round",
        join: "round",
      });
    }
  }

  private calculateOpacity(
    smoothPointIndex: number,
    totalSmoothPoints: number,
    originalPoints: TrailPoint[],
    settings: TrailSettings,
    currentTime: number
  ): number {
    if (settings.mode === TrailMode.FADE) {
      // Map smooth point index back to original trail point for timestamp
      const originalPointIndex = Math.floor(
        (smoothPointIndex / totalSmoothPoints) * originalPoints.length
      );
      const originalPoint = originalPoints[originalPointIndex];

      if (originalPoint) {
        const age = currentTime - originalPoint.timestamp;
        const progress = age / settings.fadeDurationMs;
        const opacity =
          settings.maxOpacity -
          progress * (settings.maxOpacity - settings.minOpacity);
        return Math.max(
          settings.minOpacity,
          Math.min(settings.maxOpacity, opacity)
        );
      } else {
        return settings.maxOpacity;
      }
    } else {
      // LOOP_CLEAR and PERSISTENT - gradient from old to new
      const progress = smoothPointIndex / (totalSmoothPoints - 1);
      return (
        settings.minOpacity +
        progress * (settings.maxOpacity - settings.minOpacity)
      );
    }
  }

  /**
   * Clear all trails (used when trails visibility is toggled off)
   */
  clearTrails(): void {
    this.blueTrailGraphics.clear();
    this.redTrailGraphics.clear();
  }

  destroy(): void {
    try {
      this.blueTrailGraphics.destroy();
      this.redTrailGraphics.destroy();
    } catch (e) {
      // Ignore graphics destroy errors
    }
  }
}
