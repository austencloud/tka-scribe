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

import { Graphics, Container } from "pixi.js";
import type { TrailPoint, TrailSettings } from "../../../domain/types/TrailTypes";
import { TrailMode, TrailStyle, TrackingMode } from "../../../domain/types/TrailTypes";
import { createSmoothCurve, type Point2D } from "../../../utils/CatmullRomSpline";

export class PixiTrailRenderer {
  private trailContainer: Container;
  private blueTrailGraphics: Graphics;
  private redTrailGraphics: Graphics;
  private hasLoggedTrailStatus = false;

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
    // Debug log once
    if (!this.hasLoggedTrailStatus) {
      console.log(
        `🔍 Trail Status: enabled=${trailSettings.enabled}, mode=${trailSettings.mode}`
      );
      console.log(
        `   Blue points: ${blueTrailPoints.length}, Red points: ${redTrailPoints.length}`
      );
      this.hasLoggedTrailStatus = true;
    }

    if (!trailSettings.enabled || trailSettings.mode === TrailMode.OFF) {
      this.blueTrailGraphics.clear();
      this.redTrailGraphics.clear();
      return;
    }

    // Render blue trail
    if (hasBlue) {
      this.blueTrailGraphics.clear();
      this.renderTrailSegments(
        this.blueTrailGraphics,
        blueTrailPoints,
        trailSettings.blueColor,
        trailSettings,
        currentTime
      );
    }

    // Render red trail
    if (hasRed) {
      this.redTrailGraphics.clear();
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
        this.renderSmoothTrail(graphics, pointSet, color, settings, currentTime);
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

    if (smoothPoints.length < 2) return;

    // Draw smooth curve with gradient opacity
    for (let i = 0; i < smoothPoints.length - 1; i++) {
      const currentPoint = smoothPoints[i]!;
      const nextPoint = smoothPoints[i + 1]!;

      // Skip invalid points
      if (
        isNaN(currentPoint.x) ||
        isNaN(currentPoint.y) ||
        isNaN(nextPoint.x) ||
        isNaN(nextPoint.y)
      ) {
        continue;
      }

      const opacity = this.calculateOpacity(
        i,
        smoothPoints.length,
        points,
        settings,
        currentTime
      );

      // Draw smooth line segment
      graphics.moveTo(currentPoint.x, currentPoint.y);
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

  private renderSegmentedTrail(
    graphics: Graphics,
    points: TrailPoint[],
    color: number,
    settings: TrailSettings,
    currentTime: number
  ): void {
    if (points.length < 2) return;

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
        let opacity =
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

  destroy(): void {
    try {
      this.blueTrailGraphics?.destroy();
      this.redTrailGraphics?.destroy();
    } catch (e) {
      // Ignore graphics destroy errors
    }
  }
}
