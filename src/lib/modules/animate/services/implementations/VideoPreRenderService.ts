/**
 * VideoPreRenderService
 *
 * Generates videos from animation sequences using programmatic frame-by-frame rendering.
 * This ensures consistent quality regardless of device performance.
 *
 * How it works:
 * 1. Create an offscreen canvas with VideoFrameRenderer
 * 2. Pre-calculate all trail points mathematically (TrailPathGenerator)
 * 3. For each video frame:
 *    a. Render the frame at the correct beat position
 *    b. MediaRecorder captures the canvas
 * 4. Encode to video and cache in IndexedDB
 *
 * The result is a smooth video that looks identical on any device.
 */

import type { SequenceData } from "$shared";
import { resolve, TYPES } from "$shared";
import type { ISequenceAnimationOrchestrator } from "../contracts/ISequenceAnimationOrchestrator";
import type {
  IVideoPreRenderService,
  VideoRenderProgress,
  VideoRenderResult,
  VideoRenderOptions,
} from "../contracts/IVideoPreRenderService";
import { VideoFrameRenderer } from "./VideoFrameRenderer";

// IndexedDB database name and store for video caching
const DB_NAME = "tka-video-cache";
const STORE_NAME = "videos";
const DB_VERSION = 1;

export class VideoPreRenderService implements IVideoPreRenderService {
  private db: IDBDatabase | null = null;
  private isCurrentlyRendering = false;
  private cancelRequested = false;

  /**
   * Initialize IndexedDB for video caching
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "sequenceId" });
        }
      };
    });
  }

  /**
   * Generate a unique sequence ID for caching
   */
  generateSequenceId(sequence: SequenceData): string {
    const word = sequence.word || sequence.name || "unknown";
    const beatCount = sequence.beats?.length || 0;
    const hash = this.simpleHash(JSON.stringify(sequence.beats?.slice(0, 3) || []));
    return `${word}-${beatCount}-${hash}`;
  }

  /**
   * Simple hash function for sequence identification
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 6);
  }

  /**
   * Pre-render a sequence to video using programmatic frame generation
   *
   * This is the main method - it renders each frame mathematically,
   * ensuring perfect quality regardless of device performance.
   */
  async renderSequenceToVideo(
    sequence: SequenceData,
    _canvas: HTMLCanvasElement, // Ignored - we use our own offscreen canvas
    options: VideoRenderOptions = {},
    onProgress?: (progress: VideoRenderProgress) => void
  ): Promise<VideoRenderResult> {
    const sequenceId = this.generateSequenceId(sequence);

    // Check if already rendering
    if (this.isCurrentlyRendering) {
      return {
        success: false,
        error: "A render is already in progress",
        sequenceId,
      };
    }

    // Check for cached video first
    const cached = await this.getCachedVideo(sequenceId);
    if (cached?.success) {
      console.log(`📼 Using cached video for ${sequenceId}`);
      return cached;
    }

    this.isCurrentlyRendering = true;
    this.cancelRequested = false;

    const {
      fps = 60,
      quality = 0.9,
      format = "webm",
      width = 500,
      height = 500,
    } = options;

    const totalBeats = sequence.beats?.length || 0;
    if (totalBeats === 0) {
      this.isCurrentlyRendering = false;
      return {
        success: false,
        error: "Sequence has no beats",
        sequenceId,
      };
    }

    console.log(`🎬 Starting video generation for ${sequenceId} (${totalBeats} beats @ ${fps}fps)`);

    try {
      // Report preparation phase
      onProgress?.({
        currentFrame: 0,
        totalFrames: 0,
        percent: 0,
        estimatedTimeRemaining: 0,
        phase: "rendering",
      });

      // Get orchestrator from DI container
      const orchestrator = resolve(TYPES.ISequenceAnimationOrchestrator) as ISequenceAnimationOrchestrator;

      // Create frame renderer with offscreen canvas
      const canvasSize = Math.max(width ?? 500, height ?? 500);
      const frameRenderer = new VideoFrameRenderer(orchestrator, {
        canvasSize,
        fps,
        bluePropDimensions: { width: 252.8, height: 77.8 }, // Default staff dimensions
        redPropDimensions: { width: 252.8, height: 77.8 },
        showGrid: true,
        showTrails: true,
        maxTrailLength: 500,
        trailWidth: 4,
      });

      // Pre-calculate trail data
      frameRenderer.prepareSequence(sequence);

      // Set up MediaRecorder on the offscreen canvas
      const canvas = frameRenderer.getCanvas();
      const stream = canvas.captureStream(fps);

      // Determine best supported mime type
      const preferredMimeType = format === "webm"
        ? "video/webm;codecs=vp9"
        : "video/mp4";

      const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
        ? preferredMimeType
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: quality * 8_000_000,
      });

      const recordedChunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect chunks every 100ms

      // Calculate frame timing
      const totalFrames = Math.ceil(totalBeats * fps);
      const frameInterval = 1000 / fps; // Time between frames in ms
      const startTime = performance.now();

      // Render each frame programmatically
      for (let frameIndex = 0; frameIndex <= totalFrames; frameIndex++) {
        if (this.cancelRequested) {
          mediaRecorder.stop();
          frameRenderer.dispose();
          this.isCurrentlyRendering = false;
          return {
            success: false,
            error: "Render cancelled",
            sequenceId,
          };
        }

        // Calculate beat position for this frame
        const beat = frameIndex / fps;

        // Render the frame
        frameRenderer.renderFrame(beat);

        // Report progress
        const percent = (frameIndex / totalFrames) * 100;
        const elapsed = performance.now() - startTime;
        const estimatedTotal = (elapsed / (frameIndex + 1)) * totalFrames;
        const remaining = Math.max(0, estimatedTotal - elapsed);

        onProgress?.({
          currentFrame: frameIndex,
          totalFrames,
          percent,
          estimatedTimeRemaining: remaining,
          phase: "rendering",
        });

        // Wait for the frame to be captured
        // This is slower than real-time but ensures every frame is captured
        await new Promise(resolve => setTimeout(resolve, frameInterval * 0.5));
      }

      // Stop recording
      mediaRecorder.stop();

      // Wait for encoding to complete
      onProgress?.({
        currentFrame: totalFrames,
        totalFrames,
        percent: 95,
        estimatedTimeRemaining: 500,
        phase: "encoding",
      });

      const videoBlob = await new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: mimeType });
          resolve(blob);
        };
      });

      // Clean up frame renderer
      frameRenderer.dispose();

      // Create blob URL
      const blobUrl = URL.createObjectURL(videoBlob);
      const duration = totalBeats; // 1 beat = 1 second

      // Cache the video
      await this.cacheVideo(sequenceId, videoBlob, duration);

      // Report completion
      onProgress?.({
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        estimatedTimeRemaining: 0,
        phase: "complete",
      });

      console.log(`✅ Video generated: ${sequenceId} (${duration.toFixed(1)}s, ${(videoBlob.size / 1024).toFixed(0)}KB)`);

      this.isCurrentlyRendering = false;

      return {
        success: true,
        videoBlob,
        blobUrl,
        duration,
        sequenceId,
      };
    } catch (error) {
      this.isCurrentlyRendering = false;
      console.error("Video generation failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during rendering",
        sequenceId,
      };
    }
  }

  /**
   * Check if a video exists in cache for a sequence
   */
  async getCachedVideo(sequenceId: string): Promise<VideoRenderResult | null> {
    try {
      const db = await this.initDB();

      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(sequenceId);

        request.onsuccess = () => {
          const result = request.result;
          if (result?.videoBlob) {
            const blobUrl = URL.createObjectURL(result.videoBlob);
            resolve({
              success: true,
              videoBlob: result.videoBlob,
              blobUrl,
              duration: result.duration,
              sequenceId,
            });
          } else {
            resolve(null);
          }
        };

        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  /**
   * Store a rendered video in cache
   */
  async cacheVideo(sequenceId: string, videoBlob: Blob, duration?: number): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const request = store.put({
          sequenceId,
          videoBlob,
          duration: duration || 0,
          createdAt: Date.now(),
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Failed to cache video:", error);
    }
  }

  /**
   * Clear cached video for a sequence
   */
  async clearCachedVideo(sequenceId: string): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.delete(sequenceId);
        resolve();
      });
    } catch {
      // Ignore errors
    }
  }

  /**
   * Clear all cached videos
   */
  async clearAllCachedVideos(): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        resolve();
      });
    } catch {
      // Ignore errors
    }
  }

  /**
   * Cancel ongoing render
   */
  cancelRender(): void {
    this.cancelRequested = true;
  }

  /**
   * Check if a render is in progress
   */
  isRendering(): boolean {
    return this.isCurrentlyRendering;
  }
}

// Singleton instance
let serviceInstance: VideoPreRenderService | null = null;

export function getVideoPreRenderService(): VideoPreRenderService {
  if (!serviceInstance) {
    serviceInstance = new VideoPreRenderService();
  }
  return serviceInstance;
}
