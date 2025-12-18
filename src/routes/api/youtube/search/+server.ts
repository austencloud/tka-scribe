/**
 * YouTube Search API Route
 *
 * Proxies YouTube Data API search requests to protect the API key.
 * Supports both search queries and direct video ID lookups.
 */

import { json, error } from "@sveltejs/kit";
import { YOUTUBE_API_KEY } from "$env/static/private";
import type { RequestHandler } from "./$types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export const GET: RequestHandler = async ({ url }) => {
  if (!YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY environment variable not set");
    throw error(500, "YouTube API not configured");
  }

  const query = url.searchParams.get("q");
  const videoId = url.searchParams.get("videoId");
  const maxResults = url.searchParams.get("max") || "10";
  const pageToken = url.searchParams.get("pageToken");
  const videoDuration = url.searchParams.get("videoDuration");
  const order = url.searchParams.get("order") || "relevance";

  try {
    // Direct video lookup
    if (videoId) {
      const videoUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
      videoUrl.searchParams.set("part", "snippet,contentDetails,statistics");
      videoUrl.searchParams.set("id", videoId);
      videoUrl.searchParams.set("key", YOUTUBE_API_KEY);

      const response = await fetch(videoUrl.toString());

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("YouTube API error:", errorData);
        throw error(response.status, "Failed to fetch video details");
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return json({ video: null });
      }

      const item = data.items[0];
      return json({
        video: {
          id: item.id,
          snippet: item.snippet,
          contentDetails: item.contentDetails,
          statistics: item.statistics,
        },
      });
    }

    // Search query
    if (!query) {
      throw error(400, "Missing search query");
    }

    // Step 1: Search for video IDs
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoCategoryId", "10"); // Music category
    searchUrl.searchParams.set("maxResults", maxResults);
    searchUrl.searchParams.set("order", order);
    searchUrl.searchParams.set("key", YOUTUBE_API_KEY);

    if (pageToken) {
      searchUrl.searchParams.set("pageToken", pageToken);
    }
    if (videoDuration && videoDuration !== "any") {
      searchUrl.searchParams.set("videoDuration", videoDuration);
    }

    const searchResponse = await fetch(searchUrl.toString());

    if (!searchResponse.ok) {
      const errorData = await searchResponse.json().catch(() => ({}));
      console.error("YouTube search API error:", errorData);

      if (searchResponse.status === 403) {
        throw error(403, "YouTube API quota exceeded. Please try again later.");
      }

      throw error(searchResponse.status, "YouTube search failed");
    }

    const searchData = await searchResponse.json();

    // Step 2: Get video details (duration, etc.) for the search results
    const videoIds = searchData.items
      ?.map((item: any) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) {
      return json({
        items: [],
        nextPageToken: searchData.nextPageToken,
        pageInfo: searchData.pageInfo,
      });
    }

    const detailsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
    detailsUrl.searchParams.set("part", "snippet,contentDetails,statistics");
    detailsUrl.searchParams.set("id", videoIds);
    detailsUrl.searchParams.set("key", YOUTUBE_API_KEY);

    const detailsResponse = await fetch(detailsUrl.toString());

    if (!detailsResponse.ok) {
      // Return search results without duration if details fail
      console.warn("Failed to fetch video details, returning partial data");
      return json({
        items: searchData.items.map((item: any) => ({
          id: { videoId: item.id?.videoId },
          snippet: item.snippet,
        })),
        nextPageToken: searchData.nextPageToken,
        pageInfo: searchData.pageInfo,
      });
    }

    const detailsData = await detailsResponse.json();

    // Create a map of video details by ID
    const detailsMap = new Map<string, any>();
    for (const item of detailsData.items || []) {
      detailsMap.set(item.id, item);
    }

    // Merge search results with video details
    const items = searchData.items?.map((searchItem: any) => {
      const videoId = searchItem.id?.videoId;
      const details = detailsMap.get(videoId);

      return {
        id: { videoId },
        snippet: details?.snippet || searchItem.snippet,
        contentDetails: details?.contentDetails,
        statistics: details?.statistics,
      };
    });

    return json({
      items,
      nextPageToken: searchData.nextPageToken,
      pageInfo: searchData.pageInfo,
    });
  } catch (err) {
    console.error("YouTube search error:", err);

    if ((err as any).status) {
      throw err;
    }

    throw error(500, "Failed to search YouTube");
  }
};
