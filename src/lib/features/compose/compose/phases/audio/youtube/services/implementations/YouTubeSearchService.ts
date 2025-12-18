/**
 * YouTube Search Service Implementation
 *
 * Searches YouTube via server-side API route (protects API key).
 */

import { injectable } from "inversify";
import type {
  IYouTubeSearchService,
  YouTubeSearchOptions,
  YouTubeSearchResult,
} from "../contracts/IYouTubeSearchService";
import type { YouTubeVideo } from "../../domain/models/YouTubeVideo";
import { parseISODuration, formatDuration } from "../../domain/models/YouTubeVideo";

@injectable()
export class YouTubeSearchService implements IYouTubeSearchService {
  private searchCache = new Map<string, { result: YouTubeSearchResult; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async search(
    query: string,
    options: YouTubeSearchOptions = {}
  ): Promise<YouTubeSearchResult> {
    const cacheKey = this.getCacheKey(query, options);
    const cached = this.searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log("🔍 YouTube search (cached):", query);
      return cached.result;
    }

    console.log("🔍 YouTube search:", query);

    const params = new URLSearchParams({
      q: query,
      maxResults: String(options.maxResults ?? 10),
    });

    if (options.videoDuration && options.videoDuration !== "any") {
      params.set("videoDuration", options.videoDuration);
    }
    if (options.order) {
      params.set("order", options.order);
    }

    const response = await fetch(`/api/youtube/search?${params}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Search failed" }));
      throw new Error(error.error || `Search failed: ${response.status}`);
    }

    const data = await response.json();
    const result = this.transformSearchResponse(data);

    this.searchCache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  async searchNextPage(
    query: string,
    pageToken: string,
    options: YouTubeSearchOptions = {}
  ): Promise<YouTubeSearchResult> {
    const params = new URLSearchParams({
      q: query,
      maxResults: String(options.maxResults ?? 10),
      pageToken,
    });

    const response = await fetch(`/api/youtube/search?${params}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Search failed" }));
      throw new Error(error.error || `Search failed: ${response.status}`);
    }

    const data = await response.json();
    return this.transformSearchResponse(data);
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    const response = await fetch(`/api/youtube/search?videoId=${videoId}`);

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.json().catch(() => ({ error: "Failed to get video" }));
      throw new Error(error.error || `Failed to get video: ${response.status}`);
    }

    const data = await response.json();
    if (!data.video) return null;

    return this.transformVideoItem(data.video);
  }

  extractVideoId(url: string): string | null {
    // Handle various YouTube URL formats
    const patterns = [
      // Standard watch URL: https://www.youtube.com/watch?v=VIDEO_ID
      /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/,
      // Short URL: https://youtu.be/VIDEO_ID
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      // Embed URL: https://www.youtube.com/embed/VIDEO_ID
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      // Shorts URL: https://www.youtube.com/shorts/VIDEO_ID
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      // Just the video ID
      /^([a-zA-Z0-9_-]{11})$/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  private getCacheKey(query: string, options: YouTubeSearchOptions): string {
    return JSON.stringify({ query: query.toLowerCase().trim(), options });
  }

  private transformSearchResponse(data: any): YouTubeSearchResult {
    return {
      videos: (data.items || []).map((item: any) => this.transformVideoItem(item)),
      nextPageToken: data.nextPageToken,
      totalResults: data.pageInfo?.totalResults,
    };
  }

  private transformVideoItem(item: any): YouTubeVideo {
    const snippet = item.snippet || {};
    const contentDetails = item.contentDetails || {};

    const durationISO = contentDetails.duration || "PT0S";
    const durationSeconds = parseISODuration(durationISO);

    return {
      videoId: item.id?.videoId || item.id || "",
      title: snippet.title || "Untitled",
      channelName: snippet.channelTitle || "Unknown",
      thumbnailUrl:
        snippet.thumbnails?.high?.url ||
        snippet.thumbnails?.medium?.url ||
        snippet.thumbnails?.default?.url ||
        "",
      durationISO,
      durationSeconds,
      durationFormatted: formatDuration(durationSeconds),
      publishedAt: snippet.publishedAt,
      viewCount: item.statistics?.viewCount
        ? parseInt(item.statistics.viewCount, 10)
        : undefined,
    };
  }
}
