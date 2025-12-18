/**
 * YouTube Audio Service Contract
 *
 * Interface for extracting and managing YouTube audio.
 * Handles communication with Firebase Cloud Function for extraction,
 * IndexedDB for local caching, and Firestore for library sync.
 */

import type { YouTubeVideo } from "../../domain/models/YouTubeVideo";
import type {
  AudioQuality,
  YouTubeAudioTrackLocal,
} from "../../domain/models/YouTubeAudioTrack";

/**
 * Progress stages during audio extraction
 */
export type ExtractionStage =
  | "queued"
  | "extracting"
  | "downloading"
  | "caching"
  | "complete"
  | "error";

/**
 * Progress update during extraction
 */
export interface ExtractionProgress {
  /** Current stage */
  stage: ExtractionStage;

  /** Progress percentage (0-100) */
  progress: number;

  /** Human-readable message */
  message: string;
}

/**
 * Result of audio extraction
 */
export interface ExtractionResult {
  /** Success status */
  success: boolean;

  /** Audio file as Blob (if successful) */
  audioBlob?: Blob;

  /** Track metadata */
  track?: YouTubeAudioTrackLocal;

  /** Error message (if failed) */
  error?: string;
}

export interface IYouTubeAudioService {
  /**
   * Extract audio from a YouTube video
   * Calls Cloud Function, downloads result, caches locally, syncs to Firestore
   *
   * @param video - YouTube video to extract audio from
   * @param quality - Audio quality level
   * @param onProgress - Progress callback
   * @returns Extraction result with audio blob and metadata
   */
  extractAudio(
    video: YouTubeVideo,
    quality?: AudioQuality,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<ExtractionResult>;

  /**
   * Get user's YouTube audio library from Firestore
   * Merges with local availability status from IndexedDB
   *
   * @returns List of saved audio tracks
   */
  getLibrary(): Promise<YouTubeAudioTrackLocal[]>;

  /**
   * Load audio from local cache (IndexedDB)
   * Returns null if not cached locally
   *
   * @param videoId - YouTube video ID
   * @returns Audio blob or null
   */
  loadLocalAudio(videoId: string): Promise<Blob | null>;

  /**
   * Check if audio is cached locally
   *
   * @param videoId - YouTube video ID
   * @returns Whether audio is available locally
   */
  hasLocalAudio(videoId: string): Promise<boolean>;

  /**
   * Remove track from library
   * Deletes from Firestore and local IndexedDB cache
   *
   * @param videoId - YouTube video ID
   */
  removeFromLibrary(videoId: string): Promise<void>;

  /**
   * Clear all locally cached audio
   * Keeps Firestore metadata for re-download
   *
   * @returns Number of bytes freed
   */
  clearLocalCache(): Promise<number>;

  /**
   * Get total size of locally cached audio
   *
   * @returns Size in bytes
   */
  getLocalCacheSize(): Promise<number>;

  /**
   * Sync library from Firestore
   * Call on app load to get latest library state
   */
  syncLibrary(): Promise<void>;

  /**
   * Update last played timestamp for a track
   *
   * @param videoId - YouTube video ID
   */
  markAsPlayed(videoId: string): Promise<void>;
}
