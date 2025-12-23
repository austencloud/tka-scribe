/**
 * Timeline Types Unit Tests
 *
 * Tests for utility functions in timeline-types.ts:
 * - Time/pixel conversions (including division-by-zero edge case)
 * - Clip overlap detection (boundary conditions)
 * - Project duration calculation
 * - Factory function defaults
 */

import { describe, it, expect } from "vitest";
import {
  timeToPixels,
  pixelsToTime,
  clipsOverlap,
  getClipEndTime,
  calculateProjectDuration,
  createClip,
  createTrack,
  createProject,
  createDefaultSnapSettings,
  createDefaultPlayheadState,
  createDefaultViewportState,
  snapTime,
  type TimelineClip,
  type TimelineProject,
  type SnapSettings,
} from "$lib/features/compose/timeline/domain/timeline-types";

// ============================================================================
// Test Fixtures
// ============================================================================

function createMockClip(overrides: Partial<TimelineClip> = {}): TimelineClip {
  return {
    id: "test-clip",
    sequenceId: "seq-1",
    sequence: {
      id: "seq-1",
      name: "Test Sequence",
      beats: [{ id: "b1" }, { id: "b2" }, { id: "b3" }, { id: "b4" }],
      metadata: {},
    } as any,
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

// ============================================================================
// Time/Pixel Conversion Tests
// ============================================================================

describe("timeline-types - timeToPixels", () => {
  it("should convert time to pixels correctly", () => {
    expect(timeToPixels(5, 100)).toBe(500); // 5 seconds * 100 px/s
    expect(timeToPixels(0, 100)).toBe(0);
    expect(timeToPixels(1.5, 50)).toBe(75);
  });

  it("should handle fractional times", () => {
    expect(timeToPixels(0.333, 100)).toBeCloseTo(33.3, 1);
  });

  it("should handle zero pixelsPerSecond gracefully", () => {
    // This edge case could occur during zoom animation transitions
    expect(timeToPixels(5, 0)).toBe(0);
  });

  it("should handle negative times (for potential reverse playback positioning)", () => {
    expect(timeToPixels(-2, 100)).toBe(-200);
  });
});

describe("timeline-types - pixelsToTime", () => {
  it("should convert pixels to time correctly", () => {
    expect(pixelsToTime(500, 100)).toBe(5); // 500px / 100 px/s
    expect(pixelsToTime(0, 100)).toBe(0);
    expect(pixelsToTime(75, 50)).toBe(1.5);
  });

  it("should handle division by zero (critical edge case)", () => {
    // If pixelsPerSecond is 0, this would normally crash with Infinity
    // The function should either guard against this or we document expected behavior
    const result = pixelsToTime(500, 0);

    // Current behavior: returns Infinity (no guard)
    // This test documents the current behavior - consider adding guard
    expect(result).toBe(Infinity);
  });

  it("should handle very small pixelsPerSecond (extreme zoom out)", () => {
    // 1 pixel per second = very zoomed out
    expect(pixelsToTime(5, 1)).toBe(5);

    // 0.1 pixels per second = extremely zoomed out
    expect(pixelsToTime(1, 0.1)).toBe(10);
  });

  it("should handle very large pixelsPerSecond (extreme zoom in)", () => {
    // 10000 pixels per second = very zoomed in
    expect(pixelsToTime(10000, 10000)).toBe(1);
  });
});

// ============================================================================
// Clip Overlap Detection Tests
// ============================================================================

describe("timeline-types - clipsOverlap", () => {
  it("should detect overlapping clips on same track", () => {
    const clipA = createMockClip({
      id: "a",
      trackId: "t1",
      startTime: 0,
      duration: 5,
    }); // 0-5
    const clipB = createMockClip({
      id: "b",
      trackId: "t1",
      startTime: 3,
      duration: 4,
    }); // 3-7

    expect(clipsOverlap(clipA, clipB)).toBe(true);
    expect(clipsOverlap(clipB, clipA)).toBe(true); // Symmetric
  });

  it("should NOT detect overlap for clips on different tracks", () => {
    const clipA = createMockClip({
      id: "a",
      trackId: "track-1",
      startTime: 0,
      duration: 5,
    });
    const clipB = createMockClip({
      id: "b",
      trackId: "track-2",
      startTime: 0,
      duration: 5,
    }); // Same time, different track

    expect(clipsOverlap(clipA, clipB)).toBe(false);
  });

  it("should NOT detect overlap for adjacent clips (touching but not overlapping)", () => {
    const clipA = createMockClip({
      id: "a",
      trackId: "t1",
      startTime: 0,
      duration: 5,
    }); // 0-5
    const clipB = createMockClip({
      id: "b",
      trackId: "t1",
      startTime: 5,
      duration: 3,
    }); // 5-8

    // Clip B starts exactly where Clip A ends - should NOT overlap
    expect(clipsOverlap(clipA, clipB)).toBe(false);
  });

  it("should NOT detect overlap for separated clips", () => {
    const clipA = createMockClip({
      id: "a",
      trackId: "t1",
      startTime: 0,
      duration: 3,
    }); // 0-3
    const clipB = createMockClip({
      id: "b",
      trackId: "t1",
      startTime: 5,
      duration: 2,
    }); // 5-7

    expect(clipsOverlap(clipA, clipB)).toBe(false);
  });

  it("should detect when one clip is completely inside another", () => {
    const outer = createMockClip({
      id: "outer",
      trackId: "t1",
      startTime: 0,
      duration: 10,
    }); // 0-10
    const inner = createMockClip({
      id: "inner",
      trackId: "t1",
      startTime: 3,
      duration: 2,
    }); // 3-5

    expect(clipsOverlap(outer, inner)).toBe(true);
    expect(clipsOverlap(inner, outer)).toBe(true);
  });

  it("should handle zero-duration clips", () => {
    // A zero-duration clip is a point in time - shouldn't overlap with normal clips
    const normal = createMockClip({
      id: "normal",
      trackId: "t1",
      startTime: 5,
      duration: 3,
    });
    const zero = createMockClip({
      id: "zero",
      trackId: "t1",
      startTime: 6,
      duration: 0,
    });

    // Zero-duration clip at t=6, normal clip from 5-8
    // The overlap check: a.start < b.end && a.end > b.start
    // For zero: 6 < 8 && 6 > 5 = true (it's within the range)
    expect(clipsOverlap(normal, zero)).toBe(true);
  });
});

// ============================================================================
// getClipEndTime Tests
// ============================================================================

describe("timeline-types - getClipEndTime", () => {
  it("should calculate end time correctly", () => {
    const clip = createMockClip({ startTime: 5, duration: 3 });
    expect(getClipEndTime(clip)).toBe(8);
  });

  it("should handle zero duration", () => {
    const clip = createMockClip({ startTime: 5, duration: 0 });
    expect(getClipEndTime(clip)).toBe(5);
  });

  it("should handle fractional values", () => {
    const clip = createMockClip({ startTime: 1.5, duration: 2.3 });
    expect(getClipEndTime(clip)).toBeCloseTo(3.8, 5);
  });
});

// ============================================================================
// calculateProjectDuration Tests
// ============================================================================

describe("timeline-types - calculateProjectDuration", () => {
  it("should return minimum duration (60s) for empty project", () => {
    const project = createProject("Empty");
    project.tracks = [];

    expect(calculateProjectDuration(project)).toBe(60);
  });

  it("should calculate from latest clip end", () => {
    const project = createProject("Test");
    project.tracks = [
      {
        ...createTrack("Track 1", 0),
        clips: [createMockClip({ startTime: 0, duration: 5 })], // ends at 5
      },
      {
        ...createTrack("Track 2", 1),
        clips: [createMockClip({ startTime: 10, duration: 8 })], // ends at 18
      },
    ];

    expect(calculateProjectDuration(project)).toBe(18);
  });

  it("should use audio duration if longer than clips", () => {
    const project = createProject("Test");
    project.audio = {
      hasAudio: true,
      fileName: "track.mp3",
      duration: 120, // 2 minutes
      bpm: 120,
    };
    project.tracks = [
      {
        ...createTrack("Track 1", 0),
        clips: [createMockClip({ startTime: 0, duration: 5 })], // ends at 5
      },
    ];

    expect(calculateProjectDuration(project)).toBe(120);
  });

  it("should use clip end if longer than audio", () => {
    const project = createProject("Test");
    project.audio = {
      hasAudio: true,
      fileName: "track.mp3",
      duration: 30,
      bpm: 120,
    };
    project.tracks = [
      {
        ...createTrack("Track 1", 0),
        clips: [createMockClip({ startTime: 100, duration: 50 })], // ends at 150
      },
    ];

    expect(calculateProjectDuration(project)).toBe(150);
  });
});

// ============================================================================
// Factory Function Tests
// ============================================================================

describe("timeline-types - factory functions", () => {
  describe("createClip", () => {
    it("should create clip with correct defaults", () => {
      const sequence = {
        id: "seq-1",
        name: "Test",
        beats: [{}, {}, {}, {}], // 4 beats
        metadata: {},
      } as any;

      const clip = createClip(sequence, "track-1", 5);

      expect(clip.startTime).toBe(5);
      expect(clip.trackId).toBe("track-1");
      expect(clip.duration).toBe(4); // Derived from beat count
      expect(clip.inPoint).toBe(0);
      expect(clip.outPoint).toBe(1);
      expect(clip.playbackRate).toBe(1);
      expect(clip.opacity).toBe(1);
      expect(clip.locked).toBe(false);
      expect(clip.muted).toBe(false);
    });

    it("should allow overriding defaults", () => {
      const sequence = {
        id: "seq-1",
        name: "Test",
        beats: [],
        metadata: {},
      } as any;

      const clip = createClip(sequence, "track-1", 0, {
        duration: 10,
        playbackRate: 2,
        locked: true,
      });

      expect(clip.duration).toBe(10);
      expect(clip.playbackRate).toBe(2);
      expect(clip.locked).toBe(true);
    });

    it("should generate unique IDs", () => {
      const sequence = {
        id: "seq-1",
        name: "Test",
        beats: [],
        metadata: {},
      } as any;

      const clip1 = createClip(sequence, "track-1", 0);
      const clip2 = createClip(sequence, "track-1", 0);

      expect(clip1.id).not.toBe(clip2.id);
    });
  });

  describe("createDefaultPlayheadState", () => {
    it("should create sensible defaults", () => {
      const state = createDefaultPlayheadState();

      expect(state.position).toBe(0);
      expect(state.isPlaying).toBe(false);
      expect(state.direction).toBe(1);
      expect(state.shuttleSpeed).toBe(1);
      expect(state.loopStart).toBeNull();
      expect(state.loopEnd).toBeNull();
    });
  });

  describe("createDefaultViewportState", () => {
    it("should create sensible defaults", () => {
      const state = createDefaultViewportState();

      expect(state.pixelsPerSecond).toBe(50);
      expect(state.scrollX).toBe(0);
      expect(state.scrollY).toBe(0);
      expect(state.visibleStart).toBe(0);
      expect(state.visibleEnd).toBe(20);
    });
  });
});

// ============================================================================
// snapTime Tests (simpler snap function)
// ============================================================================

describe("timeline-types - snapTime", () => {
  const defaultSettings: SnapSettings = {
    enabled: true,
    snapToBeats: true,
    snapToClips: true,
    snapToPlayhead: true,
    snapToGrid: true,
    gridInterval: 1,
  };

  it("should return original time when snapping disabled", () => {
    const settings = { ...defaultSettings, enabled: false };
    const result = snapTime(2.3, settings, [], [], 0);

    expect(result).toBe(2.3);
  });

  it("should snap to beat markers", () => {
    const beatMarkers = [0, 1, 2, 3, 4];
    const result = snapTime(2.05, defaultSettings, beatMarkers, [], 0);

    expect(result).toBe(2);
  });

  it("should snap to clip edges", () => {
    const clipEdges = [5, 8]; // Clip from 5-8
    const result = snapTime(7.95, defaultSettings, [], clipEdges, 0);

    expect(result).toBe(8);
  });

  it("should snap to playhead", () => {
    const result = snapTime(10.05, defaultSettings, [], [], 10);

    expect(result).toBe(10);
  });

  it("should snap to grid when within threshold", () => {
    const settings = { ...defaultSettings, gridInterval: 0.5 };
    // No beat markers, no clip edges, playhead at 100 (far away)
    // Time 2.45 -> gridSnap = round(2.45/0.5)*0.5 = round(4.9)*0.5 = 5*0.5 = 2.5
    // Distance = 0.05, which is < 0.1 threshold
    const result = snapTime(2.45, settings, [], [], 100);

    expect(result).toBe(2.5);
  });

  it("should NOT snap to grid when outside 0.1s threshold", () => {
    const settings = { ...defaultSettings, gridInterval: 0.5 };
    // Time 2.3 -> gridSnap = round(2.3/0.5)*0.5 = round(4.6)*0.5 = 5*0.5 = 2.5
    // Distance = 0.2, which is > 0.1 threshold
    const result = snapTime(2.3, settings, [], [], 100);

    // No snap occurs - returns original time
    expect(result).toBe(2.3);
  });

  it("should prefer nearest snap point when multiple options", () => {
    const beatMarkers = [2];
    const clipEdges = [2.08];
    // Time 2.05: beat at 2 is 0.05 away, clip edge at 2.08 is 0.03 away
    const result = snapTime(2.05, defaultSettings, beatMarkers, clipEdges, 100);

    expect(result).toBe(2.08); // Nearer
  });

  it("should not snap when all points are outside threshold", () => {
    const beatMarkers = [0];
    // Time 5.0 is 5 seconds from nearest beat - well outside 0.1s threshold
    const result = snapTime(5.0, defaultSettings, beatMarkers, [], 100);

    expect(result).toBe(5.0); // Original time
  });
});
