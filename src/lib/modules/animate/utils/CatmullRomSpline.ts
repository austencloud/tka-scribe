/**
 * Catmull-Rom Spline Interpolation Utility
 *
 * Implements centripetal Catmull-Rom splines for smooth curve generation.
 * Alpha = 0.5 provides optimal smoothness without loops or cusps.
 *
 * References:
 * - https://en.wikipedia.org/wiki/Centripetal_Catmull%E2%80%93Rom_spline
 * - https://qroph.github.io/2018/07/30/smooth-paths-using-catmull-rom-splines.html
 */

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Configuration for Catmull-Rom spline interpolation
 */
export interface SplineConfig {
  /**
   * Alpha parameter controls spline variant:
   * - 0.0 = uniform (can create loops)
   * - 0.5 = centripetal (recommended, no loops/cusps)
   * - 1.0 = chordal (tighter curves)
   */
  alpha: number;

  /**
   * Number of interpolated points between each pair of control points
   * Higher = smoother but more points (default: 10)
   */
  subdivisionsPerSegment: number;
}

export const DEFAULT_SPLINE_CONFIG: SplineConfig = {
  alpha: 0.5, // Centripetal variant
  subdivisionsPerSegment: 10,
};

/**
 * Catmull-Rom Spline Generator
 *
 * Generates smooth curves through a set of control points.
 * The curve passes through all interior control points.
 */
export class CatmullRomSpline {
  private config: SplineConfig;

  constructor(config: Partial<SplineConfig> = {}) {
    this.config = { ...DEFAULT_SPLINE_CONFIG, ...config };
  }

  /**
   * Generate smooth curve through control points
   *
   * @param controlPoints - Array of points the curve should pass through
   * @returns Array of interpolated points forming a smooth curve
   *
   * Note: The curve passes through all interior points (not the first/last endpoints)
   * For a closed loop, duplicate the first point at the end.
   */
  generateCurve(controlPoints: readonly Point2D[]): Point2D[] {
    if (controlPoints.length < 2) {
      return [...controlPoints];
    }

    if (controlPoints.length === 2) {
      // For 2 points, just return a simple linear interpolation
      return this.linearInterpolate(controlPoints[0]!, controlPoints[1]!);
    }

    const result: Point2D[] = [];

    // Add first control point
    result.push({ ...controlPoints[0]! });

    // Generate curve segments between each pair of interior points
    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p0 = i > 0 ? controlPoints[i - 1]! : controlPoints[i]!; // Use first point as phantom for start
      const p1 = controlPoints[i]!;
      const p2 = controlPoints[i + 1]!;
      const p3 =
        i < controlPoints.length - 2 ? controlPoints[i + 2]! : controlPoints[i + 1]!; // Use last point as phantom for end

      const segmentPoints = this.generateSegment(p0, p1, p2, p3);

      // Skip first point to avoid duplicates (already added from previous segment)
      for (let j = 1; j < segmentPoints.length; j++) {
        result.push(segmentPoints[j]!);
      }
    }

    return result;
  }

  /**
   * Generate a single curve segment between p1 and p2
   * Uses p0 and p3 as neighboring points for curvature calculation
   */
  private generateSegment(
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    p3: Point2D
  ): Point2D[] {
    const points: Point2D[] = [];

    // Calculate t values for centripetal parameterization
    const t0 = 0;
    const t1 = this.getT(t0, p0, p1);
    const t2 = this.getT(t1, p1, p2);
    const t3 = this.getT(t2, p2, p3);

    // Generate interpolated points
    for (let i = 0; i <= this.config.subdivisionsPerSegment; i++) {
      const t =
        t1 + (i / this.config.subdivisionsPerSegment) * (t2 - t1);

      const point = this.interpolate(t, t0, t1, t2, t3, p0, p1, p2, p3);
      points.push(point);
    }

    return points;
  }

  /**
   * Calculate parameterized t value based on distance
   * Uses alpha to control spline variant (centripetal, uniform, chordal)
   */
  private getT(t: number, p0: Point2D, p1: Point2D): number {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return t + Math.pow(distance, this.config.alpha);
  }

  /**
   * Catmull-Rom interpolation formula
   * Calculates point on curve at parameter t
   */
  private interpolate(
    t: number,
    t0: number,
    t1: number,
    t2: number,
    t3: number,
    p0: Point2D,
    p1: Point2D,
    p2: Point2D,
    p3: Point2D
  ): Point2D {
    // Calculate intermediate points using Barry and Goldman's pyramidal formulation
    const a1 = this.lerpPoint(p0, p1, (t - t0) / (t1 - t0));
    const a2 = this.lerpPoint(p1, p2, (t - t1) / (t2 - t1));
    const a3 = this.lerpPoint(p2, p3, (t - t2) / (t3 - t2));

    const b1 = this.lerpPoint(a1, a2, (t - t0) / (t2 - t0));
    const b2 = this.lerpPoint(a2, a3, (t - t1) / (t3 - t1));

    const c = this.lerpPoint(b1, b2, (t - t1) / (t2 - t1));

    return c;
  }

  /**
   * Linear interpolation between two points
   */
  private lerpPoint(p0: Point2D, p1: Point2D, t: number): Point2D {
    // Clamp t to [0, 1] to avoid extrapolation
    const clampedT = Math.max(0, Math.min(1, t));

    return {
      x: p0.x + (p1.x - p0.x) * clampedT,
      y: p0.y + (p1.y - p0.y) * clampedT,
    };
  }

  /**
   * Simple linear interpolation for 2-point case
   */
  private linearInterpolate(p0: Point2D, p1: Point2D): Point2D[] {
    const points: Point2D[] = [];

    for (let i = 0; i <= this.config.subdivisionsPerSegment; i++) {
      const t = i / this.config.subdivisionsPerSegment;
      points.push(this.lerpPoint(p0, p1, t));
    }

    return points;
  }

  /**
   * Update spline configuration
   */
  setConfig(config: Partial<SplineConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SplineConfig {
    return { ...this.config };
  }
}

/**
 * Utility function to create a smooth curve through points
 * Convenience wrapper around CatmullRomSpline class
 *
 * @param points - Control points for the curve
 * @param config - Optional spline configuration
 * @returns Array of interpolated points forming a smooth curve
 */
export function createSmoothCurve(
  points: readonly Point2D[],
  config?: Partial<SplineConfig>
): Point2D[] {
  const spline = new CatmullRomSpline(config);
  return spline.generateCurve(points);
}
