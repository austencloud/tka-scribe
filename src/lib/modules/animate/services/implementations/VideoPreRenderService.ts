/**
 * VideoPreRenderService
 *
 * Pre-renders animation sequences to video using MediaRecorder API.
 * Captures exactly what's displayed on canvas - no coordinate transformation issues.
 */

import type { SequenceData } from "$shared";
import type {
  IVideoPreRenderService,
  VideoRenderProgress,
  VideoRenderResult,
  VideoRenderOptions,
} from "../contracts/IVideoPreRenderService";

// IndexedDB database name and store
const DB_NAME = "tka-video-cache";
const STORE_NAME = "videos";
const DB_VERSION = 1;

export class VideoPreRenderService implements IVideoPreRenderService {
  private isCurrentlyRendering = false;
  private cancelRequested = false;
  private db: IDBDatabase | null = null;

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
  private generateSequenceId(sequence: SequenceData): string {
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
   * Pre-render a sequence to video
   */
  async renderSequenceToVideo(
    sequence: SequenceData,
    canvas: HTMLCanvasElement,
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
    if (cached && cached.success) {
      return cached;
    }

    this.isCurrentlyRendering = true;
    this.cancelRequested = false;

    const {
      fps = 60,
      speed = 1,
      format = "webm",
      quality = 0.9,
    } = options;

    const beatCount = sequence.beats?.length || 0;
    if (beatCount === 0) {
      this.isCurrentlyRendering = false;
      return {
        success: false,
        error: "Sequence has no beats",
        sequenceId,
      };
    }

    // Calculate total frames needed
    // Each beat = 1 second at speed 1, so total duration = beatCount / speed
    const durationSeconds = beatCount / speed;
    const totalFrames = Math.ceil(durationSeconds * fps);
    const frameInterval = 1000 / fps;

    try {
      // Set up MediaRecorder
      const stream = canvas.captureStream(fps);
      const mimeType = format === "webm" ? "video/webm;codecs=vp9" : "video/mp4";

      // Check if the preferred mime type is supported
      const actualMimeType = MediaRecorder.isTypeSupported(mimeType)
        ? mimeType
        : MediaRecorder.isTypeSupported("video/webm")
          ? "video/webm"
          : "video/mp4";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: actualMimeType,
        videoBitsPerSecond: quality * 8000000, // 8 Mbps at quality 1.0
      });

      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Start recording
      mediaRecorder.start();

      const startTime = performance.now();

      // Report initial progress
      onProgress?.({
        currentFrame: 0,
        totalFrames,
        percent: 0,
        estimatedTimeRemaining: totalFrames * frameInterval,
        phase: "rendering",
      });

      // Wait for the animation to complete
      // The actual animation playback drives the canvas updates
      // We just need to wait for the right duration
      await new Promise<void>((resolve) => {
        let frameCount = 0;

        const checkProgress = () => {
          if (this.cancelRequested) {
            resolve();
            return;
          }

          frameCount++;
          const elapsed = performance.now() - startTime;
          const progress = Math.min(frameCount / totalFrames, 1);

          onProgress?.({
            currentFrame: frameCount,
            totalFrames,
            percent: progress * 100,
            estimatedTimeRemaining: (1 - progress) * durationSeconds * 1000,
            phase: "rendering",
          });

          if (frameCount >= totalFrames) {
            resolve();
          } else {
            requestAnimationFrame(checkProgress);
          }
        };

        requestAnimationFrame(checkProgress);
      });

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
          const blob = new Blob(chunks, { type: actualMimeType });
          resolve(blob);
        };
      });

      if (this.cancelRequested) {
        this.isCurrentlyRendering = false;
        return {
          success: false,
          error: "Render cancelled",
          sequenceId,
        };
      }

      // Create blob URL
      const blobUrl = URL.createObjectURL(videoBlob);

      // Cache the video
      await this.cacheVideo(sequenceId, videoBlob);

      // Report completion
      onProgress?.({
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        estimatedTimeRemaining: 0,
        phase: "complete",
      });

      this.isCurrentlyRendering = false;

      return {
        success: true,
        videoBlob,
        blobUrl,
        duration: durationSeconds,
        sequenceId,
      };
    } catch (error) {
      this.isCurrentlyRendering = false;
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
          if (result && result.videoBlob) {
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
  async cacheVideo(sequenceId: string, videoBlob: Blob): Promise<void> {
    try {
      const db = await this.initDB();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);

        const request = store.put({
          sequenceId,
          videoBlob,
          duration: 0, // Will be updated when video is loaded
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
