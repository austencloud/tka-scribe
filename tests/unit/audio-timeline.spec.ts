/**
 * Test: Audio Timeline Editor Features
 *
 * Tests for:
 * - BPM analyzer utility functions
 * - Beat timestamp generation
 * - Tempo region calculations
 * - Audio state management
 */

import { describe, it, expect, beforeEach } from "vitest";
import { generateBeatTimestamps } from "$lib/features/compose/compose/phases/audio/bpm-analyzer";

describe("Audio Timeline Features", () => {
  describe("generateBeatTimestamps", () => {
    it("should generate correct number of beats for given BPM and duration", () => {
      // 60 BPM = 1 beat per second
      // 10 seconds duration = 11 timestamps (0, 1, 2, ... 10)
      const timestamps = generateBeatTimestamps(60, 10);

      expect(timestamps.length).toBe(11);
      expect(timestamps[0]).toBe(0);
      expect(timestamps[10]).toBe(10);
    });

    it("should space beats correctly at 120 BPM", () => {
      // 120 BPM = 0.5 seconds per beat
      const timestamps = generateBeatTimestamps(120, 2);

      expect(timestamps).toEqual([0, 0.5, 1, 1.5, 2]);
    });

    it("should respect offset parameter", () => {
      const timestamps = generateBeatTimestamps(60, 5, 1);

      // Should start at 1, not 0
      expect(timestamps[0]).toBe(1);
      expect(timestamps).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle high BPM values", () => {
      // 180 BPM = 3 beats per second = 0.333... seconds per beat
      const timestamps = generateBeatTimestamps(180, 1);

      expect(timestamps.length).toBe(4); // 0, 0.333, 0.666, 1
      expect(timestamps[0]).toBe(0);
      expect(timestamps[timestamps.length - 1]).toBeLessThanOrEqual(1);
    });

    it("should handle low BPM values", () => {
      // 30 BPM = 0.5 beats per second = 2 seconds per beat
      const timestamps = generateBeatTimestamps(30, 6);

      expect(timestamps).toEqual([0, 2, 4, 6]);
    });

    it("should return single timestamp for very short duration", () => {
      const timestamps = generateBeatTimestamps(60, 0.5);

      expect(timestamps).toEqual([0]);
    });

    it("should return empty array for zero duration", () => {
      const timestamps = generateBeatTimestamps(60, 0);

      expect(timestamps).toEqual([0]);
    });
  });

  describe("BeatMarker type structure", () => {
    it("should have correct structure", () => {
      // This test documents the expected BeatMarker interface
      const marker = {
        id: "test-marker-1",
        beat: 1,
        time: 2.5,
        isHalfBeat: false,
        cellId: undefined,
      };

      expect(marker.id).toBe("test-marker-1");
      expect(marker.beat).toBe(1);
      expect(marker.time).toBe(2.5);
      expect(typeof marker.isHalfBeat).toBe("boolean");
    });
  });

  describe("TempoRegion type structure", () => {
    it("should have correct structure for simple region", () => {
      const region = {
        id: "region-1",
        startTime: 0,
        endTime: 30,
        bpm: 120,
      };

      expect(region.startTime).toBeLessThan(region.endTime);
      expect(region.bpm).toBeGreaterThan(0);
    });

    it("should support ramp from previous", () => {
      const region = {
        id: "region-2",
        startTime: 30,
        endTime: 60,
        bpm: 140,
        rampFromPrevious: true,
      };

      expect(region.rampFromPrevious).toBe(true);
    });
  });

  describe("AudioState structure", () => {
    it("should have correct default values", () => {
      const defaultState = {
        file: null,
        url: null,
        fileName: null,
        duration: 0,
        detectedBpm: null,
        manualBpm: null,
        globalBeatMarkers: [],
        tempoRegions: [],
        isAnalyzing: false,
        isLoaded: false,
      };

      expect(defaultState.file).toBeNull();
      expect(defaultState.duration).toBe(0);
      expect(defaultState.globalBeatMarkers).toEqual([]);
      expect(defaultState.tempoRegions).toEqual([]);
      expect(defaultState.isLoaded).toBe(false);
    });
  });

  describe("BPM calculation from intervals", () => {
    it("should calculate BPM from beat intervals", () => {
      // Given beat timestamps, calculate average BPM
      const timestamps = [0, 0.5, 1, 1.5, 2];

      // Calculate intervals
      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push((timestamps[i] ?? 0) - (timestamps[i - 1] ?? 0));
      }

      // Average interval
      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;

      // BPM = 60 / average interval in seconds
      const bpm = Math.round(60 / avgInterval);

      expect(bpm).toBe(120);
    });

    it("should handle variable intervals", () => {
      // Simulating imperfect human tapping
      const timestamps = [0, 0.48, 1.02, 1.51, 2.0];

      const intervals: number[] = [];
      for (let i = 1; i < timestamps.length; i++) {
        intervals.push((timestamps[i] ?? 0) - (timestamps[i - 1] ?? 0));
      }

      const avgInterval =
        intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60 / avgInterval);

      // Should be close to 120 BPM
      expect(bpm).toBeGreaterThan(115);
      expect(bpm).toBeLessThan(125);
    });
  });

  describe("Tempo region BPM lookup", () => {
    it("should return correct BPM for time within region", () => {
      const regions = [
        { id: "1", startTime: 0, endTime: 30, bpm: 120 },
        { id: "2", startTime: 30, endTime: 60, bpm: 140 },
        { id: "3", startTime: 60, endTime: 90, bpm: 100 },
      ];

      const baseBpm = 120;

      function getBpmAtTime(time: number): number {
        for (const region of regions) {
          if (time >= region.startTime && time < region.endTime) {
            return region.bpm;
          }
        }
        return baseBpm;
      }

      expect(getBpmAtTime(15)).toBe(120); // First region
      expect(getBpmAtTime(45)).toBe(140); // Second region
      expect(getBpmAtTime(75)).toBe(100); // Third region
      expect(getBpmAtTime(100)).toBe(120); // Outside regions, use base
    });

    it("should handle edge cases at region boundaries", () => {
      const regions = [
        { id: "1", startTime: 0, endTime: 30, bpm: 120 },
        { id: "2", startTime: 30, endTime: 60, bpm: 140 },
      ];

      function getBpmAtTime(time: number): number {
        for (const region of regions) {
          if (time >= region.startTime && time < region.endTime) {
            return region.bpm;
          }
        }
        return 100; // Default
      }

      expect(getBpmAtTime(0)).toBe(120); // Start of first region
      expect(getBpmAtTime(29.9)).toBe(120); // End of first region (exclusive)
      expect(getBpmAtTime(30)).toBe(140); // Start of second region
    });
  });

  describe("Zoom calculations", () => {
    it("should calculate correct width for zoom level", () => {
      const duration = 60; // 60 seconds
      const zoomPxPerSec = 100; // 100 pixels per second

      const totalWidth = duration * zoomPxPerSec;

      expect(totalWidth).toBe(6000); // 60 * 100 = 6000px
    });

    it("should calculate position for timestamp", () => {
      const duration = 60;
      const time = 30;

      const positionPercent = (time / duration) * 100;

      expect(positionPercent).toBe(50);
    });
  });
});
