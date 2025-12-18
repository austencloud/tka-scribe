/**
 * Playhead Actions Unit Tests
 *
 * Tests for transport control logic:
 * - Position clamping at boundaries
 * - Shuttle speed cycling (J/K/L behavior)
 * - Frame-accurate stepping
 * - State transitions (play/pause/stop)
 * - Loop region management
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createPlayheadActions,
  type PlayheadContext,
} from "$lib/features/compose/timeline/state/actions/playhead-actions";
import type { PlayheadState } from "$lib/features/compose/timeline/domain/timeline-types";

// ============================================================================
// Test Setup
// ============================================================================

function createTestContext(
  initialState: Partial<PlayheadState> = {},
  totalDuration: number = 60,
  frameRate: number = 30
): { context: PlayheadContext; getState: () => PlayheadState } {
  let state: PlayheadState = {
    position: 0,
    isPlaying: false,
    direction: 1,
    shuttleSpeed: 1,
    loopStart: null,
    loopEnd: null,
    ...initialState,
  };

  const context: PlayheadContext = {
    getPlayhead: () => state,
    setPlayhead: (p) => {
      state = p;
    },
    getTotalDuration: () => totalDuration,
    getFrameRate: () => frameRate,
  };

  return { context, getState: () => state };
}

// ============================================================================
// Position Clamping Tests
// ============================================================================

describe("playhead-actions - setPlayheadPosition", () => {
  it("should set position to exact value when within bounds", () => {
    const { context, getState } = createTestContext({}, 60);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(30);

    expect(getState().position).toBe(30);
  });

  it("should clamp negative positions to 0", () => {
    const { context, getState } = createTestContext({ position: 10 }, 60);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(-5);

    expect(getState().position).toBe(0);
  });

  it("should clamp positions beyond duration to duration", () => {
    const { context, getState } = createTestContext({}, 60);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(100);

    expect(getState().position).toBe(60);
  });

  it("should handle edge case at exactly zero", () => {
    const { context, getState } = createTestContext({ position: 10 }, 60);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(0);

    expect(getState().position).toBe(0);
  });

  it("should handle edge case at exactly duration", () => {
    const { context, getState } = createTestContext({}, 60);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(60);

    expect(getState().position).toBe(60);
  });

  it("should handle very small fractional positions", () => {
    const { context, getState } = createTestContext({}, 60);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(0.0001);

    expect(getState().position).toBe(0.0001);
  });
});

// ============================================================================
// Play/Pause/Stop State Transitions
// ============================================================================

describe("playhead-actions - play/pause/stop", () => {
  it("should set isPlaying true and direction forward on play()", () => {
    const { context, getState } = createTestContext({ isPlaying: false, direction: -1 });
    const actions = createPlayheadActions(context);

    actions.play();

    expect(getState().isPlaying).toBe(true);
    expect(getState().direction).toBe(1);
  });

  it("should set isPlaying false on pause()", () => {
    const { context, getState } = createTestContext({ isPlaying: true, position: 30 });
    const actions = createPlayheadActions(context);

    actions.pause();

    expect(getState().isPlaying).toBe(false);
    expect(getState().position).toBe(30); // Position preserved
  });

  it("should set isPlaying false and reset position on stop()", () => {
    const { context, getState } = createTestContext({ isPlaying: true, position: 30 });
    const actions = createPlayheadActions(context);

    actions.stop();

    expect(getState().isPlaying).toBe(false);
    expect(getState().position).toBe(0); // Position reset
  });

  it("should toggle between play and pause", () => {
    const { context, getState } = createTestContext({ isPlaying: false });
    const actions = createPlayheadActions(context);

    actions.togglePlayPause();
    expect(getState().isPlaying).toBe(true);

    actions.togglePlayPause();
    expect(getState().isPlaying).toBe(false);
  });
});

// ============================================================================
// Shuttle Speed Control Tests (J/K/L keys)
// ============================================================================

describe("playhead-actions - shuttle control", () => {
  it("should start forward shuttle at 1x speed", () => {
    const { context, getState } = createTestContext({ isPlaying: false });
    const actions = createPlayheadActions(context);

    actions.shuttleForward();

    expect(getState().isPlaying).toBe(true);
    expect(getState().direction).toBe(1);
    expect(getState().shuttleSpeed).toBe(1);
  });

  it("should increase speed on consecutive forward presses: 1x -> 2x -> 4x -> 8x", () => {
    const { context, getState } = createTestContext({ isPlaying: false });
    const actions = createPlayheadActions(context);

    actions.shuttleForward();
    expect(getState().shuttleSpeed).toBe(1);

    actions.shuttleForward();
    expect(getState().shuttleSpeed).toBe(2);

    actions.shuttleForward();
    expect(getState().shuttleSpeed).toBe(4);

    actions.shuttleForward();
    expect(getState().shuttleSpeed).toBe(8);
  });

  it("should cap shuttle speed at 8x", () => {
    const { context, getState } = createTestContext({ isPlaying: true, direction: 1, shuttleSpeed: 8 });
    const actions = createPlayheadActions(context);

    actions.shuttleForward();

    expect(getState().shuttleSpeed).toBe(8); // Stays at max
  });

  it("should reset to 1x when changing shuttle direction", () => {
    const { context, getState } = createTestContext({ isPlaying: true, direction: 1, shuttleSpeed: 4 });
    const actions = createPlayheadActions(context);

    actions.shuttleReverse(); // Change direction

    expect(getState().direction).toBe(-1);
    expect(getState().shuttleSpeed).toBe(1); // Reset to 1x
  });

  it("should stop playback and reset speed on shuttleStop()", () => {
    const { context, getState } = createTestContext({ isPlaying: true, shuttleSpeed: 4 });
    const actions = createPlayheadActions(context);

    actions.shuttleStop();

    expect(getState().isPlaying).toBe(false);
    expect(getState().shuttleSpeed).toBe(1);
  });

  it("should increase reverse speed on consecutive reverse presses", () => {
    const { context, getState } = createTestContext({ isPlaying: false });
    const actions = createPlayheadActions(context);

    actions.shuttleReverse();
    expect(getState().direction).toBe(-1);
    expect(getState().shuttleSpeed).toBe(1);

    actions.shuttleReverse();
    expect(getState().shuttleSpeed).toBe(2);

    actions.shuttleReverse();
    expect(getState().shuttleSpeed).toBe(4);
  });
});

// ============================================================================
// Frame Stepping Tests
// ============================================================================

describe("playhead-actions - frame stepping", () => {
  it("should step forward by one frame at 30fps", () => {
    const { context, getState } = createTestContext({ position: 1 }, 60, 30);
    const actions = createPlayheadActions(context);

    actions.stepForward();

    // 1 frame at 30fps = 1/30 second ≈ 0.0333s
    expect(getState().position).toBeCloseTo(1 + 1 / 30, 5);
  });

  it("should step backward by one frame at 30fps", () => {
    const { context, getState } = createTestContext({ position: 1 }, 60, 30);
    const actions = createPlayheadActions(context);

    actions.stepBackward();

    expect(getState().position).toBeCloseTo(1 - 1 / 30, 5);
  });

  it("should step forward by multiple frames", () => {
    const { context, getState } = createTestContext({ position: 0 }, 60, 30);
    const actions = createPlayheadActions(context);

    actions.stepForward(10);

    // 10 frames at 30fps = 10/30 = 0.333...s
    expect(getState().position).toBeCloseTo(10 / 30, 5);
  });

  it("should clamp forward step at duration boundary", () => {
    const { context, getState } = createTestContext({ position: 59.99 }, 60, 30);
    const actions = createPlayheadActions(context);

    actions.stepForward(30); // 30 frames = 1 second, would go past 60

    expect(getState().position).toBe(60); // Clamped
  });

  it("should clamp backward step at zero boundary", () => {
    const { context, getState } = createTestContext({ position: 0.01 }, 60, 30);
    const actions = createPlayheadActions(context);

    actions.stepBackward(30); // Would go negative

    expect(getState().position).toBe(0); // Clamped
  });

  it("should use correct frame time at 60fps", () => {
    const { context, getState } = createTestContext({ position: 0 }, 60, 60);
    const actions = createPlayheadActions(context);

    actions.stepForward();

    // 1 frame at 60fps = 1/60 second
    expect(getState().position).toBeCloseTo(1 / 60, 5);
  });

  it("should use correct frame time at 24fps", () => {
    const { context, getState } = createTestContext({ position: 0 }, 60, 24);
    const actions = createPlayheadActions(context);

    actions.stepForward();

    // 1 frame at 24fps = 1/24 second
    expect(getState().position).toBeCloseTo(1 / 24, 5);
  });
});

// ============================================================================
// Loop Region Tests
// ============================================================================

describe("playhead-actions - loop regions", () => {
  it("should set loop region start and end", () => {
    const { context, getState } = createTestContext();
    const actions = createPlayheadActions(context);

    actions.setLoopRegion(10, 20);

    expect(getState().loopStart).toBe(10);
    expect(getState().loopEnd).toBe(20);
  });

  it("should allow setting partial loop region (start only)", () => {
    const { context, getState } = createTestContext();
    const actions = createPlayheadActions(context);

    actions.setLoopRegion(10, null);

    expect(getState().loopStart).toBe(10);
    expect(getState().loopEnd).toBeNull();
  });

  it("should clear loop region", () => {
    const { context, getState } = createTestContext({ loopStart: 10, loopEnd: 20 });
    const actions = createPlayheadActions(context);

    actions.clearLoopRegion();

    expect(getState().loopStart).toBeNull();
    expect(getState().loopEnd).toBeNull();
  });
});

// ============================================================================
// Navigation Tests
// ============================================================================

describe("playhead-actions - navigation", () => {
  it("should go to start (position 0)", () => {
    const { context, getState } = createTestContext({ position: 30 }, 60);
    const actions = createPlayheadActions(context);

    actions.goToStart();

    expect(getState().position).toBe(0);
  });

  it("should go to end (position = duration)", () => {
    const { context, getState } = createTestContext({ position: 0 }, 60);
    const actions = createPlayheadActions(context);

    actions.goToEnd();

    expect(getState().position).toBe(60);
  });
});

// ============================================================================
// Edge Case / Error Prevention Tests
// ============================================================================

describe("playhead-actions - edge cases", () => {
  it("should handle zero duration project gracefully", () => {
    const { context, getState } = createTestContext({}, 0);
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(10);

    // Should clamp to 0 (max of 0)
    expect(getState().position).toBe(0);
  });

  it("should preserve other state properties when updating position", () => {
    const { context, getState } = createTestContext({
      isPlaying: true,
      shuttleSpeed: 4,
      direction: -1,
      loopStart: 5,
      loopEnd: 10,
    });
    const actions = createPlayheadActions(context);

    actions.setPlayheadPosition(7);

    expect(getState().isPlaying).toBe(true);
    expect(getState().shuttleSpeed).toBe(4);
    expect(getState().direction).toBe(-1);
    expect(getState().loopStart).toBe(5);
    expect(getState().loopEnd).toBe(10);
  });

  it("should handle rapid state changes", () => {
    const { context, getState } = createTestContext();
    const actions = createPlayheadActions(context);

    // Rapid sequence of operations
    actions.play();                  // isPlaying=true, direction=1, shuttleSpeed=1
    actions.setPlayheadPosition(10); // position=10
    actions.shuttleForward();        // Already playing forward: shuttleSpeed 1->2
    actions.shuttleForward();        // Still playing forward: shuttleSpeed 2->4
    actions.pause();                 // isPlaying=false (shuttleSpeed preserved at 4)
    actions.stepForward(5);          // position += 5 frames

    // Final state should be consistent
    expect(getState().isPlaying).toBe(false);
    expect(getState().position).toBeGreaterThan(10);
    // Shuttle speed is 4 after two consecutive forward presses while playing
    expect(getState().shuttleSpeed).toBe(4);
  });
});
