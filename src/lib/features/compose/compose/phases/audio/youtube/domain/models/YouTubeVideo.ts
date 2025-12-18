/**
 * YouTube Video Domain Model
 *
 * Represents a YouTube video from search results.
 */

/**
 * YouTube video search result
 */
export interface YouTubeVideo {
  /** YouTube video ID (e.g., "dQw4w9WgXcQ") */
  videoId: string;

  /** Video title */
  title: string;

  /** Channel name */
  channelName: string;

  /** Thumbnail URL (high quality) */
  thumbnailUrl: string;

  /** Duration in ISO 8601 format from API (e.g., "PT4M33S") */
  durationISO?: string;

  /** Duration in seconds (parsed) */
  durationSeconds: number;

  /** Human-readable duration (e.g., "4:33") */
  durationFormatted: string;

  /** When the video was published */
  publishedAt?: string;

  /** View count (if available) */
  viewCount?: number;
}

/**
 * Parse ISO 8601 duration to seconds
 * e.g., "PT4M33S" -> 273
 */
export function parseISODuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format seconds to human-readable duration
 * e.g., 273 -> "4:33"
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
