/**
 * SnapService Unit Tests
 *
 * Tests for real failure modes in the snapping logic:
 * - Priority resolution when multiple snap points are equidistant
 * - Clip exclusion during drag operations
 * - Edge cases with empty or invalid inputs
 * - Threshold behavior at boundaries
 */

import { describe, it, expect } from "vitest";
import {
  calculateSnapPoints,
  findNearestSnapPoint,
  snapTimeValue,
  getSnapPointsInRange,
  DEFAULT_SNAP_THRESHOLD,
  type SnapContext,
  type SnapPoint,
} from "$lib/features/compose/timeline/services/SnapService";
import type {
  TimelineClip,
  SnapSettings,
} from "$lib/features/compose/timeline/domain/timeline-types";

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockClip(overrides: Partial<TimelineClip> = {}): TimelineClip {
  return {
    id: "clip-1",
    sequenceId: "seq-1",
    sequence: { id: "seq-1", name: "Test", beats: [], metadata: {} } as any,
    trackId: "track-1",
    startTime: 0,
    duration: 4,
    inPoint: 0,
    outPoint: 1,
    playbackRate: 1,
    loop: false,
    loopCount: 0,
    trailSettings: {} as any,
    rotation: 0,
    opacity: 1,
    color: "#4a9eff",
    locked: false,
    muted: false,
    ...overrides,
  };
}

function createDefaultSettings(
  overrides: Partial<SnapSettings> = {}
): SnapSettings {
  return {
    enabled: true,
    snapToBeats: true,
    snapToClips: true,
    snapToPlayhead: true,
    snapToGrid: false,
    gridInterval: 1,
    ...overrides,
  };
}

function createContext(overrides: Partial<SnapContext> = {}): SnapContext {
  return {
    clips: [],
    excludeClipIds: [],
    audioBpm: 120, // 0.5s per beat
    audioDuration: 10,
    playheadPosition: 5,
    settings: createDefaultSettings(),
    ...overrides,
  };
}

// ============================================================================
// findNearestSnapPoint Tests
// ============================================================================

describe("SnapService - findNearestSnapPoint", () => {
  it("should return the nearest snap point within threshold", () => {
    const points: SnapPoint[] = [
      { time: 1, type: "beat" },
      { time: 2, type: "beat" },
      { time: 3, type: "beat" },
    ];

    const result = findNearestSnapPoint(2.05, points, 0.1);

    expect(result.didSnap).toBe(true);
    expect(result.time).toBe(2);
    expect(result.snapType).toBe("beat");
  });

  it("should NOT snap when no points are within threshold", () => {
    const points: SnapPoint[] = [
      { time: 1, type: "beat" },
      { time: 3, type: "beat" },
    ];

    // 2.0 is 1 second away from nearest points - well outside threshold
    const result = findNearestSnapPoint(2.0, points, 0.1);

    expect(result.didSnap).toBe(false);
    expect(result.time).toBe(2.0); // Returns original time
    expect(result.snapType).toBeNull();
  });

  it("should return original time with empty snap points array", () => {
    const result = findNearestSnapPoint(5.0, [], 0.1);

    expect(result.didSnap).toBe(false);
    expect(result.time).toBe(5.0);
  });

  /**
   * BUG DOCUMENTATION: Priority does not work for equidistant points.
   *
   * The current implementation has condition `distance < nearestDistance` which
   * prevents equidistant points from being evaluated. The priority check inside
   * the block is unreachable for equal distances.
   *
   * Expected: Playhead (priority 0) should be preferred over beat (priority 2)
   * Actual: First point encountered wins (array order dependent)
   */
  it("documents current behavior: first point wins when equidistant (priority bug)", () => {
    // Playhead and beat are at exactly the same time
    const points: SnapPoint[] = [
      { time: 5, type: "beat" },
      { time: 5, type: "playhead" },
    ];

    const result = findNearestSnapPoint(5.05, points, 0.1);

    expect(result.didSnap).toBe(true);
    // BUG: Returns "beat" because it comes first in array, not "playhead" (higher priority)
    expect(result.snapType).toBe("beat"); // Should be "playhead" if priority worked
  });

  /**
   * Same priority bug as above - array order determines winner, not priority
   */
  it("documents current behavior: first point wins regardless of priority", () => {
    const points: SnapPoint[] = [
      { time: 3, type: "beat" },
      { time: 3, type: "clip-start" },
    ];

    const result = findNearestSnapPoint(3.01, points, 0.1);

    // BUG: Returns "beat" because it comes first, not "clip-start" (higher priority)
    expect(result.snapType).toBe("beat"); // Should be "clip-start" if priority worked
  });

  it("should handle very small threshold correctly", () => {
    const points: SnapPoint[] = [{ time: 1.001, type: "beat" }];

    // Time is 0.002s away - outside 0.001s threshold
    const result = findNearestSnapPoint(1.003, points, 0.001);
    expect(result.didSnap).toBe(false);

    // Time is 0.0005s away - inside 0.001s threshold
    const resultSnapped = findNearestSnapPoint(1.0015, points, 0.001);
    expect(resultSnapped.didSnap).toBe(true);
  });

  it("should calculate correct distance in result", () => {
    const points: SnapPoint[] = [{ time: 5, type: "beat" }];

    const result = findNearestSnapPoint(5.08, points, 0.1);

    expect(result.distance).toBeCloseTo(0.08, 5);
  });
});

// ============================================================================
// calculateSnapPoints Tests
// ============================================================================

describe("SnapService - calculateSnapPoints", () => {
  it("should generate beat markers from BPM", () => {
    const context = createContext({
      audioBpm: 60, // 1 beat per second
      audioDuration: 5,
      settings: createDefaultSettings({
        snapToBeats: true,
        snapToClips: false,
        snapToPlayhead: false,
      }),
    });

    const points = calculateSnapPoints(context);
    const beatPoints = points.filter((p) => p.type === "beat");

    // 60 BPM over 5 seconds = beats at 0, 1, 2, 3, 4, 5
    expect(beatPoints.length).toBe(6);
    expect(beatPoints.map((p) => p.time)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("should NOT generate beat markers when audio BPM is null", () => {
    const context = createContext({
      audioBpm: null,
      audioDuration: 10,
      settings: createDefaultSettings({ snapToBeats: true }),
    });

    const points = calculateSnapPoints(context);
    const beatPoints = points.filter((p) => p.type === "beat");

    expect(beatPoints.length).toBe(0);
  });

  it("should generate clip-start and clip-end points", () => {
    const clip1 = createMockClip({ id: "c1", startTime: 2, duration: 3 }); // 2-5
    const clip2 = createMockClip({ id: "c2", startTime: 7, duration: 2 }); // 7-9

    const context = createContext({
      clips: [clip1, clip2],
      audioBpm: null,
      settings: createDefaultSettings({
        snapToClips: true,
        snapToBeats: false,
        snapToPlayhead: false,
      }),
    });

    const points = calculateSnapPoints(context);

    // Should have start and end for each clip
    expect(points).toContainEqual({
      time: 2,
      type: "clip-start",
      label: "Test",
    });
    expect(points).toContainEqual({ time: 5, type: "clip-end", label: "Test" });
    expect(points).toContainEqual({
      time: 7,
      type: "clip-start",
      label: "Test",
    });
    expect(points).toContainEqual({ time: 9, type: "clip-end", label: "Test" });
  });

  it("should EXCLUDE clips in excludeClipIds (critical for dragging)", () => {
    const draggedClip = createMockClip({
      id: "dragged",
      startTime: 0,
      duration: 2,
    });
    const otherClip = createMockClip({
      id: "other",
      startTime: 5,
      duration: 2,
    });

    const context = createContext({
      clips: [draggedClip, otherClip],
      excludeClipIds: ["dragged"], // The clip being dragged should not be a snap target
      audioBpm: null,
      settings: createDefaultSettings({
        snapToClips: true,
        snapToBeats: false,
        snapToPlayhead: false,
      }),
    });

    const points = calculateSnapPoints(context);

    // Should NOT include the dragged clip's edges
    expect(points.find((p) => p.time === 0)).toBeUndefined();
    expect(points.find((p) => p.time === 2)).toBeUndefined();

    // Should include the other clip's edges
    expect(points).toContainEqual({
      time: 5,
      type: "clip-start",
      label: "Test",
    });
    expect(points).toContainEqual({ time: 7, type: "clip-end", label: "Test" });
  });

  it("should include playhead position when enabled", () => {
    const context = createContext({
      playheadPosition: 3.5,
      audioBpm: null,
      clips: [],
      settings: createDefaultSettings({
        snapToPlayhead: true,
        snapToBeats: false,
        snapToClips: false,
      }),
    });

    const points = calculateSnapPoints(context);

    expect(points).toContainEqual({
      time: 3.5,
      type: "playhead",
      label: "Playhead",
    });
  });

  it("should generate grid intervals when enabled", () => {
    const context = createContext({
      audioBpm: null,
      audioDuration: 5,
      clips: [],
      settings: createDefaultSettings({
        snapToGrid: true,
        gridInterval: 0.5,
        snapToBeats: false,
        snapToClips: false,
        snapToPlayhead: false,
      }),
    });

    const points = calculateSnapPoints(context);
    const gridPoints = points.filter((p) => p.type === "grid");

    // Grid at 0, 0.5, 1, 1.5, ... up to duration + some buffer
    expect(gridPoints.length).toBeGreaterThan(10);
    expect(gridPoints.some((p) => p.time === 0)).toBe(true);
    expect(gridPoints.some((p) => p.time === 0.5)).toBe(true);
    expect(gridPoints.some((p) => p.time === 1)).toBe(true);
  });

  it("should NOT generate grid points when gridInterval is 0 (prevents infinite loop)", () => {
    const context = createContext({
      settings: createDefaultSettings({
        snapToGrid: true,
        gridInterval: 0, // Invalid - would cause infinite loop without guard
        snapToBeats: false,
        snapToClips: false,
        snapToPlayhead: false,
      }),
    });

    // This should NOT hang or throw
    const points = calculateSnapPoints(context);
    const gridPoints = points.filter((p) => p.type === "grid");

    expect(gridPoints.length).toBe(0); // No grid points generated
  });
});

// ============================================================================
// snapTimeValue Integration Tests
// ============================================================================

describe("SnapService - snapTimeValue", () => {
  it("should bypass all snapping when settings.enabled is false", () => {
    const context = createContext({
      audioBpm: 60,
      audioDuration: 10,
      playheadPosition: 5,
      settings: createDefaultSettings({ enabled: false }), // Master toggle off
    });

    // 4.9 would normally snap to 5 (beat or playhead)
    const result = snapTimeValue(4.9, context, 0.2);

    expect(result.didSnap).toBe(false);
    expect(result.time).toBe(4.9); // Original time preserved
  });

  it("should snap to nearest beat when dragging clip near beat marker", () => {
    const context = createContext({
      audioBpm: 60, // Beats at 0, 1, 2, 3...
      audioDuration: 10,
      settings: createDefaultSettings({ snapToBeats: true }),
    });

    const result = snapTimeValue(2.08, context, DEFAULT_SNAP_THRESHOLD);

    expect(result.didSnap).toBe(true);
    expect(result.time).toBe(2);
    expect(result.snapType).toBe("beat");
  });

  it("should handle complex scenario with multiple snap types", () => {
    const clip = createMockClip({ id: "c1", startTime: 5, duration: 2 }); // ends at 7

    const context = createContext({
      clips: [clip],
      audioBpm: 60, // Beats at 0, 1, 2... 7 is a beat
      audioDuration: 10,
      playheadPosition: 7.05, // Near clip end and beat
      settings: createDefaultSettings(),
    });

    // Position 7.02 is:
    // - 0.02s from beat at 7
    // - 0.02s from clip-end at 7
    // - 0.03s from playhead at 7.05
    // So it should snap to 7 (closer than 7.05)
    // Among beat and clip-end at 7, first in array wins (beat) due to priority bug
    const result = snapTimeValue(7.02, context, 0.1);

    expect(result.didSnap).toBe(true);
    expect(result.time).toBe(7);
    // BUG: Returns "beat" because beats are added first in calculateSnapPoints,
    // even though clip-end should have higher priority (1 vs 2)
    expect(result.snapType).toBe("beat");
  });
});

// ============================================================================
// getSnapPointsInRange Tests
// ============================================================================

describe("SnapService - getSnapPointsInRange", () => {
  it("should filter snap points to visible range", () => {
    const context = createContext({
      audioBpm: 60, // Beats at 0, 1, 2, 3...
      audioDuration: 100,
      clips: [],
      settings: createDefaultSettings({
        snapToBeats: true,
        snapToClips: false,
        snapToPlayhead: false,
      }),
    });

    const visiblePoints = getSnapPointsInRange(context, 5, 8);

    // Should only include beats in range [5, 8]
    expect(visiblePoints.every((p) => p.time >= 5 && p.time <= 8)).toBe(true);
    expect(visiblePoints.map((p) => p.time)).toEqual([5, 6, 7, 8]);
  });

  it("should return empty array when no points in range", () => {
    const context = createContext({
      audioBpm: 60,
      audioDuration: 10, // Beats only go up to 10
      clips: [],
      settings: createDefaultSettings({
        snapToBeats: true,
        snapToClips: false,
        snapToPlayhead: false,
      }),
    });

    const visiblePoints = getSnapPointsInRange(context, 100, 200);

    expect(visiblePoints.length).toBe(0);
  });
});
