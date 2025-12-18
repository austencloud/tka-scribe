/**
 * YouTube Search Service Contract
 *
 * Interface for searching YouTube videos via the YouTube Data API.
 * Implementation will proxy through server-side API route to protect API key.
 */

import type { YouTubeVideo } from "../../domain/models/YouTubeVideo";

/**
 * Search options for YouTube queries
 */
export interface YouTubeSearchOptions {
  /** Maximum number of results (default: 10, max: 50) */
  maxResults?: number;

  /** Filter by video duration */
  videoDuration?: "short" | "medium" | "long" | "any";

  /** Order results by */
  order?: "relevance" | "date" | "viewCount" | "rating";
}

/**
 * Search result with pagination info
 */
export interface YouTubeSearchResult {
  /** List of video results */
  videos: YouTubeVideo[];

  /** Token for fetching next page */
  nextPageToken?: string;

  /** Total estimated results */
  totalResults?: number;
}

export interface IYouTubeSearchService {
  /**
   * Search YouTube for videos matching query
   * @param query - Search terms
   * @param options - Search options
   * @returns Search results
   */
  search(
    query: string,
    options?: YouTubeSearchOptions
  ): Promise<YouTubeSearchResult>;

  /**
   * Get next page of search results
   * @param query - Original search query
   * @param pageToken - Token from previous search
   * @param options - Search options
   * @returns Next page of results
   */
  searchNextPage(
    query: string,
    pageToken: string,
    options?: YouTubeSearchOptions
  ): Promise<YouTubeSearchResult>;

  /**
   * Get details for a specific video by ID
   * @param videoId - YouTube video ID
   * @returns Video details or null if not found
   */
  getVideoDetails(videoId: string): Promise<YouTubeVideo | null>;

  /**
   * Extract video ID from various YouTube URL formats
   * @param url - YouTube URL (watch, short, embed, etc.)
   * @returns Video ID or null if invalid
   */
  extractVideoId(url: string): string | null;
}
