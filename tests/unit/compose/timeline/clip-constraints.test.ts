/**
 * Clip Constraint Validation Tests
 *
 * Tests for clip invariants and constraints:
 * - Trim point validity (inPoint must be < outPoint)
 * - Duration and playback rate relationships
 * - Clip positioning constraints
 * - Multi-clip operations
 */

import { describe, it, expect } from "vitest";
import {
  createClip,
  createTrack,
  getClipEndTime,
  clipsOverlap,
  type TimelineClip,
} from "$lib/features/compose/timeline/domain/timeline-types";

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestSequence(beatCount: number = 4) {
  return {
    id: `seq-${Date.now()}`,
    name: "Test Sequence",
    beats: Array(beatCount)
      .fill(null)
      .map((_, i) => ({ id: `beat-${i}` })),
    metadata: {},
  } as any;
}

// ============================================================================
// Trim Point Constraint Tests
// ============================================================================

describe("clip constraints - trim points", () => {
  it("should create clip with valid default trim points (0 to 1)", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0);

    expect(clip.inPoint).toBe(0);
    expect(clip.outPoint).toBe(1);
    expect(clip.inPoint).toBeLessThan(clip.outPoint);
  });

  it("should allow custom trim points within valid range", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      inPoint: 0.25,
      outPoint: 0.75,
    });

    expect(clip.inPoint).toBe(0.25);
    expect(clip.outPoint).toBe(0.75);
  });

  /**
   * DOCUMENTATION TEST: Current behavior allows invalid trim points.
   * This test documents what SHOULD happen vs what DOES happen.
   * Consider adding validation in createClip or a separate validate function.
   */
  it("should document behavior with invalid trim points (in > out)", () => {
    const sequence = createTestSequence(4);

    // Currently, createClip doesn't validate trim points
    const clip = createClip(sequence, "track-1", 0, {
      inPoint: 0.8,
      outPoint: 0.2, // Invalid: in > out
    });

    // CURRENT BEHAVIOR: Invalid state is allowed
    expect(clip.inPoint).toBe(0.8);
    expect(clip.outPoint).toBe(0.2);

    // TODO: Consider adding validation that:
    // - Throws error, OR
    // - Clamps to valid range, OR
    // - Swaps the values
  });

  it("should handle edge case where inPoint equals outPoint", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      inPoint: 0.5,
      outPoint: 0.5, // Zero duration trim
    });

    // CURRENT BEHAVIOR: Allowed (results in zero-length playback region)
    expect(clip.inPoint).toBe(0.5);
    expect(clip.outPoint).toBe(0.5);

    // The effective trimmed duration would be 0
    const trimmedDuration = clip.duration * (clip.outPoint - clip.inPoint);
    expect(trimmedDuration).toBe(0);
  });

  it("should calculate correct effective duration with trim", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      duration: 8, // 8 seconds
      inPoint: 0.25, // Start at 25%
      outPoint: 0.75, // End at 75%
    });

    // Trimmed region is 50% of original
    const trimFactor = clip.outPoint - clip.inPoint;
    expect(trimFactor).toBe(0.5);

    // Effective content duration (what plays)
    const effectiveContentDuration = clip.duration * trimFactor;
    expect(effectiveContentDuration).toBe(4); // 8 * 0.5 = 4 seconds of content
  });
});

// ============================================================================
// Duration and Playback Rate Tests
// ============================================================================

describe("clip constraints - duration and playback rate", () => {
  it("should derive default duration from beat count", () => {
    const sequence4beats = createTestSequence(4);
    const sequence8beats = createTestSequence(8);

    const clip4 = createClip(sequence4beats, "track-1", 0);
    const clip8 = createClip(sequence8beats, "track-1", 0);

    expect(clip4.duration).toBe(4);
    expect(clip8.duration).toBe(8);
  });

  it("should default to 4 seconds for empty sequence", () => {
    const emptySequence = createTestSequence(0);
    const clip = createClip(emptySequence, "track-1", 0);

    expect(clip.duration).toBe(4); // Fallback
  });

  it("should correctly calculate end time", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 5, { duration: 3 });

    expect(getClipEndTime(clip)).toBe(8); // 5 + 3
  });

  it("should handle playback rate in duration calculations", () => {
    const sequence = createTestSequence(4);

    // Note: duration field is "after speed adjustments" per the type definition
    // So a clip with duration=4 plays for 4 seconds regardless of playbackRate
    const clip = createClip(sequence, "track-1", 0, {
      duration: 4,
      playbackRate: 2, // 2x speed
    });

    // The clip still occupies 4 seconds on the timeline
    expect(getClipEndTime(clip)).toBe(4);

    // But the animation plays at 2x speed (covered 8 beats worth in 4 seconds)
    expect(clip.playbackRate).toBe(2);
  });

  it("should handle fractional playback rates", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      duration: 4,
      playbackRate: 0.5, // Half speed
    });

    expect(clip.playbackRate).toBe(0.5);
    expect(getClipEndTime(clip)).toBe(4);
  });
});

// ============================================================================
// Clip Positioning Tests
// ============================================================================

describe("clip constraints - positioning", () => {
  it("should allow clips at time zero", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0);

    expect(clip.startTime).toBe(0);
    expect(getClipEndTime(clip)).toBe(4);
  });

  it("should allow clips at any positive time", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 100);

    expect(clip.startTime).toBe(100);
    expect(getClipEndTime(clip)).toBe(104);
  });

  /**
   * DOCUMENTATION TEST: Negative start times are technically allowed.
   * This could be intentional for pre-roll or problematic depending on use case.
   */
  it("should document behavior with negative start time", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", -2, { duration: 4 });

    // CURRENT BEHAVIOR: Negative times allowed
    expect(clip.startTime).toBe(-2);
    expect(getClipEndTime(clip)).toBe(2); // -2 + 4 = 2
  });
});

// ============================================================================
// Multi-Clip Constraint Tests
// ============================================================================

describe("clip constraints - multi-clip operations", () => {
  it("should correctly detect overlapping clips on same track", () => {
    const sequence = createTestSequence(4);

    const clipA = createClip(sequence, "track-1", 0, { duration: 5 }); // 0-5
    const clipB = createClip(sequence, "track-1", 3, { duration: 4 }); // 3-7

    expect(clipsOverlap(clipA, clipB)).toBe(true);
  });

  it("should allow clips to be adjacent without overlap", () => {
    const sequence = createTestSequence(4);

    const clipA = createClip(sequence, "track-1", 0, { duration: 5 }); // 0-5
    const clipB = createClip(sequence, "track-1", 5, { duration: 3 }); // 5-8

    expect(clipsOverlap(clipA, clipB)).toBe(false);
  });

  it("should allow overlapping clips on different tracks", () => {
    const sequence = createTestSequence(4);

    const clipA = createClip(sequence, "track-1", 0, { duration: 5 });
    const clipB = createClip(sequence, "track-2", 0, { duration: 5 });

    expect(clipsOverlap(clipA, clipB)).toBe(false);
  });

  it("should handle multiple sequential clips without gaps", () => {
    const sequence = createTestSequence(4);

    const clips = [
      createClip(sequence, "track-1", 0, { duration: 3 }), // 0-3
      createClip(sequence, "track-1", 3, { duration: 3 }), // 3-6
      createClip(sequence, "track-1", 6, { duration: 3 }), // 6-9
    ];

    // No adjacent clips should overlap
    expect(clipsOverlap(clips[0]!, clips[1]!)).toBe(false);
    expect(clipsOverlap(clips[1]!, clips[2]!)).toBe(false);
    expect(clipsOverlap(clips[0]!, clips[2]!)).toBe(false);
  });
});

// ============================================================================
// Track Constraint Tests
// ============================================================================

describe("clip constraints - tracks", () => {
  it("should create track with sensible defaults", () => {
    const track = createTrack("Test Track", 0);

    expect(track.name).toBe("Test Track");
    expect(track.order).toBe(0);
    expect(track.clips).toEqual([]);
    expect(track.muted).toBe(false);
    expect(track.locked).toBe(false);
    expect(track.visible).toBe(true);
    expect(track.height).toBe(80);
  });

  it("should generate unique track IDs", () => {
    const track1 = createTrack("Track 1", 0);
    const track2 = createTrack("Track 2", 1);

    expect(track1.id).not.toBe(track2.id);
  });
});

// ============================================================================
// Visual Settings Constraint Tests
// ============================================================================

describe("clip constraints - visual settings", () => {
  it("should create clip with valid opacity (0-1)", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0);

    expect(clip.opacity).toBe(1);
    expect(clip.opacity).toBeGreaterThanOrEqual(0);
    expect(clip.opacity).toBeLessThanOrEqual(1);
  });

  it("should create clip with valid rotation (0-360)", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0);

    expect(clip.rotation).toBe(0);
    expect(clip.rotation).toBeGreaterThanOrEqual(0);
    expect(clip.rotation).toBeLessThanOrEqual(360);
  });

  /**
   * DOCUMENTATION TEST: Opacity values outside 0-1 are allowed.
   * Rendering should clamp these, but validation could be added.
   */
  it("should document behavior with out-of-range opacity", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      opacity: 1.5, // Invalid: > 1
    });

    // CURRENT BEHAVIOR: Invalid value accepted
    expect(clip.opacity).toBe(1.5);

    // TODO: Consider validation/clamping in createClip
  });

  it("should handle negative rotation (wraps around)", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      rotation: -45,
    });

    // CURRENT BEHAVIOR: Negative rotation allowed (should be normalized in rendering)
    expect(clip.rotation).toBe(-45);
  });
});

// ============================================================================
// Loop Settings Tests
// ============================================================================

describe("clip constraints - loop settings", () => {
  it("should default to no looping", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0);

    expect(clip.loop).toBe(false);
    expect(clip.loopCount).toBe(0);
  });

  it("should allow enabling loop with count", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      loop: true,
      loopCount: 3,
    });

    expect(clip.loop).toBe(true);
    expect(clip.loopCount).toBe(3);
  });

  it("should interpret loopCount 0 as infinite when loop enabled", () => {
    const sequence = createTestSequence(4);
    const clip = createClip(sequence, "track-1", 0, {
      loop: true,
      loopCount: 0, // 0 = infinite per docs
    });

    expect(clip.loop).toBe(true);
    expect(clip.loopCount).toBe(0); // Infinite loops within duration
  });
});
