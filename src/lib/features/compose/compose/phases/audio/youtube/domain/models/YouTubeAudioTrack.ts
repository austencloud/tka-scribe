/**
 * YouTube Audio Track Domain Model
 *
 * Represents a saved YouTube audio track in the user's library.
 * Stored in Firestore for cross-device sync, with audio cached locally in IndexedDB.
 */

import type { Timestamp } from "firebase/firestore";

/**
 * Audio quality level for extraction
 */
export type AudioQuality = "low" | "medium" | "high";

/**
 * YouTube audio track metadata (stored in Firestore)
 */
export interface YouTubeAudioTrack {
  /** YouTube video ID (also serves as document ID) */
  videoId: string;

  /** Video/track title */
  title: string;

  /** Channel name */
  channelName: string;

  /** Thumbnail URL for display */
  thumbnailUrl: string;

  /** Duration in seconds */
  duration: number;

  /** Audio quality used for extraction */
  quality: AudioQuality;

  /** When user added this track */
  addedAt: Timestamp;

  /** Last time user played this track */
  lastPlayedAt?: Timestamp;

  /** Number of times re-downloaded (for analytics) */
  downloadCount: number;

  /** File size in bytes (if known) */
  fileSize?: number;
}

/**
 * Local representation with Date objects instead of Timestamps
 * Used in client-side state
 */
export interface YouTubeAudioTrackLocal {
  videoId: string;
  title: string;
  channelName: string;
  thumbnailUrl: string;
  duration: number;
  quality: AudioQuality;
  addedAt: Date;
  lastPlayedAt?: Date;
  downloadCount: number;
  fileSize?: number;

  /** Whether audio is cached locally in IndexedDB */
  isLocallyAvailable: boolean;
}

/**
 * Convert Firestore track to local representation
 */
export function toLocalTrack(
  track: YouTubeAudioTrack,
  isLocallyAvailable: boolean
): YouTubeAudioTrackLocal {
  return {
    videoId: track.videoId,
    title: track.title,
    channelName: track.channelName,
    thumbnailUrl: track.thumbnailUrl,
    duration: track.duration,
    quality: track.quality,
    addedAt: track.addedAt.toDate(),
    lastPlayedAt: track.lastPlayedAt?.toDate(),
    downloadCount: track.downloadCount,
    fileSize: track.fileSize,
    isLocallyAvailable,
  };
}
