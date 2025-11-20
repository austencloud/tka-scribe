/**
 * Motion Primitive Service
 *
 * Loads and provides access to pre-computed motion paths.
 * Enables perfect, gap-free trail rendering regardless of device performance.
 *
 * Your genius idea brought to life! 🔥
 */

import type { BeatData, MotionData } from "$shared";
import { MotionType } from "$shared";
import type { TrailPoint } from "../../domain/types/TrailTypes";

// Type matching the generated primitives
interface MotionPrimitive {
  key: string;
  motionType: string;
  turns: number;
  rotationDirection: string;
  startLocation: string;
  endLocation: string;
  points: Array<{ x: number; y: number }>;
  metadata: {
    pointCount: number;
    samplingRate: number;
  };
}

interface MotionPrimitivesData {
  version: string;
  generated: string;
  config: {
    pointsPerBeat: number;
    viewboxSize: number;
    propWidth: number;
  };
  primitives: MotionPrimitive[];
}

/**
 * Motion Primitive Service
 *
 * Provides O(1) lookup of pre-computed motion paths.
 */
export class MotionPrimitiveService {
  private primitiveMap = new Map<string, MotionPrimitive>();
  private isInitialized = false;
  private config: MotionPrimitivesData["config"] | null = null;

  /**
   * Initialize service by loading motion primitives
   * Call this once at app startup or when animation module loads
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      console.log("✅ Motion primitives already loaded");
      return true;
    }

    try {
      console.log("🚀 Loading motion primitives...");
      const startTime = performance.now();

      // Dynamically import the JSON (tree-shakeable, code-split)
      const data: MotionPrimitivesData = await import(
        "$lib/data/motion-primitives.json"
      );

      // Build fast lookup map
      for (const primitive of data.primitives) {
        this.primitiveMap.set(primitive.key, primitive);
      }

      this.config = data.config;
      this.isInitialized = true;

      const loadTime = performance.now() - startTime;

      console.log(
        `✨ Motion primitives loaded! ${this.primitiveMap.size} primitives in ${loadTime.toFixed(1)}ms`
      );
      console.log(`   Points per beat: ${data.config.pointsPerBeat}`);
      console.log(`   Generated: ${data.generated}`);

      return true;
    } catch (error) {
      console.error("❌ Failed to load motion primitives:", error);
      return false;
    }
  }

  /**
   * Get trail points for a specific motion with progressive revelation
   *
   * @param motionData - Motion configuration
   * @param beatProgress - Progress through beat (0.0 to 1.0)
   * @param canvasSize - Current canvas size for scaling
   * @param propIndex - 0 for blue, 1 for red
   * @param endType - 0 for left, 1 for right
   * @returns Array of trail points scaled to canvas
   */
  getTrailPointsForMotion(
    motionData: MotionData,
    beatProgress: number,
    canvasSize: number,
    propIndex: 0 | 1,
    endType: 0 | 1
  ): TrailPoint[] {
    if (!this.isInitialized || !this.config) {
      console.warn("Motion primitives not initialized!");
      return [];
    }

    // Generate lookup key
    const key = this.generateKey(motionData);
    const primitive = this.primitiveMap.get(key);

    // DEBUG: Log primitive lookup
    console.log(`🔍 Primitive lookup:`, {
      key,
      found: !!primitive,
      motion: `${motionData.motionType} ${motionData.startLocation}→${motionData.endLocation}`,
      turns: motionData.turns,
      rotation: motionData.rotationDirection,
      beatProgress: beatProgress.toFixed(3),
      canvasSize,
      propIndex,
      endType: endType === 0 ? 'left' : 'right'
    });

    if (!primitive) {
      console.warn(`❌ Motion primitive NOT FOUND: ${key}`);
      console.warn(`   Available keys sample:`, Array.from(this.primitiveMap.keys()).slice(0, 5));
      return [];
    }

    console.log(`✅ Found primitive with ${primitive.points.length} points`);

    // Calculate how many points to reveal based on beat progress
    const totalPoints = primitive.points.length;

    // Always reveal at least 5% of points (ensures visibility even at beat start)
    const minPoints = Math.max(10, Math.floor(totalPoints * 0.05));
    const revealCount = Math.floor(beatProgress * totalPoints);
    const finalRevealCount = Math.max(minPoints, revealCount);

    // Get points to reveal (progressive building of trail!)
    const pointsToReveal = primitive.points.slice(0, finalRevealCount);

    // Scale from 950x950 standard space to current canvas size
    const scaleFactor = canvasSize / this.config.viewboxSize;

    // Convert to TrailPoint format with proper timestamps
    const trailPoints: TrailPoint[] = pointsToReveal.map((p, index) => ({
      x: p.x * scaleFactor,
      y: p.y * scaleFactor,
      timestamp: (index / totalPoints) * 1000, // Normalized timestamp (0-1000ms per beat)
      propIndex,
      endType,
    }));

    // DEBUG: Log first and last points
    if (trailPoints.length > 0) {
      console.log(`📍 First point:`, {
        raw: pointsToReveal[0],
        scaled: trailPoints[0],
        scaleFactor
      });
      console.log(`📍 Last point:`, {
        raw: pointsToReveal[pointsToReveal.length - 1],
        scaled: trailPoints[trailPoints.length - 1]
      });
    }

    return trailPoints;
  }

  /**
   * Get complete trail points for an entire beat (for final state)
   *
   * @param motionData - Motion configuration
   * @param canvasSize - Current canvas size for scaling
   * @param propIndex - 0 for blue, 1 for red
   * @param endType - 0 for left, 1 for right
   * @returns Complete trail for the motion
   */
  getCompleteTrailForMotion(
    motionData: MotionData,
    canvasSize: number,
    propIndex: 0 | 1,
    endType: 0 | 1
  ): TrailPoint[] {
    return this.getTrailPointsForMotion(
      motionData,
      1.0, // Full beat progress
      canvasSize,
      propIndex,
      endType
    );
  }

  /**
   * Get trail points for beat data (convenience method)
   *
   * @param beatData - Complete beat data
   * @param beatProgress - Progress through beat (0.0 to 1.0)
   * @param canvasSize - Current canvas size
   * @param trackingEnd - Which end to track (0 = left, 1 = right)
   * @returns Trail points for both blue and red props
   */
  getTrailPointsForBeat(
    beatData: BeatData,
    beatProgress: number,
    canvasSize: number,
    trackingEnd: 0 | 1
  ): {
    blue: TrailPoint[];
    red: TrailPoint[];
  } {
    const blueMotion = beatData.motions.blue;
    const redMotion = beatData.motions.red;

    return {
      blue: blueMotion
        ? this.getTrailPointsForMotion(
            blueMotion,
            beatProgress,
            canvasSize,
            0,
            trackingEnd
          )
        : [],
      red: redMotion
        ? this.getTrailPointsForMotion(
            redMotion,
            beatProgress,
            canvasSize,
            1,
            trackingEnd
          )
        : [],
    };
  }

  /**
   * Generate lookup key for motion data
   * Format: "{motionType}-{startLocation}-{endLocation}-{turns}-{rotationDirection}"
   */
  private generateKey(motionData: MotionData): string {
    const {
      motionType,
      startLocation,
      endLocation,
      turns,
      rotationDirection,
    } = motionData;

    // Handle FLOAT motions which might use 'fl' for turns
    const normalizedTurns = turns === "fl" ? 0 : turns;

    return `${motionType}-${startLocation}-${endLocation}-${normalizedTurns}-${rotationDirection}`;
  }

  /**
   * Check if primitives are loaded
   */
  isLoaded(): boolean {
    return this.isInitialized;
  }

  /**
   * Get configuration info
   */
  getConfig() {
    return this.config;
  }

  /**
   * Get total number of loaded primitives
   */
  getPrimitiveCount(): number {
    return this.primitiveMap.size;
  }

  /**
   * Check if a specific motion has a primitive
   */
  hasPrimitive(motionData: MotionData): boolean {
    const key = this.generateKey(motionData);
    return this.primitiveMap.has(key);
  }
}

/**
 * Global singleton instance
 * Import this directly for convenience
 */
export const motionPrimitiveService = new MotionPrimitiveService();
