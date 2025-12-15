/**
 * BPM Analyzer Utility
 *
 * Wraps realtime-bpm-analyzer for detecting BPM from audio files.
 */

import { analyzeFullBuffer } from "realtime-bpm-analyzer";

export interface BpmResult {
  bpm: number;
  confidence: number;
}

/**
 * Analyze an audio file to detect its BPM.
 * Uses Web Audio API and realtime-bpm-analyzer.
 *
 * @param audioUrl - URL or blob URL of the audio file
 * @param onProgress - Optional callback for progress updates
 * @returns Promise with detected BPM and confidence
 */
export async function analyzeAudioBpm(
  audioUrl: string,
  onProgress?: (progress: number) => void
): Promise<BpmResult> {
  // Create audio context
  const audioContext = new AudioContext();

  try {
    // Fetch and decode the audio
    onProgress?.(0.1);
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();

    onProgress?.(0.3);
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    onProgress?.(0.5);

    // Analyze the audio buffer for BPM
    // The library handles all the filtering and peak detection internally
    const result = await analyzeFullBuffer(audioBuffer, {
      frequencyValue: 150, // Focus on bass frequencies for beat detection
      qualityValue: 1,
    });

    onProgress?.(1.0);

    // Get the tempo with highest confidence (first in sorted array)
    if (result && result.length > 0) {
      const bestResult = result[0];
      // Normalize confidence to 0-1 range based on count
      // Higher count = more intervals matched = higher confidence
      const maxExpectedCount = 100; // rough estimate for normalization
      const normalizedConfidence = Math.min(1, (bestResult?.count ?? 0) / maxExpectedCount);

      return {
        bpm: Math.round(bestResult?.tempo ?? 120),
        confidence: normalizedConfidence,
      };
    }

    // Default fallback
    return { bpm: 120, confidence: 0 };
  } finally {
    // Clean up
    await audioContext.close();
  }
}

/**
 * Generate beat timestamps based on BPM and duration.
 * @param bpm - Beats per minute
 * @param duration - Audio duration in seconds
 * @param offset - Optional offset for first beat in seconds
 * @returns Array of beat timestamps in seconds
 */
export function generateBeatTimestamps(
  bpm: number,
  duration: number,
  offset: number = 0
): number[] {
  const beatInterval = 60 / bpm; // seconds per beat
  const timestamps: number[] = [];

  let time = offset;
  while (time <= duration) {
    timestamps.push(time);
    time += beatInterval;
  }

  return timestamps;
}
