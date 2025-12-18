/**
 * YouTube Audio Service Implementation
 *
 * Handles audio extraction via Cloud Function, local caching, and Firestore sync.
 */

import { injectable } from "inversify";
import type {
  IYouTubeAudioService,
  ExtractionProgress,
  ExtractionResult,
} from "../contracts/IYouTubeAudioService";
import type { YouTubeVideo } from "../../domain/models/YouTubeVideo";
import type {
  AudioQuality,
  YouTubeAudioTrackLocal,
} from "../../domain/models/YouTubeAudioTrack";
import {
  saveYouTubeAudio,
  loadYouTubeAudio,
  hasYouTubeAudio,
  deleteYouTubeAudio,
  clearAllYouTubeAudio,
  getYouTubeAudioStorageSize,
} from "../../persistence/youtube-audio-persistence";
import {
  saveTrackMetadata,
  loadLibraryFromFirestore,
  deleteTrackMetadata,
  updateLastPlayed,
  incrementDownloadCount,
} from "../../persistence/youtube-metadata-sync";

@injectable()
export class YouTubeAudioService implements IYouTubeAudioService {
  private library: YouTubeAudioTrackLocal[] = [];
  private libraryLoaded = false;

  async extractAudio(
    video: YouTubeVideo,
    quality: AudioQuality = "medium",
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<ExtractionResult> {
    try {
      // Check if already cached locally
      const cached = await loadYouTubeAudio(video.videoId);
      if (cached) {
        onProgress?.({
          stage: "complete",
          progress: 100,
          message: "Loaded from cache",
        });

        // Still update last played in Firestore
        await updateLastPlayed(video.videoId).catch(() => {});

        const track: YouTubeAudioTrackLocal = {
          videoId: video.videoId,
          title: video.title,
          channelName: video.channelName,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.durationSeconds,
          quality,
          addedAt: new Date(),
          downloadCount: 1,
          isLocallyAvailable: true,
        };

        return { success: true, audioBlob: cached.blob, track };
      }

      // Call Cloud Function to extract audio
      onProgress?.({
        stage: "queued",
        progress: 5,
        message: "Starting extraction...",
      });

      const response = await fetch("/api/youtube/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.videoId,
          quality,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Extraction failed" }));
        throw new Error(error.error || `Extraction failed: ${response.status}`);
      }

      onProgress?.({
        stage: "extracting",
        progress: 30,
        message: "Extracting audio from YouTube...",
      });

      const data = await response.json();

      if (!data.success || !data.audioUrl) {
        throw new Error(data.error || "Failed to extract audio");
      }

      onProgress?.({
        stage: "downloading",
        progress: 60,
        message: "Downloading audio file...",
      });

      // Download the audio file
      const audioResponse = await fetch(data.audioUrl);
      if (!audioResponse.ok) {
        throw new Error("Failed to download audio file");
      }

      const audioBlob = await audioResponse.blob();

      onProgress?.({
        stage: "caching",
        progress: 85,
        message: "Saving to local cache...",
      });

      // Save to IndexedDB
      await saveYouTubeAudio(video.videoId, audioBlob, {
        title: video.title,
        duration: video.durationSeconds,
        thumbnailUrl: video.thumbnailUrl,
      });

      // Save metadata to Firestore
      await saveTrackMetadata(video.videoId, {
        title: video.title,
        channelName: video.channelName,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.durationSeconds,
        quality,
        fileSize: audioBlob.size,
      });

      onProgress?.({
        stage: "complete",
        progress: 100,
        message: "Audio ready!",
      });

      const track: YouTubeAudioTrackLocal = {
        videoId: video.videoId,
        title: video.title,
        channelName: video.channelName,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.durationSeconds,
        quality,
        addedAt: new Date(),
        downloadCount: 1,
        fileSize: audioBlob.size,
        isLocallyAvailable: true,
      };

      // Update local library
      this.library = [track, ...this.library.filter((t) => t.videoId !== video.videoId)];

      return { success: true, audioBlob, track };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      onProgress?.({
        stage: "error",
        progress: 0,
        message,
      });

      return { success: false, error: message };
    }
  }

  async getLibrary(): Promise<YouTubeAudioTrackLocal[]> {
    if (!this.libraryLoaded) {
      await this.syncLibrary();
    }
    return this.library;
  }

  async loadLocalAudio(videoId: string): Promise<Blob | null> {
    const cached = await loadYouTubeAudio(videoId);
    if (cached) {
      // Update last played in Firestore
      await updateLastPlayed(videoId).catch(() => {});
      return cached.blob;
    }
    return null;
  }

  async hasLocalAudio(videoId: string): Promise<boolean> {
    return hasYouTubeAudio(videoId);
  }

  async removeFromLibrary(videoId: string): Promise<void> {
    // Delete from IndexedDB
    await deleteYouTubeAudio(videoId).catch(() => {});

    // Delete from Firestore
    await deleteTrackMetadata(videoId);

    // Update local library
    this.library = this.library.filter((t) => t.videoId !== videoId);
  }

  async clearLocalCache(): Promise<number> {
    const freedBytes = await clearAllYouTubeAudio();

    // Update local availability in library
    this.library = this.library.map((t) => ({
      ...t,
      isLocallyAvailable: false,
    }));

    return freedBytes;
  }

  async getLocalCacheSize(): Promise<number> {
    return getYouTubeAudioStorageSize();
  }

  async syncLibrary(): Promise<void> {
    try {
      this.library = await loadLibraryFromFirestore();
      this.libraryLoaded = true;
    } catch (error) {
      console.warn("Failed to sync YouTube library:", error);
      // Keep existing library if sync fails
      this.libraryLoaded = true;
    }
  }

  async markAsPlayed(videoId: string): Promise<void> {
    await updateLastPlayed(videoId);

    // Update local library
    const track = this.library.find((t) => t.videoId === videoId);
    if (track) {
      track.lastPlayedAt = new Date();
    }
  }
}
